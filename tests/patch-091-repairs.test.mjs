import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {patch090Props} from '../.build/patch-090-catalog.js';
import {patch090Cubes,split090} from '../tools/patch-090-art.mjs';
import {nativeBlockBoxes} from '../tools/native-block-boxes.mjs';
import {modelBounds} from '../tools/detail-art.mjs';
import {emittedLidAngle} from '../tools/device-geometry.mjs';
import {screenNormal,screenYaw} from '../.build/device-facing.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';

const keys=['macbook_air_m5_open','legion_laptop_open','finance_monitor','police_monitoring_computer'];
const repairedKeys=patch090Props.map(d=>d.key);
const read=p=>JSON.parse(readFileSync(p,'utf8'));
test('native collision and selection boxes use bounded origin/size data, with space under booth tables',()=>{
 for(const d of patch090Props.filter(d=>d.kind==='solid'))for(const [i,cs] of split090(patch090Cubes(d.key),d.size).entries()){
  const boxes=nativeBlockBoxes(cs,{table:d.key==='cafe_booth'&&i%3===1});
  for(const box of Object.values(boxes))if(box!==false){
   assert.ok(!Array.isArray(box));assert.ok(Array.isArray(box.origin)&&Array.isArray(box.size));
   for(let k=0;k<3;k++)assert.ok(box.size[k]>0&&box.origin[k]>=(k===1?0:-8)&&box.origin[k]+box.size[k]<=(k===1?16:8)+.0001,d.key);
  }
  if(d.key==='cafe_booth'&&i%3===1)assert.ok(boxes.collision.origin[1]>=9);
 }
});
test('repaired computer screens face their keyboards and stands, with baked 110-degree laptop lids',()=>{
 for(const key of keys){
  const d=patch090Props.find(d=>d.key===key),cubes=patch090Cubes(key),bounds=modelBounds(cubes);
  assert.ok(cubes.length<=256&&cubes.every(c=>!c.rotation));
  assert.ok(bounds.low[1]>=0&&bounds.high[1]<=16);
  assert.ok(bounds.low[0]>=-d.size[0]*8&&bounds.high[0]<=d.size[0]*8);
  assert.ok(bounds.low[2]>=-8&&bounds.high[2]<=8);
  const screens=cubes.filter(c=>c.tag==='screen');assert.ok(screens.length);
  assert.ok(screens.every(c=>c.faces.includes('south')));
  if(!key.includes('laptop')&&!key.includes('m5')){
   const stand=cubes.find(c=>c.tag==='stand');assert.ok(stand.origin[2]+stand.size[2]<screens[0].origin[2],'stand must remain behind the screen');
  }
  if(key.includes('laptop')||key.includes('m5')){
   assert.ok(Math.abs(emittedLidAngle(cubes)-110)<.2);
   const pad=cubes.find(c=>c.tag==='trackpad');assert.ok(pad.origin[2]>Math.max(...screens.map(c=>c.origin[2]+c.size[2])));
  }
  for(const player of [{x:0,z:3},{x:3,z:0},{x:0,z:-3},{x:-3,z:0}]){
   const angle=screenYaw('mcpe_food:'+key,{x:0,z:0},player,0),n=screenNormal(angle,180);
   assert.ok(n.x*player.x+n.z*player.z>2.99,key);
  }
 }
});
test('emitted computer meshes retain the corrected screen side and laptop angle',()=>{
 for(const key of keys){
  const geometry=read('packs/FoodAndTable_RP/models/entity/mcpe_food/surface_'+key+'.geo.json')['minecraft:geometry'][0];
  const cubes=geometry.bones.flatMap(b=>b.cubes??[]),screens=cubes.filter(c=>c.uv?.south?.uv_size[0]===96&&c.uv.south.uv[0]===0&&c.uv.south.uv[1]<48);
  assert.ok(screens.length,key);assert.ok(screens.every(c=>!c.rotation));
  if(key.includes('laptop')||key.includes('m5'))assert.ok(Math.abs(emittedLidAngle(cubes)-110)<.2,key);
  else for(const screen of screens)for(const c of cubes){
   if(c===screen)continue;
   const overlaps=[0,1].every(k=>Math.min(c.origin[k]+c.size[k],screen.origin[k]+screen.size[k])-Math.max(c.origin[k],screen.origin[k])>.001);
   assert.ok(!overlaps||c.origin[2]+c.size[2]<=screen.origin[2]+screen.size[2]+.001,key+' screen occluded by geometry');
  }
 }
});
for(const baseline of ['v0.9.0-candidate','v0.9.1-candidate'])test('0.9.2 preserves '+baseline+' public IDs, UUIDs, index order and unrelated assets',()=>{
 const old=read('tests/fixtures/'+baseline+'.json');
 const oldComputers={...read('tests/fixtures/v0.9.0-computer-blocks.json'),...read('tests/fixtures/v0.9.0-other-prop-blocks.json')};
 const oldPixels=read('tests/fixtures/v0.9.0-uncompressed-pixels.json');
 for(const [pack,data] of Object.entries(old.packs)){
  const prefix='packs/FoodAndTable_'+pack+'/';
  const m=read(prefix+'manifest.json');assert.deepEqual([m.header.uuid,...m.modules.map(v=>v.uuid)],data.uuids);
  for(const [file,hash] of Object.entries(data.files)){
   if(!(/^(items|blocks|recipes|loot_tables)\//.test(file)||/^(models|textures\/(blocks|entity|items)\/mcpe_food)\//.test(file)))continue;
   if(pack==='BP'&&/^blocks\/.*_part_\d+\.json$/.test(file)){
    assert.equal(read(prefix+file)['minecraft:block'].description.identifier,'mcpe_food:'+file.slice(7,-5));continue;
   }
   if(pack==='BP'&&repairedKeys.some(key=>file==='blocks/'+key+'.json')){
    const key=file.slice(7,-5),actual=read(prefix+file),expected=structuredClone(oldComputers[key]);
    // Their selection bounds follow the repaired meshes; all other block data
    // must retain the delivered definition, including IDs, traits and loot.
    delete actual['minecraft:block'].components['minecraft:selection_box'];
    delete expected['minecraft:block'].components['minecraft:selection_box'];
    assert.deepEqual(actual,expected,file);continue;
   }
   if(pack==='RP'&&repairedKeys.some(key=>file.endsWith('/'+key+'.geo.json')||file.endsWith('/surface_'+key+'.geo.json')||file.startsWith('models/blocks/mcpe_food/'+key+'_part_')&&file.endsWith('.geo.json')||file==='textures/items/mcpe_food/'+key+'.png'))continue;
   if(pack==='RP'&&oldPixels[file]){
    const im=decodeRGBA(readFileSync(prefix+file)),expected=oldPixels[file];
    assert.deepEqual([im.width,im.height],[expected.width,expected.height],file);
    assert.equal(createHash('sha256').update(im.pixels).digest('hex'),expected.rgba,file);continue;
   }
   assert.equal(createHash('sha256').update(readFileSync(prefix+file)).digest('hex'),hash,file);
  }
 }
 const client=read('packs/FoodAndTable_RP/entity/mcpe_food/surface_display.entity.json')['minecraft:client_entity'];
 assert.deepEqual(Object.values(client.description.geometry),old.surfaceGeometryOrder);
});
