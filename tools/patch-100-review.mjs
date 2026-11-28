import {readFileSync} from 'node:fs';
import {districtGroups,districtProps} from '../.build/patch-100-catalog.js';
import {canvas,blit,rect,text,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {renderDetail} from './detail-art.mjs';

const resource='packs/FoodAndTable_RP/';
const views=[['FRONT',{front:true}],['SIDE',{projection:'side'}],['REAR',{front:false}]];
for(const [group,,name] of districtGroups){
 const items=districtProps.filter(d=>d.group===group);
 const w=290,h=188,sheet=canvas(w*views.length,48+items.length*h,[35,40,46,255]);
 text(sheet,'FANGCUN DISTRICT / '+name.toUpperCase(),12,12,2);
 for(const [i,[label]] of views.entries())text(sheet,label,i*w+12,37,1);
 for(const [row,item] of items.entries()){
  const y=48+row*h,key=item.key;
  const geometry=JSON.parse(readFileSync(resource+'models/entity/mcpe_food/surface_'+key+'.geo.json','utf8'))['minecraft:geometry'][0];
  const mesh=geometry.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name,faces:Object.keys(c.uv)})));
  const atlas=decodeRGBA(readFileSync(resource+'textures/entity/mcpe_food/patch100_'+key+'.png'));
  for(const [col,[,view]] of views.entries()){
   const x=col*w;
   rect(sheet,x+2,y+2,w-4,h-4,[76,83,93,255]);
   blit(sheet,renderDetail(mesh,{ware:atlas,food:atlas},w-16,h-26,{...view,alphaBlend:true}),x+8,y+6);
  }
  text(sheet,item.en.toUpperCase(),12,y+h-12,1);
 }
 saveImage('previews/patch_100_'+group+'.png',sheet);
}
