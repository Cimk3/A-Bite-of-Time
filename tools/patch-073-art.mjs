import {patch096Cubes,patch096Texture} from './patch-096-art.mjs';
/** Original 0.7.3 art. One item per set; no vanilla assets or real identity data. */
import {canvas,rect,text,png} from './art.mjs';
import {disc,pruneFaces} from './detail-art.mjs';
import {northFacingCubes} from './patch-072-art.mjs';
import {patch073Screens,saucePositions} from '../.build/patch-073-catalog.js';
export function patch073Cubes(key){
 if(key==='government_service_kiosk')return patch096Cubes(key);
 const a=[],put=(x,y,z,w,h,d,color=0)=>{const c={origin:[x,y,z],size:[w,h,d],color,material:'ware'};a.push(c);return c;};
 const face=(x,y,z,w,h)=>{const c=put(x,y,z,w,h,.04,1);c.uv={south:{uv:[0,0],uv_size:[96,56],material_instance:'ware'}};return c;};
 if(key==='government_service_kiosk'){
  put(-6,0,-5,12,.7,10,2);put(-4.7,.7,-3.8,9.4,12,7.6,0);put(-6,12,-4,12,18,6.5,0);face(-5.3,16,2.58,10.6,12);put(-4,12.7,2.55,8,.55,.2,1);put(-3.5,13.3,2.56,7,1.1,.08,7);for(let i=0;i<5;i++)put(-3.2+i*1.3,13.65,2.65,.6,.12,.02,4);put(-5.2,28.7,2.55,10.4,.6,.07,3);
 }else if(key==='government_id_reader'){
  put(-3.7,0,-3,7.4,1.3,6,0);put(-3.3,1.3,-2.6,6.6,.4,5.2,2);put(-2.8,1.71,-1.2,5.6,.04,.25,1);const card=put(-2.5,1.72,-.6,5, .05,2.8,7);card.uv={up:{uv:[80,64],uv_size:[-80,40],material_instance:'ware'}};
  put(-3,1.7,-2.5,6,2,.6,0);face(-2.5,2,-1.84,4.4,1.2);put(2.45,2.2,-1.83,.3,.3,.03,13);
 }else if(key==='government_fingerprint_scanner'){
  put(-3.5,0,-3.7,7,1.1,7.4,0);put(-3,1.1,-3,6,1.5,6,2);put(-2.2,2.6,-2.2,4.4,.12,4.4,1);put(-1.7,2.73,-1.7,3.4,.04,3.4,13);for(let i=0;i<5;i++)put(-1.3+i*.5,2.78,-1.3,.12,.02,2.6,4);put(-2.8,1.3,3.01,5.6,.5,.05,1);
 }else if(key==='government_signature_pad'){
  put(-6,0,-4.5,12,.65,9,0);put(-5.8,.65,-4.3,11.6,.35,8.6,2);const screen=put(-5.1,1.01,-3.7,8.8,.04,7.4,1);screen.uv={up:{uv:[96,0],uv_size:[-96,56],material_instance:'ware'}};put(4.4,1,-3.6,.6,.1,7.2,1);put(4.5,1.15,-3.1,.35,.35,5.8,2);put(4.5,1.17,2.7,.35,.25,.5,1);
 }else if(key==='government_document_scanner'){
  put(-5.7,0,-4.5,11.4,2.4,9,0);put(-5.4,2.4,-3.8,10.8,2.2,7.6,5);put(-4.7,4.6,-3.5,9.4,.6,4.4,2);put(-4.2,5.2,-3.1,8.4,.16,3.5,7);for(let i=0;i<3;i++)put(-3.8,5.37,-2.6+i*.65,6.8,.02,.08,4);put(-4.8,1.8,4.51,9.6,.35,.05,1);put(-4.5,.5,4.5,9,.35,3,5);put(-3.9,.86,4.7,7.8,.04,2.4,7);put(3.9,4.61,1.2,.6,.12,.6,3);for(let i=0;i<4;i++)put(-4.7,2.8,-3.81+i*.6,.16,1.2,.1,1);
 }else if(key==='government_stamp_set'){
  put(-6,0,-4.3,12,.45,8.6,15);put(-5.3,.45,-3.3,5.1,.7,6.6,1);put(-4.9,1.16,-2.9,4.3,.12,5.8,3);disc(a,2.7,.45,0,2.3,2.3,.45,2,'ware',12);disc(a,2.7,.91,0,1.8,1.8,.4,3,'ware',10);disc(a,2.7,1.31,0,.85,.85,2.8,15,'ware',8);disc(a,2.7,4.1,0,1.3,1.3,.6,15,'ware',10);
 }else if(key==='chinese_five_sauce_set'){
  put(-7.5,0,-6,15,.4,12,1);put(-7.5,.4,-6,15,.3,.25,2);put(-7.5,.4,5.75,15,.3,.25,2);put(-7.5,.4,-5.75,.25,.3,11.5,2);put(7.25,.4,-5.75,.25,.3,11.5,2);
  saucePositions.forEach(([x,z],i)=>{disc(a,x,.45,z,1.8,1.8,.25,7,'ware',8);put(x-1.9,.7,z-1.9,3.8,.7,.35,7);put(x-1.9,.7,z+1.55,3.8,.7,.35,7);put(x-1.9,.7,z-1.55,.35,.7,3.1,7);put(x+1.55,.7,z-1.55,.35,.7,3.1,7);disc(a,x,.74,z,1.5,1.5,.23,8+i,'ware',8);
   for(let j=0;j<(i===4?3:7);j++){const dx=((j*7+i*3)%11-5)*.18,dz=((j*5+i)%9-4)*.2;put(x+dx-.12,1,z+dz-.1,.24,.09,.2,i===0?14:i===3?13:i===1?3:15);}
  });
 }else if(key.startsWith('ft_')){
  const game=key==='ft_master_open',creator=key==='ft_ideabook_p1_open',w=game?15.6:creator?14.6:13.4,base=game?.95:creator?.6:.45,h=game?9:creator?8.8:8.4;
  put(-w/2,0,-5.2,w,base,10.4,0);put(-w/2,base,-5.2,w,h,.55,0);face(-w/2+.45,base+.5,-4.58,w-.9,h-1);
  put(-w/2+.7,base,-.6,w-1.4,.12,3.3,1);for(let row=0;row<4;row++)for(let k=0;k<12;k++)put(-w/2+.95+k*(w-1.9)/12,base+.13,-.4+row*.7,(w-2.4)/12,.08,.46,4);
  const tw=creator?5.5:4;put(-tw/2,base+.01,3,tw,.03,1.6,5);put(-.15,base+h-.35,-4.63,.3,.14,.03,1);
  for(const x of[-w/2-.01,w/2-.04])for(let i=0;i<(game?7:3);i++)put(x,.15,-3.7+i*.48,.05,.2,.25,1);
  if(game){for(let i=0;i<15;i++)put(-6.8+i*.9,base+.02,-3.5,.4,.03,1.6,1);put(-7.2,base+.01,4.85,14.4,.06,.16,3);}
 }else throw Error('Unknown 0.7.3 model '+key);
 for(const c of a)for(const f of['north','south','east','west','up','down']){c.uv??={};c.uv[f]??={uv:[98,64+c.color*4],uv_size:[28,3],material_instance:'ware'};}
 const cs=northFacingCubes(pruneFaces(a));if(cs.length>256)throw Error('0.7.3 model budget '+key);return cs;
}
export function patch073Texture(key){
 if(key==='government_service_kiosk')return patch096Texture(key);
 const game=key==='ft_master_open',creator=key==='ft_ideabook_p1_open',laptop=key.startsWith('ft_'),signature=key==='government_signature_pad';
 const colors=[laptop?(game?[34,38,47,255]:creator?[223,229,230,255]:[159,171,182,255]):[57,64,75,255],[18,25,35,255],[158,170,176,255],[177,47,49,255],[59,68,78,255],[208,217,218,255],[233,223,180,255],[235,237,225,255],[216,202,142,255],[174,49,33,255],[87,48,29,255],[133,156,64,255],[58,38,26,255],[69,131,97,255],[228,215,169,255],[100,66,42,255]];
 const im=canvas(128,128,colors[0]),mer=canvas(128,128,[0,0,190,255]);
 colors.forEach((c,i)=>{rect(im,96,64+i*4,32,4,c);rect(mer,96,64+i*4,32,4,[key==='chinese_five_sauce_set'?0:i===2?180:0,0,i===2?85:i>=8?165:195,255]);for(let x=98;x<126;x+=5)rect(im,x,65+i*4,1,1,c.map((v,j)=>j<3?Math.max(0,v-8):v));});
 rect(im,0,0,96,56,[231,236,235,255]);rect(im,0,0,96,10,game?[123,35,49,255]:creator?[58,73,103,255]:laptop?[37,85,126,255]:[143,37,49,255]);
 text(im,laptop?(game?'FT-MASTER':creator?'FT-IDEABOOK-P1':'FT-B1'):'FT SERVICE',3,2,1,[245,242,218,255]);
 if(signature){text(im,'SIGN HERE',5,15,1,[59,67,78,255]);for(let i=0;i<31;i++)rect(im,8+i*2,36+Math.round(Math.sin(i*.65)*5),2,1,[53,72,102,255]);rect(im,6,47,83,1,[130,142,150,255]);}
 else if(game){for(let i=0;i<3;i++){rect(im,5+i*30,15,25,25,[[70,98,123,255],[107,65,89,255],[69,114,95,255]][i]);text(im,['RACE','BUILD','FLY'][i],7+i*30,23,1,[242,228,197,255]);}text(im,'MY LIBRARY',5,46,1,[52,68,85,255]);}
 else if(creator){rect(im,4,14,58,27,[249,239,206,255]);for(let i=0;i<8;i++)rect(im,10+i*5,32-i*2,4,i*2+2,[84,145,146,255]);rect(im,65,14,26,27,[100,109,133,255]);for(let i=0;i<3;i++)rect(im,4,44+i*3,80-i*15,2,[[90,155,157,255],[189,116,99,255],[157,136,190,255]][i]);}
 else{for(let i=0;i<3;i++){rect(im,4,15+i*12,23,8,[200,212,220,255]);text(im,laptop?['DOC','MEET','PLAN'][i]:['TASK','FORM','FILE'][i],5,16+i*12,1,[53,70,86,255]);rect(im,34,16+i*12,54-i*5,2,[102,119,133,255]);rect(im,34,21+i*12,37,1,[159,174,184,255]);}}
 // A fictional specimen card occupies a non-emitting island, never the screen UV.
 rect(im,0,64,80,40,[228,232,221,255]);text(im,'FT DEMO',3,68,1,[63,77,80,255]);text(im,'ID 000000',3,80,1,[63,77,80,255]);rect(im,59,71,15,20,[147,172,166,255]);
 if(patch073Screens.has(key))rect(mer,0,0,96,56,[0,12,65,255]);
 return{width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}
