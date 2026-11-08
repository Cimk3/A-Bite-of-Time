/** Read the actual generated entity meshes and color PNGs for the repair sheet. */
import {readFileSync} from 'node:fs';
import {canvas,rect,text,blit,saveImage} from './art.mjs';
import {renderDetail} from './detail-art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
const keys=['macbook_air_m5_open','legion_laptop_open','finance_monitor','police_monitoring_computer'];
const sheet=canvas(960,1620,[25,36,35,255]);
text(sheet,'0.9.1 COMPUTERS / FRONT AND REAR',16,14,2);
text(sheet,'ACTUAL ENTITY GEOMETRY / COLOR TEXTURES - NOT A GAME SCREENSHOT',16,42,1);
for(const [row,key] of keys.entries()){
 const geometry=JSON.parse(readFileSync('packs/FoodAndTable_RP/models/entity/mcpe_food/surface_'+key+'.geo.json'))['minecraft:geometry'][0];
 const cubes=geometry.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name,faces:Object.keys(c.uv??{})})));
 const im=decodeRGBA(readFileSync('packs/FoodAndTable_RP/textures/entity/mcpe_food/patch090_'+key+'.png'));
 for(let side=0;side<2;side++){
  const x=side*480,y=60+row*390;rect(sheet,x+4,y+4,472,382,[36,48,45,255]);
  blit(sheet,renderDetail(cubes,{ware:im},460,334,{front:side===1}),x+10,y+8);
  text(sheet,key.toUpperCase(),x+12,y+350,1);text(sheet,side?'REAR':'FRONT',x+12,y+368,1);
 }
}
saveImage('previews/patch_091_computers.png',sheet);
