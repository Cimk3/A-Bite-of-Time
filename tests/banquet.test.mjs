import {patch082Props} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioGroups,scenarioProps,digitalScreens} from '../.build/scenario-catalog.js';
import {lifestyleItems} from '../.build/lifestyle-catalog.js';
import {restaurantAccessories} from '../.build/restaurant-catalog.js';
import {refrigerators} from '../.build/appliance-catalog.js';
import {electronics} from '../.build/electronics-catalog.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {categories,foods,dishes,displays,banquetFoods as newFoods,bottleProps,recipes,recipeCategory,id,vessels,cutlery} from '../.build/catalog.js';
import {foodCubes,bottleCubes,detailGeometry,modelBounds} from '../tools/detail-art.mjs';
import {advertisements,paperCups,tray,teaTray} from '../.build/decor-catalog.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const baseline=read('tests/fixtures/v0.3.0.json');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
test('0.3 IDs, UUIDs, cooking data, drops, crafting and crop states survive the upgrade',()=>{
  for(const kind of['items','blocks']){
    const now=new Set(readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier));
    for(const key of baseline[kind])assert.ok(now.has(key),key);
  }
  for(const[pack,uuids]of Object.entries(baseline.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),baseline.menuRecipes);
  for(const[file,sha]of Object.entries(baseline.loot))assert.equal(hash(`${bp}/loot_tables/blocks/${file}`),sha,file);
  for(const[file,sha]of Object.entries(baseline.crafting))assert.equal(hash(`${bp}/recipes/${file}`),sha,file);
  for(const[file,states]of Object.entries(baseline.cropStates))assert.deepEqual(read(`${bp}/blocks/${file}`)['minecraft:block'].description.states,states);
});
test('old tasting commands keep exactly their original series while new complete commands cover five categories',()=>{
  for(const[file,content]of Object.entries(baseline.functions).filter(([f])=>f.startsWith('tasting_')))assert.equal(readFileSync(`${bp}/functions/mcpe_food/${file}`,'utf8'),content,file);
  for(const key of Object.keys(categories)){
    const lines=readFileSync(`${bp}/functions/mcpe_food/tasting_all_${key}.mcfunction`,'utf8').trim().split('\n');
    assert.deepEqual(lines,[...dishes.filter(f=>f.category===key),...(key==='drink'?[...bottleProps,...paperCups]:[]),...(key==='chinese'?patch073Props.filter(d=>d.group==='chinese'):[])].map(f=>`give @s ${id(f.key)} 4`));
  }
});
test('creative inventory has five food groups plus private tableware, advertisement and electronics groups',()=>{
  const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories;
  assert.equal(groups.length,1);assert.equal(groups[0].category_name,'items');
  assert.deepEqual(groups[0].groups.map(g=>g.group_identifier.name),[...Object.keys(categories).map(k=>`mcpe_food:group_${k}`),'mcpe_food:group_tableware','mcpe_food:group_advertisements','mcpe_food:group_electronics','mcpe_food:group_restaurant_accessories','mcpe_food:group_office_stationery','mcpe_food:group_home_decor',...[...scenarioGroups,...patch074Groups,...patch072Groups].map(g=>'mcpe_food:group_'+g.key),'mcpe_food:group_government_equipment','mcpe_food:group_laboratory_equipment']);
  const all=groups[0].groups.flatMap(g=>g.items);assert.equal(new Set(all).size,all.length);
  assert.deepEqual([...all].sort(),[...dishes,...bottleProps,...paperCups,...vessels,...cutlery,tray,teaTray,...advertisements,...electronics,...refrigerators,...restaurantAccessories,...lifestyleItems,...scenarioProps,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch080Props,...patch082Props,...patch085Props].map(f=>id(f.key)).sort());
  for(const locale of['zh_CN','en_US']){const source=readFileSync(`${rp}/texts/${locale}.lang`,'utf8');for(const g of groups[0].groups)assert.ok(source.includes(`${g.group_identifier.name}=`));}
});
test('approved category counts and intentional cross-cuisine placements are exact',()=>{
  assert.deepEqual(Object.fromEntries(Object.keys(categories).map(k=>[k,foods.filter(f=>f.category===k).length])),{chinese:42,western:23,japanese:13,dessert:13,drink:11});
  for(const key of['fruit_platter','snow_pear_tremella','jujube_lotus_soup'])assert.equal(foods.find(f=>f.key===key).category,'chinese');
  assert.equal(foods.find(f=>f.key==='dorayaki').category,'japanese');assert.equal(foods.find(f=>f.key==='mung_bean_soup').category,'dessert');
  for(const key of['chicken_nuggets','fries','hotdog','boeuf_bourguignon'])assert.equal(foods.find(f=>f.key===key).category,'western');
  assert.equal(newFoods.length,21);assert.ok(newFoods.every(f=>!f.recipe));
  for(const r of recipes)assert.ok([...Object.keys(categories),'processing'].includes(recipeCategory(r)));
});
test('display bottles are standalone placeable props with only one self-drop and no eating or serving behavior',()=>{
  for(const p of bottleProps){
    const c=read(`${bp}/items/${p.key}.json`)['minecraft:item'].components;
    assert.equal(c['minecraft:block_placer'].block,id(p.key));assert.equal(c['minecraft:food'],undefined);assert.equal(c['minecraft:use_animation'],undefined);assert.ok(!dishes.some(f=>f.key===p.key));
    const drops=read(`${bp}/loot_tables/blocks/${p.key}.json`).pools;assert.equal(drops.length,1);assert.equal(drops[0].entries[0].name,id(p.key));assert.equal(drops[0].entries[0].functions[0].count,1);
    const b=read(`${bp}/blocks/${p.key}.json`)['minecraft:block'];assert.equal(b.permutations.length,4);assert.ok(b.components['mcpe_food:table']);assert.equal(b.components['minecraft:destruction_particles'].particle_count,0);
  }
});
test('new drinks use smaller glasses without buffs or extra returned containers',()=>{
  for(const f of newFoods.filter(f=>f.category==='drink')){
    assert.equal(f.vessel,'glass');const c=read(`${bp}/items/${f.key}.json`)['minecraft:item'].components;
    assert.equal(c['minecraft:use_animation'],'drink');assert.equal(c['minecraft:food'].effects,undefined);assert.equal(c['minecraft:food'].using_converts_to,undefined);
    const bounds=modelBounds(foodCubes(f));assert.ok(bounds.high[1]<8&&bounds.high[0]<2.4);
  }
});
test('new models and every material image use real 128px UVs within the geometry budget',()=>{
  for(const f of [...newFoods,...bottleProps]){
    const cubes=bottleProps.includes(f)?bottleCubes(f):foodCubes(f),g=detailGeometry(f.key,cubes)['minecraft:geometry'][0];assert.ok(g.bones[0].cubes.length<=256);
    const color=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/${bottleProps.includes(f)?'ware':'food'}_${f.key}.png`));assert.equal(color.width,128);assert.equal(color.height,128);
  }
  for(const p of bottleProps){const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/ware_${p.key}_mer.png`));assert.equal(mer.pixels[(16*128+16)*4],0);assert.equal(mer.pixels[(16*128+112)*4],255);}
  for(const f of newFoods){const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/food_${f.key}_mer.png`));assert.ok(mer.pixels.every((v,i)=>i%4===0||i%4===1?v===0:true));}
});
