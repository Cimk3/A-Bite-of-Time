import {patch082Props} from "../.build/patch-082-catalog.js";
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,scenarioGroups,digitalScreens} from '../.build/scenario-catalog.js';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import {writeOutput as writeFileSync} from './fs-output.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MinecraftBlockTypes, MinecraftItemTypes } from '@minecraft/vanilla-data';
import { categories, bottleProps, crops, cutlery, dishes, displays, foods, hotpots, id, materials, recipes, servings, stations, vessels } from '../.build/catalog.js';
import { supportBlocks } from '../.build/supports.js';
import {advertisements,paperCups,tray,teaTray} from '../.build/decor-catalog.js';
import {refrigerators} from '../.build/appliance-catalog.js';
import {lifestyleItems} from '../.build/lifestyle-catalog.js';
import {restaurantAccessories} from '../.build/restaurant-catalog.js';
import {electronics} from '../.build/electronics-catalog.js';
import {emissionIsValid} from './emission-policy.mjs';
import { crc32 } from './art.mjs';
import { resourceViolations, textureKey } from './resource-safety.mjs';
import { decodeRGBA } from './png-inspect.mjs';
import { BREAK_DUST } from './rendering.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bp=path.join(root,'packs/FoodAndTable_BP'),rp=path.join(root,'packs/FoodAndTable_RP');
export function tree(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const parse=file=>JSON.parse(readFileSync(file,'utf8'));
let checks=0;function check(condition,message){checks++;assert.ok(condition,message);}
const files=[...tree(bp),...tree(rp)],jsons=files.filter(f=>f.endsWith('.json')).map(f=>({file:f,data:parse(f)}));
const items=new Map(jsons.filter(x=>x.data['minecraft:item']).map(x=>[x.data['minecraft:item'].description.identifier,x]));
const blocks=new Map(jsons.filter(x=>x.data['minecraft:block']).map(x=>[x.data['minecraft:block'].description.identifier,x]));
check(items.size===jsons.filter(x=>x.data['minecraft:item']).length,'duplicate item IDs');
check(blocks.size===jsons.filter(x=>x.data['minecraft:block']).length,'duplicate block IDs');
const vanillaItems=new Set(Object.values(MinecraftItemTypes)),vanillaBlocks=new Set(Object.values(MinecraftBlockTypes));
const knownItem=key=>vanillaItems.has(key)||items.has(key)||blocks.has(key);
const texture=parse(path.join(rp,'textures/terrain_texture.json')).texture_data;
const icon=parse(path.join(rp,'textures/item_texture.json')).texture_data;
const textureDimensions=new Map(Object.entries(texture).map(([key,entry])=>{const bytes=readFileSync(path.join(rp,`${entry.textures}.png`));return[key,[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]];}));
const models=new Map();
for(const {file,data}of jsons.filter(x=>x.data['minecraft:geometry'])){
  for(const model of data['minecraft:geometry']){
    check(!models.has(model.description.identifier),`duplicate geometry ${file}`);models.set(model.description.identifier,model);
    for(const bone of model.bones)for(const cube of bone.cubes??[]){
      check(cube.size.every(v=>Number.isFinite(v)&&v>0),`invalid cube size ${file}`);
      check(cube.origin.every(Number.isFinite),`invalid cube origin ${file}`);
      for(const face of Object.values(cube.uv))check(face.uv.every(v=>v>=0)&&face.uv[0]+face.uv_size[0]<=model.description.texture_width&&face.uv[1]+face.uv_size[1]<=model.description.texture_height,`UV out of bounds ${file}`);
    }
    if(model.description.texture_width===128)check(model.bones.reduce((n,b)=>n+(b.cubes?.length??0),0)<=256,`detail geometry budget ${file}`);
  }
}
for(const [key,entry]of Object.entries({...texture,...icon}))check(existsSync(path.join(rp,`${entry.textures}.png`)),`missing texture ${key}`);
const textureSets=jsons.filter(x=>x.data['minecraft:texture_set']);
const isolationErrors=resourceViolations({terrain:texture,icons:icon,blockDefinitions:parse(path.join(rp,'blocks.json')),files:tree(rp).map(f=>path.relative(rp,f).split(path.sep).join('/')),geometryIds:[...models.keys()],textureSets:textureSets.map(x=>({file:path.relative(rp,x.file).split(path.sep).join('/'),definition:x.data})),renderControllers:jsons.flatMap(x=>Object.keys(x.data.render_controllers??{})),entityIds:jsons.flatMap(x=>[x.data['minecraft:entity']?.description.identifier,x.data['minecraft:client_entity']?.description.identifier].filter(Boolean))});
check(isolationErrors.length===0,`Unsafe overrides: ${isolationErrors.slice(0,8).join('; ')}`);
const controllers=new Map(jsons.flatMap(x=>Object.entries(x.data.render_controllers??{})));
const entityDefinitions=new Map(jsons.filter(x=>x.data['minecraft:entity']).map(x=>[x.data['minecraft:entity'].description.identifier,x.data['minecraft:entity']]));
for(const{data}of jsons)for(const name of Object.keys(data.animations??{}))check(name.startsWith('animation.mcpe_food.'),`foreign animation override ${name}`);
for(const{data}of jsons.filter(x=>x.data['minecraft:client_entity'])){
  const d=data['minecraft:client_entity'].description,server=entityDefinitions.get(d.identifier);check(!!server,`missing entity behavior ${d.identifier}`);
  const physics=server.components['minecraft:physics'];
  check(physics.has_gravity===false&&physics.has_collision===false,`display must not move or obstruct ${d.identifier}`);
  check(server.components['minecraft:damage_sensor'].triggers.every(t=>t.deals_damage===false),`display native damage enabled ${d.identifier}`);
  for(const target of Object.values(d.geometry))check(models.has(target),`missing display geometry ${target}`);
  for(const target of Object.values(d.textures)){check(/^textures\/entity\/mcpe_food\//.test(target),`foreign entity texture ${target}`);check(existsSync(path.join(rp,`${target}.png`))&&existsSync(path.join(rp,`${target}.texture_set.json`)),`missing entity PBR ${target}`);}
  for(const name of d.render_controllers){const controller=controllers.get(name);check(!!controller,`missing display controller ${name}`);for(const target of controller.arrays.geometries['Array.geometry'])check(!!d.geometry[target.replace('Geometry.','')],`unbound entity geometry alias ${target}`);for(const values of Object.values(controller.arrays.textures))for(const target of values)check(!!d.textures[target.replace('Texture.','')],`unbound entity texture alias ${target}`);}
}
for(const entry of [...Object.values(texture),...Object.values(icon)])check(existsSync(path.join(rp,`${entry.textures}.texture_set.json`)),`missing PBR set ${entry.textures}`);
for(const {file,data}of textureSets){
  const set=data['minecraft:texture_set'];
  check(data.format_version==='1.21.30',`unexpected PBR schema ${file}`);
  check(typeof set.color==='string'&&/^[a-z0-9_]+$/.test(set.color),`invalid PBR color ${file}`);
  const colorFile=path.join(path.dirname(file),`${set.color}.png`);
  check(existsSync(colorFile),`missing PBR color image ${file}`);
  const mer=set.metalness_emissive_roughness;
  check(mer!==undefined&&set.metalness_emissive_roughness_subsurface===undefined,`missing or conflicting MER ${file}`);
  check(set.normal===undefined&&set.heightmap===undefined,`unexpected bump maps ${file}`);
  if(typeof mer==='string'){
    check(/^[a-z0-9_]+$/.test(mer),`non-local MER ${file}`);
    const merFile=path.join(path.dirname(file),`${mer}.png`);check(existsSync(merFile),`missing MER image ${file}`);
    const color=decodeRGBA(readFileSync(colorFile)),map=decodeRGBA(readFileSync(merFile));
    check(map.width===color.width&&map.height===color.height,`MER dimensions mismatch ${file}`);
    check(emissionIsValid(map,set.color),`unwanted emission ${file}`);
  }else check(Array.isArray(mer)&&mer.length===3&&mer.every(v=>Number.isInteger(v)&&v>=0&&v<=255)&&mer[1]===0,`invalid uniform MER ${file}`);
}
const locale=parse(path.join(rp,'texts/languages.json'));
const langs=Object.fromEntries(locale.map(l=>[l,new Set(readFileSync(path.join(rp,`texts/${l}.lang`),'utf8').split('\n').filter(Boolean).map(l=>l.split('=')[0]))]));
for(const [key,{data}]of items){
  check(key.startsWith('mcpe_food:'),`vanilla or foreign item override ${key}`);
  const c=data['minecraft:item'].components;
  check(Boolean(icon[c['minecraft:icon']]),`missing icon ${key}`);
  for(const lang of Object.values(langs))check(lang.has(c['minecraft:display_name'].value),`missing localization ${key}`);
  const placer=c['minecraft:block_placer'];
  if(placer){check(blocks.has(placer.block),`unknown placed block ${key}`);if(placer.replace_block_item)check(placer.block===key,`replacement item mismatch ${key}`);}
}
function inspectComponents(c,context){
  if(c['minecraft:geometry'])check(models.has(c['minecraft:geometry'].identifier),`missing model ${context}`);
  if(c['minecraft:material_instances'])for(const mat of Object.values(c['minecraft:material_instances'])){
    check(Boolean(texture[mat.texture]),`missing material ${context}`);
    check(typeof mat.ambient_occlusion==='number'&&mat.ambient_occlusion>=0&&mat.ambient_occlusion<=10,`26.20+ requires numeric ambient occlusion ${context}`);
  }
  if(c['minecraft:geometry']&&c['minecraft:material_instances']){
    const model=models.get(c['minecraft:geometry'].identifier),mats=c['minecraft:material_instances'];
    for(const bone of model.bones)for(const cube of bone.cubes??[])for(const face of Object.values(cube.uv)){
      const slot=face.material_instance??'*';check(Boolean(mats[slot]??mats['*']),`unbound material slot ${slot} ${context}`);
      const dims=textureDimensions.get((mats[slot]??mats['*']).texture);
      const ceilingFrame=context==='mcpe_food:ceiling_arm_display_2x1'&&slot==='ware'&&dims[0]===128&&dims[1]===128&&face.uv[0]===0&&face.uv[1]===0&&face.uv_size.every(v=>v===1);
      check(ceilingFrame||(dims[0]===model.description.texture_width&&dims[1]===model.description.texture_height),`model texture dimensions ${context}`);
    }
  }
  if(c['minecraft:loot'])check(existsSync(path.join(bp,c['minecraft:loot'])),`missing loot ${context}`);
  const filter=c['minecraft:placement_filter'];
  if(filter)for(const condition of filter.conditions){
    check(condition.block_filter.length<=64,`too many filter entries ${context}`);
    for(const b of condition.block_filter)check(vanillaBlocks.has(b)||blocks.has(b),`unknown support ${b}`);
  }
}
for(const [key,{data}]of blocks){
  check(key.startsWith('mcpe_food:'),`vanilla or foreign block override ${key}`);
  check(data.format_version==='1.26.20',`unexpected block format ${key}`);
  const definition=data['minecraft:block'];inspectComponents(definition.components,key);
  const particles=definition.components['minecraft:destruction_particles'];
  check(particles?.particle_count===0,`unwanted custom destruction debris ${key}`);
  check(particles?.texture===textureKey(BREAK_DUST)&&particles.tint_method==='none',`unsafe palette-based particle source ${key}`);
  for(const p of definition.permutations??[])inspectComponents(p.components,key);
  for(const p of definition.permutations??[])if(p.components['minecraft:destruction_particles'])check(p.components['minecraft:destruction_particles'].particle_count===0,`permutation restores debris ${key}`);
  for(const l of Object.values(langs))check(l.has(`tile.${key}.name`),`missing block localization ${key}`);
}
const special=new Set(materials.filter(m=>m.creativeOnly).map(m=>id(m.key)));
const creative=parse(path.join(bp,'item_catalog/crafting_item_catalog.json'))['minecraft:crafting_items_catalog'].categories;
check(creative.length===1&&creative[0].category_name==='items','creative groups must extend items only');
check(JSON.stringify(creative[0].groups.map(g=>g.group_identifier.name))===JSON.stringify([...Object.keys(categories).map(k=>`mcpe_food:group_${k}`),'mcpe_food:group_tableware','mcpe_food:group_advertisements','mcpe_food:group_electronics','mcpe_food:group_restaurant_accessories','mcpe_food:group_office_stationery','mcpe_food:group_home_decor',...[...scenarioGroups,...patch074Groups,...patch072Groups].map(g=>`mcpe_food:group_${g.key}`),'mcpe_food:group_government_equipment','mcpe_food:group_laboratory_equipment']),'creative groups missing or reordered');
const grouped=new Set();
for(const group of creative[0].groups){
  check(items.has(group.group_identifier.icon),'unknown creative group icon');
  for(const l of Object.values(langs))check(l.has(group.group_identifier.name),'group lacks localization');
  for(const key of group.items){
    check(items.has(key)&&!grouped.has(key),`missing or duplicate creative entry ${key}`);grouped.add(key);
    const desc=items.get(key).data['minecraft:item'].description;
    check(desc.menu_category.category==='items'&&desc.menu_category.group===group.group_identifier.name,`conflicting menu group ${key}`);
  }
}
for(const entry of [...dishes,...bottleProps,...paperCups,...vessels,...cutlery,tray,teaTray,...advertisements,...electronics,...refrigerators,...restaurantAccessories,...lifestyleItems,...scenarioProps,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch080Props,...patch082Props,...patch085Props])check(grouped.has(id(entry.key)),`ungrouped new content ${entry.key}`);
check(grouped.size===dishes.length+bottleProps.length+paperCups.length+vessels.length+cutlery.length+2+advertisements.length+electronics.length+refrigerators.length+restaurantAccessories.length+lifestyleItems.length+scenarioProps.length+digitalScreens.length+patch071Props.length+patch072Props.length+clothingItems.length+patch073Props.length+patch074Props.length+patch080Props.length+patch082Props.length+patch085Props.length,'creative catalog contains unexpected entries');
for(const prop of bottleProps){
  const c=items.get(id(prop.key)).data['minecraft:item'].components;
  check(!c['minecraft:food']&&!c['minecraft:use_animation'],`bottle display is consumable ${prop.key}`);
  const drops=parse(path.join(bp,`loot_tables/blocks/${prop.key}.json`)).pools;
  check(drops.length===1&&drops[0].entries[0].name===id(prop.key)&&drops[0].entries[0].functions[0].count===1,'bottle must only return itself');
}
for(const {file,data}of jsons.filter(x=>x.file.includes(`${path.sep}loot_tables${path.sep}`))){
  for(const p of data.pools)for(const e of p.entries){check(knownItem(e.name),`unknown loot item ${file}: ${e.name}`);check(!special.has(e.name),`creative-only natural drop ${file}`);}
}
for(const {file,data}of jsons.filter(x=>x.file.includes(`${path.sep}recipes${path.sep}`))){
  const r=data['minecraft:recipe_shaped']??data['minecraft:recipe_shapeless'];
  check(Boolean(r),'unknown recipe format');check(knownItem(r.result.item),`unknown recipe output ${file}`);check(!special.has(r.result.item),`creative-only crafting source ${file}`);
  for(const i of r.ingredients??Object.values(r.key))check(knownItem(i.item),`unknown recipe ingredient ${file}: ${i.item}`);
}
for(const recipe of recipes){
  check(items.has(id(recipe.key)),`menu result undefined ${recipe.key}`);check(Boolean(icon[textureKey(recipe.key)]),`menu icon missing ${recipe.key}`);
  for(const i of recipe.inputs){check(knownItem(i.item),`unknown menu ingredient ${i.item}`);if(i.returns)check(knownItem(i.returns),`unknown return ${i.returns}`);}
}
for(const food of foods){
  check(Boolean(categories[food.category]),`unknown food category ${food.key}`);
  const c=items.get(id(food.key)).data['minecraft:item'].components;
  check(c['minecraft:food'].nutrition===food.nutrition,`nutrition mismatch ${food.key}`);
  check(c['minecraft:use_animation']===(food.category==='drink'?'drink':'eat'),`animation mismatch ${food.key}`);
  check(c['minecraft:food'].using_converts_to===undefined,`extra container duplication ${food.key}`);
  const serving=blocks.get(id(`${food.key}_serving`)).data['minecraft:block'];
  check(serving.description.menu_category.category==='none',`serving visible as a duplicate creative item ${food.key}`);
  const tableLoot=parse(path.join(bp,serving.components['minecraft:loot']));
  check(tableLoot.pools.length===2&&tableLoot.pools.some(p=>p.entries[0].name===id(food.vessel))&&tableLoot.pools.some(p=>p.entries[0].name===id(food.key)),`serving loot mismatch ${food.key}`);
}
for(const food of displays)check(items.get(id(food.key)).data['minecraft:item'].components['minecraft:food']===undefined,`display item is edible ${food.key}`);
for(const s of servings){
  const b=blocks.get(id(s.key)).data['minecraft:block'],drops=parse(path.join(bp,b.components['minecraft:loot'])).pools.map(p=>p.entries[0].name);
  check(drops.length===2&&drops.includes(id(s.food.key))&&drops.includes(id(s.vessel.key)),`wrong vessel variant drop ${s.key}`);
  check(b.components['minecraft:material_instances'].food.texture===textureKey(`food_${s.food.key}`),`unshared food texture ${s.key}`);
}
for(const crop of crops){
  const block=blocks.get(id(`${crop.key}_crop`)).data['minecraft:block'];
  check(block.permutations.length===4,`crop needs 4 stages ${crop.key}`);
  check(block.components['mcpe_food:crop']!==undefined,`crop component missing ${crop.key}`);
}
for(const b of supportBlocks)check(vanillaBlocks.has(b)||blocks.has(b),`invalid full support ${b}`);
const manifests=[parse(path.join(bp,'manifest.json')),parse(path.join(rp,'manifest.json'))],uuids=[];
check(manifests[1].capabilities?.includes('pbr'),'Vibrant Visuals pbr capability missing');
check(!manifests[1].capabilities?.includes('raytraced'),'Do not restrict the cross-platform pack to RTX');
for(const m of manifests){uuids.push(m.header.uuid,...m.modules.map(x=>x.uuid));for(const module of m.modules){if(module.type==='script')check(existsSync(path.join(bp,module.entry)),'missing script entry');}
  for(const dep of m.dependencies??[])if(dep.module_name)check(!dep.version.includes('beta'),'unstable dependency');}
check(new Set(uuids).size===uuids.length,'manifest UUID collision');
check(manifests[0].dependencies.some(d=>d.uuid===manifests[1].header.uuid),'resource dependency missing');
for(const script of files.filter(f=>f.endsWith('.js'))){
  const source=readFileSync(script,'utf8');check(!/node:|require\(|sourceMappingURL|\.ts["']/.test(source),`non-Bedrock runtime code ${script}`);
  for(const[,target]of source.matchAll(/from\s+["']([^"']+)["']/g)){if(target.startsWith('.'))check(existsSync(path.resolve(path.dirname(script),target)),`broken script import ${script}`);else check(['@minecraft/server','@minecraft/server-ui'].includes(target),`unavailable runtime module ${target}`);}
}
for(const file of files.filter(f=>f.endsWith('.png'))){
  const bytes=readFileSync(file);check(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`invalid PNG ${file}`);
  let p=8;while(p<bytes.length){const length=bytes.readUInt32BE(p),end=p+8+length;check(crc32(bytes.subarray(p+4,end))===bytes.readUInt32BE(end),`PNG checksum ${file}`);p=end+4;}
}
check(foods.length===102&&bottleProps.length===3&&displays.length===8&&hotpots.length===2&&cutlery.length+vessels.length+2===15&&advertisements.length===23&&scenarioProps.length===31&&patch071Props.length===4&&patch072Props.length===12&&patch073Props.length===10&&patch074Props.length===21&&patch080Props.length===11&&patch074Groups.every(g=>g.items.length===7)&&clothingItems.length===9&&digitalScreens.length===12&&patch082Props.length===16&&patch085Props.length===22&&paperCups.length===2&&stations.length===4&&crops.length===6&&electronics.length===35&&refrigerators.length===6,'approved content count mismatch');
const report={status:'passed',checks,jsonFiles:jsons.length,pngFiles:files.filter(f=>f.endsWith('.png')).length,items:items.size,blocks:blocks.size,models:models.size,edible:foods.length,displayDishes:displays.length,servingVariants:servings.length,pbrTextureSets:textureSets.length,destructionParticles:`disabled on all ${blocks.size} custom blocks; isolated neutral fallback`,vibrantVisuals:'pbr manifest and texture-set data validated; engine rendering untested',resourceIsolation:'passed — private keys, paths and IDs; no vanilla overrides',officialVanillaDefinitions:'1.26.52',engineTested:false};
writeFileSync(path.join(root,'validation-report.json'),JSON.stringify(report,null,2)+'\n');
const buildReport=path.join(root,'build-report.json');writeFileSync(buildReport,JSON.stringify({...parse(buildReport),staticStatus:'passed',staticChecks:checks},null,2)+'\n');
console.log(`PASS — ${checks} checks; ${report.items} items, ${report.blocks} blocks, ${report.models} models, ${report.pngFiles} PNGs.`);
console.log('Static consistency checks only. Minecraft engine import / rendering / mobile / multiplayer still require real game testing.');
