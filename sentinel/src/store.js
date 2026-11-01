import {initialState,defaults,tokens} from './model.js';
const KEY='sentinel.prototype.v1';
const validToken=id=>tokens.some(t=>t.id===id);
export function validateState(value){
 if(!value||value.version!==1||!value.settings||!Array.isArray(value.trades)||value.trades.length>10000||!Number.isFinite(value.cash)||value.cash<0)throw Error('Unsupported or damaged backup.');
 const next=initialState();next.settings={...defaults};
 for(const [key,fallback] of Object.entries(defaults)){
  const v=value.settings[key];
  if(typeof fallback==='number'&&Number.isFinite(v))next.settings[key]=Math.max(0,Math.min(v,1000000));
  else if(typeof fallback==='boolean'&&typeof v==='boolean')next.settings[key]=v;
  else if(typeof fallback==='string'&&typeof v==='string'&&v.length<=300)next.settings[key]=v;
 }
 for(const k of ['accent','profit','loss'])if(!/^#[0-9a-f]{6}$/i.test(next.settings[k]))next.settings[k]=defaults[k];
 const options={theme:['Charcoal','Graphite','Light'],currency:['GBP','USD','EUR'],density:['Compact','Comfortable'],chartStyle:['Candles','Line'],aiProvider:['Scripted demo','Ollama (not connected)','OpenAI (not connected)'],sourcePriority:['Balanced','Watchlisted accounts','News first'],monitor:['Primary','Secondary (preview only)'],position:['Bottom right','Bottom left','Top right','Top left'],category:['All research signals','High interest only','Risk only'],history:['Today','7 days','30 days','90 days','All time'],logging:['Errors','Warnings','Verbose']};
 for(const [k,values] of Object.entries(options))if(!values.includes(next.settings[k]))next.settings[k]=defaults[k];
 const bounds={transparency:[0,40],blur:[0,40],radius:[0,28],shadow:[0,60],fontSize:[11,18],motion:[120,180],aiTimeout:[1,30],threshold:[0,100],aiConcurrency:[1,4],frequency:[10,120],volume:[0,100],refresh:[3,60],slippage:[0,10],fee:[0,5],maxPosition:[1,100],maxLoss:[1,100],memory:[128,1024],cache:[16,256],retention:[7,180]};
 for(const [k,[min,max]] of Object.entries(bounds))next.settings[k]=Math.min(max,Math.max(min,next.settings[k]));
 for(const k of ['quietStart','quietEnd'])if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(next.settings[k]))next.settings[k]=defaults[k];
 for(const k of ['keywords','wallets'])next.settings[k]=Array.isArray(value.settings[k])?value.settings[k].filter(x=>typeof x==='string'&&x.length<200).slice(0,200):defaults[k];
 next.settings.accounts=Array.isArray(value.settings.accounts)?value.settings.accounts.filter(a=>a&&typeof a.name==='string'&&a.name.length<100&&typeof a.source==='string'&&typeof a.priority==='string'&&typeof a.keywords==='string').slice(0,100):defaults.accounts;
 next.cash=value.cash;
 next.trades=value.trades.filter(t=>validToken(t.token)&&['buy','sell'].includes(t.side)&&['quantity','price','fees','total','time'].every(k=>Number.isFinite(t[k])&&t[k]>=0)&&typeof t.id==='string');
 if(next.trades.length!==value.trades.length)throw Error('Backup contains invalid trades.');
 const balances={};let expectedCash=next.settings.initialBalance;
 for(const t of next.trades){if(t.quantity<=0||t.price<=0)throw Error('Backup contains an invalid fill.');const held=balances[t.token]||0;if(t.side==='sell'&&t.quantity>held+1e-8)throw Error('Backup sells more than its holding.');balances[t.token]=held+(t.side==='buy'?t.quantity:-t.quantity);expectedCash+=t.side==='buy'?-t.total:t.total;const total=t.quantity*t.price+(t.side==='buy'?t.fees:-t.fees);if(Math.abs(total-t.total)>1e-6)throw Error('Backup trade totals do not reconcile.');}
 if(Math.abs(expectedCash-next.cash)>1e-6)throw Error('Backup balance does not reconcile with the ledger.');
 next.watchlist=Array.isArray(value.watchlist)?[...new Set(value.watchlist.filter(validToken))]:[];
 next.alerts=Array.isArray(value.alerts)?value.alerts.filter(a=>a&&validToken(a.token)&&['Pending','Acknowledged','Dismissed','Expired'].includes(a.status)&&typeof a.id==='string'&&Number.isFinite(a.base)&&a.base>0&&Number.isFinite(a.created)&&typeof a.reason==='string').slice(0,500):[];
 next.chats=Array.isArray(value.chats)?value.chats.filter(c=>c&&typeof c.id==='string'&&typeof c.title==='string'&&Array.isArray(c.messages)).slice(0,50).map(c=>({...c,messages:c.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-200)})):next.chats;
 if(!next.chats.length)next.chats=initialState().chats;
 next.activeChat=next.chats.some(c=>c.id===value.activeChat)?value.activeChat:next.chats[0].id;
 next.step=Number.isInteger(value.step)?Math.max(0,Math.min(value.step,100000)):0;
 return next;
}
export function load(storage){try{const raw=storage.getItem(KEY);return raw?{state:validateState(JSON.parse(raw)),error:null}:{state:initialState(),error:null};}catch{return {state:initialState(),error:'Saved preferences could not be read. Use Export backup to protect this session.'};}}
export function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return null;}catch{return 'Browser storage is unavailable or full. Export a backup before closing.';}}
