import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {foods,restaurantFoods as newFoods,recipes,categories} from '../.build/catalog.js';
const bp='packs/FoodAndTable_BP',read=p=>JSON.parse(readFileSync(p,'utf8')),old=read('tests/fixtures/v0.4.0.json');
for(const version of ['0.4.0','0.4.1'])test(`${version} saved IDs, UUIDs, crop states, recipes and all existing drops remain compatible`,()=>{
  const old=read(`tests/fixtures/v${version}.json`);
  for(const kind of['items','blocks']){const now=new Set(readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier));for(const key of old[kind])assert.ok(now.has(key),key);}
  for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),old.menuRecipes);
  for(const[folder,entries]of Object.entries({recipes:old.crafting,'loot_tables/blocks':old.loot}))for(const[file,sha]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${file}`)).digest('hex'),sha,file);
  for(const[file,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${file}`)['minecraft:block'].description.states,states);
  for(const[file,content]of Object.entries(old.functions).filter(([name])=>name.startsWith('tasting_')&&!name.startsWith('tasting_all_')&&name!=='tasting_new.mcfunction'))assert.equal(readFileSync(`${bp}/functions/mcpe_food/${file}`,'utf8'),content);
});
test('0.4.1 contains exactly the ten requested foods, categorized without adding recipes',()=>{
  assert.deepEqual(newFoods.map(f=>f.zh),['清蒸石斑鱼','白灼九节虾','拍黄瓜','上汤鲜蔬','提拉米苏','大福','千层酥','龙虾浓汤','蓝带鸡肉卷','香煎龙利鱼']);
  assert.deepEqual(Object.fromEntries(Object.keys(categories).map(k=>[k,foods.filter(f=>f.category===k).length])),{chinese:46,western:23,japanese:13,dessert:13,drink:11});
  assert.ok(newFoods.every(f=>f.edible&&!f.recipe));assert.equal(recipes.length,53);

});
