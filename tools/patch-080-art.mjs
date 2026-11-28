import {patch096Cubes,patch096Texture} from './patch-096-art.mjs';
/** Approved 0.8.0 concepts, static cuboid models and original fixed UIs. */
import {canvas,rect,text,png} from './art.mjs';
import {pruneFaces} from './detail-art.mjs';
import {northFacingCubes} from './patch-072-art.mjs';
import {patch080Screens} from '../.build/patch-080-catalog.js';
export function patch080Cubes(key){
 if(key==='laboratory_dual_monitor_set'||key==='template_ai_triple_monitor_set')return patch096Cubes(key);
 const a=[],p=(x,y,z,w,h,d,color=0)=>{const c={origin:[x,y,z],size:[w,h,d],color,material:'ware'};a.push(c);return c;};
 const face=(x,y,z,w,h,uv=[0,0],size=[96,56],material='ware')=>{const c=p(x,y,z,w,h,.04,1);c.material=material;c.uv={south:{uv,uv_size:size,material_instance:material}};return c;};
 const base=()=>p(-7.5,0,-6.5,15,.6,13,1);
 const vent=(x,y,z,w,n=5)=>{for(let i=0;i<n;i++)p(x,y+i*.55,z,w,.16,.07,1);};
 const keys=()=>{p(-5.7,.6,3.2,10,.3,3,1);for(let row=0;row<3;row++)for(let i=0;i<10;i++)p(-5.4+i*.93,.92,3.5+row*.8,.66,.07,.5,4);p(5,.6,3.8,1.4,.6,2,0);};
 if(key==='laboratory_centrifuge'){
  base();p(-6.9,.6,-5.8,13.8,6.6,11.6,0);p(-7,7.2,-5.9,14,1,1.2,2);p(-7,7.2,4.7,14,1,1.2,2);p(-7,7.2,-4.7,1.2,1,9.4,2);p(5.8,7.2,-4.7,1.2,1,9.4,2);p(-5.6,7.25,-4.6,11.2,.08,9.2,1);p(-1.3,7.35,-1.3,2.6,.25,2.6,2);for(let i=0;i<6;i++){const t=i*Math.PI/3;p(Math.cos(t)*3.2-.5,7.36,Math.sin(t)*3.2-.5,1,.35,1,6);}face(-5.8,2.1,5.84,7.4,3.5);for(let i=0;i<3;i++)p(3,2+i*1.3,5.85,1.6,.8,.1,i===0?5:2);p(-1,7.8,5.2,2,.4,.7,1);
 }else if(key==='laboratory_incubator'){
  base();p(-7,.6,-5.5,14,27,1,0);p(-7,.6,-4.5,1,27,10,0);p(6,.6,-4.5,1,27,10,0);p(-6,26.6,-4.5,12,1,10,0);p(-6,.6,-4.5,12,1,10,0);p(-5.5,1.6,-4.45,9,24.5,.2,1);for(const y of[7,16]){p(-5.3,y,-4.1,8.4,.35,8.7,2);for(let i=0;i<5;i++)p(-4.8+i*1.5,y+.36,-2.8,.45,.04,5.6,1);}p(3.4,1.6,-4.4,2.6,25,9.9,0);face(3.7,18,5.54,2,4);p(-6.3,1.5,4.7,.5,24.8,.7,2);p(2.7,1.5,4.7,.5,24.8,.7,2);p(-6.3,25.8,4.7,9.5,.5,.7,2);p(-6.3,1.5,4.7,9.5,.5,.7,2);p(1.9,11,5.45,.4,5,.4,1);p(-4.9,24,-3.9,7.7,.3,.3,7);vent(3.7,3,5.54,1.8);
 }else if(key==='laboratory_cloud_storage_array'){
  base();p(-7,.6,-5.5,14,26,11,2);p(-6.7,1,5.52,13.4,25,.1,1);for(let row=0;row<2;row++)for(let i=0;i<4;i++){const x=-6.2+i*3.2,y=1.8+row*12;p(x,y,5.64,2.8,10.6,.4,0);p(x+.35,y+.8,6.05,.4,7,.08,2);face(x+1.5,y+8.2,6.05,.55,.55);p(x+.3,y+9.8,6.06,2.1,.2,.03,4);}p(-6.7,26.6,-5.2,13.4,.6,10.4,0);
 }else if(key==='open_reel_tape_recorder'){
  base();p(-7,.6,-4.5,14,24,8,0);p(-6.7,1,3.52,13.4,23.1,.15,2);
  for(const cx of[-3.5,3.5]){const cy=18,r=3.15;for(let j=0;j<12;j++){const yy=-r+j*r/6,half=Math.sqrt(Math.max(0,r*r-(yy+r/12)**2));p(cx-half,cy+yy,3.75,Math.max(.08,2*half),r/6,.5,4);}p(cx-.5,cy-.5,4.27,1,1,.15,1);p(cx-2.5,cy-.6,4.27,1.2,1.2,.05,1);p(cx+1.3,cy-.6,4.27,1.2,1.2,.05,1);p(cx-.6,cy+1.3,4.27,1.2,1.2,.05,1);}
  p(-3.4,12,3.8,6.8,.18,.16,3);p(-5.7,4.8,3.75,5.1,3.8,.1,7);p(.6,4.8,3.75,5.1,3.8,.1,7);for(let i=0;i<6;i++)p(-5.4+i*1.8,2,3.75,1.2,.8,.2,i===0?5:1);for(const x of[-3.3,3.3])p(x-.1,5.3,3.87,.2,2.6,.05,1);
 }else if(key==='laboratory_radio_station'||key==='digital_oscilloscope'){
  const scope=key==='digital_oscilloscope';base();p(-7,.6,-5.8,scope?14:10.6,8.8,9.8,0);face(scope?-6.3:-3.8,2.1,4.05,scope?8.4:4.1,6.4);for(let i=0;i<3;i++)p(scope?3.1:1,2+i*2,4.08,1.8,1.3,.45,2);if(scope){for(const x of [-6.95,6.25])p(x,8.75,-5.77,.7,.72,9.73,2);
   for(const x of [3.2,4.7]){p(x,.85,4.02,.83,.83,.22,x<4?9:6);p(x+.22,1.06,4.25,.38,.38,.12,1);}
   vent(-4.95,2,-5.86,8,8);}else{p(4,.6,-2,2.5,.5,5,2);p(4.8,1.1,0,.7,8,.7,2);p(3.8,9.1,-.6,2.7,2.9,2,1);vent(-6.3,2.1,4.12,2,8);}
 }else if(key==='pipette_rack_set'){
  base();p(-6.5,.6,-3.5,8,1,7,0);p(-6,1.6,-2.8,.5,11,.5,0);p(.5,1.6,-2.8,.5,11,.5,0);p(-6,11,-2.8,7,1,3.2,0);for(let i=0;i<4;i++){const x=-5.7+i*1.8;p(x,4,-.5,1.2,6.5,1.5,0);p(x+.35,1.8,0,.5,2.2,.5,7);p(x+.35,10.5,0,.5,2.5,.5,2);p(x+.1,12.8,-.25,1,.7,1,[6,8,9,2][i]);p(x+.25,5,.99,.7,3,.06,1);}p(2.5,.6,-3.7,4.5,2.2,7.4,6);p(2.4,2.8,-3.8,4.7,.4,7.6,2);for(let i=0;i<3;i++)for(let j=0;j<5;j++)p(2.8+i*1.25,3.2,-3+j*1.25,.5,.12,.5,0);
 }else if(key==='laboratory_dual_monitor_set'||key==='template_ai_triple_monitor_set'){
  base();const triple=key.startsWith('template'),n=triple?3:2,w=triple?4.7:7;
  p(-2,.6,-3,4,.4,3);p(-.3,1,-2,.6,3,.6,2);p(-.4,3.2,-3.8,.8,1.2,2.5,2);p(-n*w/2,4,-3.85,n*w-.1,.6,.35,2);for(let i=0;i<n;i++){const x=-n*w/2+i*w;const shell=p(x,4,-3.5,w-.1,6,.5,1),screen=face(x+.25,4.35,-2.94,w-.6,5.3,triple?(i===1?[0,0]:[i===0?0:48,28]):[i*48,0],triple?(i===1?[96,28]:[48,28]):[48,56]);if(triple&&i!==1)for(const c of[shell,screen]){c.rotation=[0,i===0?-12:12,0];c.pivot=[x+(w-.1)/2,0,-3.2];}}keys();
 }else if(key==='portrait_paper_monitor'){
  base();p(-4,.6,-3.5,8,.5,7,2);p(-.4,1.1,-.4,.8,3.4,.8,2);const shell=p(-3.7,4,-.4,7.4,14,.7,1),screen=face(-3.3,4.4,.37,6.6,13.2,[0,64],[80,56]);for(const c of[shell,screen]){c.rotation=[0,45,0];c.pivot=[0,0,0];}
 }else if(key==='ceiling_arm_display_2x1'){
  p(-16,0,-1,32,16,1.2,0);p(-15.5,.5,.21,31,15,.1,1);face(-15.3,.7,.34,30.6,14.6,[0,0],[256,128],'food');p(-1,16,-.5,2,5,2,0);p(-7,20,-.5,8,2,2,0);p(-7,22,-.5,2,8,2,0);p(-9,30,-2.5,6,2,6,0);
 }else throw Error('Unknown 0.8.0 model '+key);
 for(const c of a)for(const f of['north','south','east','west','up','down']){c.uv??={};c.uv[f]??={uv:key==='ceiling_arm_display_2x1'?[0,0]:[98,64+c.color*4],uv_size:key==='ceiling_arm_display_2x1'?[1,1]:[28,3],material_instance:c.material};}
 const out=northFacingCubes(pruneFaces(a)).map(c=>c.rotation&&c.pivot?{...c,pivot:[-c.pivot[0],c.pivot[1],-c.pivot[2]]}:c);if(out.length>256)throw Error('0.8.0 model budget '+key);return out;
}
export function patch080Texture(key){
 if(key==='laboratory_dual_monitor_set'||key==='template_ai_triple_monitor_set')return patch096Texture(key);
 const im=canvas(128,128,[208,211,204,255]),mer=canvas(128,128,[0,0,185,255]);const colors=[[206,211,207,255],[23,30,39,255],[106,123,134,255],[159,111,60,255],[145,155,163,255],[180,61,54,255],[67,132,186,255],[231,231,209,255],[140,88,164,255],[212,177,59,255]];
 if(key==='laboratory_cloud_storage_array')colors[0]=[55,65,75,255];
 colors.forEach((c,i)=>{rect(im,96,64+i*4,32,4,c);rect(mer,96,64+i*4,32,4,[i===2?160:0,0,i===2?90:190,255]);});
 rect(im,0,0,96,56,[19,35,51,255]);text(im,key==='laboratory_centrifuge'?'12000 RPM':key==='laboratory_incubator'?'37.0 C':key==='laboratory_radio_station'?'14.270 MHz':'LAB DATA',3,2,1,[211,232,238,255]);
 for(let i=0;i<36;i++){rect(im,3+i*2,30-Math.round(Math.sin(i*.3)*10),2,1,[224,179,75,255]);rect(im,3+i*2,45-(i%10<5?7:0),2,1,[98,180,218,255]);}
 if(key==='laboratory_cloud_storage_array')rect(im,0,0,96,56,[66,134,69,255]);
 if(key==='template_ai_triple_monitor_set'){
  rect(im,0,0,96,56,[20,34,49,255]);text(im,'TemplateAI Agent',1,1,1,[191,218,232,255]);rect(im,3,12,11,11,[93,154,208,255]);rect(im,5,15,2,2,[230,240,241,255]);rect(im,10,15,2,2,[230,240,241,255]);text(im,'TASK',21,13,1,[210,220,225,255]);text(im,'PLAN / RUN',21,21,1,[210,220,225,255]);text(im,'CODE',2,29,1,[123,192,225,255]);text(im,'DATA',50,29,1,[123,192,225,255]);for(let j=0;j<5;j++){rect(im,3,39+j*3,36-j*3,1,j%2?[168,118,192,255]:[103,172,162,255]);rect(im,51+j*8,43-j*2,4,10+j*2,[87,166,183,255]);}
 }
 if(key==='digital_oscilloscope'){
  rect(im,0,0,96,56,[16,29,48,255]);
  for(let x=3;x<96;x+=9)rect(im,x,3,1,48,[41,63,82,255]);
  for(let y=5;y<56;y+=8)rect(im,3,y,89,1,[41,63,82,255]);
  for(let x=4;x<91;x++)rect(im,x,27+Math.round(12*Math.sin(x/7)),2,2,[65,213,235,255]);
 }
 // Paper island is explicitly outside all emissive pixels.
 rect(im,0,64,80,56,[233,234,219,255]);text(im,'LAB PAPER',2,67,1,[45,55,65,255]);for(let j=0;j<9;j++)for(let i=0;i<2;i++)rect(im,3+i*39,79+j*4,31-(j%3)*3,1,[128,141,145,255]);for(let i=0;i<5;i++)rect(im,43+i*5,103-i*3,3,7+i*3,[77,119,148,255]);
 if(patch080Screens.has(key))rect(mer,0,0,96,56,[0,12,65,255]);
 if(key==='ceiling_arm_display_2x1')rect(im,0,0,128,128,[38,47,55,255]);
 return{width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}
export function ceilingScreenTexture(){const im=canvas(256,128,[18,33,49,255]),mer=canvas(256,128,[0,12,65,255]);text(im,'LAB STATUS',10,8,2,[203,223,227,255]);for(let x=0;x<145;x++)rect(im,8+x,70-Math.round(Math.sin(x*.08)*21),1,2,[80,172,208,255]);for(let i=0;i<4;i++){text(im,['TEMP 22.4C','HUM 45%','PRESS 101kPa','RUN STABLE'][i],155,40+i*19,1,[201,222,223,255]);}return{width:256,height:128,pixels:im.data,png:png(256,128,im.data),mer:png(256,128,mer.data)};}
