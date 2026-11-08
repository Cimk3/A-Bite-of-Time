/** Independent engine-space check. Geometry X is mirrored, native Y rotation
 * follows the official smiley-block example; no production slicer/grid math here.
 */
export const officialAngles={north:0,east:-90,south:180,west:90};
const rotate=([x,y,z],a)=>{const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180);return [x*c+z*s,y,-x*s+z*c];};
export function geometryVectorToWorld(p,angle){return rotate([-p[0],p[1],p[2]],angle);}
/** Undo the entire structure's pose after placing each emitted native part. */
export function assembleInModelSpace(parts,worldCells,direction){
 const angle=officialAngles[direction];
 const center=[0,2].map(axis=>{const k=axis===0?'x':'z';return (Math.min(...worldCells.map(p=>p[k]))+Math.max(...worldCells.map(p=>p[k])))*8;});
 const bottom=Math.min(...worldCells.map(p=>p.y))*16;
 return parts.flatMap((part,i)=>{
  if(part.angle!==angle)throw Error('Incorrect native transformation: '+part.angle+' versus '+angle);
  const p=worldCells[i],v=rotate([p.x*16-center[0],p.y*16-bottom,p.z*16-center[1]],-angle),delta=[-v[0],v[1],v[2]];
  return part.cubes.map(c=>({...c,material:'ware',faces:Object.keys(c.uv),origin:c.origin.map((v,k)=>v+delta[k])}));
 });
}
function sample(c,face,p){
 const uv=c.uv[face],rx=(p[0]-c.origin[0])/c.size[0],ry=(p[1]-c.origin[1])/c.size[1],rz=(p[2]-c.origin[2])/c.size[2];
 const axes={north:[1-rx,1-ry],south:[rx,1-ry],east:[rz,1-ry],west:[1-rz,1-ry],up:[rx,1-rz],down:[rx,rz]};
 return axes[face].map((v,k)=>uv.uv[k]+v*uv.uv_size[k]);
}
/** Every emitted face must be an original external face with the same UV samples.
 * This rejects both invented cut caps and swapped halves of a screen image.
 */
export function faceMismatch(source,assembled){
 const errors=[];
 for(const c of assembled)for(const face of Object.keys(c.uv)){
  const axis=face==='east'||face==='west'?0:face==='up'||face==='down'?1:2,positive=['east','up','south'].includes(face);
  const point=c.origin.map((v,k)=>v+c.size[k]/2);point[axis]=c.origin[axis]+(positive?c.size[axis]:0);
  const candidates=source.filter(s=>(s.faces??Object.keys(s.uv)).includes(face)&&s.uv[face]&&Math.abs(s.origin[axis]+(positive?s.size[axis]:0)-point[axis])<.0001&&point.every((v,k)=>v>=s.origin[k]-.0001&&v<=s.origin[k]+s.size[k]+.0001));
  const actual=sample(c,face,point);
  if(!candidates.some(s=>sample(s,face,point).every((v,k)=>Math.abs(v-actual[k])<.002)))errors.push({face,point,actual});
 }
 return errors;
}
export function missingSurfaceSamples(source,assembled){
 const missing=[];
 for(const s of source)for(const face of s.faces??Object.keys(s.uv)){
  const axis=face==='east'||face==='west'?0:face==='up'||face==='down'?1:2,positive=['east','up','south'].includes(face),other=[0,1,2].filter(k=>k!==axis);
  for(const a of [.1,.5,.9])for(const b of [.1,.5,.9]){
   const p=[...s.origin];p[axis]+=positive?s.size[axis]:0;p[other[0]]+=s.size[other[0]]*a;p[other[1]]+=s.size[other[1]]*b;
   const outside=[...p];outside[axis]+=(positive?1:-1)*.002;
   if(source.some(c=>c!==s&&outside.every((v,k)=>v>=c.origin[k]-.00001&&v<=c.origin[k]+c.size[k]+.00001)))continue;
   const expected=sample(s,face,p);
   if(!assembled.some(c=>c.uv[face]&&Math.abs(c.origin[axis]+(positive?c.size[axis]:0)-p[axis])<.0001&&p.every((v,k)=>v>=c.origin[k]-.0001&&v<=c.origin[k]+c.size[k]+.0001)&&sample(c,face,p).every((v,k)=>Math.abs(v-expected[k])<.002)))missing.push({face,point:p});
  }
 }
 return missing;
}
