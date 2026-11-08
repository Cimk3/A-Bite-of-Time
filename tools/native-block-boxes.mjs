/** Conservative origin/size boxes, shared with the long-standing appliance path.
 * Keep every coordinate inside its own block; never require compound-box parsing.
 */
export function nativeBlockBoxes(cubes,{table=false}={}){
 if(!cubes.length)return {collision:false,selection:false};
 const bounds=source=>{
  const origin=[0,1,2].map(k=>Math.max(k===1?0:-8,Math.min(...source.map(c=>c.origin[k]))));
  const end=[0,1,2].map(k=>Math.min(k===1?16:8,Math.max(...source.map(c=>c.origin[k]+c.size[k]))));
  return {origin:origin.map(v=>+v.toFixed(4)),size:end.map((v,k)=>+Math.max(.001,v-origin[k]).toFixed(4))};
 };
 const top=table?cubes.filter(c=>c.size[1]<2&&c.origin[1]>=9):[];
 return {collision:bounds(top.length?top:cubes),selection:bounds(cubes)};
}
