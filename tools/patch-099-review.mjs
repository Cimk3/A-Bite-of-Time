import {readFileSync} from 'node:fs';
import {postOfficeProps} from '../.build/patch-099-catalog.js';
import {canvas,blit,rect,text,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {renderDetail} from './detail-art.mjs';

const rp='packs/FoodAndTable_RP/';
const views=[['FRONT',{front:true}],['SIDE',{projection:'side'}],['REAR',{front:false}]];
for(const [title,items] of [
 ['fixtures',postOfficeProps.filter(d=>d.kind==='solid')],
 ['countertop',postOfficeProps.filter(d=>d.kind==='surface')],
]){
 const width=318,height=232,sheet=canvas(width*views.length,48+items.length*height,[25,40,37,255]);
 text(sheet,'0.9.9 COMMUNITY POST OFFICE / '+title.toUpperCase(),15,12,2);
 for(const [col,[label]] of views.entries())text(sheet,label,col*width+12,38,1);
 for(const [row,item] of items.entries()){
  const y=48+row*height,key=item.key;
  const model=JSON.parse(readFileSync(rp+'models/entity/mcpe_food/surface_'+key+'.geo.json','utf8'))['minecraft:geometry'][0];
  const mesh=model.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name,faces:Object.keys(c.uv)})));
  const ware=decodeRGBA(readFileSync(rp+'textures/entity/mcpe_food/patch099_'+key+'.png'));
  for(const [col,[,view]] of views.entries()){
   const x=col*width;
   rect(sheet,x+3,y+3,width-6,height-6,[65,80,70,255]);
   blit(sheet,renderDetail(mesh,{ware},width-20,height-31,view),x+10,y+8);
  }
  text(sheet,item.en.toUpperCase(),12,y+height-12,1);
 }
 saveImage('previews/patch_099_post_'+title+'.png',sheet);
}
