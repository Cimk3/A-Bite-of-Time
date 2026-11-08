import {addedDefinitions,addedBlocks,addedSurfaceCount,patch090Items,patch090Props,patch090Walls,slotIconEntries} from './patch-090-expectations.mjs';
import {patch082Items} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system,world} from './mock-server.mjs';
registerHooks({resolve(s,c,next){const mock=s==='@minecraft/server'?'mock-server.mjs':s==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(s,c);}});
await import('../.build/main.js');
const{removeDecor,loadDecorRecords,reconcileDecor}=await import('../.build/decor-runtime.js');
const{patch072Props,clothingItems,clothingVisuals,rackSpecs}=await import('../.build/patch-072-catalog.js');
const{surfaceVisuals}=await import('../.build/decor-catalog.js');
const{wallVariants,digitalScreens,wallScreens}=await import('../.build/scenario-catalog.js');
const read=f=>JSON.parse(readFileSync(f,'utf8')),bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',id=k=>'mcpe_food:'+k;
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
async function tick(){flush();await new Promise(r=>setImmediate(r));flush();await new Promise(r=>setImmediate(r));}await tick();
afterEach(()=>{for(const r of saved())removeDecor(r,false);});
function setup(){reset();const d=new FakeDimension(),p=new FakePlayer(d);p.location={x:.5,y:1,z:3.5};return{d,p,b:d.put('minecraft:stone',{x:0,y:0,z:0})};}
async function place(p,b,k,face='Up'){p.container.setItem(0,new ItemStack(id(k)));interact(p,b,true,face);await tick();return saved()[0];}
async function menu(p,d,selection){system.currentTick+=10;state.responses.push({selection});state.entityInteract({player:p,target:d.getEntities().find(e=>e.getDynamicProperty('mcpe_food:part')==='base'),cancel:false});await tick();}
const geometry=(key,entity=false)=>read(`${rp}/models/${entity?'entity':'blocks'}/mcpe_food/${key}.geo.json`)['minecraft:geometry'][0];
const cubes=g=>g.bones.flatMap(b=>b.cubes??[]);
test('0.7.2 adds exactly 21 items, preserves 538 indices, nine ads, IDs, UUIDs, recipes, drops and crops',()=>{
 const old=read('tests/fixtures/v0.7.1.json'),order=read('tests/fixtures/v0.7.1-surfaces.json');
 assert.deepEqual(surfaceVisuals.slice(0,538).map(d=>d.key),order.keys);assert.deepEqual(digitalScreens.slice(0,9),order.digitalScreens);assert.equal(surfaceVisuals.length,609+patch085Props.length+addedSurfaceCount);
 for(const kind of ['items','blocks']){const all=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);assert.deepEqual(all.filter(k=>!old[kind].includes(k)&&![...patch073Props,...patch074Props,...patch074DigitalScreens,...patch080Props,...patch082Items,...patch085Props,...addedDefinitions].some(d=>id(d.key)===k)).sort(),[...patch072Props,...(kind==='items'?clothingItems:[])].map(d=>id(d.key)).sort());for(const k of old[kind])assert.ok(all.includes(k));}
 for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
 for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,h]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),h,f);
 for(const[f,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${f}`)['minecraft:block'].description.states,states);
 const lines=n=>readFileSync(`${bp}/functions/mcpe_food/${n}.mcfunction`,'utf8').trim().split('\n');assert.equal(lines('tasting_new').length,patch090Items.length);assert.equal(lines('clothing_store').length,13);assert.equal(lines('clothing_fixtures').length,4);assert.equal(lines('clothing_items').length,9);assert.equal(lines('transit_equipment').length,3);assert.equal(lines('electronics').length,52);assert.equal(lines('office_stationery').length,9);assert.deepEqual(lines('electronics').slice(0,42),old.functions['electronics.mcfunction'].trim().split('\n'));
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups,names=groups.map(g=>g.group_identifier.name);assert.equal(names.indexOf('mcpe_food:group_clothing_items'),names.indexOf('mcpe_food:group_clothing_fixtures')+1);
 for(const d of clothingItems){const c=read(`${bp}/items/${d.key}.json`)['minecraft:item'].components;assert.equal(c['minecraft:wearable'],undefined);assert.equal(c['minecraft:block_placer'],undefined);assert.equal(c['minecraft:food'],undefined);}
});
test('explicit orientation is synchronized, subtracts client body yaw, and leaves legacy display path conditional',()=>{
 const animation=read(`${rp}/animations/mcpe_food/display_facing.animation.json`).animations['animation.mcpe_food.display_facing'];
 for(const bone of ['food','ware'])assert.ok(animation.bones[bone].rotation[1].includes('- q.body_y_rotation'));
 for(const name of ['surface_display','digital_ad_display','clothing_display']){const b=read(`${bp}/entities/${name}.json`)['minecraft:entity'];assert.deepEqual(b.description.properties['mcpe_food:display_facing'],{type:'int',range:[0,4],default:0,client_sync:true});const c=read(`${rp}/entity/mcpe_food/${name}.entity.json`)['minecraft:client_entity'].description;assert.deepEqual(c.scripts.animate,[{display_facing:"q.property('mcpe_food:display_facing') > 0"}]);}
 for(const name of ['tray_food_display','advert_display'])assert.equal(read(`${bp}/entities/${name}.json`)['minecraft:entity'].description.properties['mcpe_food:display_facing'],undefined);
 const a=read(`${bp}/mcpe_food_build.json`),b=read(`${rp}/mcpe_food_build.json`);assert.deepEqual(a,b);assert.equal(a.version,read('package.json').version);for(const pack of[bp,rp])assert.ok(read(`${pack}/manifest.json`).header.name.includes(a.build));
});
test('all affected walls and two 2x1 information screens retain anchors and publish explicit four-way directions',async()=>{
 const normal={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]},right={north:[-1,0],east:[0,1],south:[1,0],west:[0,-1]};
 for(const[face,n]of Object.entries(normal))for(const item of [...wallVariants.map(d=>({key:d.base,width:1,height:1})),...wallScreens]){
  const{d,p,b}=setup();p.location={x:.5+n[0]*3,y:1,z:.5+n[1]*3};for(let x=0;x<item.width;x++)for(let y=0;y<item.height;y++)d.put('minecraft:stone',{x:right[face][0]*x,y,z:right[face][1]*x});
  const r=await place(p,b,item.key,face);assert.ok(r,item.key+face);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),{north:1,east:2,south:3,west:4}[face]);const before=JSON.stringify(r);for(const e of d.getEntities())e.remove();loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),{north:1,east:2,south:3,west:4}[face]);removeDecor(r,false);
 }
});
test('checkout and new floor devices use nearest player cardinal; old food remains legacy; saved yaw/revision unchanged',async()=>{
 for(const k of ['supermarket_checkout',...patch072Props.filter(d=>!d.wallOnly).map(d=>d.key)])for(const[x,z,code]of[[3,0,2],[-3,0,4],[0,-3,1],[0,3,3],[2,3,3],[-3,-2,4]]){
  const{d,p,b}=setup();p.location={x:.5+x,y:1,z:.5+z};const r=await place(p,b,k);assert.ok(r,k);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),code,k);const before=JSON.stringify(r);loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);removeDecor(r,false);
 }
 const{d,p,b}=setup();await place(p,b,'plate');assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),0);
});
test('rack insertion consumes one item even in creative, slots reject full/hat, and retrieval conserves complete suits',async()=>{
 for(const spec of rackSpecs){const{d,p,b}=setup();p.mode='Creative';await place(p,b,spec.key);p.container.setItem(0,new ItemStack(id('display_suit_navy'),spec.capacity+1));
  for(let i=0;i<spec.capacity;i++){await menu(p,d,i);assert.equal(saved()[0].slots[i],id('display_suit_navy'));assert.equal(p.container.count(id('display_suit_navy')),spec.capacity-i);}
  const before=JSON.stringify(saved()[0]);await menu(p,d,0);assert.equal(JSON.stringify(saved()[0]),before);p.container.setItem(0);await menu(p,d,0);assert.equal(saved()[0].slots[0],null);assert.equal(p.container.count(id('display_suit_navy')),1);removeDecor(saved()[0],false);
 }
 const{d,p,b}=setup();await place(p,b,'single_clothing_rail');p.container.setItem(0,new ItemStack(id('display_hat')));await menu(p,d,0);assert.ok(saved()[0].slots.every(x=>x===null));assert.equal(p.container.count(id('display_hat')),1);
});
test('all nine garments work in shelf and mannequin; clothes cannot be independently placed',async()=>{
 for(const rack of ['double_clothing_shelf','mannequin_display'])for(const garment of clothingItems){const{d,p,b}=setup();await place(p,b,rack);p.container.setItem(0,new ItemStack(id(garment.key)));await menu(p,d,0);assert.equal(saved()[0].slots[0],id(garment.key));assert.equal(p.container.count(id(garment.key)),0);assert.equal(d.getEntities().filter(e=>e.typeId===id('clothing_display')).length,1);removeDecor(saved()[0],false);}
 const{d,p,b}=setup();for(const g of clothingItems){p.container.setItem(0,new ItemStack(id(g.key)));assert.equal(interact(p,b).cancel,true);await tick();assert.equal(saved().length,0);assert.equal(p.container.count(id(g.key)),1);}assert.equal(d.getEntities().length,0);
});
test('whole-rack refund is atomic on full inventory, preserves metadata and returns one item per suit',async()=>{
 const{d,p,b}=setup();await place(p,b,'double_clothing_shelf');for(let i=0;i<4;i++){p.container.setItem(0,new ItemStack(id(clothingItems[i].key)));await menu(p,d,i);}p.container.setItem(0);for(let i=1;i<p.container.size;i++){const s=new ItemStack('minecraft:stone',64);s.nameTag='keep';p.container.setItem(i,s);}const before=JSON.stringify(saved()[0]);await menu(p,d,4);assert.equal(JSON.stringify(saved()[0]),before);assert.equal(p.container.getItem(0),undefined);assert.equal(p.container.getItem(1).nameTag,'keep');for(let i=1;i<5;i++)p.container.setItem(i);await menu(p,d,4);assert.equal(saved().length,0);for(let i=0;i<4;i++)assert.equal(p.container.count(id(clothingItems[i].key)),1);assert.equal(p.container.count(id('double_clothing_shelf')),1);assert.equal(d.getEntities().length,0);
});
test('competing asynchronous inserts cannot duplicate a slot and stale hand/distance/support aborts',async()=>{
 const{d,p,b}=setup();await place(p,b,'mannequin_display');const q=new FakePlayer(d);q.location={...p.location};p.container.setItem(0,new ItemStack(id('display_suit_black')));q.container.setItem(0,new ItemStack(id('display_suit_navy')));
 let resolve;state.responses.push(new Promise(r=>resolve=r));system.currentTick+=10;state.entityInteract({player:p,target:d.getEntities()[0]});await tick();await menu(q,d,0);resolve({selection:0});await tick();assert.equal(saved()[0].slots[0],id('display_suit_navy'));assert.equal(p.container.count(id('display_suit_black')),1);assert.equal(q.container.count(id('display_suit_navy')),0);
 for(const mutation of [()=>p.container.setItem(0,new ItemStack('minecraft:stone')),()=>p.location={x:20,y:1,z:20},()=>d.put('minecraft:air',{x:0,y:0,z:0})]){
  const r=saved()[0];r.slots=[null];r.revision++;state.properties.set('mcpe_food:decor:'+r.uid,JSON.stringify(r));loadDecorRecords();p.location={x:.5,y:1,z:3.5};d.put('minecraft:stone',{x:0,y:0,z:0});p.container.setItem(0,new ItemStack(id('display_shirt')));state.responses.push(new Promise(r=>resolve=r));system.currentTick+=10;state.entityInteract({player:p,target:d.getEntities()[0]});await tick();mutation();resolve({selection:0});await tick();assert.equal(saved()[0].slots[0],null);
 }
});
test('failed garment spawn rolls back inventory and record; unloaded support skips recovery then rebuilds all slots',async()=>{
 const{d,p,b}=setup();await place(p,b,'single_clothing_rail');p.container.setItem(0,new ItemStack(id('display_coat')));d.failSpawn=true;await menu(p,d,0);assert.equal(saved()[0].slots[0],null);assert.equal(p.container.count(id('display_coat')),1);d.failSpawn=false;await menu(p,d,0);const before=JSON.stringify(saved()[0]);for(const e of d.getEntities())e.remove();d.unloaded=true;loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);assert.equal(d.getEntities().length,0);d.unloaded=false;reconcileDecor();assert.equal(d.getEntities().length,2);assert.equal(JSON.stringify(saved()[0]),before);
});
test('failed inventory writes and persistent saves restore exact garment hand and slot revision',async()=>{
 const{d,p,b}=setup();await place(p,b,'mannequin_display');const held=new ItemStack(id('display_shirt'),2);held.nameTag='custom retained';p.container.setItem(0,held);const before=JSON.stringify(saved()[0]);
 p.container.failOnce=true;await menu(p,d,0);assert.equal(JSON.stringify(saved()[0]),before);assert.equal(p.container.getItem(0).amount,2);assert.equal(p.container.getItem(0).nameTag,'custom retained');
 const original=world.setDynamicProperty;let fail=true;world.setDynamicProperty=(k,v)=>{if(fail&&k.startsWith('mcpe_food:decor:')){fail=false;throw Error('simulated record write failure');}original(k,v);};
 try{await menu(p,d,0);assert.equal(JSON.stringify(saved()[0]),before);assert.equal(p.container.getItem(0).amount,2);assert.equal(p.container.getItem(0).nameTag,'custom retained');}finally{world.setDynamicProperty=original;}
});
test('collection rollback keeps garments when inventory commit fails; creative dismantling has no drops',async()=>{
 const{d,p,b}=setup();p.mode='Creative';await place(p,b,'single_clothing_rail');p.container.setItem(0,new ItemStack(id('display_suit_black')));await menu(p,d,0);p.container.setItem(0);const before=JSON.stringify(saved()[0]);p.container.failOnce=true;await menu(p,d,2);assert.equal(JSON.stringify(saved()[0]),before);assert.equal(p.container.count(id('display_suit_black')),0);await menu(p,d,2);assert.equal(saved().length,0);assert.equal(p.container.count(id('display_suit_black')),1);assert.equal(p.container.count(id('single_clothing_rail')),0);
 await place(p,b,'single_clothing_rail');p.container.setItem(0,new ItemStack(id('display_coat')));await menu(p,d,0);state.hitEntity({hitEntity:d.getEntities().find(e=>e.getDynamicProperty('mcpe_food:part')==='base'),damagingEntity:p});assert.equal(saved().length,0);assert.equal(d.drops.length,0);
});
test('support loss recovers stored garments once and removes all associated display entities',async()=>{
 const{d,p,b}=setup();await place(p,b,'single_clothing_rail');p.container.setItem(0,new ItemStack(id('display_suit_light_gray')));await menu(p,d,1);d.put('minecraft:air',{x:0,y:0,z:0});reconcileDecor();reconcileDecor();assert.equal(saved().length,0);assert.equal(d.getEntities().length,0);assert.deepEqual(d.drops.map(x=>x.item.typeId).sort(),[id('single_clothing_rail'),id('display_suit_light_gray')].sort());
});
test('new floor fixtures support slabs and inverted stairs; upright stairs reject without consuming',async()=>{
 for(const k of ['single_clothing_rail','double_clothing_shelf','mannequin_display','full_length_mirror','ft_government_ultrabook_open','transit_ticket_gate'])for(const[type,states,allowed]of[['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'},true],['minecraft:oak_stairs',{upside_down_bit:true},true],['minecraft:oak_stairs',{upside_down_bit:false},false]]){const{d,p}=setup(),b=d.put(type,{x:0,y:0,z:0},states);await place(p,b,k);assert.equal(saved().length,allowed?1:0,k+type);if(!allowed)assert.equal(p.container.count(id(k)),1);else removeDecor(saved()[0],false);}
});
test('final FT laptop geometry is exactly perpendicular, cashier face is north, combined racks stay within 256 cubes',()=>{
 for(const entity of [false,true]){const g=geometry((entity?'surface_':'')+'ft_government_ultrabook_open',entity),cs=cubes(g),screen=cs.find(c=>c.uv.north?.uv_size[0]===96);assert.ok(screen);assert.deepEqual(screen.rotation,undefined);assert.equal(screen.size[2],.05);assert.equal(screen.size[1],7.7);const keyboard=cs.filter(c=>c.origin[1]>.8&&c.origin[1]<1);assert.ok(keyboard.length>=20);assert.ok(cs.every(c=>!c.rotation));}
 const checkout=cubes(geometry('supermarket_checkout'));assert.ok(checkout.some(c=>c.size[0]===7&&c.size[1]===4.4&&c.uv.north?.uv_size[0]===96));assert.ok(checkout.some(c=>c.size[0]===3.6&&c.uv.south?.uv_size[0]===96));
 for(const rack of rackSpecs){const base=cubes(geometry(rack.key)).length,variants=clothingVisuals.filter(v=>v.pose===rack.pose);const max=Math.max(...variants.map(v=>cubes(geometry('garment_'+v.visualKey,true)).length));assert.ok(base+max*rack.capacity<=256,rack.key);}
 for(const d of patch072Props){const cs=cubes(geometry(d.key)),maxY=Math.max(...cs.map(c=>c.origin[1]+c.size[1]));assert.ok(maxY<=32);assert.ok(cs.length<=256);}
});
test('all final garment poses match the editable source; mannequin trousers stay below the waist',async()=>{
 const{clothingGeometry}=await import('../tools/patch-072-art.mjs');
 for(const v of clothingVisuals)assert.deepEqual(read(`${rp}/models/entity/mcpe_food/garment_${v.visualKey}.geo.json`),clothingGeometry(v),v.visualKey);
 const v=clothingVisuals.find(v=>v.style==='trousers'&&v.pose==='mannequin'),cs=cubes(geometry('garment_'+v.visualKey,true));assert.equal(Math.max(...cs.map(c=>c.origin[1]+c.size[1])),17);
});
test('new tall props reject upper obstruction; info screen checks both backing cells and overlap, including unloaded backing',async()=>{
 for(const prop of patch072Props.filter(d=>d.height===2)){const{d,p,b}=setup();d.put('minecraft:stone',{x:0,y:2,z:0});await place(p,b,prop.key);assert.equal(saved().length,0,prop.key);}
 for(const key of ['platform_information_screen','government_queue_screen']){const{d,p,b}=setup();await place(p,b,key,'South');assert.equal(saved().length,0);d.put('minecraft:stone',{x:1,y:0,z:0});await place(p,b,key,'South');assert.equal(saved().length,1);await place(p,b,key,'South');assert.equal(saved().length,1);removeDecor(saved()[0],false);d.put('minecraft:stone',{x:1,y:0,z:1});await place(p,b,key,'South');assert.equal(saved().length,0);}
});
