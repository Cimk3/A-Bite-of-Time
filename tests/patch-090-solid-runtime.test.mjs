import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {FakeDimension,FakePlayer,GameMode,ItemStack,BlockPermutation,state,flush,interact,reset} from './mock-server.mjs';
import {readFileSync} from 'node:fs';
import {patch090Props,patch090Walls,patch090PartId} from '../.build/patch-090-catalog.js';
import {patch090Cells} from '../.build/patch-090-grid.js';
import {nativePartIndex,oppositeDirection} from '../.build/patch-092-layout.js';
import {whole090Keys} from '../.build/patch-093-render.js';
import {screenNormal} from '../.build/device-facing.js';

registerHooks({resolve(specifier,context,next){
  const mock={'@minecraft/server':'mock-server.mjs','@minecraft/server-ui':'mock-ui.mjs'}[specifier];
  return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);
}});
await import('../.build/main.js');
const {loadDecorRecords,reconcileDecor,removeDecor}=await import('../.build/decor-runtime.js');
flush();

const records=()=>[...state.properties].filter(([key])=>key.startsWith('mcpe_food:decor:')).map(([,value])=>JSON.parse(value));
const tick=async()=>{flush();await new Promise(resolve=>setImmediate(resolve));flush();};
function setup(){
  reset();state.properties.clear();
  const dimension=new FakeDimension(),player=new FakePlayer(dimension);
  player.mode=GameMode.Creative;player.location={x:.5,y:1,z:2.5};
  loadDecorRecords();
  return {dimension,player};
}
async function place(player,block,key){
  player.container.setItem(0,new ItemStack('mcpe_food:'+key));
  interact(player,block);await tick();
}

test('three repaired objects keep one correctly centred whole display across four directions and reload',async()=>{
 for(const key of whole090Keys)for(const [dir,n] of Object.entries({north:{x:0,z:-1},south:{x:0,z:1},east:{x:1,z:0},west:{x:-1,z:0}})){
  const {dimension,player}=setup();player.location={x:.5+n.x*3,y:1,z:.5+n.z*3};
  for(let x=-7;x<=7;x++)for(let z=-7;z<=7;z++)dimension.put('minecraft:stone',{x,y:0,z});
  await place(player,dimension.getBlock({x:0,y:0,z:0}),key);
  const [r]=records(),spec=patch090Props.find(d=>d.key===key),cells=patch090Cells(spec,r.support,dir);
  const check=()=>{
   const es=dimension.getEntities();assert.equal(es.length,1,key+' '+dir);const e=es[0];assert.equal(e.getDynamicProperty('mcpe_food:part'),'whole');
   assert.deepEqual(e.location,{x:(Math.min(...cells.map(p=>p.x))+Math.max(...cells.map(p=>p.x)))/2+.5,y:1,z:(Math.min(...cells.map(p=>p.z))+Math.max(...cells.map(p=>p.z)))/2+.5});
   const normal=screenNormal(e.getRotation().y,0);assert.ok(normal.x*n.x+normal.z*n.z>.999);
  };
  check();loadDecorRecords();flush();for(let i=0;i<3;i++)reconcileDecor();check();
  player.container.setItem(0,undefined);state.responses.push({canceled:true});interact(player,dimension.getBlock(cells[0]));await tick();
  assert.equal(records().length,1);removeDecor(records()[0],false);assert.equal(dimension.getEntities().length,0);assert.equal(records().length,0);
 }
});

test('whole-display spawn failure restores native blocks and leaves no owner or display',async()=>{
 const {dimension,player}=setup();for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++)dimension.put('minecraft:stone',{x,y:0,z});
 dimension.failSpawn=true;await place(player,dimension.getBlock({x:0,y:0,z:0}),'police_file_cabinet');
 assert.equal(records().length,0);assert.equal(dimension.getEntities().length,0);
 for(const p of patch090Cells(patch090Props.find(d=>d.key==='police_file_cabinet'),{x:0,y:0,z:0},'south'))assert.equal(dimension.getBlock(p).typeId,'minecraft:air');
});

test('0.9.1 native placements resolve generated definitions in all four directions',async()=>{
 const original=BlockPermutation.resolve;
 const definitions=new Map();
 BlockPermutation.resolve=(key,states={})=>{
  if(key.startsWith('mcpe_food:')&&key.includes('_part_')){
   let b=definitions.get(key);
   if(!b){b=JSON.parse(readFileSync('packs/FoodAndTable_BP/blocks/'+key.slice(10)+'.json'))['minecraft:block'];definitions.set(key,b);}
   assert.equal(b.description.identifier,key);
   assert.ok(b.description.traits['minecraft:placement_direction'].enabled_states.includes('minecraft:cardinal_direction'));
   const box=b.components['minecraft:collision_box'];
   assert.ok(!Array.isArray(box),'compound collision format: '+key);
   if(box!==false)for(let k=0;k<3;k++)assert.ok(Number.isFinite(box.origin[k])&&box.size[k]>0&&box.origin[k]>=(k===1?0:-8)-.0001&&box.origin[k]+box.size[k]<=(k===1?16:8)+.0001,key);
   assert.ok(['north','south','east','west'].includes(states['minecraft:cardinal_direction']));
  }
  return original(key,states);
 };
 try{
  for(const spec of patch090Props.filter(d=>d.kind==='solid'))for(const [direction,angle] of [['south',180],['west',-90],['north',0],['east',90]]){
   const {dimension,player}=setup();player.getRotation=()=>({x:0,y:angle});player.location=({south:{x:.5,y:1,z:3.5},north:{x:.5,y:1,z:-2.5},east:{x:3.5,y:1,z:.5},west:{x:-2.5,y:1,z:.5}})[direction];
   for(let x=-7;x<=7;x++)for(let z=-7;z<=7;z++)dimension.put('minecraft:stone',{x,y:0,z});
   await place(player,dimension.getBlock({x:0,y:0,z:0}),spec.key);
   const [r]=records();assert.ok(r,spec.key+' '+direction+' '+player.actions.join(' '));
   assert.equal(r.direction,direction);
   for(const [i,pos] of patch090Cells(spec,r.support,direction).entries())assert.equal(dimension.getBlock(pos).typeId,patch090PartId(spec,i));
   removeDecor(r,false);assert.equal(records().length,0);
  }
 }finally{BlockPermutation.resolve=original;}
});

test('unregistered native parts fail before ownership publication or any world writes',async()=>{
 const {dimension,player}=setup(),support=dimension.put('minecraft:stone',{x:0,y:0,z:0});
 const original=BlockPermutation.resolve;
 BlockPermutation.resolve=(key,states)=>{if(key==='mcpe_food:park_lamp_part_2')throw Error('Unknown block type');return original(key,states);};
 try{await place(player,support,'park_lamp');}finally{BlockPermutation.resolve=original;}
 assert.equal(records().length,0);
 for(let y=1;y<=4;y++)assert.equal(dimension.getBlock({x:0,y,z:0}).typeId,'minecraft:air');
 assert.equal(player.container.count('mcpe_food:park_lamp'),1);
 assert.ok(player.actions.some(s=>s.includes('park_lamp_part_2')));
});

test('old computer facing migrates once without moving its two-cell footprint or display centre',async()=>{
 const {dimension}=setup();
 for(let x=0;x<2;x++)dimension.put('minecraft:stone',{x,y:0,z:0});
 const old={version:1,uid:'old_computer',revision:3,dimension:dimension.id,support:{x:0,y:0,z:0},kind:'surface',definition:'mcpe_food:police_monitoring_computer',direction:'south',yaw:0,native:false,slots:[null,null,null]};
 state.properties.set('mcpe_food:decor:old_computer',JSON.stringify(old));
 loadDecorRecords();flush();reconcileDecor();
 const [fixed]=records();assert.equal(fixed.version,1);assert.equal(fixed.direction,old.direction);
 assert.deepEqual(fixed.support,old.support);assert.equal(fixed.modelRevision,1);assert.equal(fixed.yaw,-180);assert.equal(fixed.revision,4);
 assert.deepEqual(dimension.getEntities()[0].location,{x:1,y:1,z:.5});
 loadDecorRecords();flush();reconcileDecor();assert.deepEqual(records(),[fixed]);
 assert.equal(dimension.getEntities().length,1);
});

function legacyCabinet(direction){
 const ctx=setup(),spec=patch090Props.find(d=>d.key==='home_display_cabinet');
 const r={version:1,uid:'legacy_cabinet',revision:0,dimension:ctx.dimension.id,support:{x:0,y:0,z:0},kind:'solid090',definition:'mcpe_food:'+spec.key,direction,native:false,slots:['mcpe_food:glass','mcpe_food:cafe_mug',null,null,null,null]};
 const cells=patch090Cells(spec,r.support,direction,true);
 for(const [i,p] of cells.entries()){
  if(p.y===1)ctx.dimension.put('minecraft:stone',{...p,y:0});
  ctx.dimension.put(patch090PartId(spec,i),p,{'minecraft:cardinal_direction':direction});
 }
 state.properties.set('mcpe_food:decor:'+r.uid,JSON.stringify(r));
 return {...ctx,r,spec,cells};
}
test('0.9.0 and 0.9.1 native cabinets correct inside the original footprint in every direction',()=>{
 for(const direction of ['north','east','south','west']){
  const {dimension,r,spec,cells}=legacyCabinet(direction);
  loadDecorRecords();flush();reconcileDecor();
  const [fixed]=records();assert.equal(fixed.version,1);assert.equal(fixed.direction,direction);assert.deepEqual(fixed.support,r.support);
  assert.equal(fixed.nativeFacing,'reversed');assert.equal(fixed.nativePending,undefined);assert.deepEqual(fixed.slots,r.slots);
  for(const [i,p] of cells.entries()){
   const b=dimension.getBlock(p);assert.equal(b.typeId,patch090PartId(spec,nativePartIndex(spec,i,true,direction)));
   assert.equal(b.permutation.getState('minecraft:cardinal_direction'),oppositeDirection[direction]);
  }
  assert.equal(dimension.getEntities().length,2);assert.equal(dimension.drops.length,0);
  loadDecorRecords();flush();reconcileDecor();assert.deepEqual(records(),[fixed]);assert.equal(dimension.getEntities().length,2);
 }
});
test('native correction waits for unloaded cells and rolls back failed rewrites without losing contents',()=>{
 const {dimension,cells}=legacyCabinet('east'),get=dimension.getBlock.bind(dimension);
 const old=cells.map(p=>get(p).permutation);
 dimension.getBlock=p=>p.y===2?undefined:get(p);
 loadDecorRecords();flush();reconcileDecor();assert.equal(records()[0].nativePending,true);
 assert.deepEqual(cells.map(p=>get(p).permutation),old);assert.equal(dimension.drops.length,0);
 dimension.getBlock=get;
 const bad=get(cells[2]),set=bad.setPermutation.bind(bad);let fail=true;
 bad.setPermutation=p=>{if(fail){fail=false;throw Error('repair write failed');}set(p);};
 reconcileDecor();assert.equal(records()[0].nativePending,true);assert.deepEqual(cells.map(p=>get(p).permutation),old);
 reconcileDecor();assert.equal(records()[0].nativePending,undefined);
 assert.equal(records()[0].slots.filter(Boolean).length,2);assert.equal(dimension.getEntities().length,2);assert.equal(dimension.drops.length,0);
});
test('all 15 surface props face the placer in four directions regardless of camera yaw',async()=>{
 const viewers={north:{x:.5,y:1,z:-2.5},east:{x:3.5,y:1,z:.5},south:{x:.5,y:1,z:3.5},west:{x:-2.5,y:1,z:.5}};
 const expected={north:1,east:2,south:3,west:4},opposite={1:3,2:4,3:1,4:2};
 for(const spec of patch090Props.filter(d=>d.kind==='surface'))for(const [dir,pos] of Object.entries(viewers)){
  const {dimension,player}=setup();player.location=pos;player.getRotation=()=>({x:0,y:37});
  for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++)dimension.put('minecraft:stone',{x,y:0,z});
  await place(player,dimension.getBlock({x:0,y:0,z:0}),spec.key);
  assert.equal(records().length,1,spec.key+' '+dir);
  const e=dimension.getEntities()[0];assert.ok(e,spec.key);
  assert.equal(e.getProperty('mcpe_food:display_facing'),spec.placementFront===180?opposite[expected[dir]]:expected[dir],spec.key+' '+dir);
 }
});
test('all 12 wall items require full backing and clear front cells on every mounting face',async()=>{
 const normals={north:{x:0,y:0,z:-1},east:{x:1,y:0,z:0},south:{x:0,y:0,z:1},west:{x:-1,y:0,z:0}};
 const rights={north:{x:-1,z:0},east:{x:0,z:1},south:{x:1,z:0},west:{x:0,z:-1}};
 for(const spec of patch090Walls)for(const dir of Object.keys(normals)){
  const {dimension,player}=setup(),n=normals[dir],r=rights[dir];player.location={x:.5+n.x*3,y:1,z:.5+n.z*3};
  for(let x=0;x<spec.width;x++)for(let y=0;y<spec.height;y++)dimension.put('minecraft:stone',{x:r.x*x,y,z:r.z*x});
  const last={x:r.x*(spec.width-1),y:Math.ceil(spec.height)-1,z:r.z*(spec.width-1)};
  player.container.setItem(0,new ItemStack('mcpe_food:'+spec.key));
  dimension.put('minecraft:air',last);interact(player,dimension.getBlock({x:0,y:0,z:0}),true,dir);await tick();assert.equal(records().length,0);
  dimension.put('minecraft:stone',last);const front={x:last.x+n.x,y:last.y,z:last.z+n.z};dimension.put('minecraft:stone',front);
  interact(player,dimension.getBlock({x:0,y:0,z:0}),true,dir);await tick();assert.equal(records().length,0);
  dimension.put('minecraft:air',front);interact(player,dimension.getBlock({x:0,y:0,z:0}),true,dir);await tick();
  assert.equal(records().length,1,spec.key+' '+dir);assert.equal(records()[0].direction,dir);
 }
});

test('four-block lamp places and removes its owned parts as one object',async()=>{
  const {dimension,player}=setup(),support=dimension.put('minecraft:stone',{x:0,y:0,z:0});
  await place(player,support,'park_lamp');
  const [record]=records();
  assert.equal(record.kind,'solid090');
  for(let y=1;y<=4;y++)assert.equal(dimension.getBlock({x:0,y,z:0}).typeId,'mcpe_food:park_lamp_part_'+(y-1));
  removeDecor(record,false);
  assert.equal(records().length,0);
  for(let y=1;y<=4;y++)assert.equal(dimension.getBlock({x:0,y,z:0}).typeId,'minecraft:air');
});

test('placement rejects blocked space and rolls back a failed part write',async()=>{
  const {dimension,player}=setup(),support=dimension.put('minecraft:stone',{x:0,y:0,z:0});
  dimension.put('minecraft:stone',{x:0,y:3,z:0});
  await place(player,support,'park_lamp');
  assert.equal(records().length,0);
  const failed=dimension.put('minecraft:air',{x:0,y:3,z:0}),set=failed.setPermutation.bind(failed);
  let fail=true;
  failed.setPermutation=permutation=>{if(fail){fail=false;throw new Error('simulated write failure');}set(permutation);};
  await place(player,support,'park_lamp');
  assert.equal(records().length,0);
  for(let y=1;y<=4;y++)assert.equal(dimension.getBlock({x:0,y,z:0}).typeId,'minecraft:air');
});

test('unloaded upper parts preserve the owner until they become available',async()=>{
  const {dimension,player}=setup(),support=dimension.put('minecraft:stone',{x:0,y:0,z:0});
  await place(player,support,'park_lamp');
  const saved=records(),get=dimension.getBlock.bind(dimension);
  dimension.getBlock=position=>position.y===4?undefined:get(position);
  reconcileDecor();
  removeDecor(saved[0],false);
  assert.deepEqual(records(),saved);
  dimension.getBlock=get;
  removeDecor(saved[0],false);
  assert.equal(records().length,0);
});

test('display cabinet inserts one item and returns it through its slot menu',async()=>{
 const {dimension,player}=setup();
 for(let x=0;x<3;x++)dimension.put('minecraft:stone',{x,y:0,z:0});
 await place(player,dimension.getBlock({x:0,y:0,z:0}),'home_display_cabinet');
 const [r]=records();assert.equal(r.slots.length,6);
 player.container.setItem(0,new ItemStack('mcpe_food:glass',2));
 state.responses.push({selection:0});
 interact(player,dimension.getBlock({x:0,y:1,z:0}));await tick();
 assert.equal(records()[0].slots[0],'mcpe_food:glass');
 assert.equal(player.container.count('mcpe_food:glass'),1);
 player.container.setItem(0,undefined);reset();
 state.responses.push({selection:0});
 interact(player,dimension.getBlock({x:0,y:1,z:0}));await tick();
 assert.equal(records()[0].slots[0],null);
 assert.equal(player.container.count('mcpe_food:glass'),1);
});

test('a three-seat bench accepts only three concurrent riders',async()=>{
 const {dimension,player}=setup();
 for(let x=0;x<3;x++)dimension.put('minecraft:stone',{x,y:0,z:0});
 const spawn=dimension.spawnEntity.bind(dimension);
 dimension.spawnEntity=(type,position)=>{
  const e=spawn(type,position);
  if(type==='mcpe_food:seat090_display'){
   const riders=[];
   e.getComponent=()=>({addRider:rider=>{if(riders.length)return false;riders.push(rider);return true;},getRiders:()=>riders,ejectRiders:()=>{riders.length=0;}});
  }
  return e;
 };
 await place(player,dimension.getBlock({x:0,y:0,z:0}),'park_bench');
 player.container.setItem(0,undefined);
 for(let i=0;i<4;i++){
  const visitor=i?new FakePlayer(dimension):player;
  visitor.mode=GameMode.Creative;
  interact(visitor,dimension.getBlock({x:0,y:1,z:0}));await tick();
 }
 assert.equal(dimension.getEntities().filter(e=>e.typeId==='mcpe_food:seat090_display').length,3);
 assert.equal(new Set(dimension.getEntities().map(e=>e.getDynamicProperty('mcpe_food:part'))).size,3);
});
test('benches and booths seat riders at cushion height facing the correct direction',async()=>{
 const normals={north:{x:0,z:-1},east:{x:1,z:0},south:{x:0,z:1},west:{x:-1,z:0}};
 for(const key of ['park_bench','cafe_booth'])for(const [dir,n] of Object.entries(normals)){
  const {dimension,player}=setup();player.location={x:.5+n.x*3,y:1,z:.5+n.z*3};
  for(let x=-4;x<=4;x++)for(let z=-4;z<=4;z++)dimension.put('minecraft:stone',{x,y:0,z});
  const spawn=dimension.spawnEntity.bind(dimension),riderLists=[];
  dimension.spawnEntity=(type,pos)=>{const e=spawn(type,pos);if(type==='mcpe_food:seat090_display'){const riders=[];riderLists.push(riders);e.getComponent=()=>({getRiders:()=>riders,addRider:r=>{riders.push(r);return true;}});}return e;};
  await place(player,dimension.getBlock({x:0,y:0,z:0}),key);player.container.setItem(0,undefined);
  const count=key==='park_bench'?3:4;
  for(let i=0;i<count;i++){
   const visitor=i?new FakePlayer(dimension):player;visitor.mode=GameMode.Creative;
   interact(visitor,dimension.getBlock({x:0,y:1,z:0}));await tick();
  }
  const seats=dimension.getEntities().filter(e=>e.typeId==='mcpe_food:seat090_display');assert.equal(seats.length,count);
  seats.forEach((e,i)=>{
   assert.ok(Math.abs(e.location.y-(1+(key==='park_bench'?7.2:7)/16))<.0001);
   const a=e.getRotation().y*Math.PI/180,forward={x:-Math.sin(a),z:Math.cos(a)};
   const target=key==='park_bench'?n:i<2?{x:n.z,z:-n.x}:{x:-n.z,z:n.x};
   assert.ok(forward.x*target.x+forward.z*target.z>.999,key+' '+dir+' seat '+i);
  });
  riderLists.forEach(list=>list.length=0);state.intervals.forEach(fn=>fn());flush();
  assert.equal(dimension.getEntities().filter(e=>e.typeId==='mcpe_food:seat090_display').length,0);
 }
});

async function cabinet(){
 const ctx=setup();
 for(let x=0;x<3;x++)ctx.dimension.put('minecraft:stone',{x,y:0,z:0});
 await place(ctx.player,ctx.dimension.getBlock({x:0,y:0,z:0}),'home_display_cabinet');
 return {...ctx,block:ctx.dimension.getBlock({x:0,y:1,z:0})};
}
test('cancelled cabinet menus and named items preserve inventory and slots',async()=>{
 const {dimension,player,block}=await cabinet();
 player.container.setItem(0,new ItemStack('mcpe_food:glass',2));
 state.responses.push({canceled:true});interact(player,block);await tick();
 assert.equal(player.container.count('mcpe_food:glass'),2);
 assert.ok(records()[0].slots.every(v=>v===null));
 reset();const named=new ItemStack('mcpe_food:glass',2);named.nameTag='keep this name';
 player.container.setItem(0,named);interact(player,block);await tick();
 assert.equal(player.container.getItem(0).nameTag,'keep this name');
 assert.ok(records()[0].slots.every(v=>v===null));
 assert.equal(dimension.getEntities().length,0);
});
test('display spawn failure rolls back the cabinet inventory and persisted contents',async()=>{
 const {dimension,player,block}=await cabinet();
 player.container.setItem(0,new ItemStack('mcpe_food:glass',2));dimension.failSpawn=true;
 state.responses.push({selection:0});interact(player,block);await tick();
 assert.equal(player.container.count('mcpe_food:glass'),2);
 assert.ok(records()[0].slots.every(v=>v===null));
 assert.equal(dimension.getEntities().length,0);
});
test('whole cabinet refund rejects insufficient space without losing its contents',async()=>{
 const {player,block}=await cabinet();
 for(const [i,key] of ['glass','cafe_mug'].entries()){
  reset();player.container.setItem(0,new ItemStack('mcpe_food:'+key));
  state.responses.push({selection:i});interact(player,block);await tick();
 }
 const before=records();
 for(let i=1;i<player.container.size;i++)player.container.setItem(i,new ItemStack('minecraft:stone',64));
 player.container.setItem(0,undefined);reset();state.responses.push({selection:6});
 interact(player,block);await tick();
 assert.deepEqual(records(),before);
 assert.equal(player.container.getItem(0),undefined);
 assert.equal(player.container.count('minecraft:stone'),35*64);
});
test('cabinet contents and occupied display survive a record reload without duplication',async()=>{
 const {dimension,player,block}=await cabinet();
 player.container.setItem(0,new ItemStack('mcpe_food:glass',2));
 state.responses.push({selection:0});interact(player,block);await tick();
 const before=records();loadDecorRecords();flush();reconcileDecor();
 assert.deepEqual(records(),before);
 assert.equal(player.container.count('mcpe_food:glass'),1);
 assert.equal(dimension.getEntities().length,1);
});
test('clicking a cabinet display opens its slots and creative destruction refunds contents once',async()=>{
 const {dimension,player,block}=await cabinet();
 player.container.setItem(0,new ItemStack('mcpe_food:glass',2));
 state.responses.push({selection:0});interact(player,block);await tick();
 player.container.setItem(0,undefined);reset();
 const target=dimension.getEntities()[0];
 state.responses.push({canceled:true});
 state.entityInteract({player,target,cancel:false});await tick();
 assert.equal(state.forms[0].buttons.length,7);
 assert.equal(records()[0].slots[0],'mcpe_food:glass');
 state.breakBlock({player,block,cancel:false});await tick();
 assert.equal(records().length,0);
 assert.equal(dimension.drops.filter(d=>d.item.typeId==='mcpe_food:glass').length,1);
 state.breakBlock({player,block,cancel:false});await tick();
 assert.equal(dimension.drops.filter(d=>d.item.typeId==='mcpe_food:glass').length,1);
});
