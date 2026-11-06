import {patch085Items} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,brandAdvertisements,digitalScreens} from '../.build/scenario-catalog.js';
import {newProps,cityAdvertisements} from '../.build/lifestyle-catalog.js';
import {restaurantItems} from '../.build/restaurant-catalog.js';
import {refrigerators} from '../.build/appliance-catalog.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {electronics,originalElectronics,newElectronics,officeElectronics} from '../.build/electronics-catalog.js';
import {surfaceVisuals,tray,paperCups,teaTray} from '../.build/decor-catalog.js';
import {vessels,cutlery,hotpots,bottleProps,servings,recipes,id} from '../.build/catalog.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {modelBounds} from '../tools/detail-art.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
const read=p=>JSON.parse(readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const geometry=d=>read(`${rp}/models/blocks/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0];

test('current release has twenty-six tabletop electronics, sixteen laptop poses and two tablet keyboard sets',()=>{
  assert.equal(electronics.length,35);assert.equal(new Set(electronics.map(d=>d.key)).size,35);
  const laptops=electronics.filter(d=>d.model==='laptop');assert.equal(laptops.length,16);
  for(const style of ['silver','gaming','thinkpad','macbook'])assert.deepEqual(laptops.filter(d=>d.style===style).map(d=>d.pose).sort(),['closed','open']);
  assert.equal(electronics.filter(d=>['tablet','surface'].includes(d.model)).length,2);
  assert.equal(electronics.find(d=>d.model==='tablet').key,'ipad_air_magic_keyboard');
  for(const d of electronics){const i=read(`${bp}/items/${d.key}.json`)['minecraft:item'];assert.equal(i.components['minecraft:food'],undefined);assert.equal(i.components['minecraft:use_animation'],undefined);assert.equal(i.components['minecraft:block_placer'].block,id(d.key));assert.ok(!recipes.some(r=>r.key===d.key));}
});

test('electronics are appended after all old surface indices, never reindexing saved table scenes',()=>{
  const old=[...vessels,...cutlery,...hotpots,...bottleProps,...paperCups,tray,...servings.filter(s=>s.food.key!=='tieguanyin')];
  assert.equal(old.length,339);assert.deepEqual(surfaceVisuals.slice(0,339).map(d=>d.key),old.map(d=>d.key));
  assert.deepEqual(surfaceVisuals.slice(339,354).map(d=>d.key),originalElectronics.map(d=>d.key));
});

test('0.4.3 identifiers, package UUIDs, crops, menus, crafting, drops and old commands remain compatible',()=>{
  const old=read('tests/fixtures/v0.4.3.json');
  for(const kind of ['items','blocks']){const current=new Set(readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier));for(const key of old[kind])assert.ok(current.has(key),key);}
  for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),old.menuRecipes);
  for(const [folder,entries]of [['loot_tables/blocks',old.loot],['recipes',old.crafting]])for(const[file,sha]of Object.entries(entries))assert.equal(hash(`${bp}/${folder}/${file}`),sha,file);
  for(const[file,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${file}`)['minecraft:block'].description.states,states);
  for(const[file,content]of Object.entries(old.functions))if(!['advertisements.mcfunction','tasting_new.mcfunction','electronics.mcfunction','tableware.mcfunction','tasting_all_drink.mcfunction','tasting_all_chinese.mcfunction'].includes(file))assert.equal(readFileSync(`${bp}/functions/mcpe_food/${file}`,'utf8'),content,file);
});

test('private electronics group, bilingual names and both trial commands contain all thirty-two items exactly once',()=>{
  const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups;
  const group=groups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics');assert.ok(group);
  assert.equal(group.group_identifier.icon,id('desktop_computer'));assert.deepEqual(group.items,[...electronics,...patch071Props.filter(d=>d.group==='electronics'),...patch072Props.filter(d=>d.group==='electronics'),...patch073Props.filter(d=>d.group==='electronics'),...patch080Props.filter(d=>d.group==='electronics')].filter(d=>!governmentLegacyKeys.includes(d.key)).map(d=>id(d.key)));
  for(const d of electronics){const i=read(`${bp}/items/${d.key}.json`)['minecraft:item'],b=read(`${bp}/blocks/${d.key}.json`)['minecraft:block'];assert.deepEqual(i.description.menu_category,{category:'items',group:'mcpe_food:group_electronics'});assert.equal(b.description.menu_category.category,'none');assert.equal(b.components['minecraft:light_emission'],undefined);const drops=read(`${bp}/loot_tables/blocks/${d.key}.json`).pools;assert.equal(drops.length,1);assert.equal(drops[0].entries[0].name,id(d.key));}
  for(const [command,list] of [['electronics',[...electronics,...refrigerators,...patch071Props.filter(d=>d.group==='electronics'),...patch072Props.filter(d=>d.group==='electronics'),...patch073Props.filter(d=>d.group==='electronics'),...patch080Props.filter(d=>d.group==='electronics')]],['tasting_new',patch085Items]])assert.deepEqual(readFileSync(`${bp}/functions/mcpe_food/${command}.mcfunction`,'utf8').trim().split('\n'),list.map(d=>`give @s ${id(d.key)} 4`));
  for(const locale of ['zh_CN','en_US']){const lang=readFileSync(`${rp}/texts/${locale}.lang`,'utf8');assert.ok(lang.includes('mcpe_food:group_electronics='));for(const d of electronics)assert.ok(lang.includes(`item.mcpe_food:${d.key}.name=${locale==='zh_CN'?d.zh:d.en}`));}
});

test('all complete device models stay within one block, use 128px UVs and tightly fitted block/entity selection ranges',()=>{
  const entity=read(`${bp}/entities/surface_display.json`)['minecraft:entity'];
  for(const d of electronics){const g=geometry(d),cubes=g.bones.flatMap(b=>b.cubes??[]),b=modelBounds(cubes);assert.equal(g.description.texture_width,128);assert.equal(g.description.texture_height,128);assert.ok(cubes.length<=256);
    for(let axis=0;axis<3;axis++){assert.ok(b.low[axis]>=(axis===1?0:-8));assert.ok(b.high[axis]<=(axis===1?16:8));}
    const select=read(`${bp}/blocks/${d.key}.json`)['minecraft:block'].components['minecraft:selection_box'];assert.ok(select.size[1]>=b.high[1]);assert.ok(select.size[1]-b.high[1]<=.2);
    const shape=entity.component_groups[id(d.key)]['minecraft:collision_box'];assert.ok(shape.height*16>=b.high[1]);assert.ok(shape.height*16-b.high[1]<.2);
    for(const c of cubes)for(const f of Object.values(c.uv)){assert.equal(f.material_instance,'ware');assert.ok(f.uv.every(v=>v>=0));assert.ok(f.uv[0]+f.uv_size[0]<=128);assert.ok(f.uv[1]+f.uv_size[1]<=128);}
    if(d.pose==='closed')assert.ok(select.size[1]<2.1,'Closed laptop hitbox should remain low');
  }
});

test('production block and entity color/MER match source art, with emission confined to screen and LED masks',()=>{
  for(const d of electronics){for(const suffix of ['', '_mer']){const source=`assets/electronics/${d.key}${suffix}.png`,block=`${rp}/textures/blocks/mcpe_food/device_${d.key}${suffix}.png`,entity=`${rp}/textures/entity/mcpe_food/device_${d.key}${suffix}.png`;assert.deepEqual(decodeRGBA(readFileSync(source)),decodeRGBA(readFileSync(block)));assert.deepEqual(decodeRGBA(readFileSync(block)),decodeRGBA(readFileSync(entity)));const image=decodeRGBA(readFileSync(source));assert.deepEqual([image.width,image.height],[128,128]);}
    const mer=decodeRGBA(readFileSync(`assets/electronics/${d.key}_mer.png`));assert.ok(emissionIsValid(mer,`device_${d.key}`));
    if(d.pose==='closed')assert.ok(mer.pixels.every((v,i)=>i%4!==1||v===0));
    const icon=decodeRGBA(readFileSync(`${rp}/textures/items/mcpe_food/${d.key}.png`));assert.equal(icon.width,128);assert.ok(icon.pixels.some((v,i)=>i%4===3&&v===0));
  }
});

test('emission validation rejects food glow, chassis glow, closed-screen glow and excessive strength',()=>{
  const image={width:128,height:128,pixels:new Uint8Array(128*128*4)};
  image.pixels[1]=10;assert.equal(emissionIsValid(image,'food_steak'),false);assert.equal(emissionIsValid(image,'device_macbook_closed'),false);assert.equal(emissionIsValid(image,'device_macbook_open'),true);
  image.pixels[1]=25;assert.equal(emissionIsValid(image,'device_macbook_open'),false);
  image.pixels[1]=0;image.pixels[(72*128+100)*4+1]=1;assert.equal(emissionIsValid(image,'device_macbook_open'),false);
});

test('device bodies and keycaps remain non-emissive and active screens non-metallic, with distinct original desktops',()=>{
  const screens=new Set();
  for(const d of electronics){const c=decodeRGBA(readFileSync(`assets/electronics/${d.key}.png`)),m=decodeRGBA(readFileSync(`assets/electronics/${d.key}_mer.png`));
    for(let y=64;y<104;y++)for(let x=0;x<80;x++){const p=(y*128+x)*4;assert.equal(m.pixels[p],0);assert.equal(m.pixels[p+1],0);}
    if(d.pose==='open'||['desktop','all_in_one','tablet','crt','studio','surface'].includes(d.model)){const bytes=[];for(let y=0;y<56;y++)for(let x=0;x<96;x++){const p=(y*128+x)*4;assert.equal(m.pixels[p],0);assert.ok(m.pixels[p+1]>0);bytes.push(...c.pixels.subarray(p,p+3));}screens.add(createHash('sha256').update(Buffer.from(bytes)).digest('hex'));}
  }
  assert.ok(screens.size>=6);
});

test('electronics have no overlapping visible coplanar faces with matching outward normals',()=>{
  const axes={north:[2,0],south:[2,1],east:[0,1],west:[0,0],up:[1,1],down:[1,0]};
  for(const d of electronics){const cubes=geometry(d).bones.flatMap(b=>b.cubes??[]);
    for(let i=0;i<cubes.length;i++)for(let j=i+1;j<cubes.length;j++)for(const[face,[axis,side]]of Object.entries(axes)){
      const a=cubes[i],b=cubes[j];if(a.rotation?.some(Boolean)||b.rotation?.some(Boolean)||!a.uv[face]||!b.uv[face])continue;
      const coplanar=Math.abs(a.origin[axis]+a.size[axis]*side-b.origin[axis]-b.size[axis]*side)<1e-6;
      const overlap=coplanar&&[0,1,2].filter(n=>n!==axis).every(n=>Math.min(a.origin[n]+a.size[n],b.origin[n]+b.size[n])-Math.max(a.origin[n],b.origin[n])>1e-6);
      assert.equal(overlap,false,`${d.key}: ${i}/${j} ${face}`);
    }
  }
});
