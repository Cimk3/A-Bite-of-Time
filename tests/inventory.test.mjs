import test from 'node:test';
import assert from 'node:assert/strict';
import { count, MenuSessions, planCraft, planInsert, planServe } from '../.build/inventory.js';
import { foods, dishes, displays, hotpots, bottleProps, materials, recipes, id, ingredient, crops, stations, cutlery, vessels } from '../.build/catalog.js';
const stack=(typeId,amount,maxAmount=64,plain=true)=>({typeId,amount,maxAmount,plain});
const max=key=>key==='minecraft:bucket'?16:key==='minecraft:glass_bottle'?64:foods.some(f=>id(f.key)===key)?16:64;
const recipe=(inputs,key='test',output=1)=>({key,inputs,output});
test('catalog has the exact approved content and unique stable IDs',()=>{
  assert.equal(foods.length,106);assert.equal(displays.length,8);assert.equal(hotpots.length,2);assert.equal(stations.length,4);assert.equal(crops.length,6);assert.equal(cutlery.length+vessels.length,13);
  assert.equal(foods.filter(f=>f.category==='western').length,23);assert.equal(foods.filter(f=>f.category==='japanese').length,13);
  assert.equal(foods.filter(f=>f.category==='chinese').length,46);assert.ok(foods.some(f=>f.key==='guo_bao_rou'));
  const items=[...dishes,...materials,...stations,...vessels,...cutlery,...hotpots,...bottleProps];assert.equal(new Set(items.map(x=>x.key)).size,items.length);
});
test('all menu outputs have defined items; special ingredients have no processing recipe',()=>{
  const outputs=new Set([...foods,...materials].map(x=>x.key));
  for(const r of recipes){assert.ok(outputs.has(r.key));assert.ok(r.inputs.length);assert.ok(r.output>0);for(const i of r.inputs)assert.ok(i.count>0);}
  for(const m of materials.filter(m=>m.creativeOnly))assert.ok(!recipes.some(r=>r.key===m.key));
});
test('craft consumes ingredients across stacks without mutating the input',()=>{
  const slots=[stack('minecraft:wheat',1),stack('minecraft:wheat',3),undefined],before=structuredClone(slots);
  const result=planCraft(slots,recipe([ingredient('minecraft:wheat',3)]),max);
  assert.equal(result.ok,true);assert.equal(count(result.slots,'minecraft:wheat'),1);assert.equal(count(result.slots,id('test')),1);assert.deepEqual(slots,before);
});
test('missing ingredients leave the whole original inventory intact',()=>{
  const slots=[stack('minecraft:wheat',2),undefined],before=structuredClone(slots);
  assert.deepEqual(planCraft(slots,recipe([ingredient('minecraft:wheat',3)]),max),{ok:false,reason:'missing'});assert.deepEqual(slots,before);
});
test('full inventory rejects crafting even if ingredients could be consumed',()=>{
  const slots=[stack('minecraft:wheat',64),stack('minecraft:stone',64)],before=structuredClone(slots);
  assert.deepEqual(planCraft(slots,recipe([ingredient('minecraft:wheat',1)]),max),{ok:false,reason:'full'});assert.deepEqual(slots,before);
});
test('consumed last ingredient slot can receive the output',()=>{
  const result=planCraft([stack('minecraft:wheat',1)],recipe([ingredient('minecraft:wheat')]),max);
  assert.ok(result.ok);assert.equal(result.slots[0].typeId,id('test'));
});
test('milk and water buckets are both returned exactly once',()=>{
  const result=planCraft([stack('minecraft:milk_bucket',1,1),stack('minecraft:water_bucket',1,1),undefined],recipe([ingredient('minecraft:milk_bucket'),ingredient('minecraft:water_bucket')]),max);
  assert.ok(result.ok);assert.equal(count(result.slots,'minecraft:bucket'),2);assert.equal(count(result.slots,id('test')),1);
});
test('returned bucket requires space and causes a complete rejection when blocked',()=>{
  const slots=[stack('minecraft:milk_bucket',1,1)],before=structuredClone(slots);
  assert.deepEqual(planCraft(slots,recipe([ingredient('minecraft:milk_bucket')]),max),{ok:false,reason:'full'});assert.deepEqual(slots,before);
});
test('honey bottle uses its explicit glass-bottle return',()=>{
  const r=recipes.find(f=>f.key==='char_siu');assert.equal(r.inputs.find(i=>i.item==='minecraft:honey_bottle').returns,'minecraft:glass_bottle');
  const slots=[...r.inputs.map(i=>stack(i.item,i.count)),undefined,undefined];
  const result=planCraft(slots,r,max);assert.ok(result.ok);assert.equal(count(result.slots,'minecraft:glass_bottle'),1);
});
test('processing yields four portions while returning only one milk bucket',()=>{
  const r=recipes.find(r=>r.key==='cream');const slots=[stack('minecraft:milk_bucket',1,1),stack('minecraft:sugar',1),undefined];
  const result=planCraft(slots,r,max);assert.ok(result.ok);assert.equal(count(result.slots,id('cream')),4);assert.equal(count(result.slots,'minecraft:bucket'),1);
});
test('output obeys stack limits and splits into free slots',()=>{
  const result=planInsert([stack(id('steak'),15,16),undefined,undefined],id('steak'),20,16);
  assert.ok(result.ok);assert.deepEqual(result.slots.map(s=>s.amount),[16,16,3]);
});
test('renamed or modified items are not merged with plain recipe output',()=>{
  const slots=[{...stack(id('steak'),1,16,false),token:0},undefined];
  const result=planInsert(slots,id('steak'),1,16);assert.ok(result.ok);assert.equal(result.slots[0].amount,1);assert.equal(result.slots[1].amount,1);assert.equal(result.slots[0].token,0);
});
test('serving consumes only the selected slot; last serving clears the hand',()=>{
  const original=[stack(id('steak'),3,16),stack(id('steak'),1,16)];
  const result=planServe(original,1,id('steak'));assert.ok(result.ok);assert.equal(result.slots[0].amount,3);assert.equal(result.slots[1],undefined);assert.equal(original[1].amount,1);
});
test('serving with a changed hand fails without consuming anything',()=>{
  assert.deepEqual(planServe([stack('minecraft:stone',1)],0,id('steak')),{ok:false,reason:'hand'});
});
test('serving then taking conserves the food count',()=>{
  const slots=[stack(id('green_tea'),4,16),undefined];const served=planServe(slots,0,id('green_tea'));assert.ok(served.ok);
  const taken=planInsert(served.slots,id('green_tea'),1,16);assert.ok(taken.ok);assert.equal(count(taken.slots,id('green_tea')),4);
});
test('one player has one active menu and each confirmation can claim only once',()=>{
  const sessions=new MenuSessions(),a=sessions.begin('A');assert.ok(a);assert.equal(sessions.begin('A'),undefined);
  assert.equal(sessions.claim('A',a),true);assert.equal(sessions.claim('A',a),false);
});
test('stale menu cannot cancel a newer menu; disconnect invalidates pending claims',()=>{
  const sessions=new MenuSessions(),old=sessions.begin('A');sessions.finish('A',old);const current=sessions.begin('A');
  sessions.finish('A',old);assert.equal(sessions.claim('A',current),true);
  const token=sessions.begin('A');sessions.finish('A');assert.equal(sessions.claim('A',token),false);
});
test('players have independent menu sessions',()=>{
  const sessions=new MenuSessions(),a=sessions.begin('A'),b=sessions.begin('B');assert.ok(a);assert.ok(b);assert.equal(sessions.claim('A',a),true);assert.equal(sessions.claim('B',b),true);
});
test('every approved recipe conserves all ingredient, output and return counts',()=>{
  for(const r of recipes){
    const input=r.inputs.map(i=>stack(i.item,i.count+2,i.item.endsWith('_bucket')?64:max(i.item)));
    const source=[...input,...Array(12).fill(undefined)],before=structuredClone(source);
    const result=planCraft(source,r,max);assert.ok(result.ok,r.key);assert.deepEqual(source,before);
    const keys=new Set([...r.inputs.map(i=>i.item),...r.inputs.flatMap(i=>i.returns?[i.returns]:[]),id(r.key)]);
    for(const key of keys){const consumed=r.inputs.filter(i=>i.item===key).reduce((n,i)=>n+i.count,0),returned=r.inputs.filter(i=>i.returns===key).reduce((n,i)=>n+i.count,0);
      assert.equal(count(result.slots,key),count(source,key)-consumed+returned+(key===id(r.key)?r.output:0),`${r.key}: ${key}`);}
  }
});
test('deterministic capacity stress test never mutates a rejected inventory',()=>{
  let seed=20261026;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let i=0;i<500;i++){
    const size=1+random()%12,slots=Array.from({length:size},()=>random()%3?stack('minecraft:wheat',1+random()%64):undefined);
    const before=structuredClone(slots),r=recipe([ingredient('minecraft:wheat',1+random()%20)]),result=planCraft(slots,r,max);
    assert.deepEqual(slots,before);if(result.ok){assert.equal(count(result.slots,'minecraft:wheat'),count(slots,'minecraft:wheat')-r.inputs[0].count);assert.equal(count(result.slots,id('test')),1);}
  }
});
