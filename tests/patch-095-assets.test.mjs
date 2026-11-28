import {districtProps} from '../.build/patch-100-catalog.js';
import {gymAd} from '../.build/patch-097-catalog.js';
import {refresh096Block,refresh096Visual,expectedSharedOutputChange} from './patch-096-scope.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {patch095Items,patch095Groups} from '../.build/patch-095-catalog.js';
import {patch095Cubes} from '../tools/patch-095-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';

const bp='packs/FoodAndTable_BP/',rp='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const client=(name)=>read(rp+'entity/mcpe_food/'+name+'.entity.json')['minecraft:client_entity'].description;
const geo=p=>read(rp+'models/'+p+'.geo.json')['minecraft:geometry'][0];
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const sides=[['west',0,0],['east',0,1],['down',1,0],['up',1,1],['north',2,0],['south',2,1]];

test('0.9.5 keeps the real 0.9.3 resource hashes, UUIDs and surface indices',()=>{
  const old=read('tests/fixtures/v0.9.3-content.json');
  for(const [pack,data] of Object.entries(old.packs)){
    const dir=pack==='BP'?bp:rp,m=read(dir+'manifest.json');
    assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],data.uuids);
    for(const [file,expected] of Object.entries(data.files)){
      if(expectedSharedOutputChange(file))continue;
   if(refresh096Visual(file)||(pack==='BP'&&refresh096Block(file)))continue;
      if(['textures/item_texture.json','textures/terrain_texture.json'].includes(file))continue;
      if(/^render_controllers\/mcpe_food\/(surface_display|digital_ad_display)_(ware|food)\.json$/.test(file))continue;
      assert.equal(hash(dir+file),expected,file);
    }
  }
  assert.deepEqual(Object.entries(client('surface_display').geometry).slice(0,old.surfaceGeometryPrefix.length),old.surfaceGeometryPrefix);
  for(const file of ['textures/item_texture.json','textures/terrain_texture.json']){
    const entries=read(rp+file).texture_data;
    for(const [key,value] of Object.entries(old.atlases[file]))assert.deepEqual(entries[key],value,key);
  }
  assert.deepEqual(Object.entries(client('digital_ad_display').geometry).slice(0,old.wallGeometryPrefix.length),old.wallGeometryPrefix);
});

test('three creative groups and four give commands contain exactly the approved items',()=>{
  const groups=read(bp+'item_catalog/crafting_item_catalog.json')['minecraft:crafting_items_catalog'].categories[0].groups;
  for(const [group] of patch095Groups){
    const list=[...patch095Items,gymAd].filter(d=>d.group===group);
    assert.deepEqual(groups.find(g=>g.group_identifier.name==='mcpe_food:group_'+group).items,list.map(d=>'mcpe_food:'+d.key));
    assert.equal(readFileSync(bp+'functions/mcpe_food/'+group+'.mcfunction','utf8'),list.map(d=>'give @s mcpe_food:'+d.key+' 4\n').join(''));
  }
  assert.equal(readFileSync(bp+'functions/mcpe_food/tasting_new.mcfunction','utf8'),districtProps.map(d=>'give @s mcpe_food:'+d.key+' 4\n').join(''));
});

for(const item of patch095Items)test(item.key+' final meshes, dimensions, materials and empty helpers',()=>{
  const wall=item.kind==='wall';
  const g=geo('entity/mcpe_food/'+(wall?'':'surface_')+item.key);
  const cs=g.bones.flatMap(b=>b.cubes??[]);
  const [w,d,h]=item.size.map(n=>16*n);
  assert.ok(cs.length>4&&cs.length<=256);
  assert.deepEqual([g.description.texture_width,g.description.texture_height],[128,128]);
  const lo=[-w/2,0,wall?-d:-d/2],hi=[w/2,h,wall?0:d/2];
  for(const c of cs)for(let i=0;i<3;i++){
    assert.ok(c.origin[i]>=lo[i]-.0001&&c.origin[i]+c.size[i]<=hi[i]+.0001,JSON.stringify(c.origin));
  }
  const source=wall?cs:patch095Cubes(item.key);
  const remaining=new Set(source),connected=[source[0]];remaining.delete(source[0]);
  for(const a of connected)for(const b of remaining){
    if(a.origin.every((n,k)=>Math.min(n+a.size[k],b.origin[k]+b.size[k])+.006>=Math.max(n,b.origin[k]))){
      remaining.delete(b);connected.push(b);
    }
  }
  assert.deepEqual([...remaining].map(c=>c.origin),[],'floating components');
  for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++)for(const [face,axis,end] of sides){
    const a=cs[i],b=cs[j];
    if(!a.uv[face]||!b.uv[face]||Math.abs(a.origin[axis]+a.size[axis]*end-b.origin[axis]-b.size[axis]*end)>1e-6)continue;
    const overlap=[0,1,2].filter(k=>k!==axis).every(k=>Math.min(a.origin[k]+a.size[k],b.origin[k]+b.size[k])-Math.max(a.origin[k],b.origin[k])>1e-5);
    assert.ok(!overlap,face+' '+a.origin+' intersects '+b.origin);
  }
  const texture=wall?'digital_content_cinema_poster_lightbox_2x3':'patch095_'+item.key;
  const decode=p=>decodeRGBA(readFileSync(rp+p+'.png'));
  const im=decode('textures/entity/mcpe_food/'+texture),mer=decode('textures/entity/mcpe_food/'+texture+'_mer');
  const icon=decode('textures/items/mcpe_food/'+item.key);
  for(const image of [im,mer,icon])assert.deepEqual([image.width,image.height],[128,128]);
  assert.ok(emissionIsValid(mer,texture));
  if(item.kind==='solid')for(let i=0;i<item.size.reduce((n,v)=>n*Math.ceil(v),1);i++){
    const key=item.key+'_part_'+i;
    const b=read(bp+'blocks/'+key+'.json')['minecraft:block'];
    assert.deepEqual(b.components['minecraft:geometry'].bone_visibility,{root:false});
    const cubes=geo('blocks/mcpe_food/'+key).bones[0].cubes;
    assert.equal(cubes.length,1);
    assert.equal(Object.keys(cubes[0].uv).length,6);
  }
  if(item.key==='cinema_popcorn_machine'){
    assert.equal(g.bones.find(b=>b.name==='food').cubes.length,4);
    const d=client('surface_display'),k=Object.entries(d.geometry).find(([,v])=>v===g.description.identifier)[0];
    const render=read(rp+'render_controllers/mcpe_food/popcorn_glass.json').render_controllers['controller.render.mcpe_food.popcorn_glass'];
    assert.equal(render.geometry,'Geometry.'+k);
    assert.equal(d.materials.glass,'entity_alphablend');
    assert.deepEqual(render.part_visibility,[{food:true},{ware:false}]);
    assert.ok(im.pixels.some((v,i)=>i%4===3&&v>0&&v<255));
  }
});
