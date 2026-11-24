import {readFileSync} from 'node:fs';
import {gymAd,linuxComputerKey,mriKey,patch097Foods} from '../.build/patch-097-catalog.js';
import {servingKey} from '../.build/catalog.js';
import {renderDetail} from './detail-art.mjs';
import {canvas,blit,rect,text,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';

const rp='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(rp+p,'utf8'));
const {buildLabel}=JSON.parse(readFileSync('package.json','utf8'));
function load(key,type='surface_display'){
 const description=read('entity/mcpe_food/'+type+'.entity.json')['minecraft:client_entity'].description;
 const name=(type==='surface_display'?'surface_':'')+key;
 const geometry=read('models/entity/mcpe_food/'+name+'.geo.json')['minecraft:geometry'][0];
 const alias=Object.keys(description.geometry).find(k=>description.geometry[k]===geometry.description.identifier).slice(1);
 const texture=slot=>decodeRGBA(readFileSync(rp+description.textures[slot+alias]+'.png'));
 return {
  mesh:geometry.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name,faces:Object.keys(c.uv)}))),
  maps:{ware:texture('w'),food:texture('f')},
 };
}
function sheet(filename,title,rows,views){
 const w=334,h=263,sheet=canvas(w*views.length,h*rows.length+53,[21,34,45,255]);
 text(sheet,title,16,12,2);
 for(const [row,{key,name=key,type,front=true}] of rows.entries()){
  const {mesh,maps}=load(key,type);
  for(const [col,view] of views.entries()){
   const x=col*w,y=row*h+53;
   rect(sheet,x+3,y+2,w-6,h-5,[45,63,72,255]);
   blit(sheet,renderDetail(mesh,maps,w-18,h-34,{front,...view.options(front)}),x+9,y+8);
   text(sheet,name.toUpperCase()+' / '+view.label,x+11,y+h-16,1);
  }
 }
 saveImage('previews/'+filename+'.png',sheet);
}
const front={label:'FRONT',options:()=>({})};
const rear={label:'REAR',options:front=>({front:!front})};
const side={label:'SIDE',options:()=>({projection:'side'})};
sheet('patch_097_devices','0.9.7 / DEVICES',[
 {key:mriKey,name:'MRI / OPEN BORE'},{key:linuxComputerKey,name:'LINUX COMPUTER'},
 {key:gymAd.key,type:'digital_ad_display',name:'FITNESS SCREEN'},
],[front,side,rear]);
sheet(buildLabel==='0.9.7r1'?'patch_097r1_repairs':'patch_097_repairs',(buildLabel??'0.9.7')+' / MODEL REPAIRS',[
 {key:'macbook_air_m5_open',name:'MACBOOK AIR',front:false},
 {key:'legion_laptop_open',name:'LEGION',front:false},
 {key:'police_service_terminal',name:'POLICE SERVICES'},
 {key:'government_service_kiosk',name:'CIVIC SERVICES'},
],[front,side,rear]);
sheet('patch_097_food','0.9.7 / CHINESE DISHES',patch097Foods.map(d=>({key:servingKey(d,d.vessel),name:d.en})),[front,rear]);
const poster=load(gymAd.key,'digital_ad_display').maps.food;
saveImage('previews/patch_097_fitness_poster.png',{...poster,data:poster.pixels});
