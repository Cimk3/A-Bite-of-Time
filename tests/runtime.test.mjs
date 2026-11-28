/** Real compiled runtime against a deliberately small mock engine; not an in-game test. */
import {registerHooks} from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
import {state,FakeDimension,FakePlayer,ItemStack,BlockPermutation,interact,flush,reset,system} from './mock-server.mjs';
import {foods,newFoods,restaurantFoods,compatibleVessels,id,servingKey} from '../.build/catalog.js';
registerHooks({resolve(specifier,context,next){
  const mock=specifier==='@minecraft/server'?'mock-server.mjs':specifier==='@minecraft/server-ui'?'mock-ui.mjs':undefined;
  return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);
}});
await import('../.build/main.js');
flush(); // Finish the empty world's startup record load before interaction tests.
const idle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(type='mcpe_food:stove'){
  reset();const dimension=new FakeDimension(),player=new FakePlayer(dimension),block=dimension.put(type);return{dimension,player,block};
}
test('placed Linux computer opens a player-local desktop and rejects stale form submissions',async()=>{
 const {dimension,player,block}=setup('minecraft:stone');
 const peer=new FakePlayer(dimension),definition=id('linux_desktop_computer');
 player.container.setItem(0,new ItemStack(definition));
 interact(player,block);flush();await idle();
 const subject=[...dimension.getEntities()].find(e=>e.typeId===id('surface_display'));
 assert.ok(subject);
 const open=who=>{const event={player:who,target:subject,cancel:false};state.entityInteract(event);assert.equal(event.cancel,true);flush();};
 let confirm;
 state.responses=[{selection:1},{formValues:['mkdir Projects']},{formValues:['ls']},new Promise(resolve=>{confirm=resolve;})];
 open(player);await idle();
 assert.match(state.forms.at(-1).label,/Projects\//);
 state.responses=[{selection:0},{canceled:true}];
 open(peer);await idle();
 assert.ok(!state.forms.at(-1).buttons.includes('Projects/'));
 const count=state.forms.length;
 player.location={x:25,y:1,z:0};
 confirm({formValues:['mkdir after_walk']});await idle();
 assert.equal(state.forms.length,count);
 player.location={x:.5,y:1,z:.5};player.isSneaking=true;system.currentTick+=10;
 state.responses=[{selection:0}];
 open(player);await idle();
 assert.equal(player.container.count(definition),1);
});
test('Linux file manager and terminal open a dedicated text reader and return to the originating app',async()=>{
 const {dimension,player,block}=setup('minecraft:stone');
 player.container.setItem(0,new ItemStack(id('linux_desktop_computer')));
 interact(player,block);flush();await idle();
 const target=[...dimension.getEntities()].find(entity=>entity.typeId===id('surface_display'));
 assert.ok(target);
 player.tags.add('food_english');
 state.responses=[
  {selection:0},{selection:3},{selection:0},{selection:0},
  {selection:1},{formValues:['open Documents/notes.txt']},
  {selection:0},{formValues:['exit']},{selection:2},
 ];
 state.entityInteract({player,target,cancel:false});flush();await idle();
 const readers=state.forms.filter(form=>form.title.startsWith('Text Reader'));
 assert.deepEqual(readers.map(form=>form.title),['Text Reader  /  README.txt','Text Reader  /  notes.txt']);
 assert.match(readers[0].body,/\/home\/player\/README\.txt[\s\S]*Fangcun District Linux/);
 assert.match(readers[1].body,/This computer belongs/);
 assert.ok(state.forms[0].icons.every(path=>path.startsWith('textures/items/mcpe_food/linux_ui_')));
 assert.equal(state.forms.at(-1).title,'Fangcun District Linux');
 player.isSneaking=true;system.currentTick+=10;
 state.responses=[{selection:0}];
 state.entityInteract({player,target,cancel:false});flush();await idle();
 assert.equal(player.container.count(id('linux_desktop_computer')),1);
});
test('vertical slice: prepare egg fried rice, serve, take, preserve orientation',async()=>{
  const {dimension,player,block}=setup();player.container.setItem(0,new ItemStack('mcpe_food:rice',2));player.container.setItem(1,new ItemStack('minecraft:egg'));
  state.responses=[{selection:0},{selection:0},{selection:0}];assert.equal(interact(player,block).cancel,true);flush();await idle();
  assert.equal(player.container.count('mcpe_food:egg_fried_rice'),1);assert.equal(player.container.count('mcpe_food:rice'),0);
  assert.ok(state.forms[1].icons.length>0);assert.ok(state.forms[1].icons.every(icon=>icon.startsWith('textures/items/mcpe_food/')));
  const plate=dimension.put('mcpe_food:bowl',{x:1,y:1,z:0},{'minecraft:cardinal_direction':'west'});
  system.currentTick+=10;interact(player,plate);flush();assert.equal(plate.typeId,'mcpe_food:egg_fried_rice_serving');assert.equal(player.container.count('mcpe_food:egg_fried_rice'),0);
  system.currentTick+=10;interact(player,plate);flush();assert.equal(plate.typeId,'mcpe_food:bowl');assert.equal(player.container.count('mcpe_food:egg_fried_rice'),1);assert.equal(plate.permutation.getState('minecraft:cardinal_direction'),'west');
});
test('vertical slice: green tea returns its water bucket and uses a mug',async()=>{
  const{dimension,player,block}=setup('mcpe_food:drink_counter');player.container.setItem(0,new ItemStack('mcpe_food:tea',2));player.container.setItem(1,new ItemStack('minecraft:water_bucket'));
  state.responses=[{selection:1},{selection:0},{selection:0}];interact(player,block);flush();await idle();
  assert.equal(player.container.count('mcpe_food:green_tea'),1);assert.equal(player.container.count('minecraft:bucket'),1);
  const mug=dimension.put('mcpe_food:mug',{x:1,y:1,z:0});interact(player,mug);flush();assert.equal(mug.typeId,'mcpe_food:green_tea_serving');
});
test('canceled confirmation never consumes anything',async()=>{
  const{player,block}=setup();player.container.setItem(0,new ItemStack('mcpe_food:rice',2));player.container.setItem(1,new ItemStack('minecraft:egg'));
  state.responses=[{selection:0},{selection:0},{selection:1}];interact(player,block);flush();await idle();assert.equal(player.container.count('mcpe_food:rice'),2);assert.equal(player.container.count('mcpe_food:egg_fried_rice'),0);
});
test('changed ingredients are checked again at confirmation',async()=>{
  const{player,block}=setup();player.container.setItem(0,new ItemStack('mcpe_food:rice',2));player.container.setItem(1,new ItemStack('minecraft:egg'));
  let resolve;const pending=new Promise(r=>resolve=r);state.responses=[{selection:0},{selection:0},pending];interact(player,block);flush();await idle();
  player.container.setItem(1);resolve({selection:0});await idle();assert.equal(player.container.count('mcpe_food:rice'),2);assert.equal(player.container.count('mcpe_food:egg_fried_rice'),0);
});
test('removed station and player distance are checked again at confirmation',async()=>{
  for(const change of ['remove','distance']){
    const{player,block}=setup();player.container.setItem(0,new ItemStack('mcpe_food:rice',2));player.container.setItem(1,new ItemStack('minecraft:egg'));
    let resolve;const pending=new Promise(r=>resolve=r);state.responses=[{selection:0},{selection:0},pending];interact(player,block);flush();await idle();
    if(change==='remove')block.setPermutation(BlockPermutation.resolve('minecraft:air'));else player.location.x=100;
    resolve({selection:0});await idle();assert.equal(player.container.count('mcpe_food:rice'),2);assert.equal(player.container.count('mcpe_food:egg_fried_rice'),0);
  }
});
test('two players cannot take the same serving during the same tick',()=>{
  const{dimension,player,block}=setup('mcpe_food:steak_serving'),other=new FakePlayer(dimension);
  interact(player,block);interact(other,block);flush();assert.equal(player.container.count('mcpe_food:steak')+other.container.count('mcpe_food:steak'),1);assert.equal(block.typeId,'mcpe_food:plate');
});
test('two players cannot overwrite a filled vessel during the same tick',()=>{
  const{dimension,player,block}=setup('mcpe_food:plate'),other=new FakePlayer(dimension);
  player.container.setItem(0,new ItemStack('mcpe_food:steak',2));other.container.setItem(0,new ItemStack('mcpe_food:steak',2));
  interact(player,block);interact(other,block);flush();assert.equal(block.typeId,'mcpe_food:steak_serving');assert.equal(player.container.count('mcpe_food:steak')+other.container.count('mcpe_food:steak'),3);
});
test('wrong container does not consume a dish',()=>{
  const{player,block}=setup('mcpe_food:glass');player.container.setItem(0,new ItemStack('mcpe_food:steak',2));interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:glass');assert.equal(player.container.count('mcpe_food:steak'),2);
});
test('all ten drinks work in glass and mug; only premium red wine also works in stemware',()=>{
  for(const food of foods.filter(f=>f.category==='drink'))for(const key of['glass','mug','wine_glass']){
    const{player,block}=setup(id(key));player.container.setItem(0,new ItemStack(id(food.key)));interact(player,block);flush();
    if(key==='wine_glass'&&food.key!=='premium_red_wine'){assert.equal(block.typeId,id(key));assert.equal(player.container.count(id(food.key)),1);continue;}
    assert.equal(block.typeId,id(servingKey(food,key)));system.currentTick+=10;interact(player,block);flush();assert.equal(block.typeId,id(key));assert.equal(player.container.count(id(food.key)),1);
  }
});
test('colored plate keeps its identity through serving and taking',()=>{
  const{player,block}=setup('mcpe_food:black_gold_plate');player.container.setItem(0,new ItemStack('mcpe_food:steak',1));
  interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:steak_on_black_gold_plate');
  system.currentTick+=10;interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:black_gold_plate');assert.equal(player.container.count('mcpe_food:steak'),1);
});
test('new dishes work on old vessels and preserve the actual empty vessel',()=>{
  const{player,block}=setup('mcpe_food:plate');player.container.setItem(0,new ItemStack('mcpe_food:peking_duck',1));
  interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:peking_duck_on_plate');
  system.currentTick+=10;interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:plate');assert.equal(player.container.count('mcpe_food:peking_duck'),1);
});
test('0.4 banquet platter preserves an alternate plate and orientation through take',()=>{
  const{player,block}=setup('mcpe_food:burgundy_platter');player.container.setItem(0,new ItemStack('mcpe_food:peacock_platter'));
  interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:peacock_platter_on_burgundy_platter');
  system.currentTick+=10;interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:burgundy_platter');assert.equal(player.container.count('mcpe_food:peacock_platter'),1);assert.equal(block.permutation.getState('minecraft:cardinal_direction'),'east');
});
for(const [version,items] of [['0.4.1',restaurantFoods],['0.4.2',newFoods]])test(`all ${version} foods round-trip through compatible vessels with no extra container`,()=>{
  for(const food of items)for(const vessel of compatibleVessels(food)){
    const{player,block}=setup(id(vessel.key));player.container.setItem(0,new ItemStack(id(food.key),2));
    interact(player,block);flush();assert.equal(block.typeId,id(servingKey(food,vessel.key)));assert.equal(player.container.count(id(food.key)),1);
    player.selectedSlotIndex=1;system.currentTick+=10;interact(player,block);flush();assert.equal(block.typeId,id(vessel.key));assert.equal(player.container.count(id(food.key)),2);assert.equal(player.container.count(id(vessel.key)),0);
  }
});
test('full inventory leaves a new serving unchanged and two players cannot take it twice',()=>{
  const{dimension,player,block}=setup('mcpe_food:wagyu_rice_on_bowl');for(let i=0;i<player.container.size;i++)player.container.setItem(i,new ItemStack('minecraft:stone',64));
  interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:wagyu_rice_on_bowl');
  player.container.setItem(0);system.currentTick+=10;const other=new FakePlayer(dimension);interact(player,block);interact(other,block);flush();
  assert.equal(block.typeId,'mcpe_food:bowl');assert.equal(player.container.count('mcpe_food:wagyu_rice')+other.container.count('mcpe_food:wagyu_rice'),1);
});
test('retained kitchen combines old cuisines under the five-group menu without offering new recipes',async()=>{
  const{player,block}=setup();state.responses=[{selection:0},{canceled:true}];interact(player,block);flush();await idle();
  assert.deepEqual(state.forms[0].buttons,['中餐','西餐']);assert.ok(state.forms[1].buttons.includes('清炖狮子头'));assert.ok(state.forms[1].buttons.includes('锅包肉'));assert.ok(!state.forms[1].buttons.includes('小炒黄牛肉'));
});
test('bottle props accept full supports but interaction cannot turn them into servings',()=>{
  const{dimension,player,block}=setup('mcpe_food:premium_red_wine_bottle'),component=state.components.get('mcpe_food:table');
  dimension.put('minecraft:stone',{x:0,y:0,z:0});let event={block,cancel:false};component.beforeOnPlayerPlace(event);assert.equal(event.cancel,false);
  player.container.setItem(0,new ItemStack('mcpe_food:premium_red_wine',2));component.onPlayerInteract({player,block});assert.equal(block.typeId,'mcpe_food:premium_red_wine_bottle');assert.equal(player.container.count('mcpe_food:premium_red_wine'),2);
  dimension.put('minecraft:stone_slab',{x:0,y:0,z:0});event={block,cancel:false};component.beforeOnPlayerPlace(event);assert.equal(event.cancel,true);
});
test('display-only hotpot platters can be served and retrieved',()=>{
  const{player,block}=setup('mcpe_food:burgundy_platter');player.container.setItem(0,new ItemStack('mcpe_food:beef_slices',1));
  interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:beef_slices_serving');
  system.currentTick+=10;interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:burgundy_platter');assert.equal(player.container.count('mcpe_food:beef_slices'),1);
});
test('two players cannot duplicate a serving on a colored bowl',()=>{
  const{dimension,player,block}=setup('mcpe_food:egg_fried_rice_on_burgundy_bowl'),other=new FakePlayer(dimension);
  interact(player,block);interact(other,block);flush();assert.equal(block.typeId,'mcpe_food:burgundy_bowl');assert.equal(player.container.count('mcpe_food:egg_fried_rice')+other.container.count('mcpe_food:egg_fried_rice'),1);
});
test('serving rollback restores both block and inventory if engine write fails',()=>{
  const{player,block}=setup('mcpe_food:plate');player.container.setItem(0,new ItemStack('mcpe_food:steak',2));player.container.failOnce=true;interact(player,block);flush();assert.equal(block.typeId,'mcpe_food:plate');assert.equal(player.container.count('mcpe_food:steak'),2);
});
test('holding the interact button does not repeatedly consume or open forms',()=>{
  const{player,block}=setup('mcpe_food:plate');player.container.setItem(0,new ItemStack('mcpe_food:steak',4));assert.equal(interact(player,block,false).cancel,true);flush();assert.equal(block.typeId,'mcpe_food:plate');assert.equal(player.container.count('mcpe_food:steak'),4);
});
test('sneaking preserves native block placement on top of a kitchen counter',()=>{
  const{player,block}=setup();player.isSneaking=true;player.container.setItem(0,new ItemStack('mcpe_food:plate'));assert.equal(interact(player,block).cancel,false);flush();assert.equal(state.forms.length,0);
});
test('metadata is retained on remaining food after serving',()=>{
  const{player,block}=setup('mcpe_food:plate'),food=new ItemStack('mcpe_food:steak',4);food.nameTag='My special steak';player.container.setItem(0,food);interact(player,block);flush();assert.equal(player.container.getItem(0).nameTag,'My special steak');assert.equal(player.container.getItem(0).amount,3);
});
test('vertical slice: rice grows with bone meal, harvest resets and drops produce/seeds',()=>{
  const{dimension,player,block}=setup('mcpe_food:rice_crop');block.setPermutation(BlockPermutation.resolve('mcpe_food:rice_crop',{'mcpe_food:growth':0}));player.container.setItem(0,new ItemStack('minecraft:bone_meal',4));
  for(let age=1;age<=3;age++){interact(player,block);flush();assert.equal(block.permutation.getState('mcpe_food:growth'),age);system.currentTick+=10;}
  assert.equal(player.container.count('minecraft:bone_meal'),1);player.container.setItem(0);interact(player,block);flush();assert.equal(block.permutation.getState('mcpe_food:growth'),0);assert.equal(dimension.drops.length,2);assert.equal(dimension.drops[0].item.amount,2);assert.equal(dimension.drops[1].item.typeId,'mcpe_food:rice_seeds');
});
test('placement accepts a listed full support and rejects slabs',()=>{
  const{dimension,block}=setup('mcpe_food:plate'),component=state.components.get('mcpe_food:table');
  dimension.put('minecraft:oak_planks',{x:0,y:0,z:0});let e={block,cancel:false};component.beforeOnPlayerPlace(e);assert.equal(e.cancel,false);
  dimension.put('minecraft:oak_slab',{x:0,y:0,z:0});e={block,cancel:false};component.beforeOnPlayerPlace(e);assert.equal(e.cancel,true);
});
