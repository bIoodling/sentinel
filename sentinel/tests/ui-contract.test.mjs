// Lightweight rendering contract checks; no browser or desktop automation.
// These catch template/runtime regressions, but do not replace visual or accessibility QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const root=new URL('../',import.meta.url);
const parts=await Promise.all(['model.js','store.js','app.js'].map(n=>readFile(new URL('src/'+n,root),'utf8')));
const code=parts.map(s=>s.replace(/^import .*?;\r?\n/gm,'').replace(/^export /gm,'')).join('\n');
function sandbox(hash=''){
 const handlers={},elements=new Map();
 for(const name of ['#app','#popup-root','#announcer','#messages'])elements.set(name,{innerHTML:'',textContent:'',scrollTo(){},addEventListener(n,fn){handlers[n]=fn;}});
 const storage=new Map();
 const context=vm.createContext({console,structuredClone,Intl,Date,Math,JSON,Number,String,Array,Object,Set,Map,Error,crypto:webcrypto,location:{hash},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{hidden:false,activeElement:null,documentElement:{style:{setProperty(){}}},body:{classList:{toggle(){}}},querySelector:q=>elements.get(q)||null,addEventListener(){}},window:{addEventListener(){}},setInterval(){},setTimeout(){},URL,Blob});
 vm.runInContext(code,context);return {context,elements,handlers};
}
test('all eight routes render without DOM/template exceptions',()=>{
 const {context,elements}=sandbox();
 for(const name of ['Dashboard','Discovery','Portfolio','Social intelligence','AI assistant','Notifications','Data health','Settings']){
  vm.runInContext(`navigate(${JSON.stringify(name)})`,context);
  const html=elements.get('#app').innerHTML;
  assert.match(html,/<main/);assert.match(html,/SIMULATION/);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));
 }
});
test('every settings category renders and exposes named controls',()=>{
 const {context,elements}=sandbox();
 for(const tab of ['Appearance','AI','Social monitoring','Notifications','Portfolio','Performance','Data & privacy']){
  vm.runInContext(`route='Settings';settingsTab=${JSON.stringify(tab)};render()`,context);
  assert.match(elements.get('#app').innerHTML,/Saved automatically/);
 }
});
test('encoded routes survive reload and untrusted text is escaped',()=>{
 const {context,elements}=sandbox('#Social%20intelligence');
 assert.match(elements.get('#app').innerHTML,/Fictional|fictional/);
 assert.equal(vm.runInContext(`esc('<img src=x onerror=alert(1)>')`,context),'&lt;img src=x onerror=alert(1)&gt;');
});
test('portable bundle has no module imports or external runtime assets',async()=>{
 const html=await readFile(new URL('dist/SENTINEL-preview.html',root),'utf8');
 assert.ok(!/<script[^>]+src=|<link[^>]+stylesheet/.test(html));
 assert.ok(!/^import .*?;/m.test(html));
 assert.ok(!/\bfetch\s*\(|new WebSocket\s*\(/.test(html));
 const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
 assert.doesNotThrow(()=>new vm.Script(script));
});
