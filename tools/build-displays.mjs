import {patch082Props} from "../.build/patch-082-catalog.js";
import {patch082Cubes} from "./patch-082-art.mjs";
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch085Cubes} from './patch-085-art.mjs';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch080Cubes} from './patch-080-art.mjs';
import {patch074Props} from '../.build/patch-074-catalog.js';
import {patch074Cubes} from './patch-074-art.mjs';
import {patch073Props} from '../.build/patch-073-catalog.js';
import {patch073Cubes} from './patch-073-art.mjs';
import {patch072Props,clothingItems,clothingVisuals,rackSpecs} from '../.build/patch-072-catalog.js';
import {patch072Cubes,clothingCubes,clothingGeometry} from './patch-072-art.mjs';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {patch071Cubes} from './patch-071-art.mjs';
import {digitalDisplays} from './digital-displays.mjs';
import {scenarioProps} from '../.build/scenario-catalog.js';
import {scenarioCubes} from './scenario-art.mjs';
import {readFileSync,copyFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {advertisements,surfaceVisuals,trayFoods,tray,paperCups} from '../.build/decor-catalog.js';
import {lifestyleItems} from '../.build/lifestyle-catalog.js';
import {lifestyleCubes} from './lifestyle-art.mjs';
import {restaurantAccessories} from '../.build/restaurant-catalog.js';
import {serviceCubes} from './service-art.mjs';
import {electronics} from '../.build/electronics-catalog.js';
import {electronicCubes} from './electronics-art.mjs';
import {id,servings} from '../.build/catalog.js';
import {decodeRGBA} from './png-inspect.mjs';
import {png,canvas,blit,saveImage,text} from './art.mjs';
import {detailGeometry,renderDetail,paintedTexture,textureSpec,modelBounds} from './detail-art.mjs';
import {miniature,trayCubes} from './decor-art.mjs';
import {blockTextureSet} from './rendering.mjs';

export function buildDisplays({root,BP,RP,json,write,icon,item,localize,modelRecords}){
  const copied=new Set(),entities=[];
  const tex=key=>{
    if(!copied.has(key)){
      const prefix=`textures/entity/mcpe_food/${key}`;
      write(RP,`${prefix}.png`,readFileSync(path.join(RP,`textures/blocks/mcpe_food/${key}.png`)));
      write(RP,`${prefix}_mer.png`,readFileSync(path.join(RP,`textures/blocks/mcpe_food/${key}_mer.png`)));
      json(RP,`${prefix}.texture_set.json`,blockTextureSet(key));copied.add(key);
    }
    return `textures/entity/mcpe_food/${key}`;
  };
  const definitions=[];
  for(const d of surfaceVisuals){
    const record=modelRecords.find(r=>r.key===d.key);if(!record)throw new Error(`Missing surface geometry ${d.key}`);
    const original=JSON.parse(readFileSync(path.join(RP,`models/blocks/mcpe_food/${d.key}.geo.json`),'utf8'))['minecraft:geometry'][0];
    const cubes=original.bones.flatMap(b=>b.cubes??[]),bones=['food','ware'].map(name=>({name,pivot:[0,0,0],cubes:cubes.filter(c=>Object.values(c.uv)[0]?.material_instance===name)}));
    const geometry={...original,description:{...original.description,identifier:`geometry.mcpe_food.surface.${d.key}`},bones};
    json(RP,`models/entity/mcpe_food/surface_${d.key}.geo.json`,{format_version:'1.12.0','minecraft:geometry':[geometry]});
    const food=record.slots.food??record.slots.ware,ware=record.slots.ware??food;
    definitions.push({geometry:geometry.description.identifier,food:tex(food),ware:tex(ware)});entities.push({key:`surface_${d.key}`,cubes:cubes.length,resolution:original.description.texture_width});
  }
  const mini=[];
  for(const f of trayFoods){
    const cubes=miniature(f);if(cubes.length>48)throw new Error(`Miniature budget ${f.key}`);
    const geo=detailGeometry(`mini.${f.key}`,cubes);json(RP,`models/entity/mcpe_food/mini_${f.key}.geo.json`,geo);
    mini.push({geometry:`geometry.mcpe_food.mini.${f.key}`,food:tex(`food_${f.key}`)});entities.push({key:`mini_${f.key}`,cubes:cubes.length,resolution:128});
  }
  const posters=[];
  for(const ad of advertisements){
    const master=path.join(root,`assets/posters/masters/${ad.key}.png`);if(!existsSync(master))throw new Error(`Missing poster master: ${master}`);
    const bytes=readFileSync(master),image=decodeRGBA(bytes),prefix=`textures/entity/mcpe_food/${ad.key}`;
    write(RP,`${prefix}.png`,bytes);const mer=new Uint8Array(image.width*image.height*4);for(let i=0;i<mer.length;i+=4)mer.set([0,0,210,255],i);
    write(RP,`${prefix}_mer.png`,png(image.width,image.height,mer));json(RP,`${prefix}.texture_set.json`,blockTextureSet(ad.key));copied.add(ad.key);
    const w=ad.aspect==='wide'?32:16,h=ad.aspect==='portrait'?32:16;
    const faces=Object.fromEntries(['north','south','east','west','up','down'].map(face=>[face,{uv:[0,0],uv_size:[image.width,image.height]}]));
    const geometry={description:{identifier:`geometry.mcpe_food.${ad.key}`,texture_width:image.width,texture_height:image.height,visible_bounds_width:12,visible_bounds_height:14,visible_bounds_offset:[0,3,0]},bones:[{name:'root',pivot:[0,0,0],cubes:[{origin:[-w/2,0,-.06],size:[w,h,.12],uv:faces}]}]};
    json(RP,`models/entity/mcpe_food/${ad.key}.geo.json`,{format_version:'1.12.0','minecraft:geometry':[geometry]});
    posters.push({geometry:geometry.description.identifier,food:prefix});entities.push({key:ad.key,cubes:1,resolution:image.width});
    const thumb=canvas(128,128),scale=Math.min(120/image.width,120/image.height),tw=Math.round(image.width*scale),th=Math.round(image.height*scale);
    for(let y=0;y<th;y++)for(let x=0;x<tw;x++){const at=(Math.floor(y/scale)*image.width+Math.floor(x/scale))*4;thumb.data.set(image.pixels.subarray(at,at+4),((y+Math.floor((128-th)/2))*128+x+Math.floor((128-tw)/2))*4);}
    icon(ad.key,thumb);item(ad.key,`广告画 · ${ad.zh}`,`Advertisement · ${ad.en}`,{'minecraft:max_stack_size':16},'items','mcpe_food:group_advertisements');
  }
  function entity(type,list,{ware=false,poster=false,interactive=false,explicit=false}={}){
    const identifier=id(type),max=list.length-1,geometries={},textures={},arrays={geometries:{'Array.geometry':[]},textures:{'Array.food':[],'Array.ware':[]}};
    list.forEach((d,i)=>{geometries[`g${i}`]=d.geometry;textures[`f${i}`]=d.food;textures[`w${i}`]=d.ware??d.food;arrays.geometries['Array.geometry'].push(`Geometry.g${i}`);arrays.textures['Array.food'].push(`Texture.f${i}`);arrays.textures['Array.ware'].push(`Texture.w${i}`);});
    const renderNames=[];
    for(const slot of ware?['food','ware']:['food']){
      const name=`controller.render.mcpe_food.${type}_${slot}`;renderNames.push(name);
      json(RP,`render_controllers/mcpe_food/${type}_${slot}.json`,{format_version:'1.8.0',render_controllers:{[name]:{arrays,geometry:"Array.geometry[q.property('mcpe_food:index')]",materials:[{'*':'Material.default'}],textures:[`Array.${slot}[q.property('mcpe_food:index')]`],...(ware?{part_visibility:[{food:slot==='food'},{ware:slot==='ware'}]}:{})}}});
    }
    json(RP,`entity/mcpe_food/${type}.entity.json`,{format_version:'1.10.0','minecraft:client_entity':{description:{identifier,materials:{default:'entity_alphatest'},textures,geometry:geometries,render_controllers:renderNames,...(poster?{animations:{size:'animation.mcpe_food.poster_size'},scripts:{animate:['size']}}:explicit?{animations:{display_facing:'animation.mcpe_food.display_facing'},scripts:{animate:[{display_facing:"q.property('mcpe_food:display_facing') > 0"}]}}:{})}}});
    const shapes={},events={};
    const specs=[['flat',.95,.12],['medium',.65,.6],['tall',.65,.9],...(interactive?[...electronics,...restaurantAccessories,...lifestyleItems,...scenarioProps,...patch071Props,...patch072Props,...patch073Props,...patch074Props,...patch080Props,...patch082Props,...patch085Props].map(d=>{const b=modelBounds('model' in d?electronicCubes(d):patch085Props.includes(d)?patch085Cubes(d.key):patch082Props.includes(d)?patch082Cubes(d.key):patch080Props.includes(d)?patch080Cubes(d.key):patch074Props.includes(d)?patch074Cubes(d.key):patch073Props.includes(d)?patch073Cubes(d.key):patch072Props.includes(d)?patch072Cubes(d.key):patch071Props.includes(d)?patch071Cubes(d.key):scenarioProps.includes(d)?scenarioCubes(d.key):lifestyleItems.includes(d)?lifestyleCubes(d.key):serviceCubes(d.key));const width=Math.max(...[b.low[0],b.low[2],b.high[0],b.high[2]].map(Math.abs))/8+.015;return[d.key,d.key==='icu_bed'?1:width,b.high[1]/16+.01];}):[])];
    for(const[name,width,height]of specs){shapes[`mcpe_food:${name}`]={'minecraft:collision_box':{width,height}};events[`mcpe_food:shape_${name}`]={remove:{component_groups:specs.map(([n])=>`mcpe_food:${n}`)},add:{component_groups:[`mcpe_food:${name}`]}};}
    json(BP,`entities/${type}.json`,{format_version:'1.21.0','minecraft:entity':{description:{identifier,is_spawnable:false,is_summonable:true,is_experimental:false,properties:{'mcpe_food:index':{type:'int',range:[0,max],default:0,client_sync:true},...(explicit?{'mcpe_food:display_facing':{type:'int',range:[0,4],default:0,client_sync:true}}:{}),...(poster?{'mcpe_food:size':{type:'int',range:[0,2],default:0,client_sync:true}}:{})}},component_groups:shapes,components:{'minecraft:type_family':{family:['mcpe_food_display']},'minecraft:physics':{has_gravity:false,has_collision:false},'minecraft:pushable':{is_pushable:false,is_pushable_by_piston:false},'minecraft:persistent':{},'minecraft:collision_box':{width:interactive?.65:0,height:interactive?.7:0},'minecraft:health':{value:1,max:1},'minecraft:damage_sensor':{triggers:[{cause:'all',deals_damage:false}]},'minecraft:knockback_resistance':{value:1}},events}});
  }
  const digital=digitalDisplays({root,BP,RP,json,write,icon,item});for(const key of digital.copied)copied.add(key);entities.push(...digital.entities);entity('digital_ad_display',digital.definitions,{ware:true,interactive:true,explicit:true});
  entity('surface_display',definitions,{ware:true,interactive:true,explicit:true});entity('tray_food_display',mini);entity('advert_display',posters,{poster:true});

  const garments=[];
  for(const v of clothingVisuals){
    const cs=clothingCubes(v,v.pose,v.slot),g=clothingGeometry(v),original=g['minecraft:geometry'][0];
    json(RP,`models/entity/mcpe_food/garment_${v.visualKey}.geo.json`,g);
    garments.push({geometry:original.description.identifier,food:tex('patch072_'+v.key),ware:tex('patch072_'+v.key)});entities.push({key:'garment_'+v.visualKey,cubes:cs.length,resolution:128});
  }
  for(const rack of rackSpecs){
    const worst=Math.max(...clothingItems.filter(d=>rack.allowHat||d.style!=='hat').map(d=>clothingCubes(d,rack.pose,0).length));
    if(patch072Cubes(rack.key).length+worst*rack.capacity>256)throw Error('Combined clothing rack budget '+rack.key);
  }
  entity('clothing_display',garments,{ware:true,explicit:true});
  const turn="(q.property('mcpe_food:display_facing') == 1 ? 180 : q.property('mcpe_food:display_facing') == 2 ? -90 : q.property('mcpe_food:display_facing') == 3 ? 0 : 90) - q.body_y_rotation";
  json(RP,'animations/mcpe_food/display_facing.animation.json',{format_version:'1.8.0',animations:{'animation.mcpe_food.display_facing':{loop:true,bones:{food:{rotation:[0,turn,0]},ware:{rotation:[0,turn,0]}}}}});

  json(RP,'animations/mcpe_food/poster_size.animation.json',{format_version:'1.8.0',animations:{'animation.mcpe_food.poster_size':{loop:true,bones:{root:{scale:"q.property('mcpe_food:size') + 1"}}}}});
  localize('mcpe_food:group_tableware','餐具','Tableware');localize('mcpe_food:group_advertisements','广告画','Advertisements');
  const trayTexture=paintedTexture(textureSpec('triple_tray','ware',['#292d32','#c7a15b','#eeeece']));
  const preview=canvas(1000,320,[25,36,35,255]),trayModels=trayCubes(),maps={ware:trayTexture};
  blit(preview,renderDetail(trayModels,maps,300,270),5,20);
  const sample=trayFoods.filter(f=>['steak','sushi_platter','egg_tart'].includes(f.key));
  const full=trayModels.map(c=>({...c})),fullMaps={...maps};sample.forEach((f,i)=>{const material=`food${i}`;fullMaps[material]=paintedTexture(textureSpec(f.key,'food',f.colors));for(const c of miniature(f))full.push({...c,origin:[c.origin[0]+(i-1)*4.6,c.origin[1],c.origin[2]],material});});
  blit(preview,renderDetail(full,fullMaps,650,280),340,10);saveImage(path.join(root,'previews/triple_tray.png'),preview);
  const wall=canvas(1440,560,[25,36,35,255]);text(wall,'ACTUAL POSTER UV / WALL DISPLAY - OFFLINE PREVIEW',20,16,2,[233,212,166,255]);
  ['ad_wellington','ad_lamb','ad_lobster'].forEach((key,i)=>{const g=JSON.parse(readFileSync(path.join(RP,`models/entity/mcpe_food/${key}.geo.json`),'utf8'))['minecraft:geometry'][0],im=decodeRGBA(readFileSync(path.join(RP,`textures/entity/mcpe_food/${key}.png`)));blit(wall,renderDetail(g.bones[0].cubes,{food:im},450,450,{front:true}),i*480+15,55);text(wall,key.replace('ad_','').toUpperCase(),i*480+25,520,2);});saveImage(path.join(root,'previews/poster_wall.png'),wall);
  json(root,'display-report.json',{advertisements:advertisements.length,advertisementSizes:advertisements.length*3,surfaceDefinitions:surfaceVisuals.length,trayFoods:trayFoods.length,trayCubes:trayModels.length,maxMiniCubes:Math.max(...mini.map(m=>entities.find(e=>e.key==='mini_'+trayFoods[mini.indexOf(m)].key).cubes)),fullTrayCubeBudget:trayModels.length+48*3,entities,entityTypes:5,entityTextureSets:copied.size});
  return {entityModels:entities,entityTextureSets:copied.size};
}
