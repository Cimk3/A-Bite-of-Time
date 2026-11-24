import {pastryBounds} from './generated-pastry-bounds.js';

export const pastryScales=[.20,.30,.40,.50,.60,.75,1] as const;
// In author model units; reserves glazing and framing clearance.
export const pastryClearance=[14,13,13] as const;
export const pastryShelfTop=[2.13,16] as const;

/** Fit around the original serving pivot for both cardinal orientations. */
export function fitPastry(key:string,row:number):{level:number;y:number}{
 const bounds=pastryBounds[key],top=pastryShelfTop[row]??pastryShelfTop[0];
 if(!bounds)return {level:0,y:top/16};
 const [ax,ay,az,bx,by,bz]=bounds;
 const horizontal=2*Math.max(Math.abs(ax),Math.abs(az),Math.abs(bx),Math.abs(bz));
 const maxHorizontal=Math.min(pastryClearance[0],pastryClearance[2]),height=by-ay;
 let level=0;
 for(let i=1;i<pastryScales.length;i++){
  const scale=pastryScales[i]!;
  if(horizontal*scale<=maxHorizontal&&height*scale<=pastryClearance[1])level=i;
 }
 return {level,y:(top-ay*pastryScales[level]!)/16};
}
