/** 0.3.0: modeled tableware, separate material slots and painted UV islands. */
import {foods, dishes, vessels, vesselByKey} from '../.build/catalog.js';
import {foodModel as legacyFood, vesselModel as legacyVessel, box, palette, png, canvas} from './art.mjs';
import {banquetContents,bottleCubes as makeBottle} from './banquet-art.mjs';
import {restaurantContents} from './restaurant-art.mjs';
import {fineDiningContents} from './fine-dining-art.mjs';
const RAD=Math.PI/180;
export const DETAIL=128;
const cube=(x,y,z,w,h,d,color=6,material='food',rotation)=>({origin:[x,y,z],size:[w,h,d],color,material,...(rotation?{rotation,pivot:[x+w/2,y+h/2,z+d/2]}:{})});
const add=(a,...args)=>a.push(cube(...args));
export function disc(a,x,y,z,rx,rz,h,color=6,material='food',steps=10){
  const width=2*rx/steps;
  for(let i=0;i<steps;i++){const xx=-rx+(i+.5)*width,zz=rz*Math.sqrt(Math.max(0,1-(xx/rx)**2));add(a,x+xx-width/2,y,z-zz,width,h,zz*2,color,material);}
}
export function ring(a,x,y,z,rx,rz,h,t,color=6,material='food',segments=16,tilt=0){
  for(let i=0;i<segments;i++){
    const angle=i*2*Math.PI/segments,cx=x+rx*Math.sin(angle),cz=z+rz*Math.cos(angle);
    const length=Math.hypot(rx*Math.cos(angle),rz*Math.sin(angle))*2*Math.PI/segments+.04;
    const yaw=Math.atan2(rz*Math.sin(angle),rx*Math.cos(angle))/RAD;
    add(a,cx-length/2,y,cz-t/2,length,h,t,color,material,[tilt,yaw,0]);
  }
}
function ellipsoid(a,x,y,z,rx,ry,rz,c=6,material='food',layers=5,strips=7){
  for(let j=0;j<layers;j++){const yy=-ry+(j+.5)*2*ry/layers,f=Math.sqrt(1-(yy/ry)**2);disc(a,x,y+yy+ry,z,rx*f,rz*f,2*ry/layers,c,material,strips);}
}
function soften(c){
  const [x,y,z]=c.origin,[w,h,d]=c.size,e=Math.min(.22,w*.15,h*.15,d*.15);
  if(Math.min(w,h,d)<.45||c.rotation)return[c];
  return [cube(x+e,y,z,w-2*e,h,d,c.color,c.material),cube(x,y+e,z+e,w,Math.max(.05,h-2*e),d-2*e,c.color,c.material)];
}
export function vesselCubes(key){
  const v=vesselByKey.get(key),a=[];if(!v)throw new Error(`Unknown vessel ${key}`);
  const r=v.radiusX,s=v.radiusZ,h=v.height,mat='ware';
  if(v.family==='plate'){
    disc(a,0,.28,0,r-.4,s-.4,.28,0,mat,12);
    ring(a,0,.55,0,r-.18,s-.18,.4,.35,1,mat);
    ring(a,0,.95,0,r-.12,s-.12,.13,.18,v.theme==='black_gold'?3:1,mat);
    ring(a,0,0,0,r*.43,s*.43,.3,.3,0,mat,12);
    disc(a,0,.56,0,r-.85,s-.85,.15,4,mat,10);
  }else if(v.family==='bowl'){
    ring(a,0,0,0,r*.43,s*.43,.55,.3,0,mat,12);
    disc(a,0,.5,0,r*.67,s*.67,.25,0,mat,9);
    const step=(h-.9)/2,tilt=Math.atan2(r*.16,step)/RAD,wallHeight=step/Math.cos(tilt*RAD)+.08;
    for(let j=0;j<2;j++)ring(a,0,.72+j*step-(wallHeight-step)/2,0,r*(.72+j*.16),s*(.72+j*.16),wallHeight,.32,0,mat,16,tilt);
    ring(a,0,h-.3,0,r-.18,s-.18,.3,.3,1,mat);
    ring(a,0,h-.07,0,r-.1,s-.1,.1,.17,v.theme==='black_gold'?3:1,mat);
    disc(a,0,.77,0,r*.66,s*.66,.12,4,mat,9);
  }else if(v.family==='wine_glass'){
    disc(a,0,.05,0,2.3,2.3,.22,12,mat,10);add(a,-.15,.27,-.15,.3,4.1,.3,12,mat);
    disc(a,0,4.3,0,.72,.72,.15,12,mat,7);
    for(let j=0;j<3;j++)ring(a,0,4.5+j*1.7,0,.65+j*.48,.65+j*.48,.12,.12,12,mat,16);
    ring(a,0,h-.15,0,2.1,2.1,.16,.12,12,mat,16);
    for(let i=0;i<8;i++)for(let j=0;j<3;j++){const t=i*Math.PI/4,r=.65+j*.48,length=Math.hypot(1.7,.48)+.06;add(a,Math.sin(t)*(r+.24)-.05,4.5+(j+.5)*1.7-length/2,Math.cos(t)*(r+.24)-.05,.1,length,.1,12,mat,[Math.atan2(.48,1.7)/RAD,t/RAD,0]);}
  }else if(v.family==='glass'){
    disc(a,0,.05,0,r,s,.25,12,mat,9);
    ring(a,0,h-.18,0,r-.12,s-.12,.18,.17,12,mat);
    ring(a,0,.3,0,r-.12,s-.12,.15,.16,12,mat);
    for(let i=0;i<8;i++){const t=i*Math.PI/4;add(a,Math.sin(t)*(r-.16)-.065,.45,Math.cos(t)*(s-.16)-.065,.13,h-.65,.13,12,mat);}
  }else{
    disc(a,0,0,0,r*.9,s*.9,.5,2,mat,10);
    ring(a,0,.45,0,r-.15,s-.15,h-.6,.3,2,mat);
    ring(a,0,h-.15,0,r-.12,s-.12,.18,.25,4,mat);
    // Rounded handle in a vertical plane, attached at two real joins.
    for(let i=0;i<10;i++){const t=(-110+i*220/9)*RAD,cy=h*.5+Math.sin(t)*h*.3,cx=r+.65+Math.cos(t)*1.05;add(a,cx-.22,cy-.28,-.28,.44,.62,.56,2,mat,[0,0,-t/RAD]);}
  }
  return a;
}
export function cutleryCubes(key){
  const a=[],m='ware';
  if(key==='chopsticks'){
    for(const x of[-1.25,1.25])for(let i=0;i<6;i++)add(a,x-.24+i*.015,.12,-5.7+i*1.9,.48-i*.04,.38-i*.025,1.95,2,m,[0,x<0?-2:2,0]);
    for(const x of[-1.25,1.25])for(let i=0;i<3;i++)add(a,x-.25,.48,-4.8+i*.6,.5,.05,.17,1,m);
  }else if(key==='table_knife'){
    for(let i=0;i<4;i++)add(a,-.52+i*.025,.12,-5.8+i*1.15,1.04-i*.05,.45,1.2,2,m);
    add(a,-.46,.12,-1.3,.92,.3,6.6,3,m);add(a,.45,.15,-.7,.5,.18,5.4,3,m);
    for(let i=0;i<10;i++)add(a,.77,.18,-.3+i*.48,.18,.1,.18,3,m);
  }else if(key==='fork'){
    add(a,-.35,.12,-5.8,.7,.4,7,3,m);add(a,-1.3,.15,1.2,2.6,.35,1.3,3,m);
    for(let i=0;i<4;i++)for(let j=0;j<3;j++)add(a,-1.3+i*.75,.15+j*.045,2.3+j, .3-j*.045,.3-j*.04,1.05,3,m);
  }else{
    add(a,-.3,.12,-5.7,.6,.35,7,3,m);disc(a,0,.15,3.1,1.6,2,.2,3,m,10);
    ring(a,0,.35,3.1,1.48,1.88,.22,.2,3,m,16);disc(a,0,.36,3.1,1.15,1.5,.04,12,m,8);
  }
  return a;
}
function garnish(a,y,seed=0,n=7){
  for(let i=0;i<n;i++){const t=(i*137.5+seed)*RAD,r=1.2+(i%3)*.7;add(a,Math.sin(t)*r,y+(i%2)*.05,Math.cos(t)*r,.22,.13,.6,i%3===0?4:9,'food',[0,i*27,0]);}
}
function noodles(a,y,role=6,loops=3){
  for(let k=0;k<loops;k++)ring(a,0,y+k*.12,0,1.2+k*.8,1+k*.65,.18,.23,role,'food',14);
}
function poultry(a,goose){
  ellipsoid(a,-.4,1.05,0,3.5,2,2.55,6,'food',5,8);
  for(const side of[-1,1]){
    ellipsoid(a,1.6,1.1,side*2.1,1.5,.75,.9,7,'food',3,5);
    add(a,2.3,1.4,side*2.6,1.5,.45,.5,7,'food',[0,side*20,0]);
    add(a,-2.3,2,side*2.05,3,.5,1.35,6,'food',[0,side*18,side*12]);
  }
  // A visible neck/head differentiates the goose from chicken or sliced duck.
  ellipsoid(a,-3.7,2.5,0, .65,goose?1.7:1.1,.65,6,'food',5,4);
  ellipsoid(a,-4,goose?5:3.9,0,.8,.6,.75,7,'food',3,5);
  add(a,-5.1,goose?5.5:4.4,-.35,.8,.25,.7,10);add(a,-4.5,goose?6:4.9,.52,.16,.14,.1,5);
  for(let i=0;i<5;i++)add(a,-2.6+i,5.04,-.8,.4,.06,.18,8);
}
function detailedContents(f){
  if(f.key==='tieguanyin'){
    const tea=[];disc(tea,0,.8,0,2.25,2.25,5.45,6,'food',12);
    for(let i=0;i<3;i++)tea.push(cube(-.9+i*.85,6.29,-.3+i*.2,.65,.055,.22,9,'food',[0,i*28,0]));
    return tea;
  }
  const fineDining=fineDiningContents(f,{cube,disc,ring,ellipsoid,garnish});
  if(fineDining)return fineDining;
  const restaurant=restaurantContents(f,{cube,disc,ring,ellipsoid,garnish});
  if(restaurant)return restaurant;
  const banquet=banquetContents(f,{cube,disc,ring,ellipsoid,garnish,noodles});
  if(banquet)return banquet;
  const a=[],y=vesselByKey.get(f.vessel).family==='bowl'?4:1;
  const put=(...args)=>add(a,...args);
  switch(f.shape){
    case 'rice':
      disc(a,0,y,0,3.8,3.8,.65,6);ellipsoid(a,0,y+.65,0,3.3,.65,3.3,6,'food',3,6);
      for(let i=0;i<17;i++){const t=i*2.4,r=1+(i%3)*.75;put(Math.sin(t)*r,y+1.75,Math.cos(t)*r,.35,.17,.6,i%3===0?7:4,'food',[0,i*17,0]);}garnish(a,y+1.95,3,10);break;
    case 'roast':
      ellipsoid(a,0,1,0,3.1,1.8,2.4,6,'food',5,7);
      for(const side of[-1,1]){ellipsoid(a,1.5,1,side*2,1.2,.7,1,7,'food',3,5);put(2.1,1.5,side*2.5,1.6,.5,.45,7,'food',[0,side*20,0]);put(3.2,1.6,side*2.9,.8,.22,.3,4,'food',[0,side*20,0]);put(-2.6,1.5,side*1.85,2.6,.6,1.1,6,'food',[0,side*25,side*10]);}
      for(let i=0;i<3;i++)put(-3+i*1.7,1,2.4,1.2,.7,1.3,10);garnish(a,1.15,8,7);break;
    case 'meatballs':
      disc(a,0,y,0,3.8,3.8,.25,7);
      for(const[x,z]of[[-1.8,-1.4],[1.8,-1.3],[0,2]])ellipsoid(a,x,y+.2,z,1.65,1.25,1.65,6,'food',4,5);
      garnish(a,y+2.8,3,9);break;
    case 'pudding':
      for(let i=0;i<3;i++)disc(a,0,y+i*.85,0,3-i*.35,3-i*.35,.87,6,'food',12);
      disc(a,0,y+2.6,0,2.35,2.35,.18,7,'food',12);ellipsoid(a,.3,y+2.8,.1,.6,.3,.6,8,'food',3,4);break;
    case 'ice_cream':
      ellipsoid(a,-1.5,y,-.8,1.8,1.45,1.8,6,'food',4,5);ellipsoid(a,1.5,y,-.5,1.8,1.45,1.8,7,'food',4,5);ellipsoid(a,0,y+1.8,1,1.8,1.4,1.8,6,'food',4,5);
      put(.4,y+4.3,-1.1,.65,1.7,.65,8,'food',[0,12,-12]);break;
    case 'fries':
      for(let i=0;i<18;i++){const c=cube(-3.8+(i%7)*1.05,1+Math.floor(i/7)*.42,-3.4+(i%3)*.6,.55,.5,4.8+(i%3)*.5,i%3===0?8:i%2?7:6,'food',[0,(i%4-1.5)*6,0]);a.push(...soften(c));}break;
    case 'goose':poultry(a,true);garnish(a,1.2,5);break;
    case 'peking_duck':
      for(let i=0;i<7;i++){put(-4+i*.95,1.1+i*.12,-2.5+(i%2)*.2,1.4,.4,3.8,7,'food',[0,-18,0]);put(-4+i*.95,1.52+i*.12,-2.5+(i%2)*.2,1.4,.13,3.8,6,'food',[0,-18,0]);}
      for(let i=0;i<3;i++)disc(a,-2.5+i*.2,1+i*.18,2.4,1.45,1.25,.16,4,'food',8);
      for(let i=0;i<4;i++)put(.5+i*.6,1.3,2,.25,.3,2.4,9,'food',[0,-12,0]);break;
    case 'rice_rolls':
      for(let i=0;i<3;i++){ellipsoid(a,-2.8+i*2.8,1,-.2,1.1,.65,3.1,6,'food',3,5);put(-3.3+i*2.8,1.25,2.8,1,.55,.2,7);for(let j=0;j<3;j++)put(-3.65+i*2.8+j*.6,2.28,-2.7,.06,.04,4.9,4);}
      garnish(a,2.4,0,5);break;
    case 'dongpo':
      for(const c of[box(-2.8,1,-2.8,5.6,3.8,5.6,6),box(-2.8,2,-2.8,5.6,.7,5.6,7),box(-2.8,3.2,-2.8,5.6,.5,5.6,7)])a.push(...soften({...c,material:'food'}));
      put(-2.6,4.8,-2.6,5.2,.2,5.2,6);put(-.18,5.01,-2.9,.36,.11,5.8,9);put(-2.9,5.01,-.18,5.8,.11,.36,9);garnish(a,1.1,7,6);break;
    case 'buddha':
      disc(a,0,y,0,3.7,3.7,.25,6);
      for(let i=0;i<4;i++){const t=i*Math.PI/2;ellipsoid(a,Math.sin(t)*2.4,y+.2,Math.cos(t)*2.4,1,.45,1.3,7,'food',3,4);}
      for(let i=0;i<3;i++)put(-2+i*1.6,y+.4,-.5,.65,.8,1.8,8,'food',[0,i*24,0]);
      ring(a,-.8,y+.65,.5,.65,1,.3,.25,7,'food',10);ring(a,1,y+.75,.5,.65,1,.3,.25,7,'food',10);garnish(a,y+1.3,3,8);break;
    case 'bourguignon':
      disc(a,0,y,0,3.8,3.8,.35,6);
      for(let i=0;i<6;i++)a.push(...soften(cube((i%3)*2.1-3,y+.35,Math.floor(i/3)*3-2,1.9,1.4,2,6)));
      for(let i=0;i<4;i++)ellipsoid(a,-2.5+i*1.6,y+.55,2.2,.6,.45,.6,i%2?7:4,'food',3,4);garnish(a,y+1.9);break;
    case 'onion_soup':
      disc(a,0,y,0,3.8,3.8,.25,6);disc(a,0,y+.25,0,3.1,3.1,.35,10);
      disc(a,0,y+.6,0,3.3,3.3,.22,7);
      for(let i=0;i<10;i++){const t=i*2.4;put(Math.sin(t)*(1+i%3),y+.84,Math.cos(t)*2,.5,.08,.35,8);}
      garnish(a,y+.95,2,5);break;
    case 'sushi':
      for(let i=0;i<4;i++){const x=(i%2)*4-3.5,z=Math.floor(i/2)*3.5-2.8;ellipsoid(a,x+.9,1,z+.9,1.25,.55,1.35,7,'food',3,5);put(x-.2,2.1,z-.2,2.3,.35,2.3,i%2?8:6);}
      for(let i=0;i<2;i++){disc(a,3.8,1+i*.04,-2+i*3.5,1,1,1.3,8,'food',6);disc(a,3.8,2.31+i*.04,-2+i*3.5,.72,.72,.06,7,'food',6);put(3.5,2.4,-2.3+i*3.5,.6,.15,.6,6);}break;
    case 'sashimi':
      for(let i=0;i<8;i++){const x=(i%4)*1.6-3.5,z=Math.floor(i/4)*3-2.3;put(x,1+i%2*.15,z,1.45,1,2.6,i<4?6:7,'food',[0,-18,0]);for(let j=0;j<3;j++)put(x+.15+j*.38,2.03+i%2*.15,z+.1,.055,.03,2.3,4,'food',[0,-18,0]);}
      garnish(a,1.1,20,6);break;
    case 'tempura':
      for(let i=0;i<4;i++){const x=-3+i*1.8;put(x,1.15+i*.15,-2,1.15,1.1,4.8,6,'food',[0,-14+i*9,0]);put(x+.2,1.1,2.4,.8,.2,1,7,'food',[0,25,0]);for(let j=0;j<4;j++)put(x-.13,2.2+i*.15,-1.8+j*1.1,1.4,.22,.45,4);}
      ellipsoid(a,2.5,1,0,1.1,.8,2,8,'food',4,5);break;
    case 'ramen':
      disc(a,0,y,0,3.8,3.8,.3,6);noodles(a,y+.35,10,3);
      for(const x of[-2.2,1.8]){ellipsoid(a,x,y+.7,-1.5,1.35,.35,1.35,7,'food',3,5);ring(a,x,y+1.4,-1.5,.8,.8,.08,.15,4,'food',10);}
      disc(a,-1.8,y+.6,1.5,1.1,1.25,.45,4,'food',8);disc(a,-1.8,y+1.06,1.5,.5,.6,.06,10,'food',7);
      put(1.5,y+.3,1.8,1.8,2,.18,8,'food',[0,-20,-15]);garnish(a,y+1.4,4,8);break;
    case 'unagi':
      disc(a,0,y,0,3.7,3.7,.4,7);for(let i=0;i<6;i++){put(-3+i, y+.4,-2.6,.85,.65,5.2,6);for(let j=0;j<3;j++)put(-3+i,y+1.08,-2+j*1.6,.85,.06,.12,5);}garnish(a,y+1.2);break;
    case 'okonomiyaki':
      disc(a,0,1,0,4.2,4.2,1.1,6);disc(a,0,2.1,0,4,4,.15,7);
      for(let i=0;i<7;i++)put(-3+i,2.28,-Math.sqrt(16-(-3+i)**2),.14,.07,Math.sqrt(16-(-3+i)**2)*2,8);
      for(let i=0;i<6;i++)put(-3.5,2.38,-2.5+i,7,.06,.12,4);garnish(a,2.5,3,14);break;
    case 'raw_lamb':case 'raw_beef':case 'cooked_lamb':case 'cooked_beef':
      for(let i=0;i<8;i++){const x=(i%4)*1.8-3.6,z=Math.floor(i/4)*3.6-3;ring(a,x+.7,1,z+1.3,.55,1.2, .6,.35,6,'food',8);put(x+.4,1.62,z+.4,.12,.04,1.8,7);put(x-.05,1.67,z+.8,1.3,.04,.12,7);}
      if(f.edible)garnish(a,1.8);break;
    case 'tripe':
      for(let i=0;i<6;i++){put((i%3)*2.4-3.5,1,Math.floor(i/3)*3-2.6,2.2,.25,2.7,6,'food',[0,i*4,0]);for(let j=0;j<5;j++)put((i%3)*2.4-3.35+j*.4,1.3,Math.floor(i/3)*3-2.6,.14,.45,2.6,7);}break;
    case 'frozen_tofu':
      for(let i=0;i<6;i++){const x=(i%3)*2.6-3.7,z=Math.floor(i/3)*3.5-3;a.push(...soften(cube(x,1,z,2.2,1.8,2.6,6)));for(let j=0;j<4;j++)put(x+.4+(j%2)*.9,2.81,z+.5+Math.floor(j/2)*1.2,.3,.03,.4,7);}break;
    case 'mushrooms':
      for(let i=0;i<5;i++){const x=(i%3)*2.5-3,z=Math.floor(i/3)*3.4-2;put(x-.2,1,z-.2,.4,1.5,.4,7);ellipsoid(a,x,2,z,1.2,.55,1.2,6,'food',3,5);put(x-.6,3.1,z-.07,1.2,.03,.14,4);}
      for(let i=0;i<8;i++)put(2+i*.16,1,-3,.1,.3,5.5,7,'food',[0,i-3,0]);break;
    case 'greens':
      for(let i=0;i<8;i++){const x=(i%4)*1.7-3.5,z=Math.floor(i/4)*3.6-2.8;put(x+.5,1,z,.32,.3,3.2,8,'food',[0,i*2,0]);ellipsoid(a,x+.6,1.4,z+2, .75,.3,1.4,i%2?6:7,'food',3,4);}break;
    case 'vermicelli':noodles(a,1.1,6,4);noodles(a,1.7,7,3);break;
    case 'sesame':disc(a,0,4,0,3.5,3.5,.25,6);garnish(a,4.3,4,16);break;
    case 'tarts':
      for(const[x,z]of[[-2.5,-1.8],[2.2,-1.5],[0,2.5]]){disc(a,x,1,z,1.65,1.65,.55,10,'food',8);ring(a,x,1.4,z,1.55,1.55,.8,.3,6,'food',12);ring(a,x,2.1,z,1.58,1.58,.18,.25,8,'food',12);disc(a,x,1.95,z,1.25,1.25,.22,7,'food',9);put(x-.3,2.18,z-.2,.4,.025,.3,8);}break;
    case 'dumpling':
      for(let i=0;i<5;i++){const x=(i%3)*3.1-3.4,z=Math.floor(i/3)*3.7-2.3;ellipsoid(a,x,1,z,1.3,.8,.9,6,'food',3,5);for(let j=0;j<5;j++)put(x-1+j*.45,2.25,z-.15,.16,.35,.6,7,'food',[0,0,(j-2)*10]);}break;
    case 'buns':
      for(const[x,z]of[[-2.3,-1.8],[2.1,-1.6],[0,2.4]]){ellipsoid(a,x,1,z,1.8,1.25,1.8,6,'food',4,6);ring(a,x,3.2,z,.55,.55,.2,.18,7,'food',10);}break;
    default:{
      const legacy=legacyFood(f).slice(legacyVessel(f.vessel).length);
      for(const c of legacy){
        const q={...c,material:'food'};
        if(f.vessel==='bowl'&&c.size[0]>7&&c.size[2]>7&&c.size[1]<1){disc(a,0,c.origin[1],0,c.size[0]/2,c.size[2]/2,c.size[1],c.color);}
        else a.push(...soften(q));
      }
      if(['noodle','shreds','fine_soup','pasta'].includes(f.shape))noodles(a,y+.7,6,2);
      if(!['tea','coffee','milk_tea','shake','juice','chocolate','layer_cake','choc_cake','cheesecake','donut','cookies'].includes(f.shape))garnish(a,y+1.4,f.key.length,5);
    }
  }
  return a;
}
export function foodCubes(food,vesselKey=food.vessel){
  const v=vesselByKey.get(vesselKey),family=v.family,base=vesselByKey.get(food.vessel),raw=detailedContents(food);
  const isCup=family==='glass'||family==='mug'||family==='wine_glass',canonicalY=base.family==='bowl'?4:1;
  if(isCup){
    const bottom=family==='wine_glass'?4.55:.5,rawTop=['tea','coffee','chocolate'].includes(food.shape)?6.4:food.shape==='clear_spirit'||food.shape==='red_wine'||food.shape==='cola'?6.2:8;
    const sx=(v.radiusX-.4)/(base.family==='mug'?2.4:2.65),sy=(v.surface-bottom)/(rawTop-.8);
    const move=p=>[p[0]*sx,bottom+(p[1]-.8)*sy,p[2]*sx];
    const contents=raw.map(c=>({...c,origin:move(c.origin),size:[c.size[0]*sx,c.size[1]*sy,c.size[2]*sx],...(c.pivot?{pivot:move(c.pivot)}:{})}));
    if(family==='wine_glass'){const liquid=[];for(let j=0;j<5;j++)disc(liquid,0,4.65+j*.65,0,.6+j*.2,.6+j*.2,.66,6,'food',10);disc(liquid,0,7.92,0,1.43,1.43,.06,7,'food',12);return [...vesselCubes(vesselKey),...liquid];}
    return [...vesselCubes(vesselKey),...contents];
  }
  const rx=v.radiusX-.6,rz=v.radiusZ-.6,sx=rx/(family==='bowl'?4.2:5.1),sz=rz/(family==='bowl'?4.2:5.1),sy=Math.min(1,Math.max(.65,(sx+sz)/2));
  const contents=raw.map(c=>{
    let [x,y,z]=c.origin,[w,h,d]=c.size;
    x*=sx;z*=sz;w*=sx;d*=sz;
    const radius=Math.hypot((Math.abs(x+w/2)+w/2)/rx,(Math.abs(z+d/2)+d/2)/rz);
    if(family==='bowl'&&radius>1&&y<canonicalY+1){const factor=1/radius;x*=factor;z*=factor;w*=factor;d*=factor;}
    const next={...c,origin:[x,v.surface+(y-canonicalY)*sy,z],size:[w,h*sy,d]};
    if(c.pivot)next.pivot=[c.pivot[0]*sx,v.surface+(c.pivot[1]-canonicalY)*sy,c.pivot[2]*sz];
    return next;
  });
  return [...vesselCubes(vesselKey),...contents];
}
export function hotpotCubes(filled){
  const a=[],m='ware';
  disc(a,0,0,0,3.3,3.3,.7,0,m,10);ring(a,0,.7,0,3,3,1.8,.4,1,m);
  disc(a,0,2.2,0,5.3,5.3,.5,0,m,12);ring(a,0,2.7,0,5.6,5.6,3.2,.35,0,m,20);
  ring(a,0,5.85,0,5.7,5.7,.24,.27,3,m,20);
  ring(a,0,2.7,0,1.35,1.35,10.1,.32,0,m,16);ring(a,0,12.7,0,1.48,1.48,.3,.22,3,m,16);
  for(const side of[-1,1]){for(let j=0;j<5;j++){const t=(-80+j*40)*RAD;add(a,side*(5.9+Math.cos(t)*.6)-.17,4.2+Math.sin(t)*.75,-.2,.34,.4,.4,3,m,[0,0,j*10]);}}
  if(filled){ring(a,0,5.35,0,3.5,3.5,.12,3.9,6,'food',24);for(let i=0;i<9;i++){const t=i*2.4;add(a,Math.sin(t)*3.9,5.5,Math.cos(t)*3.9,.24,.12,.5,9);}}
  return a;
}
export const bottleCubes = prop => makeBottle(prop,{cube,disc,ring});

export function textureSpec(key,kind,colors){
  let pal=palette(colors??['#c9a66c','#e6d2b0','#799755']);
  if(kind==='ware'){
    const vessel=vesselByKey.get(key);
    if(vessel){pal[0]=vessel.color;pal[1]=vessel.theme==='black_gold'?'#3a3b3c':vessel.theme==='burgundy'?'#a15a60':'#7ca89c';pal[4]=vessel.theme==='black_gold'?'#343739':vessel.theme==='burgundy'?'#99545c':'#eee9d9';}
    if(key==='mug')pal[2]=vessel.color;
    pal[3]='#c8a45d';if(!vessel)pal[3]='#b6c8cb';
    if(key==='copper_hotpot'){pal[0]='#ae723e';pal[1]='#8b552e';pal[3]='#d8a256';pal[4]='#bb8248';}
    if(key==='triple_tray'){pal[0]='#292d32';pal[1]='#c7a15b';pal[4]='#eee9d9';}
    if(key.endsWith('_bottle')){pal[0]=colors[0];pal[1]=key==='baijiu_bottle'?'#9b4038':'#692f3b';pal[3]='#c7a15b';pal[4]='#e5d5b3';}
  }
  return {key,kind,palette:pal,size:DETAIL};
}
function paint(spec,mer=false){
  const {size,palette:pal,kind,key}=spec,data=new Uint8Array(size*size*4),tile=size/4;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const role=(Math.floor(y/tile)*4+Math.floor(x/tile))%pal.length,xx=x%tile,yy=y%tile;
    let rgb=[1,3,5].map(n=>parseInt(pal[role].slice(n,n+2),16));
    const food=kind==='food',ceramicMug=kind==='ware'&&key==='mug';
    const wood=kind==='ware'&&role===2&&!ceramicMug;
    const metal=kind==='ware'&&(role===3||key==='copper_hotpot'||(['fork','spoon','table_knife'].includes(key)&&role===12));
    // Painted motifs: grain, marbling, browned edges and glaze bands. Not a scaled noise palette.
    const edge=Math.min(xx,yy,tile-1-xx,tile-1-yy),grain=((xx+yy*2)%11===0),fiber=(xx+Math.floor(yy/3))%9;
    let shade=edge<2?-6:0;
    if(food&&role>=6&&role<=8){shade+=(Math.sin(xx*.58+yy*.19)*Math.sin(yy*.47))*7;if(fiber===0)shade+=12;if(grain)shade-=9;}
    if(food&&/baijiu|red_wine|cola/.test(key)&&role>=6&&role<=8){shade=edge<2?-3:Math.round(Math.sin(xx*.14)*2);}
    if(food&&key==='wagyu_rice'&&role===6&&(Math.abs(Math.sin(xx*.35+Math.sin(yy*.26)*1.6))<.13||Math.abs(Math.sin(yy*.29-xx*.13))<.08))rgb=[225,192,160];
    if(food&&key==='steamed_grouper'&&role===6&&((xx+Math.floor(yy/4)*3)%9<2&&yy%5<3))shade-=24;
    if(food&&/tiramisu|mille_feuille/.test(key)&&role===8)shade-=((xx*7+yy*11)%17<4?16:0);
    if(food&&key==='beef_wellington'&&role===6){if(Math.abs((xx+yy)%14-7)<1||Math.abs((xx-yy+32)%14-7)<1)shade+=18;}
    if(food&&key==='black_truffle_foie_gras'&&role===8&&((xx*13+yy*7)%23<3))shade+=20;
    if(wood)shade+=Math.sin(xx*.9+Math.sin(yy*.2))*10;
    if(!food&&!wood&&(role===1||role===3)){if(yy===5||yy===26)shade+=12;if(xx%8===0&&yy%8<3)shade-=7;}
    if(mer){
      let rough=food?(role===6&&/tea|coffee|juice|shake|chocolate|sesame|baijiu|wine|cola|soup|tremella/.test(key)?42:175):wood?205:role===12?32:ceramicMug&&role===2?95:75;
      if(food&&key==='caviar_blini'&&role===8)rough=45;
      if(food&&key==='creme_brulee'&&(role===7||role===8))rough=70;
      if(food&&key==='black_truffle_foie_gras'&&role===6)rough=115;
      if(food&&key==='wild_mushroom_risotto'&&role===6)rough=95;
      if(kind==='ware'&&key.endsWith('paper_cup'))rough=role===4?95:205;
      if(food&&role===10)rough=215;if(metal)rough=key==='copper_hotpot'?95:65;
      rgb=[metal?255:0,0,Math.max(20,Math.min(235,Math.round(rough+(food?(fiber===0?-10:3):0))))];
    }else rgb=rgb.map(v=>Math.max(0,Math.min(255,Math.round(v+shade))));
    data.set([...rgb,255],(y*size+x)*4);
  }
  return data;
}
export function paintedTexture(spec){const pixels=paint(spec);return{width:spec.size,height:spec.size,pixels,png:png(spec.size,spec.size,pixels)};}
export const paintedMER=spec=>png(spec.size,spec.size,paint(spec,true));
const FACE_NAMES=['north','south','east','west','up','down'];
const faceDims=(name,[w,h,d])=>name==='up'||name==='down'?[w,d]:name==='east'||name==='west'?[d,h]:[w,h];
export function faceUV(c,name){
  if(c.uv&&!Array.isArray(c.uv)&&c.uv[name])return c.uv[name];
  if(c.brandFace&&name==='south')return {uv:[0,80],uv_size:[128,48],material_instance:'ware'};
  const role=c.color%13,cell=32,[a,b]=faceDims(name,c.size),w=Math.min(26,Math.max(2,a*5)),h=Math.min(26,Math.max(2,b*5));
  return {uv:[role%4*cell+(cell-w)/2,Math.floor(role/4)*cell+(cell-h)/2],uv_size:[w,h],material_instance:c.material??'food'};
}
export function detailGeometry(key,cubes){
  const visible=pruneFaces(cubes);
  if(visible.length>256)throw new Error(`${key}: ${visible.length} cubes exceeds 256`);
  return {format_version:'1.12.0','minecraft:geometry':[{description:{identifier:`geometry.mcpe_food.${key}`,texture_width:128,texture_height:128,visible_bounds_width:2,visible_bounds_height:2.5,visible_bounds_offset:[0,key==='infusion_pump_stand'?1:.6,0]},bones:[{name:'root',pivot:[0,0,0],cubes:visible.map(c=>({origin:c.origin,size:c.size,...(c.rotation?{rotation:c.rotation,pivot:c.pivot}:{}),uv:Object.fromEntries((c.faces??FACE_NAMES).map(name=>[name,faceUV(c,name)]))}))}]}]};
}
function faceVertices(c,name){
  const [x,y,z]=c.origin,[w,h,d]=c.size;
  const points={north:[[x,y,z],[x,y+h,z],[x+w,y+h,z],[x+w,y,z]],south:[[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d],[x,y,z+d]],east:[[x+w,y,z],[x+w,y+h,z],[x+w,y+h,z+d],[x+w,y,z+d]],west:[[x,y,z+d],[x,y+h,z+d],[x,y+h,z],[x,y,z]],up:[[x,y+h,z],[x,y+h,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],down:[[x,y,z+d],[x,y,z],[x+w,y,z],[x+w,y,z+d]]};
  return points[name];
}
export function pruneFaces(cubes){
  const normals={north:[0,0,-1],south:[0,0,1],east:[1,0,0],west:[-1,0,0],up:[0,1,0],down:[0,-1,0]};
  return cubes.map((c,index)=>{
    if(c.rotation?.some(v=>Math.abs(v)>.001))return c;
    const faces=(c.faces??FACE_NAMES).filter(name=>{
      const points=faceVertices(c,name).map(p=>p.map((v,i)=>v+normals[name][i]*.002));
      return !cubes.some((other,j)=>j!==index&&!other.rotation?.some(v=>Math.abs(v)>.001)&&points.every(p=>p.every((v,i)=>v>=other.origin[i]-.0001&&v<=other.origin[i]+other.size[i]+.0001)));
    });return{...c,faces};
  }).filter(c=>!c.faces||c.faces.length);
}
export function modelBounds(cubes){
  const vertices=cubes.flatMap(c=>FACE_NAMES.flatMap(name=>faceVertices(c,name).map(p=>rotate(p,c))));
  const low=[0,1,2].map(i=>Math.min(...vertices.map(p=>p[i]))),high=[0,1,2].map(i=>Math.max(...vertices.map(p=>p[i])));
  return {low,high};
}
function rotate(p,c){
  if(!c.rotation)return p;
  const center=c.pivot??c.origin;let[x,y,z]=p.map((v,i)=>v-center[i]);
  for(let axis=0;axis<3;axis++){
    const t=c.rotation[axis]*RAD,co=Math.cos(t),si=Math.sin(t);
    if(axis===0)[y,z]=[y*co-z*si,y*si+z*co];
    if(axis===1)[x,z]=[x*co+z*si,-x*si+z*co];
    if(axis===2)[x,y]=[x*co-y*si,x*si+y*co];
  }return[x+center[0],y+center[1],z+center[2]];
}
/** Software preview interpolates actual per-face UVs and samples the production color map. */
export function renderDetail(source,textures,width=128,height=128,{worldScale,front=false,projection='isometric'}={}){
  const cubes=pruneFaces(source),target=canvas(width,height),depth=new Float64Array(width*height).fill(-Infinity),faces=[];
  const project=([x,y,z])=>projection==='side'?[-z,-y,x]:projection==='entity-front'?[-x,.45*z-y,y+z]:[.866*(x-z),.5*(x+z)-y,x+y+z];
  for(const c of cubes)for(const name of c.faces??FACE_NAMES){
    let points=faceVertices(c,name).map(p=>rotate(p,c));if(front)points=points.map(([x,y,z])=>[-x,y,-z]);
    const e1=points[1].map((v,i)=>v-points[0][i]),e2=points[2].map((v,i)=>v-points[1][i]);
    const normal=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    // Face vertex winding differs by axis; depth buffering handles all faces safely.
    const shade=name==='up'?1:name==='down'?.57:name==='east'||name==='west'?.77:.87;
    faces.push({name,points:points.map(project),texture:textures[c.material??'food'],uv:faceUV(c,name),shade,normal});
  }
  const all=faces.flatMap(f=>f.points),minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
  const scale=worldScale??Math.min((width-8)/(maxX-minX||1),(height-8)/(maxY-minY||1));
  const ox=width/2-(minX+maxX)*scale/2;
  const oy=worldScale?height*.83:(height-(maxY-minY)*scale)/2-minY*scale;
  for(const face of faces){
    if(!face.texture)throw new Error('Missing preview material');
    const [u,v]=face.uv.uv,[du,dv]=face.uv.uv_size;
    let uvs=face.name==='north'||face.name==='south'?[[u+du,v+dv],[u+du,v],[u,v],[u,v+dv]]:[[u,v+dv],[u,v],[u+du,v],[u+du,v+dv]];
    if(projection==='entity-front'&&(face.name==='north'||face.name==='south'))uvs=uvs.map(([x,y])=>[2*u+du-x,y]);
    let points=face.points.map((p,i)=>[...p,...uvs[i]]);
    points=points.map(([x,y,z,u,v])=>[x*scale+ox,y*scale+oy,z,u,v]);
    for(let corner=1;corner+1<points.length;corner++){
      const tri=[0,corner,corner+1];
      const[a,b,c]=tri.map(i=>points[i]),den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<.00001)continue;
      for(let yy=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));yy<=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));yy++)for(let xx=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));xx<=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0])));xx++){
        const px=xx+.5,py=yy+.5,wa=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den,wb=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den,wc=1-wa-wb;
        if(wa<-.0001||wb<-.0001||wc<-.0001)continue;
        const z=wa*a[2]+wb*b[2]+wc*c[2],index=yy*width+xx;if(z<depth[index])continue;
        const factor=1;
        const tx=Math.max(0,Math.min(face.texture.width-1,Math.floor((wa*a[3]+wb*b[3]+wc*c[3])/factor))),ty=Math.max(0,Math.min(face.texture.height-1,Math.floor((wa*a[4]+wb*b[4]+wc*c[4])/factor))),at=(ty*face.texture.width+tx)*4;
        if(!face.texture.pixels[at+3])continue;depth[index]=z;
        target.data.set([0,1,2].map(i=>Math.round(face.texture.pixels[at+i]*face.shade)).concat(255),index*4);
      }
    }
  }
  return target;
}
