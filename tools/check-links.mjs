#!/usr/bin/env node
// 来源链接体检：抽取 book/ 全部「- 来源：」「- 备注：」行里的 http(s) 链接，
// 并行实测，死链（404/410、重试后仍 5xx/000）列成清单。
//
// 用法：
//   node tools/check-links.mjs              # 全量体检，输出汇总与死链清单
//   node tools/check-links.mjs --sample 6   # 每 6 条抽 1 条（快速抽查）
//
// 判定口径（与 2026-10-01 首次体检一致）：
// - 200/2xx/3xx：健康；
// - 403：doi.org 与已知学术域名的 403 视为出版商反爬（浏览器可开），不算死链，
//   其他域名的 403 单独列出待人工判断；
// - 000/超时：先重试一次，仍失败列为「网络不可达」（大陆环境对外网间歇重置常见，
//   不直接判死）；
// - 404/410：死链；5xx：重试一次，仍失败列为疑似死链。
// 链接提取按仓库惯例优先取尖括号 <URL>；裸 URL 遇到未闭合的括号（DOI 常见）
// 会补全配对括号，避免上轮抽样里「DOI 被括号截断」的假阳性。

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isIP } from 'node:net';
import { request } from 'node:https';
import { request as requestHTTP } from 'node:http';

const bookDir = join(import.meta.dirname, '..', 'book');
const CONCURRENCY = 15;
const TIMEOUT_MS = 12000;

// 已知的反爬域名（403 = 拦自动抓取，不代表页面失效）
const BOT_BLOCK_HOSTS = new Set([
  'doi.org', 'www.sciencedirect.com', 'sciencedirect.com', 'bls.gov', 'data.bls.gov',
  'psycnet.apa.org', 'www.apa.org', 'apa.org',
  'www.researchgate.net', 'researchgate.net',
  'journals.sagepub.com', 'link.springer.com', 'www.springer.com',
  'www.nature.com', 'nature.com', 'www.thelancet.com', 'www.cell.com',
  'pubmed.ncbi.nlm.nih.gov', 'www.tandfonline.com', 'onlinelibrary.wiley.com',
  'academic.oup.com', 'www.bmj.com', 'bmj.com', 'jamanetwork.com',
  'www.journals.uchicago.edu', 'journals.uchicago.edu', 'www.cambridge.org',
  'cambridge.org', 'guilfordjournals.com', 'www.jstor.org', 'jstor.org',
  'www.emerald.com', 'ieeexplore.ieee.org', 'dl.acm.org',
]);

const args = process.argv.slice(2);
let sampleEvery = 0;
if (args[0] === '--sample') sampleEvery = Number(args[1]) || 6;

// —— 提取 ——

/** 裸 URL 截断修复：括号配对（DOI 形如 10.1016/S0140-6736(19)30418-0） */
function repairParens(url, tail) {
  const open = (url.match(/\(/g) || []).length;
  const close = (url.match(/\)/g) || []).length;
  if (open <= close) return url;
  let need = open - close, out = url;
  for (const ch of tail) {
    if (need === 0) break;
    if (ch === ')') { need--; out += ch; }
    else break;
  }
  return out;
}

function extractUrls(text) {
  const bracket = new Set();
  // 1) 尖括号形式（仓库主流写法）
  for (const m of text.matchAll(/<(https?:\/\/[^>\s]+)>/g)) bracket.add(m[1]);
  // 2) 裸 URL（兜底），并修复被括号截断的 DOI
  const bare = [];
  for (const m of text.matchAll(/https?:\/\/[^\s>）)、；。，"']+/g)) {
    const raw = m[0];
    const tail = text.slice(m.index + raw.length, m.index + raw.length + 4);
    bare.push(repairParens(raw, tail));
  }
  // 截断产物判定：某条裸 URL 是另一条（尖括号版或更长的裸版）的前缀时，
  // 它就是被行内标点截断的残段（Elsevier 的 10.1016/S0140-6736(17)XXXX 型
  // DOI 内部就含括号），丢弃。
  const all = [...bracket, ...bare];
  return [...new Set(all.filter(u => !all.some(v => v !== u && v.startsWith(u) && v.length > u.length)))];
}

// —— 请求（服务端约束：仅 http/https；拒绝环回/私有/保留地址） ——

function hostBlocked(url) {
  let u;
  try { u = new URL(url); } catch { return true; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return true;
  const h = u.hostname;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local')) return true;
  if (h === '::1' || h === '[::1]') return true;
  const ip = isIP(h);
  if (ip) {
    const parts = h.split('.').map(Number);
    if (ip === 4) {
      if (parts[0] === 127 || parts[0] === 10) return true;
      if (parts[0] === 192 && parts[1] === 168) return true;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      if (parts[0] === 169 && parts[1] === 254) return true;
      if (parts[0] === 0) return true;
    }
    if (ip === 6 && (h === '::' || h.toLowerCase().startsWith('fe80') || h.toLowerCase().startsWith('fc') || h.toLowerCase().startsWith('fd'))) return true;
  }
  return false;
}

/** 单链接探测：跟随跳转（≤5 次），返回最终状态码；host 违规返回 'BLOCKED'。
 *  orig 始终记最初的 URL，跳到哪都汇报它（否则 2026-10-01 出过把 DOI 跳转
 *  终点的 Sage 中国镜像当原链误报的事）。 */
function probe(url, depth = 0, orig) {
  const root = orig || url;
  return new Promise((resolve) => {
    if (hostBlocked(url)) return resolve({ code: 'BLOCKED', url: root });
    if (depth > 5) return resolve({ code: 'TOODEEP', url: root });
    let u;
    try { u = new URL(url); } catch { return resolve({ code: 'BADURL', url }); }
    const mod = u.protocol === 'https:' ? request : requestHTTP;
    const req = mod(u, {
      method: 'GET',
      timeout: TIMEOUT_MS,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
        'accept': 'text/html,application/pdf,*/*',
      },
    }, (res) => {
      res.resume(); // 不下载正文，只要状态码
      const code = res.statusCode;
      const loc = res.headers.location;
      if (code >= 300 && code < 400 && loc) {
        const next = new URL(loc, u).href;
        res.resume();
        return probe(next, depth + 1, root).then(resolve);
      }
      resolve({ code: String(code), url: root, finalUrl: u.href });
    });
    req.on('timeout', () => { req.destroy(); resolve({ code: '000', url }); });
    req.on('error', () => resolve({ code: '000', url }));
    req.end();
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// —— 主流程 ——

const files = (await readdir(bookDir)).filter(f => f.endsWith('.md')).sort();
const byFile = [];
for (const f of files) {
  const text = await readFile(join(bookDir, f), 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (!/^- (来源|备注)：/.test(line)) return;
    for (const url of extractUrls(line)) byFile.push({ file: f.replace(/\.md$/, ''), line: i + 1, url });
  });
}
const all = [...new Set(byFile.map(x => x.url))];
const targets = sampleEvery ? all.filter((_, i) => i % sampleEvery === 0) : all;

console.log(`链接体检：book/ 共 ${all.length} 个去重链接${sampleEvery ? `，抽样 ${targets.length} 条（每 ${sampleEvery} 取 1）` : '，全量检测'}`);

const results = [];
let done = 0;
const queue = [...targets];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    let r = await probe(url);
    if (r.code === '000' || String(r.code).startsWith('5')) { await sleep(4000); r = await probe(url); }
    results.push(r); done++;
    if (done % 100 === 0) console.error(`  …${done}/${targets.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const ok = results.filter(r => /^[23]/.test(r.code));
// 403 判反爬：起点（如 doi.org）或跳转终点任一命中名单即算——否则 DOI 跳到
// 未列名的出版商（ahajournals/pnas/wiley…）被 403 时会误报「需人工判断」。
const bot403 = (r) => {
  for (const u of [r.url, r.finalUrl]) {
    if (!u) continue;
    try { if (BOT_BLOCK_HOSTS.has(new URL(u).hostname)) return true; } catch {}
  }
  return false;
};
const blocked = results.filter(r => r.code === '403' && bot403(r));
const other403 = results.filter(r => r.code === '403' && !blocked.includes(r));
const dead = results.filter(r => ['404', '410', '451'].includes(r.code));
const suspect = results.filter(r => /^5/.test(r.code));
const unreachable = results.filter(r => r.code === '000');
const badUrl = results.filter(r => ['BLOCKED', 'BADURL', 'TOODEEP'].includes(r.code));

console.log(`健康 ${ok.length} ｜ 反爬403(不算死) ${blocked.length} ｜ 其他403 ${other403.length} ｜ 死链 ${dead.length} ｜ 疑似(5xx) ${suspect.length} ｜ 网络不可达 ${unreachable.length} ｜ 非法/坏URL ${badUrl.length}`);

const show = (title, list) => {
  if (!list.length) return;
  console.log(`\n${title}:`);
  for (const r of list) {
    const where = byFile.find(x => x.url === r.url);
    console.log(`  [${r.code}] ${r.url}${where ? ` （${where.file}:${where.line}）` : ''}`);
  }
};
show('死链（404/410/451）', dead);
show('疑似死链（5xx 重试后仍在）', suspect);
show('其他 403（非已知反爬域名，需人工判断）', other403);
show('网络不可达（000，两次均失败，多为对外网重置，不判死）', unreachable);
show('跳转过多（TOODEEP，需人工判断，常见于登录/地区跳转链）', badUrl);
