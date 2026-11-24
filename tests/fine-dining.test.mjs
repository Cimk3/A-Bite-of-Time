import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newFoods,foods,recipes,id} from '../.build/catalog.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
test('0.4.2 adds exactly seven edible Western dishes including brulee, without creating recipes',()=>{
  assert.deepEqual(newFoods.map(f=>f.zh),['惠灵顿牛排','香草烤羊排','野菌烩饭','奶油焗龙虾','鱼子酱配薄饼','焦糖布蕾','黑松露鹅肝']);
  assert.ok(newFoods.every(f=>f.category==='western'&&f.edible&&!f.recipe));assert.equal(foods.length,106);assert.equal(recipes.length,53);
});
test('new food PBR is nonmetallic and nonemissive, with glossy caviar and caramel inside private assets',()=>{
  for(const food of newFoods){
    const prefix=`${rp}/textures/blocks/mcpe_food/food_${food.key}`,color=decodeRGBA(readFileSync(`${prefix}.png`)),mer=decodeRGBA(readFileSync(`${prefix}_mer.png`));
    assert.deepEqual([color.width,color.height,mer.width,mer.height],[128,128,128,128]);
    for(let i=0;i<mer.pixels.length;i+=4){assert.equal(mer.pixels[i],0,food.key);assert.equal(mer.pixels[i+1],0,food.key);}
    if(food.key==='caviar_blini')assert.ok(mer.pixels[(80*128+16)*4+2]<100);
    if(food.key==='creme_brulee')assert.ok(mer.pixels[(48*128+112)*4+2]<100);
  }
});
