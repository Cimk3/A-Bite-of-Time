import {patch082Items} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system} from './mock-server.mjs';
registerHooks({resolve(specifier,context,next){const mock=specifier==='@minecraft/server'?'mock-server.mjs':specifier==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);}});
await import('../.build/main.js');
const {removeDecor,reconcileDecor,loadDecorRecords}=await import('../.build/decor-runtime.js');
const {scenarioProps,scenarioGroups,legacyDigitalScreens:digitalScreens,wallKeys,scenarioScreens}=await import('../.build/scenario-catalog.js');
const {surfaceVisuals,advertisements}=await import('../.build/decor-catalog.js');
const {surfaceHeight,isWallSupport}=await import('../.build/supports.js');
const {decodeRGBA}=await import('../tools/png-inspect.mjs');
const {emissionIsValid}=await import('../tools/emission-policy.mjs');
const read=p=>JSON.parse(readFileSync(p,'utf8')),bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
const idle=()=>new Promise(resolve=>setImmediate(resolve));async function tick(){flush();await idle();flush();await idle();}
await tick();
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
afterEach(()=>{for(const r of saved())removeDecor(r,false);state.responses=[];});
function setup(){reset();const dimension=new FakeDimension(),player=new FakePlayer(dimension);player.location={x:.5,y:1,z:3};return{dimension,player};}
function wall(d,w=1,h=1,face='South'){for(let x=0;x<w;x++)for(let y=0;y<h;y++)d.put('minecraft:stone',{x:face==='South'?x:-x,y,z:0});return d.getBlock({x:0,y:0,z:0});}
async function place(p,b,key,face='Up'){p.container.setItem(0,new ItemStack('mcpe_food:'+key));interact(p,b,true,face);await tick();}
test('0.7.0 adds exactly 43 public items and preserves all old IDs, recipes, drops, UUIDs and 496 indices',()=>{
 const old=read('tests/fixtures/v0.6.0.json'),expected=[...scenarioProps,...digitalScreens,...advertisements.slice(20)].map(d=>'mcpe_food:'+d.key).sort();
 for(const kind of ['items','blocks']){const keys=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);for(const id of old[kind])assert.ok(keys.includes(id));assert.deepEqual(keys.filter(k=>!old[kind].includes(k)&&![...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch074DigitalScreens,...patch080Props,...patch082Items,...patch085Props].some(d=>'mcpe_food:'+d.key===k)).sort(),kind==='items'?expected:scenarioProps.map(d=>'mcpe_food:'+d.key).sort());}
 assert.equal(expected.length,43);assert.equal(scenarioProps.length,31);assert.deepEqual(surfaceVisuals.slice(0,496).map(x=>x.key),read('tests/fixtures/v0.6.0-surfaces.json'));assert.equal(surfaceVisuals.length,609+patch085Props.length);assert.equal(advertisements.length,23);
 for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,sha]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),sha);
 for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups;assert.deepEqual(groups.filter(g=>scenarioGroups.some(s=>g.group_identifier.name==='mcpe_food:group_'+s.key)).map(g=>g.items.length),[20+patch085Props.length,3,3,7,16,3]);assert.equal(groups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics').items.length,42);assert.equal(readFileSync(`${bp}/functions/mcpe_food/tasting_new.mcfunction`,'utf8').trim().split('\n').length,patch085Props.length);assert.equal(readFileSync(`${bp}/functions/mcpe_food/electronics.mcfunction`,'utf8').split('\n').slice(0,41).join('\n')+'\n',old.functions['electronics.mcfunction']);
 for(const g of scenarioGroups)assert.ok(readFileSync(`${bp}/functions/mcpe_food/${g.key}.mcfunction`,'utf8').includes(g.items[0].key));
});
test('all authored scenario models fit physical heights, 128px UV, cube budgets and precise emission whitelist',()=>{
 for(const d of scenarioProps){const g=read(`${rp}/models/blocks/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],c=g.bones.flatMap(b=>b.cubes??[]);assert.equal(g.description.texture_width,128);assert.ok(c.length>3&&c.length<=256);for(const b of c){assert.ok(b.origin[0]>=-8&&b.origin[0]+b.size[0]<=8);assert.ok(b.origin[2]>=-8&&b.origin[2]+b.size[2]<=8);assert.ok(b.origin[1]>=0&&b.origin[1]+b.size[1]<=d.height*16);for(const f of Object.values(b.uv))assert.ok(f.uv[0]>=0&&f.uv[1]>=0&&f.uv[0]+f.uv_size[0]<=128&&f.uv[1]+f.uv_size[1]<=128);}
  const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/scenario_${d.key}_mer.png`));assert.ok(emissionIsValid(mer,'scenario_'+d.key));assert.equal(mer.pixels.some((v,i)=>i%4===1&&v>0),scenarioScreens.has(d.key));
 }
 const invalid={width:128,height:128,pixels:new Uint8Array(128*128*4)};invalid.pixels[127*4+1]=12;assert.equal(emissionIsValid(invalid,'scenario_patient_monitor'),false);
});
test('all nine digital panels have exact physical dimensions, constant depth, fitted layouts and nonemissive frames',()=>{
 const client=read(`${rp}/entity/mcpe_food/digital_ad_display.entity.json`)['minecraft:client_entity'].description;assert.equal(Object.keys(client.geometry).length,14);
 for(const d of digitalScreens){const g=read(`${rp}/models/entity/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],frame=g.bones.find(b=>b.name==='ware').cubes;assert.deepEqual(frame[0].size,[d.width*16,d.height*16,.8]);assert.equal(g.description.texture_width,256);assert.equal(g.description.texture_height,d.width===d.height?256:192);const alias=client.textures['f'+digitalScreens.indexOf(d)],mer=decodeRGBA(readFileSync(`${rp}/${alias}_mer.png`));assert.ok(emissionIsValid(mer,alias.split('/').at(-1)));assert.ok(frame.every(c=>c.origin[2]>=-1.4-1e-7&&c.origin[2]+c.size[2]<=1e-7));}
 const mer=decodeRGBA(readFileSync(`${rp}/textures/entity/mcpe_food/digital_frame_mer.png`));assert.ok(mer.pixels.every((v,i)=>i%4!==1||v===0));
});
test('inverted stairs support old props, new props and refrigerator; upright stairs and wall mounting stay rejected',async()=>{
 for(const key of ['glass','patient_monitor','fridge_single_white']){const {dimension,player}=setup(),b=dimension.put('minecraft:oak_stairs',{x:0,y:0,z:0},{upside_down_bit:true});assert.equal(surfaceHeight(b),1);assert.equal(isWallSupport(b),false);await place(player,b,key);assert.equal(saved().length,1);assert.equal(b.typeId,'minecraft:oak_stairs');for(const r of saved())removeDecor(r,false);}
 const {dimension,player}=setup(),b=dimension.put('minecraft:oak_stairs',{x:0,y:0,z:0},{upside_down_bit:false});await place(player,b,'patient_monitor');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:patient_monitor'),1);await place(player,b,'aed_cabinet','South');assert.equal(saved().length,0);
});
test('all wall-enabled props restore on four faces, never fill the wall, and wall-only props reject top placement',async()=>{
 for(const key of wallKeys)for(const face of ['North','South','East','West']){const{dimension,player}=setup(),b=wall(dimension);await place(player,b,key,face);const r=saved()[0];assert.ok(r,key+face);assert.equal(r.wallFace,face.toLowerCase());assert.equal(b.typeId,'minecraft:stone');const owner=r.uid;loadDecorRecords();reconcileDecor();assert.equal(saved()[0].uid,owner);assert.equal(dimension.getEntities().length,1);removeDecor(r,false);}
 const{dimension,player}=setup();await place(player,wall(dimension),'aed_cabinet');assert.equal(saved().length,0);
});
test('every digital screen checks its full wall, saves its fixed variant and restores without duplicate entities',async()=>{
 for(const d of digitalScreens){const{dimension,player}=setup(),b=wall(dimension,d.width,d.height);await place(player,b,d.key,'South');const r=saved()[0];assert.equal(r.definition,'mcpe_food:'+d.key);assert.equal(r.kind,'digital_ad');loadDecorRecords();reconcileDecor();assert.equal(dimension.getEntities().length,1);dimension.unloaded=true;reconcileDecor();assert.equal(saved().length,1);dimension.unloaded=false;dimension.put('minecraft:air',{x:d.width-1,y:d.height-1,z:0});reconcileDecor();assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);}
});
test('high props, blocked screen corners, overlapping posters and duplicate placements reject without consumption',async()=>{
 const{dimension,player}=setup(),b=wall(dimension,4,4);dimension.put('minecraft:stone',{x:3,y:3,z:1});await place(player,b,'digital_ft_computer_4x4','South');assert.equal(saved().length,0);dimension.put('minecraft:air',{x:3,y:3,z:1});await place(player,b,'digital_ft_computer_4x4','South');assert.equal(saved().length,1);await place(player,b,'digital_ft_computer_4x4','South');assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:digital_ft_computer_4x4'),1);
 state.responses.push({selection:0});await place(player,b,'ad_ft_computer','South');assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:ad_ft_computer'),1);removeDecor(saved()[0],false);
 const base=dimension.put('minecraft:stone',{x:0,y:0,z:4});dimension.put('minecraft:stone',{x:0,y:2,z:4});await place(player,base,'arcade_cabinet');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:arcade_cabinet'),1);
});
test('wall spawn failure rolls back inventory and saved instance; creative placement consumes nothing',async()=>{
 const{dimension,player}=setup(),b=wall(dimension);dimension.failSpawn=true;await place(player,b,'aed_cabinet','South');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:aed_cabinet'),1);dimension.failSpawn=false;player.mode='Creative';await place(player,b,'aed_cabinet','South');assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:aed_cabinet'),1);
});
test('screen collection checks revision and inventory, and support breaks clean all anchored panels once',async()=>{
 const{dimension,player}=setup(),b=wall(dimension,2,2);await place(player,b,'digital_luna_studio_2x2','South');player.container.setItem(0,undefined);for(let i=1;i<36;i++)player.container.setItem(i,new ItemStack('minecraft:stone',64));player.container.setItem(0,new ItemStack('minecraft:stone',64));state.responses.push({selection:0});interact(player,b,true,'South');await tick();assert.equal(saved().length,1);
 player.container.setItem(0,undefined);system.currentTick+=10;state.responses.push({selection:0});interact(player,b,true,'South');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:digital_luna_studio_2x2'),1);system.currentTick+=10;
 await place(player,b,'digital_luna_studio_2x2','South');const event={player,block:b,cancel:false};state.breakBlock(event);await tick();assert.equal(event.cancel,false);assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);
});
test('a pending wall collection cannot duplicate an item removed by another player',async()=>{
 const{dimension,player}=setup(),b=wall(dimension);await place(player,b,'aed_cabinet','South');player.container.setItem(0,undefined);
 let resolve;state.responses.push(new Promise(r=>resolve=r));interact(player,b,true,'South');await tick();
 const other=new FakePlayer(dimension);other.location={...player.location};state.responses.push({selection:0});interact(other,b,true,'South');await tick();assert.equal(saved().length,0);assert.equal(other.container.count('mcpe_food:aed_cabinet'),1);
 resolve({selection:0});await tick();assert.equal(player.container.count('mcpe_food:aed_cabinet'),0);assert.equal(dimension.drops.length,0);
});
test('a rejected inventory write rolls back the wall instance and preserves the exact held stack',async()=>{
 const{dimension,player}=setup(),b=wall(dimension);player.container.setItem(0,new ItemStack('mcpe_food:aed_cabinet',2));player.container.items[0].nameTag='original';player.container.failOnce=true;
 interact(player,b,true,'South');await tick();assert.equal(saved().length,0);assert.equal(player.container.getItem(0).amount,2);assert.equal(player.container.getItem(0).nameTag,'original');assert.equal(dimension.getEntities().length,0);
});
test('entity collection failure is caught and rolls back without an unhandled menu rejection',async()=>{
 const{dimension,player}=setup(),b=wall(dimension);await place(player,b,'aed_cabinet','South');player.container.setItem(0,undefined);player.container.failOnce=true;state.responses.push({selection:0});state.entityInteract({player,target:dimension.getEntities()[0],cancel:false});await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:aed_cabinet'),0);assert.ok(player.actions.some(s=>s.includes('操作未完成')));
});
