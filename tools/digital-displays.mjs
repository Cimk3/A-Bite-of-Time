import {patch095Walls} from '../.build/patch-095-catalog.js';
import {gymAd} from '../.build/patch-097-catalog.js';
import {gymPoster} from './patch-097-art.mjs';
import {lunarSignalPoster} from './patch-095-art.mjs';
import {patch090Walls} from '../.build/patch-090-catalog.js';
import {patch090WallImage} from './patch-090-art.mjs';
import {haoduScreen} from '../.build/patch-082-catalog.js';
import {haoduAdImage} from './haodu-ad-art.mjs';
import {informationImage} from './patch-072-art.mjs';
import {wallFacingCubes} from './wall-geometry.mjs';
import {digitalScreens,legacyDigitalScreens,wallScreens} from '../.build/scenario-catalog.js';
import {patch074DigitalScreens} from '../.build/patch-074-catalog.js';
import {largeAdImage} from './large-ad-art.mjs';
import {canvas,png,blit,rect,text,saveImage} from './art.mjs';
import {brandImage} from './brand-art.mjs';
import {blockTextureSet} from './rendering.mjs';
export function digitalDisplays({root,BP,RP,json,write,icon,item}){
 const definitions=[],entities=[],copied=new Set(),gallery=canvas(1050,960,[25,36,35,255]),largeGallery=canvas(830,380,[25,36,35,255]);
 const texture=(key,image,emission=0)=>{
  if(!copied.has(key)){
   const p=`textures/entity/mcpe_food/${key}`,mer=canvas(image.width,image.height,[0,emission,emission?65:155,255]);
   write(RP,p+'.png',png(image.width,image.height,image.data));write(RP,p+'_mer.png',png(image.width,image.height,mer.data));json(RP,p+'.texture_set.json',blockTextureSet(key));
   write(root,`assets/digital-screens/${key}.png`,png(image.width,image.height,image.data));write(root,`assets/digital-screens/${key}_mer.png`,png(image.width,image.height,mer.data));copied.add(key);
  }return `textures/entity/mcpe_food/${key}`;
 };
 const frame=texture('digital_frame',canvas(128,128,[29,35,43,255]));
 for(const[i,d]of wallScreens.entries()){
  const legacy=legacyDigitalScreens.includes(d),large=patch074DigitalScreens.includes(d),hotel=d===haoduScreen,lightbox=patch095Walls.includes(d),gym=d===gymAd,fresh=patch090Walls.includes(d)||lightbox||gym,advertisement=legacy||large||hotel||(fresh&&d.key.startsWith('ad_'));
  const im=gym?gymPoster():lightbox?lunarSignalPoster():fresh?patch090WallImage(d):hotel?haoduAdImage():large?largeAdImage(d.brand):legacy?brandImage(d.brand,256,d.width===d.height?256:192):informationImage(d.key);
  const suffix=fresh?(d.width+'x'+d.height).replaceAll('.','_'):hotel?'7x5':large?'6x5':d.width===d.height?'square':d.height===1?'info':'wide';
  const screen=texture(`digital_content_${d.brand}_${suffix}`,im,12),w=d.width*16,h=d.height*16;
  const face=(material,uv_size)=>({uv:[0,0],uv_size,material_instance:material});
  const cube=(origin,size,material='ware')=>({origin,size,uv:Object.fromEntries(['north','south','east','west','up','down'].map(f=>[f,face(material,[1,1])]))});
  const lightboxFrame=(origin,size,tile=0)=>{
   const c=cube(origin,size);
   for(const f of Object.values(c.uv)){f.uv=[tile*16,0];f.uv_size=[16,16];}
   return c;
  };
  const frameCubes=lightbox?[
   lightboxFrame([-16,0,.6],[32,48,2.1]),lightboxFrame([-16,0,2.7],[1,48,1.3],1),lightboxFrame([15,0,2.7],[1,48,1.3],1),
   lightboxFrame([-15,0,2.7],[30,1,1.3],1),lightboxFrame([-15,47,2.7],[30,1,1.3],1),
   lightboxFrame([-8,5,.16],[16,2,.44],1),lightboxFrame([-8,40,.16],[16,2,.44],1),
   ...[-6.8,6.1].flatMap(x=>[5.6,40.6].map(y=>lightboxFrame([x,y,0],[.7,.7,.16],2))),
  ]:[cube([-w/2,0,0],[w,h,.8]),cube([-w/2,0,.8],[.65,h,.6]),cube([w/2-.65,0,.8],[.65,h,.6]),cube([-w/2+.65,0,.8],[w-1.3,.65,.6]),cube([-w/2+.65,h-.65,.8],[w-1.3,.65,.6])];
  if(gym){
   for(const y of [4,26]){
    frameCubes.push(cube([-26,y,-.5],[52,1.5,.5]));
    for(const x of [-24,22.3])frameCubes.push(cube([x,y+.14,-.75],[1.7,1.2,.25]));
   }
  }
  const food=lightbox?[{origin:[-15,1,2.7],size:[30,46,.65],uv:{south:face('food',[128,128])}}]:[{origin:[-w/2+.65,.65,.86],size:[w-1.3,h-1.3,.06],uv:{south:face('food',[im.width,im.height])}}];
  const identifier=`geometry.mcpe_food.${advertisement?'':'info.'}${d.key}`;
  json(RP,`models/entity/mcpe_food/${d.key}.geo.json`,{format_version:'1.12.0','minecraft:geometry':[{description:{identifier,texture_width:im.width,texture_height:im.height,visible_bounds_width:fresh?Math.max(2,d.width+1):8,visible_bounds_height:fresh?Math.max(2,d.height+1):8,visible_bounds_offset:[0,fresh?d.height/2:2,0]},bones:[{name:'ware',pivot:[0,0,0],cubes:wallFacingCubes(frameCubes)},{name:'food',pivot:[0,0,0],cubes:wallFacingCubes([...frameCubes,...food]).slice(frameCubes.length)}]}]});
  let casing=frame;
  if(lightbox){
   const map=canvas(128,128,[37,42,52,255]);
   for(const [i,shade] of [42,70,131].entries())for(let y=0;y<16;y++)for(let x=0;x<16;x++){
    const v=shade+(x*5+y*7)%11-5;
    rect(map,i*16+x,y,1,1,[v,v+4,v+9,255]);
   }
   casing=texture('cinema_lightbox_frame',map);
  }
  definitions.push({geometry:identifier,food:screen,ware:casing});entities.push({key:d.key,cubes:frameCubes.length+food.length,resolution:im.width});
  const thumb=canvas(128,128,[29,35,43,0]),hh=lightbox?116:fresh||large||hotel?Math.round(116*im.height/im.width):d.width===d.height?116:87;
  const ww=lightbox?77:116;
  for(let y=0;y<hh;y++)for(let x=0;x<ww;x++){const at=(Math.floor(y*im.height/hh)*im.width+Math.floor(x*im.width/ww))*4;thumb.data.set(im.data.subarray(at,at+4),((y+Math.floor((128-hh)/2))*128+x+Math.floor((128-ww)/2))*4);}
  icon(d.key,thumb);item(d.key,d.zh,d.en,{},'items',advertisement?'mcpe_food:group_advertisements':`mcpe_food:group_${d.group}`);if(legacy){blit(gallery,im,i%3*350+45,Math.floor(i/3)*310+35);text(gallery,`${d.brand} ${d.width}X${d.height}`,i%3*350+20,Math.floor(i/3)*310+295,1);}
  if(hotel)saveImage('previews/patch_082_haodu_screen.png',im);
  if(large){const j=patch074DigitalScreens.indexOf(d);blit(largeGallery,im,j*405+12,12);text(largeGallery,`${d.brand.toUpperCase()} 6 X 5`,j*405+12,345,2);}
 }
 saveImage('previews/patch_074_large_screens.png',largeGallery);
 json(root,'assets/digital-screens/patch-074-design.json',{source:'tools/large-ad-art.mjs',resolution:[384,320],brands:['FT Computer','Apple'],original:true,notes:'Independent 6:5 pixel compositions, no copied advertisement or photo.'});
 saveImage('previews/digital_ad_screens.png',gallery);return {definitions,entities,copied};
}
