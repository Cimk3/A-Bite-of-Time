import {canvas,rect,text,png} from './art.mjs';
import {pruneFaces} from './detail-art.mjs';

const faces=['north','south','east','west','up','down'];
const rgb=[
 [38,45,53],[62,71,81],[162,173,179],[230,231,221],
 [27,88,134],[34,129,125],[139,83,50],[218,177,106],
 [28,34,41],[195,49,57],[48,135,201],[218,224,92],
 [176,115,58],[110,127,145],[113,69,142],[89,191,200],
];
const tile=index=>[96+8*(index%4),8*Math.floor(index/4)];
const atlas=(origin,size,material_instance='ware')=>({uv:origin,uv_size:size,material_instance});
const glassUV=atlas([96,36],[16,16],'food');
const ui=atlas([0,0],[96,48]);
const keyboard=atlas([0,51],[92,44]);
export const screen096Keys=new Set([
 'macbook_air_m5_open','legion_laptop_open','laboratory_dual_monitor_set','template_ai_triple_monitor_set',
 'transit_ticket_gate','ticket_vending_machine','police_service_terminal','government_service_kiosk',
]);

export function patch096Texture(key){
 const im=canvas(128,128,[28,33,40,255]),mer=canvas(128,128,[0,0,178,255]);
 rgb.forEach((c,i)=>{
  const [x,y]=tile(i);
  for(let dy=0;dy<8;dy++)for(let dx=0;dx<8;dx++){
   const a=(i*3+dx*5+dy*7)%7-3;
   rect(im,x+dx,y+dy,1,1,[...c.map(v=>v+a),255]);
  }
  if([2,13].includes(i))rect(mer,x,y,8,8,[113,0,110,255]);
 });
 rect(im,96,36,16,16,[116,194,217,49]);
 for(const x of [97,98,110])rect(im,x,37,1,13,[176,223,235,91]);
 rect(mer,96,36,16,16,[0,0,68,255]);
 if(key.includes('m5')||key.includes('legion')){
  const mac=key.includes('m5');
  for(let y=0;y<48;y++)for(let x=0;x<96;x++){
   const wave=Math.sin((x-y*1.65)*.052),hf=Math.sin((x+y)*.12),a=Math.round((wave+hf*.18)*26);
   rect(im,x,y,1,1,mac?[108+a,70+a,164+a,255]:[22+Math.round(a*.42),78+a,151+a,255]);
  }
  const bezel=[21,26,42,255];
  rect(im,0,0,96,3,bezel);rect(im,0,46,96,2,bezel);
  rect(im,0,3,3,43,bezel);rect(im,93,3,3,43,bezel);
  rect(im,47,1,2,1,[82,100,124,255]);
  for(let j=0;j<9;j++)rect(im,28+j*4,42,3,3,[111+j*11,161,209-j*9,255]);
 }else if(key.includes('monitor_set')){
  const triple=key.startsWith('template'),n=triple?3:2;
  for(let i=0;i<n;i++){
   const x=96*i/n,w=96/n,c=[[95,209,218,255],[88,146,248,255],[238,175,85,255]][triple?i:i*2];
   rect(im,x,0,w,48,[20,33,50,255]);rect(im,x+2,3,w-4,3,c);
   for(let t=0;t<5;t++)rect(im,x+3+t*4,37-(t*5+i*4)%16,2,7+(t*5+i*4)%16,c);
   for(let t=0;t<4;t++)rect(im,x+3,10+t*4,w-9-(t%2)*5,1,[117,144,159,255]);
   rect(im,x+2,41,w-4,1,[70,108,125,255]);
  }
 }else if(key==='transit_ticket_gate'){
  rect(im,0,0,96,48,[18,42,37,255]);rect(im,37,19,22,22,[85,225,141,255]);
  for(let i=0;i<13;i++)rect(im,35-i,18+i,26+2*i,1,[85,225,141,255]);
 }else if(key==='ticket_vending_machine'){
  rect(im,0,0,96,48,[216,229,236,255]);rect(im,0,0,96,7,[33,86,141,255]);
  text(im,'TICKETS',4,1,1,[240,247,246,255]);
  for(const [i,c] of [[0,[40,132,208,255]],[1,[218,131,55,255]],[2,[65,162,139,255]]]){
   rect(im,7+i*5,13+i*8,40-i*4,2,c);rect(im,38-i*4,13+i*8,2,19-i*4,c);
   for(let j=0;j<3;j++)rect(im,7+i*5+j*11,12+i*8,4,4,c);
  }
  for(let i=0;i<4;i++){rect(im,56,12+i*7,32,5,[52,105,150,255]);rect(im,60,14+i*7,20,1,[202,229,238,255]);}
 }else if(key.endsWith('terminal')||key==='government_service_kiosk'){
  const police=key.startsWith('police'),bg=police?[28,58,102,255]:[23,92,94,255],label=police?'POLICE SERVICES':'CIVIC SERVICES';
  rect(im,0,0,96,48,[29,42,54,255]);rect(im,4,3,88,42,bg);
  rect(im,6,5,84,9,[20,42,56,255]);
  text(im,label,8,6,1,[213,236,233,255]);
  for(let i=0;i<4;i++){
   const x=7+i%2*43,y=16+Math.floor(i/2)*14;
   rect(im,x,y,40,11,police?[51,110,169,255]:[45,148,141,255]);
   rect(im,x+4,y+3,6,6,[218,241,234,255]);rect(im,x+14,y+4,21,2,[202,228,231,255]);
  }
 }
 if(screen096Keys.has(key))rect(mer,0,0,96,48,[0,14,95,255]);
 if(key.includes('m5')||key.includes('legion')){
  rect(mer,0,0,96,3,[0,0,168,255]);rect(mer,0,46,96,2,[0,0,168,255]);
  rect(mer,0,3,3,43,[0,0,168,255]);rect(mer,93,3,3,43,[0,0,168,255]);
 }
 if(key==='police_service_terminal'||key==='government_service_kiosk'){
  rect(mer,0,0,96,3,[0,0,168,255]);rect(mer,0,45,96,3,[0,0,168,255]);
  rect(mer,0,3,4,42,[0,0,168,255]);rect(mer,92,3,4,42,[0,0,168,255]);
 }
 const captions={cafe_espresso_machine:'ESPRESSO',cafe_grinder:'GRINDER',police_water_dispenser:'WATER',police_riot_cabinet:'EQUIPMENT'};
 if(captions[key]){rect(im,0,51,90,14,[39,49,56,255]);text(im,captions[key],4,55,1,[226,230,219,255]);}
 for(const [i,label] of ['VANILLA','CARAMEL','BERRY'].entries()){
  const x=i*30;rect(im,x,70,29,21,[[234,219,174,255],[220,158,79,255],[207,100,92,255]][i]);
  text(im,label,1+x,73,1,[48,38,34,255]);rect(im,x+4,82,20,2,[91,59,50,255]);
 }
 if(key.includes('m5')||key.includes('legion')){
  const dark=key.includes('legion'),width=dark?14:13;
  rect(im,0,51,92,44,[28,33,41,255]);
  for(let row=0;row<5;row++)for(let col=0;col<width;col++){
   if(row===4&&col>=4&&col<=8)continue;
   const x=3+Math.floor(col*86/width),y=54+row*8;
   const fill=dark&&col>=10?[66,128,180,255]:dark&&row===1&&col<5?[80,167,181,255]:[75,85,99,255];
   rect(im,x,y,Math.floor(86/width)-1,6,fill);
   rect(im,x+1,y+1,2,1,[140,151,165,255]);
  }
  rect(im,3+Math.floor(4*86/width),86,Math.floor(5*86/width)-1,6,[75,85,99,255]);
 }
 return {width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}

export function patch096Cubes(key){
 const a=[];
 const insetFinish=key==='police_service_terminal'||key==='government_service_kiosk'||key==='macbook_air_m5_open'||key==='legion_laptop_open';
 const put=(x,y,z,w,h,d,finish=0)=>{
  const origin=finish==='glass'?undefined:tile(finish);
  const map=finish==='glass'?glassUV:insetFinish?atlas(origin.map(v=>v+1),[6,6]):atlas(origin,[8,8]);
  const c={origin:[x,y,z],size:[w,h,d],material:map.material_instance,uv:Object.fromEntries(faces.map(f=>[f,map]))};a.push(c);return c;
 };
 const panel=(x,y,z,w,h,d,finish,face,uv)=>{
  const c=put(x,y,z,w,h,d,finish);c.uv[face]=uv;return c;
 };
 const feet=(w,d,h=.7)=>{for(const x of [-w/2,w/2-1.7])for(const z of [-d/2,d/2-1.7])put(x,0,z,1.7,h,1.7,8);};
 const rear=(x,y,z,w,h,finish=13)=>{
  put(x,y,z,w,h,.2,finish);
  for(let j=0;j<5;j++)put(x+.65,y+.8+j*.66,z+.2,w-1.3,.2,.08,8);
  for(const xx of [x+.25,x+w-.52])for(const yy of [y+.28,y+h-.59])put(xx,yy,z+.2,.26,.26,.08,2);
 };
 const sign=(x,y,z,w,h)=>panel(x,y,z,w,h,.13,0,'north',atlas([0,51],[90,14]));
 const smallCup=(x,y,z,r=1.12,finish=3)=>{
  put(x-r,y,z-r,2*r,.26,2*r,finish);
  for(const xx of [x-r,x+r-.22])put(xx,y+.26,z-r,.22,1.46,2*r,finish);
  for(const zz of [z-r,z+r-.22])put(x-r+.22,y+.26,zz,2*r-.44,1.46,.22,finish);
  put(x+r,y+.68,z-.18,.5,.22,.36,finish);put(x+r+.32,y+.9,z-.18,.18,.42,.36,finish);put(x+r,y+1.32,z-.18,.5,.22,.36,finish);
 };
 if(key==='macbook_air_m5_open'||key==='legion_laptop_open'){
  const dark=key.startsWith('legion'),finish=dark?0:2,deck=dark?1:3,h=dark?1.28:.77;
  feet(13,9,.21);put(-7,.21,-4.68,14,h,10.36,finish);put(-6.83,h+.21,-4.48,13.66,.17,10.02,deck);
  const top=h+.38;panel(-6.35,top,-3.25,12.7,.16,5.2,8,'up',keyboard);
  put(dark?-2.9:-2.78,top,2.09,dark?5.1:5.56,.055,3.08,dark?0:13).tag='trackpad';
  for(const x of [-6.2,3.5])put(x,h+.18,-4.6,2.7,.74,.86,finish).tag='hinge';
  const pivot=[0,h+.8,-4.18],thickness=dark?.53:.34;
  // One continuous front face owns both bezel and active pixels.
  const lid=panel(-6.89,pivot[1]-.16,-4.18-thickness,13.78,8.06,thickness,finish,'south',ui);
  lid.tag='screen';
  for(const x of [-7.05,7])for(const [i,z] of [-2.8,-1.47,.05].entries()){
   put(x,.46,z,.05,.33,.92,dark&&i===0?10:8);
  }
  if(dark)for(let i=0;i<17;i++)put(-6.1+i*.72,.55,-4.75,.35,.46,.07,8);
  else for(let i=0;i<8;i++)put(-3.6+i*.95,.4,-4.73,.42,.16,.05,8);
  return pruneFaces(a);
 }
 if(key==='laboratory_dual_monitor_set'||key==='template_ai_triple_monitor_set'){
  const triple=key.startsWith('template'),count=triple?3:2,part=96/count;
  put(-4,0,-1.7,8,.68,4.45,0);put(-3.25,.68,-1.24,6.5,.22,3.7,1);
  put(-.62,.9,.52,1.24,4.05,1.22,0);put(-.94,3.84,.42,1.88,1.22,1.45,1);
  put(-6.4,4.35,.73,12.8,.64,.72,0);
  for(let i=0;i<count;i++){
   const side=triple?i-1:0,w=triple?(side?4.42:5.41):7.1,x=triple?[-5,0,5][i]:[-3.7,3.7][i],z=-1.18;
   const start=a.length,pivot=[x,0,z+.43];
   put(x-w/2,2.62,z,w,4.95,.73,0);
   panel(x-w/2+.24,2.9,z-.075,w-.48,4.36,.075,8,'north',atlas([i*part,0],[part,48]));
   put(x-w/2+.36,2.77,z-.025,.44,.12,.025,15);
   put(x-.86,4,z+.73,1.72,1.57,.25,13);
   for(const px of [x-.65,x+.46])for(const y of [4.18,5.2])put(px,y,z+.98,.19,.19,.065,2);
   for(let j=0;j<4;j++)put(x-w*.29,6.3+j*.21,z+.73,w*.58,.08,.075,8);
   put(x-.33,4.32,z+.98,.66,.63,1.02,1);
   if(side)for(const c of a.slice(start)){c.rotation=[0,side*11,0];c.pivot=pivot;}
   put(x-.46,4.39,z+1.9,.92,.52,.46,1);
   put(x-.2,3.45,1.15,.17,1.15,.23,8);
   if(x!==0)put(x<0?x-.18:0,3.42,1.14,Math.abs(x)+.18,.19,.2,8);
  }
  for(const x of [-.23,.1])put(x,.89,1.73,.14,2.7,.13,8);
  put(-5.95,0,-6.65,10.45,.39,3.35,0);
  for(let j=0;j<4;j++)for(let i=0;i<12;i++)put(-5.67+i*.83,.39,-6.39+j*.73,.65,.1,.54,13);
  put(5.25,0,-5.91,1.38,.48,1.98,8);put(5.43,.48,-5.76,1.02,.23,1.55,1);
  put(5.86,.71,-5.47,.2,.12,.46,15);
  return a;
 }
 if(key==='transit_ticket_gate'){
  for(const [i,x] of [-7.75,3.6].entries()){
   put(x,0,-6.9,4.15,.72,13.8,8);put(x+.12,.72,-6.69,3.91,10.86,13.38,2);
   put(x+.02,11.58,-6.7,4.11,1.53,13.4,0);
   for(let j=0;j<5;j++)put(x+.1,13.11+j*.23,-4.9+j*.73,3.95,.23,11.5-j*.73,1);
   panel(x+.65,8.3,-6.75,2.85,2.4,.06,8,'north',ui);
   put(x+.85,13.11,-6.5,2.45,.22,1.31,8);put(x+1.26,13.33,-6.21,1.52,.052,.16,15);
   rear(x+.48,2.32,6.69,3.23,6.3);
   const hinge=i===0?x+4.02:x-.32;
   put(hinge,6.4,-.51,.44,4.16,1.01,0);
   put(i===0?-3.32:.18,7.01,-.24,3.14,2.9,.42,'glass');
  }
  return a;
 }
 if(key==='government_service_kiosk'||key==='police_service_terminal'){
  const police=key==='police_service_terminal',accent=police?4:5,skin=police?4:2;
  feet(13.5,11.9);
  put(-7.55,.7,-6.55,15.1,.93,13);
  put(-6.91,1.63,-3.18,13.82,28.2,9.41,skin);
  put(-6.54,1.63,-5.28,13.08,4.37,2.1,accent);
  put(-6.54,6,-5.28,4.65,6.55,2.1,3);
  put(4.12,6,-5.28,2.42,6.55,2.1,3);
  put(-1.89,6,-5.28,6.01,.8,2.1,13);
  put(-1.89,6.8,-3.55,6.01,3.6,.37,8);
  put(-1.89,10.4,-5.28,6.01,2.15,2.1,1);
  put(-5,11.3,-5.53,3.12,.91,.25,8);
  put(-4.61,11.57,-5.66,2.27,.14,.13,15);
  put(-6.48,12.55,-5.24,12.96,12.37,2.06,13);
  put(-6.23,12.8,-5.61,12.46,11.87,.37,8);
  panel(-5.93,13.12,-5.76,11.86,11.23,.15,8,'north',ui).tag='screen';
  put(-6.54,24.92,-5.28,13.08,4.91,2.1,accent);
  for(let i=0;i<4;i++)put(-4.42+i*2.83,27.45,-5.37,1.7,.29,.09,3);
  put(-6.75,29.83,-5.35,13.5,1.25,11.58,3);
  rear(-5.72,6.42,6.23,11.44,17);
  put(3.85,6.92,6.47,.59,3,.25,0);
  return pruneFaces(a);
 }
 if(key==='ticket_vending_machine'){
  const ticket=key.startsWith('ticket'),police=key.startsWith('police'),accent=police?4:ticket?10:5;
  feet(13.5,11.9);put(-7.55,.7,-6.55,15.1,.93,13);
  put(-6.91,1.63,.92,13.82,28.2,5.31,police?4:2);
  for(const x of [-6.91,5.85]){
   put(x,1.63,-5.68,1.06,11.15,6.6,accent);
   put(x,12.78,-.76,1.06,17.05,1.68,accent);
   put(x,ticket?25.12:24.9,ticket?-5.68:-3.84,1.06,ticket?4.71:4.93,ticket?4.92:3.08,accent);
  }
  put(-5.85,1.63,-5.68,11.7,4.4,6.6,police?4:3);
  put(-5.85,6.03,-5.68,4.02,6.75,6.6,3);put(4.55,6.03,-5.68,1.3,6.75,6.6,3);
  put(-1.83,6.03,-5.68,6.38,.86,6.6,13);put(-1.83,10.45,-5.68,6.38,2.33,6.6,1);
  put(-1.83,6.89,-4.28,6.38,3.56,5.2,8);
  if(!ticket){
   put(1.12,6.89,-5.68,.92,3.56,1.4,3);
   put(-.88,8.12,-4.36,1.16,.23,.08,9);
  }
  put(-4.99,11.25,-5.92,3.17,1.16,.24,0);
  put(-4.41,11.56,-6.02,1.99,.11,.10,15);
  put(-6.9,12.78,-5.68,13.8,12.34,5.1,13);
  panel(-5.38,13.46,-5.77,10.76,10.89,.09,8,'north',ui).tag='screen';
  put(-5.85,24.9,ticket?-5.67:-3.58,11.7,4.93,ticket?6.59:4.5,accent);
  for(let i=0;i<4;i++)put(-4.42+i*2.83,27.45,ticket?-5.73:-3.64,1.7,.29,.06,3);
  put(-6.75,29.83,ticket?-5.55:-3.79,13.5,1.25,ticket?11.65:9.89,3);
  rear(-5.72,6.42,6.23,11.44,17);
  put(3.85,6.92,6.43,.59,3,.25,0);
  return a;
 }
 if(key==='cafe_pastry_case'){
  feet(46,14,.52);put(-24,.52,-7.9,48,1.48,15.8,0);
  put(-24,2,-7.9,48,.13,15.8,2);
  put(-23.94,15,-7.72,47.88,1,15.44,13);
  for(const x of [-24,23.05])for(const z of [-7.9,7.05])put(x,2.13,z,.95,28.32,.85,0);
  for(const x of [-24,23.05]){put(x,30.45,-7.9,.95,1.12,15.8,0);put(x+.1,2.13,-7.05,.20,28.32,14.1,'glass');}
  for(const z of [-7.9,7.05])put(-23.05,30.45,z,46.1,1.12,.85,0);
  put(-23.05,30.47,-7.05,46.1,.25,14.1,'glass');
  put(-23.05,2.13,-7.68,46.1,28.32,.22,'glass');
  for(const x of [-23.05,.28]){
   put(x,2.13,7.34,22.77,28.32,.22,'glass');
   put(x+.01,2.13,7.56,.26,28.32,.34,1);
  }
  put(-.28,2.13,7.08,.56,28.32,.82,0);
  for(const x of [-1.19,.65])put(x,12.6,7.29,.48,4.1,.49,2);
  for(const x of [-22.75,21.6])for(const y of [4.1,25.6])put(x,y,7.56,1.08,1.45,.2,13);
  for(let i=0;i<7;i++)put(-21+i*6,.9,-8,4.55,.36,.1,6);
  return a;
 }
 if(key==='cafe_espresso_machine'){
  feet(29,13.5,.76);put(-15.8,.76,-7.5,31.6,2.38,15,0);
  put(-14.7,3.14,3.4,29.4,22.4,4,1);
  for(const x of [-15.8,13.05]){
   put(x,3.14,-6.98,2.75,23.5,10.38,1);
   const xx=x<0?x-.13:x+2.75;
   put(xx,5.45,-6.47,.13,14.5,8.78,6);
   put(xx,21.1,-6.47,.13,4.48,8.78,2);
  }
  put(-13.05,20.7,-6.98,26.1,5.94,10.38,0);
  put(-15.8,26.64,-6.98,31.6,1.32,14.38,13);sign(-6,24.15,-7.11,12,1.4);
  put(-14.6,3.14,-7.54,29.2,.7,10.94,2);
  for(let i=0;i<22;i++)put(-14.1+i*1.26,3.84,-6.97,.45,.095,9.56,8);
  for(const x of [-7.4,6.0]){
   put(x-2.58,18.8,-5.65,5.16,1.9,5.4,2);
   put(x-2.05,17.79,-5.24,4.1,1.01,4.57,13);
   put(x-.57,16.81,-3.75,1.14,.98,1.02,2);
   put(x-.76,18.07,-6.52,1.52,.67,1.3,6);
   for(const xx of [-1.56,.86])put(x+xx,22.32,-7.13,.71,.72,.15,3);
   smallCup(x,3.935,-3.6,1.48);
   smallCup(x,27.96,.62,1.21);
  }
  put(-14.56,27.96,-6.45,1,1.31,12.83,2);put(13.56,27.96,-6.45,1,1.31,12.83,2);
  put(-13.56,28.6,5.76,27.12,.67,.62,2);
  put(-1.27,21.73,-7.28,2.54,2.09,.3,13);put(-.96,22.01,-7.37,1.92,1.53,.09,3);put(-.14,22.54,-7.42,.28,.77,.05,9);
  put(10.9,19.5,-4.65,2.15,1.2,1.65,13);put(11.44,15.4,-4.24,.69,4.1,.71,2);put(11.44,14.95,-5.02,.69,.45,1.49,2);
  rear(-12.43,8.49,7.4,24.86,15.6);
  return a;
 }
 if(key==='cafe_grinder'){
  feet(12.9,12.9);put(-7.03,.7,-6.86,14.06,1.18,13.72,0);
  put(-5.86,1.88,1.54,11.72,16.59,4.76,1);
  put(-5.86,1.88,-1.18,1.06,16.59,2.72,2);put(4.8,1.88,-1.18,1.06,16.59,2.72,6);
  put(-4.8,10.6,-3.86,9.6,7.87,5.4,0);sign(-4.2,16.05,-3.99,8.4,1.2);
  put(-5.18,1.88,-5.91,10.36,.58,7.45,13);
  put(-1.63,9.31,-3.46,3.26,1.29,2.59,2);put(-.67,8.24,-2.95,1.34,1.07,1.29,13);
  smallCup(0,2.46,-3.11,1.43,2);put(-1.13,2.72,-4.24,2.26,1.21,2.26,6);
  put(-1.42,12.33,-4.33,2.84,2.57,.47,2);put(-.99,12.63,-4.51,1.98,2,.18,8);
  for(let j=0;j<4;j++){const w=3.9+j*1.71;put(-w/2,18.47+j*.72,-w/2,w,.72,w,13);}
  put(-5.41,21.35,-5.41,10.82,.84,10.82,2);
  for(const x of [-5.41,5.13])put(x,22.19,-5.41,.28,7.08,10.82,'glass');
  for(const z of [-5.41,5.13])put(-5.13,22.19,z,10.26,7.08,.28,'glass');
  for(let i=0;i<27;i++){
   const x=-4.76+(i%6)*1.6,z=-4.8+Math.floor(i/6)*2.03,h=1.08+(i%4)*.43;
   put(x,22.19,z,1.46,h,1.55,i%3===0?12:6);
   if(i%3===1)put(x+.23,22.19+h,z+.27,1.04,.63,1.02,6);
  }
  put(-5.54,29.27,-5.54,11.08,1.01,11.08,0);put(-1.04,30.28,-.85,2.08,.69,1.7,1);
  rear(-4.95,5.53,6.3,9.9,9.7);
  return a;
 }
 if(key==='cafe_syrup_set'){
  put(-7.57,0,-4.15,15.14,.55,8.3,0);put(-7.27,.55,-3.85,14.54,.48,7.7,6);
  for(const x of [-7.57,7.19])put(x,.55,-4.15,.38,1.13,8.3,2);
  for(const z of [-4.15,3.77])put(-7.19,.55,z,14.38,1.13,.38,13);
  for(const [i,x] of [-4.62,0,4.62].entries()){
   const yy=1.03,finish=[7,12,9][i];
   put(x-1.94,yy,-2.44,3.88,.33,4.88,2);
   put(x-1.73,yy+.33,-2.23,3.46,7.16,4.46,finish);
   for(const xx of [x-1.93,x+1.73])put(xx,yy+.33,-2.44,.2,8,4.88,'glass');
   for(const z of [-2.44,2.24])put(x-1.73,yy+.33,z,3.46,8,.2,'glass');
   put(x-1.73,yy+8.33,-2.24,3.46,.42,4.48,'glass');
   put(x-1.02,yy+8.75,-1.03,2.04,.79,2.06,2);put(x-.42,yy+9.54,-.42,.84,2.05,.84,13);
   put(x-.71,yy+11.59,-1.88,1.42,.55,2.41,2);put(x-.32,yy+11.34,-1.88,.64,.25,.38,13);
   panel(x-1.49,yy+2.62,-2.53,2.98,3.55,.09,3,'north',atlas([i*30,70],[29,21]));
  }
  return a;
 }
 if(key==='police_water_dispenser'){
  feet(13,12.5,.62);put(-7.21,.62,-6.57,14.42,1.22,13.14,13);
  put(-7.05,1.84,1.31,14.1,19.47,5.1,3);
  for(const x of [-7.05,5.8])put(x,1.84,-6.31,1.25,19.47,7.62,3);
  put(-5.8,1.84,-6.31,11.6,4.93,7.62,3);put(-5.8,15.72,-6.31,11.6,5.59,7.62,3);
  put(-5.74,6.77,-6.16,11.48,.54,7.47,13);
  for(let j=0;j<9;j++)put(-5.3+j*1.16,7.31,-5.73,.49,.12,4.7,8);
  sign(-4.53,18.2,-6.44,9.06,1.55);
  for(const [x,color] of [[-3,9],[3,10]]){
   put(x-.9,14.14,-5.11,1.8,1.58,2.96,13);
   put(x-1.12,14.74,-5.42,2.24,.73,.31,color);
   put(x-.44,12.79,-4.61,.88,1.35,1.22,2);
  }
  put(-5.24,21.31,-4.98,10.48,.82,9.96,13);
  put(-3.9,22.13,-3.71,7.8,1.06,7.42,10);
  put(-4.78,23.19,-4.41,9.56,7.33,8.82,10);
  for(const x of [-4.96,4.78])put(x,23.19,-4.59,.18,7.61,9.18,'glass');
  for(const z of [-4.59,4.41])put(-4.78,23.19,z,9.56,7.61,.18,'glass');
  put(-4.78,30.52,-4.41,9.56,.28,8.82,'glass');
  put(-4.11,30.8,-3.94,8.22,.38,7.88,15);
  rear(-5.13,6.56,6.41,10.26,10.4);
  return a;
 }
 if(key==='police_riot_cabinet'){
  feet(31,14.4);put(-16,.7,-7.35,32,1.34,14.7,13);
  put(-16,30,-7.35,32,1.69,14.7,2);put(-15.4,2.04,5.93,30.8,27.96,1.38,1);
  for(const x of [-16,14.92])put(x,2.04,-7.35,1.08,27.96,14.7,2);
  for(const x of [-3.6,3.35])put(x,2.04,-5.5,.86,27.96,11.43,13);
  put(-14.92,27.35,-7.27,29.84,2.65,1.82,13);sign(-13.5,27.76,-7.4,27,1.72);
  put(-14.6,2.04,-6.67,11,2.15,12.6,0);
  put(-13.32,4.19,-4.5,8.4,19.03,1.28,13);
  for(const y of [4.19,21.95])put(-12.26,y,-4.64,6.28,1.17,.21,2);
  for(const x of [-12.21,-6.64])put(x,13.22,-5.47,.75,1.14,1.0,8);
  put(-12.3,13.32,-5.64,6.49,.86,.31,0);
  put(-.54,2.04,-3.01,1.08,19.7,1.02,8);put(-.66,3.36,-3.17,1.32,3.1,1.32,0);
  for(const y of [7.22,15.65]){put(-1.18,y,-2.45,2.36,.64,8.38,13);put(-1.18,y,-3.18,2.36,.64,.73,2);}
  put(4.21,24.1,1.85,10.71,.83,1,2);
  put(9.14,21.63,2.24,.69,2.47,.3,13);put(5.09,20.96,1.28,8.78,.67,1.42,13);
  for(const x of [5.35,11.37])put(x,18.86,.85,2.42,2.72,1.48,11);
  put(5.35,11.65,.85,8.44,7.21,1.48,11);
  for(const y of [13.05,15.05])put(5.35,y,.67,8.44,.78,.18,3);
  put(9.37,11.65,.63,.21,7.21,.22,13);
  for(const x of [-13.5,2.01])rear(x,8.9,7.31,11.49,15.3);
  return a;
 }
 throw Error('Unknown 0.9.6 prop '+key);
}

// Original 0.9.5 selection dimensions. Visual refits do not change hitboxes.
export const legacy096EntityBoxes = {
  "macbook_air_m5_open": {
    "width": 0.8987616369004852,
    "height": 0.5702828498329101
  },
  "legion_laptop_open": {
    "width": 0.8987616369004852,
    "height": 0.5702828498329101
  },
  "laboratory_dual_monitor_set": {
    "width": 0.9525,
    "height": 0.635
  },
  "template_ai_triple_monitor_set": {
    "width": 0.9525,
    "height": 0.635
  },
  "transit_ticket_gate": {
    "width": 0.89,
    "height": 0.7993750000000001
  },
  "ticket_vending_machine": {
    "width": 0.8275,
    "height": 1.885
  },
  "cafe_pastry_case": {
    "width": 3.015,
    "height": 2.01
  },
  "cafe_espresso_machine": {
    "width": 1.89,
    "height": 1.9475
  },
  "cafe_grinder": {
    "width": 0.785,
    "height": 1.91625
  },
  "cafe_syrup_set": {
    "width": 0.89,
    "height": 0.5475
  },
  "police_service_terminal": {
    "width": 0.994375,
    "height": 1.9475
  },
  "police_water_dispenser": {
    "width": 1.015,
    "height": 2.01
  },
  "police_riot_cabinet": {
    "width": 1.89,
    "height": 2.01
  },
  "government_service_kiosk": {
    "width": 0.765,
    "height": 1.885
  }
};
