import {fixedLaptopKeys} from '../.build/electronics-catalog.js';
import {facingFromYaw} from '../.build/device-facing.js';
import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system,world} from './mock-server.mjs';
registerHooks({resolve(specifier,context,next){const mock=specifier==='@minecraft/server'?'mock-server.mjs':specifier==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);}});
await import('../.build/main.js');
const {removeDecor,reconcileDecor,loadDecorRecords,applianceTick}=await import('../.build/decor-runtime.js');
const {screenNormal}=await import('../.build/device-facing.js');
const {refrigerators}=await import('../.build/appliance-catalog.js');
const {surfaceHeight}=await import('../.build/supports.js');
const {electronics}=await import('../.build/electronics-catalog.js');
const idle=()=>new Promise(resolve=>setImmediate(resolve));
async function tick(){flush();await idle();flush();await idle();}
await tick();
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
afterEach(()=>{for(const r of saved())removeDecor(r,false);state.responses=[];});
function setup(support='minecraft:stone',states={}){reset();const dimension=new FakeDimension(),player=new FakePlayer(dimension),base=dimension.put(support,{x:0,y:0,z:0},states);return{dimension,player,base};}
async function place(player,base,key){player.container.setItem(0,new ItemStack(`mcpe_food:${key}`));interact(player,base);await tick();return saved()[0];}
function entityFor(d,r,part='base'){return d.getEntities().find(e=>e.getDynamicProperty('mcpe_food:owner')===r.uid&&e.getDynamicProperty('mcpe_food:part')===part);}
async function useEntity(player,target,selection){if(selection!==undefined)state.responses.push({selection});const e={player,target,cancel:false};state.entityInteract(e);await tick();return e;}
test('support heights cover ordinary/chiseled bookshelves and upper/lower/double slab states',()=>{
  const{dimension}=setup();
  for(const[type,states,height]of[['minecraft:bookshelf',{},1],['minecraft:chiseled_bookshelf',{},1],['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'},.5],['minecraft:normal_stone_slab',{'top_slot_bit':true},1],['minecraft:cut_copper_slab',{'minecraft:vertical_half':'top'},1],['minecraft:oak_double_slab',{},1],['minecraft:oak_stairs',{},0]])assert.equal(surfaceHeight(dimension.put(type,{x:2,y:0,z:0},states)),height,type);
});
test('lower slab keeps the original block while a cup sits at its true surface height',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab',{'minecraft:vertical_half':'bottom'}),r=await place(player,base,'glass');
  assert.equal(base.typeId,'minecraft:oak_slab');assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,'minecraft:air');assert.equal(player.container.count('mcpe_food:glass'),0);assert.equal(entityFor(dimension,r).location.y,.5);
});
test('bookcase placement suppresses book use and preserves actual vessel through low-surface serving',async()=>{
  const{dimension,player,base}=setup('minecraft:chiseled_bookshelf');await place(player,base,'black_gold_plate');const r=saved()[0],e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:steak_on_black_gold_plate');
  system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:black_gold_plate');assert.equal(player.container.count('mcpe_food:steak'),1);assert.equal(base.typeId,'minecraft:chiseled_bookshelf');
});
test('wine glass accepts premium red wine, rejects cola, and returns its own empty stemware',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'wine_glass'),e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:cola'));await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:wine_glass');assert.equal(player.container.count('mcpe_food:cola'),1);
  player.container.setItem(0,new ItemStack('mcpe_food:premium_red_wine'));system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:premium_red_wine_on_wine_glass');
  system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:wine_glass');assert.equal(player.container.count('mcpe_food:premium_red_wine'),1);
});
test('a one-cell tray holds three independent plate dishes and keeps display-only food nonconsumable',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'triple_tray'),e=entityFor(dimension,r);
  const foods=['steak','sushi_platter','beef_slices'];
  for(let i=0;i<3;i++){player.container.setItem(0,new ItemStack(`mcpe_food:${foods[i]}`));system.currentTick+=10;await useEntity(player,e,i);}
  assert.deepEqual(saved()[0].slots,foods.map(k=>'mcpe_food:'+k));assert.equal(dimension.getEntities().length,4);
  system.currentTick+=10;await useEntity(player,e,1);assert.equal(player.container.count('mcpe_food:sushi_platter'),1);assert.equal(saved()[0].slots[0],'mcpe_food:steak');assert.equal(saved()[0].slots[1],null);assert.equal(player.container.count('mcpe_food:plate'),0);
});
test('native tray uses one block, and losing support drops exactly the tray plus its filled slots',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'triple_tray');assert.equal(r.native,true);const block=dimension.getBlock({x:0,y:1,z:0});assert.equal(block.typeId,'mcpe_food:triple_tray');
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));state.responses=[{selection:2}];interact(player,block);await tick();base.setPermutation({typeId:'minecraft:air',getAllStates:()=>({})});reconcileDecor();
  assert.equal(saved().length,0);assert.deepEqual(dimension.drops.map(d=>d.item.typeId).sort(),['mcpe_food:steak','mcpe_food:triple_tray']);assert.equal(dimension.getEntities().length,0);
});
test('an engine onPlace callback during scripted placement reuses the same persisted tray',async()=>{
  const{dimension,player,base}=setup(),target=dimension.getBlock({x:0,y:1,z:0}),original=target.setPermutation.bind(target);
  target.setPermutation=p=>{original(p);if(p.typeId==='mcpe_food:triple_tray')state.components.get('mcpe_food:table').onPlace({block:target});};
  await place(player,base,'triple_tray');assert.equal(saved().length,1);assert.equal(saved()[0].definition,'mcpe_food:triple_tray');assert.equal(player.container.count('mcpe_food:triple_tray'),0);
});
test('tray menus reject wrong dish type, occupied slots, cancellations and changed held food',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'triple_tray'),e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:beef_noodle_soup'));await useEntity(player,e,0);assert.deepEqual(saved()[0].slots,[null,null,null]);state.responses=[];
  player.container.setItem(0,new ItemStack('mcpe_food:steak',2));system.currentTick+=10;state.responses=[{canceled:true}];await useEntity(player,e);assert.equal(player.container.count('mcpe_food:steak'),2);
  system.currentTick+=10;await useEntity(player,e,0);assert.equal(player.container.count('mcpe_food:steak'),1);system.currentTick+=10;await useEntity(player,e,0);assert.equal(player.container.count('mcpe_food:steak'),1);
  let resolve;state.responses=[new Promise(r=>resolve=r)];system.currentTick+=10;const event={player,target:e,cancel:false};state.entityInteract(event);await tick();player.container.setItem(0,new ItemStack('mcpe_food:cookies'));resolve({selection:1});await tick();assert.equal(saved()[0].slots[1],null);assert.equal(player.container.count('mcpe_food:cookies'),1);
});
test('two players cannot retrieve the same tray serving through concurrent menus',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'triple_tray'),e=entityFor(dimension,r);player.container.setItem(0,new ItemStack('mcpe_food:steak'));await useEntity(player,e,0);
  const other=new FakePlayer(dimension);system.currentTick+=10;state.responses=[{selection:0},{selection:0}];state.entityInteract({player,target:e,cancel:false});state.entityInteract({player:other,target:e,cancel:false});await tick();assert.equal(player.container.count('mcpe_food:steak')+other.container.count('mcpe_food:steak'),1);assert.equal(saved()[0].slots[0],null);
});
test('display-spawn failure rolls back food inventory and the saved tray revision',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'triple_tray'),block=dimension.getBlock({x:0,y:1,z:0});dimension.failSpawn=true;
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));state.responses=[{selection:0}];interact(player,block);await tick();assert.equal(player.container.count('mcpe_food:steak'),1);assert.deepEqual(saved()[0].slots,[null,null,null]);assert.equal(saved()[0].revision,r.revision);dimension.failSpawn=false;
});
test('blocked space does not consume a surface item or replace the slab',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab');dimension.put('minecraft:stone',{x:0,y:1,z:0});await place(player,base,'pepsi_paper_cup');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:pepsi_paper_cup'),1);assert.equal(base.typeId,'minecraft:oak_slab');
});
test('an existing filled block migrates to a lower slab without losing its serving, vessel or direction',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),block=dimension.put('mcpe_food:premium_red_wine_serving',{x:0,y:1,z:0},{'minecraft:cardinal_direction':'west'});
  state.components.get('mcpe_food:table').onTick({block});const r=saved()[0];assert.equal(block.typeId,'minecraft:air');assert.equal(base.typeId,'minecraft:oak_slab');assert.equal(r.definition,'mcpe_food:premium_red_wine_serving');assert.equal(r.direction,'west');
  await useEntity(player,entityFor(dimension,r));assert.equal(player.container.count('mcpe_food:premium_red_wine'),1);assert.equal(saved()[0].definition,'mcpe_food:glass');
});
test('slab completion raises the same display and missing/unloaded chunks never duplicate content',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'glass'),e=entityFor(dimension,r);base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assert.equal(e.location.y,1);
  dimension.unloaded=true;reconcileDecor();assert.equal(saved().length,1);assert.equal(dimension.drops.length,0);dimension.unloaded=false;
  e.remove();loadDecorRecords();reconcileDecor();assert.equal(dimension.getEntities().length,1);assert.equal(entityFor(dimension,r).location.y,1);
  const duplicate=dimension.spawnEntity('mcpe_food:surface_display',{x:0,y:1,z:0});duplicate.setDynamicProperty('mcpe_food:owner',r.uid);duplicate.setDynamicProperty('mcpe_food:part','base');reconcileDecor();assert.equal(dimension.getEntities().length,1);
});
function wall(d,w=6,h=3){for(let x=0;x<w;x++)for(let y=0;y<h;y++)d.put('minecraft:stone',{x:-x,y,z:0});return d.getBlock({x:0,y:0,z:0});}
test('advertisement chooses a size, keeps its original wall, and resizes without stretching its saved aspect',async()=>{
  const{dimension,player}=setup();const base=wall(dimension);player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington'));state.responses=[{selection:0}];interact(player,base,true,'North');await tick();let r=saved()[0];assert.equal(r.size,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),0);assert.equal(base.typeId,'minecraft:stone');
  state.responses=[{selection:2}];interact(player,base,true,'North');await tick();r=saved()[0];assert.equal(r.size,2);assert.equal(entityFor(dimension,r,'poster').getProperty('mcpe_food:size'),2);
  system.currentTick+=10;state.responses=[{selection:3}];interact(player,base,true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
});
test('poster overlap, insufficient wall and blocked resize leave items and existing art unchanged',async()=>{
  const{dimension,player}=setup(),base=wall(dimension,2,1);player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington',2));state.responses=[{selection:0}];interact(player,base,true,'North');await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
  state.responses=[{selection:0}];interact(player,base,true,'North');await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
  player.container.setItem(0);state.responses=[{selection:2}];interact(player,base,true,'North');await tick();assert.equal(saved()[0].size,0);
});
test('an upper slab is a table surface but cannot replace a complete poster backing wall',async()=>{
  const{player,base}=setup('minecraft:oak_slab',{'minecraft:vertical_half':'top'});assert.equal(surfaceHeight(base),1);player.container.setItem(0,new ItemStack('mcpe_food:ad_lamb'));state.responses=[{selection:0}];interact(player,base,true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_lamb'),1);
});
test('independent advertisements place on all four wall directions and keep their own rotation',async()=>{
  for(const[face,angle]of[['North',0],['South',180],['East',-90],['West',90]]){
    const{dimension,player,base}=setup();player.container.setItem(0,new ItemStack('mcpe_food:ad_lamb'));state.responses=[{selection:0}];interact(player,base,true,face);await tick();const r=saved()[0];assert.equal(r.direction,face.toLowerCase());assert.equal(entityFor(dimension,r,'poster').rotation.y,angle);removeDecor(r,false);
  }
});
test('full inventory or canceled poster dialog cannot lose the poster or replace backing blocks',async()=>{
  const{dimension,player}=setup(),base=wall(dimension);player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington'));state.responses=[{canceled:true}];interact(player,base,true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
  state.responses=[{selection:0}];interact(player,base,true,'North');await tick();let resolve;state.responses=[new Promise(r=>resolve=r)];interact(player,base,true,'North');await tick();for(let i=0;i<player.container.size;i++)player.container.setItem(i,new ItemStack('minecraft:stone',64));resolve({selection:3});await tick();assert.equal(saved().length,1);assert.equal(base.typeId,'minecraft:stone');
});
test('creative destruction of a slab display produces no drops, while survival preserves its exact prop',async()=>{
  for(const creative of[true,false]){
    const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'coca_cola_paper_cup');player.mode=creative?'Creative':'Survival';
    const event={player,block:base,cancel:false};state.breakBlock(event);assert.equal(event.cancel,false);await tick();assert.equal(saved().length,0);assert.equal(dimension.drops.length,creative?0:1);if(!creative)assert.equal(dimension.drops[0].item.typeId,r.definition);
  }
});
test('hitting a custom display removes only its owning record and returns the correct prop once',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'pepsi_paper_cup'),e=entityFor(dimension,r);
  state.hitEntity({damagingEntity:player,hitEntity:e});state.hitEntity({damagingEntity:player,hitEntity:e});assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);assert.equal(dimension.drops[0].item.typeId,'mcpe_food:pepsi_paper_cup');assert.equal(base.typeId,'minecraft:oak_slab');
});

test('all tabletop electronics sit on full blocks, bookshelves and wood/stone/copper slab heights without replacing supports',async()=>{
  const supports=[['minecraft:stone',{},1],['minecraft:bookshelf',{},1],['minecraft:chiseled_bookshelf',{},1],...[
    ['minecraft:oak_slab','minecraft:oak_double_slab'],['minecraft:normal_stone_slab','minecraft:normal_stone_double_slab'],['minecraft:cut_copper_slab','minecraft:double_cut_copper_slab']
  ].flatMap(([single,double])=>[[single,{'minecraft:vertical_half':'bottom'},.5],[single,{'minecraft:vertical_half':'top'},1],[double,{},1]])];
  for(const d of electronics)for(const[type,states,height]of supports){
    const{dimension,player,base}=setup(type,states),r=await place(player,base,d.key),e=entityFor(dimension,r);
    assert.ok(r,d.key);assert.equal(base.typeId,type);assert.equal(r.definition,`mcpe_food:${d.key}`);assert.equal(r.kind,'surface');assert.equal(r.native,false);assert.equal(e.location.y,height);assert.equal(e.getDynamicProperty('mcpe_food:shape'),d.key);assert.equal(player.container.count(r.definition),0);removeDecor(r,false);
  }
});

test('electronic placement preserves the four chosen directions',async()=>{
  for(const[rotation,direction,yaw]of [[0,'south',180],[90,'west',90],[180,'north',0],[270,'east',-90]]){
    const{dimension,player,base}=setup();player.getRotation=()=>({x:0,y:rotation});const r=await place(player,base,'keyboard_mouse_set');assert.equal(r.direction,direction);assert.equal(entityFor(dimension,r).rotation.y,yaw);removeDecor(r,false);
  }
});

test('two players placing electronics on the same surface create one owner and charge only the successful player',async()=>{
  const{dimension,player,base}=setup(),other=new FakePlayer(dimension);player.container.setItem(0,new ItemStack('mcpe_food:router'));other.container.setItem(0,new ItemStack('mcpe_food:server_cabinet'));
  interact(player,base);interact(other,base);await tick();assert.equal(saved().length,1);assert.equal(dimension.getEntities().length,1);assert.equal(player.container.count('mcpe_food:router')+other.container.count('mcpe_food:server_cabinet'),1);
  interact(player,base);await tick();assert.equal(saved().length,1);assert.equal(other.container.count('mcpe_food:server_cabinet'),1);
});

test('blocked electronics, deferred hand changes and distant placement never consume inventory',async()=>{
  const{dimension,player,base}=setup();dimension.put('minecraft:stone',{x:0,y:1,z:0});await place(player,base,'macbook_closed');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:macbook_closed'),1);
  dimension.put('minecraft:air',{x:0,y:1,z:0});interact(player,base);player.container.setItem(0,new ItemStack('mcpe_food:router'));await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:router'),1);
  player.location={x:100,y:1,z:100};interact(player,base);await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:router'),1);
});

test('electronic entity spawn failure restores the exact item and removes the persistent owner',async()=>{
  const{dimension,player,base}=setup();dimension.failSpawn=true;await place(player,base,'thinkpad_open');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:thinkpad_open'),1);assert.equal(base.typeId,'minecraft:stone');dimension.failSpawn=false;
});

test('electronics keep their style and pose across slab height changes, saved records, unloaded chunks and duplicate repair',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'macbook_closed');const e=entityFor(dimension,r),index=e.getProperty('mcpe_food:index');
  base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assert.equal(e.location.y,1);
  dimension.unloaded=true;reconcileDecor();assert.equal(saved().length,1);assert.equal(dimension.drops.length,0);dimension.unloaded=false;
  e.remove();loadDecorRecords();reconcileDecor();let current=entityFor(dimension,r);assert.equal(current.getProperty('mcpe_food:index'),index);assert.equal(current.location.y,1);assert.equal(saved()[0].definition,'mcpe_food:macbook_closed');
  const duplicate=dimension.spawnEntity(current.typeId,current.location);duplicate.setDynamicProperty('mcpe_food:owner',r.uid);duplicate.setDynamicProperty('mcpe_food:part','base');reconcileDecor();assert.equal(dimension.getEntities().length,1);
  base.setPermutation({typeId:'minecraft:oak_slab',getAllStates:()=>({'minecraft:vertical_half':'bottom'})});reconcileDecor();current=entityFor(dimension,r);assert.equal(current.location.y,.5);assert.equal(current.getProperty('mcpe_food:index'),index);
});

test('electronic props ignore serving and clicking, and repeated destruction returns the exact pose once in survival',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'gaming_laptop_closed'),e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));await useEntity(player,e);assert.equal(saved()[0].definition,r.definition);assert.equal(player.container.count('mcpe_food:steak'),1);
  player.container.setItem(0);await useEntity(player,e);assert.equal(saved()[0].definition,r.definition);
  state.hitEntity({damagingEntity:player,hitEntity:e});state.hitEntity({damagingEntity:player,hitEntity:e});assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);assert.equal(dimension.drops[0].item.typeId,r.definition);
});

test('creative electronics placement retains held inventory and support removal creates no drops',async()=>{
  const{dimension,player,base}=setup('minecraft:bookshelf');player.mode='Creative';const r=await place(player,base,'ipad_air_magic_keyboard');assert.equal(player.container.count(r.definition),1);
  state.breakBlock({player,block:base,cancel:false});await tick();assert.equal(saved().length,0);assert.equal(dimension.drops.length,0);assert.equal(base.typeId,'minecraft:bookshelf');
});

test('cardinal device-front facing follows player position and remains frozen through movement, support changes and reload',async()=>{
  for(const d of electronics.filter(d=>d.placementFront!==undefined)){
    const{dimension,player,base}=setup('minecraft:oak_slab');player.location={x:3.1,y:1,z:-1.3};player.getRotation=()=>({x:0,y:143});
    const r=await place(player,base,d.key),e=entityFor(dimension,r),normal=screenNormal(r.yaw,d.placementFront),dx=player.location.x-.5,dz=player.location.z-.5;
    const assertFacing=entity=>{
      if(fixedLaptopKeys.has(d.key)){
        assert.equal(entity.getProperty('mcpe_food:display_facing'),facingFromYaw(r.yaw));
        assert.equal(entity.getRotation().y,0);
      }else assert.equal(entity.rotation.y,r.yaw);
    };
    assert.equal(Math.abs(r.yaw%90),0);assert.ok((normal.x*dx+normal.z*dz)/Math.hypot(dx,dz)>=Math.SQRT1_2-1e-8);assertFacing(e);
    player.location={x:-3,y:1,z:2};base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assertFacing(e);assert.equal(e.location.y,1);
    e.remove();loadDecorRecords();reconcileDecor();assertFacing(entityFor(dimension,r));removeDecor(r,false);
  }
});

test('legacy screen records without yaw keep their stored cardinal direction after upgrade',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'macbook_open');delete r.yaw;r.direction='east';world.setDynamicProperty('mcpe_food:decor:'+r.uid,JSON.stringify(r));loadDecorRecords();reconcileDecor();assert.equal(saved()[0].yaw,undefined);assert.equal(entityFor(dimension,r).rotation.y,-90);
});

test('old router and server records keep their direction until replaced',async()=>{
  for(const key of ['router','server_cabinet']){
    const{dimension,player,base}=setup(),r=await place(player,base,key);delete r.yaw;r.direction='east';world.setDynamicProperty('mcpe_food:decor:'+r.uid,JSON.stringify(r));
    loadDecorRecords();reconcileDecor();assert.equal(saved()[0].yaw,undefined);assert.equal(entityFor(dimension,r).rotation.y,-90);removeDecor(saved()[0],false);
    system.currentTick+=10;player.location={x:.5,y:1,z:3};const placed=await place(player,base,key);assert.equal(placed.yaw,-180);assert.equal(entityFor(dimension,placed).rotation.y,-180);removeDecor(placed,false);
  }
});

test('0.5.1 diagonal device records snap once on load without losing their identity or inventory',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'macbook_open'),e=entityFor(dimension,r);r.yaw=37;world.setDynamicProperty('mcpe_food:decor:'+r.uid,JSON.stringify(r));e.teleport(e.location,{rotation:{x:0,y:37}});e.setDynamicProperty('mcpe_food:yaw',37);
  loadDecorRecords();reconcileDecor();const next=saved()[0];assert.equal(next.uid,r.uid);assert.equal(next.definition,r.definition);assert.equal(next.yaw,0);assert.equal(next.revision,r.revision+1);assert.equal(entityFor(dimension,r).rotation.y,0);assert.equal(dimension.drops.length,0);const revision=next.revision;
  loadDecorRecords();reconcileDecor();assert.equal(saved()[0].revision,revision);assert.equal(player.container.count(r.definition),0);
});

test('tableware now places on newly supported interactive/full surfaces without opening their UI',async()=>{
  for(const type of ['minecraft:barrel','minecraft:furnace','minecraft:crafting_table','minecraft:copper_bulb','minecraft:glass','minecraft:stripped_birch_wood']){
    const{player,base}=setup(type);player.container.setItem(0,new ItemStack('mcpe_food:plate'));assert.equal(interact(player,base).cancel,true);await tick();assert.equal(saved().length,1);assert.equal(state.forms.length,0);assert.equal(base.typeId,type);removeDecor(saved()[0],false);
  }
});

test('advertisements accept full transparent and ore walls while plants remain invalid',async()=>{
  for(const type of ['minecraft:glass','minecraft:coal_ore','minecraft:polished_tuff']){
    const{dimension,player}=setup();const base=wall(dimension,2,1);for(let x=0;x<2;x++)dimension.put(type,{x:-x,y:0,z:0});player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington'));state.responses=[{selection:0}];interact(player,dimension.getBlock(base.location),true,'North');await tick();assert.equal(saved().length,1,type);removeDecor(saved()[0],false);
  }
  const{dimension,player}=setup();wall(dimension,2,1);dimension.put('minecraft:short_grass',{x:0,y:0,z:0});player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington'));state.responses=[{selection:0}];interact(player,dimension.getBlock({x:0,y:0,z:0}),true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
});

test('all six refrigerator items place their complete one/two-block columns and both break points drop only one',async()=>{
  for(const fridge of refrigerators)for(const part of new Set([0,fridge.height-1])){
    const{dimension,player,base}=setup(),r=await place(player,base,fridge.key);assert.equal(r.kind,'appliance');assert.equal(player.container.count(r.definition),0);
    for(let i=0;i<fridge.height;i++)assert.equal(dimension.getBlock({x:0,y:1+i,z:0}).typeId,r.definition+(i?'_upper':''));
    const target=dimension.getBlock({x:0,y:1+part,z:0});state.breakBlock({player,block:target,cancel:false});state.breakBlock({player,block:target,cancel:false});await tick();assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);assert.equal(dimension.drops[0].item.typeId,r.definition);assert.equal(target.typeId,'minecraft:air');
  }
});

test('refrigerator placement rejects blocked upper space, lower slabs and competing players without charging losers',async()=>{
  let{dimension,player,base}=setup();dimension.put('minecraft:stone',{x:0,y:2,z:0});await place(player,base,'fridge_double_white');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:fridge_double_white'),1);assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,'minecraft:air');
  ({dimension,player,base}=setup('minecraft:oak_slab'));await place(player,base,'fridge_single_black');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:fridge_single_black'),1);
  ({dimension,player,base}=setup());const other=new FakePlayer(dimension);player.container.setItem(0,new ItemStack('mcpe_food:fridge_double_white'));other.container.setItem(0,new ItemStack('mcpe_food:fridge_single_black'));interact(player,base);interact(other,base);await tick();assert.equal(saved().length,1);assert.equal(other.container.count('mcpe_food:fridge_single_black'),1);
});

test('refrigerator block-write and inventory-write failures restore inventory, both cells and owner records',async()=>{
  for(const fault of ['upper','inventory']){
    const{dimension,player,base}=setup(),upper=dimension.getBlock({x:0,y:2,z:0}),write=upper.setPermutation.bind(upper);let fail=true;
    if(fault==='upper')upper.setPermutation=p=>{if(fail){fail=false;throw new Error('simulated upper part failure');}write(p);};else player.container.failOnce=true;
    // Set held inventory before enabling the inventory fault.
    if(fault==='inventory')player.container.failOnce=false;player.container.setItem(0,new ItemStack('mcpe_food:fridge_double_rose_gold'));if(fault==='inventory')player.container.failOnce=true;
    interact(player,base);await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:fridge_double_rose_gold'),1);assert.equal(upper.typeId,'minecraft:air');assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,'minecraft:air');
  }
});

test('fridge top supports tea/tableware and creative/survival destruction propagates its drop mode',async()=>{
  for(const creative of [true,false]){
    const{dimension,player,base}=setup(),fridge=await place(player,base,'fridge_double_black'),top=dimension.getBlock({x:0,y:2,z:0});
    player.container.setItem(0,new ItemStack('mcpe_food:gongfu_tea_tray'));interact(player,top);await tick();assert.equal(saved().length,2);player.mode=creative?'Creative':'Survival';
    state.breakBlock({player,block:dimension.getBlock({x:0,y:1,z:0}),cancel:false});await tick();assert.equal(saved().length,0);assert.equal(dimension.getEntities().length,0);assert.equal(dimension.drops.length,creative?0:2);if(!creative)assert.deepEqual(dimension.drops.map(d=>d.item.typeId).sort(),[fridge.definition,'mcpe_food:gongfu_tea_tray'].sort());
  }
});

test('missing fridge parts clean once while unloaded cells and saved instances remain untouched',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'fridge_double_white');dimension.unloaded=true;reconcileDecor();assert.equal(saved().length,1);assert.equal(dimension.drops.length,0);dimension.unloaded=false;loadDecorRecords();reconcileDecor();assert.equal(saved()[0].uid,r.uid);
  dimension.put('minecraft:air',{x:0,y:2,z:0});reconcileDecor();reconcileDecor();assert.equal(saved().length,0);assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,'minecraft:air');assert.equal(dimension.drops.length,1);
});

test('orphan helper cleanup does not invent items; command-created fridge bases establish one owner',()=>{
  const{dimension}=setup();const helper=dimension.put('mcpe_food:fridge_double_white_upper',{x:2,y:1,z:0});applianceTick(helper);assert.equal(helper.typeId,'minecraft:air');assert.equal(dimension.drops.length,0);
  const base=dimension.put('mcpe_food:fridge_double_white',{x:0,y:1,z:0});applianceTick(base);applianceTick(base);assert.equal(saved().length,1);assert.equal(dimension.getBlock({x:0,y:2,z:0}).typeId,'mcpe_food:fridge_double_white_upper');
});

test('Tieguanyin serves and returns through both cups, while the tea tray stays a static display',async()=>{
  for(const vessel of ['glass','mug']){
    const{dimension,player,base}=setup(),r=await place(player,base,vessel),e=entityFor(dimension,r);player.container.setItem(0,new ItemStack('mcpe_food:tieguanyin'));await useEntity(player,e);assert.ok(saved()[0].definition.includes('tieguanyin'));system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:'+vessel);assert.equal(player.container.count('mcpe_food:tieguanyin'),1);removeDecor(saved()[0],false);
  }
  const{dimension,player,base}=setup(),r=await place(player,base,'gongfu_tea_tray');player.container.setItem(0,new ItemStack('mcpe_food:tieguanyin'));await useEntity(player,entityFor(dimension,r));assert.equal(saved()[0].definition,r.definition);assert.equal(player.container.count('mcpe_food:tieguanyin'),1);
});

test('a refrigerator cannot displace an existing advertisement in its occupied column',async()=>{
  const{dimension,player,base}=setup(),wall=dimension.put('minecraft:glass',{x:0,y:1,z:-1});player.container.setItem(0,new ItemStack('mcpe_food:ad_lamb'));state.responses=[{selection:0}];interact(player,wall,true,'South');await tick();assert.equal(saved().length,1);
  await place(player,base,'fridge_double_white');assert.equal(saved().length,1);assert.equal(saved()[0].kind,'ad');assert.equal(player.container.count('mcpe_food:fridge_double_white'),1);assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,'minecraft:air');
});

test('failed refrigerator removal restores both blocks and removes transient item drops before a safe retry',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'fridge_double_black'),upper=dimension.getBlock({x:0,y:2,z:0}),write=upper.setPermutation.bind(upper);let fail=true;
  upper.setPermutation=p=>{if(fail){fail=false;throw new Error('simulated clear failure');}write(p);};assert.throws(()=>removeDecor(r,true),/simulated clear failure/);
  assert.equal(saved().length,1);assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,r.definition);assert.equal(upper.typeId,r.definition+'_upper');assert.equal(dimension.drops.filter(d=>d.entity.isValid).length,0);
  removeDecor(r,true);assert.equal(saved().length,0);assert.equal(dimension.drops.filter(d=>d.entity.isValid).length,1);
});

test('table sign persists 01/08/99, rejects 00, cancels safely and collects a generic sign',async()=>{
 for(const n of [1,8,99]){const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'table_number_sign'),e=entityFor(dimension,r);player.container.setItem(0,undefined);state.responses=[{selection:0},{formValues:[Math.floor(n/10),n%10]}];await useEntity(player,e);assert.equal(saved()[0].tableNumber,n);loadDecorRecords();reconcileDecor();assert.equal(saved()[0].tableNumber,n);assert.ok(e.getProperty('mcpe_food:index')>=368);removeDecor(saved()[0],false);}
 const{dimension,player,base}=setup(),r=await place(player,base,'table_number_sign'),e=entityFor(dimension,r);player.container.setItem(0,undefined);
 for(const responses of [[{selection:0},{formValues:[0,0]}],[{canceled:true}],[{selection:0},{canceled:true}]]){system.currentTick+=10;state.responses=responses;await useEntity(player,e);assert.equal(saved()[0].tableNumber,undefined);assert.equal(saved()[0].revision,0);}
 system.currentTick+=10;await useEntity(player,e,1);assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:table_number_sign'),1);
 await place(player,base,'table_number_sign');assert.equal(saved()[0].tableNumber,undefined);
});

test('number change rejects a stale multiplayer menu; a full inventory cannot collect the sign',async()=>{
 const{dimension,player,base}=setup(),r=await place(player,base,'table_number_sign'),e=entityFor(dimension,r),other=new FakePlayer(dimension);other.id='other';player.container.setItem(0,undefined);
 state.responses=[{selection:0},{selection:0},{formValues:[1,2]},{formValues:[9,9]}];state.entityInteract({player,target:e,cancel:false});state.entityInteract({player:other,target:e,cancel:false});await tick();assert.equal(saved()[0].revision,1);assert.ok([12,99].includes(saved()[0].tableNumber));
 for(let i=0;i<player.container.size;i++)player.container.setItem(i,new ItemStack('minecraft:stone',64));player.container.setItem(0,undefined);
 // Modal is opened empty handed, then the inventory fills before confirmation.
 const previous=state.responses;state.responses=[{selection:1}];system.currentTick+=10;state.entityInteract({player,target:e,cancel:false});flush();player.container.setItem(0,new ItemStack('minecraft:stone',64));await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:table_number_sign'),0);
});

test('all service props use support occupancy, obstruction, height changes and one-time drops',async()=>{
 const{restaurantItems}=await import('../.build/restaurant-catalog.js');for(const d of restaurantItems){const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,d.key);const e=entityFor(dimension,r);assert.equal(e.location.y,.5);await place(player,base,d.key);assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:'+d.key),1);base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assert.equal(e.location.y,1);base.setPermutation({typeId:'minecraft:air',getAllStates:()=>({})});reconcileDecor();reconcileDecor();assert.equal(dimension.drops.length,1);assert.equal(dimension.drops[0].item.typeId,'mcpe_food:'+d.key);}
});

test('0.6.0 props keep four-way placement, blocking, concurrent occupancy and persisted support heights',async()=>{
 const{newProps}=await import('../.build/lifestyle-catalog.js');for(const d of newProps){const{dimension,player,base}=setup('minecraft:oak_slab'),other=new FakePlayer(dimension);other.id='other';
 player.container.setItem(0,new ItemStack('mcpe_food:'+d.key));other.container.setItem(0,new ItemStack('mcpe_food:'+d.key));interact(player,base);interact(other,base);await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:'+d.key)+other.container.count('mcpe_food:'+d.key),1);
 const r=saved()[0],e=entityFor(dimension,r);assert.equal(e.location.y,.5);loadDecorRecords();reconcileDecor();assert.equal(saved()[0].definition,r.definition);assert.equal(saved()[0].yaw,r.yaw);
 base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assert.equal(e.location.y,1);removeDecor(saved()[0],false);
 dimension.put('minecraft:stone',{x:0,y:1,z:0});player.container.setItem(0,new ItemStack('mcpe_food:'+d.key));interact(player,base);await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:'+d.key),1);
 }
});
