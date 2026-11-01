// Small deterministic native icon; no graphics tools or GPU work required.
import {mkdir,writeFile} from 'node:fs/promises';
const size=32,stride=size*4,maskStride=4;
const dib=Buffer.alloc(40+stride*size+maskStride*size);
dib.writeUInt32LE(40,0);dib.writeInt32LE(size,4);dib.writeInt32LE(size*2,8);dib.writeUInt16LE(1,12);dib.writeUInt16LE(32,14);dib.writeUInt32LE(stride*size,20);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const i=40+((size-1-y)*size+x)*4;
 const border=(x===7||x===24)&&y>=8&&y<=20||y===6&&x>=10&&x<=21||y>=21&&y<=27&&Math.abs(x-15.5)<=27-y;
 const mark=(y===12||y===20)&&x>=11&&x<=20||x+y===31&&y>=12&&y<=20;
 const c=border||mark?[167,199,222]:[17,22,27];
 dib[i]=c[2];dib[i+1]=c[1];dib[i+2]=c[0];dib[i+3]=255;
}
const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=size;header[7]=size;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(dib.length,14);header.writeUInt32LE(22,18);
const dir=new URL('../src-tauri/icons/',import.meta.url);await mkdir(dir,{recursive:true});await writeFile(new URL('icon.ico',dir),Buffer.concat([header,dib]));
