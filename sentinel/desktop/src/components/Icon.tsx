import type {CSSProperties} from 'react';
const paths:Record<string,string>={
 dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
 discovery:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M16 8l-3 5-5 3 3-5z',
 portfolio:'M3 6h17v14H3z M3 6V3h14v3 M15 11h6v5h-6z',
 social:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.9',
 assistant:'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
 alerts:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
 search:'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15 M16 16l5 5',
 arrow:'M5 12h14 M13 6l6 6-6 6',up:'M5 17l5-6 4 3 6-10 M15 4h5v5',down:'M5 7l5 6 4-3 6 10 M15 20h5v-5',
 close:'M6 6l12 12 M18 6L6 18',plus:'M12 5v14 M5 12h14',check:'M4 12l5 5L20 6',
 star:'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
 shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',
 copy:'M9 9h12v12H9z M15 6V3H3v12h3',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2',
 play:'M8 4l13 8-13 8z',pause:'M8 4v16 M16 4v16',minimise:'M5 16h14',maximise:'M5 5h14v14H5z',
 download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',refresh:'M20 8a8 8 0 1 0 0 8 M20 3v5h-5',
 connect:'M9 15l6-6 M7 14l-2 2a4 4 0 0 0 6 5l3-3 M17 10l2-2a4 4 0 0 0-6-5l-3 3'
};
export function Icon({name,style}:{name:string;style?:CSSProperties}){return <svg className="icon" style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={paths[name]??paths.shield}/></svg>;}
export function TokenIcon({id,size=36}:{id:string;size?:number}){
 const motifs:Record<string,[string,string]>={orbit:['#a9c9df','M8 16a7 7 0 1 0 0-8 M3 17L21 7 M8 12h.01'],moss:['#99bfa9','M12 21V9 M12 16C3 17 3 8 3 8s9-1 9 8 M12 12c0-8 9-9 9-9s1 10-9 9'],pebble:['#c8b68f','M4 16l3-10 10-2 5 9-8 8-10-5Z M7 6l7 8 8-1 M14 14v7'],echo:['#b6bdcc','M6 7a8 8 0 1 1 0 10 M9 10a4 4 0 1 1 0 4'],drift:['#91babc','M3 7c6-5 12 5 18 0 M3 12c6-5 12 5 18 0 M3 17c6-5 12 5 18 0'],pixel:['#c4a49b','M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z']};
 const [color,path]=motifs[id]??['#a7c7de','M12 3l9 9-9 9-9-9z'];
 return <span className="token-icon" style={{width:size,height:size,color}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={path}/></svg></span>;
}
