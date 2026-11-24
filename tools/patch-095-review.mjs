import {readFileSync} from 'node:fs';
import {patch095Items} from '../.build/patch-095-catalog.js';
import {canvas,rect,text,blit,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {renderDetail} from './detail-art.mjs';

const rp='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(rp+p,'utf8'));
const texture=name=>decodeRGBA(readFileSync(rp+name+'.png'));
const groupSheets={cinema:[],music_studio:[],gym:[]};
for(const item of patch095Items){
  const wall=item.kind==='wall',key=item.key;
  const path='models/entity/mcpe_food/'+(wall?'':'surface_')+key+'.geo.json';
  const g=read(path)['minecraft:geometry'][0];
  const cubes=g.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name,faces:Object.keys(c.uv)})));
  const textures=wall?{ware:texture('textures/entity/mcpe_food/cinema_lightbox_frame'),food:texture('textures/entity/mcpe_food/digital_content_cinema_poster_lightbox_2x3')}:
    {ware:texture('textures/entity/mcpe_food/patch095_'+key)};
  if(!wall)textures.food=textures.ware;
  groupSheets[item.group].push({item,cubes,textures});
}
const views=[{front:true},{front:false},{front:true,projection:'side'},{front:false,projection:'side'}];
for(const [group,rows] of Object.entries(groupSheets)){
  const sheet=canvas(1120,68+rows.length*237,[24,33,41,255]);
  text(sheet,'0.9.5 '+group.replaceAll('_',' ').toUpperCase()+' / PACK RESOURCE PREVIEW',18,14,2);
  ['FRONT','REAR','LEFT','RIGHT'].forEach((t,i)=>text(sheet,t,16+i*280,47,1));
  for(const [row,{item,cubes,textures}] of rows.entries()){
    const y=68+row*237;
    for(const [i,view] of views.entries()){
      rect(sheet,i*280+3,y,274,233,[38,50,59,255]);
      blit(sheet,renderDetail(cubes,textures,266,203,{...view,alphaBlend:true}),i*280+7,y+4);
    }
    text(sheet,item.en.toUpperCase()+' / '+item.size.join('X'),15,y+215,1);
  }
  saveImage('previews/patch_095_'+group+'.png',sheet);
}
