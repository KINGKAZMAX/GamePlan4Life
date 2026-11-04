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

// 从额外手册或交叉引用跳转时，所有会挡住目标的筛选都必须撤下。
const navigationStart = html.indexOf('function gotoItem(');
const navigationEnd = html.indexOf("addEventListener('popstate'", navigationStart);
assert.ok(navigationStart >= 0 && navigationEnd > navigationStart, '找不到正文跳转函数');
const navigationState = {
  q: '不会匹配的词', sec: new Set(['1']), grade: new Set(['A']), dispute: true, todo: true,
};
const target = {id: 'e-23-30', offsetParent: null, focus(){ this.focused = true; }};
vm.runInNewContext(html.slice(navigationStart, navigationEnd) + '\ngotoItem("23-30", "extra-handbook");', {
  state: navigationState, DIMS: ['sec', 'grade'],
  document: {getElementById(id){ return id === target.id ? target : null; }},
  history: {replaceState(){}, pushState(){}}, window: {scrollY: 200},
  syncControls(){}, writeUrl(){}, scrollAnchor: element => element,
  apply(){
    if (!navigationState.q && !navigationState.sec.size && !navigationState.grade.size &&
        !navigationState.dispute && !navigationState.todo) target.offsetParent = {};
  },
  scrollToEl(element){ assert.ok(element.offsetParent, '开始跳转时正文仍被筛选隐藏'); },
});
assert.equal(navigationState.dispute, false);
assert.equal(navigationState.todo, false);
assert.equal(target.focused, true, '键盘焦点没有进入正文');
console.log('正文跳转检查通过：组合筛选解除后，目标可见并获得焦点。');

const handbookStart = html.indexOf("document.getElementById('extra-handbook').addEventListener('click'");
const handbookClose = '\n  });';
const handbookEnd = html.indexOf(handbookClose, handbookStart);
assert.ok(handbookStart >= 0 && handbookEnd > handbookStart, '找不到额外手册的正文入口');
const navigationCalls = [];
let handbookClick;
vm.runInNewContext(html.slice(handbookStart, handbookEnd + handbookClose.length), {
  document: {getElementById(){ return {addEventListener(type, handler){ handbookClick = handler; }}; }},
  location: {hash: '#extra-handbook'}, setMenu(){},
  flushPendingSearch(){ navigationCalls.push('flush'); },
  apply(){ navigationCalls.push('apply'); },
  gotoItem(key, from){
    assert.deepEqual(navigationCalls, ['flush', 'apply'], '正文导航前尚未处理待提交的搜索');
    assert.equal(key, '23-30');
    assert.equal(from, 'extra-handbook');
  },
});
handbookClick({target: {closest(){ return {dataset: {handbookGo: '23-30'}}; }}, preventDefault(){}});
console.log('快速导航检查通过：待提交搜索先处理，旧定时任务不会重新隐藏目标。');
