import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {LinuxSession} from '../.build/linux-session.js';
import {recipes,servingKey} from '../.build/catalog.js';
import {surfaceVisuals,trayFoods} from '../.build/decor-catalog.js';
import {wallScreens} from '../.build/scenario-catalog.js';
import {gymAd,mriKey,patch097Foods,patch097Items} from '../.build/patch-097-catalog.js';
import {modelBounds} from '../tools/detail-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';

const bp='packs/FoodAndTable_BP/',rp='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const bytes=p=>readFileSync(p);
const checksum=p=>createHash('sha256').update(bytes(p)).digest('hex');
const geo=(key,surface=true)=>read(rp+'models/entity/mcpe_food/'+(surface?'surface_':'')+key+'.geo.json')['minecraft:geometry'][0];
const cubes=g=>g.bones.flatMap(b=>b.cubes??[]);

test('0.9.7 is append-only for saved visuals and preserves 0.9.6 IDs, recipes, crop states, drops and UUIDs',()=>{
 const old=read('tests/fixtures/v0.9.6.json'),order=read('tests/fixtures/v0.9.6-display-order.json');
 for(const [key,list] of Object.entries({surface:surfaceVisuals,tray:trayFoods,wall:wallScreens}))
  assert.deepEqual(list.slice(0,order[key].length).map(d=>d.key),order[key],key);
 for(const [kind,singular] of [['items','item'],['blocks','block']]){
  const ids=new Set(readdirSync(bp+kind).map(f=>read(bp+kind+'/'+f)['minecraft:'+singular].description.identifier));
  for(const id of old[kind])assert.ok(ids.has(id),id);
 }
 for(const [pack,dir] of [['FoodAndTable_BP',bp],['FoodAndTable_RP',rp]]){
  const m=read(dir+'manifest.json');
  assert.deepEqual([m.header.uuid,...m.modules.map(n=>n.uuid)],old.uuids[pack]);
 }
 assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),old.menuRecipes);
 for(const [folder,files] of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])
  for(const [f,digest] of Object.entries(files))assert.equal(checksum(bp+folder+'/'+f),digest,f);
 for(const [file,states] of Object.entries(old.cropStates))
  assert.deepEqual(read(bp+'blocks/'+file)['minecraft:block'].description.states,states);
 for(const [file,body] of Object.entries(old.functions)){
  if(['build_info.mcfunction','tasting_new.mcfunction'].includes(file))continue;
  assert.ok(bytes(bp+'functions/mcpe_food/'+file).toString().startsWith(body),file);
 }
 assert.equal(bytes(bp+'functions/mcpe_food/tasting_new.mcfunction').toString(),patch097Items.map(d=>'give @s mcpe_food:'+d.key+' 4\n').join(''));
});

test('0.9.7r1 preserves the entire 0.9.7 catalog and advances the numeric pack version',()=>{
 const old=read('tests/fixtures/v0.9.7.json');
 for(const [kind,singular] of [['items','item'],['blocks','block']]){
  const current=readdirSync(bp+kind).map(file=>read(bp+kind+'/'+file)['minecraft:'+singular].description.identifier);
  assert.deepEqual(current.sort(),old[kind].sort(),kind);
 }
 for(const [folder,files] of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])
  for(const [file,digest] of Object.entries(files))assert.equal(checksum(bp+folder+'/'+file),digest,file);
 for(const [file,body] of Object.entries(old.functions))
  if(file!=='build_info.mcfunction')assert.equal(bytes(bp+'functions/mcpe_food/'+file).toString(),body,file);
 for(const base of [bp,rp]){
  assert.deepEqual(read(base+'manifest.json').header.version,[0,9,8]);
  assert.equal(read(base+'mcpe_food_build.json').build,'0.9.7r1');
 }
});

test('MRI is a supported 3 × 4 × 3 assembly with a continuous front-to-back opening',()=>{
 const mesh=cubes(geo(mriKey)),{low,high}=modelBounds(mesh);
 assert.ok(mesh.length>55&&mesh.length<=256);
 assert.ok(low[0]>=-24&&high[0]<=24&&low[1]===0&&high[1]<=48&&low[2]>=-32&&high[2]<=32);
 for(const x of [-7,0,7])for(const y of [16,24,31])
  assert.ok(!mesh.some(c=>c.origin[0]<x&&c.origin[0]+c.size[0]>x&&c.origin[1]<y&&c.origin[1]+c.size[1]>y));
 for(let i=0;i<36;i++){
  const part=read(bp+'blocks/'+mriKey+'_part_'+i+'.json')['minecraft:block'];
  assert.deepEqual(part.components['minecraft:geometry'].bone_visibility,{root:false});
  if(i>=12&&i<24&&i%3===1)assert.equal(part.components['minecraft:collision_box'],false);
 }
});

test('both notebook lids are perpendicular and gym frame emits only on the poster',()=>{
 for(const key of ['macbook_air_m5_open','legion_laptop_open']){
  const mesh=cubes(geo(key)),lid=mesh.filter(c=>c.uv.south?.uv_size[0]===96);
  assert.equal(lid.length,1);
  assert.equal(lid[0].rotation,undefined);
  assert.equal(lid[0].uv.south.uv_size[1],48);
  const keyboard=mesh.filter(c=>c.uv.up?.uv[1]===51&&c.uv.up?.uv_size[0]===92);
  assert.equal(keyboard.length,1);
  assert.equal(keyboard[0].rotation,undefined);
  const mer=decodeRGBA(bytes(rp+'textures/entity/mcpe_food/patch090_'+key+'_mer.png'));
  assert.equal(mer.pixels[1],0);
  assert.ok(mer.pixels[(128*10+10)*4+1]>0);
 }
 const poster=geo(gymAd.key,false),mesh=cubes(poster);
 assert.deepEqual([poster.description.texture_width,poster.description.texture_height],[256,128]);
 assert.equal(mesh.filter(c=>Object.values(c.uv).some(uv=>uv.material_instance==='food')).length,1);
 assert.ok(poster.bones.find(b=>b.name==='ware').cubes.length>5);
 for(const food of patch097Foods){
  assert.equal(food.recipe,undefined);
  assert.ok(cubes(geo(servingKey(food,food.vessel))).length<=256);
 }
});

test('both civic kiosks expose their full screen and contain no inclined housing',()=>{
 for(const key of ['police_service_terminal','government_service_kiosk']){
  const mesh=cubes(geo(key));
  const screens=mesh.filter(c=>c.uv.north?.uv_size[0]===96&&c.uv.north.uv_size[1]===48);
  assert.equal(screens.length,1,key);
  assert.ok(mesh.every(c=>!c.rotation),key);
  for(const c of mesh)for(const face of Object.values(c.uv)){
   if(face.uv[0]<96)continue;
   assert.deepEqual(face.uv_size,[6,6]);
   assert.ok(face.uv.every(value=>value%8===1),key+' material tile needs gutters');
  }
  const [x,y,z]=screens[0].origin,[w,h]=screens[0].size;
  for(const c of mesh){
   if(c===screens[0]||c.origin[2]>z+.001)continue;
   assert.ok(c.origin[0]+c.size[0]<=x||c.origin[0]>=x+w||
    c.origin[1]+c.size[1]<=y||c.origin[1]>=y+h,key+' screen blocked by '+c.origin);
  }
 }
});

test('Linux virtual filesystem supports mkdir, navigation, reads and independent player sessions',()=>{
 const a=new LinuxSession(),b=new LinuxSession(),run=(line)=>a.execute(line).output;
 assert.equal(run('pwd'),'/home/player');
 assert.match(run('help'),/mkdir/);
 assert.equal(run('mkdir work'),'');
 assert.ok(a.entries().includes('work/'));
 assert.ok(!b.entries().includes('work/'));
 assert.equal(run('cd work'),'');
 assert.equal(run('mkdir build'),'');
 assert.equal(run('ls'),'build/');
 assert.match(run('cat ../README.txt'),/Food & Table/);
 assert.match(a.openText('../README.txt').text,/Food & Table/);
 assert.equal(a.openText('/etc/os-release'),undefined);
 assert.equal(a.openText('missing.txt'),undefined);
 assert.equal(a.execute('open ../README.txt').document.path,'/home/player/README.txt');
 assert.match(run('uname -a'),/simulated/);
 assert.match(run('mkdir /etc/test'),/only in/);
 assert.match(run('mkdir missing/child'),/missing parent/);
 assert.match(run('mkdir \$invalid'),/Invalid/);
 assert.match(run('mkdir build'),/already exists/);
 assert.match(run('cat /etc'),/not found/);
 assert.ok(a.history.length<=950);
 a.execute('clear');assert.equal(a.history,'');
 assert.equal(a.execute('exit').exit,true);
});
