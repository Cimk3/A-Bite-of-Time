import {patch082Items} from '../.build/patch-082-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import test,{afterEach}from'node:test';import assert from'node:assert/strict';
import{readFileSync,readdirSync}from'node:fs';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';import{registerHooks}from'node:module';
import{state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system}from'./mock-server.mjs';
registerHooks({resolve(s,c,next){const m=s==='@minecraft/server'?'mock-server.mjs':s==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return m?{url:new URL(m,import.meta.url).href,shortCircuit:true}:next(s,c);}});
await import('../.build/main.js');const{removeDecor,loadDecorRecords,reconcileDecor}=await import('../.build/decor-runtime.js');
const{patch073Props,governmentKeys}=await import('../.build/patch-073-catalog.js');const{surfaceVisuals}=await import('../.build/decor-catalog.js');const{clothingVisuals}=await import('../.build/patch-072-catalog.js');const{digitalScreens,wallScreens}=await import('../.build/scenario-catalog.js');
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p)),id=k=>'mcpe_food:'+k;
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
async function tick(){flush();await new Promise(r=>setImmediate(r));flush();await new Promise(r=>setImmediate(r));}await tick();afterEach(()=>{for(const r of saved())removeDecor(r,false);});
function setup(){reset();const d=new FakeDimension(),p=new FakePlayer(d);p.location={x:.5,y:1,z:3.5};return{d,p,b:d.put('minecraft:stone',{x:0,y:0,z:0})};}
async function place(p,b,key){p.container.setItem(0,new ItemStack(id(key)));interact(p,b);await tick();return saved()[0];}
async function collect(p,d,response={selection:0}){system.currentTick+=10;state.responses.push(response);state.entityInteract({player:p,target:d.getEntities()[0]});await tick();}
const geo=(key,entity=false)=>read(`${rp}/models/${entity?'entity':'blocks'}/mcpe_food/${entity?'surface_':''}${key}.geo.json`)['minecraft:geometry'][0],cs=g=>g.bones.flatMap(b=>b.cubes??[]);
test('0.7.3 adds exactly ten creative items/blocks and preserves all 0.7.2 compatibility contracts',()=>{
 const old=read('tests/fixtures/v0.7.2.json'),order=read('tests/fixtures/v0.7.2-displays.json');
 for(const kind of['items','blocks']){const all=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);assert.deepEqual(all.filter(k=>!old[kind].includes(k)&&![...patch074Props,...patch074DigitalScreens,...patch080Props,...patch082Items].some(d=>id(d.key)===k)).sort(),patch073Props.map(d=>id(d.key)).sort());for(const k of old[kind])assert.ok(all.includes(k));}
 assert.equal(surfaceVisuals.length,609);assert.deepEqual(surfaceVisuals.slice(0,550).map(d=>d.key),order.surfaceKeys);assert.deepEqual(clothingVisuals,order.clothingVisuals);assert.deepEqual(digitalScreens.slice(0,9),order.digitalScreens);assert.deepEqual(wallScreens.slice(0,11),order.wallScreens);
 for(const[folder,entries]of[['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,h]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),h,f);
 for(const[pack,ids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],ids);}for(const[f,s]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${f}`)['minecraft:block'].description.states,s);
});
test('government classification contains eleven unique members; legacy commands retain exact prefixes',()=>{
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups,all=groups.flatMap(g=>g.items);assert.equal(new Set(all).size,all.length);
 assert.deepEqual(groups.find(g=>g.group_identifier.name==='mcpe_food:group_government_equipment').items,governmentKeys.map(id));assert.equal(governmentKeys.length,11);assert.equal(groups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics').items.length,42);assert.equal(groups.find(g=>g.group_identifier.name==='mcpe_food:group_office_stationery').items.length,8);
 for(const k of governmentKeys)assert.equal(read(`${bp}/items/${k}.json`)['minecraft:item'].description.menu_category.group,'mcpe_food:group_government_equipment');
 const old=read('tests/fixtures/v0.7.2.json'),command=n=>readFileSync(`${bp}/functions/mcpe_food/${n}.mcfunction`,'utf8').trim().split('\n');assert.deepEqual(command('electronics').slice(0,46),old.functions['electronics.mcfunction'].trim().split('\n'));assert.equal(command('electronics').length,52);assert.equal(command('government_equipment').length,11);assert.equal(command('tasting_new').length,17);assert.equal(command('office_stationery').join('\n')+'\n',old.functions['office_stationery.mcfunction']);assert.deepEqual(command('tasting_all_chinese').slice(0,-1),old.functions['tasting_all_chinese.mcfunction'].trim().split('\n'));assert.equal(command('tasting_all_chinese').at(-1),'give @s mcpe_food:chinese_five_sauce_set 4');
});
test('five sauces form one nonedible set with exactly five dishes, rear three/front two and valid total budget',()=>{
 const item=read(`${bp}/items/chinese_five_sauce_set.json`)['minecraft:item'];assert.equal(item.description.menu_category.group,'mcpe_food:group_chinese');assert.equal(item.components['minecraft:food'],undefined);assert.equal(item.components['minecraft:use_animation'],undefined);
 const c=cs(geo('chinese_five_sauce_set')),liquid=c.filter(c=>Math.abs(c.origin[1]-.74)<1e-7&&Math.abs(c.size[1]-.23)<1e-7);assert.equal(liquid.length,40);const pigments=new Set(liquid.map(c=>Object.values(c.uv)[0].uv[1]));assert.equal(pigments.size,5);assert.equal(liquid.filter(c=>c.origin[2]>0).length,24);assert.equal(liquid.filter(c=>c.origin[2]<0).length,16);assert.ok(c.length<=256);assert.equal(c.length,136);
 const loot=read(`${bp}/loot_tables/blocks/chinese_five_sauce_set.json`).pools;assert.equal(loot.length,1);assert.equal(loot[0].entries[0].name,id('chinese_five_sauce_set'));
});
test('three independent FT models have final vertical front screens, horizontal keyboards and separated shell depth',()=>{
 const widths=[];for(const d of patch073Props.filter(d=>d.group==='electronics'))for(const entity of[false,true]){const c=cs(geo(d.key,entity)),screen=c.find(c=>c.uv.north?.uv_size[0]===96);assert.ok(screen,d.key);assert.equal(screen.size[2],.04);assert.ok(screen.size[1]>7);assert.ok(!screen.rotation);const shell=c.find(c=>c.size[2]===.55&&c.size[1]>8);assert.ok(shell);assert.ok(screen.origin[2]+screen.size[2]<shell.origin[2]);assert.ok(c.filter(c=>Math.abs(c.size[1]-.08)<1e-7).length>=48);assert.ok(c.every(c=>!c.rotation));if(!entity)widths.push(shell.size[0]);}assert.equal(new Set(widths).size,3);
});
test('new private 128px assets obey cube/physical bounds and emission islands, including all sauces and specimen card',async()=>{
 const{decodeRGBA}=await import('../tools/png-inspect.mjs');const{emissionIsValid}=await import('../tools/emission-policy.mjs');const{patch073Cubes}=await import('../tools/patch-073-art.mjs');
 for(const d of patch073Props){const g=geo(d.key),c=cs(g);assert.equal(g.description.texture_width,128);assert.equal(g.description.texture_height,128);assert.ok(c.length<=256);for(const x of c){assert.ok(x.origin[0]>=-8&&x.origin[0]+x.size[0]<=8);assert.ok(x.origin[2]>=-8&&x.origin[2]+x.size[2]<=8);assert.ok(x.origin[1]>=0&&x.origin[1]+x.size[1]<=16*d.height);}const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/patch073_${d.key}_mer.png`));assert.ok(emissionIsValid(mer,'patch073_'+d.key));for(let y=56;y<128;y++)for(let x=0;x<128;x++)assert.equal(mer.pixels[(y*128+x)*4+1],0);if(['government_stamp_set','chinese_five_sauce_set','government_fingerprint_scanner','government_document_scanner'].includes(d.key))assert.ok(mer.pixels.every((v,i)=>i%4!==1||v===0));assert.equal(c.length,patch073Cubes(d.key).length);}
});
test('old government and laptop final geometry remains identical to immutable v0.7.2',()=>{
 for(const key of['ft_government_desktop','ft_government_all_in_one','ft_government_ultrabook_open','government_queue_screen','upright_archive_cabinet','macbook_open','thinkpad_open','silver_laptop_open'])for(const dir of['blocks','entity']){const p=`${rp}/models/${dir}/mcpe_food/${dir==='entity'?'surface_':''}${key}.geo.json`;assert.deepEqual(read(p),JSON.parse(execFileSync('git',['show',`v0.7.2:${p}`],{encoding:'utf8',maxBuffer:5e6})));}
});
test('new displays publish nearest cardinal in all quadrants and center fallback; stored records restore without revision changes',async()=>{
 for(const item of patch073Props)for(const[x,z,code]of[[3,1,2],[-3,1,4],[1,-3,1],[1,3,3],[0,0,2]]){const{d,p,b}=setup();p.location={x:.5+x,y:1,z:.5+z};p.getRotation=()=>({x:0,y:90});const r=await place(p,b,item.key);assert.ok(r,item.key);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),code);const before=JSON.stringify(r);d.unloaded=true;loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);d.unloaded=false;d.getEntities()[0].remove();reconcileDecor();assert.equal(d.getEntities().length,1);assert.equal(JSON.stringify(saved()[0]),before);removeDecor(r,false);}
});
test('sauce collection returns exactly one set, no empty dishes; stale/full hand, competing confirmations and commit failure cannot duplicate',async()=>{
 const{d,p,b}=setup();await place(p,b,'chinese_five_sauce_set');p.container.failOnce=true;await collect(p,d);assert.equal(saved().length,1);assert.equal(p.container.count(id('chinese_five_sauce_set')),0);
 let resolve;await collect(p,d,new Promise(r=>resolve=r));for(let i=0;i<p.container.size;i++)p.container.setItem(i,new ItemStack('minecraft:stone',64));resolve({selection:0});await tick();assert.equal(saved().length,1);p.container.setItem(0);
 const q=new FakePlayer(d);q.location={...p.location};await collect(p,d,new Promise(r=>resolve=r));await collect(q,d);resolve({selection:0});await tick();assert.equal(saved().length,0);assert.equal(q.container.count(id('chinese_five_sauce_set')),1);assert.equal(p.container.count(id('chinese_five_sauce_set')),0);assert.equal(q.container.count(id('plate')),0);assert.equal(q.container.count(id('bowl')),0);
});
test('new displays support slabs/inverted stairs; upright stairs and blocked kiosk upper space reject; spawn failure rolls back',async()=>{
 for(const item of patch073Props)for(const[type,states,allowed]of[['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'},true],['minecraft:oak_stairs',{upside_down_bit:true},true],['minecraft:oak_stairs',{upside_down_bit:false},false]]){const{d,p}=setup(),b=d.put(type,{x:0,y:0,z:0},states);await place(p,b,item.key);assert.equal(saved().length,allowed?1:0,item.key+type);if(allowed)removeDecor(saved()[0],false);else assert.equal(p.container.count(id(item.key)),1);}
 const{d,p,b}=setup();d.put('minecraft:stone',{x:0,y:2,z:0});await place(p,b,'government_service_kiosk');assert.equal(saved().length,0);d.put('minecraft:air',{x:0,y:2,z:0});d.failSpawn=true;await place(p,b,'chinese_five_sauce_set');assert.equal(saved().length,0);assert.equal(p.container.count(id('chinese_five_sauce_set')),1);
});

test('signature text bottom follows local -Z front without rotating the source image; specimen card uses a non-emissive UV island',()=>{
 const screen=cs(geo('government_signature_pad')).find(c=>Math.abs(c.size[1]-.04)<1e-7&&c.size[0]===8.8);assert.deepEqual(screen.uv.up.uv,[96,0]);assert.deepEqual(screen.uv.up.uv_size,[-96,56]);
 // On the upper face, v=56 is on z-min, and u increases towards x-min:
 // the text bottom is at the device front, left/right are correct from that side.
 assert.ok(screen.origin[2]<screen.origin[2]+screen.size[2]);
 const card=cs(geo('government_id_reader')).find(c=>c.uv.up?.uv_size[0]===-80);assert.ok(card);assert.deepEqual(card.uv.up.uv,[80,64]);
});
