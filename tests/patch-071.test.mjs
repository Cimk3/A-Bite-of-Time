import {patch082Items} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import test,{afterEach} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system} from './mock-server.mjs';
registerHooks({resolve(s,c,next){const mock=s==='@minecraft/server'?'mock-server.mjs':s==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(s,c);}});
await import('../.build/main.js');
const {removeDecor,loadDecorRecords,reconcileDecor}=await import('../.build/decor-runtime.js');
const {surfaceVisuals}=await import('../.build/decor-catalog.js');const{wallVariants,legacyDigitalScreens:digitalScreens}=await import('../.build/scenario-catalog.js');const{patch071Props}=await import('../.build/patch-071-catalog.js');
const{decodeRGBA}=await import('../tools/png-inspect.mjs');const{emissionIsValid}=await import('../tools/emission-policy.mjs');
const read=p=>JSON.parse(readFileSync(p,'utf8')),bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',geo=k=>read(`${rp}/models/blocks/mcpe_food/${k}.geo.json`)['minecraft:geometry'][0],cubes=g=>g.bones.flatMap(b=>b.cubes??[]),sha=x=>createHash('sha256').update(x).digest('hex');
const idle=()=>new Promise(r=>setImmediate(r));async function tick(){flush();await idle();flush();await idle();}await tick();
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));afterEach(()=>{for(const r of saved())removeDecor(r,false);});
const near=(a,b,eps=1e-7)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);
// Independent native entity transform; deliberately does not call screenNormal.
const worldVector=([x,y,z],yaw)=>{const t=yaw*Math.PI/180;return[x*Math.cos(t)-z*Math.sin(t),y,x*Math.sin(t)+z*Math.cos(t)];};
const normals={north:[0,0,-1],south:[0,0,1],east:[1,0,0],west:[-1,0,0]},rights={north:[-1,0,0],south:[1,0,0],east:[0,0,1],west:[0,0,-1]};
function setup(face='south',w=1,h=1){reset();const d=new FakeDimension(),p=new FakePlayer(d),n=normals[face],r=rights[face];p.location={x:.5+n[0]*3,y:1,z:.5+n[2]*3};for(let x=0;x<w;x++)for(let y=0;y<h;y++)d.put('minecraft:stone',{x:r[0]*x,y,z:r[2]*x});return{d,p,b:d.getBlock({x:0,y:0,z:0})};}
async function place(p,b,key,face='Up'){p.container.setItem(0,new ItemStack('mcpe_food:'+key));interact(p,b,true,face);await tick();return saved()[0];}
test('0.7.1 appends only four public items/blocks and keeps every prior ID, UUID, recipe, drop and visual index',()=>{
 const old=read('tests/fixtures/v0.7.0.json');for(const kind of ['items','blocks']){const ids=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);assert.deepEqual(ids.filter(k=>!old[kind].includes(k)&&![...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch074DigitalScreens,...patch080Props,...patch082Items,...patch085Props].some(d=>'mcpe_food:'+d.key===k)).sort(),patch071Props.map(d=>'mcpe_food:'+d.key).sort());for(const id of old[kind])assert.ok(ids.includes(id));}
 assert.deepEqual(surfaceVisuals.slice(0,534).map(d=>d.key),read('tests/fixtures/v0.7.0-surfaces.json'));assert.equal(surfaceVisuals.length,609+patch085Props.length);assert.deepEqual(digitalScreens,read('tests/fixtures/v0.7.0-digital.json'));
 for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
 for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,h]of Object.entries(entries))assert.equal(sha(readFileSync(`${bp}/${folder}/${f}`)),h);
 for(const[f,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${f}`)['minecraft:block'].description.states,states);
 const lines=name=>readFileSync(`${bp}/functions/mcpe_food/${name}.mcfunction`,'utf8').trim().split('\n');assert.equal(lines('tasting_new').length,patch085Props.length);assert.deepEqual(lines('electronics').slice(0,41),old.functions['electronics.mcfunction'].trim().split('\n'));assert.equal(lines('electronics').length,52);assert.equal(lines('ai_work_devices').length,7);
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups;assert.equal(groups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics').items.length,42);assert.equal(groups.find(g=>g.group_identifier.name==='mcpe_food:group_ai_work_devices').items.length,7);
});
test('unrelated final geometry remains identical to the 0.7.0 release',()=>{
 const changed=new Set(['pen_display_set','infusion_pump_stand','wall_air_conditioner',...wallVariants.map(d=>d.key),...digitalScreens.map(d=>d.key)]);
 for(const[p,h]of Object.entries(read('tests/fixtures/v0.7.0-appearance.json'))){const key=p.split('/').at(-1).replace(/\.geo\.json$/,'').replace(/^surface_/,'');if(changed.has(key))continue;assert.equal(sha(JSON.stringify(read(p))),h,p);}
});
test('infusion stand is exactly two blocks while pump body stays unchanged; AC scales uniformly to one-block width',()=>{
 const old=read('tests/fixtures/v0.7.0-patch-models.json');
 for(const folder of ['blocks','entity']){const g=k=>read(`${rp}/models/${folder}/mcpe_food/${folder==='entity'?'surface_':''}${k}.geo.json`)['minecraft:geometry'][0],pump=cubes(g('infusion_pump_stand'));near(Math.min(...pump.map(c=>c.origin[1])),0);near(Math.max(...pump.map(c=>c.origin[1]+c.size[1])),32);assert.ok(pump.some(c=>JSON.stringify(c.origin)===JSON.stringify([-2,9,-1])&&JSON.stringify(c.size)===JSON.stringify([4,5,2])));
  const bounds=g('infusion_pump_stand').description;assert.ok(bounds.visible_bounds_offset[1]+bounds.visible_bounds_height/2>=2,'culling bounds must contain the full stand');
  const ac=cubes(g('wall_air_conditioner')),before=cubes(old.wall_air_conditioner['minecraft:geometry'][0]);near(Math.max(...ac.map(c=>c.origin[0]+c.size[0]))-Math.min(...ac.map(c=>c.origin[0])),16);assert.equal(ac.length,before.length);for(let i=0;i<ac.length;i++)for(let k=0;k<3;k++){near(ac[i].size[k],before[i].size[k]*8/7);near(ac[i].origin[k],before[i].origin[k]*8/7);}}
});
test('all wall variants bake a proper half turn, put the backing at zero and preserve readable face UVs',()=>{
 const old=read('tests/fixtures/v0.7.0-wall-models.json');
 for(const v of wallVariants){const before=cubes(old[v.key]['minecraft:geometry'][0]),now=cubes(geo(v.key)),factor=v.base==='wall_air_conditioner'?8/7:1,minZ=Math.min(...before.map(c=>c.origin[2]));assert.equal(now.length,before.length,v.key);
  for(let i=0;i<now.length;i++){near(now[i].origin[0],(-before[i].origin[0]-before[i].size[0])*factor);near(now[i].origin[2],(minZ-before[i].origin[2]-before[i].size[2])*factor);assert.deepEqual(now[i].uv.north,before[i].uv.south);}
  near(Math.max(...now.map(c=>c.origin[2]+c.size[2])),0);assert.deepEqual(cubes(read(`${rp}/models/entity/mcpe_food/surface_${v.key}.geo.json`)['minecraft:geometry'][0]),now);
 }
});
test('wall props and nine panels publish cardinal client properties and restore unchanged records (client appearance pending)',async()=>{
 for(const face of Object.keys(normals))for(const item of [...wallVariants.map(v=>({key:v.base,width:1,height:1})),...digitalScreens]){
  const{d,p,b}=setup(face,item.width,item.height),r=await place(p,b,item.key,face);assert.ok(r,item.key+face);const entity=d.getEntities()[0];assert.equal(entity.getProperty('mcpe_food:display_facing'),{north:1,east:2,south:3,west:4}[face]);
  const serialized=JSON.stringify(r);entity.remove();loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),serialized);assert.equal(d.getEntities().length,1);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),{north:1,east:2,south:3,west:4}[face]);removeDecor(r,false);
 }
});
test('digital screen image is outside the backing with upright unmirrored UV and keeps exact size/depth',()=>{
 for(const d of digitalScreens){const g=read(`${rp}/models/entity/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],frame=g.bones.find(b=>b.name==='ware').cubes,screen=g.bones.find(b=>b.name==='food').cubes[0];assert.deepEqual(frame[0].size,[d.width*16,d.height*16,.8]);near(frame[0].origin[2]+frame[0].size[2],0);assert.ok(screen.origin[2]<frame[0].origin[2]);assert.ok(screen.uv.north);assert.deepEqual(screen.uv.north.uv,[0,0]);assert.deepEqual(screen.uv.north.uv_size,[256,d.width===d.height?256:192]);assert.equal(screen.uv.south,undefined);near(Math.min(...frame.map(c=>c.origin[2])),-1.4);}
});
test('pen display top remains above the shell and image bottom faces the placer at cardinal and diagonal positions',async()=>{
 const g=geo('pen_display_set'),screen=cubes(g).find(c=>c.uv.up?.uv_size[0]===-96);assert.ok(screen);assert.deepEqual(screen.uv.up.uv,[96,56]);assert.deepEqual(screen.uv.up.uv_size,[-96,-56]);assert.ok(screen.origin[1]+screen.size[1]>.4);
 for(let angle=0;angle<360;angle+=15){const{d,p,b}=setup();p.location={x:.5+3*Math.sin(angle*Math.PI/180),y:1,z:.5+3*Math.cos(angle*Math.PI/180)};await place(p,b,'pen_display_set');const e=d.getEntities()[0],bottom=worldVector([0,0,-1],e.rotation.y),dot=(bottom[0]*(p.location.x-.5)+bottom[2]*(p.location.z-.5))/3;assert.ok(dot>=Math.SQRT1_2-1e-7,angle);removeDecor(saved()[0],false);}
});
test('graphics cards have exactly one/two/three fans, distinct length, 128px UV and zero emission',()=>{
 const lengths=[];for(const[d,count]of patch071Props.slice(1).map((d,i)=>[d,i+1])){const cs=cubes(geo(d.key));assert.ok(cs.length<=256);const hubs=cs.filter(c=>Math.abs(c.origin[1]-1.76)<1e-7&&Math.abs(c.size[1]-.12)<1e-7);assert.equal(hubs.length,8*count);lengths.push(Math.max(...cs.map(c=>c.origin[0]+c.size[0]))-Math.min(...cs.map(c=>c.origin[0])));const mer=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/patch071_${d.key}_mer.png`));assert.ok(mer.pixels.every((v,i)=>i%4!==1||v===0));assert.ok(emissionIsValid(mer,'patch071_'+d.key));}
 assert.ok(lengths[0]<lengths[1]&&lengths[1]<lengths[2]);
});
test('all four new items place on full blocks, slabs and inverted stairs; tall stand rejects blocked upper space',async()=>{
 for(const prop of patch071Props)for(const[type,states]of [['minecraft:stone',{}],['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'}],['minecraft:oak_stairs',{upside_down_bit:true}]]){const{d,p}=setup();const b=d.put(type,{x:0,y:0,z:0},states);await place(p,b,prop.key);assert.equal(saved()[0].definition,'mcpe_food:'+prop.key);removeDecor(saved()[0],false);}
 const{d,p,b}=setup();d.put('minecraft:stone',{x:0,y:2,z:0});await place(p,b,'infusion_pump_stand');assert.equal(saved().length,0);assert.equal(p.container.count('mcpe_food:infusion_pump_stand'),1);
});
