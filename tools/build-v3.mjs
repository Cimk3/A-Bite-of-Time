import {patch082Props,patch082Items} from "../.build/patch-082-catalog.js";
import {patch082Cubes,patch082Texture} from "./patch-082-art.mjs";
import {patch080Props,laboratoryKeys,ceilingDisplayKey} from '../.build/patch-080-catalog.js';
import {patch080Cubes,patch080Texture,ceilingScreenTexture} from './patch-080-art.mjs';
import {patch074Props,patch074Groups,patch074WallVariants,patch074DigitalScreens} from '../.build/patch-074-catalog.js';
import {patch074Cubes,patch074Texture} from './patch-074-art.mjs';
import {patch073Props,governmentKeys,governmentLegacyKeys,creativeGroup} from '../.build/patch-073-catalog.js';
import {patch073Cubes,patch073Texture} from './patch-073-art.mjs';
import {patch072Props,clothingItems,patch072Groups,clothingVisuals,infoScreens} from '../.build/patch-072-catalog.js';
import {patch072Cubes,clothingCubes,patch072Texture,northFacingCubes} from './patch-072-art.mjs';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {patch071Cubes,patch071Texture} from './patch-071-art.mjs';
import {wallFacingCubes} from './wall-geometry.mjs';
import {scenarioProps,scenarioGroups,wallVariants,digitalScreens,brandAdvertisements} from '../.build/scenario-catalog.js';
import {scenarioCubes,scenarioTexture} from './scenario-art.mjs';
import {brandPosters} from './brand-art.mjs';
import {mkdirSync,readdirSync,readFileSync,writeFileSync,copyFileSync,rmSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeOutput} from './fs-output.mjs';
import {categories,legacyCategories,previousDishes,newFoods,bottleProps,cutlery,crops,foods,displays,dishes,hotpots,id,materials,recipes,servings,stations,vessels,label} from '../.build/catalog.js';
import {supportBlocks,placementSupports} from '../.build/supports.js';
import {advertisements,paperCups,tray,teaTray} from '../.build/decor-catalog.js';
import {electronics,newElectronics,officeElectronics} from '../.build/electronics-catalog.js';
import {officeStationery,homeDecor,lifestyleItems,newProps,cityAdvertisements} from '../.build/lifestyle-catalog.js';
import {lifestyleCubes,lifestyleTexture} from './lifestyle-art.mjs';
import {cityPosters} from './city-posters.mjs';
import {restaurantItems,restaurantAccessories,numberVisuals} from '../.build/restaurant-catalog.js';
import {serviceCubes,serviceTexture} from './service-art.mjs';
import {refrigerators} from '../.build/appliance-catalog.js';
import {vanillaSurfaceClasses} from '../.build/vanilla-surfaces.js';
import {teaTrayCubes,refrigeratorCubes,refrigeratorPart,tableTexture} from './tea-appliance-art.mjs';
import {electronicCubes,electronicTexture,electronicUV} from './electronics-art.mjs';
import {trayCubes,paperCupCubes} from './decor-art.mjs';
import {buildDisplays} from './build-displays.mjs';
import {patchPreviews} from './patch-previews.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {atlas,box,blit,canvas,cropModel,foodModel as oldFood,geometry,palette,png,rect,render,saveImage,stationModel,text} from './art.mjs';
import {textureKey,texturePath} from './resource-safety.mjs';
import {BREAK_DUST,blockMaterial,blockTextureSet,breakDustImage,destructionParticles,itemTextureSet,merAtlas} from './rendering.mjs';
import {bottleCubes,cutleryCubes,detailGeometry,foodCubes,hotpotCubes,modelBounds,paintedMER,paintedTexture,renderDetail,textureSpec,vesselCubes,pruneFaces} from './detail-art.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),BP=path.join(root,'packs/FoodAndTable_BP'),RP=path.join(root,'packs/FoodAndTable_RP');
for(const target of[BP,RP]){if(path.relative(path.join(root,'packs'),target).startsWith('..'))throw new Error('Unsafe build path');rmSync(target,{recursive:true,force:true});mkdirSync(target,{recursive:true});}
const write=(base,file,data)=>{const target=path.join(base,file);mkdirSync(path.dirname(target),{recursive:true});writeOutput(target,data);};
const json=(base,file,data)=>write(base,file,JSON.stringify(data,null,2)+'\n');
const {version}=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8')),VERSION=version.split('.').map(Number),ENGINE=[1,26,20];
const BUILD_ID='0.8.2-rc.1';
const BP_UUID='c260f73a-480b-441e-91e2-de90849fa140',RP_UUID='1a31bbad-5ab0-4860-aa36-1dded1fb5689',metadata={authors:['Food & Table contributors'],license:'MIT',product_type:'addon'};
json(BP,'manifest.json',{format_version:2,header:{name:`方寸食光 · Food & Table BP ${BUILD_ID}`,description:`${foods.length} 道料理 · 铜锅桌景 · 128px | Food & Table ${BUILD_ID}`,uuid:BP_UUID,version:VERSION,min_engine_version:ENGINE},modules:[{type:'data',uuid:'a1aa9410-be01-43bb-bec4-806426c234fb',version:VERSION},{type:'script',language:'javascript',entry:'scripts/main.js',uuid:'851d963e-b413-4cab-af11-74e029441d0a',version:VERSION}],dependencies:[{uuid:RP_UUID,version:VERSION},{module_name:'@minecraft/server',version:'2.0.0'},{module_name:'@minecraft/server-ui',version:'2.0.0'}],metadata});
json(RP,'manifest.json',{format_version:2,header:{name:`方寸食光 · Food & Table RP ${BUILD_ID}`,description:`Food & Table PBR | ${BUILD_ID} | 需启用同批次BP`,uuid:RP_UUID,version:VERSION,min_engine_version:ENGINE},modules:[{type:'resources',uuid:'f52c1cef-a4fd-4d0b-ae75-f66cb93d6386',version:VERSION}],capabilities:['pbr'],metadata});
for(const base of [BP,RP])json(base,'mcpe_food_build.json',{version,build:BUILD_ID,status:'release candidate pending Windows acceptance'});
write(BP,'functions/mcpe_food/build_info.mcfunction',`tellraw @s {"rawtext":[{"text":"Food & Table BP ${BUILD_ID}; check matching RP in active packs."}]}\n`);
mkdirSync(path.join(BP,'scripts'),{recursive:true});for(const file of readdirSync(path.join(root,'.build')).filter(f=>f.endsWith('.js')))copyFileSync(path.join(root,'.build',file),path.join(BP,'scripts',file));for(const base of[BP,RP])copyFileSync(path.join(root,'LICENSE'),path.join(base,'LICENSE'));
const terrain={},icons={},sounds={format_version:[1,1,0]},langs={zh_CN:[],en_US:[]},textures=new Map(),artRecords=new Map(),modelRecords=[];
const localize=(key,zh,en)=>{langs.zh_CN.push(`${key}=${zh}`);langs.en_US.push(`${key}=${en}`);};
localize('pack.name','方寸食光','Food & Table');localize('pack.description','一桌方寸，食光正好。','Good food. A little table.');
function highTexture(key,spec){let painted=paintedTexture(spec);if(paperCups.some(p=>p.key===spec.key)){const bytes=readFileSync(path.join(root,`assets/paper-cups/${spec.key}.png`));painted={...decodeRGBA(bytes),png:bytes};}textures.set(key,painted);write(RP,`${texturePath('blocks',key)}.png`,painted.png);write(RP,`${texturePath('blocks',`${key}_mer`)}.png`,paintedMER(spec));json(RP,`${texturePath('blocks',key)}.texture_set.json`,blockTextureSet(key));terrain[textureKey(key)]={textures:texturePath('blocks',key)};}
function icon(key,image){write(RP,`${texturePath('items',key)}.png`,png(image.width,image.height,image.data));json(RP,`${texturePath('items',key)}.texture_set.json`,itemTextureSet(key));icons[textureKey(key)]={textures:texturePath('items',key)};}
function highModel(key,cubes,slots){const data=detailGeometry(key,cubes);if(key===ceilingDisplayKey)Object.assign(data['minecraft:geometry'][0].description,{texture_width:256,texture_height:128,visible_bounds_width:4,visible_bounds_height:4,visible_bounds_offset:[0,1,0]});if([...patch072Props,...patch073Props,...patch074Props,...patch080Props,...patch082Props].some(d=>d.key===key))Object.assign(data['minecraft:geometry'][0].description,{visible_bounds_width:3,visible_bounds_height:4,visible_bounds_offset:[0,1,0]});for(const b of data['minecraft:geometry'][0].bones)for(const c of b.cubes??[])if(paperCups.some(p=>p.key===key)&&Math.abs(c.origin[2]-2.12)<.001&&c.size[2]<.05)c.uv.south={uv:[0,80],uv_size:[128,48],material_instance:'ware'};json(RP,`models/blocks/mcpe_food/${key}.geo.json`,data);modelRecords.push({key,resolution:key===ceilingDisplayKey?256:128,cubes:data['minecraft:geometry'][0].bones[0].cubes.length,slots});return{'minecraft:geometry':{identifier:`geometry.mcpe_food.${key}`},'minecraft:material_instances':Object.fromEntries([['*',blockMaterial(slots.food??slots.ware)],...Object.entries(slots).map(([slot,key])=>[slot,blockMaterial(key)])])};}
function lowAsset(key,cubes,colors,withIcon=true){
  cubes=pruneFaces(cubes);const pal=palette(colors);
  json(RP,`models/blocks/mcpe_food/${key}.geo.json`,geometry(key,cubes));
  write(RP,`${texturePath('blocks',key)}.png`,atlas(pal));
  write(RP,`${texturePath('blocks',`${key}_mer`)}.png`,merAtlas(key,pal.length));
  json(RP,`${texturePath('blocks',key)}.texture_set.json`,blockTextureSet(key));
  terrain[textureKey(key)]={textures:texturePath('blocks',key)};
  const front=stations.some(s=>s.key===key)?cubes.map(c=>({...c,origin:[-c.origin[0]-c.size[0],c.origin[1],-c.origin[2]-c.size[2]]})):cubes;
  if(withIcon)icon(key,render(front,pal,32,32,1));
  modelRecords.push({key,resolution:64,cubes:cubes.length,slots:{'*':key}});
}
function item(key,zh,en,components={},category='items',group){if(group?.startsWith('mcpe_food:group_'))group='mcpe_food:group_'+creativeGroup(key,group.slice('mcpe_food:group_'.length));json(BP,`items/${key}.json`,{format_version:'1.21.90','minecraft:item':{description:{identifier:id(key),menu_category:{category,...(group?{group}:{})}},components:{'minecraft:display_name':{value:`item.${id(key)}.name`},'minecraft:icon':textureKey(key),'minecraft:max_stack_size':64,...components}}});localize(`item.${id(key)}.name`,zh,en);}
function loot(key,entries){json(BP,`loot_tables/blocks/${key}.json`,{pools:entries.map(([name,count])=>({rolls:1,entries:[{type:'item',name,functions:[{function:'set_count',count}]}]}))});}
const directions=[['north',0],['east',-90],['south',180],['west',90]],supportConditions=[];for(let i=0;i<placementSupports.length;i+=64)supportConditions.push({allowed_faces:['up'],block_filter:placementSupports.slice(i,i+64)});
function selection(cubes){const{low,high}=modelBounds(cubes),origin=[Math.max(-8,low[0]-.12),0,Math.max(-8,low[2]-.12)];return{origin,size:[Math.min(8,high[0]+.12)-origin[0],Math.min(16,Math.max(1,high[1]+.15)),Math.min(8,high[2]+.12)-origin[2]]};}
function electronicSelection(cubes){const result=selection(cubes);result.size[1]=Math.min(16,modelBounds(cubes).high[1]+.15);return result;}
function block(key,zh,en,{kind='table',hidden=false,visual,select}={}){const kitchen=kind==='kitchen',appliance=kind==='appliance';visual??={'minecraft:geometry':{identifier:`geometry.mcpe_food.${key}`},'minecraft:material_instances':{'*':blockMaterial(key)}};json(BP,`blocks/${key}.json`,{format_version:'1.26.20','minecraft:block':{description:{identifier:id(key),menu_category:{category:hidden?'none':'construction'},traits:{'minecraft:placement_direction':{enabled_states:['minecraft:cardinal_direction']}}},components:{...visual,'minecraft:destruction_particles':destructionParticles(),'minecraft:collision_box':kitchen||appliance?true:false,'minecraft:selection_box':kitchen||appliance?true:select??{origin:[-6,0,-6],size:[12,12,12]},'minecraft:destructible_by_mining':{seconds_to_destroy:kitchen?1.2:.25},'minecraft:destructible_by_explosion':{explosion_resistance:kitchen?4:1},'minecraft:loot':`loot_tables/blocks/${key}.json`,...(kitchen?{'mcpe_food:kitchen':{}}:appliance?{'mcpe_food:appliance':{},'minecraft:movable':{movement_type:'immovable'},'minecraft:tick':{interval_range:[20,20],looping:true}}:{'mcpe_food:table':{},'minecraft:tick':{interval_range:[20,20],looping:true},'minecraft:placement_filter':{conditions:supportConditions}})},permutations:directions.map(([d,angle])=>({condition:`q.block_state('minecraft:cardinal_direction') == '${d}'`,components:{'minecraft:transformation':{rotation:[0,angle,0]}}}))}});sounds[id(key)]={sound:kitchen?'wood':'glass'};localize(`tile.${id(key)}.name`,zh,en);}
const placeable=(key,zh,en)=>{const ware=vessels.some(v=>v.key===key)||cutlery.some(c=>c.key===key)||key===tray.key;item(key,zh,en,{'minecraft:block_placer':{block:id(key),replace_block_item:true}},ware?'items':'construction',ware?'mcpe_food:group_tableware':undefined);if(ware){const file=path.join(BP,`blocks/${key}.json`),b=JSON.parse(readFileSync(file,'utf8'));b['minecraft:block'].description.menu_category={category:'none'};write(BP,`blocks/${key}.json`,JSON.stringify(b,null,2)+'\n');}};
function prepareModel(key,cubes,slots){const maps=Object.fromEntries(Object.entries(slots).map(([slot,key])=>[slot,textures.get(key)]));icon(key,renderDetail(cubes,maps,128,128,[...patch074Props,...patch080Props,...patch082Props].some(d=>d.key===key)?{front:true}:{}));artRecords.set(key,{cubes,textures:maps});}
for(const vessel of vessels)highTexture(`ware_${vessel.key}`,textureSpec(vessel.key,'ware'));
for(const piece of cutlery)highTexture(`ware_${piece.key}`,textureSpec(piece.key,'ware'));
highTexture('ware_copper_hotpot',textureSpec('copper_hotpot','ware'));
highTexture('food_hotpot_broth',textureSpec('hotpot_broth','food',['#c7a66e','#e6d9b8','#789658']));
for(const food of dishes){highTexture(`food_${food.key}`,textureSpec(food.key,'food',food.colors));prepareModel(food.key,foodCubes(food),{food:`food_${food.key}`,ware:`ware_${food.vessel}`});const edible=food.edible?{'minecraft:food':{nutrition:food.nutrition,saturation_modifier:food.saturation,can_always_eat:true},'minecraft:use_animation':food.category==='drink'?'drink':'eat','minecraft:use_modifiers':{use_duration:1.6,movement_modifier:.35},'minecraft:interact_button':true}:{};item(food.key,food.zh,food.en,{'minecraft:max_stack_size':16,...edible},'items',`mcpe_food:group_${food.category}`);}
for(const s of servings){const cubes=foodCubes(s.food,s.vessel.key),visual=highModel(s.key,cubes,{food:`food_${s.food.key}`,ware:`ware_${s.vessel.key}`});block(s.key,`${s.food.zh} · ${s.vessel.zh}`,`${s.food.en} · ${s.vessel.en}`,{hidden:true,visual,select:selection(cubes)});loot(s.key,[[id(s.vessel.key),1],[id(s.food.key),1]]);}
for(const vessel of vessels){const cubes=vesselCubes(vessel.key),slots={ware:`ware_${vessel.key}`};prepareModel(vessel.key,cubes,slots);block(vessel.key,vessel.zh,vessel.en,{visual:highModel(vessel.key,cubes,slots),select:selection(cubes)});placeable(vessel.key,vessel.zh,vessel.en);loot(vessel.key,[[id(vessel.key),1]]);}
for(const piece of cutlery){const cubes=cutleryCubes(piece.key),slots={ware:`ware_${piece.key}`};prepareModel(piece.key,cubes,slots);block(piece.key,piece.zh,piece.en,{visual:highModel(piece.key,cubes,slots),select:selection(cubes)});placeable(piece.key,piece.zh,piece.en);loot(piece.key,[[id(piece.key),1]]);}
for(const pot of hotpots){const cubes=hotpotCubes(pot.filled),slots={ware:'ware_copper_hotpot',food:'food_hotpot_broth'};prepareModel(pot.key,cubes,slots);block(pot.key,pot.zh,pot.en,{visual:highModel(pot.key,cubes,slots),select:selection(cubes)});placeable(pot.key,pot.zh,pot.en);loot(pot.key,[[id(pot.key),1]]);}
for(const prop of bottleProps){const key=`ware_${prop.key}`,cubes=bottleCubes(prop),slots={ware:key};highTexture(key,textureSpec(prop.key,'ware',[prop.color,'#c7a15b','#e5d5b3']));prepareModel(prop.key,cubes,slots);block(prop.key,prop.zh,prop.en,{hidden:true,visual:highModel(prop.key,cubes,slots),select:selection(cubes)});item(prop.key,prop.zh,prop.en,{'minecraft:block_placer':{block:id(prop.key),replace_block_item:true}},'items','mcpe_food:group_drink');loot(prop.key,[[id(prop.key),1]]);}
for(const p of paperCups){const key=`ware_${p.key}`,cubes=paperCupCubes(),slots={ware:key};highTexture(key,textureSpec(p.key,'ware',[p.color,'#ffffff','#ffffff']));prepareModel(p.key,cubes,slots);block(p.key,p.zh,p.en,{hidden:true,visual:highModel(p.key,cubes,slots),select:selection(cubes)});item(p.key,p.zh,p.en,{'minecraft:block_placer':{block:id(p.key),replace_block_item:true}},'items','mcpe_food:group_drink');loot(p.key,[[id(p.key),1]]);}
function authoredTexture(key,painted,folder){
 textures.set(key,painted);write(root,`${folder}.png`,painted.png);write(root,`${folder}_mer.png`,painted.mer);
 write(RP,`${texturePath('blocks',key)}.png`,painted.png);write(RP,`${texturePath('blocks',key)}_mer.png`,painted.mer);
 json(RP,`${texturePath('blocks',key)}.texture_set.json`,blockTextureSet(key));terrain[textureKey(key)]={textures:texturePath('blocks',key)};
}
{
 const cubes=teaTrayCubes(),key='ware_gongfu_tea_tray',slots={ware:key};authoredTexture(key,tableTexture('tea'),'assets/tea/gongfu_tea_tray');prepareModel(teaTray.key,cubes,slots);
 block(teaTray.key,teaTray.zh,teaTray.en,{hidden:true,visual:highModel(teaTray.key,cubes,slots),select:selection(cubes)});
 item(teaTray.key,teaTray.zh,teaTray.en,{'minecraft:block_placer':{block:id(teaTray.key),replace_block_item:true}},'items','mcpe_food:group_tableware');loot(teaTray.key,[[id(teaTray.key),1]]);
}
for(const finish of ['rose_gold','white','black'])authoredTexture(`ware_fridge_${finish}`,tableTexture('fridge',finish),`assets/appliances/fridge_${finish}`);
for(const fridge of refrigerators){
 const cubes=refrigeratorCubes(fridge),slots={ware:`ware_fridge_${fridge.finish}`};prepareModel(fridge.key,cubes,slots);
 for(let part=0;part<fridge.height;part++){const key=fridge.key+(part?'_upper':''),local=refrigeratorPart(cubes,part);block(key,fridge.zh,fridge.en,{kind:'appliance',hidden:true,visual:highModel(key,local,slots)});loot(key,[]);}
 item(fridge.key,fridge.zh,fridge.en,{'minecraft:block_placer':{block:id(fridge.key),replace_block_item:true}},'items','mcpe_food:group_home_appliances');
}
for(const device of electronics){
  const key=`device_${device.key}`,cubes=electronicCubes(device),painted=electronicTexture(device),slots={ware:key};
  textures.set(key,painted);write(root,`assets/electronics/${device.key}.png`,painted.png);write(root,`assets/electronics/${device.key}_mer.png`,painted.mer);
  write(RP,`${texturePath('blocks',key)}.png`,painted.png);write(RP,`${texturePath('blocks',key)}_mer.png`,painted.mer);
  json(RP,`${texturePath('blocks',key)}.texture_set.json`,blockTextureSet(key));terrain[textureKey(key)]={textures:texturePath('blocks',key)};
  prepareModel(device.key,cubes,slots);block(device.key,device.zh,device.en,{hidden:true,visual:highModel(device.key,cubes,slots),select:electronicSelection(cubes)});
  item(device.key,device.zh,device.en,{'minecraft:block_placer':{block:id(device.key),replace_block_item:true}},'items','mcpe_food:group_electronics');loot(device.key,[[id(device.key),1]]);
}
for(const d of [...restaurantAccessories,...numberVisuals.filter(n=>n.number!==8)]){
 const key=`service_${d.key}`,cubes=serviceCubes(d.key),slots={ware:key};authoredTexture(key,serviceTexture(d.key,d.number??8),`assets/restaurant/${d.key}`);if(restaurantAccessories.some(a=>a.key===d.key))prepareModel(d.key,cubes,slots);else artRecords.set(d.key,{cubes,textures:{ware:textures.get(key)}});
 const visual=highModel(d.key,cubes,slots);
 if(restaurantAccessories.some(a=>a.key===d.key)){block(d.key,d.zh,d.en,{hidden:true,visual,select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items','mcpe_food:group_restaurant_accessories');loot(d.key,[[id(d.key),1]]);}
}
for(const d of lifestyleItems){const key=`lifestyle_${d.key}`,cubes=lifestyleCubes(d.key),slots={ware:key};authoredTexture(key,lifestyleTexture(d.key),`assets/lifestyle/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${officeStationery.includes(d)?'office_stationery':'home_decor'}`);loot(d.key,[[id(d.key),1]]);}
for(const d of scenarioProps){const key=`scenario_${d.key}`,cubes=scenarioCubes(d.key),slots={ware:key};authoredTexture(key,scenarioTexture(d.key),`assets/scenario/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${d.group}`);loot(d.key,[[id(d.key),1]]);}
for(const d of patch071Props){const key=`patch071_${d.key}`,cubes=d.key==='supermarket_checkout'?northFacingCubes(patch071Cubes(d.key)):patch071Cubes(d.key),slots={ware:key};authoredTexture(key,patch071Texture(d.key),`assets/patch-071/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${d.group}`);loot(d.key,[[id(d.key),1]]);}
for(const d of patch072Props){const key=`patch072_${d.key}`,cubes=patch072Cubes(d.key),slots={ware:key};authoredTexture(key,patch072Texture(d.key),`assets/patch-072/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${d.group}`);loot(d.key,[[id(d.key),1]]);}
for(const d of patch073Props){const key=`patch073_${d.key}`,cubes=patch073Cubes(d.key),slots={ware:key};authoredTexture(key,patch073Texture(d.key),`assets/patch-073/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${d.group}`);loot(d.key,[[id(d.key),1]]);}
for(const d of patch074Props){const key=`patch074_${d.key}`,cubes=patch074Cubes(d.key),slots={ware:key};authoredTexture(key,patch074Texture(d.key),`assets/patch-074/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${d.group}`);loot(d.key,[[id(d.key),1]]);}
for(const d of patch074WallVariants){const cubes=wallFacingCubes(northFacingCubes(patch074Cubes(d.base))),key=`patch074_${d.base}`;prepareModel(d.key,cubes,{ware:key});highModel(d.key,cubes,{ware:key});}
authoredTexture('patch080_ceiling_screen',ceilingScreenTexture(),'assets/patch-080/ceiling_screen');
for(const d of patch080Props){const key=`patch080_${d.key}`,cubes=patch080Cubes(d.key),slots=d.key===ceilingDisplayKey?{ware:key,food:'patch080_ceiling_screen'}:{ware:key};authoredTexture(key,patch080Texture(d.key),`assets/patch-080/${d.key}`);prepareModel(d.key,cubes,slots);block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});item(d.key,d.zh,d.en,d.key===ceilingDisplayKey?{}:{'minecraft:block_placer':{block:id(d.key),replace_block_item:true}},'items',`mcpe_food:group_${d.group}`);loot(d.key,[[id(d.key),1]]);}
for(const d of patch082Props){
  const key='patch082_'+d.key,cubes=patch082Cubes(d.key),slots={ware:key};
  authoredTexture(key,patch082Texture(d.key),'assets/patch-082/'+d.key);
  prepareModel(d.key,cubes,slots);
  block(d.key,d.zh,d.en,{hidden:true,visual:highModel(d.key,cubes,slots),select:selection(cubes)});
  item(d.key,d.zh,d.en,{},'items','mcpe_food:group_'+d.group);
  loot(d.key,[[id(d.key),1]]);
}
for(const d of clothingItems){const key=`patch072_${d.key}`,cubes=clothingCubes(d),slots={ware:key};authoredTexture(key,patch072Texture(d.key),`assets/patch-072/${d.key}`);prepareModel(d.key,cubes,slots);item(d.key,d.zh,d.en,{},'items','mcpe_food:group_clothing_items');}
for(const d of wallVariants){const old=['table_clock','landscape_frame'].includes(d.base),key=old?`lifestyle_${d.base}`:`scenario_${d.base}`;let cubes;
 if(old){cubes=lifestyleCubes(d.base).filter(c=>c.origin[1]>.4&&c.origin[2]>-1);const min=Math.min(...cubes.map(c=>c.origin[2]));cubes=cubes.map(c=>({...c,origin:[c.origin[0],c.origin[1],c.origin[2]-min]}));}else cubes=scenarioCubes(d.base,true);
 cubes=wallFacingCubes(cubes);prepareModel(d.key,cubes,{ware:key});highModel(d.key,cubes,{ware:key});
}
brandPosters();
cityPosters();
json(root,'assets/electronics/layout.json',{resolution:128,atlas:electronicUV,devices:electronics.map(d=>({...d,selection:electronicSelection(electronicCubes(d))})),geometrySource:'tools/electronics-art.mjs',description:'Original authored UV islands; fixed screens, separate physical surface properties.'});
{const cubes=trayCubes(),slots={ware:'ware_triple_tray'};highTexture('ware_triple_tray',textureSpec('triple_tray','ware',['#292d32','#c7a15b','#eee9d9']));prepareModel(tray.key,cubes,slots);block(tray.key,tray.zh,tray.en,{visual:highModel(tray.key,cubes,slots),select:selection(cubes)});placeable(tray.key,tray.zh,tray.en);loot(tray.key,[]);}
for(const station of stations){lowAsset(station.key,stationModel(station.key),station.colors);block(station.key,station.zh,station.en,{kind:'kitchen'});placeable(station.key,station.zh,station.en);loot(station.key,[[id(station.key),1]]);}
for(const m of materials){let cubes=[box(-3,1,-3,6,4,6,6),box(-2,5,-2,4,.5,4,4)];if(m.key==='noodles'||m.key==='vermicelli')cubes=Array.from({length:6},(_,i)=>box(-3+i,1,-4,.6,.6,8,6));if(m.key==='sea_bass')cubes=oldFood({...foods.find(f=>f.shape==='fish'),vessel:'plate'}).slice(10);if(m.key==='shrimp')cubes=oldFood({...foods.find(f=>f.shape==='prawns'),vessel:'plate'}).slice(10);if(m.key==='scallop')cubes=[box(-4,1,-3,8,1,6,6),box(-3,2,-2,6,1,4,4),box(-1.5,3,-1.5,3,2,3,6)];if(m.key==='eel')cubes=[box(-4,1,-2,8,1.5,1.5,6),box(2.5,1,-2,1.5,1.5,4,6),box(-1,1,.5,5,1.5,1.5,6)];if(['seasoning','garlic'].includes(m.key))cubes=[box(-2,1,-2,4,6,4,4),box(-2.3,7,-2.3,4.6,1,4.6,2),box(-2.1,3,2,4,.8,.1,6)];lowAsset(m.key,cubes,[m.color,'#d9cca0','#779856']);item(m.key,m.zh,m.en,{},'nature','minecraft:itemGroup.name.crop');}
const shapeless=(key,ingredients,result,count=1)=>json(BP,`recipes/${key}.json`,{format_version:'1.20.10','minecraft:recipe_shapeless':{description:{identifier:id(`recipe_${key}`)},tags:['crafting_table'],ingredients:ingredients.map(([item])=>({item})),result:{item:result,count}}});
const shaped=(key,pattern,keys,result,count=1)=>json(BP,`recipes/${key}.json`,{format_version:'1.20.10','minecraft:recipe_shaped':{description:{identifier:id(`recipe_${key}`)},tags:['crafting_table'],pattern,key:Object.fromEntries(Object.entries(keys).map(([key,item])=>[key,{item}])),result:{item:result,count}}});
for(const c of crops){const key=`${c.key}_crop`,seeds=`${c.key}_seeds`;lowAsset(seeds,[box(-3,0,-3,6,5,6,4),box(-2.5,5,-2.5,5,1.5,5,2),box(-1.5,1,3,3,3,.2,6)],[c.color,'#e5d5b3','#698e4f']);item(seeds,`${c.zh}种子`,`${c.en} Seeds`,{'minecraft:block_placer':{block:id(key),use_on:['minecraft:farmland']}},'nature','minecraft:itemGroup.name.seed');shapeless(seeds,[['minecraft:wheat_seeds'],[c.seedIngredient]],id(seeds),2);for(let age=0;age<4;age++)lowAsset(`${key}_${age}`,cropModel(c,age),[c.color,'#8baa63','#749e54'],false);json(BP,`blocks/${key}.json`,{format_version:'1.26.20','minecraft:block':{description:{identifier:id(key),menu_category:{category:'none'},states:{'mcpe_food:growth':[0,1,2,3]}},components:{'minecraft:geometry':{identifier:`geometry.mcpe_food.${key}_0`},'minecraft:material_instances':{'*':blockMaterial(`${key}_0`)},'minecraft:destruction_particles':destructionParticles(),'minecraft:collision_box':false,'minecraft:selection_box':{origin:[-5,0,-5],size:[10,4,10]},'minecraft:destructible_by_mining':{seconds_to_destroy:.05},'minecraft:loot':`loot_tables/blocks/${key}_young.json`,'minecraft:placement_filter':{conditions:[{allowed_faces:['up'],block_filter:['minecraft:farmland']}]},'mcpe_food:crop':{}},permutations:[0,1,2,3].map(age=>({condition:`q.block_state('mcpe_food:growth') == ${age}`,components:{'minecraft:geometry':{identifier:`geometry.mcpe_food.${key}_${age}`},'minecraft:material_instances':{'*':blockMaterial(`${key}_${age}`)},'minecraft:selection_box':{origin:[-6.5,0,-6.5],size:[13,Math.max(4,4+age*3),13]},'minecraft:loot':`loot_tables/blocks/${key}_${age===3?'mature':'young'}.json`}}))}});loot(`${key}_young`,[[id(seeds),1]]);loot(`${key}_mature`,[[id(seeds),2],[id(c.key),3]]);localize(`tile.${id(key)}.name`,`${c.zh}植株`,`${c.en} Plant`);sounds[id(key)]={sound:'grass'};}
shapeless('plate',[['minecraft:clay_ball'],['minecraft:clay_ball'],['minecraft:clay_ball']],id('plate'),2);shapeless('bowl',Array.from({length:4},()=>['minecraft:clay_ball']),id('bowl'),2);shapeless('glass',Array.from({length:3},()=>['minecraft:glass']),id('glass'),2);shapeless('mug',[['minecraft:clay_ball'],['minecraft:clay_ball'],['minecraft:clay_ball'],['minecraft:brick']],id('mug'),2);shapeless('chopsticks',[['minecraft:bamboo'],['minecraft:bamboo']],id('chopsticks'),2);shapeless('table_knife',[['minecraft:iron_ingot'],['minecraft:stick']],id('table_knife'));shapeless('fork',[['minecraft:iron_ingot'],['minecraft:iron_nugget'],['minecraft:iron_nugget'],['minecraft:stick']],id('fork'));shapeless('spoon',[['minecraft:iron_nugget'],['minecraft:stick']],id('spoon'));
shaped('prep_counter',['PPP','SCS','PPP'],{P:'minecraft:oak_planks',S:'minecraft:stick',C:'minecraft:crafting_table'},id('prep_counter'));shaped('stove',['III','IFI','SSS'],{I:'minecraft:iron_ingot',F:'minecraft:furnace',S:'minecraft:stone'},id('stove'));shaped('oven',['III','IFI','BBB'],{I:'minecraft:iron_ingot',F:'minecraft:furnace',B:'minecraft:brick'},id('oven'));shaped('drink_counter',['GGG','PBP','PPP'],{G:'minecraft:glass',P:'minecraft:oak_planks',B:'minecraft:bucket'},id('drink_counter'));
write(RP,`${texturePath('blocks',BREAK_DUST)}.png`,breakDustImage());json(RP,`${texturePath('blocks',BREAK_DUST)}.texture_set.json`,itemTextureSet(BREAK_DUST));terrain[textureKey(BREAK_DUST)]={textures:texturePath('blocks',BREAK_DUST)};
const displayBuild=buildDisplays({root,BP,RP,json,write,icon,item,localize,modelRecords});
const groupIcons=['egg_fried_rice','steak','sushi_platter','egg_tart','green_tea'];
const creativeGroups=Object.entries(categories).map(([category,names],i)=>{const name=`mcpe_food:group_${category}`;localize(name,...names);return{group_identifier:{name,icon:id(groupIcons[i])},items:[...dishes.filter(f=>f.category===category),...(category==='drink'?[...bottleProps,...paperCups]:[])].map(f=>id(f.key))};});
creativeGroups.push({group_identifier:{name:'mcpe_food:group_tableware',icon:id('plate')},items:[...vessels,...cutlery,tray,teaTray].map(v=>id(v.key))},{group_identifier:{name:'mcpe_food:group_advertisements',icon:id(advertisements[0].key)},items:[...advertisements,...digitalScreens].map(a=>id(a.key))});
localize('mcpe_food:group_electronics','电子设备','Electronics');creativeGroups.push({group_identifier:{name:'mcpe_food:group_electronics',icon:id('desktop_computer')},items:[...electronics,...patch071Props.filter(d=>d.group==='electronics'),...patch072Props.filter(d=>d.group==='electronics')].map(d=>id(d.key))});
localize('mcpe_food:group_restaurant_accessories','餐厅用品','Restaurant Accessories');creativeGroups.push({group_identifier:{name:'mcpe_food:group_restaurant_accessories',icon:id('table_number_sign')},items:restaurantAccessories.map(d=>id(d.key))});
for(const [key,zh,en,list]of [['office_stationery','办公文具','Office Stationery',[...officeStationery,...patch072Props.filter(d=>d.group==='office_stationery')]],['home_decor','居家装饰','Home Decor',homeDecor]]){localize(`mcpe_food:group_${key}`,zh,en);creativeGroups.push({group_identifier:{name:`mcpe_food:group_${key}`,icon:id(list[0].key)},items:list.map(d=>id(d.key))});}
for(const g of scenarioGroups){localize(`mcpe_food:group_${g.key}`,g.zh,g.en);creativeGroups.push({group_identifier:{name:`mcpe_food:group_${g.key}`,icon:id(g.items[0].key)},items:[...g.items,...patch071Props.filter(d=>d.group===g.key),...(g.key==='home_appliances'?refrigerators:[])].map(d=>id(d.key))});}
for(const g of patch074Groups){localize(`mcpe_food:group_${g.key}`,g.zh,g.en);creativeGroups.push({group_identifier:{name:`mcpe_food:group_${g.key}`,icon:id(g.items[0].key)},items:g.items.map(d=>id(d.key))});}
for(const g of patch072Groups){localize(`mcpe_food:group_${g.key}`,g.zh,g.en);creativeGroups.push({group_identifier:{name:`mcpe_food:group_${g.key}`,icon:id(g.items[0].key)},items:g.items.map(d=>id(d.key))});}
for(const g of creativeGroups)g.items=g.items.filter(k=>!governmentLegacyKeys.includes(k.replace('mcpe_food:','')));
localize('mcpe_food:group_government_equipment','政务设备','Government Equipment');creativeGroups.push({group_identifier:{name:'mcpe_food:group_government_equipment',icon:id('government_service_kiosk')},items:governmentKeys.map(id)});
for(const d of patch073Props.filter(d=>d.group!=='government_equipment'))creativeGroups.find(g=>g.group_identifier.name===`mcpe_food:group_${d.group}`).items.push(id(d.key));
localize('mcpe_food:group_laboratory_equipment','实验设备','Laboratory Equipment');creativeGroups.push({group_identifier:{name:'mcpe_food:group_laboratory_equipment',icon:id('laboratory_centrifuge')},items:laboratoryKeys.map(id)});
for(const d of patch080Props.filter(d=>d.group==='electronics'))creativeGroups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics').items.push(id(d.key));
for(const d of patch082Props)creativeGroups.find(g=>g.group_identifier.name==='mcpe_food:group_'+d.group).items.push(id(d.key));
json(BP,'item_catalog/crafting_item_catalog.json' ,{format_version:'1.21.60','minecraft:crafting_items_catalog':{categories:[{category_name:'items',groups:creativeGroups}]}});
json(RP,'textures/item_texture.json',{resource_pack_name:'food_and_table',texture_name:'atlas.items',texture_data:icons});json(RP,'textures/terrain_texture.json',{resource_pack_name:'food_and_table',texture_name:'atlas.terrain',padding:8,num_mip_levels:4,texture_data:terrain});json(RP,'blocks.json',sounds);json(RP,'texts/languages.json',['en_US','zh_CN']);for(const[locale,lines]of Object.entries(langs))write(RP,`texts/${locale}.lang`,lines.join('\n')+'\n');
const giveFunction=(name,keys)=>write(BP,`functions/mcpe_food/${name}.mcfunction`,keys.map(key=>`give @s ${id(key)} 4`).join('\n')+'\n');
giveFunction('starter',[...stations,...vessels,...cutlery,tray,...paperCups].map(v=>v.key).concat(['peacock_platter','takoyaki','premium_red_wine','premium_red_wine_bottle','copper_hotpot_broth']));giveFunction('creative_ingredients',materials.filter(m=>m.creativeOnly).map(m=>m.key));
for(const category of Object.keys(legacyCategories)){const keys=previousDishes.filter(f=>f.legacyCategory===category).map(f=>f.key);if(category==='hotpot')keys.push(...hotpots.map(p=>p.key));if(keys.length)giveFunction(`tasting_${category}`,keys);}
for(const category of Object.keys(categories))giveFunction(`tasting_all_${category}`,[...dishes.filter(f=>f.category===category),...(category==='drink'?[...bottleProps,...paperCups]:[]),...(category==='chinese'?patch073Props.filter(d=>d.group==='chinese'):[])].map(f=>f.key));
giveFunction('restaurant_accessories',restaurantAccessories.map(d=>d.key));giveFunction('office_stationery',[...officeStationery,...patch072Props.filter(d=>d.group==='office_stationery')].map(d=>d.key));giveFunction('home_decor',homeDecor.map(d=>d.key));giveFunction('tasting_new',patch082Items.map(d=>d.key));giveFunction('laboratory_equipment',laboratoryKeys);giveFunction('government_equipment',governmentKeys);giveFunction('electronics',[...electronics,...refrigerators,...patch071Props.filter(d=>d.group==='electronics'),...patch072Props.filter(d=>d.group==='electronics'),...patch073Props.filter(d=>d.group==='electronics'),...patch080Props.filter(d=>d.group==='electronics')].map(d=>d.key));
for(const g of scenarioGroups)giveFunction(g.key,[...g.items,...patch071Props.filter(d=>d.group===g.key),...patch082Props.filter(d=>d.group===g.key),...(g.key==='home_appliances'?refrigerators:[])].map(d=>d.key));giveFunction('digital_ad_screens',digitalScreens.map(d=>d.key));
for(const g of patch074Groups)giveFunction(g.key,[...g.items,...patch082Props.filter(d=>d.group===g.key)].map(d=>d.key));
for(const g of patch072Groups)giveFunction(g.key,g.items.map(d=>d.key));giveFunction('clothing_store',[...patch072Groups[0].items,...clothingItems].map(d=>d.key));
giveFunction('advertisements',advertisements.map(a=>a.key));giveFunction('tableware',[...vessels,...cutlery,tray,teaTray].map(v=>v.key));
mkdirSync(path.join(root,'previews'),{recursive:true});
function sheet(keys,columns,title,file,cell=176){
  const rows=Math.ceil(keys.length/columns),image=canvas(columns*cell,80+rows*cell,[25,36,35,255]);
  text(image,title,20,18,2,[233,212,166,255]);
  text(image,'128PX / ACTUAL UV COLOR PREVIEW - NOT A GAME SCREENSHOT',20,48,1,[153,174,158,255]);
  keys.forEach((key,i)=>{
    const art=artRecords.get(key),x=i%columns*cell,y=80+Math.floor(i/columns)*cell;
    rect(image,x+5,y+3,cell-10,cell-8,[36,48,45,255]);
    const view=(file.startsWith('patch_082')||file.startsWith('patch_080')||file.startsWith('patch_074')||file.startsWith('patch_073')||file.startsWith('patch_072')||file.includes('rear')||file==='wall_mounts.png')?{front:true}:file.startsWith('details')||file==='patch_071_hardware.png'||modelBounds(art.cubes).high[1]>16?{}:{worldScale:cell*.033};
    blit(image,renderDetail(art.cubes,art.textures,cell-12,cell-45,view),x+6,y+4);
    const en=patch082Props.find(d=>d.key===key)?.en??refrigerators.find(d=>d.key===key)?.en??(key===teaTray.key?teaTray.en:undefined)??electronics.find(d=>d.key===key)?.en??dishes.find(f=>f.key===key)?.en??vessels.find(v=>v.key===key)?.en??cutlery.find(v=>v.key===key)?.en??hotpots.find(v=>v.key===key)?.en??bottleProps.find(v=>v.key===key)?.en??(key==='premium_red_wine_on_wine_glass'?'Stemmed Red Wine':key);
    let line='',lineIndex=0;
    for(const word of en.toUpperCase().split(' ')){
      if((line+' '+word).trim().length>Math.floor((cell-20)/6)){
        text(image,line,x+10,y+cell-35+lineIndex*10,1);line=word;lineIndex++;
      }else line=(line+' '+word).trim();
    }
    text(image,line,x+10,y+cell-35+lineIndex*10,1);
  });
  saveImage(path.join(root,'previews',file),image);
}
sheet(officeStationery.map(d=>d.key),4,`OFFICE STATIONERY ${version}`,'office_stationery.png',300);sheet(homeDecor.map(d=>d.key),4,`HOME DECOR ${version}`,'home_decor.png',300);sheet(newProps.filter(d=>'model' in d).map(d=>d.key),3,`NETWORK DEVICES ${version}`,'network_devices.png',350);
sheet(restaurantItems.map(d=>d.key),4,`RESTAURANT ${version} / 8 DISPLAYS`,'restaurant.png',320);sheet(numberVisuals.map(d=>d.key),9,'TABLE NUMBERS 01-99','table_numbers.png',130);sheet(['touchscreen_register','payment_scanner','receipt_printer','menu_stand'],2,'RESTAURANT DETAILS','restaurant_details.png',500);
sheet(foods.map(f=>f.key),8,`FOOD & TABLE ${version} - ${foods.length} MEALS`,'menu.png');sheet([...vessels,...cutlery,tray,teaTray].map(v=>v.key),4,'BLACK GOLD / BURGUNDY - TABLEWARE','tableware.png',220);sheet([...hotpots,...displays,...foods.filter(f=>f.legacyCategory==='hotpot')].map(v=>v.key),4,'COPPER HOTPOT - TABLE SET','hotpot.png',220);
{const key='premium_red_wine_on_wine_glass',f=foods.find(f=>f.key==='premium_red_wine');artRecords.set(key,{cubes:foodCubes(f,'wine_glass'),textures:{food:textures.get('food_premium_red_wine'),ware:textures.get('ware_wine_glass')}});}
sheet([tray.key,'wine_glass',...paperCups.map(p=>p.key),'premium_red_wine_on_wine_glass'],3,'TABLEWARE / CLOSE VIEW','details.png',300);
sheet([...electronics,...refrigerators].map(d=>d.key),5,`ELECTRONICS ${version} / ${electronics.length+refrigerators.length} DISPLAYS`,'electronics.png',270);
sheet(['desktop_computer','all_in_one_computer','crt_monitor','ipad_air_magic_keyboard'],2,'ELECTRONICS / ACTUAL UV CLOSE VIEW','details_electronics.png',510);
sheet(electronics.filter(d=>d.model==='laptop').map(d=>d.key),4,`LAPTOPS / ${electronics.filter(d=>d.model==='laptop').length} POSES`,'details_laptops.png',370);
sheet(['macbook_open','thinkpad_open','ipad_air_magic_keyboard','server_cabinet'],2,'ELECTRONICS / REAR AND SUPPORT DETAIL','details_electronics_rear.png',510);
sheet(refrigerators.map(d=>d.key),3,'REFRIGERATORS / TWO HEIGHTS AND THREE FINISHES','details_fridges.png',360);
sheet([teaTray.key,'tieguanyin'],2,'GONGFU TEA / TIEGUANYIN','details_tea.png',430);
sheet(newElectronics.map(d=>d.key),2,'DELL TERMINAL / MACBOOK PRO GPT','details_new_laptops.png',430);
sheet(officeElectronics.map(d=>d.key),3,`${version} / OFFICE ELECTRONICS`,'office_devices.png',430);
sheet(officeElectronics.filter(d=>d.model==='laptop').map(d=>d.key),2,'MACBOOK AIR / THINKBOOK 16+','office_laptops.png',510);
for(const[category,names]of Object.entries(categories))sheet(foods.filter(f=>f.category===category).map(f=>f.key),5,`${names[1].toUpperCase()} / ${version}`,`category_${category}.png`,220);
const kitchen=canvas(880,920,[25,36,35,255]);text(kitchen,`A LITTLE KITCHEN / ${version}`,20,18,2,[233,212,166,255]);
for(const[s,i]of stations.map((s,i)=>[s,i])){
  const front=stationModel(s.key).map(c=>({...c,origin:[-c.origin[0]-c.size[0],c.origin[1],-c.origin[2]-c.size[2]]}));
  blit(kitchen,render(front,palette(s.colors),205,160),i*220+7,65);text(kitchen,s.en,i*220+10,235,1);
}
for(const[v,i]of [...vessels,...cutlery].map((v,i)=>[v,i])){
  const art=artRecords.get(v.key),x=i%4*220,y=270+Math.floor(i/4)*210;
  blit(kitchen,renderDetail(art.cubes,art.textures,205,160,{worldScale:7.2}),x+7,y);text(kitchen,v.en,x+10,y+175,1);
}
saveImage(path.join(root,'previews/kitchen.png'),kitchen);
const cover=canvas(256,256,[25,36,35,255]),burger=artRecords.get('burger');blit(cover,renderDetail(burger.cubes,burger.textures,220,170),18,3);text(cover,'FOOD &',38,185,3,[233,212,166,255]);text(cover,'TABLE',56,216,3,[233,212,166,255]);for(const base of[BP,RP])write(base,'pack_icon.png',png(256,256,cover.data));
const lines=[`# ${version} 菜品与器皿索引`,'',`${foods.length} 种可食成品，${displays.length} 种不可食展示配菜，${hotpots.length} 款静态铜锅，${vessels.length+cutlery.length+2} 种餐具，${bottleProps.length} 款酒瓶摆件。新增内容通过创造物品栏或分组试用命令获取。`,'', '| 分类 | 可食成品数 |', '|---|---|', ...Object.entries(categories).map(([key,names])=>`| ${names[0]} | ${foods.filter(f=>f.category===key).length} |`) ,'','## 菜品与展示配菜','','同类别碗盘通用；表中标注的是默认器皿。蛋挞沿用 `mcpe_food:egg_tart`。','','| 类型 | 分类 | 中文名 | ID | 默认器皿 |','|---|---|---|---|---|'];for(const f of [...dishes].sort((a,b)=>Object.keys(categories).indexOf(a.category)-Object.keys(categories).indexOf(b.category)))lines.push(`| ${f.edible?'可食':'展示'} | ${categories[f.category][0]} | ${f.zh} | \`${id(f.key)}\` | ${vessels.find(v=>v.key===f.vessel).zh} |`);lines.push('','## 餐具','','| 名称 | ID | 类别 |','|---|---|---|');for(const v of vessels)lines.push(`| ${v.zh} | \`${id(v.key)}\` | ${v.family} |`);for(const c of cutlery)lines.push(`| ${c.zh} | \`${id(c.key)}\` | 装饰 |`);lines.push(`| ${tray.zh} | ${id(tray.key)} | 三盘托盘 |`,`| ${teaTray.zh} | ${id(teaTray.key)} | 静态茶具套装 |`);lines.push('', '## 酒瓶摆件', '', '| 名称 | ID |', '|---|---|'); for(const p of bottleProps)lines.push(`| ${p.zh} | ${id(p.key)} |`); lines.push('','## 原有制作配方（保持不变）','','| 菜品/备料 | 厨具 | 材料 | 产量 |','|---|---|---|---|');for(const r of recipes)lines.push(`| ${r.zh} | ${stations.find(s=>s.key===r.station).zh} | ${r.inputs.map(i=>`${label(i.item)} ×${i.count}${i.returns?'（返还'+label(i.returns)+'）':''}`).join('、')} | ${r.output} |`);lines.push('','## 品牌纸杯摆件','','| 名称 | ID |','|---|---|');for(const p of paperCups)lines.push(`| ${p.zh} | ${id(p.key)} |`);lines.push('','## 广告画','','每幅支持三档尺寸，完整尺寸与操作见ADVERTISEMENTS.md。','','| 名称 | ID | 比例 |','|---|---|---|');for(const a of advertisements)lines.push(`| ${a.zh} | ${id(a.key)} | ${a.aspect} |`);lines.push('','## 支撑表面','','另支持原版上半砖、下半砖和双层半砖；低位桌面展示贴合下半砖。广告画只使用完整背墙。','','## 完整支撑方块','',supportBlocks.map(b=>`\`${b}\``).join('、'));lines.push('','## 电子设备','',`${electronics.length+refrigerators.length}款静态摆件；笔记本开合为独立物品，冰箱高度为1或2格。`,'','| 名称 | ID | 姿态 |','|---|---|---|');for(const d of [...electronics,...refrigerators.map(r=>({...r,pose:r.shape}))])lines.push(`| ${d.zh} | ${id(d.key)} | ${d.pose} |`);write(root,'docs/CATALOG.md',lines.join('\n')+'\n');
patchPreviews(root,artRecords,electronics);
json(root,'model-report.json',{version,models:modelRecords,entityModels:displayBuild.entityModels,iconSizes:Object.fromEntries(Object.entries(icons).map(([k,e])=>[k,readFileSync(path.join(RP,e.textures+'.png')).readUInt32BE(16)]))});
json(root,'build-report.json',{version,foods:foods.length,displayDishes:displays.length,hotpots:hotpots.length,bottleProps:bottleProps.length,categories:Object.fromEntries(Object.keys(categories).map(key=>[key,foods.filter(f=>f.category===key).length])),tableware:vessels.length+cutlery.length+2,advertisements:advertisements.length,advertisementSizes:advertisements.length*3,paperCups:paperCups.length,officeStationery:creativeGroups.find(g=>g.group_identifier.name==='mcpe_food:group_office_stationery').items.length,legacyOfficeStationery:officeStationery.length,homeDecor:homeDecor.length,restaurantAccessories:restaurantAccessories.length,electronics:patch080Props.filter(d=>d.group==='electronics').length+patch073Props.filter(d=>d.group==='electronics').length+electronics.length+refrigerators.length+patch071Props.filter(d=>d.group==='electronics').length+patch072Props.filter(d=>d.group==='electronics').length,legacyElectronics:electronics.length+refrigerators.length,refrigerators:refrigerators.length,refrigeratorParts:refrigerators.reduce((n,r)=>n+r.height,0),surfaceClasses:Object.fromEntries(['full','slab','stairs','excluded'].map(k=>[k,Object.values(vanillaSurfaceClasses).filter(v=>v.kind===k).length])),entityGeometryCount:displayBuild.entityModels.length,stations:stations.length,crops:crops.length,menuRecipes:recipes.length,servingVariants:servings.length,geometryCount:modelRecords.length+displayBuild.entityModels.length,blockGeometryCount:modelRecords.length,scenarioProps:scenarioProps.length,patch071Props:patch071Props.length,patch072Props:patch072Props.length,patch073Props:patch073Props.length,governmentEquipment:governmentKeys.length,clothingItems:clothingItems.length,patch074Props:patch074Props.length,patch080Props:patch080Props.length,laboratoryEquipment:laboratoryKeys.length,patch082Props:patch082Props.length,newCreativeItems:patch082Items.length,clothingDisplayDefinitions:clothingVisuals.length,electronicsGroupItems:creativeGroups.find(g=>g.group_identifier.name==='mcpe_food:group_electronics').items.length,officeStationeryCommandItems:officeStationery.length+patch072Props.filter(d=>d.group==='office_stationery').length,infoScreens:infoScreens.length,trialBuild:BUILD_ID,electronicsCommandItems:patch080Props.filter(d=>d.group==='electronics').length+patch073Props.filter(d=>d.group==='electronics').length+electronics.length+refrigerators.length+patch071Props.filter(d=>d.group==='electronics').length+patch072Props.filter(d=>d.group==='electronics').length,aiWorkDevices:scenarioGroups.find(g=>g.key==='ai_work_devices').items.length+patch071Props.filter(d=>d.group==='ai_work_devices').length,digitalScreens:digitalScreens.length,pbrTextureSets:Object.keys(terrain).length+Object.keys(icons).length+displayBuild.entityTextureSets,highDetailModels:modelRecords.filter(m=>m.resolution===128).length,maxDetailCubes:Math.max(...modelRecords.filter(m=>m.resolution===128).map(m=>m.cubes)),customDestructionParticles:0,staticStatus:'generated; run npm run check',gameStatus:'NOT TESTED — Windows / Android / multiplayer / Vibrant Visuals'});
console.log(`Generated ${foods.length} edible dishes, ${displays.length} display dishes, ${hotpots.length} hotpots, ${vessels.length+cutlery.length+2} tableware, ${servings.length} serving variants.`);console.log('128px UV previews: previews/menu.png, tableware.png, hotpot.png, details.png');

await import('./service-previews.mjs');

await import('./lifestyle-previews.mjs');
sheet(patch071Props.map(d=>d.key),2,'0.7.1 CHECKOUT AND GRAPHICS CARDS','patch_071_hardware.png',380);
for(const g of scenarioGroups)sheet(g.items.map(d=>d.key),3,g.en.toUpperCase(),g.key+'.png',300);sheet(wallVariants.map(d=>d.key),3,'WALL MOUNTS','wall_mounts.png',300);
const catalog=readFileSync(path.join(root,'docs/CATALOG.md'),'utf8');write(root,'docs/CATALOG.md',catalog+'\n\n## 0.7.0场景设备\n\n'+scenarioGroups.map(g=>'### '+g.zh+'\n\n'+g.items.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')).join('\n\n')+'\n\n## 0.7.1硬件新品\n\n'+patch071Props.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')+'\n\n## 电子广告屏\n\n'+digitalScreens.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')+'\n');
sheet(patch072Props.map(d=>d.key),3,'0.7.2 STATIC EQUIPMENT / TRIAL 1','patch_072_equipment.png',340);
sheet(clothingItems.map(d=>d.key),3,'0.7.2 CLOTHING / RACK CONTENT ONLY','patch_072_clothing.png',300);
write(root,'docs/CATALOG.md',readFileSync(path.join(root,'docs/CATALOG.md'),'utf8')+'\n\n## 0.7.2试用新品（21件）\n\n'+[...patch072Props,...clothingItems].map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')+'\n');
await import('./scenario-previews.mjs');
const {patch072Previews}=await import('./patch-072-previews.mjs');patch072Previews();
{const g=JSON.parse(readFileSync(path.join(RP,'models/entity/mcpe_food/government_queue_screen.geo.json')) )['minecraft:geometry'][0],c=JSON.parse(readFileSync(path.join(RP,'entity/mcpe_food/digital_ad_display.entity.json')))['minecraft:client_entity'].description;artRecords.set('government_queue_screen',{cubes:g.bones.flatMap(b=>b.cubes.map(v=>({...v,material:b.name,faces:Object.keys(v.uv)}))),textures:{food:decodeRGBA(readFileSync(path.join(RP,c.textures.f10+'.png'))),ware:decodeRGBA(readFileSync(path.join(RP,c.textures.w10+'.png')))}});}
sheet(governmentKeys,3,'0.7.3 GOVERNMENT EQUIPMENT','patch_073_government.png',330);
sheet(patch073Props.filter(d=>d.group==='electronics').map(d=>d.key),3,'FT-B1 / FT-IDEABOOK-P1 / FT-MASTER - 90 DEG','patch_073_laptops.png',420);
sheet(['chinese_five_sauce_set'],1,'FIVE CHINESE SAUCES / ONE DISPLAY ITEM','patch_073_sauces.png',650);
write(root,'docs/CATALOG.md',readFileSync(path.join(root,'docs/CATALOG.md'),'utf8')+'\n\n## 0.7.3新品（10件）\n\n'+patch073Props.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')+'\n\n政务组迁入旧5件：'+governmentLegacyKeys.join('、')+'\n');
for(const g of patch074Groups)sheet(g.items.map(d=>d.key),3,g.en.toUpperCase(),`patch_074_${g.key}.png`,360);
write(root,'docs/CATALOG.md',readFileSync(path.join(root,'docs/CATALOG.md'),'utf8')+'\n\n## 0.7.4 新增分类\n\n'+patch074Groups.map(g=>'### '+g.zh+'\n\n'+g.items.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')).join('\n\n')+'\n');
sheet(laboratoryKeys,3,'0.8.0 LABORATORY EQUIPMENT','patch_080_laboratory.png',370);
sheet(patch080Props.filter(d=>d.group==='electronics').map(d=>d.key),3,'0.8.0 MULTI MONITORS / PORTRAIT 45 DEG','patch_080_monitors.png',450);
sheet([ceilingDisplayKey],1,'2X1 CEILING ARM / TWO BLOCK DROP','patch_080_ceiling.png',720);
{const original=artRecords.get(ceilingDisplayKey),guide=canvas(128,128,[153,161,158,255]),face={uv:[0,0],uv_size:[1,1],material_instance:'guide'},cs=[-16,.1].map(x=>({origin:[x,32,-8],size:[15.9,2,16],material:'guide',uv:Object.fromEntries(['north','south','east','west','up','down'].map(f=>[f,face]))}));artRecords.set('ceiling_installation',{cubes:[...original.cubes,...cs],textures:{...original.textures,guide:{...guide,pixels:guide.data}}});sheet(['ceiling_installation'],1,'CEILING INSTALL / TWO FULL SUPPORTS - OFFLINE GUIDE','patch_080_ceiling_install.png',760);}

write(root,'docs/CATALOG.md',readFileSync(path.join(root,'docs/CATALOG.md'),'utf8')+'\n\n## 0.8.0实验设备与多屏\n\n'+patch080Props.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')+'\n');
for(const [group,title,name] of [
  ['medical_equipment','0.8.2 ICU / EICU EQUIPMENT','patch_082_medical.png'],
  ['military_police_equipment','0.8.2 POLICE PROPS','patch_082_police.png'],
])sheet(patch082Props.filter(d=>d.group===group).map(d=>d.key),4,title,name,290);
write(root,'docs/CATALOG.md',readFileSync(path.join(root,'docs/CATALOG.md'),'utf8')+'\n\n## 0.8.2 医疗、警务与广告屏\n\n'+patch082Items.map(d=>'- '+d.zh+' / '+id(d.key)).join('\n')+'\n');
const {optimizeRelease}=await import('./optimize-release.mjs');optimizeRelease();
