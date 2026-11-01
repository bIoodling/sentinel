import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const modules=await Promise.all(['model.js','store.js','app.js'].map(n=>read('src/'+n)));
const js=modules.map(s=>s.replace(/^import .*?;\r?\n/gm,'').replace(/^export /gm,'')).join('\n');
// Inline assets deliberately make the review file work from file:// without a server.
const css=await read('src/styles.css');
const output=(await read('index.html')).replace('<link rel="stylesheet" href="src/styles.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="src/app.js"></script>',()=>`<script type="module">${js.replace(/<\/script/gi,'<\\/script')}</script>`);
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/SENTINEL-preview.html',root),output);
console.log(`Offline review file: ${Buffer.byteLength(output)} bytes; zero external assets.`);
