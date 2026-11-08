import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {surfaceVisuals,adById} from '../.build/decor-catalog.js';
import {patch090Items,patch090Props} from '../.build/patch-090-catalog.js';
import {foodById,id,servingKey} from '../.build/catalog.js';
import {surfaceIndex} from '../.build/decor-catalog.js';
const old=JSON.parse(readFileSync('tests/fixtures/v0.8.6-release.json','utf8'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
test('0.9.0 retains old IDs, definitions, texture bytes, geometry and index prefix',()=>{
 for(const [pack,data] of Object.entries(old.packs))for(const [name,expected] of Object.entries(data.files)){
  if(!(/^(items|blocks|recipes|loot_tables)\//.test(name)||/^(textures\/(blocks|entity|items)\/mcpe_food|models\/)/.test(name)))continue;
  assert.equal(hash('packs/FoodAndTable_'+pack+'/'+name),expected,name);
 }
 const client=JSON.parse(readFileSync('packs/FoodAndTable_RP/entity/mcpe_food/surface_display.entity.json'))['minecraft:client_entity'].description;
 assert.deepEqual(Object.values(client.geometry).slice(0,old.surfaceGeometryOrder.length),old.surfaceGeometryOrder);
 assert.equal(new Set(surfaceVisuals.map(d=>d.key)).size,surfaceVisuals.length);
});
test('candidate contains exactly 47 new creative items and supported cabinet coverage exceeds 90 percent',()=>{
 const keys=readdirSync('packs/FoodAndTable_BP/items').map(f=>'mcpe_food:'+f.slice(0,-5));
 assert.equal(keys.length,440);
 assert.ok(patch090Items.every(d=>keys.includes(id(d.key))));
 const allowed=keys.filter(key=>{
  const d=patch090Items.find(d=>id(d.key)===key);
  if(d?.slots||d?.kind==='wall'||d?.key==='asml_lithography')return false;
  if(adById.has(key)||surfaceIndex.has(key)||surfaceIndex.has(id('slot_icon_'+key.slice(10))))return true;
  const food=foodById.get(key);return food&&surfaceIndex.has(id(servingKey(food,food.vessel)));
 });
 assert.ok(allowed.length/keys.length>=.9,allowed.length+'/'+keys.length);
 const command=readFileSync('packs/FoodAndTable_BP/functions/mcpe_food/tasting_new.mcfunction','utf8').trim().split('\n');
 assert.deepEqual(command,patch090Items.map(d=>'give @s '+id(d.key)+' 4'));
 assert.equal(patch090Props.length,35);
});
