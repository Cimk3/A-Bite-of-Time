import test from 'node:test';
import assert from 'node:assert/strict';
import {patch090Props,patch090Walls} from '../.build/patch-090-catalog.js';
import {patch090Cubes,patch090Texture,split090,patch090WallImage} from '../tools/patch-090-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';
test('all new source models and split parts fit their dimensions and UV limits',()=>{
 for(const d of patch090Props){
  const cubes=patch090Cubes(d.key);
  assert.ok(cubes.length&&cubes.length<=256,d.key);
  for(const c of cubes){
   assert.ok(c.size.every(n=>n>0),d.key);
   for(const uv of Object.values(c.uv))assert.ok(uv.uv.every(n=>n>=0)&&uv.uv[0]+uv.uv_size[0]<=128.0001&&uv.uv[1]+uv.uv_size[1]<=128.0001,d.key);
  }
  if(d.kind==='solid'){
   const parts=split090(cubes,d.size);assert.equal(parts.length,d.size.reduce((n,v)=>n*Math.ceil(v),1));
   for(const part of parts)for(const c of part)assert.ok(c.origin.every((v,i)=>v>=(i===1?0:-8)-.0001&&v+c.size[i]<=(i===1?16:8)+.0001),d.key);
  }
  const tex=patch090Texture(d.key);assert.ok(emissionIsValid(decodeRGBA(tex.mer),'patch090_'+d.key),d.key);
 }
});
test('wall canvases have exactly 64 pixels per block',()=>{
 for(const d of patch090Walls){
  const im=patch090WallImage(d);
  assert.deepEqual([im.width,im.height],[d.width*64,d.height*64]);
 }
});

test('small report and ticker retain text gutters and clear right margins',()=>{
 for(const key of ['finance_report','finance_ticker_5x1','finance_ticker_10x1']){
  const im=patch090WallImage(patch090Walls.find(d=>d.key===key));
  const empty=(x,y)=>Array.from(im.data.subarray((y*im.width+x)*4,(y*im.width+x)*4+3)).join(',')==='14,25,38';
  for(let y=0;y<im.height;y++)for(let x=im.width-4;x<im.width;x++)assert.ok(empty(x,y),key+' right margin');
  if(key==='finance_report')for(let y=18;y<im.height;y++)for(let x=17;x<28;x++)assert.ok(empty(x,y),'report column gutter');
 }
});

test('native parts reconstruct the complete mesh along the placement grid without reversed slices',()=>{
 for(const d of patch090Props.filter(d=>d.kind==='solid')){
  const source=patch090Cubes(d.key),parts=split090(source,d.size),[w,depth]=d.size;
  const placed=parts.flatMap((cs,i)=>{
   const x=i%w,z=Math.floor(i/w)%depth,y=Math.floor(i/(w*depth));
   return cs.map(c=>({...c,origin:[c.origin[0]+x*16,c.origin[1]+y*16,c.origin[2]+z*16]}));
  });
  const volume=cs=>cs.reduce((sum,c)=>sum+c.size.reduce((a,b)=>a*b,1),0);
  assert.ok(Math.abs(volume(source)-volume(placed))<.001,d.key);
  // Every split piece remains inside one original cube after undoing the
  // structure's centre-to-front-corner offset, including asymmetric details.
  for(const c of placed){
   const origin=[c.origin[0]-(w-1)*8,c.origin[1],c.origin[2]-(depth-1)*8];
   assert.ok(source.some(s=>origin.every((v,k)=>v>=s.origin[k]-.0001&&v+c.size[k]<=s.origin[k]+s.size[k]+.0001)),d.key);
  }
 }
});
