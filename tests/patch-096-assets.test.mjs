import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {refresh096Block,refresh096Visual,append097Asset} from './patch-096-scope.mjs';
import {refreshed096Keys,whole096Keys,glass096Keys} from '../.build/patch-096-catalog.js';
import {pastryBounds} from '../.build/generated-pastry-bounds.js';
import {fitPastry,pastryScales,pastryClearance,pastryShelfTop} from '../.build/pastry-display-layout.js';
import {dishes,servingKey} from '../.build/catalog.js';
import {modelBounds} from '../tools/detail-art.mjs';
import {patch096Cubes} from '../tools/patch-096-art.mjs';
import {patch090ById} from '../.build/patch-090-catalog.js';

const bp='packs/FoodAndTable_BP/',rp='packs/FoodAndTable_RP/';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const shape=k=>json(rp+'models/entity/mcpe_food/surface_'+k+'.geo.json')['minecraft:geometry'][0];
const cubes=k=>shape(k).bones.flatMap(b=>b.cubes??[]);
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const range=(c,i)=>[c.origin[i],c.origin[i]+c.size[i]];

test('0.9.6 confines changed assets and preserves old behavior, IDs and display indices',()=>{
 const old=json('tests/fixtures/v0.9.5-content.json');
 for(const [pack,data] of Object.entries(old.packs)){
  const dir=pack==='BP'?bp:rp,m=json(dir+'manifest.json');
  assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],data.uuids);
  for(const [f,expected] of Object.entries(data.files)){
   if(append097Asset(f))continue;
   if(['manifest.json','mcpe_food_build.json','functions/mcpe_food/build_info.mcfunction','entities/surface_display.json','entity/mcpe_food/surface_display.entity.json'].includes(f)||f.startsWith('scripts/'))continue;
   if(pack==='RP'&&refresh096Visual(f))continue;
   if(pack==='BP'&&refresh096Block(f)){
    const before=JSON.parse(old.oldBlocks[f]),after=json(dir+f);
    for(const k of ['minecraft:geometry','minecraft:material_instances','minecraft:selection_box']){
     if(k==='minecraft:selection_box'&&f.includes('_part_'))continue;
     delete before['minecraft:block'].components[k];delete after['minecraft:block'].components[k];
    }
    assert.deepEqual(after,before,f);
    continue;
   }
   assert.equal(digest(dir+f),expected,f);
  }
 }
 for(const [name,binding] of Object.entries(old.bindings)){
  const geometry=json(rp+'entity/mcpe_food/'+name+'.entity.json')['minecraft:client_entity'].description.geometry;
  assert.deepEqual(Object.entries(geometry).slice(0,Object.keys(binding).length),Object.entries(binding));
 }
});

for(const key of refreshed096Keys)test(key+' final resource dimensions, support and surface integrity',()=>{
 const g=shape(key),mesh=cubes(key),dims=patch090ById.get('mcpe_food:'+key)?.size??[1,1,['ticket_vending_machine','government_service_kiosk'].includes(key)?2:1];
 const path='models/entity/mcpe_food/surface_'+key+'.geo.json';
 const baseline=json('tests/fixtures/v0.9.5-content.json').packs.RP.files[path];
 assert.ok(baseline&&digest(rp+path)!==baseline,key+' still has the old model');
 assert.deepEqual([g.description.texture_width,g.description.texture_height],[128,128]);
 assert.ok(mesh.length>20&&mesh.length<=256);
 const b=modelBounds(mesh);
 const outer=[dims[0]*8,dims[2]*16,dims[1]*8];
 for(let i=0;i<3;i++)assert.ok(b.low[i]>=(i===1?0:-outer[i])-.0001&&b.high[i]<=outer[i]+.0001,key+' bounds '+JSON.stringify(b));
 const authored=patch096Cubes(key),bounds=new Map(authored.map(c=>[c,modelBounds([c])])),rest=new Set(authored);let groups=0;
 while(rest.size){
  const seed=rest.values().next().value,q=[seed];rest.delete(seed);groups++;
  for(const c of q)for(const other of rest){
   const x=bounds.get(c),y=bounds.get(other);
   if(x.low.every((v,i)=>Math.min(x.high[i],y.high[i])+.007>=Math.max(v,y.low[i]))){rest.delete(other);q.push(other);}
  }
 }
 assert.equal(groups,key==='transit_ticket_gate'?2:key.includes('monitor_set')?3:1,'floating parts');
 const directions=[['west',0,0],['east',0,1],['down',1,0],['up',1,1],['north',2,0],['south',2,1]];
 for(const [i,a] of mesh.entries())for(const b of mesh.slice(i+1))for(const [f,axis,end] of directions){
  if(a.rotation||b.rotation||!a.uv[f]||!b.uv[f]||Math.abs(range(a,axis)[end]-range(b,axis)[end])>.000001)continue;
  assert.ok(![0,1,2].filter(k=>k!==axis).every(k=>Math.min(range(a,k)[1],range(b,k)[1])-Math.max(range(a,k)[0],range(b,k)[0])>.00001),key+' overlap '+f+' '+a.origin+' '+b.origin);
 }
 if(glass096Keys.has(key)){
  assert.ok(g.bones.find(b=>b.name==='food').cubes.length>0);
  const rc=json(rp+'render_controllers/mcpe_food/'+key+'_glass.json').render_controllers['controller.render.mcpe_food.'+key+'_glass'];
  assert.deepEqual(rc.part_visibility,[{food:true},{ware:false}]);
  assert.deepEqual(rc.materials,[{'*':'Material.glass'}]);
 }
 if(whole096Keys.has(key)){
  const parts=dims.reduce((n,v)=>n*Math.ceil(v),1);
  for(let i=0;i<parts;i++){
   const part=key+'_part_'+i,b=json(bp+'blocks/'+part+'.json')['minecraft:block'];
   assert.deepEqual(b.components['minecraft:geometry'].bone_visibility,{root:false});
   const hidden=json(rp+'models/blocks/mcpe_food/'+part+'.geo.json')['minecraft:geometry'][0].bones[0].cubes;
   assert.equal(hidden.length,1);assert.equal(Object.keys(hidden[0].uv).length,6);
  }
 }
});

test('all displayable foods use current mesh bounds, safe maximal slots and shelf contact on both levels',()=>{
 const e=json(bp+'entities/surface_display.json')['minecraft:entity'];
 let enlarged=0;
 for(const d of dishes){
  const key='mcpe_food:'+d.key,b=modelBounds(cubes(servingKey(d,d.vessel)));
  assert.deepEqual(pastryBounds[key],[...b.low,...b.high].map(v=>Math.round(v*1e6)/1e6));
  const width=2*Math.max(Math.abs(b.low[0]),Math.abs(b.high[0]),Math.abs(b.low[2]),Math.abs(b.high[2])),height=b.high[1]-b.low[1];
  const limit=Math.min(pastryClearance[0],pastryClearance[2]);
  for(const row of [0,1]){
   const {level,y}=fitPastry(key,row),s=pastryScales[level];
   assert.ok(width*s<=limit+.000001&&height*s<=pastryClearance[1]+.000001,key);
   assert.ok(Math.abs(y*16+b.low[1]*s-pastryShelfTop[row])<.000001);
   if(level<6)assert.ok(width*pastryScales[level+1]>limit||height*pastryScales[level+1]>pastryClearance[1]);
   const group='mcpe_food:pastry_scale_'+level;
   assert.equal(e.component_groups[group]['minecraft:scale'].value,s);
   assert.ok(e.events[group].remove.component_groups.includes('mcpe_food:slot_scaled'));
  }
  if(fitPastry(key,0).level>0)enlarged++;
 }
 assert.equal(enlarged,dishes.length);
});
