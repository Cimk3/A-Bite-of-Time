import {addedDefinitions,addedBlocks,addedSurfaceCount,patch090Items,patch090Props,patch090Walls,slotIconEntries} from './patch-090-expectations.mjs';
import {patch082Props} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,wallVariants,digitalScreens} from '../.build/scenario-catalog.js';
import {lifestyleItems} from '../.build/lifestyle-catalog.js';
import {restaurantAccessories} from '../.build/restaurant-catalog.js';
import {refrigerators,refrigeratorPartIds} from '../.build/appliance-catalog.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {resourceViolations} from '../tools/resource-safety.mjs';
import {dishes,vessels,cutlery,hotpots,bottleProps,materials,crops,stations,servings} from '../.build/catalog.js';
import {advertisements,paperCups,tray,teaTray} from '../.build/decor-catalog.js';
import {electronics} from '../.build/electronics-catalog.js';
import {emissionIsValid} from '../tools/emission-policy.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),bp=path.join(root,'packs/FoodAndTable_BP'),rp=path.join(root,'packs/FoodAndTable_RP');
const read=(base,file)=>JSON.parse(readFileSync(path.join(base,file),'utf8'));
const terrain=()=>read(rp,'textures/terrain_texture.json').texture_data;
const icons=()=>read(rp,'textures/item_texture.json').texture_data;
const image=file=>decodeRGBA(readFileSync(file));
const pixel=(image,x,y)=>Array.from(image.pixels.slice((y*image.width+x)*4,(y*image.width+x)*4+4));
test('current release declares cross-platform Vibrant Visuals compatibility without RTX gating',()=>{
  const version=read(root,'package.json').version.split('.').map(Number),m=read(rp,'manifest.json');assert.deepEqual(m.header.version,version);assert.deepEqual(m.capabilities,['pbr']);assert.ok(m.header.min_engine_version[1]>=26);
  assert.deepEqual(read(bp,'manifest.json').dependencies.find(x=>x.uuid===m.header.uuid).version,version);
});
test('all new blocks disable destruction debris including all crop stages',()=>{
  const files=readdirSync(path.join(bp,'blocks'));assert.equal(files.length,servings.length+vessels.length+cutlery.length+hotpots.length+bottleProps.length+paperCups.length+2+stations.length+crops.length+electronics.length+refrigeratorPartIds.length+restaurantAccessories.length+lifestyleItems.length+scenarioProps.length+patch071Props.length+patch072Props.length+patch073Props.length+patch074Props.length+patch080Props.length+patch082Props.length+patch085Props.length+addedBlocks.length);
  for(const file of files){const b=read(bp,`blocks/${file}`)['minecraft:block'];assert.deepEqual(b.components['minecraft:destruction_particles'],{texture:'mcpe_food_break_dust',tint_method:'none',particle_count:0});
    for(const p of b.permutations??[])assert.ok(!p.components['minecraft:destruction_particles']||p.components['minecraft:destruction_particles'].particle_count===0);}
});
test('fallback chip texture is a uniform neutral color, not the multicolor model palette',()=>{
  const entry=terrain().mcpe_food_break_dust;assert.ok(entry);
  const im=image(path.join(rp,`${entry.textures}.png`));assert.equal(im.width,8);assert.equal(im.height,8);
  const first=pixel(im,0,0);assert.ok(Math.max(...first.slice(0,3))-Math.min(...first.slice(0,3))<=12);
  for(let i=0;i<im.pixels.length;i+=4)assert.deepEqual(Array.from(im.pixels.slice(i,i+4)),first);
});
test('every registered custom block texture has a local valid PBR texture set',()=>{
  const entries=Object.values(terrain());assert.ok(entries.length>dishes.length);
  for(const entry of entries){const file=path.join(rp,`${entry.textures}.texture_set.json`),set=JSON.parse(readFileSync(file,'utf8'))['minecraft:texture_set'];
    assert.equal(set.color,path.basename(entry.textures));assert.ok(existsSync(path.join(path.dirname(file),`${set.color}.png`)));
    if(typeof set.metalness_emissive_roughness==='string')assert.ok(existsSync(path.join(path.dirname(file),`${set.metalness_emissive_roughness}.png`)));else assert.equal(set.metalness_emissive_roughness.length,3);
    assert.equal(set.metalness_emissive_roughness_subsurface,undefined);}
});
test('all item textures have matte non-emissive PBR data and retain alpha color maps',()=>{
  assert.equal(Object.keys(icons()).length,patch090Props.length+patch085Props.length+dishes.length+vessels.length+cutlery.length+hotpots.length+bottleProps.length+paperCups.length+2+advertisements.length+materials.length+crops.length+stations.length+electronics.length+refrigerators.length+restaurantAccessories.length+lifestyleItems.length+scenarioProps.length+wallVariants.length+digitalScreens.length+patch071Props.length+patch072Props.length+patch073Props.length+patch074Props.length+patch074WallVariants.length+clothingItems.length+patch080Props.length+patch082Props.length);
  const detailed=new Set([...dishes,...vessels,...cutlery,...hotpots,...bottleProps,...paperCups,tray,teaTray,...advertisements,...electronics,...refrigerators,...restaurantAccessories,...lifestyleItems,...scenarioProps,...wallVariants,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch074WallVariants,...patch080Props,...patch082Props,...patch085Props,...patch090Props,...slotIconEntries].map(x=>x.key));
  for(const e of Object.values(icons())){const set=read(rp,`${e.textures}.texture_set.json`)['minecraft:texture_set'];assert.deepEqual(set.metalness_emissive_roughness,[0,0,205]);assert.equal(set.color,path.basename(e.textures));
    const color=image(path.join(rp,`${e.textures}.png`));assert.equal(color.width,detailed.has(set.color)?128:32);assert.ok(color.pixels.some((v,i)=>i%4===3&&v===0));}
});
test('metal cutlery and porcelain have different physical surface properties',()=>{
  const map=image(path.join(rp,'textures/blocks/mcpe_food/ware_fork_mer.png'));
  const metal=pixel(map,3*32+16,16),ceramic=pixel(map,16,16);
  assert.equal(metal[0],255);assert.equal(ceramic[0],0);assert.equal(metal[1],0);assert.ok(metal[2]>0&&metal[2]<150);
  const spoon=image(path.join(rp,'textures/blocks/mcpe_food/ware_spoon_mer.png'));
  assert.equal(pixel(spoon,16,112)[0],255);
  const mug=image(path.join(rp,'textures/blocks/mcpe_food/ware_mug_mer.png')),wood=image(path.join(rp,'textures/blocks/mcpe_food/ware_chopsticks_mer.png'));
  assert.ok(pixel(mug,80,16)[2]<140);assert.ok(pixel(wood,80,16)[2]>180);
});
test('liquid, glass and crust surfaces have appropriate gloss differences',()=>{
  const map=image(path.join(rp,'textures/blocks/mcpe_food/food_green_tea_mer.png')),cup=image(path.join(rp,'textures/blocks/mcpe_food/ware_glass_mer.png'));
  const liquid=pixel(map,2*32+16,32+16),glass=pixel(cup,16,3*32+16),bread=pixel(map,2*32+16,2*32+16);
  assert.equal(liquid[0],0);assert.ok(liquid[2]<80);assert.ok(glass[2]<80);assert.ok(bread[2]>180);
});
test('all block MER maps align and emission stays inside named electronics screen and LED islands',()=>{
  let count=0;
  for(const entry of Object.values(terrain())){const setFile=path.join(rp,`${entry.textures}.texture_set.json`),set=JSON.parse(readFileSync(setFile,'utf8'))['minecraft:texture_set'];if(typeof set.metalness_emissive_roughness!=='string')continue;
    const color=image(path.join(rp,`${entry.textures}.png`)),mer=image(path.join(path.dirname(setFile),`${set.metalness_emissive_roughness}.png`));
    assert.deepEqual([mer.width,mer.height],[color.width,color.height]);assert.ok(emissionIsValid(mer,set.color),set.color);count++;}
  assert.equal(count,Object.keys(terrain()).length-1);
});
test('classic rendering continues to reference color images rather than MER maps',()=>{
  for(const [key,entry]of [...Object.entries(terrain()),...Object.entries(icons())]){assert.ok(!key.endsWith('_mer'));assert.ok(!entry.textures.endsWith('_mer'));assert.ok(existsSync(path.join(rp,`${entry.textures}.png`)));}
});
test('PBR sidecars stay private and cannot reference vanilla or external textures',()=>{
  const input={terrain:{},icons:{},blockDefinitions:{},files:['textures/blocks/mcpe_food/plate.texture_set.json'],textureSets:[{file:'textures/blocks/mcpe_food/plate.texture_set.json',definition:{'minecraft:texture_set':{color:'plate',metalness_emissive_roughness:'plate_mer'}}}]};
  assert.deepEqual(resourceViolations(input),[]);
  input.textureSets[0].definition['minecraft:texture_set'].color='../../glass';assert.ok(resourceViolations(input).some(x=>x.includes('external texture set reference')));
});
test('global lighting, vanilla particles and PBR fallback files are not replaced',()=>{
  const files=['pbr/global.json','lighting/global.json','textures/blocks/glass.texture_set.json','textures/particle/particles.png','particles/block_break.json'];
  for(const file of files)assert.equal(existsSync(path.join(rp,file)),false);
  assert.equal(resourceViolations({terrain:{},icons:{},blockDefinitions:{},files}).length,5);
});
