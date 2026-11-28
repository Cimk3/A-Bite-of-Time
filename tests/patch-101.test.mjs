import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fixedLaptopKeys,laptopSpawnEvent} from '../.build/electronics-catalog.js';
import {surfaceIndex} from '../.build/decor-catalog.js';
import {modelBounds} from '../tools/detail-art.mjs';

const root='packs/FoodAndTable_';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const mesh=key=>read(root+'RP/models/entity/mcpe_food/surface_'+key+'.geo.json')['minecraft:geometry'][0].bones.flatMap(b=>b.cubes??[]);
const revisedKeys=new Set([...fixedLaptopKeys,'asml_lithography','hotel_wall_hairdryer','store_drink_cooler']);
function appearanceChange(file){
 if(!/^(models|textures)\//.test(file))return false;
 const name=file.split('/').at(-1).replace(/(?:\.geo\.json|\.png)$/,'').replace(/_mer$/,'').replace(/^(surface_|device_|patch090_|patch100_)/,'');
 return revisedKeys.has(name);
}

test('1.0.1 keeps the released 1.0.0 definitions and unrelated assets byte-identical',()=>{
 const baseline=read('tests/fixtures/v1.0.0-release.json');
 for(const [pack,{uuids,files}] of Object.entries(baseline.packs)){
  const dir=root+pack+'/';
  const manifest=read(dir+'manifest.json');
  assert.deepEqual([manifest.header.uuid,...manifest.modules.map(m=>m.uuid)],uuids);
  for(const [file,digest] of Object.entries(files)){
   if(pack==='BP'&&['functions/mcpe_food/build_info.mcfunction','blocks/hotel_wall_hairdryer.json'].includes(file))continue;
   if(pack==='RP'&&appearanceChange(file))continue;
   assert.equal(createHash('sha256').update(readFileSync(dir+file)).digest('hex'),digest,pack+'/'+file);
  }
 }
});

test('all sixteen laptop spawn paths carry the exact appearance and facing properties',()=>{
 const events=read(root+'BP/entities/surface_display.json')['minecraft:entity'].events;
 for(const key of fixedLaptopKeys){
  const index=surfaceIndex.get('mcpe_food:'+key);
  for(const facing of [1,2,3,4])assert.deepEqual(events[laptopSpawnEvent(index,facing)],{
   set_property:{'mcpe_food:index':index,'mcpe_food:display_facing':facing}
  });
 }
});

test('hairdryer remains outside the wall plane and cooler includes raised rear structure',()=>{
 const dryer=mesh('hotel_wall_hairdryer');
 assert.ok(dryer.length>=12);
 const dry=modelBounds(dryer);
 assert.ok(dry.low[2]<-4&&dry.high[2]<=1e-9,'entire model should sit forward of the wall mount');
 assert.equal(dryer.filter(c=>c.origin[0]>5&&c.origin[2]<-3&&c.origin[1]>9).length,4,'four nozzle grille slats project beyond the shell');
 const cooler=mesh('store_drink_cooler');
 assert.ok(cooler.some(c=>c.origin[2]>=6.5&&c.size[1]>=17),'separate rear access panel');
 assert.equal(cooler.filter(c=>c.origin[2]===7.15&&c.size[0]>10).length,7);
 assert.ok(modelBounds(cooler).high[2]<=8,'back must fit existing footprint');
});
