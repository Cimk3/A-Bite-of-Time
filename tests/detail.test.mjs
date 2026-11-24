import {patch097FoodKeys} from '../.build/patch-097-catalog.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {dishes,foods,displays,hotpots,bottleProps,vessels,cutlery,recipes,servings,id} from '../.build/catalog.js';
import {vesselCubes,modelBounds,paintedTexture,textureSpec,detailGeometry} from '../tools/detail-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),bp=path.join(root,'packs/FoodAndTable_BP'),rp=path.join(root,'packs/FoodAndTable_RP');
const read=(base,file)=>JSON.parse(readFileSync(path.join(base,file),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
test('0.2.0 item and block IDs remain present and all UUIDs are unchanged',()=>{
  const baseline=read(root,'tests/fixtures/v0.2.0.json');
  for(const kind of['items','blocks']){const now=new Set(readdirSync(path.join(bp,kind)).map(f=>read(bp,`${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier));for(const key of baseline[kind])assert.ok(now.has(key),key);}
  for(const[name,uuids]of Object.entries(baseline.uuids)){const m=read(root,`packs/${name}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
});
test('all original menu recipes, workbench recipes and legacy drops are byte-for-byte compatible',()=>{
  const old=read(root,'tests/fixtures/v0.2.0.json');assert.deepEqual(recipes.map(({key,station,inputs,output})=>({key,station,inputs,output})),old.menuRecipes);
  for(const[file,sha]of Object.entries(old.loot))assert.equal(hash(path.join(bp,'loot_tables/blocks',file)),sha,file);
  for(const[file,sha]of Object.entries(old.crafting))assert.equal(hash(path.join(bp,'recipes',file)),sha,file);
});
test('new creative content does not invent cooking recipes or duplicate egg tart',()=>{
  assert.equal(recipes.length,53);assert.equal(foods.filter(f=>f.key==='egg_tart').length,1);
  assert.equal(foods.filter(f=>!f.recipe).length,58);assert.ok(displays.every(f=>!f.recipe&&!f.edible));
  for(const f of dishes.filter(f=>!f.recipe))assert.equal(recipes.some(r=>r.key===f.key),false);
});
test('all meal, tableware and hotpot icons are true 128px assets',()=>{
  for(const item of [...dishes,...vessels,...cutlery,...hotpots,...bottleProps]){const bytes=readFileSync(path.join(rp,`textures/items/mcpe_food/${item.key}.png`));assert.equal(bytes.readUInt32BE(16),128,item.key);assert.equal(bytes.readUInt32BE(20),128,item.key);}
});
test('all display platters omit edible/use components; cooked dishes allow full-hunger tasting',()=>{
  for(const f of displays){const c=read(bp,`items/${f.key}.json`)['minecraft:item'].components;assert.equal(c['minecraft:food'],undefined);assert.equal(c['minecraft:use_animation'],undefined);}
  for(const f of foods){const c=read(bp,`items/${f.key}.json`)['minecraft:item'].components;assert.equal(c['minecraft:food'].can_always_eat,true);}
});
test('every vessel combination drops the actual vessel and one copy of its food',()=>{
  assert.equal(servings.length,332);
  for(const s of servings){const loot=read(bp,`loot_tables/blocks/${s.key}.json`);assert.deepEqual(loot.pools.map(p=>p.entries[0].name),[id(s.vessel.key),id(s.food.key)]);assert.ok(loot.pools.every(p=>p.entries[0].functions[0].count===1));}
});
test('vessel combinations share food textures while keeping a separate ware material',()=>{
  for(const f of dishes){const variants=servings.filter(s=>s.food.key===f.key),expected=f.category==='drink'?(f.key==='premium_red_wine'?3:2):['plate','bowl'].includes(vessels.find(v=>v.key===f.vessel).family)?3:1;assert.equal(variants.length,expected);
    for(const s of variants){const mats=read(bp,`blocks/${s.key}.json`)['minecraft:block'].components['minecraft:material_instances'];assert.equal(mats.food.texture,`mcpe_food_food_${f.key}`);assert.equal(mats.ware.texture,`mcpe_food_ware_${patch097FoodKeys.has(f.key)&&s.vessel.key===f.vessel?f.key:s.vessel.key}`);}}
});
test('cups shrink to 75-percent scale with appropriately smaller selection boxes',()=>{
  const glass=modelBounds(vesselCubes('glass')),mug=modelBounds(vesselCubes('mug'));
  assert.ok(glass.high[1]<=7.6);assert.ok(glass.high[0]-glass.low[0]<=4.6);assert.ok(mug.high[1]<=6.2);
  for(const key of['glass','mug']){const box=read(bp,`blocks/${key}.json`)['minecraft:block'].components['minecraft:selection_box'];assert.ok(box.size[1]<8);assert.ok(box.size[0]<8);}
});
test('128px geometry uses curved rotations and never exceeds the 256-cube budget',()=>{
  const report=read(root,'model-report.json');
  for(const m of report.models.filter(m=>m.resolution===128)){assert.ok(m.cubes<=256);const geo=read(rp,`models/blocks/mcpe_food/${m.key}.geo.json`)['minecraft:geometry'][0];assert.equal(geo.description.texture_width,128);}
  const geo=detailGeometry('bowl',vesselCubes('bowl'));assert.ok(geo['minecraft:geometry'][0].bones[0].cubes.some(c=>c.rotation?.some(n=>n!==0)));
});
test('painted texture UV islands contain actual surface patterns instead of nearest-neighbor enlargement',()=>{
  const tex=paintedTexture(textureSpec('peking_duck','food',['#a9542b','#eed9ae','#739654']));assert.equal(tex.width,128);
  const colors=new Set();for(let y=35;y<60;y++)for(let x=67;x<92;x++){const at=(y*128+x)*4;colors.add(Array.from(tex.pixels.slice(at,at+3)).join(','));}assert.ok(colors.size>15);
  const foodMer=decodeRGBA(readFileSync(path.join(rp,'textures/blocks/mcpe_food/food_peking_duck_mer.png')));assert.ok(foodMer.pixels.every((v,i)=>i%4!==0||v===0));
});
test('black/gold and burgundy palettes are independent and gold/copper are actually metallic',()=>{
  const black=decodeRGBA(readFileSync(path.join(rp,'textures/blocks/mcpe_food/ware_black_gold_plate.png'))),red=decodeRGBA(readFileSync(path.join(rp,'textures/blocks/mcpe_food/ware_burgundy_platter.png')));
  const at=(16*128+16)*4;assert.ok(red.pixels[at]>black.pixels[at]);
  for(const[key,x,y]of[['ware_black_gold_plate',112,16],['ware_copper_hotpot',16,16]]){const data=decodeRGBA(readFileSync(path.join(rp,`textures/blocks/mcpe_food/${key}_mer.png`)));assert.equal(data.pixels[(y*128+x)*4],255);assert.equal(data.pixels[(y*128+x)*4+1],0);}
});
test('hotpot tasting function delivers exactly the twelve approved scene pieces',()=>{
  const content=readFileSync(path.join(bp,'functions/mcpe_food/tasting_hotpot.mcfunction'),'utf8').trim().split('\n');assert.equal(content.length,12);assert.ok(content.some(s=>s.includes('copper_hotpot_empty')));assert.ok(content.some(s=>s.includes('copper_hotpot_broth')));
});
