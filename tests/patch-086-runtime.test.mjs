import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {FakeDimension,FakePlayer,GameMode,ItemStack,state,flush,interact,reset} from './mock-server.mjs';

registerHooks({resolve(specifier,context,next){
  const mock={'@minecraft/server':'mock-server.mjs','@minecraft/server-ui':'mock-ui.mjs'}[specifier];
  return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);
}});
await import('../.build/main.js');
const {loadDecorRecords,reconcileDecor}=await import('../.build/decor-runtime.js');
flush();

const bed='mcpe_food:icu_bed';
const monitor='mcpe_food:icu_large_patient_monitor';
const records=()=>[...state.properties].filter(([key])=>key.startsWith('mcpe_food:decor:')).map(([,value])=>JSON.parse(value));
const tick=async()=>{flush();await new Promise(resolve=>setImmediate(resolve));flush();};
function setup(){
  reset();
  state.properties.clear();
  const dimension=new FakeDimension();
  loadDecorRecords();
  return [dimension,new FakePlayer(dimension)];
}
async function place(player,block,id){
  player.container.setItem(0,new ItemStack(id));
  interact(player,block);
  await tick();
}

test('ICU bed needs two supports in all four directions and leaves the adjacent columns free',async()=>{
  for(const [direction,dx,dz] of [['north',0,-1],['east',1,0],['south',0,1],['west',-1,0]]){
    const [d,p]=setup();
    p.mode=GameMode.Creative;
    p.location={x:.5+dx*2,y:1,z:.5+dz*2};
    const front=d.put('minecraft:stone',{x:0,y:0,z:0});
    await place(p,front,bed);
    assert.equal(records().length,0,direction);
    const back=d.put('minecraft:stone',{x:-dx,y:0,z:-dz});
    await place(p,front,bed);
    assert.equal(records()[0].direction,direction);
    assert.deepEqual(d.getEntities()[0].location,{x:.5-dx*.5,y:1,z:.5-dz*.5});
    assert.equal(interact(p,back).cancel,true);
    for(const side of [-1,1]){
      const adjacent=d.put('minecraft:stone',{x:dz*side,y:0,z:-dx*side});
      await place(p,adjacent,monitor);
    }
    assert.deepEqual(records().map(record=>record.definition),[bed,monitor,monitor]);
    p.container.setItem(0,undefined);
    state.responses.push({selection:0});
    assert.equal(interact(p,back).cancel,true);
    await tick();
    assert.deepEqual(records().map(record=>record.definition),[monitor,monitor]);
  }
});

test('an existing 0.8.5 bed keeps its owner and refreshes its selection box once',async()=>{
  const [d,p]=setup();
  p.location={x:.5,y:1,z:2.5};
  const front=d.put('minecraft:stone',{x:0,y:0,z:0});
  d.put('minecraft:stone',{x:0,y:0,z:-1});
  await place(p,front,bed);
  const saved=records(),[entity]=d.getEntities(),events=[];
  entity.setDynamicProperty('mcpe_food:shape','icu_bed');
  entity.triggerEvent=event=>events.push(event);
  loadDecorRecords();
  reconcileDecor();
  reconcileDecor();
  assert.deepEqual(records(),saved);
  assert.deepEqual(d.getEntities(),[entity]);
  assert.deepEqual(events,['mcpe_food:shape_icu_bed']);
});
