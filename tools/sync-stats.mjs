// 统计对齐脚本（node 跨平台版）：重算全书统计数字，回写 README.md、index.html、tools/og.html。
// 数字口径与 tools/sync-stats.ps1 完全一致（Windows 上跑那个，macOS/Linux 上跑这个）：
//   条目数 = book/*.md 里的 ### 标题数；A/B/C = 证据等级行的首字母；
//   争议 = 备注以「争议」开头的条数；TODO = 正文里含「待核实」或「TODO」的行数；
//   链接 = 「- 来源：」和「- 备注：」行里的 http(s) 总数；性价比三档的规则抄自 index.html。
// 截图（og.png）不在本脚本里，按 tools/og.html 文件头注释单独出。
//
//   node tools/sync-stats.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => writeFileSync(join(ROOT, p), s);

// 档位规则和 index.html 的 COST_W、e.ratio 两行绑定，先比对一次
const COST_W_LINE = "const COST_W = { money:{'0':0,'少':1,'多':2}, time:{'少':0,'中':1,'多':2}, will:{'否':0,'些':1,'是':2} };";
const RATIO_LINE = "e.ratio = e.level === '大' ? (e.cs === 0 ? '极高' : (e.cs <= 2 ? '高' : '一般'))";
const indexText = read('index.html');
if (!indexText.includes(COST_W_LINE)) throw new Error('index.html 的 COST_W 行变了，请同步本脚本里的成本权重');
if (!indexText.includes(RATIO_LINE)) throw new Error('index.html 的 e.ratio 行变了，请同步本脚本里的档位规则');

const W = {
  money: { '0': 0, '少': 1, '多': 2 },
  time: { '少': 0, '中': 1, '多': 2 },
  will: { '否': 0, '些': 1, '是': 2 },
};
const ratioOf = (cost, level) =>
  level === '大' ? (cost === 0 ? '极高' : cost <= 2 ? '高' : '一般')
  : level === '中' && cost === 0 ? '高' : '一般';

const files = readdirSync(join(ROOT, 'book')).filter(f => /^[\d\u4e00-\u9fff][^/]*\.md$/.test(f) && /^\d\d-/.test(f)).sort();
let entries = 0, dispute = 0, todo = 0, links = 0;
const grade = { A: 0, B: 0, C: 0 };
const ratio = { '极高': 0, '高': 0, '一般': 0 };
for (const f of files) {
  for (const line of readFileSync(join(ROOT, 'book', f), 'utf8').split(/\r?\n/)) {
    if (/^### /.test(line)) entries++;
    const g = line.match(/^- 证据等级：([ABC])/); if (g) grade[g[1]]++;
    if (/^- 备注：争议/.test(line)) dispute++;
    if (/待核实|TODO/.test(line)) todo++;
    if (/^- (来源|备注)：/.test(line)) links += (line.match(/https?:\/\//g) || []).length;
    const t = line.match(/<!--\s*成本标签:\s*钱=(\S+)\s+时间=(\S+)\s+毅力=(\S+)\s+收益=(\S+)\s+口径=/);
    if (t) ratio[ratioOf(W.money[t[1]] + W.time[t[2]] + W.will[t[3]], t[4])]++;
  }
}

const tagged = ratio['极高'] + ratio['高'] + ratio['一般'];
if (tagged !== entries) console.warn(`警告：有 ${entries - tagged} 条缺成本标签，性价比三档对不上条目数`);
if (grade.A + grade.B + grade.C !== entries) console.warn('警告：证据等级行数和条目数对不上');

// 三档百分比用最大余数法，保证加起来正好 100
const order = ['极高', '高', '一般'];
const pct = {}, rem = {};
for (const k of order) { const ex = ratio[k] * 100 / entries; pct[k] = Math.floor(ex); rem[k] = ex - pct[k]; }
let short = 100 - order.reduce((s, k) => s + pct[k], 0);
for (const k of [...order].sort((a, b) => rem[b] - rem[a]).slice(0, Math.max(short, 0))) pct[k]++;

console.log(`条目 ${entries} ｜ A ${grade.A} B ${grade.B} C ${grade.C} ｜ 争议 ${dispute} ｜ TODO ${todo} ｜ 链接 ${links}`);
console.log(`性价比 极高 ${ratio['极高']}（${pct['极高']}%） 高 ${ratio['高']}（${pct['高']}%） 一般 ${ratio['一般']}（${pct['一般']}%）`);

const sections = files.length;
const edits = [
  ['README.md', '首屏条目数', /(\d+) 条建议/, `${entries} 条建议`],
  ['README.md', '条目徽章', /%E6%9D%A1%E7%9B%AE-(\d+)%20%E6%9D%A1/, `%E6%9D%A1%E7%9B%AE-${entries}%20%E6%9D%A1`],
  ['README.md', '证据分级徽章', /A%20(\d+)%20%C2%B7%20B%20\d+%20%C2%B7%20C%20\d+/, `A%20${grade.A}%20%C2%B7%20B%20${grade.B}%20%C2%B7%20C%20${grade.C}`],
  ['README.md', '文献链接徽章', /-(\d+)%20%E6%9D%A1%E9%93%BE%E6%8E%A5/, `-${links}%20%E6%9D%A1%E9%93%BE%E6%8E%A5`],
  ['README.md', '怎么读里的 A 级数', /大型试验的 (\d+) 条/, `大型试验的 ${grade.A} 条`],
  ['README.md', '怎么读里的极高条数', /勾选性价比「极高」，得到 (\d+) 条/, `勾选性价比「极高」，得到 ${ratio['极高']} 条`],
  ['README.md', '证据分级段', /全书 (\d+) 条中 A 级 \d+ 条、B 级 \d+ 条、C 级 \d+ 条，另有 \d+ 条标注了争议、\d+ 处/, `全书 ${entries} 条中 A 级 ${grade.A} 条、B 级 ${grade.B} 条、C 级 ${grade.C} 条，另有 ${dispute} 条标注了争议、${todo} 处`],
  ['README.md', '性价比段', /全书 (\d+) 条中性价比极高 \d+ 条（\d+%）、高 \d+ 条（\d+%）、一般 \d+ 条（\d+%）/, `全书 ${entries} 条中性价比极高 ${ratio['极高']} 条（${pct['极高']}%）、高 ${ratio['高']} 条（${pct['高']}%）、一般 ${ratio['一般']} 条（${pct['一般']}%）`],
  ['index.html', '五处描述', /(\d+) 条建议/g, `${entries} 条建议`],
  ['index.html', 'numberOfPages', /numberOfPages":(\d+)/, `numberOfPages":${entries}`],
  ['index.html', '页头条目数', /\d+ 节 (\d+) 条/, `${sections} 节 ${entries} 条`],
  ['tools/og.html', 'og 条目数', /<b>(\d+)<\/b> 条建议/, `<b>${entries}</b> 条建议`],
  ['tools/og.html', 'og A 级数', /A 级证据 <b>(\d+)<\/b> 条/, `A 级证据 <b>${grade.A}</b> 条`],
  ['tools/og.html', 'og 链接数', /<b>(\d+)<\/b> 条原始文献链接/, `<b>${links}</b> 条原始文献链接`],
];

for (const [file, label, pattern, replacement] of edits) {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const text = read(file);
  const found = [...text.matchAll(re)];
  if (found.length === 0) throw new Error(`${file} 里找不到「${label}」，模式：${re.source}`);
  const oldVal = found[0][1];
  const updated = text.replace(re, replacement);
  if (updated === text) { console.log(`  ${file} ${label}：${oldVal}（未变）`); continue; }
  write(file, updated);
  console.log(`  ${file} ${label}：${oldVal} -> 已更新（${found.length} 处）`);
}
