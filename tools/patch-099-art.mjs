import {canvas,png,rect,text} from './art.mjs';

const sides=['north','south','east','west','up','down'];
const colors=[
 [40,68,53],[55,83,64],[27,47,39],[211,199,169],
 [234,221,191],[168,135,65],[89,105,107],[22,31,30],
 [164,109,57],[189,132,73],[221,174,108],[135,88,48],
 [117,132,135],[189,194,185],[112,75,40],[246,236,207],
];
const role={green:0,edge:1,dark:2,ivory:3,cream:4,brass:5,steel:6,black:7,kraft:8,paper:9,tape:10,seam:11,metal:12,satin:13,crease:14,white:15};
const island=(x,y,w,h)=>({uv:[x,y],uv_size:[w,h],material_instance:'ware'});
const solidUV=index=>island(index%8*16+2,78+Math.floor(index/8)*20,12,12);
const emblem=island(0,0,44,22),screen=island(48,0,38,19),shipping=island(0,28,45,28),handling=island(48,28,33,22);
const doorNumber=i=>island(88+(i%3)*13,Math.floor(i/3)*13,12,12);

function letterImage(image){
 const ink=[238,223,183,255],back=[24,42,35,255];
 rect(image,0,0,44,22,back);rect(image,4,3,36,16,ink);rect(image,6,5,32,12,back);
 for(let i=0;i<15;i++){
  const y=5+Math.floor(i*.52);
  rect(image,6+i,y,2,2,ink);rect(image,36-i,y,2,2,ink);
  if(i<9){rect(image,6+i,16-Math.floor(i*.4),2,1,ink);rect(image,36-i,16-Math.floor(i*.4),2,1,ink);}
 }
}

export function postalTexture(key){
 const color=canvas(128,128,[29,49,42,255]),mer=canvas(128,128,[0,0,180,255]);
 for(const [i,rgb] of colors.entries()){
  const u=i%8*16,v=76+Math.floor(i/8)*20;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
   const fleck=((x*13+y*7+i*5)%11)-5;
   const grain=[3,4,8,9].includes(i)?Math.round(Math.sin(x*.64+y*.24)*4):0;
   rect(color,u+x,v+y,1,1,[...rgb.map(c=>c+fleck+grain),255]);
  }
  const metallic=[5,6,12,13].includes(i);
  rect(mer,u,v,16,16,[metallic?135:0,0,metallic?95:194,255]);
 }
 letterImage(color);
 rect(color,48,0,38,19,[17,36,37,255]);rect(color,50,2,34,15,[30,62,58,255]);
 const light=[164,228,193,255];
 text(color,key==='postal_parcel_scale'?'2.48':'READY',52,5,1,light);
 if(key==='postal_parcel_scale')text(color,'KG',69,11,1,light);
 if(['postal_parcel_scale','postal_parcel_lockers'].includes(key))rect(mer,50,2,34,15,[0,11,116,255]);
 for(let i=0;i<6;i++){
  const [x,y]=doorNumber(i).uv;
  const pale=[1,3,5].includes(i);
  rect(color,x,y,12,12,pale?[208,195,165,255]:[39,65,52,255]);
  text(color,String(i+1).padStart(2,'0'),x+1,y+3,1,pale?[45,63,49,255]:[227,211,168,255]);
 }
 rect(color,0,28,45,28,[236,223,183,255]);
 rect(color,2,30,41,24,[246,235,204,255]);
 for(let i=0;i<11;i++)rect(color,5+i*3,34,i%3===0?2:1,8,[42,42,38,255]);
 for(const [y,w] of [[45,29],[48,17],[51,25]])rect(color,5,y,w,1,[88,78,64,255]);
 rect(color,48,28,33,22,[175,118,64,255]);
 for(const x of [54,67]){
  rect(color,x,38,3,8,[67,49,32,255]);rect(color,x-1,36,5,2,[67,49,32,255]);rect(color,x-2,34,7,2,[67,49,32,255]);
 }
 return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}

export function postalCubes(key){
 const cubes=[];
 const put=(x,y,z,w,h,d,finish,face,graphic)=>{
  const uv=Object.fromEntries(sides.map(side=>[side,solidUV(role[finish])]));
  if(face)uv[face]=graphic;
  cubes.push({origin:[x,y,z],size:[w,h,d],material:'ware',uv});
 };
 const foot=(x,z,w=1.8,d=1.75)=>put(x,0,z,w,1,d,'brass');
 const trim=(x,y,z,w,h,depth=.23)=>put(x,y,z,w,h,depth,'brass');
 const envelope=(x,y,z,w,h)=>put(x,y,z,w,h,.13,'cream','north',emblem);
 const vent=(x,y,z,w)=>{
  put(x,y,z,w,2.4,.22,'steel');
  for(let i=0;i<3;i++)put(x+.45,y+.34+i*.61,z+.22,w-.9,.24,.14,'black');
 };
 if(key==='postal_counter'){
  for(const x of [-23.2,20.8])for(const z of [-7.05,4.95])foot(x,z,2.4,2.05);
  for(const x of [-23.05,13.45]){
   put(x,1,-6.8,9.6,12.25,13.65,'green');
   for(let i=0;i<3;i++){
    const y=1.7+i*3.79;
    put(x+.45,y,6.85,8.7,3.28,.38,'edge');
    trim(x+3,y+1.29,7.23,3.6,.55,.31);
   }
  }
  put(-13.45,1.9,-6.8,26.9,11.35,1.01,'dark');
  put(-20.7,2.6,-7.13,41.4,9.8,.33,'edge');
  put(-19.85,3.16,-7.37,39.7,8.74,.24,'ivory');
  put(-19.45,3.54,-7.5,38.9,7.98,.13,'green');
  envelope(-4.15,5.32,-7.63,8.3,4.24);
  put(-13.45,11.35,-5.79,26.9,1.9,12.64,'green');
  put(-24,13.25,-7.65,48,2.19,15.3,'ivory');
  put(-23.6,15.44,-7.42,47.2,.46,14.84,'cream');
  for(const x of [-22.9,21.43])put(x,15.9,-6.95,1.47,.1,13.9,'cream');
 }else if(key==='postal_sorting_cubbies'){
  for(const x of [-15.7,13.9])for(const z of [-6.8,5.1])foot(x,z);
  put(-15.65,1,-6.8,31.3,2.1,13.8,'green');
  put(-15.65,3.1,5.85,31.3,27.15,1.15,'dark');
  for(const x of [-15.65,14.45])put(x,3.1,-6.8,1.2,27.15,12.65,'green');
  const shelves=[3.1,11.7,20.3,28.9];
  for(const y of shelves.slice(1))put(-14.45,y,-6.8,28.9,1.35,12.65,'edge');
  for(const [row,y] of shelves.slice(0,3).entries()){
   const floor=row===0?y:y+1.35,top=shelves[row+1];
   for(const x of [-7.68,-.46,6.76])put(x,floor,-6.72,.9,top-floor,12.57,'green');
   for(const [col,x] of [-13.7,-6.46,.76,7.98].entries()){
    if((col+row*2)%3===1)continue;
    const stacked=(col+row)%2===1;
    if(stacked){
     for(let i=0;i<3;i++)put(x+i*.1,floor+i*.23,-4.2,4.9-i*.14,.23,4.7,'white');
     put(x+.47,floor+.69,-3.75,4,.055,3.8,'cream','up',shipping);
    }else{
     put(x,floor,-4.85,5.37,1.77,6.15,col%2?'kraft':'edge');
     put(x+.62,floor+.44,-5.03,4.13,.88,.18,'brass');
     put(x+1.34,floor+.57,-5.11,2.72,.62,.08,'ivory');
    }
   }
  }
  put(-16,30.25,-7.13,32,1.66,14.53,'green');
  for(const x of [-15.2,.64]){
   put(x,3.76,7,14.55,24.93,.45,'green');
   put(x+.48,4.3,7.45,13.59,23.83,.16,'edge');
   trim(x+5.72,15.1,7.61,3.1,.64,.19);
   for(const y of [8.1,24.33])trim(x+.23,y,7.45,.58,1.6,.36);
  }
 }else if(key==='postal_parcel_lockers'){
  for(const x of [-23.55,21.6])for(const z of [-7.05,5.15])foot(x,z,1.95,1.95);
  put(-23.55,1,-6.2,47.1,29.46,13.25,'green');
  put(-23.9,30.46,-7.1,47.8,1.47,14.68,'edge');
  for(const x of [-23.9,22.4])put(x,29.76,-7.32,1.5,1.69,.22,'brass');
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const logical=(1-row)*3+col,x=-22.7+col*15.25,y=2.15+row*14.03;
   const light=[1,3,5].includes(logical);
   put(x,y,-6.53,14.85,13.2,.33,'dark');
   put(x+.31,y+.32,-6.88,14.23,12.56,.35,light?'ivory':'edge');
   put(x+5.45,y+9.17,-7.04,3.93,2.31,.16,light?'ivory':'green','north',doorNumber(logical));
   if(logical===4){
    put(x+2.9,y+2.91,-7.05,8.99,5.29,.17,'black','north',screen);
    trim(x+6.98,y+1.46,-7.1,1.41,.75,.22);
   }else{
    trim(x+11.75,y+4.8,-7.13,1.33,2.77,.25);
    put(x+12.03,y+5.25,-7.25,.77,1.88,.12,'black');
    for(const yy of [y+2.25,y+10.11])put(x+.35,yy,-7.1,.7,1.27,.22,'steel');
   }
   if(row===0){
    put(x+.41,3.05,7.05,14.02,25.68,.34,'dark');
    put(x+.8,3.48,7.39,13.24,24.84,.21,'green');
    for(const xx of [x+1.19,x+13.1])for(const yy of [4.08,27.25])put(xx,yy,7.6,.32,.32,.18,'steel');
    vent(x+3.05,6.62,7.6,8.7);
   }
  }
 }else if(key==='postal_square_mailbox'){
  for(const x of [-6.48,4.68])for(const z of [-6.15,4.5])foot(x,z,1.8,1.65);
  put(-6.49,1,-6.13,12.98,11.35,12.31,'green');
  put(-6.82,12.35,-6.41,13.64,1.38,12.87,'edge');
  put(-5.97,13.73,-5.74,11.94,1.04,11.55,'green');
  put(-5.2,14.77,-5,10.4,1.02,10,'green');
  put(-5.28,8.84,-6.51,10.56,2.58,.38,'brass');
  put(-4.84,9.25,-6.65,9.68,1.76,.14,'black');
  envelope(-3.32,3.83,-6.26,6.64,3.62);
  put(-5.23,2.44,6.18,10.46,8.74,.36,'dark');
  put(-4.87,2.78,6.54,9.74,8.05,.23,'edge');
  for(const y of [4.1,8.8])trim(4.06,y,6.77,.73,1.1,.18);
  trim(-1.1,6.08,6.77,.64,.82,.22);
 }else if(key==='postal_cylinder_mailbox'){
  const stepped=(radius,y,h,finish)=>{
   const strip=radius*2/11;
   for(let i=0;i<11;i++){
    const x=-radius+i*strip,mid=x+strip/2;
    const depth=Math.round(Math.sqrt(radius*radius-mid*mid)*4)/4;
    put(x,y,-depth,strip,h,depth*2,finish);
   }
  };
  stepped(5.85,0,1.12,'dark');
  stepped(5.25,1.12,.98,'green');
  stepped(5.45,2.1,.53,'brass');
  stepped(5.12,2.63,8.63,'green');
  stepped(5.36,11.26,.52,'brass');
  stepped(5.1,11.78,1.32,'cream');
  stepped(6.06,13.1,.9,'dark');
  stepped(5.23,14,.66,'edge');
  stepped(4.31,14.66,.63,'green');
  stepped(1.28,15.29,.52,'brass');
  put(-3.62,8.13,-5.58,7.24,2.11,1.76,'edge');
  put(-3.28,8.34,-5.82,6.56,1.68,.24,'brass');
  put(-2.91,8.58,-5.96,5.82,1.2,.14,'black');
  put(-2.62,4.47,-5.36,5.24,3.02,.74,'dark');
  envelope(-2.37,4.69,-5.49,4.74,2.62);
  put(-3.06,3.1,4.32,6.12,7.76,1.17,'dark');
  put(-2.79,3.37,5.49,5.58,7.22,.22,'edge');
  for(const y of [4.28,8.88])trim(2.18,y,5.71,.59,1.11,.2);
  trim(-1.5,5.87,5.71,.72,.95,.23);
  put(-1.26,6.12,5.94,.25,.44,.08,'black');
 }else if(key==='postal_parcel_scale'){
  for(const x of [-6.4,4.74])for(const z of [-5.75,4.23])put(x,0,z,1.66,.41,1.66,'black');
  put(-6.86,.41,-6.11,13.72,2.1,12.22,'green');
  put(-5.98,2.51,-1.86,11.96,.59,7.46,'black');
  put(-6.2,3.1,-2.37,12.4,.62,8.45,'metal');
  put(-6.1,3.72,-2.29,12.2,.32,8.28,'satin');
  put(-5.85,1.22,-6.39,7.46,1.1,.28,'ivory');
  put(-5.57,1.31,-6.52,6.9,.92,.13,'black','north',screen);
  for(const x of [2.52,4.46])put(x,1.4,-6.47,1.42,.83,.36,x>4?'brass':'cream');
  put(-1.2,.89,6.11,2.4,.84,.29,'steel');
 }else{
  const dimensions={postal_parcel_small:[8,2.8,6.2],postal_parcel_medium:[10.3,8.3,8.5],postal_parcel_large:[15.64,6.13,10.7]};
  const [w,h,d]=dimensions[key],x=-w/2,z=-d/2;
  put(x,0,z,w,h,d,'paper');
  put(x+.17,.15,z-.06,w-.34,h-.3,.06,'kraft');
  put(x+.23,.32,-z,w-.46,h-.64,.06,'kraft');
  put(x-.06,.22,z+.23,.06,h-.44,d-.46,'kraft');
  const tapeWidth=w<9?1.15:1.63;
  put(-tapeWidth/2,h,z,tapeWidth,.065,d,'tape');
  put(-tapeWidth/2,h*.55,z-.12,tapeWidth,h*.45,.06,'tape');
  put(-tapeWidth/2,h*.55,-z+.06,tapeWidth,h*.45,.06,'tape');
  put(x+.68,h,z+.57,w*.36,.037,d*.44,'white','up',shipping);
  put(-x-w*.35,.45,z-.14,w*.30,h*.32,.08,'kraft','north',handling);
 }
 return cubes;
}
