// Reproducible, invented fixtures. These do not identify real tokens or people.
export const tokens = [
  {id:'orbit',symbol:'ORBIT',name:'Orbit cat',price:.00842,change:18.42,liquidity:284000,volume:1420000,cap:8420000,age:'2h 14m',risk:'Elevated',signal:'HIGH INTEREST',color:'#98bdd1',social:142},
  {id:'moss',symbol:'MOSS',name:'Little moss',price:.00218,change:7.86,liquidity:192000,volume:640000,cap:2180000,age:'8h 32m',risk:'Elevated',signal:'DEVELOPING',color:'#9eb89e',social:86},
  {id:'pebble',symbol:'PBL',name:'Pebble',price:.00067,change:-4.23,liquidity:83000,volume:382000,cap:670000,age:'1d 3h',risk:'High',signal:'HIGH RISK',color:'#bcb09a',social:54},
  {id:'echo',symbol:'ECHO',name:'Echo protocol',price:.0147,change:32.15,liquidity:421000,volume:3210000,cap:14700000,age:'3d 8h',risk:'Elevated',signal:'MOVE ALREADY OCCURRED',color:'#a7aabd',social:217},
  {id:'drift',symbol:'DRFT',name:'Night drift',price:.00092,change:3.12,liquidity:54000,volume:124000,cap:920000,age:'42m',risk:'High',signal:'EARLY SIGNAL',color:'#a3bfc0',social:38},
  {id:'pixel',symbol:'PXL',name:'Pixel dog',price:.00341,change:-12.64,liquidity:22000,volume:880000,cap:3410000,age:'5h 7m',risk:'Critical',signal:'POSSIBLE MANIPULATION',color:'#bf9e98',social:303}
];
export const sources = ['X / Twitter','Reddit','YouTube','Telegram','Discord','RSS / News'];
export const posts = [
 {id:1,account:'Chain observer',source:'X / Twitter',token:'orbit',text:'New ORBIT pool showing unusual discussion. Liquidity and wallet distribution still need independent verification.',time:'2m',priority:'High'},
 {id:2,account:'Solana research',source:'Reddit',token:'moss',text:'MOSS community activity is growing gradually. Is the volume organic? Research thread and liquidity discussion.',time:'8m',priority:'Normal'},
 {id:3,account:'Market notebook',source:'Telegram',token:'echo',text:'ECHO has already moved substantially. A late social mention is not evidence of a new entry opportunity.',time:'12m',priority:'High'},
 {id:4,account:'Pool monitor',source:'Discord',token:'pixel',text:'PXL: concentrated ownership and repeated small swaps in this fictional example. Possible coordinated activity.',time:'18m',priority:'High'}
];
export const defaults = {
 theme:'Charcoal',accent:'#a7c7de',profit:'#8cbfa1',loss:'#ce9090',acrylic:true,transparency:16,blur:22,radius:14,shadow:24,fontSize:13,density:'Compact',motion:150,reduceMotion:false,
 aiProvider:'Scripted demo',model:'Small quantised model (planned)',ollama:'http://localhost:11434',aiTimeout:5,threshold:65,aiConcurrency:1,
 frequency:30,sourcePriority:'Balanced',notifications:true,sound:false,volume:30,monitor:'Primary',position:'Bottom right',persistent:true,quiet:false,quietStart:'22:00',quietEnd:'08:00',category:'All research signals',minLiquidity:50000,
 currency:'GBP',refresh:10,history:'30 days',initialBalance:100,slippage:1,fee:0.5,networkFee:0.02,maxPosition:25,maxLoss:20,failedTransactions:false,
 acceleration:true,background:false,memory:256,cache:64,retention:30,logging:'Warnings',chartStyle:'Candles',simulation:false,
 keywords:['Solana','Memecoin','Liquidity','Token launch'],accounts:[{name:'Chain observer',source:'X / Twitter',priority:'High',alerts:true,keywords:'Solana, liquidity'}],wallets:[]
};
export function series(id, count=64, step=0) {
 const seed=[...id].reduce((v,c)=>v+c.charCodeAt(0),0);
 let last=100;
 return Array.from({length:count},(_,i)=>{
  const open=last,close=100+Math.sin((i+step+seed)/6)*4+Math.cos((i+step)/2.4)*1.7+i*.18;
  last=close; return {open,close,high:Math.max(open,close)+1.2,low:Math.min(open,close)-.9,volume:20+(i*17+seed)%70};
 });
}
export function initialState() {return {version:1,settings:structuredClone(defaults),watchlist:['orbit','moss'],alerts:[{id:'a1',token:'orbit',status:'Pending',created:Date.now(),base:tokens[0].price,reason:'Fixture: social mentions increased; invented liquidity exceeds the research filter.'},{id:'a2',token:'echo',status:'Expired',created:Date.now()-1800000,base:tokens[3].price/1.8,reason:'Fixture: price moved 80% after detection; original signal expired.'}],trades:[],cash:100,chats:[{id:'welcome',title:'Research notebook',messages:[]}],activeChat:'welcome',step:0,pausedAt:null};}
export function quote(token,step=0) {return token.price*(1+Math.sin(step*.37+tokens.indexOf(token))*.002*step/(step+1));}
export function holdings(state) {
 const result={};
 for(const t of state.trades){const p=result[t.token]??={quantity:0,cost:0,realised:0};if(t.side==='buy'){p.quantity+=t.quantity;p.cost+=t.total;}else{const cost=p.quantity? p.cost*t.quantity/p.quantity:0;p.quantity-=t.quantity;p.cost-=cost;p.realised+=t.total-cost;}}
 return result;
}
export function portfolio(state) {
 const positions=holdings(state); let value=state.cash,unrealised=0,realised=0;
 for(const [id,p] of Object.entries(positions)){const market=p.quantity*quote(tokens.find(t=>t.id===id),state.step);value+=market;unrealised+=market-p.cost;realised+=p.realised;}
 return {positions,value,unrealised,realised,fees:state.trades.reduce((a,t)=>a+t.fees,0)};
}
export function statistics(state,since=0){
 const positions={},outcomes=[];
 for(const t of state.trades){const p=positions[t.token]??={quantity:0,cost:0};if(t.side==='buy'){p.quantity+=t.quantity;p.cost+=t.total;}else{const cost=p.quantity?p.cost*t.quantity/p.quantity:0;p.quantity-=t.quantity;p.cost-=cost;if(t.time>=since)outcomes.push(t.total-cost);}}
 const gains=outcomes.filter(v=>v>1e-8),losses=outcomes.filter(v=>v< -1e-8);
 return {count:outcomes.length,winRate:outcomes.length?gains.length/outcomes.length*100:null,averageGain:gains.length?gains.reduce((a,b)=>a+b,0)/gains.length:0,averageLoss:losses.length?losses.reduce((a,b)=>a+b,0)/losses.length:0,largestGain:Math.max(0,...gains),largestLoss:Math.min(0,...losses),totalLoss:losses.reduce((a,b)=>a+b,0),realised:outcomes.reduce((a,b)=>a+b,0)};
}
export function trade(state,{token,side,amount}) {
 if(state.trades.length>=10000)throw Error('Practice ledger limit reached. Export a backup before resetting.');
 const t=tokens.find(t=>t.id===token),s=state.settings;
 if(!t||!['buy','sell'].includes(side)||!Number.isFinite(amount)||amount<=0) throw Error('Enter a positive amount.');
 const held=holdings(state)[token]??{quantity:0,cost:0};
 const price=quote(t,state.step)*(1+(side==='buy'?1:-1)*s.slippage/100);
 let quantity,fees,total;
 if(side==='buy'){
  fees=amount*s.fee/100+s.networkFee;total=amount+fees;quantity=amount/price;
  if(total>state.cash+1e-9) throw Error('Insufficient practice balance including fees.');
  if(amount+held.quantity*price>s.initialBalance*s.maxPosition/100+1e-9) throw Error('Practice position exceeds your configured allocation limit.');
  if(portfolio(state).value<s.initialBalance*(1-s.maxLoss/100)) throw Error('Practice loss limit reached.');
 }else{
  quantity=amount;if(quantity>held.quantity+1e-9) throw Error('Quantity exceeds the practice holding.');
  fees=quantity*price*s.fee/100+s.networkFee;total=quantity*price-fees;
  if(total<=0) throw Error('Estimated fees exceed sale proceeds.');
 }
 if((side==='buy'?amount:quantity*price)>t.liquidity*.01) throw Error('Practice order exceeds 1% of fixture liquidity.');
 if(s.failedTransactions && state.trades.length%4===3) throw Error('Simulated network failure. No balance change or fee charged in this UI prototype.');
 const next=structuredClone(state);next.cash+=(side==='buy'?-total:total);next.trades.push({id:crypto.randomUUID(),token,side,quantity,price,fees,total,time:Date.now()});return next;
}
export function reviewAlert(alert,price) {const move=(price/alert.base-1)*100;return {move,expired:alert.status==='Expired'||Math.abs(move)>=50};}
export function demoReply(question,state) {
 const p=portfolio(state),q=question.toLowerCase();
 if(/portfolio|perform|balance/.test(q))return `SCRIPTED DEMO · Your practice portfolio is ${p.value.toFixed(2)} ${state.settings.currency}, with ${state.trades.length} simulated trades and ${p.fees.toFixed(2)} in modelled costs. This uses invented prices, not verified market data.`;
 if(/offline|overnight|missed/.test(q))return 'SCRIPTED DEMO · No background collection is connected. The overnight report contains invented research scenarios only. No real announcements or missed opportunities have been measured.';
 if(/risk|wallet|suspicious/.test(q))return 'SCRIPTED DEMO · Check liquidity depth, mint and freeze authority, concentrated ownership, deployer transfers and data freshness. In this prototype these are research prompts, not measured chain findings. Missing evidence prevents a reliable risk conclusion.';
 return 'SCRIPTED DEMO · ORBIT illustrates rising discussion alongside a simulated +18.42% move. The fixture cannot establish organic demand or predict a return. Compare publication and price timestamps, verify the contract, and review liquidity before forming a view. No model or live source was queried.';
}
