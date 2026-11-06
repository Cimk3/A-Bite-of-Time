import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {FakeDimension, FakePlayer, ItemStack, state, system, reset, flush, interact} from './mock-server.mjs';
import {haoduScreen, patch082Props} from '../.build/patch-082-catalog.js';

registerHooks({resolve(specifier,context,next) {
  const mock={'@minecraft/server':'mock-server.mjs','@minecraft/server-ui':'mock-ui.mjs'}[specifier];
  return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);
}});
await import('../.build/main.js');
const {loadDecorRecords,reconcileDecor,removeDecor}=await import('../.build/decor-runtime.js');
flush();

const id=key=>'mcpe_food:'+key;
const screenId=id(haoduScreen.key);
const faces={
  north:{right:[-1,0],normal:[0,-1],code:1},
  east:{right:[0,1],normal:[1,0],code:2},
  south:{right:[1,0],normal:[0,1],code:3},
  west:{right:[0,-1],normal:[-1,0],code:4},
};
const records=()=>[...state.properties].filter(([key])=>key.startsWith('mcpe_food:decor:')).map(([,value])=>JSON.parse(value));
const tick=async()=>{flush();await new Promise(resolve=>setImmediate(resolve));flush();};
function load() {
  loadDecorRecords();
  while(state.queue.length)flush();
}
function setup() {
  reset();
  state.properties.clear();
  const d=new FakeDimension();
  load();
  return {d,p:new FakePlayer(d)};
}
function wall(d,face,support={x:15,y:0,z:15}) {
  const {right,normal}=faces[face],cells=[];
  for(let x=0;x<7;x++)for(let y=0;y<5;y++) {
    const back={x:support.x+x*right[0],y:support.y+y,z:support.z+x*right[1]};
    const front={x:back.x+normal[0],y:back.y,z:back.z+normal[1]};
    d.put('minecraft:stone',back);
    cells.push({back,front});
  }
  return {support,cells};
}
async function place(p,block,key,face='Up') {
  p.container.setItem(0,new ItemStack(id(key)));
  interact(p,block,true,face);
  await tick();
}

test('7×5 screen needs each of the 35 back and front cells in all four orientations',async()=>{
  for(const [face,{normal,code}] of Object.entries(faces)) {
    const {d,p}=setup();
    const {support,cells}=wall(d,face);
    p.location={x:support.x+.5+normal[0]*2,y:1,z:support.z+.5+normal[1]*2};
    for(const {back,front} of cells) {
      d.put('minecraft:air',back);
      await place(p,d.getBlock(support),haoduScreen.key,face);
      assert.equal(records().length,0);
      d.put('minecraft:stone',back);
      d.put('minecraft:stone',front);
      await place(p,d.getBlock(support),haoduScreen.key,face);
      assert.equal(records().length,0);
      assert.equal(p.container.count(screenId),1);
      d.put('minecraft:air',front);
    }
    await place(p,d.getBlock(support),haoduScreen.key,face);
    const [record]=records();
    assert.equal(record.definition,screenId);
    assert.equal(record.version,1);
    const [entity]=d.getEntities();
    assert.equal(entity.getProperty('mcpe_food:index'),13);
    assert.equal(entity.getProperty('mcpe_food:display_facing'),code);
    entity.remove();
    load();
    reconcileDecor();
    reconcileDecor();
    assert.deepEqual(records(),[record]);
    assert.equal(d.getEntities().length,1);
  }
});

test('cross-chunk recovery preserves the screen while backing is unavailable',async()=>{
  const {d,p}=setup();
  const {support,cells}=wall(d,'south');
  p.location={x:15.5,y:1,z:17.5};
  await place(p,d.getBlock(support),haoduScreen.key,'south');
  const [record]=records();
  const getBlock=d.getBlock.bind(d);
  d.getBlock=pos=>pos.x>=16?undefined:getBlock(pos);
  load();
  reconcileDecor();
  assert.deepEqual(records(),[record]);
  assert.equal(d.drops.length,0);
  d.getBlock=getBlock;
  d.put('minecraft:air',cells.at(-1).back);
  reconcileDecor();
  reconcileDecor();
  assert.equal(records().length,0);
  assert.equal(d.drops.length,1);
  assert.equal(d.getEntities().length,0);
});

test('7×5 overlap, failed spawn, and failed collection keep inventory and reservations consistent',async()=>{
  const {d,p}=setup();
  const {support}=wall(d,'south');
  const anchor=d.getBlock(support);
  p.location={x:15.5,y:1,z:17.5};
  await place(p,anchor,'wall_electric_meter','south');
  await place(p,anchor,haoduScreen.key,'south');
  assert.equal(records().length,1);
  assert.equal(p.container.count(screenId),1);
  removeDecor(records()[0],false);
  d.failSpawn=true;
  await place(p,anchor,haoduScreen.key,'south');
  assert.equal(records().length,0);
  assert.equal(p.container.count(screenId),1);
  d.failSpawn=false;
  await place(p,anchor,haoduScreen.key,'south');
  assert.equal(records().length,1);
  p.container.failOnce=true;
  state.responses.push({selection:0});
  interact(p,anchor,true,'south');
  await tick();
  assert.equal(records().length,1);
  assert.equal(d.getEntities().length,1);
  assert.equal(p.container.count(screenId),0);
  system.currentTick+=10;
  state.responses.push({selection:0});
  interact(p,anchor,true,'south');
  await tick();
  assert.equal(records().length,0);
  assert.equal(p.container.count(screenId),1);
});

test('mixed scene recovery validates each large screen once and reuses one entity per record',()=>{
  const {d}=setup();
  const saved=[];
  for(let i=0;i<80;i++) {
    const screen=i<12;
    const support=screen?{x:i*8,y:0,z:0}:{x:(i-12)%20,y:0,z:3+Math.floor((i-12)/20)};
    if(screen)wall(d,'south',support);
    else d.put('minecraft:stone',support);
    const record={version:1,uid:'mixed'+i,revision:0,dimension:d.id,support,
      kind:screen?'digital_ad':'surface',definition:screen?screenId:id(patch082Props[i%16].key),
      direction:'south',native:false,slots:[]};
    saved.push(record);
    state.properties.set('mcpe_food:decor:'+record.uid,JSON.stringify(record));
  }
  load();
  let reads=0,queries=0;
  const getBlock=d.getBlock.bind(d),getEntities=d.getEntities.bind(d);
  d.getBlock=pos=>{reads++;return getBlock(pos);};
  d.getEntities=query=>{queries++;assert.equal(query.maxDistance,8);return getEntities(query);};
  for(let i=0;i<100;i++) {
    reads=0;queries=0;
    reconcileDecor();
    assert.ok(queries<=2);
    assert.ok(reads<=140);
    if(i===0)assert.equal(reads,70*queries);
  }
  assert.equal(getEntities().length,80);
  assert.deepEqual(records(),saved);
  assert.equal(d.drops.length,0);
});

test('time budget still applies when the first recovery candidate is unloaded',()=>{
  const {d}=setup();
  for(let i=0;i<2;i++) {
    const uid='time'+i;
    state.properties.set('mcpe_food:decor:'+uid,JSON.stringify({version:1,uid,revision:0,
      dimension:d.id,support:{x:i,y:0,z:0},kind:'surface',definition:id('icu_ecmo'),
      direction:'south',native:false,slots:[]}));
  }
  load();
  let now=0,reads=0;
  const original=Date.now;
  Date.now=()=>now;
  d.getBlock=()=>{reads++;now+=5;return undefined;};
  try {reconcileDecor();} finally {Date.now=original;}
  assert.equal(reads,1);
  assert.equal(records().length,2);
});

test('all 16 props use the regular support, facing and whole-item retrieval path',async()=>{
  for(const prop of patch082Props) {
    const {d,p}=setup(),base=d.put('minecraft:stone',{x:0,y:0,z:0});
    p.location={x:3.5,y:1,z:.5};
    if(prop.height===2) {
      d.put('minecraft:stone',{x:0,y:2,z:0});
      await place(p,base,prop.key);
      assert.equal(records().length,0);
      d.put('minecraft:air',{x:0,y:2,z:0});
    }
    await place(p,base,prop.key);
    assert.equal(records().length,1);
    const [entity]=d.getEntities();
    assert.equal(entity.getProperty('mcpe_food:display_facing'),2);
    state.responses.push({selection:0});
    state.entityInteract({player:p,target:entity});
    await tick();
    assert.equal(records().length,0);
    assert.equal(p.container.count(id(prop.key)),1);
  }
});
