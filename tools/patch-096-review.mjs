import {readFileSync} from 'node:fs';
import {refreshed096Keys} from '../.build/patch-096-catalog.js';
import {servingKey,foodById} from '../.build/catalog.js';
import {fitPastry,pastryScales} from '../.build/pastry-display-layout.js';
import {renderDetail} from './detail-art.mjs';
import {canvas,rect,text,blit,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';

const rp='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(rp+p,'utf8'));
const c=read('entity/mcpe_food/surface_display.entity.json')['minecraft:client_entity'].description;
const load=(key,materialPrefix='')=>{
 const g=read('models/entity/mcpe_food/surface_'+key+'.geo.json')['minecraft:geometry'][0];
 const alias=Object.keys(c.geometry).find(k=>c.geometry[k]===g.description.identifier).slice(1);
 const map=name=>decodeRGBA(readFileSync(rp+c.textures[name+alias]+'.png'));
 const meshes=g.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:materialPrefix+b.name,faces:Object.keys(c.uv)})));
 return {meshes,textures:{[materialPrefix+'ware']:map('w'),[materialPrefix+'food']:map('f')}};
};
const sets=[['electronics',4],['transit',2],['cafe',4],['civic',4]];
const keys=[...refreshed096Keys];
for(const [set,num] of sets){
 const sheet=canvas(1120,56+num*229,[25,35,43,255]);
 text(sheet,'0.9.6 '+set.toUpperCase()+' / FINAL RESOURCE PREVIEW',17,15,2);
 ['FRONT','REAR','LEFT','RIGHT'].forEach((v,i)=>text(sheet,v,i*280+10,43,1));
 for(const [row,key] of keys.splice(0,num).entries()){
  const {meshes,textures}=load(key);
  const front=!key.includes('m5')&&!key.includes('legion');
  for(const [i,view] of [{front},{front:!front},{front,projection:'side'},{front:!front,projection:'side'}].entries()){
   const y=56+row*229;rect(sheet,i*280+3,y,274,225,[41,55,65,255]);
   blit(sheet,renderDetail(meshes,textures,266,203,{...view,alphaBlend:true}),i*280+7,y+3);
  }
  text(sheet,key.toUpperCase(),13,56+row*229+211,1);
 }
 saveImage('previews/patch_096_'+set+'.png',sheet);
}
const sampleKeys=['egg_tart','cookies','tiramisu','creme_brulee','chocolate_cake','fruit_platter'];
const foods=sampleKeys.map(k=>foodById.get('mcpe_food:'+k)).filter(Boolean);
if(foods.length!==6)throw new Error('Full pastry preview needs six existing foods');
const cabinet=load('cafe_pastry_case');
const full=canvas(900,405,[30,43,52,255]);
for(const [view,legacy] of [true,false].entries()){
 const meshes=[...cabinet.meshes],textures={...cabinet.textures};
 for(const [i,f] of foods.entries()){
  const local=load(servingKey(f,f.vessel),'slot'+i);
  Object.assign(textures,local.textures);
  const fit=fitPastry('mcpe_food:'+f.key,Math.floor(i/3));
  const s=legacy?.2:pastryScales[fit.level],y=(legacy?(i<3?2.13:16):fit.y*16);
  meshes.push(...local.meshes.map(c=>({...c,origin:[c.origin[0]*s+(i%3-1)*16,c.origin[1]*s+y,c.origin[2]*s],size:c.size.map(v=>v*s),...(c.pivot?{pivot:[c.pivot[0]*s+(i%3-1)*16,c.pivot[1]*s+y,c.pivot[2]*s]}:{})})));
 }
 text(full,legacy?'0.20X FIXED':'FIT PER FOOD',view*450+16,13,2);
 blit(full,renderDetail(meshes,textures,435,357,{front:true,alphaBlend:true}),view*450+7,36);
}
saveImage('previews/patch_096_pastry_full.png',full);
