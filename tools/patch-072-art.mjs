import {patch096Cubes,patch096Texture} from './patch-096-art.mjs';
import {readFileSync} from 'node:fs';
const labels=JSON.parse(readFileSync(new URL('../assets/patch-072/labels.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const chinese=(im,label,x,y,color)=>labels[label].forEach((row,dy)=>{for(let dx=0;dx<row.length;dx++)if(row[dx]==='1')rect(im,x+dx,y+dy,1,1,color);});
/** Original static retail, transit and fictional FT government assets. Local front -Z. */
import {canvas,rect,text,png} from './art.mjs';
import {pruneFaces,detailGeometry} from './detail-art.mjs';
import {clothingItems,patch072Screens} from '../.build/patch-072-catalog.js';
const flip=cubes=>cubes.map(c=>({...c,origin:[-c.origin[0]-c.size[0],c.origin[1],-c.origin[2]-c.size[2]],faces:c.faces?.map(f=>({north:'south',south:'north',east:'west',west:'east',up:'up',down:'down'}[f])),uv:c.uv&&Object.fromEntries(Object.entries(c.uv).map(([f,v])=>[{north:'south',south:'north',east:'west',west:'east',up:'up',down:'down'}[f],v]))}));
export {flip as northFacingCubes};
function maker(){const cubes=[];const put=(x,y,z,w,h,d,color=0)=>{const c={origin:[x,y,z],size:[w,h,d],material:'ware',color};cubes.push(c);return c;};return{cubes,put};}
function finish(cubes){for(const c of cubes)for(const f of ['north','south','east','west','up','down']){c.uv??={};c.uv[f]??={uv:[98,60+(c.color??0)*8],uv_size:[28,6],material_instance:'ware'};}const out=pruneFaces(cubes);if(out.length>256)throw Error('0.7.2 cube budget');return flip(out);}
export function patch072Cubes(key){
 if(key==='transit_ticket_gate'||key==='ticket_vending_machine')return patch096Cubes(key);
 const{cubes:a,put}=maker(),screen=(x,y,z,w,h)=>{const c=put(x,y,z,w,h,.05,1);c.uv={south:{uv:[0,0],uv_size:[96,56],material_instance:'ware'}};};
 const feet=()=>{for(const x of [-5.6,5.1]){put(x,0,-4.5,.5,1,9,2);put(x,1,-.3,.5,28,.6,2);}};
 const keys=(x,y,z,w=9)=>{put(x,y,z,w,.35,3,1);for(let row=0;row<3;row++)for(let k=0;k<10;k++)put(x+.25+k*(w-.5)/10,y+.36,z+.25+row*.8,(w-.9)/10,.08,.55,4);};
 if(key==='single_clothing_rail'){feet();put(-5.6,28,-.3,11.2,.6,.6,2);put(-5.6,1,-.3,11.2,.45,.6,2);for(const x of [-3.5,3.5]){put(x-.12,26,-.12,.24,2,.24,3);put(x-2.8,25.7,-.2,5.6,.2,.4,3);}}
 else if(key==='double_clothing_shelf'){for(const x of [-6.8,6.2])for(const z of [-4,3.4])put(x,0,z,.6,27,.6,2);for(const y of [1,13,26])put(-7,y,-4.3,14,.65,8.6,3);put(-6.7,2,-4.3,13.4,24,.35,0);}
 else if(key==='mannequin_display'){put(-4.5,0,-3.5,9,.65,7,2);put(-.3,.65,-.3,.6,4,.6,2);for(const x of [-2.1,.4])put(x,4,-.85,1.7,12,1.7,5);put(-3.3,16,-1.2,6.6,8.5,2.4,5);for(const x of [-4.8,3.3])put(x,16,-.8,1.5,8,1.6,5);put(-.65,24.5,-.65,1.3,1.5,1.3,5);put(-1.6,26,-1.3,3.2,4,2.6,5);}
 else if(key==='full_length_mirror'){put(-5.8,0,-4,11.6,.65,8,2);put(-5.4,.65,-.5,10.8,30,.9,3);put(-4.9,1.2,.42,9.8,28.8,.06,6);for(let i=0;i<6;i++)put(-4.6+i*1.5,3+i*3,.49,.18,10,.01,7);put(-.25,.65,-3.5,.5,20,.5,2);}
 else if(key==='transit_ticket_gate'){for(const x of [-7,3]){put(x,0,-6,4,12,12,2);put(x+.3,12,-5.6,3.4,.5,11.2,0);screen(x+.4,9.5,6.01,3.2,1.8);put(x+.8,12.55,-3,2.4,.08,3,1);}put(-3,5,-.2,6,4,.4,6);put(-3,9,-.2,6,.25,.4,7);}
 else if(key==='ticket_vending_machine'){put(-6.5,0,-4.5,13,29,9,0);put(-6.2,29,-4.3,12.4,1,8.6,2);screen(-5.4,13,4.56,10.8,12);put(-4.8,6,4.56,9.6,3,.25,1);put(-4.3,6.6,4.82,8.6,1.2,.06,4);put(3.3,10,4.56,1.8,1.4,.3,2);for(let i=0;i<3;i++)put(3.6+i*.4,10.4,4.87,.2,.4,.02,1);put(-5,26,4.56,10,1,.06,3);}
 else if(key.startsWith('ft_government_')){
  if(key.endsWith('ultrabook_open')){put(-6.7,0,-4.8,13.4,.5,9.6,0);keys(-5,.51,-.2,10);put(-2,.51,3.2,4,.03,1.2,4);put(-6.7,.5,-4.8,13.4,9,.55,0);screen(-6.2,1,-4.18,12.4,7.7);put(-.15,8.88,-4.17,.3,.15,.03,1);}
  else{const aio=key.endsWith('all_in_one');put(-4,.05,-2.8,7,.4,4,2);put(-.9,.45,-2,.8,3.4,.7,2);put(-6.6,3.4,-2.8,aio?13.2:9.6,7.8,.65,0);screen(-6.2,3.8,-2.08,aio?12.4:8.8,6.8);keys(-6,.05,2.4,9);put(4,.05,3.1,1.2,.5,1.8,0);if(!aio){put(4,.05,-5,3.3,10,5,0);for(let i=0;i<6;i++)put(4.35,1+i*.7,.06,2.6,.18,.03,2);put(5.2,8,.06,1,.3,.05,3);}}
 }
 else if(key==='upright_archive_cabinet'){put(-6,0,-4.5,12,30,9,2);for(let i=0;i<4;i++){put(-5.6,.7+i*7.2,4.51,11.2,6.6,.12,0);put(-1.8,3.6+i*7.2,4.68,3.6,.35,.45,2);put(-1.3,4.7+i*7.2,4.65,2.6,.7,.03,7);}put(-5.8,30,-4.3,11.6,.3,8.6,2);}
 else if(['platform_information_screen','government_queue_screen'].includes(key)){put(-8,0,0,16,8,.8,0);screen(-7.5,.5,.81,15,7);}
 else throw Error('Unknown 0.7.2 prop '+key);
 return finish(a);
}
export function clothingCubes(d,pose='mannequin',slot=0){
 const{cubes:a,put}=maker(),s=d.style;
 if(pose==='folded'){
  if(s==='hat'){put(-1.8,0,-1.6,3.6,.3,3.2,0);put(-1.2,.3,-1,2.4,1.5,2,0);put(-1.2,.7,1.01,2.4,.25,.03,2);}
  else{const h=s==='suit'?2.4:1.2;put(-2.1,0,-1.6,4.2,h,3.2,0);put(-1.8,h,.1,3.6,.1,1.3,1);for(let i=0;i<3;i++)put(-1.8,.25+i*.35,1.61,3.6,.08,.03,1);if(s!=='trousers'){put(-.8,h+.1,.5,1.6,.2,.6,7);put(-.1,h+.1,1.15,.2,.15,.3,2);}}
  const x=slot%2===0?-3.5:3.5,y=slot<2?1.7:13.7;for(const c of a)c.origin=[c.origin[0]+x,c.origin[1]+y,c.origin[2]];
 }else{
  const mannequin=pose==='mannequin',top=mannequin?24.7:25.4,bottom=s==='coat'||s==='dress'?12.5:s==='suit'?15.8:17;
  if(s==='hat'){put(-2,29.5,-1.6,4,.35,3.2,0);put(-1.6,29.85,-1.25,3.2,1.8,2.5,0);put(-1.6,30.2,1.26,3.2,.25,.02,2);}
  else if(s!=='trousers'){
   put(-3.5,bottom,-1.45,7,top-bottom,2.9,0);for(const x of [-5,3.1])put(x,s==='tshirt'?21:16.3,-1.1,1.9,s==='tshirt'?3.2:8.3,2.2,0);
   if(s==='dress')for(let i=0;i<3;i++)put(-3.7-i*.35,9.5+i, -1.55-i*.08,7.4+i*.7,1,3.1+i*.16,0);
   put(-.12,bottom,1.46,.24,top-bottom-.2,.03,1);
   if(s!=='tshirt'){put(-1.4,top-.6,1.46,1.2,.6,.12,7);put(.2,top-.6,1.46,1.2,.6,.12,7);for(let i=0;i<4;i++)put(-.15,18+i*1.4,1.5,.3,.3,.08,2);}
   if(s==='suit'){for(const x of [-1.9,.4])put(x,21,1.51,1.5,2,.08,1);put(-.35,21.5,1.61,.7,2.2,.05,3);put(1.6,19.5,1.5,1.2,.25,.08,7);}
   if(s==='tshirt')put(-.9,top-.4,1.46,1.8,.4,.08,1);
  }
  if(s==='trousers'||s==='suit'){const base=mannequin?4:13.5,high=mannequin||s==='suit'?17:25;for(const x of [-2.3,.25]){put(x,base,-1.2,2.05,high-base,2.4,0);put(x+.85,base,1.21,.12,high-base,.02,1);}put(-2.3,high-.4,-1.2,4.6,.4,2.4,1);}
  if(!mannequin){const x=slot===0?-3.5:3.5;for(const c of a){c.origin[0]=c.origin[0]*.55+x;c.size[0]*=.55;c.origin[2]*=.7;c.size[2]*=.7;}}
 }
 return finish(a);
}
export function patch072Texture(key){
 if(key==='transit_ticket_gate'||key==='ticket_vending_machine')return patch096Texture(key);
 const garment=clothingItems.find(d=>d.key===key),cloth=key.includes('black')?[31,34,40,255]:key.includes('navy')?[31,47,76,255]:key.includes('light_gray')?[167,174,181,255]:({tshirt:[60,119,128,255],shirt:[203,219,228,255],coat:[157,111,75,255],trousers:[53,67,92,255],dress:[141,65,85,255],hat:[186,153,99,255]}[garment?.style]);
 const colors=[cloth??[48,55,65,255],cloth?cloth.map((v,i)=>i<3?Math.max(0,v-19):v):[15,22,31,255],[153,166,175,255],[158,49,57,255],[83,96,110,255],[193,177,146,255],[154,191,200,255],[227,228,214,255]];
 const im=canvas(128,128,colors[0]),mer=canvas(128,128,[0,0,195,255]);
 for(let i=0;i<8;i++){rect(im,96,60+i*8,32,8,colors[i]);rect(mer,96,60+i*8,32,8,[!garment&&[2,6].includes(i)?180:0,0,i===6?35:190,255]);for(let x=98;x<126;x+=4)rect(im,x,61+i*8,1,5,colors[i].map((v,j)=>j<3?Math.max(0,v-5):v));}
 rect(im,0,0,96,56,[236,238,237,255]);rect(im,0,0,96,10,[153,36,49,255]);if(key.startsWith('ft_'))chinese(im,'FT政务工作台',2,0,[255,246,231,255]);else text(im,'FT SERVICE',4,2,1,[255,246,231,255]);
 for(let i=0;i<3;i++){rect(im,4,15+i*12,23,8,[219,223,224,255]);if(key.startsWith('ft_'))chinese(im,['公文流转','事项审批','档案查询'][i],3,13+i*13,[68,75,84,255]);else text(im,['DOC','TASK','FILE'][i],6,16+i*12,1,[68,75,84,255]);rect(im,key.startsWith('ft_')?48:33,17+i*12,key.startsWith('ft_')?40-i*7:54-i*7,2,[94,105,115,255]);rect(im,key.startsWith('ft_')?48:33,21+i*12,key.startsWith('ft_')?30+i*3:35+i*3,1,[167,173,176,255]);}
 if(patch072Screens.has(key))rect(mer,0,0,96,56,[0,12,65,255]);
 return {width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}
export function informationImage(key){
 const im=canvas(256,128,[17,29,42,255]),gov=key==='government_queue_screen';rect(im,0,0,256,27,gov?[143,34,49,255]:[24,93,103,255]);text(im,gov?'FT CIVIC SERVICE':'PLATFORM 02',12,8,2,[245,238,214,255]);text(im,gov?'WINDOW 03   A018':'MOON SQUARE',12,41,2,[240,224,175,255]);
 text(im,gov?'WAITING A019 A020':'10:28  NORTH LINE',12,70,1,[193,215,220,255]);rect(im,12,90,232,1,[91,116,130,255]);text(im,gov?'DOCUMENTS  /  SERVICE':'NEXT  10:35   FT102',12,104,1,[204,216,220,255]);return im;
}

export function clothingGeometry(v){
 const g=detailGeometry('garment.'+v.visualKey,clothingCubes(v,v.pose,v.slot)),original=g['minecraft:geometry'][0];
 Object.assign(original.description,{visible_bounds_width:3,visible_bounds_height:4,visible_bounds_offset:[0,1,0]});
 original.bones=[{name:'food',pivot:[0,0,0],cubes:[]},{name:'ware',pivot:[0,0,0],cubes:original.bones.flatMap(b=>b.cubes??[])}];return g;
}
