// 三语 UI 词典、查询别名及界面标记完整性。零依赖：node tools/check-i18n.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(resolve(root, 'ui-i18n.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const storage = new Map();
const events = [];
const context = vm.createContext({
  URLSearchParams,
  location: {search:''},
  localStorage: {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  document: {documentElement:{lang:'',setAttribute(key,value){this[key]=value;}}},
  CustomEvent: class {constructor(type,options){this.type=type;this.detail=options?.detail;}},
  dispatchEvent:event=>events.push(event),
});
context.window=context;
vm.runInContext(source, context);
const ui=context.UI_I18N;
assert.deepEqual(Array.from(ui.SUPPORTED), ['zh-Hans','zh-Hant','en']);
const usedKeys=new Set([
  ...[...html.matchAll(/data-i18n(?:-aria|-placeholder|-title)?="([A-Za-z0-9_.-]+)"/g)].map(match=>match[1]),
  ...[...html.matchAll(/\bT\('([^']+)'/g)].map(match=>match[1]).filter(key=>!key.endsWith('.')),
  'loading.network','loading.error','nav.open','nav.close',
]);
for(const lang of ui.SUPPORTED){
  ui.setLanguage(lang);
  assert.equal(ui.lang,lang);
  assert.equal(context.document.documentElement.lang,lang);
  assert.equal(storage.get('ui-language'),lang);
  for(const key of usedKeys){
    const text=ui.t(key,{count:7,shown:5,total:10,value:'A',grade:'A',name:'test',done:3,section:23,entry:26,sec:23,n:26});
    assert.ok(typeof text==='string'&&text.trim()&&text!==key,`${lang}: 缺少 ${key}`);
  }
  for(let section=1;section<=53;section++){assert.notEqual(ui.t('section.'+section),'section.'+section,`${lang}: 缺少第 ${section} 节导航`);assert.ok(ui.sectionTitle(section));}
  for(const part of ['hp','gold','ban','coop','buff','quest'])assert.ok(ui.partTitle(part));
}
assert.equal(events.at(-1).type,'ui-language-change');
assert.equal(events.at(-1).detail.lang,'en');
for(const [query,expected] of [['design','设计'],['animation','动画'],['art','艺术'],['設計','设计'],['動畫','动画']]){
  assert.equal(ui.normalizeQuery(query).toLowerCase(),expected,`查询 ${query}`);
}
assert.match(html,/id="keyword-search"[^>]*role="search"/);
assert.match(html,/id="hero-q"[^>]*aria-describedby="keyword-help"/);
assert.equal((html.match(/id="hero-q"/g)||[]).length,1);
assert.equal((html.match(/src="ui-i18n.js"/g)||[]).length,1);
console.log(`三语 UI 检查通过：${usedKeys.size} 个已使用文案键、53 节导航、语言事件与查询别名均完整。`);
