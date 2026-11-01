// Small pure-function measurements only. No browser, GPU, inference or native build.
import {performance} from 'node:perf_hooks';
import {initialState,series,trade} from '../src/model.js';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),iterations=1000;
const measure=fn=>{const start=performance.now();for(let i=0;i<iterations;i++)fn();return +(performance.now()-start).toFixed(3);};
const fixturesMs=measure(()=>series('orbit'));
const tradingMs=measure(()=>trade(initialState(),{token:'orbit',side:'buy',amount:2}));
const html=await readFile(new URL('dist/SENTINEL-preview.html',root));
const result={date:new Date().toISOString(),runtime:process.version,platform:process.platform,iterations,bundleBytes:html.byteLength,externalRuntimeRequests:0,syntheticCandleBatchTotalMs:fixturesMs,practiceBuyTotalMs:tradingMs,limits:'Pure-function microbenchmarks only. Not FPS, UI responsiveness, startup, memory, network latency or AI latency. Desktop/browser were not launched.'};
await mkdir(new URL('docs/',root),{recursive:true});await writeFile(new URL('docs/measurements.json',root),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
