import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {districtGroups,districtProps,deskLampKey} from '../.build/patch-100-catalog.js';
import {districtCubes} from '../tools/patch-100-art.mjs';
import {modelBounds} from '../tools/detail-art.mjs';

const bp='packs/FoodAndTable_BP/',rp='packs/FoodAndTable_RP/';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');

test('1.0.0 preserves published definitions, package identities and old render index prefixes',()=>{
 const old=read('tests/fixtures/v0.9.9-release.json');
 for(const [name,path] of [['BP',bp],['RP',rp]]){
  const manifest=read(path+'manifest.json');
  assert.deepEqual([manifest.header.uuid,...manifest.modules.map(m=>m.uuid)],old[name].uuids);
  assert.equal(manifest.header.name.includes('方寸街区 · Fangcun District'),true);
  for(const [file,expected] of Object.entries(old[name].files)){
   if(['functions/mcpe_food/build_info.mcfunction','functions/mcpe_food/tasting_new.mcfunction'].includes(file))continue;
   assert.equal(hash(path+file),expected,file);
  }
 }
 for(const [kind,order] of Object.entries(old.displayOrders)){
  const description=read(rp+'entity/mcpe_food/'+kind+'_display.entity.json')['minecraft:client_entity'].description;
  assert.deepEqual(Object.values(description.geometry).slice(0,order.length),order);
 }
 assert.equal(Object.keys(old.refinedVisuals).length,10);
 for(const [file,hashBefore] of Object.entries(old.refinedVisuals)){
  assert.notEqual(hash(rp+file),hashBefore,file+' did not receive its promised refresh');
 }
 const newItems=readdirSync(bp+'items').filter(file=>!old.BP.files['items/'+file]).map(file=>file.slice(0,-5));
 assert.equal(newItems.length,19);
 assert.deepEqual(newItems.sort(),districtProps.map(d=>d.key).sort());
});

test('new release includes distinct groups, bounded meshes, two glass assets and one actual light source',()=>{
 const command=props=>props.map(d=>'give @s mcpe_food:'+d.key+' 4\n').join('');
 assert.equal(readFileSync(bp+'functions/mcpe_food/tasting_new.mcfunction','utf8'),command(districtProps));
 for(const [key] of districtGroups)assert.equal(readFileSync(bp+'functions/mcpe_food/'+key+'.mcfunction','utf8'),command(districtProps.filter(d=>d.group===key)));
 assert.equal(read(bp+'blocks/'+deskLampKey+'_part_0.json')['minecraft:block'].components['minecraft:light_emission'],9);
 for(const d of districtProps){
  const mesh=districtCubes(d.key),{low,high}=modelBounds(mesh),[w,depth,h]=d.size;
  assert.ok(mesh.length>4&&mesh.length<=256,d.key);
  assert.ok(low[0]>=-8*w&&high[0]<=8*w&&low[1]>=0&&high[1]<=16*h&&low[2]>=-8*depth&&high[2]<=8*depth,d.key+JSON.stringify({low,high}));
  const connected=[mesh[0]],remaining=new Set(mesh.slice(1));
  for(const a of connected)for(const b of remaining){
   const touches=a.origin.every((x,i)=>Math.min(x+a.size[i],b.origin[i]+b.size[i])+.005>=Math.max(x,b.origin[i]));
   if(touches){remaining.delete(b);connected.push(b);}
  }
  assert.equal(remaining.size,0,d.key+' has disconnected cuboids');
 }
 for(const key of ['store_drink_cooler','store_hot_display']){
  const name='controller.render.mcpe_food.'+key+'_glass';
  const controller=read(rp+'render_controllers/mcpe_food/'+key+'_glass.json').render_controllers[name];
  assert.deepEqual(controller.part_visibility,[{food:true},{ware:false}]);
 }
});
