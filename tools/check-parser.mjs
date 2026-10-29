// 网页正文完整性：元数据标题不能吞掉后来追加的编号条目。
// 用法：node tools/check-parser.mjs [待检查的 index.html 路径]
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(process.argv[2] || resolve(root, 'index.html')), 'utf8');
const start = html.indexOf('function parseReadme(');
const end = html.indexOf('/* ---------- 术语表', start);
assert.ok(start >= 0 && end > start, '找不到网页正文解析器');
const weights = html.match(/^const COST_W = .*;$/m)?.[0];
assert.ok(weights, '找不到网页成本权重');
const helperStart = html.indexOf('const URL_RE =');
const helperEnd = html.indexOf('function hrefOf(p){', helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, '找不到正文检索辅助函数');
const context = vm.createContext({});
vm.runInContext(`${weights}\n${html.slice(helperStart, helperEnd)}\n${html.slice(start, end)}`, context);
const parse = context.parseReadme;

const fixture = '# 1. 测试章节\n\n### 1. 第一条\n\n## 许可\n\n许可说明不能混入导读。\n\n### 2. 后来追加的条目\n\n# 2. 下一个章节\n\n### 1. 新章节条目\n';
const parsed = parse(fixture);
assert.equal(parsed[0].entries.length, 2, '元数据标题后追加的条目丢失');
assert.equal(parsed[1].entries.length, 1, '章节边界不正确');
assert.ok(!parsed[0].intro.some(line => line.includes('许可')), '许可说明混入章节导读');

let expectedTotal = 0, actualTotal = 0;
for (const file of readdirSync(resolve(root, 'book')).filter(file => /^\d\d-.*\.md$/.test(file)).sort()) {
  const md = readFileSync(resolve(root, 'book', file), 'utf8');
  const expected = [...md.matchAll(/^### (\d+)\. (.+)$/gm)].map(match => `${match[1]}. ${match[2].trim()}`);
  const actual = parse(md).flatMap(section => section.entries.map(entry => `${entry.n}. ${entry.title}`));
  assert.deepEqual(Array.from(actual), expected, `${file} 的条目与网页解析结果不一致`);
  expectedTotal += expected.length;
  actualTotal += actual.length;
}
console.log(`网页解析检查通过：${actualTotal}/${expectedTotal} 条，无漏项；元数据后的追加条目与章节边界均正确。`);

const matches = (text, term) => context.findTerm(context.searchText(text).toLowerCase(), term.toLowerCase()) !== -1;
for (const text of ['AI', 'ai', 'AI时代', '学习AI工具', 'AI-assisted', '**A**[I](https://example.com/)时代']) {
  assert.equal(matches(text, 'AI'), true, `${text} 应命中 AI`);
}
for (const text of ['training', 'claim', 'failure', 'GenAI', 'AI2026', '_AI', 'tr**ai**ning']) {
  assert.equal(matches(text, 'AI'), false, `${text} 不应命中 AI`);
}
assert.equal(matches('研究HR与OR', 'HR'), true);
assert.equal(matches('threshold', 'HR'), false);
assert.equal(matches('order', 'OR'), false);
assert.equal(matches('设计专业学生', '设计'), true);
assert.ok(['设计', 'ai'].every(term => matches('设计专业学生使用AI', term)));
assert.ok(!['设计', '动画'].every(term => matches('设计专业学生使用AI', term)));
console.log('检索边界检查通过：AI/HR/OR、中文、混合词、Markdown 文本和多关键词均正确。');
