import {readFileSync} from 'node:fs';
import {whole090Keys} from '../.build/patch-093-render.js';
import {canvas,text,blit,saveImage} from './art.mjs';
import {renderDetail} from './detail-art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
const im=canvas(900,620,[25,36,35,255]);text(im,'0.9.3 / THREE REPORTED OBJECTS / NOT GAME SCREENSHOTS',15,12,1);
for(const [i,key] of [...whole090Keys].entries()){
 const g=JSON.parse(readFileSync('packs/FoodAndTable_RP/models/entity/mcpe_food/surface_'+key+'.geo.json'))['minecraft:geometry'][0];
 const cs=g.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:'ware',faces:Object.keys(c.uv)})));
 const tex=decodeRGBA(readFileSync('packs/FoodAndTable_RP/textures/entity/mcpe_food/patch090_'+key+'.png'));
 for(const [row,front] of [true,false].entries())blit(im,renderDetail(cs,{ware:tex},290,255,{front}),i*300+5,35+row*285);
 text(im,key.toUpperCase(),i*300+8,295,1);
}saveImage('previews/patch_093_repairs.png',im);
