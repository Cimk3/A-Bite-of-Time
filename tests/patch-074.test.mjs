import {addedDefinitions,addedBlocks,addedSurfaceCount,patch090Items,patch090Props,patch090Walls,slotIconEntries} from './patch-090-expectations.mjs';
import {patch082Items} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system} from './mock-server.mjs';
import {patch074Props,patch074Groups,patch074DigitalScreens,patch074WallVariants,patch074Screens} from '../.build/patch-074-catalog.js';
import {surfaceVisuals} from '../.build/decor-catalog.js';
import {digitalScreens,wallScreens} from '../.build/scenario-catalog.js';
import {clothingVisuals} from '../.build/patch-072-catalog.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';
registerHooks({resolve(s,c,next){const m=s==='@minecraft/server'?'mock-server.mjs':s==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return m?{url:new URL(m,import.meta.url).href,shortCircuit:true}:next(s,c);}});
await import('../.build/main.js');const{removeDecor,loadDecorRecords,reconcileDecor}=await import('../.build/decor-runtime.js');
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p)),id=k=>'mcpe_food:'+k;
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
async function tick(){flush();await new Promise(r=>setImmediate(r));flush();await new Promise(r=>setImmediate(r));}await tick();
afterEach(()=>{for(const r of saved())removeDecor(r,false);});
const normals={north:[0,0,-1],south:[0,0,1],east:[1,0,0],west:[-1,0,0]},rights={north:[-1,0,0],south:[1,0,0],east:[0,0,1],west:[0,0,-1]};
function setup(face='south',w=1,h=1){reset();const d=new FakeDimension(),p=new FakePlayer(d),n=normals[face],r=rights[face];p.location={x:.5+n[0]*3,y:1,z:.5+n[2]*3};for(let x=0;x<w;x++)for(let y=0;y<h;y++)d.put('minecraft:stone',{x:r[0]*x,y,z:r[2]*x});return{d,p,b:d.getBlock({x:0,y:0,z:0})};}
async function place(p,b,k,face='Up'){p.container.setItem(0,new ItemStack(id(k)));interact(p,b,true,face);await tick();return saved()[0];}
function cubes(g){return g.bones.flatMap(b=>b.cubes??[]);}
function geo(key,folder='blocks'){return read(`${rp}/models/${folder}/mcpe_food/${folder==='entity'?'surface_':''}${key}.geo.json`)['minecraft:geometry'][0];}
const lines=name=>readFileSync(`${bp}/functions/mcpe_food/${name}.mcfunction`,'utf8').trim().split('\n');
test('0.7.4 appends exact IDs, groups and display indices; 0.7.3 compatibility remains',()=>{
 const old=read('tests/fixtures/v0.7.3.json'),order=read('tests/fixtures/v0.7.3-displays.json');
 for(const kind of ['items','blocks']){const all=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);for(const k of old[kind])assert.ok(all.includes(k),k);assert.deepEqual(all.filter(k=>!old[kind].includes(k)&&![...patch080Props,...patch082Items,...patch085Props,...addedDefinitions].some(d=>id(d.key)===k)).sort(),[...patch074Props,...(kind==='items'?patch074DigitalScreens:[])].map(d=>id(d.key)).sort());}
 assert.equal(surfaceVisuals.length,609+patch085Props.length+addedSurfaceCount);assert.deepEqual(surfaceVisuals.slice(0,560).map(d=>d.key),order.surfaceKeys);assert.deepEqual(surfaceVisuals.slice(560,582).map(d=>d.key),[...patch074Props,...patch074WallVariants].map(d=>d.key));assert.deepEqual(clothingVisuals,order.clothingVisuals);assert.deepEqual(digitalScreens.slice(0,9),order.digitalScreens);assert.deepEqual(wallScreens.slice(0,11),order.wallScreens);assert.deepEqual(wallScreens.slice(11,13),patch074DigitalScreens);
 for(const[folder,entries]of[['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,h]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),h,f);
 for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}for(const[f,s]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${f}`)['minecraft:block'].description.states,s);
 for(const[f,content]of Object.entries(old.functions))if(!['tasting_new.mcfunction','digital_ad_screens.mcfunction','build_info.mcfunction','electronics.mcfunction'].includes(f))assert.equal(readFileSync(`${bp}/functions/mcpe_food/${f}`,'utf8').slice(0,['medical_equipment.mcfunction','military_police_equipment.mcfunction','digital_ad_screens.mcfunction'].includes(f)?content.length:undefined),content,f);
 assert.deepEqual(lines('digital_ad_screens').slice(0,9),old.functions['digital_ad_screens.mcfunction'].trim().split('\n'));assert.deepEqual(lines('tasting_new'),patch090Items.map(d=>`give @s ${id(d.key)} 4`));
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups,all=groups.flatMap(g=>g.items);assert.equal(new Set(all).size,all.length);for(const g of patch074Groups){assert.equal(g.items.length,7);assert.deepEqual(groups.find(x=>x.group_identifier.name==='mcpe_food:group_'+g.key).items.slice(0,7),g.items.map(d=>id(d.key)));assert.deepEqual(lines(g.key).slice(0,7),g.items.map(d=>`give @s ${id(d.key)} 4`));}
});
test('all equipment has 128px UV, bounded geometry, correct culling, and emission only on its screen island',()=>{
 for(const d of patch074Props){for(const folder of['blocks','entity']){const g=geo(d.key,folder),c=cubes(g);assert.ok(c.length<=256);assert.deepEqual([g.description.texture_width,g.description.texture_height],[128,128]);for(const x of c){assert.ok(x.origin[0]>=-8&&x.origin[0]+x.size[0]<=8,d.key);assert.ok(x.origin[2]>=-8&&x.origin[2]+x.size[2]<=8,d.key);assert.ok(x.origin[1]>=0&&x.origin[1]+x.size[1]<=16*d.height,d.key);}assert.ok(g.description.visible_bounds_offset[1]+g.description.visible_bounds_height/2>=d.height);}
  const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/patch074_${d.key}_mer.png`));assert.ok(emissionIsValid(mer,'patch074_'+d.key));assert.equal(mer.pixels.some((v,i)=>i%4===1&&v>0),patch074Screens.has(d.key));
 }
 for(const d of patch074Props.filter(d=>['electrical_distribution_cabinet','dry_type_transformer','standby_generator','field_news_camera','studio_news_camera','news_microphone_stand','news_backdrop','riot_shield_display','military_police_cabinet','radar_equipment'].includes(d.key))){const c=cubes(geo(d.key)),width=Math.max(...c.map(x=>x.origin[0]+x.size[0]))-Math.min(...c.map(x=>x.origin[0])),height=Math.max(...c.map(x=>x.origin[1]+x.size[1]));assert.ok(width>=14&&height>=24,d.key);}
 const prompt=cubes(geo('news_teleprompter')).find(c=>c.uv.north?.uv_size[0]===96);assert.ok(prompt);assert.deepEqual(prompt.uv.north.uv,[0,0]);assert.deepEqual(prompt.uv.north.uv_size,[96,56]);
});
test('large screens have independent 6:5 art, 6x5 geometry, fixed depth and bounded emission',()=>{
 const client=read(`${rp}/entity/mcpe_food/digital_ad_display.entity.json`)['minecraft:client_entity'].description;
 for(const d of patch074DigitalScreens){const g=read(`${rp}/models/entity/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],back=g.bones.find(b=>b.name==='ware').cubes,screen=g.bones.find(b=>b.name==='food').cubes[0],idx=wallScreens.indexOf(d);assert.deepEqual(back[0].size,[96,80,.8]);assert.ok(Math.abs(back[0].origin[2]+.8)<1e-7);assert.ok(screen.origin[2]<back[0].origin[2]);assert.deepEqual(screen.uv.north.uv,[0,0]);assert.deepEqual(screen.uv.north.uv_size,[384,320]);assert.equal(screen.uv.south,undefined);assert.ok(g.description.visible_bounds_width>=6&&g.description.visible_bounds_offset[1]+g.description.visible_bounds_height/2>=5);
  const path=client.textures['f'+idx],color=decodeRGBA(readFileSync(`${rp}/${path}.png`)),mer=decodeRGBA(readFileSync(`${rp}/${path}_mer.png`));assert.deepEqual([color.width,color.height,mer.width,mer.height],[384,320,384,320]);assert.ok(emissionIsValid(mer,path.split('/').at(-1)));assert.ok(mer.pixels.some((v,i)=>i%4===1&&v>0));
 }
});
test('new floor equipment faces the player and restores without changing the saved record',async()=>{
 for(const item of patch074Props.filter(d=>!d.wallOnly))for(const[x,z,code]of[[3,1,2],[-3,1,4],[1,-3,1],[1,3,3],[0,0,2]]){const{d,p,b}=setup();p.location={x:.5+x,y:1,z:.5+z};p.getRotation=()=>({x:0,y:90});const r=await place(p,b,item.key);assert.ok(r,item.key);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),code,item.key);const before=JSON.stringify(r);d.unloaded=true;loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);d.unloaded=false;d.getEntities()[0].remove();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);assert.equal(d.getEntities().length,1);removeDecor(r,false);}
});
test('wall meter and both large screens face outward on all four walls and survive recovery',async()=>{
 for(const face of Object.keys(normals))for(const item of [{key:'wall_electric_meter',width:1,height:1},...patch074DigitalScreens]){const{d,p,b}=setup(face,item.width,item.height),r=await place(p,b,item.key,face);assert.ok(r,item.key+face);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),{north:1,east:2,south:3,west:4}[face]);const snapshot=JSON.stringify(r);d.getEntities()[0].remove();loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),snapshot);assert.equal(d.getEntities().length,1);removeDecor(r,false);}
 const g=geo('wall_electric_meter_wall'),c=cubes(g);assert.ok(Math.abs(Math.max(...c.map(x=>x.origin[2]+x.size[2])))<1e-7);assert.ok(c.some(x=>x.origin[2]<0&&x.uv.north));
});
test('all 30 screen cells reject missing backing, blocked air, and overlapping wall displays',async()=>{
 for(const face of Object.keys(normals))for(const item of patch074DigitalScreens){const n=normals[face],r=rights[face],{d,p,b}=setup(face,6,5),edge={x:r[0]*5,y:4,z:r[2]*5};d.put('minecraft:air',edge);await place(p,b,item.key,face);assert.equal(saved().length,0);d.put('minecraft:stone',edge);d.put('minecraft:stone',{x:edge.x+n[0],y:edge.y,z:edge.z+n[2]});await place(p,b,item.key,face);assert.equal(saved().length,0);d.put('minecraft:air',{x:edge.x+n[0],y:edge.y,z:edge.z+n[2]});await place(p,b,'wall_electric_meter',face);assert.equal(saved().length,1);await place(p,b,item.key,face);assert.equal(saved().length,1);assert.equal(p.container.count(id(item.key)),1);removeDecor(saved()[0],false);await place(p,b,item.key,face);assert.equal(saved().length,1);d.unloaded=true;reconcileDecor();assert.equal(saved().length,1);d.unloaded=false;d.put('minecraft:air',edge);reconcileDecor();assert.equal(saved().length,0);assert.equal(d.drops.length,1);}
});
test('floor supports, blocked upper cells and spawn/collection failure preserve inventory',async()=>{
 for(const item of patch074Props.filter(d=>!d.wallOnly))for(const[type,states,allowed]of[['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'},true],['minecraft:oak_stairs',{upside_down_bit:true},true],['minecraft:oak_stairs',{upside_down_bit:false},false]]){const{d,p}=setup(),b=d.put(type,{x:0,y:0,z:0},states);await place(p,b,item.key);assert.equal(saved().length,allowed?1:0,item.key);if(allowed)removeDecor(saved()[0],false);else assert.equal(p.container.count(id(item.key)),1);}
 const{d,p,b}=setup();d.put('minecraft:stone',{x:0,y:2,z:0});await place(p,b,'standby_generator');assert.equal(saved().length,0);d.put('minecraft:air',{x:0,y:2,z:0});d.failSpawn=true;await place(p,b,'standby_generator');assert.equal(saved().length,0);assert.equal(p.container.count(id('standby_generator')),1);d.failSpawn=false;await place(p,b,'standby_generator');p.container.setItem(0);for(let i=0;i<p.container.size;i++)p.container.setItem(i,new ItemStack('minecraft:stone',64));state.responses.push({selection:0});state.entityInteract({player:p,target:d.getEntities()[0]});await tick();assert.equal(saved().length,1);
});
test('large screens reject overlap with a floor display or a paper advertisement, and stale collection cannot duplicate',async()=>{
 const{d,p,b}=setup('south',6,5),floor=d.put('minecraft:stone',{x:1,y:-1,z:1});await place(p,floor,'electrician_toolbox');assert.equal(saved().length,1);await place(p,b,'digital_apple_6x5','south');assert.equal(saved().length,1);removeDecor(saved()[0],false);
 state.responses.push({selection:0});await place(p,b,'ad_ft_computer','south');assert.equal(saved().length,1);await place(p,b,'digital_apple_6x5','south');assert.equal(saved().length,1);removeDecor(saved()[0],false);
 await place(p,b,'digital_apple_6x5','south');assert.equal(saved().length,1);p.container.setItem(0);let resolve;state.responses.push(new Promise(r=>resolve=r));interact(p,b,true,'south');await tick();const q=new FakePlayer(d);q.location={...p.location};system.currentTick+=10;state.responses.push({selection:0});interact(q,b,true,'south');await tick();assert.equal(saved().length,0);resolve({selection:0});await tick();assert.equal(p.container.count(id('digital_apple_6x5')),0);assert.equal(q.container.count(id('digital_apple_6x5')),1);
});
test('every backing and front cell is required by each 6x5 screen on all wall faces',async()=>{
 for(const face of Object.keys(normals))for(const item of patch074DigitalScreens){const n=normals[face],right=rights[face],{d,p}=setup(face,6,5);for(let x=0;x<6;x++)for(let y=0;y<5;y++){const wall={x:right[0]*x,y,z:right[2]*x},front={x:wall.x+n[0],y,z:wall.z+n[2]};d.put('minecraft:air',wall);await place(p,d.getBlock({x:0,y:0,z:0}),item.key,face);assert.equal(saved().length,0,`${item.key} ${face} missing ${x},${y}`);d.put('minecraft:stone',wall);d.put('minecraft:stone',front);await place(p,d.getBlock({x:0,y:0,z:0}),item.key,face);assert.equal(saved().length,0,`${item.key} ${face} blocked ${x},${y}`);d.put('minecraft:air',front);}}
});
test('large screen spawn and collection inventory failure roll back',async()=>{
 const{d,p,b}=setup('south',6,5);d.failSpawn=true;await place(p,b,'digital_ft_computer_6x5','south');assert.equal(saved().length,0);assert.equal(p.container.count(id('digital_ft_computer_6x5')),1);d.failSpawn=false;await place(p,b,'digital_ft_computer_6x5','south');p.container.setItem(0);p.container.failOnce=true;state.responses.push({selection:0});interact(p,b,true,'south');await tick();assert.equal(saved().length,1);assert.equal(p.container.count(id('digital_ft_computer_6x5')),0);
});

test('old screen models and decoded artwork remain identical to the released 0.7.3',()=>{
 const client=read(`${rp}/entity/mcpe_food/digital_ad_display.entity.json`)['minecraft:client_entity'].description;
 for(const [i,d] of wallScreens.slice(0,11).entries()){const path=`${rp}/models/entity/mcpe_food/${d.key}.geo.json`,previous=JSON.parse(execFileSync('git',['show',`v0.7.3:${path}`],{encoding:'utf8',maxBuffer:5e6}));assert.deepEqual(read(path),previous,d.key);const texture=`${rp}/${client.textures['f'+i]}.png`,before=decodeRGBA(execFileSync('git',['show',`v0.7.3:${texture}`],{maxBuffer:10e6})),now=decodeRGBA(readFileSync(texture));assert.equal(now.width,before.width);assert.equal(now.height,before.height);assert.deepEqual(now.pixels,before.pixels,d.key);}
});
test('new equipment is creative-only static content without wearable or food components',()=>{
 for(const d of [...patch074Props,...patch074DigitalScreens]){const item=read(`${bp}/items/${d.key}.json`)['minecraft:item'];assert.equal(item.description.menu_category.category,'items');for(const name of ['minecraft:wearable','minecraft:food','minecraft:use_animation','minecraft:weapon','minecraft:shooter','minecraft:cooldown'])assert.equal(item.components[name],undefined,d.key);}
 const readme=readFileSync('README.md','utf8');assert.ok(!/^#+\s+.*(?:0\.\d+\.\d+|版本更新|更新历史|发布记录)/m.test(readme));
});
