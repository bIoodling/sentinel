import test from 'node:test';
import assert from 'node:assert/strict';
import {candles,tokens,quote,recommendedKeywords,upgrade,initialState} from '../src/domain.ts';
test('synthetic candles have consistent timestamps, short valid wicks and match displayed quotes',()=>{
 for(const token of tokens)for(const step of [0,1,25,100]){
  const data=candles(token,step,300);
  assert.equal(data.length,100);
  assert.equal(data.at(-1).close,quote(token,step));
  for(let i=0;i<data.length;i++){
   const c=data[i];assert.ok(c.low>0);assert.ok(c.low<=Math.min(c.open,c.close));assert.ok(c.high>=Math.max(c.open,c.close));assert.ok((c.high-c.low)/c.open<.02);
   if(i){assert.equal(c.time-data[i-1].time,300);assert.ok(Math.abs(c.open-data[i-1].close)<1e-9);}
  }
 }
});
test('keyword migration adds more than fifty defaults and preserves custom monitoring lists',()=>{
 assert.ok(new Set(recommendedKeywords).size>=50);
 const untouched=initialState(),before=JSON.stringify(untouched);assert.ok(upgrade(untouched).settings.keywords.length>=50);assert.equal(JSON.stringify(untouched),before);
 const custom=initialState();custom.settings.keywords=['My own research'];assert.deepEqual(upgrade(custom).settings.keywords,['My own research']);
});
