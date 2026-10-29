// 章节加载必须限制并发，并按文件顺序返回。node tools/check-loading.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const start=html.indexOf('async function mapConcurrent(');
const end=html.indexOf('/* ---------- 长文弹窗',start);
assert.ok(start>=0&&end>start,'章节加载缺少并发限制');
const mapConcurrent=vm.runInNewContext(html.slice(start,end)+'\nmapConcurrent');
let active=0,max=0;
const items=Array.from({length:53},(_,index)=>index);
const result=await mapConcurrent(items,async item=>{
  active++;max=Math.max(max,active);
  await new Promise(resolve=>setTimeout(resolve,((53-item)%4)+1));
  active--;return 'chapter-'+item;
});
assert.ok(max<=6&&max>1,`峰值并发为 ${max}`);
assert.deepEqual(Array.from(result),items.map(item=>'chapter-'+item));
assert.equal((await mapConcurrent([],async item=>item)).length,0);
let started=0;
await assert.rejects(mapConcurrent(items,async item=>{started++;if(item===0)throw new Error('network');await new Promise(resolve=>setTimeout(resolve,1));return item;}),/network/);
await new Promise(resolve=>setTimeout(resolve,10));
assert.ok(started<=6,'失败后仍继续发起新章节请求');
console.log(`章节加载检查通过：53 个文件峰值并发 ${max}，顺序正确，失败后停止调度。`);
