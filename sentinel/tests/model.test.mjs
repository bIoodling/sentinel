import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,trade,holdings,portfolio,statistics,tokens,quote,series,reviewAlert,demoReply} from '../src/model.js';
import {load,save,validateState} from '../src/store.js';

test('buy and partial sale preserve quantity and cash accounting including all fees',()=>{
 const original=initialState();const bought=trade(original,{token:'orbit',side:'buy',amount:10});
 assert.equal(original.trades.length,0);assert.equal(original.cash,100);
 const buy=bought.trades[0];assert.ok(Math.abs(bought.cash+buy.total-100)<1e-10);
 const sold=trade(bought,{token:'orbit',side:'sell',amount:buy.quantity/2});
 const sell=sold.trades[1],held=holdings(sold).orbit;
 assert.ok(Math.abs(held.quantity-buy.quantity/2)<1e-10);
 assert.ok(Math.abs(held.cost-buy.total/2)<1e-10);
 assert.ok(Math.abs(held.realised-(sell.total-buy.total/2))<1e-10);
 assert.ok(Math.abs(sold.cash-(100-buy.total+sell.total))<1e-10);
 const p=portfolio(sold);assert.ok(Math.abs(p.value-sold.cash-held.quantity*quote(tokens[0]))<1e-10);
 assert.equal(validateState(sold).trades.length,2);
});
test('oversells, negative/NaN spend, insufficient funds and allocation breaches cannot mutate state',()=>{
 const s=initialState(),before=JSON.stringify(s);
 for(const order of [{side:'sell',amount:1},{side:'buy',amount:-1},{side:'buy',amount:NaN},{side:'buy',amount:101},{side:'buy',amount:26}])assert.throws(()=>trade(s,{token:'orbit',...order}));
 assert.equal(JSON.stringify(s),before);
});
test('slippage and costs create a loss on an immediate full round trip',()=>{
 const bought=trade(initialState(),{token:'moss',side:'buy',amount:10});
 const sold=trade(bought,{token:'moss',side:'sell',amount:bought.trades[0].quantity});
 assert.ok(sold.cash<100);assert.ok(Math.abs(portfolio(sold).value-sold.cash)<1e-8);
 const stats=statistics(sold);assert.equal(stats.winRate,0);assert.ok(stats.averageLoss<0);assert.equal(stats.count,1);
 assert.equal(statistics(sold,Date.now()+10000).count,0);
});
test('liquidity and simulated failure guards reject before debit',()=>{
 let s=initialState();s.settings.maxPosition=100;s.settings.initialBalance=100000;s.cash=100000;
 assert.throws(()=>trade(s,{token:'pixel',side:'buy',amount:300}),/liquidity/);
 s=initialState();for(let i=0;i<3;i++)s=trade(s,{token:'orbit',side:'buy',amount:1});
 s.settings.failedTransactions=true;const before=JSON.stringify(s);
 assert.throws(()=>trade(s,{token:'orbit',side:'buy',amount:1}),/network failure/);assert.equal(JSON.stringify(s),before);
});
test('alerts expire after a large move in either direction',()=>{
 const a={base:1,status:'Pending'};assert.equal(reviewAlert(a,1.8).expired,true);assert.equal(reviewAlert(a,.4).expired,true);assert.equal(reviewAlert(a,1.1).expired,false);
});
test('fixtures are reproducible and always have valid candle bounds',()=>{
 assert.deepEqual(series('orbit'),series('orbit'));assert.notDeepEqual(series('orbit'),series('orbit',64,1));
 for(const c of series('orbit')){assert.ok(c.high>=Math.max(c.open,c.close));assert.ok(c.low<=Math.min(c.open,c.close));}
});
test('backup round trip and storage failure are explicit',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 const s=initialState();s.settings.accent='#aabbcc';s.settings.wallets=['WatchOnlyExample'];
 assert.equal(save(storage,s),null);assert.deepEqual(load(storage).state,s);
 assert.match(save({setItem(){throw Error('quota');}},s),/unavailable or full/);
 assert.match(load({getItem(){return '{broken';}}).error,/could not be read/);
});
test('backup rejects fake ledger balances and excess sales, repairs unsafe preferences',()=>{
 const s=initialState();s.cash=999;assert.throws(()=>validateState(s),/reconcile/);
 const b=trade(initialState(),{token:'orbit',side:'buy',amount:2});b.trades[0].quantity*=2;assert.throws(()=>validateState(b),/reconcile/);
 const v=initialState();v.settings.currency='BROKEN';v.settings.accent='red;display:none';v.settings.quietStart='oops';v.settings.fontSize=900;
 const repaired=validateState(v);assert.equal(repaired.settings.currency,'GBP');assert.equal(repaired.settings.accent,'#a7c7de');assert.equal(repaired.settings.fontSize,18);assert.equal(repaired.settings.quietStart,'22:00');
});
test('assistant distinguishes scripted fixture interpretation from market facts',()=>{
 const s=initialState();for(const q of ['risk','portfolio','offline','trending'])assert.match(demoReply(q,s),/^SCRIPTED DEMO/);
});
