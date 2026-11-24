import {readFileSync} from 'node:fs';
import {canvas,png,rect,text} from './art.mjs';
import {mriKey} from '../.build/patch-097-catalog.js';

const faces=['north','south','east','west','up','down'];
const uv=(x,y,w,h)=>({uv:[x,y],uv_size:[w,h],material_instance:'ware'});
const finishes=[
 [232,229,214],[201,204,199],[46,58,64],[29,112,114],
 [77,172,170],[34,41,48],[91,110,119],[112,125,134],
 [28,33,43],[53,60,69],[148,162,168],[104,204,194],
];
const screen=uv(0,0,88,48),led=uv(84,56,8,8);
const finishUV=n=>uv((n%4)*16,72+Math.floor(n/4)*16,16,16);

export function patch097Texture(key){
 const color=canvas(128,128,[25,34,43,255]),mer=canvas(128,128,[0,0,178,255]);
 finishes.forEach((rgb,i)=>{
  const [x,y]=finishUV(i).uv;
  for(let v=0;v<16;v++)for(let u=0;u<16;u++){
   const fleck=(u*31+v*17+i*5)%9-4;
   rect(color,x+u,y+v,1,1,[...rgb.map(c=>c+fleck),255]);
  }
  if([6,7,10].includes(i))rect(mer,x,y,16,16,[110,0,99,255]);
 });
 if(key===mriKey){
  rect(color,0,0,88,48,[13,34,39,255]);
  text(color,'MR',7,5,2,[201,235,224,255]);
  for(let i=0;i<5;i++)rect(color,8+i*14,34-i*4,9,8+i*4,[86,169,171,255]);
 }else{
  for(let y=0;y<48;y++)for(let x=0;x<88;x++){
   const level=Math.floor((x*.44+y)/8)*4;
   rect(color,x,y,1,1,[19,69+level,68+level,255]);
  }
  rect(color,0,42,88,6,[18,35,44,255]);
  for(let i=0;i<4;i++)rect(color,31+i*7,43,4,4,[130+i*11,195,185,255]);
  text(color,'FT',3,43,1,[181,222,213,255]);
 }
 rect(color,84,56,8,8,[115,224,204,255]);
 rect(mer,0,0,88,48,[0,13,97,255]);rect(mer,84,56,8,8,[0,10,108,255]);
 return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}

export function patch097Cubes(key){
 const cubes=[];
 const box=(x,y,z,w,h,d,n=0,front)=>{
  const uvMap=Object.fromEntries(faces.map(face=>[face,finishUV(n)]));
  if(front)uvMap.north=front;
  cubes.push({origin:[x,y,z],size:[w,h,d],material:'ware',uv:uvMap});
 };
 if(key!==mriKey){
  box(-7,0,-6,14,.45,12,5);
  box(-6.8,.45,-5.8,13.6,1.95,11.6,9);
  box(-6.63,2.4,-5.68,13.26,.24,11.36,8);
  box(-4.55,2.64,-4.58,8.45,.28,3.62,5);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++){
   if(row===3&&col>=3&&col<9)continue;
   box(-4.33+col*.68,2.92,-4.35+row*.81,.53,.14,.56,col%11===0?7:9);
  }
  box(-2.29,2.92,-1.92,3.93,.14,.56,7);
  box(-3.05,2.64,1.05,6.1,.4,3.61,5);
  box(-.64,3.04,2.01,1.28,3.05,1.23,9);
  box(-5.98,5.83,1.36,11.96,7.66,.72,8);
  box(-5.65,6.18,1.25,11.3,6.96,.11,5,screen);
  box(-2.71,7.3,2.08,5.42,3.06,.39,9);
  for(let i=0;i<6;i++)box(-4.58+i*.51,11.85,2.08,.33,.62,.065,5);
  for(let i=0;i<5;i++)box(2.12,.8+i*.24,-5.86,3.98,.12,.065,5);
  box(-5.88,1.13,-5.91,.73,.56,.11,5,led);
  for(let i=0;i<3;i++)box(-4.57+i*.8,1.23,-5.88,.53,.32,.08,5);
  for(let i=0;i<4;i++)box(2.71+i*.65,1.19,5.8,.44,.47,.14,i===3?11:5);
  box(4.92,2.64,-2.86,1.05,.29,1.82,8);
  box(5.29,2.93,-2.76,.26,.07,.62,6);
  return cubes;
 }
 // Horizontal bands describe an open stepped annulus. Each band has two
 // independent walls beside the hole. The rear skin repeats that opening.
 const bands=[
  [2,6,19,0],[6,10,22,0],[10,14,23,8],
  [14,18,23.5,12],[18,30,23.5,14],[30,34,23.5,12],
  [34,38,23,8],[38,41,22,0],[41,44,19,0],[44,46.5,15,0],
 ];
 for(const [y,top,outer,inner] of bands){
  if(!inner){
   box(-outer,y,4,outer*2,top-y,25,y===2?3:0);
   continue;
  }
  for(const side of [-1,1]){
   const shellX=side<0?-outer:inner+1.3;
   const liningX=side<0?-inner-1.3:inner;
   box(shellX,y,4,outer-inner-1.3,top-y,25,0);
   box(liningX,y,4.16,1.3,top-y,24.68,2);
  }
 }
 // Liner roof and floor follow the rectangular central span of the bore.
 box(-8.2,9.2,4.2,16.4,.87,24.6,2);
 box(-8.2,37.92,4.2,16.4,.66,24.6,2);
 box(-19.8,0,5.1,39.6,2,23.2,5);
 box(-2.15,46.5,5.9,4.3,.55,21.3,3);
 for(const s of [-1,1]){
  const x=s<0?-23.65:23.5;
  box(x,17.9,7.5,.15,12.2,16.8,1);
  box(x+s*.07,21.9,21,.17,2.8,.48,6);
  for(let n=0;n<5;n++)box(s<0?-22.99:23,10.8+n*.43,17.16,.15,.2,6.2,5);
  for(const y of [12,32.5])for(const z of [7.8,23.5])box(s<0?-23.55:23.5,y,z,.06,.39,.39,7);
  const rearX=s<0?-22:15.8;
  box(rearX,19,29,6.2,10,1.18,1);
  for(let n=0;n<5;n++)box(rearX+.62,20.18+n*1.48,30.18,4.96,.68,.18,5);
  for(const dx of [.25,5.55])for(const y of [19.23,28.33])box(rearX+dx,y,30.18,.35,.35,.18,7);
  box(rearX+.36,6.5,29,5.48,2.78,.42,2);
  for(let n=0;n<3;n++)box(rearX+.85+n*1.48,7.49,29.42,.88,.62,.11,n===2?11:5);
 }
 box(-22,21,2.96,5.9,7.45,1.04,5);
 box(-21.57,23.31,2.87,5.03,4.7,.09,2,screen);
 for(let n=0;n<3;n++)box(-21.39+n*1.45,21.71,2.8,.92,.87,.16,n===2?4:1);
 // Table stays on its own plinth, with rails bridging to the bore floor.
 box(-8.6,0,-30.8,17.2,1.55,30,5);
 box(-7.25,1.55,-29.19,14.5,4.18,28.4,1);
 box(-6.25,5.73,-27.79,12.5,2.67,29.2,0);
 for(const x of [-5.67,4.58]){
  box(x,8.4,-29.1,1.09,.67,40,2);
  box(x+.13,9.07,-28.5,.83,.37,38.8,7);
 }
 box(-7,9.44,-30.6,14,2.03,42.45,0);
 box(-7.27,9.59,-31.3,14.54,2.33,1.28,5);
 box(-5.85,11.47,-29.44,11.7,.8,39.7,3);
 box(-5.44,12.27,-28.82,10.88,.68,38.66,4);
 box(-4.95,12.95,6.75,9.9,.39,2.75,4);
 return cubes;
}

export function patch097FoodContents(shape,{add,disc,ring}){
 const cubes=[];
 if(shape==='hairy_crab'){
  disc(cubes,-.55,1,-.8,2.42,1.77,.48,8,'food',8);
  disc(cubes,-.55,1.48,-.85,2.89,1.91,.62,6,'food',10);
  disc(cubes,-.55,2.1,-.89,2.3,1.53,.37,7,'food',9);
  for(const side of [-1,1]){
   for(let i=0;i<4;i++){
    const z=-2.14+i*.78,x=-.55+side*(2.16+(i===0?-.26:0));
    add(cubes,x-(side<0?1.11:0),1.31,z,1.26,.46,.38,i%2?6:8,'food',[0,side*(26-i*15),0]);
    const end=x+side*.9;
    add(cubes,end-.23,1.08,z+.24,.46,.52,.81,7,'food',[-12,side*21,0]);
   }
   const x=-.55+side*1.65;
   add(cubes,x-.27,1.21,.75,.54,.5,1.12,8,'food',[0,side*23,0]);
   add(cubes,x-.69,1.08,1.36,1.38,.68,.88,6,'food',[0,-side*17,0]);
   for(const dx of [-.46,.19])add(cubes,x+dx,1.09,2.14,.28,.41,.64,11,'food',[0,dx*45,0]);
   add(cubes,-.55+side*.88-.12,1.78,.8,.24,.23,.22,11);
  }
  disc(cubes,2.8,1,2.65,1.32,1.1,.22,4,'food',8);
  ring(cubes,2.8,1.19,2.65,1.22,1,.37,.17,4,'food',10);
  disc(cubes,2.8,1.21,2.65,1.1,.89,.1,11,'food',8);
  for(let n=0;n<3;n++)add(cubes,2.4+n*.23,1.31,2.21+n*.17,.1,.075,.54,10,'food',[0,20+n*18,0]);
 }else if(shape==='braised_goose'){
  disc(cubes,0,1,0,4.47,3,.14,11,'food',12);
  for(let i=0;i<8;i++){
   const x=-3.42+i*.81,z=Math.sin(i*.55)*.32,top=1.94+Math.sin((i+1)*.35)*.46;
   add(cubes,x,1.14,z-1.57,.74,top-1.14,3.14,8,'food',[0,8-i*2,0]);
   add(cubes,x-.043,top,z-1.53,.826,.28,3.06,6,'food',[0,8-i*2,0]);
   add(cubes,x+.06,1.4,z-1.65,.59,.28,.1,7,'food',[0,8-i*2,0]);
  }
  for(let i=0;i<6;i++)add(cubes,-1.29+i*.49,2.67,-.54+(i%3)*.44,.58,.12,.34,9,'food',[0,14-i*21,0]);
 }else if(shape==='oyster_omelette'){
  disc(cubes,0,1,0,4.5,4.38,.34,6,'food',12);
  disc(cubes,0,1.34,0,4.17,4.07,.3,7,'food',12);
  for(let i=0;i<28;i++){
   const t=i*2*Math.PI/28;
   add(cubes,Math.cos(t)*4.24-.32,1.16+(i%4)*.086,Math.sin(t)*4.12-.37,.64,.26,.74,i%3?6:7,'food',[0,-t*180/Math.PI,0]);
  }
  for(const [x,z] of [[-.4,.1],[-2.25,-1.57],[1.51,-2.08],[2.6,.42],[1.18,2.34],[-1.86,2.18]]){
   disc(cubes,x,1.61,z,.67,.54,.19,5,'food',5);
   disc(cubes,x+.08,1.8,z-.07,.49,.37,.19,8,'food',5);
  }
  for(let i=0;i<13;i++)add(cubes,Math.sin(i*2.4)*(1.2+i*.18),1.64,Math.cos(i*2.4)*(1.2+i*.18),.23,.13,.35,9,'food',[0,i*28,0]);
 }else if(shape==='ginkgo_taro'){
  for(let i=0;i<5;i++)disc(cubes,0,4+i*.26,0,3.74-i*.36,3.68-i*.36,.26,i===4?7:6,'food',12);
  for(const [x,z] of [[0,0],[-1.53,-.79],[1.42,-.65],[.31,-1.55],[-.96,1.21],[1.13,1.03]]){
   disc(cubes,x,5.3,z,.52,.38,.23,8,'food',5);
   add(cubes,x-.26,5.53,z-.16,.53,.105,.32,10,'food',[0,x*39,0]);
  }
 }else return undefined;
 return cubes;
}

const gymTitle=JSON.parse(readFileSync(new URL('../assets/concepts/097/gym-title-bitmap.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
function stroke(image,x0,y0,x1,y1,weight,color){
 const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);
 for(let i=0;i<=steps;i++)rect(image,Math.round(x0+(x1-x0)*i/steps),Math.round(y0+(y1-y0)*i/steps),weight,weight,color);
}
function polygon(image,points,color){
 for(let y=0;y<image.height;y++){
  const xs=points.flatMap(([a,b],i)=>{
   const [c,d]=points[(i+1)%points.length];
   return (b<=y&&d>y)||(d<=y&&b>y)?[a+(c-a)*(y-b)/(d-b)]:[];
  }).sort((a,b)=>a-b);
  for(let i=0;i<xs.length;i+=2)rect(image,Math.ceil(xs[i]),y,Math.ceil(xs[i+1])-Math.ceil(xs[i]),1,color);
 }
}
export function gymPoster(){
 const navy=[11,22,45,255],lime=[173,226,37,255],white=[223,243,249,255],steel=[46,65,88,255];
 const image=canvas(256,128,navy);
 polygon(image,[[2,125],[99,47],[173,47],[254,18],[254,45],[173,127]],lime);
 polygon(image,[[0,26],[31,0],[42,0],[0,38]],lime);
 polygon(image,[[209,128],[256,80],[256,88],[216,128]],lime);
 for(const [y,row] of gymTitle.entries())for(let x=0;x<row.length;x++)if(row[x]==='1')rect(image,48+x,8+y,1,1,white);
 polygon(image,[[116,47],[124,43],[136,46],[140,54],[136,64],[147,66],[151,75],[145,91],[156,90],[168,100],[166,111],[154,121],[140,121],[145,111],[151,105],[143,103],[138,111],[118,111],[111,104],[105,104],[110,115],[103,121],[90,121],[96,111],[89,101],[96,92],[111,90],[106,74],[112,66],[120,64],[116,57]],navy);
 stroke(image,69,68,185,68,4,navy);
 for(const [left,right] of [[81,111],[164,140]]){
  stroke(image,left,69,left<128?89:156,83,7,navy);
  stroke(image,left<128?89:156,83,right,73,8,navy);
 }
 for(const x of [62,67,178,185]){
  rect(image,x,59,5,23,navy);
  rect(image,x+1,61,2,19,steel);
 }
 rect(image,6,119,34,2,white);rect(image,219,7,27,2,white);
 return image;
}
