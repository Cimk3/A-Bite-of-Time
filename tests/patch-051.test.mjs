import {patch082Props} from '../.build/patch-082-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,brandAdvertisements,digitalScreens} from '../.build/scenario-catalog.js';
import {newProps,cityAdvertisements} from '../.build/lifestyle-catalog.js';
import {restaurantItems} from '../.build/restaurant-catalog.js';
import {emittedLidAngle} from '../tools/device-geometry.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MinecraftBlockTypes} from '@minecraft/vanilla-data';
import {electronics,newElectronics,originalElectronics,officeElectronics} from '../.build/electronics-catalog.js';
import {refrigerators,refrigeratorPartIds} from '../.build/appliance-catalog.js';
import {teaTray,surfaceVisuals} from '../.build/decor-catalog.js';
import {foods,recipes,teaFoods,servings,compatibleVessels} from '../.build/catalog.js';
import {vanillaSurfaceClasses} from '../.build/vanilla-surfaces.js';
import {surfaceHeight,isWallSupport} from '../.build/supports.js';
import {screenYaw,screenNormal} from '../.build/device-facing.js';
import {electronicCubes} from '../tools/electronics-art.mjs';
import {teaTrayCubes,refrigeratorCubes} from '../tools/tea-appliance-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');

test('0.5.1 additions and all old interfaces remain present alongside the seven office props',()=>{
  const old=read('tests/fixtures/v0.5.0.json'),expectedItems=[...newElectronics,...refrigerators,teaTray,...teaFoods].map(d=>'mcpe_food:'+d.key);
  for(const [kind,extra]of [['items',expectedItems],['blocks',[...newElectronics,teaTray].map(d=>'mcpe_food:'+d.key).concat(refrigeratorPartIds,servings.filter(s=>s.food.key==='tieguanyin').map(s=>'mcpe_food:'+s.key))]]){
    const current=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);
    assert.deepEqual(current.filter(k=>!old[kind].includes(k)&&![...newProps,...cityAdvertisements,...scenarioProps,...brandAdvertisements,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch080Props,...patch082Props].some(d=>'mcpe_food:'+d.key===k)).sort(),extra.concat(officeElectronics.map(d=>'mcpe_food:'+d.key),restaurantItems.map(d=>'mcpe_food:'+d.key)).sort());for(const key of old[kind])assert.ok(current.includes(key));
  }
  assert.equal(expectedItems.length,12);assert.equal(foods.length,102);assert.equal(foods.filter(f=>f.category==='drink').length,11);assert.equal(electronics.length+refrigerators.length,41);
  for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[file,sha]of Object.entries(entries))assert.equal(hash(`${bp}/${folder}/${file}`),sha);
  assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),old.menuRecipes);
  for(const[file,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${file}`)['minecraft:block'].description.states,states);
  for(const[file,content]of Object.entries(old.functions))if(!['advertisements.mcfunction','tasting_new.mcfunction','electronics.mcfunction','tableware.mcfunction','tasting_all_drink.mcfunction','tasting_all_chinese.mcfunction'].includes(file))assert.equal(readFileSync(`${bp}/functions/mcpe_food/${file}`,'utf8'),content);
});

test('old 354 surface indices remain unchanged and new tea/desktop appearances only append',()=>{
  const oldKeys=read('tests/fixtures/v0.5.0.json').blocks.map(k=>k.slice(10));
  assert.equal(surfaceVisuals.length,609);assert.equal(surfaceVisuals.slice(339,354).map(d=>d.key).join(),originalElectronics.map(d=>d.key).join());
  for(const d of surfaceVisuals.slice(0,339))assert.ok(oldKeys.includes(d.key));
  assert.deepEqual(surfaceVisuals.slice(354,361).map(d=>d.key),[...newElectronics,teaTray,...servings.filter(s=>s.food.key==='tieguanyin')].map(d=>d.key));
});

test('every pinned vanilla block has an explicit surface classification and unsafe shapes stay excluded',()=>{
  assert.deepEqual(Object.keys(vanillaSurfaceClasses).sort(),Object.values(MinecraftBlockTypes).sort());
  const block=(typeId,states={})=>({typeId:'minecraft:'+typeId,permutation:{getAllStates:()=>states}});
  for(const key of ['copper_bulb','waxed_oxidized_copper_grate','redstone_lamp','polished_tuff','coal_ore','stripped_birch_wood','white_glazed_terracotta','moss_block','glass','lime_stained_glass','azalea_leaves']){assert.equal(surfaceHeight(block(key)),1,key);assert.equal(isWallSupport(block(key)),true,key);}
  for(const key of ['stone_stairs','chest','white_shulker_box','oak_fence','glass_pane','water','lava','short_grass','cactus','farmland','soul_sand','pointed_dripstone','structure_void']){assert.equal(surfaceHeight(block(key)),0,key);assert.equal(isWallSupport(block(key)),false,key);}
  assert.equal(surfaceHeight({typeId:'other:solid',permutation:{getAllStates:()=>({})}}),0);
  assert.equal(surfaceHeight(block('oak_slab',{'minecraft:vertical_half':'bottom'})),.5);assert.equal(isWallSupport(block('oak_slab',{'minecraft:vertical_half':'top'})),false);assert.equal(isWallSupport(block('oak_double_slab')),true);
});

test('screen normals choose the nearest cardinal facing independent of look direction',()=>{
  for(const d of electronics.filter(d=>d.screenFront))for(let angle=0;angle<360;angle+=17){const t=angle*Math.PI/180,target={x:3*Math.sin(t),z:3*Math.cos(t)},yaw=screenYaw('mcpe_food:'+d.key,{x:0,z:0},target,123),normal=screenNormal(yaw,d.screenFront);assert.equal(Math.abs(yaw%90),0);assert.ok((normal.x*target.x+normal.z*target.z)/3>=Math.SQRT1_2-1e-8);}
  for(const d of electronics.filter(d=>d.placementFront===undefined))assert.equal(screenYaw('mcpe_food:'+d.key,{x:0,z:0},{x:2,z:3},0),undefined);
  assert.ok(Number.isFinite(screenYaw('mcpe_food:macbook_open',{x:0,z:0},{x:0,z:0},37)));
});

test('all nine open laptops and both tablets have a geometric interior angle of 110 degrees',()=>{
  const devices=electronics.filter(d=>d.openAngle);assert.equal(devices.length,11);
  for(const d of devices){
    const cubes=electronicCubes(d);assert.ok(Math.abs(emittedLidAngle(cubes)-110)<1e-8,d.key);
    assert.ok(cubes.filter(c=>c.tag==='screen').every(c=>!c.rotation));assert.equal(d.openAngle,110);
  }
});

test('desktop, AIO and Mac Studio mouse lie on the user right while independent keyboard/mouse layout is retained',()=>{
  const center=(cubes,tag)=>{const parts=cubes.filter(c=>c.tag===tag);return parts.reduce((n,c)=>n+c.origin[0]+c.size[0]/2,0)/parts.length;};
  for(const key of ['desktop_computer','all_in_one_computer','mac_studio_set']){const cubes=electronicCubes(electronics.find(d=>d.key===key));assert.ok(center(cubes,'mouse')<center(cubes,'keyboard'),key);}
  const separate=electronicCubes(electronics.find(d=>d.key==='keyboard_mouse_set'));assert.ok(center(separate,'mouse')>center(separate,'keyboard'));
});

test('only requested legacy screen color maps change and all other device color assets retain their hashes',()=>{
  const old=read('tests/fixtures/v0.5.0-appearance.json').deviceColorSHA256;
  for(const[key,sha]of Object.entries(old)){const current=hash(`assets/electronics/${key}.png`);if(['silver_laptop_open','macbook_open'].includes(key))assert.notEqual(current,sha,key);else assert.equal(current,sha,key);}
  const current=new Set(['silver_laptop_open','macbook_open','dell_laptop_open','macbook_pro_gpt_open'].map(k=>hash(`assets/electronics/${k}.png`)));assert.equal(current.size,4);
});

test('fridges are six static items, nine quiet immovable parts, with no native loot duplication',()=>{
  assert.equal(refrigerators.length,6);assert.equal(refrigeratorPartIds.length,9);
  for(const r of refrigerators){assert.ok(refrigeratorCubes(r).length<=256);const item=read(`${bp}/items/${r.key}.json`)['minecraft:item'];assert.equal(item.description.menu_category.group,'mcpe_food:group_home_appliances');assert.equal(item.components['minecraft:food'],undefined);
    for(let p=0;p<r.height;p++){const key=r.key+(p?'_upper':''),b=read(`${bp}/blocks/${key}.json`)['minecraft:block'];assert.equal(b.description.menu_category.category,'none');assert.equal(b.components['minecraft:collision_box'],true);assert.deepEqual(b.components['minecraft:movable'],{movement_type:'immovable'});assert.ok(b.components['mcpe_food:appliance']);assert.equal(b.components['minecraft:destruction_particles'].particle_count,0);assert.deepEqual(read(`${bp}/loot_tables/blocks/${key}.json`).pools,[]);}
  }
  for(const finish of ['rose_gold','white','black']){const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/ware_fridge_${finish}_mer.png`));assert.equal(mer.width,128);assert.ok(mer.pixels.every((v,i)=>i%4!==1||v===0));assert.equal(mer.pixels[0],finish==='rose_gold'?195:0);}
});

test('tea tray is one bounded nonedible display and Tieguanyin uses the original green-tea nutrition and both cups',()=>{
  assert.ok(teaTrayCubes().length<=256);const item=read(`${bp}/items/${teaTray.key}.json`)['minecraft:item'];assert.equal(item.description.menu_category.group,'mcpe_food:group_tableware');assert.equal(item.components['minecraft:food'],undefined);
  const tea=teaFoods[0],green=foods.find(f=>f.key==='green_tea');assert.equal(tea.recipe,undefined);assert.equal(tea.nutrition,green.nutrition);assert.equal(tea.saturation,green.saturation);assert.deepEqual(compatibleVessels(tea).map(v=>v.key),['glass','mug']);
  const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/ware_gongfu_tea_tray_mer.png`));assert.ok(mer.pixels.every((v,i)=>i%4===0||i%4===1?v===0:true));
});
