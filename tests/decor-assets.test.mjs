import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {advertisements,adSize,paperCups,tray,teaTray,surfaceVisuals,trayFoods} from '../.build/decor-catalog.js';
import {vessels,cutlery,id,recipes,foods} from '../.build/catalog.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p,'utf8'));
test('0.4.2 IDs, UUIDs, recipe inputs, drop tables and crop states survive the update',()=>{
  const old=read('tests/fixtures/v0.4.2.json');for(const kind of['items','blocks']){const keys=new Set(readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier));for(const key of old[kind])assert.ok(keys.has(key),key);}
  for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),old.menuRecipes);
  for(const[file,sha]of Object.entries(old.loot))assert.equal(createHash('sha256').update(readFileSync(`${bp}/loot_tables/blocks/${file}`)).digest('hex'),sha,file);
  for(const[file,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${file}`)['minecraft:block'].description.states,states);
  assert.equal(foods.length,106);
});
test('all fifteen tableware items are in the items group with no construction duplicates',()=>{
  assert.equal(vessels.length+cutlery.length+2,15);
  for(const v of [...vessels,...cutlery,tray,teaTray]){const item=read(`${bp}/items/${v.key}.json`)['minecraft:item'],block=read(`${bp}/blocks/${v.key}.json`)['minecraft:block'];assert.deepEqual(item.description.menu_category,{category:'items',group:'mcpe_food:group_tableware'});assert.equal(block.description.menu_category.category,'none');}
});
test('twelve independently generated posters have thirty-six non-stretched sizes, bilingual masters and matching matte MER',()=>{
  assert.equal(advertisements.length,23);assert.equal(advertisements.filter(a=>a.key.includes('japanese')).length,2);
  for(const ad of advertisements){
    const color=decodeRGBA(readFileSync(`${rp}/textures/entity/mcpe_food/${ad.key}.png`)),mer=decodeRGBA(readFileSync(`${rp}/textures/entity/mcpe_food/${ad.key}_mer.png`));
    for(let size=0;size<3;size++){const[w,h]=adSize(ad,size);assert.equal(w/h,color.width/color.height);assert.ok(w<=6&&h<=6);}
    assert.equal(color.width,mer.width);assert.equal(color.height,mer.height);assert.ok(mer.pixels.every((v,i)=>i%4===0||i%4===1?v===0:true));
    if(ad.series==='city'||ad.series==='brand'){assert.ok(color.width<=256&&color.height<=256);}else assert.ok(color.width>=1024&&color.height>=1024);if(ad.series!=='city'&&ad.series!=='brand')assert.ok(readFileSync(`assets/posters/originals/${ad.key}.png`).length>100000);
  }
});
test('tray miniatures fit the whole scene budget and cover every plate dish including seven display platters',()=>{
  const report=read('display-report.json');assert.equal(trayFoods.length,73);assert.equal(trayFoods.filter(f=>!f.edible).length,7);assert.ok(report.trayCubes<=112);assert.ok(report.maxMiniCubes<=48);assert.ok(report.fullTrayCubeBudget<=256);
  assert.equal(report.surfaceDefinitions,surfaceVisuals.length);assert.equal(report.entityTypes,5);
});
test('paper cups are separate placeable displays with private branding and one self-drop',()=>{
  for(const p of paperCups){const item=read(`${bp}/items/${p.key}.json`)['minecraft:item'];assert.equal(item.components['minecraft:food'],undefined);assert.equal(item.components['minecraft:use_animation'],undefined);assert.equal(item.components['minecraft:block_placer'].block,id(p.key));assert.equal(item.description.menu_category.group,'mcpe_food:group_drink');const drops=read(`${bp}/loot_tables/blocks/${p.key}.json`).pools;assert.equal(drops.length,1);assert.equal(drops[0].entries[0].name,id(p.key));}
});
test('four kitchen models have no overlapping co-planar faces with the same outward normal',()=>{
  const axes={north:[2,0],south:[2,1],east:[0,1],west:[0,0],up:[1,1],down:[1,0]};
  for(const key of['prep_counter','stove','oven','drink_counter']){
    const cubes=read(`${rp}/models/blocks/mcpe_food/${key}.geo.json`)['minecraft:geometry'][0].bones.flatMap(b=>b.cubes??[]);
    for(let i=0;i<cubes.length;i++)for(let j=i+1;j<cubes.length;j++)for(const[face,[axis,side]]of Object.entries(axes)){
      if(!cubes[i].uv[face]||!cubes[j].uv[face])continue;
      const a=cubes[i],b=cubes[j],planeA=a.origin[axis]+a.size[axis]*side,planeB=b.origin[axis]+b.size[axis]*side;
      const overlap=Math.abs(planeA-planeB)<1e-6&&[0,1,2].filter(n=>n!==axis).every(n=>Math.min(a.origin[n]+a.size[n],b.origin[n]+b.size[n])-Math.max(a.origin[n],b.origin[n])>1e-6);
      assert.equal(overlap,false,`${key} cubes ${i}/${j} ${face}`);
    }
  }
});
