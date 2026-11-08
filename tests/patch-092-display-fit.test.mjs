import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {foodById,servingKey,id} from '../.build/catalog.js';
import {adById,surfaceIndex} from '../.build/decor-catalog.js';
import {patch090ById} from '../.build/patch-090-catalog.js';
import {displaySlotScale,slotLocal} from '../.build/patch-092-layout.js';
import {modelBounds} from '../tools/detail-art.mjs';
const root='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
test('all supported display objects fit the smallest cabinet compartment without shelf overlap',()=>{
 const geometries=new Map();
 for(const file of readdirSync(root+'models/entity/mcpe_food'))if(file.endsWith('.geo.json'))for(const g of read(root+'models/entity/mcpe_food/'+file)['minecraft:geometry'])geometries.set(g.description.identifier,g);
 const surface=read(root+'entity/mcpe_food/surface_display.entity.json')['minecraft:client_entity'].description.geometry;
 const ads=read(root+'entity/mcpe_food/advert_display.entity.json')['minecraft:client_entity'].description.geometry;
 let count=0;
 for(const file of readdirSync('packs/FoodAndTable_BP/items')){
  const key=id(file.slice(0,-5)),spec=patch090ById.get(key);if(spec?.slots||spec?.kind==='wall'||spec?.key==='asml_lithography')continue;
  let index=surfaceIndex.get(key)??surfaceIndex.get(id('slot_icon_'+key.slice(10))),g;
  if(index===undefined){const food=foodById.get(key);if(food)index=surfaceIndex.get(id(servingKey(food,food.vessel)));}
  if(index!==undefined)g=geometries.get(Object.values(surface)[index]);
  else if(adById.has(key))g=geometries.get('geometry.mcpe_food.'+key.slice(10));
  if(!g)continue;
  const cubes=g.bones.flatMap(b=>b.cubes??[]);if(!cubes.length)continue;
  const bounds=modelBounds(cubes),extent=bounds.high.map((v,k)=>(v-bounds.low[k])/16*displaySlotScale);
  assert.ok(bounds.low[1]>=-.001,key+' extends below its shelf');
  assert.ok(extent[0]<=.75+.001&&extent[1]<=.8125+.001&&extent[2]<=.875+.001,key+' does not fit: '+extent);
  count++;
 }
 assert.equal(count,406,'supported objects must not regress');assert.ok(Object.keys(ads).length);
 for(const key of ['home_display_cabinet','home_display_shelf','cafe_pastry_case']){
  const spec=patch090ById.get(id(key)),columns=spec.slots===12?4:3,rows=spec.slots/columns;
  for(let row=0;row<rows;row++){
   const actual=slotLocal(spec,row*columns).y*16;
   assert.ok(Math.abs(actual-(row===0?2:row*(spec.size[2]*16-2)/rows+1))<.0001);
  }
 }
});
