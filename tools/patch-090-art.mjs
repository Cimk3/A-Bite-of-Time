import {readFileSync} from 'node:fs';
const chineseLabels=JSON.parse(readFileSync(new URL('../assets/patch-090/labels.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
import {renderDetail,pruneFaces} from './detail-art.mjs';
import {bakeDeviceTilts} from './device-geometry.mjs';
import {patch085Cubes,patch085Texture} from './patch-085-art.mjs';
import {canvas,rect,text,png,blit} from './art.mjs';
import {parkLampParts,parkLampTexture} from './patch-090-park-art.mjs';
import {patch090Items} from '../.build/patch-090-catalog.js';
const faces=['north','south','east','west','up','down'];
const colors=[[224,225,218],[36,40,47],[114,123,133],[127,83,45],[185,126,58],[170,58,47],[44,142,144],[60,105,174],[245,212,134],[152,192,207]];
export function patch090Texture(key){
 if(key==='park_lamp')return parkLampTexture();
 const im=canvas(128,128,[224,225,218,255]),mer=canvas(128,128,[0,0,170,255]);
 colors.forEach((c,i)=>rect(im,100,10*i,20,8,[...c,i===9?40:255]));
 rect(im,0,0,96,48,[17,28,39,255]);
 text(im,key.includes('police')?'POLICE':key.includes('cafe')?'COFFEE':key.includes('legion')?'LEGION':'MARKET',4,3,1);
 for(let i=0;i<6;i++){
  rect(im,4+i*12,32-(i%3)*6,7,8+(i%3)*6,[68,161,176,255]);
  rect(im,76,13+i*5,15,2,i%2?[228,89,69,255]:[94,200,113,255]);
 }
 if(key==='legion_laptop_open'||key==='macbook_air_m5_open'){
  const mac=key.startsWith('macbook');
  for(let y=0;y<48;y++)for(let x=0;x<96;x++){
   const wave=Math.sin(x*.065+y*.09)*18+Math.sin(x*.04-y*.13)*12;
   rect(im,x,y,1,1,mac?[Math.round(132+wave),Math.round(109+wave),Math.round(195+wave),255]:[Math.round(30+wave*.5),Math.round(76+wave),Math.round(170+wave),255]);
  }
  rect(im,0,0,96,3,[25,31,50,255]);
  for(let i=0;i<9;i++)rect(im,22+i*6,42,4,4,[66+i*15,176-i*7,195,255]);
 }
 const lit=/monitor|computer|terminal|register|laptop|m5|console|espresso/.test(key);
 if(lit)rect(mer,0,0,96,48,[0,12,70,255]);
 return {width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}
export function patch090Cubes(key){
 const def=patch090Items.find(x=>x.key===key),[w,d,h]=def.size.map(v=>v*16),a=[];
 if(key==='park_lamp')return parkLampParts().flatMap((cs,i)=>cs.map(c=>({...c,origin:[c.origin[0],c.origin[1]+i*16,c.origin[2]]})));
 const p=(x,y,z,sx,sy,sz,color=0)=>{const c={origin:[x,y,z],size:[sx,sy,sz],color,material:'ware',uv:Object.fromEntries(faces.map(f=>[f,{uv:[100,color*10],uv_size:[20,8],material_instance:'ware'}]))};a.push(c);return c;};
 const screen=(x,y,z,sx,sy)=>{p(x-.5,y-.5,z,sx+1,sy+1,.8,1).tag='screen_back';const c=p(x,y,z-.035,sx,sy,.035,1);c.faces=['north'];c.uv.north={uv:[0,0],uv_size:[96,48],material_instance:'ware'};c.tag='screen';};
 const rear=(x,y,z,sx,sy)=>{for(let i=0;i<4;i++)p(x+sx*.2,y+sy*.3+i*.6,z,sx*.6,.2,.16,1);};
 const legs=(top=11)=>{for(const x of [-w/2+1,w/2-3])for(const z of [-d/2+1,d/2-3])p(x,0,z,2,top,2,1);};
 const shell=(height=h)=>{p(-w/2+1,0,-d/2+1,w-2,1,d-2,1);p(-w/2+1,1,-d/2+1,w-2,height-2,d-2,0);rear(-w/2,2,d/2-1,w,height-4);};
 const mug=(x,z,y=0)=>{
  p(x,y,z,3.6,.5,3.6,0);
  for(const xx of [x,x+3.1])p(xx,y+.5,z,.5,3.5,3.6,0);
  for(const zz of [z,z+3.1])p(x+.5,y+.5,zz,2.6,3.5,.5,0);
  p(x+.5,y+3.25,z+.5,2.6,.1,2.6,3);
  for(const yy of [y+1,y+2.8])p(x+3.3,yy,z+1.2,1.5,.4,1,0);
  p(x+4.4,y+1,z+1.2,.4,2.2,1,0);
 };
 const computerScreen=(x,y,z,sx,sy,body=1,tilt=false)=>{
  const start=a.length;
  p(x-.45,y-.45,z-.55,sx+.9,sy+.9,.55,body).tag='display_shell';
  const face=p(x,y,z+.035,sx,sy,.03,1);
  face.faces=['south'];face.uv.south={uv:[0,0],uv_size:[96,48],material_instance:'ware'};face.tag='screen';
  if(!tilt){
   p(x-.45,y-.45,z,sx+.9,.4,.065,body);p(x-.45,y+sy+.05,z,sx+.9,.4,.065,body);
   for(const xx of [x-.45,x+sx+.05])p(xx,y,z,.4,sy,.065,body);
  }
  for(let i=0;i<4;i++)p(x+sx*.22,y+sy*.3+i*.45,z-.68,sx*.56,.16,.13,1).tag='rear_vent';
  p(x+sx*.3,y+.5,z-.7,sx*.12,.4,.15,2).tag='rear_port';
  if(tilt)for(const c of a.slice(start)){c.rotation=[-20,0,0];c.pivot=[0,1.4,-3.8];}
 };
 if(key==='macbook_air_m5_open'||key==='legion_laptop_open'){
  const dark=key.startsWith('legion');p(-7,0,-4.3,14,.8,10.2,dark?1:2);
  p(-6.2,.8,-2.6,12.4,.15,4.6,1);
  for(let row=0;row<4;row++)for(let col=0;col<10;col++)p(-5.9+col*1.18,1,-2.35+row*1.05,.92,.12,.72,dark?(col%3===0?6:7):2);
  p(-2,.82,2.65,4,.08,2.2,dark?1:2).tag='trackpad';
  p(-6.5,.8,-4.1,13, .6,.6,dark?1:2).tag='hinge';
  computerScreen(-6.05,1.8,-3.8,12.1,7.2,dark?1:2,true);
  for(const x of [-7,6.85])for(let i=0;i<2;i++)p(x,.24,-2+i*1.6,.15,.3,.8,1).tag='side_port';
  return pruneFaces(bakeDeviceTilts(a));
 }
 if(key==='finance_monitor'||key==='police_monitoring_computer'){
  const desk=key.startsWith('police'),sw=desk?27:13;
  p(-4,0,-4,8,.6,8,1);p(-1,.6,-3.5,2,6.3,1,2).tag='stand';
  computerScreen(-sw/2,5,-2.3,sw,8.5,desk?1:2);
  if(desk){
   p(-12,0,2.5,23,.65,3.5,1);
   for(let row=0;row<3;row++)for(let col=0;col<12;col++)p(-11.5+col*1.8,.65,2.8+row,.95,.12,.6,2);
   p(12,0,3.3,2.5,.9,3.2,1);
  }
  return a;
 }
 if(/console_set/.test(key)){
  p(-6,0,-5,6,1,9,1);p(-5.6,1,-4.6,5.2,12,8.2,0);
  if(key.startsWith('ps5'))p(-5.4,2,-4.75,4.8,9,.25,1);
  if(key.startsWith('ps5')){p(-6,1,-4.85,.7,13,8.5,0);p(-.85,1,-4.85,.7,12,8.5,0);}
  else{p(-5.4,2,-4.85,4.8,10,.3,0);for(let i=0;i<6;i++)p(-5,10+i*.36,-5,3.8,.12,.16,1);p(-4.8,5,-5,3,.4,.2,1);p(-3.8,2.5,-5,1.8,1.8,.2,6);}
  if(key.startsWith('ps5'))p(-4.8,3,-4.89,.4,7,.2,7);
  p(1,0,-5,5,1.8,3,0);p(1,0,-3,1.2,2,2,1);p(4.8,0,-3,1.2,2,2,1);for(const x of [2,4])p(x,1.8,-4.2,.7,.3,.7,1);
  p(4.9,1.8,-4.6,.4,.3,.4,5);p(5.4,1.8,-4.1,.4,.3,.4,6);rear(-5,3,3.6,4,8);p(-4.5,2,3.55,2,.4,.2,1);return a;
 }
 if(key==='park_bench'){
  legs(6);for(const x of [-22,20])p(x,5,-6,2,1,12,1);for(let i=0;i<4;i++)p(-w/2,6,-6+i*3,w,1.2,2.3,3);
  for(const x of [-w/2,w/2-1.5])p(x,1,4.5,1.5,14,1.5,1);
  for(let i=0;i<3;i++)p(-w/2,8+i*2.3,4.4,w,1.6,1.7,3);return a;
 }
 if(key==='cafe_booth'){
  for(const x of [-23,13]){p(x,0,-15,10,3,30,3);p(x,3,-14,9,4,28,5);p(x<0?-24:22,3,-16,2,13,32,3);}
  p(-9,10,-11,18,1.2,22,3);p(-1,0,-1,2,10,2,1);return a;
 }
 if(key==='park_bin'){
  p(-6,0,-6,12,1,12,3);p(-5,1,-5,10,.2,10,1);
  for(const x of [-6,5])p(x,1,-6,1,13,12,3);
  for(const z of [-6,5])p(-5,1,z,10,13,1,3);
  for(const x of [-7,6])p(x,14,-7,1,2,14,1);
  for(const z of [-7,6])p(-6,14,z,12,2,1,1);
  for(const x of [-5,-2,1,4])p(x,2,-6.08,.3,10,.12,4);return a;
 }
 if(key==='asml_lithography'){
  p(-47,0,-31,94,3,62,1);
  p(-47,3,15,94,58,16,0);p(-47,3,-30,18,58,45,0);p(31,3,-30,16,58,45,0);
  p(-28,50,-29,59,11,44,0);p(-26,3,-29,55,14,42,0);
  p(-13,17,-12,26,3,25,2);p(-7,20,-6,14,2,14,6);p(-9,36,-8,18,8,16,2);p(-3,24,-3,6,12,6,7);p(-3,44,-3,6,6,6,2);
  p(-29,20,-28,2,29,42,2);p(29,17,-28,2,33,42,2);
  screen(-44,34,-30.1,12,12);screen(33,30,-30.1,11,17);
  for(const x of [-43,34])rear(x,7,-30.2,10,18);
  for(let i=0;i<6;i++)p(-23+i*8,5,-29.2,6,.5,.3,2);
  // Service doors, hinges, ventilation and utility ports on the rear enclosure.
  for(const x of [-43,5]){
   p(x,6,31,38,38,.3,2);p(x+.5,6.5,31.3,37,37,.1,0);
   for(let i=0;i<6;i++)p(x+5,11+i*1.2,31.4,28,.35,.16,1);
   p(x+31,31,31.4,1,6,.2,1);
   for(const y of [10,36])p(x+.6,y,31.4,1,3,.2,2);
  }
  p(-12,49,31,24,6,.3,2);
  for(let i=0;i<3;i++)p(-9+i*7,50.5,31.3,4,2,.2,1);
  return a;
 }
 if(def.slots){
  const wood=key==='cafe_pastry_case'?3:2;
  p(-w/2,0,-d/2,w,2,d,wood);
  for(const x of [-w/2,w/2-1])p(x,2,-d/2,1,h-2,d,wood);
  p(-w/2,2,d/2-1,w,h-2,1,wood);
  const layers=key==='home_display_shelf'?3:2;
  for(let i=1;i<=(key==='cafe_pastry_case'?layers-1:layers);i++)p(-w/2, i*(h-2)/layers,-d/2,w,1,d,wood);
  if(key==='cafe_pastry_case'){p(-w/2+1,2,-d/2+.1,w-2,h-3,.12,9);p(-w/2+1,h-1,-d/2+.1,w-2,.2,d-1.1,9);for(const z of [-d/2,d/2-1])p(-w/2,h-1,z,w,1,1,wood);}
  return a;
 }
 if(key==='finance_trading_desk'){
  p(-24,13,-16,48,2,32,2);for(const x of [-23,14])p(x,0,-14,9,13,27,0);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){const x=-22+col*15;screen(x,16+row*7,9,13,6);if(!row)p(x+5,15,9.7,2,13.5,2,1);}
  p(-10,15,-10,20,.5,5,1);p(13,15,-8,3,.7,4,1);return a;
 }
 if(/mug/.test(key)){mug(-2,-2);if(key.includes('double')){a.length=0;p(-7,0,-4,14,.5,8,3);mug(-5,-2,.5);mug(2,-2,.5);}return a;}
 if(/syrup/.test(key)){
  p(-7,0,-4,14,1,8,3);
  for(let i=0;i<3;i++){const x=-6+i*4.5;p(x,1,-2,3,6,3,4+i);p(x+.6,7,-1.4,1.8,1,1.8,0);p(x+.3,8,-1.7,2.4,.6,2.4,0);p(x+.9,8,-2.7,1.2,.4,1.4,0);p(x+.4,2.5,-2.04,2.2,2.6,.08,0);}return a;
 }
 if(key==='cafe_takeaway_cup'){
  p(-2,0,-2,4,3,4,0);p(-2.5,3,-2.5,5,3,5,3);p(-2.75,6,-2.75,5.5,2,5.5,0);p(-3.25,8,-3.25,6.5,.6,6.5,0);p(-1,8.6,-2.2,2,.08,.7,1);return a;
 }
 if(key==='cafe_paper_bag'){
  p(-3,0,-2,6,7,4,4);p(-3.2,7,-2.2,6.4,.5,4.4,3);p(-3,7.5,-1.5,6,1,3,4);p(-1.6,2,-2.06,3.2,2.5,.08,3);return a;
 }
 if(/toppings/.test(key)){
  p(-15,0,-6,30,1.5,12,3);
  for(let i=0;i<4;i++){
   const x=-14+i*7.3;p(x,1.5,-5,6.5,.5,10,2);
   for(const xx of [x,x+6])p(xx,2,-5,.5,5,10,2);
   for(const z of [-5,4.5])p(x+.5,2,z,5.5,5,.5,2);
   for(let j=0;j<6;j++)p(x+1+j%2*2.4,2,-3.8+Math.floor(j/2)*2.6,1.8,2.5+(j%3)*.7,1.8,[8,3,4,5][i]);
  }return a;
 }
 if(/first_aid/.test(key)){p(-6,0,-5,12,7,10,0);p(-3,7,-1,6,1.5,2,1);p(-1,2,-5.1,2,4,.2,5);p(-2,3,-5.15,4,2,.2,5);return a;}
 if(/radio/.test(key)){p(-5,0,-3,10,2,6,1);for(let i=0;i<(key.includes('dock')?2:1);i++){let x=-4+i*5;p(x,2,-2,3,7,4,1);p(x+.4,9,-1.5,.5,6,.5,1);screen(x+.4,5,-2.15,2,2);}return a;}
 if(/phone/.test(key)){p(-6,0,-4,12,2,8,1);p(-5,2,-3,2,2,6,2);screen(-1,2,-3.1,5,2);for(let i=0;i<6;i++)p(-.5+i%3*1.5,2,Math.floor(i/3)*1.7,1,.4,1,2);return a;}
 if(/cabinet/.test(key)){
  if(key.includes('riot')){
   p(-15,0,-7,30,2,14,0);p(-15,30,-7,30,2,14,0);
   for(const x of [-15,14])p(x,2,-7,1,28,14,0);p(-14,2,6,28,28,1,0);p(-1,2,-7,1,28,13,2);
   p(-12,4,-4,9,21,1,1);p(-11,6,-4.1,7,17,.15,2);p(-9,23,-3,2,4,9,1);
   for(const x of [1.5,4])p(x,2,-3,1.1,22,1.1,1);
   p(6,15,-4,6,11,.8,8);p(6,24,-3.2,6,2,9.2,1);
   for(const y of [18,23])p(6, y,-4.1,6,.7,.2,0);
   rear(-12,4,7,24,18);return a;
  }
  shell();for(let col=0;col<2;col++){
   p(-w/2+2+col*w/2,2,-d/2+.6,w/2-3,h-4,.8,2);
   p(-w/2+w/4+col*w/2,10,-d/2+.2,.6,5,.5,1);
  }return a;
 }
 if(key==='cafe_grinder'){
  p(-6,0,-6,12,2,12,1);p(-5,2,0,10,14,6,1);
  p(-4,14,-4,8,3,8,1);p(-3,17,-3,6,2,6,4);
  for(const x of [-5,4.6])p(x,19,-5,.4,10,10,9);
  for(const z of [-5,4.6])p(-4.6,19,z,9.2,10,.4,9);
  p(-5,18.5,-5,10,.5,10,1);p(-4.5,19,-4.5,9,4,9,3);p(-5.5,29,-5.5,11,1.5,11,1);
  p(-2,11,-1.2,4,2,1.5,1);p(-3,8,-4,6,5,3,2);p(-2,7,-5,4,2,2,1);p(-4,2,-5,8,1,5,2);
  p(-1.5,11,-4.2,3,2,.3,8);rear(-4,4,6,8,8);return a;
 }
 if(key==='cafe_tea_urn'){
  p(-6,0,-6,12,2,12,1);p(-6,2,-5,12,26,10,2);p(-5,2,-6,10,26,12,2);
  p(-6.5,28,-6.5,13,1.5,13,1);p(-3,29.5,-1.5,6,1,3,1);
  p(-7,18,-2,1,4,4,1);p(6,18,-2,1,4,4,1);
  p(-2,5,-7,4,3,2,1);p(-1,4,-8,2,2,2,2);p(-.7,8,-7,1.4,3,1,1);
  p(-3,15,-6.1,6,6,.2,0);p(-1,16,-6.25,2,4,.15,6);rear(-4,3,6,8,8);return a;
 }
 if(/water_dispenser/.test(key)){
  shell(h-4);
  if(key.includes('grinder')){p(-5,h-12,-5,10,10,10,9);p(-2,4,-d/2-0.1,4,4,1,1);}
  if(key.includes('water'))p(-5,h-6,-5,10,6,10,7);
  for(let i=0;i<2;i++)p(-3+i*4,8,-d/2,2,2,1,i?7:5);return a;
 }
 if(/espresso/.test(key)){
  p(-15,0,-7,30,2,14,1);for(const x of [-15,13.5])p(x,2,-7,1.5,29,14,0);
  p(-13.5,2,5.8,27,29,1.2,0);p(-13.5,19,-6.8,27,12,12.6,0);
  p(-13,2,-6,26,1,11,2);for(let i=0;i<8;i++)p(-11.5+i*3,3,-5.7,.3,.15,10,1);
  for(const x of [-10,0,10]){
   p(x-2,17,-5,4,3,4,2);p(x-.6,15.5,-4,.8,1.5,1,1);p(x-1,16.5,-6.5,2,.6,2,1);
   p(x-1.8,3,-5,3.6,.6,3.6,0);
   for(const xx of [x-1.8,x+1.2])p(xx,3.6,-5,.6,3.4,3.6,0);
   for(const z of [-5,-2])p(x-1.2,3.6,z,2.4,3.4,.6,0);
  }
  screen(-11,22,-7.1,16,6);for(let i=0;i<3;i++)p(7+i*2,23,-7.1,1,1,.4,7);
  rear(-12,4,7,24,23);return a;
 }
 if(/sealer/.test(key)){
  p(-15,0,-7,30,2,14,0);for(const x of [-14,12])p(x,2,-4,2,11,10,0);
  p(-12,2,5,24,11,1,0);p(-13,2,-6,26,1,11,2);p(-12,6,-6,24,.8,4,1);
  p(-12,11,-3,24,1,7,2);p(-11,12,-1,22,1,4,0);p(-11,13,-2,22,1,6,0);p(-11,14,-1,22,1,4,0);
  p(-10,3.05,-5,20,.1,5,0);p(12,8,-4.15,1.8,2,.3,5);return a;
 }
 if(key==='cafe_register'){
  p(-15,0,-7,30,2,14,1);p(-1,2,.7,2,6,1.5,2);
  screen(-12,6,0,20,8);p(-12,2,-6,20,.4,3.5,2);
  p(9,2,-3,5,4,6,1);p(9.5,6,-2.5,4,.15,4,2);rear(-11,8,.8,18,5);return a;
 }
 if(/terminal/.test(key)){shell();screen(-w/2+2,h*.46,-d/2+.2,w-4,h*.36);p(-3,4,-d/2+.8,6,1,.4,1);return a;}
 if(/register|computer|monitor/.test(key)){
  p(-w/2+1,0,-d/2+1,w-2,1,d-2,1);p(-1,1,1,2,4,2,2);
  screen(-w/2+1,5,-3,w-2,Math.min(10,h-5));rear(-w/2+2,7,-1.8,w-4,6);
  p(-w/2+2,1,-6,w-4,.5,3,2);return a;
 }
 throw new Error('Missing 0.9.0 model '+key);
}
export function split090(cubes,[width,depth,height]){
 const parts=[];
 for(let y=0;y<Math.ceil(height);y++)for(let z=0;z<Math.ceil(depth);z++)for(let x=0;x<Math.ceil(width);x++){
  // Geometry X is mirrored by Bedrock. Ascending authored X already follows
  // the placement grid's westward X; reversing slices mirrors it twice.
  const low=[-width*8+x*16,y*16,-depth*8+z*16],high=low.map(v=>v+16),out=[];
  for(const c of cubes){
   const start=c.origin.map((v,i)=>Math.max(v,low[i])),end=c.origin.map((v,i)=>Math.min(v+c.size[i],high[i]));
   if(end.some((v,i)=>v<=start[i]+.00001))continue;
   const visible=(c.faces??faces).filter(face=>{
    const axis=face==='east'||face==='west'?0:face==='up'||face==='down'?1:2;
    const positive=['east','up','south'].includes(face);
    return Math.abs((positive?end[axis]:start[axis])-(c.origin[axis]+(positive?c.size[axis]:0)))<.00001;
   });
   const uv=Object.fromEntries(Object.entries(c.uv).filter(([face])=>visible.includes(face)).map(([face,map])=>{
    const horizontal=face==='east'||face==='west'?2:0,vertical=face==='up'||face==='down'?2:1;
    const [u,v]=map.uv,[du,dv]=map.uv_size;
    const reversedU=face==='north'||face==='west';
    const uo=reversedU?(c.origin[horizontal]+c.size[horizontal]-end[horizontal])/c.size[horizontal]:(start[horizontal]-c.origin[horizontal])/c.size[horizontal];
    const vo=vertical===1?(c.origin[1]+c.size[1]-end[1])/c.size[1]:face==='up'?(c.origin[2]+c.size[2]-end[2])/c.size[2]:(start[2]-c.origin[2])/c.size[2];
    return [face,{...map,uv:[u+uo*du,v+vo*dv],uv_size:[du*(end[horizontal]-start[horizontal])/c.size[horizontal],dv*(end[vertical]-start[vertical])/c.size[vertical]]}];
   }));
   out.push({...c,faces:visible,uv,origin:start.map((v,i)=>v-low[i]-(i===1?0:8)),size:end.map((v,i)=>v-start[i])});
  }
  parts.push(out);
 }
 return parts;
}

function chinese(im,label,x,y,scale,color){
 chineseLabels[label].forEach((row,dy)=>{for(let dx=0;dx<row.length;dx++)if(row[dx]==='1')rect(im,x+dx*scale,y+dy*scale,scale,scale,color);});
}
export function patch090WallImage(d){
 const im=canvas(d.width*64,d.height*64,[14,25,38,255]);
 if(d.key==='police_warning_light'){rect(im,8,4,im.width/2-10,im.height-8,[226,47,51,255]);rect(im,im.width/2+2,4,im.width/2-10,im.height-8,[42,94,230,255]);return im;}
 if(d.key==='police_reception_sign'){chinese(im,'接待大厅',8,8,2,[234,214,134,255]);return im;}
 const ticker=d.key.includes('ticker'),ad=d.key.startsWith('ad_'),aura=d.key.includes('auramed');
 if(ad){
  rect(im,0,0,im.width,im.height,[232,236,233,255]);
  text(im,aura?'AURAMED':'NOVACARE',10,14,Math.max(2,Math.floor(im.width/70)),aura?[19,117,119,255]:[54,57,61,255]);
  chinese(im,aura?'医疗设备':'医疗器械',Math.floor(im.width/2)-80,Math.floor(im.height*.14),2,aura?[19,117,119,255]:[54,57,61,255]);
  // Actual authored medical models form the poster composition.
  const defs=aura?['auramed_ecmo','auramed_ventilator','auramed_crrt']:['novacare_ecmo','novacare_ventilator','novacare_crrt'];
  for(const [i,key] of defs.entries()){
   const view=renderDetail(patch085Cubes(key),{ware:patch085Texture(key)},Math.floor(im.width/3),Math.floor(im.height*.65),{front:true});
   blit(im,view,i*Math.floor(im.width/3),Math.floor(im.height*.24));
  }
  text(im,'ECMO / VENTILATOR / CRRT',12,im.height-20,1,[26,94,101,255]);return im;
 }
 if(d.key==='finance_report'){
  text(im,'REPORT',4,4,1);
  for(let i=0;i<4;i++){
   text(im,'A'+(i+1),4,18+i*11,1,[181,197,205,255]);
   text(im,(124+i*37)+'.2',29,18+i*11,1,i%2?[78,202,123,255]:[235,94,77,255]);
  }
  return im;
 }
 if(d.key==='police_command_screen'){
  text(im,'POLICE / COMMAND',8,6,1);
  for(let i=0;i<4;i++){
   const x=8+i%2*124,y=22+Math.floor(i/2)*51;
   rect(im,x,y,116,45,[39,56,65,255]);
   text(im,'CAM 0'+(i+1),x+4,y+4,1,[82,201,180,255]);
   rect(im,x+8,y+19,37,23,[59,77,84,255]);rect(im,x+49,y+16,57,26,[71,87,91,255]);
   for(let k=0;k<3;k++)rect(im,x+55+k*16,y+24,11,12,[30,42,50,255]);
  }
  return im;
 }
 text(im,'MARKET / DEMO',8,8,1);
 if(ticker){text(im,im.width<400?'ALPHA +1.28%  BETA -0.34%  GAMMA +2.10%':'ALPHA  +1.28%    BETA  -0.34%    GAMMA  +2.10%',8,28,im.width<400?1:2,[83,211,126,255]);return im;}
 for(let row=0;row<5;row++){
  const y=36+row*Math.floor((im.height-40)/5);
  text(im,['ALPHA','BETA','GAMMA','DELTA','OMEGA'][row],8,y,1);
  text(im,String(1245+row*731)+'.28',Math.floor(im.width*.35),y,1,row%2?[78,202,123,255]:[235,94,77,255]);
 }
 for(let x=Math.floor(im.width*.62);x<im.width-10;x+=5){
  const y=Math.floor(im.height*.6)-Math.round(Math.sin(x*.12)*im.height*.13);
  rect(im,x,y,3,Math.max(3,Math.floor(im.height*.04)),x%3?[64,197,126,255]:[233,89,73,255]);
 }
 return im;
}
