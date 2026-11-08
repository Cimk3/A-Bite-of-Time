import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {patch090Props,patch090PartId} from '../.build/patch-090-catalog.js';
import {patch090Cells} from '../.build/patch-090-grid.js';
import {nativePartIndex,oppositeDirection} from '../.build/patch-092-layout.js';
import {patch090Cubes,patch090Texture,split090} from '../tools/patch-090-art.mjs';
import {officialAngles,assembleInModelSpace,faceMismatch,missingSurfaceSamples,geometryVectorToWorld} from '../tools/native-world-audit.mjs';
import {renderDetail} from '../tools/detail-art.mjs';
import {whole090Keys} from '../.build/patch-093-render.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const anchor={x:0,y:0,z:0};
test('engine coordinate anchors distinguish mirrored geometry X from world X',()=>{
 assert.deepEqual(geometryVectorToWorld([8,0,0],0),[-8,0,0]);
 const normals={north:[0,0,-1],east:[1,0,0],south:[0,0,1],west:[-1,0,0]};
 for(const [dir,a] of Object.entries(officialAngles))assert.ok(geometryVectorToWorld([0,0,-1],a).every((v,k)=>Math.abs(v-normals[dir][k])<.0001));
});
test('delivered 0.9.1 meshes reproduce the pictured split/reversed structures under the engine transform',()=>{
 const old=read('tests/fixtures/v0.9.1-native-counterexamples.json');
 for(const d of Object.values(old)){
  const assembled=assembleInModelSpace(d.parts,patch090Cells(d,anchor,'north',true),'north');
  const source=d.source.map(c=>({...c,faces:Object.keys(c.uv)}));
  assert.ok(faceMismatch(source,assembled).length>0,d.key+' must expose the old broken assembly');
 }
});
for(const d of patch090Props.filter(d=>d.kind==='solid'))for(const dir of Object.keys(officialAngles)){
 test(d.key+' '+dir+' emitted parts reconstruct the complete object and continuous UV',()=>{
  const cells=patch090Cells(d,anchor,dir),source=patch090Cubes(d.key);
  const parts=cells.map((_,i)=>{
   const key=patch090PartId(d,i).slice(10),b=read('packs/FoodAndTable_BP/blocks/'+key+'.json')['minecraft:block'];
   const permutation=b.permutations.find(p=>p.condition.includes("'"+dir+"'"));
   const g=read('packs/FoodAndTable_RP/models/blocks/mcpe_food/'+key+'.geo.json')['minecraft:geometry'][0];
   return {angle:permutation.components['minecraft:transformation'].rotation[1],cubes:g.bones.flatMap(b=>b.cubes??[])};
  });
  const assembled=whole090Keys.has(d.key)?read('packs/FoodAndTable_RP/models/entity/mcpe_food/surface_'+d.key+'.geo.json')['minecraft:geometry'][0].bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:'ware',faces:Object.keys(c.uv)}))):assembleInModelSpace(parts,cells,dir);
  assert.deepEqual(faceMismatch(source,assembled),[]);
  assert.deepEqual(missingSurfaceSamples(source,assembled),[],'external faces lost during splitting');
  for(const c of assembled)assert.ok(source.some(s=>c.origin.every((v,k)=>v>=s.origin[k]-.0001&&v+c.size[k]<=s.origin[k]+s.size[k]+.0001)),'unexpected detached geometry');
  const textures={ware:patch090Texture(d.key)};
  for(const view of [{front:true},{front:false},{projection:'side',front:true},{projection:'side',front:false}]){
   const a=renderDetail(source,textures,160,160,view),b=renderDetail(assembled,textures,160,160,view);
   let different=0;for(let p=0;p<a.data.length;p+=4)if(a.data.subarray(p,p+4).some((v,k)=>Math.abs(v-b.data[p+k])>8))different++;
   assert.ok(different/(160*160)<.015,d.key+' raster mismatch '+different+' '+JSON.stringify(view));
  }
 });
 test(d.key+' '+dir+' legacy footprint accepts a whole-object correction without moving cells',()=>{
  const cells=patch090Cells(d,anchor,dir,true),target=oppositeDirection[dir],slices=split090(patch090Cubes(d.key),d.size);
  const parts=cells.map((_,i)=>({angle:officialAngles[target],cubes:slices[nativePartIndex(d,i,true,dir)]}));
  assert.deepEqual(faceMismatch(patch090Cubes(d.key),assembleInModelSpace(parts,cells,target)),[]);
 });
}

for(const d of patch090Props)test(d.key+' source has only intentional separate subassemblies',()=>{
 const remaining=new Set(patch090Cubes(d.key));let groups=0;
 while(remaining.size){
  const q=[remaining.values().next().value];remaining.delete(q[0]);groups++;
  for(const a of q)for(const b of remaining)if(a.origin.every((v,k)=>Math.min(v+a.size[k],b.origin[k]+b.size[k])+.08>=Math.max(v,b.origin[k]))){remaining.delete(b);q.push(b);}
 }
 const expected={ps5_console_set:2,xbox_360_console_set:2,cafe_booth:3,police_monitoring_computer:2};
 assert.equal(groups,expected[d.key]??1);
});
