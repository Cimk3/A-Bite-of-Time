import {patch082Props} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,brandAdvertisements,digitalScreens} from '../.build/scenario-catalog.js';
import {newProps,cityAdvertisements} from '../.build/lifestyle-catalog.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {restaurantItems,restaurantAccessories,numberVisuals,numberKey,validTableNumber} from '../.build/restaurant-catalog.js';import {surfaceVisuals} from '../.build/decor-catalog.js';import {electronics} from '../.build/electronics-catalog.js';import {screenYaw,screenNormal} from '../.build/device-facing.js';import {decodeRGBA} from '../tools/png-inspect.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
test('0.5.4 adds eight items, preserves old IDs/UUIDs/drops/recipes and all 368 surface indices',()=>{
 const old=read('tests/fixtures/v0.5.3.json');for(const kind of ['items','blocks']){const keys=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);assert.deepEqual(keys.filter(k=>!old[kind].includes(k)&&![...newProps,...cityAdvertisements,...scenarioProps,...brandAdvertisements,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch080Props,...patch082Props,...patch085Props].some(d=>'mcpe_food:'+d.key===k)).sort(),restaurantItems.map(d=>'mcpe_food:'+d.key).sort());for(const k of old[kind])assert.ok(keys.includes(k));}
 assert.deepEqual(surfaceVisuals.slice(0,368).map(d=>d.key),read('tests/fixtures/v0.5.3-surfaces.json'));assert.equal(surfaceVisuals.length,609+patch085Props.length);
 for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
 for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,sha]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),sha);
});
test('table numbers have one creative item and exactly 99 unique private nonemissive displays',()=>{
 assert.equal(numberVisuals.length,99);assert.equal(new Set(numberVisuals.map(n=>n.key)).size,99);assert.equal(numberKey(8),'table_number_sign');for(const v of numberVisuals){assert.ok(validTableNumber(v.number));const set=read(`${rp}/textures/blocks/mcpe_food/service_${v.key}.texture_set.json`)['minecraft:texture_set'];const im=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/${set.metalness_emissive_roughness}.png`));assert.equal(im.width,128);assert.ok(im.pixels.every((x,i)=>i%4!==1||x===0));}
 for(const n of [0,100,-1,NaN,1.1,'08',undefined])assert.ok(!validTableNumber(n));
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups;assert.equal(groups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics').items.length,42);assert.deepEqual(groups.find(g=>g.group_identifier.name==='mcpe_food:group_restaurant_accessories').items,restaurantAccessories.map(d=>'mcpe_food:'+d.key));
});
test('all eight service items face nearest cardinal player position, fit model budgets and use private 128px art',()=>{
 for(const d of restaurantItems){for(let deg=0;deg<360;deg+=5){const p={x:3*Math.sin(deg*Math.PI/180),z:3*Math.cos(deg*Math.PI/180)},yaw=screenYaw('mcpe_food:'+d.key,{x:0,z:0},p,0),n=screenNormal(yaw);assert.ok((n.x*p.x+n.z*p.z)/3>=Math.SQRT1_2-1e-8);}
 const g=read(`${rp}/models/blocks/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],c=g.bones.flatMap(b=>b.cubes??[]);assert.ok(c.length<=256);assert.equal(g.description.texture_width,128);for(const b of c)for(let i=0;i<3;i++){assert.ok(b.origin[i]>= (i===1?0:-8));assert.ok(b.origin[i]+b.size[i]<= (i===1?16:8));}}
 assert.equal(electronics.length,35);
});
