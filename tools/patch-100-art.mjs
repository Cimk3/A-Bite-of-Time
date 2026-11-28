import {canvas,png,rect} from './art.mjs';

const palette=[
 [45,49,53],[102,112,121],[194,199,195],[227,214,179],[154,102,56],
 [103,64,41],[188,149,66],[118,43,57],[57,103,75],[49,96,146],
 [165,57,51],[219,172,64],[255,227,159],[181,218,229,73],[231,235,228],[163,117,69],
];
const faces=['north','south','east','west','up','down'];
const uv=(x,y,w,h,material='ware')=>({uv:[x,y],uv_size:[w,h],material_instance:material});
const swatch=i=>uv(2+i%8*16,82+Math.floor(i/8)*20,12,12,i===13?'food':'ware');

export function districtTexture(key){
 const color=canvas(128,128,[40,46,52,255]),mer=canvas(128,128,[0,0,170,255]);
 for(const [i,c] of palette.entries()){
  const u=i%8*16,v=80+Math.floor(i/8)*20;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
   const grain=((x*13+y*7+i*3)%9)-4+(i===4||i===5?Math.round(3*Math.sin(x/2+y/6)):0);
   rect(color,u+x,v+y,1,1,[...c.slice(0,3).map(t=>Math.max(0,Math.min(255,t+grain))),c[3]??255]);
  }
  const metal=[1,2,6].includes(i);
  rect(mer,u,v,16,16,[metal?116:0,key==='bookshop_desk_lamp'&&i===12?25:0,metal?98:187,255]);
 }
 rect(color,0,0,48,48,[27,29,33,255]);
 for(let y=3;y<37;y++)for(let x=3;x<45;x++){
  const r=Math.hypot(x-24,y-20);
  if(Math.abs(r-14)<.72||Math.abs(r-11)<.58)rect(color,x,y,1,1,[183,188,185,255]);
 }
 for(const x of [10,19,28,37])rect(color,x,41,4,2,[198,202,199,255]);
 for(const [i,base] of [9,10,8,1].entries()){
  const y=i*18;
  rect(color,50,y,16,16,[...palette[base],255]);
  const mark=[235,237,230,255];
  if(i===0){for(let j=0;j<5;j++){rect(color,55+j,y+3+j,2,2,mark);rect(color,59-j,y+3+j,2,2,mark);}rect(color,54,y+10,8,2,mark);}
  else if(i===1){rect(color,57,y+3,2,6,mark);rect(color,57,y+11,2,2,mark);}
  else if(i===2){rect(color,55,y+6,7,6,mark);rect(color,59,y+4,3,2,mark);}
  else{rect(color,55,y+6,6,6,mark);rect(color,54,y+4,8,1,mark);}
 }
 return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}

export function districtCubes(key){
 const cubes=[];
 const put=(x,y,z,w,h,d,c,face,graphic)=>{
  const material=c===13?'food':'ware';
  const map=Object.fromEntries(faces.map(f=>[f,swatch(c)]));
  if(face)map[face]=graphic;
  cubes.push({origin:[x,y,key==='hotel_wall_hairdryer'?5.7-z-d:z],size:[w,h,d],material,uv:map});
 };
 const wheel=(x,z)=>{put(x,0,z,2,1.55,1.8,0);put(x+.4,1.55,z+.32,1.2,.7,1.12,1);};
 const legs=(w,d,top,c)=>{
  for(const x of [-w/2,w/2-1.25])for(const z of [-d/2,d/2-1.25])put(x,0,z,1.25,top,1.25,c);
 };
 const framed=(w,h,d,c)=>{
  put(-w/2,0,-d/2,w,1,d,c);
  put(-w/2,h-1,-d/2,w,1,d,c);
  put(-w/2,1,d/2-1,w,h-2,1,c);
  for(const x of [-w/2,w/2-1])put(x,1,-d/2,1,h-2,d-1,c);
 };
 const stocks=(x,y,z,n,w,books=false)=>{
  for(let i=0;i<n;i++){
   const h=books?2.8+(i%3)*.7:1.45+(i%3)*.65;
   put(x+i*w,y,z,w-.32,h,books?2.2:2.7,[9,7,11,8,3][(i+Math.floor(y))%5]);
   put(x+i*w+.22,y+h*.56,z-.08,w-.76,.44,.08,14);
  }
 };
 const glass=(x,y,z,w,h)=>put(x,y,z,w,h,.25,13);
 const grid=(w,n,fn)=>{for(let i=0;i<n;i++)fn(-w/2+i*w/n,w/n,i);};
 switch(key){
 case 'hotel_luggage_cart':
  for(const x of [-6.5,4.5])for(const z of [-5,3.2])wheel(x,z);
  put(-7,2.25,-5.75,14,1.1,11.5,6);put(-6.55,3.35,-5.3,13.1,.44,10.6,7);
  for(const z of [-4.95,3.85]){
   for(const x of [-6.2,5])put(x,3.35,z,1.2,17,1.1,6);
   for(let i=0;i<4;i++)for(const x of [-6.2+i*1.05,5-i*1.05])put(x,20.35+i*1.38,z,1.2,1.38,1.1,6);
   put(-3.05,25.87,z,6.1,1,1.1,6);
  }
  put(-.7,26.87,-5,1.4,1.4,10,6);break;
 case 'hotel_housekeeping_cart':
 case 'store_restock_cart':{
  const hotel=key==='hotel_housekeeping_cart',top=hotel?20:9;
  for(const x of [-13,11])for(const z of [-6,4])wheel(x,z);
  for(const x of [-13,12])for(const z of [-6,5])put(x,2.25,z,1,top,1,0);
  for(const y of hotel?[3,11,18]:[3,8])put(-12.8,y,-5.8,25.6,.8,11.6,1);
  put(12,top+2.25,-5,1,1,10,1);
  if(hotel){put(3,4,-5.8,8.5,14.8,11.6,3);for(const y of [3.8,11.8,18.8])for(let i=0;i<2;i++)put(-10+i*.2,y+i*.78,-4.85,9,.78,8.7,14);}
  else{put(-10,8.8,-4,8,5.1,7,15);put(1,8.8,-4,6,3.6,6,4);}
  break;
 }
 case 'hotel_wall_hairdryer':
  put(-5,2,4.7,10,9,1,3);put(-1.1,5.6,1.7,2.2,5.4,3.2,14);
  put(-4.7,9,1,9.5,3.9,4.7,14);put(-3.9,9.75,.45,3.4,2.4,.55,0);
  for(const x of [-1.44,2.75])put(x,2.15,2, .52,3.45,.52,0);
  put(-1.44,1.63,2,4.71,.52,.52,0);break;
 case 'induction_hob':
  put(-6.6,.22,-6.55,13.2,.98,13.1,0,'up',uv(0,0,48,48));
  for(const x of [-6.1,5.1])for(const z of [-5.9,4.9])put(x,0,z,1,.22,1,1);
  break;
 case 'bookshop_bookcase':
 case 'store_wall_shelving':{
  const books=key==='bookshop_bookcase',w=books?14:30;
  framed(w,30,11,books?5:3);
  for(const y of [1,7.7,14.4,21.1]){
   put(-w/2+1,y,-5.35,w-2,.55,9.8,books?4:2);
   stocks(-w/2+1.5,y+.55,-4.7,books?5:9,(w-3)/(books?5:9),books);
  }
  break;
 }
 case 'bookshop_display_table':
  legs(27,12,10.5,5);put(-14,10.5,-6.5,28,1.25,13,4);put(-13.29,2,-5.8,26.58,.8,11.6,5);
  stocks(-10,2.8,-4,8,2.5,true);
  for(const x of [-10,-3.1,3.8]){
   put(x,11.75,-4,5.6,.6,6,5);
   for(let i=0;i<4;i++)put(x+.35,12.35+i*.53,-3.6+i*.76,4.9,.53,.78,[9,11,8][Math.round((x+10)/6.9)]);
  }
  break;
 case 'bookshop_magazine_rack':
  put(-5.2,0,-5.7,10.4,1.2,11.4,5);
  put(-5.2,1.2,4.35,10.4,24,1.35,4);
  for(let i=0;i<4;i++){
   const y=2+i*5.35,z=-5.25+i*2.2;
   put(-4.8,y,z,9.6,1,9.7-i*2.2,4);
   put(-4.35,y+1,z+.75,8.7,4.8,.75,[3,9,7,8][i]);
   put(-4.8,y+1,z,9.6,1,.52,5);
  }
  break;
 case 'bookshop_desk_lamp':
  put(-4.4,0,-2.25,8.8,1.25,7,8);put(-2,1.25,-1.3,1,.28,1,3);
  for(let i=0;i<5;i++)put(.65+i*.49,1.25+i*1.15,1.5,1.25,1.15,1.25,8);
  for(let i=0;i<5;i++)put(2.5-i*.82,7+i*.87,1.45,1.3,.87,1.35,8);
  put(-3.6,10.85,-1.2,3.9,2.2,4.5,8);put(-3.4,10.61,-1,3.5,.24,4.1,12);break;
 case 'store_island_shelving':
  put(-14.3,0,-6.9,28.6,1.25,13.8,1);put(-14,1.25,-.5,28,13.8,1,3);
  for(const y of [1.25,5.7,10.2])for(const z of [-6.3,.5]){
   put(-13.8,y,z,27.6,.47,5.8,2);
   stocks(-12.9,y+.47,z+1.4,9,2.95);
  }
  break;
 case 'store_drink_cooler':
  framed(14,31,13,2);
  put(-6,1,-6.43,12,3.4,11.85,1);
  put(-5.68,1.65,-6.55,11.36,2.18,.12,0);
  for(const y of [1.92,2.55,3.18])put(-5.3,y,-6.61,10.6,.23,.06,2);
  for(const y of [4.5,9.9,15.3,20.7,26.1]){
   put(-6,y,-6,12,.35,11.4,2);
   for(let i=0;i<5;i++){const x=-5.1+i*2.18;
    put(x,y+.35,-3.4,1.55,2.4,1.6,[7,8,11,9,3][Math.floor(y)%5]);
    put(x+.36,y+2.75,-3.1,.83,.58,.9,14);}
  }
  glass(-6,4.4,-6.65,12,25.6);
  for(const x of [-6.5,5.8])put(x,4.35,-6.95,.7,25.9,.55,0);
  put(4.78,12,-7.2,.56,5.4,.6,2);break;
 case 'store_hot_display':
  put(-7.6,0,-6.7,15.2,2.6,13.4,1);
  put(-7.2,1,-6.9,14.4,.65,.2,7);
  for(const y of [2.6,6.75]){
   put(-7.05,y,-6.01,14.1,.48,11.96,2);
   for(let i=0;i<3;i++)for(let j=0;j<2;j++)put(-5.9+i*4.1,y+.48,-3.75+j*2.6,3.2,.65,1.75,[15,11,4][i]);
  }
  for(const x of [-7.3,6.6])for(const z of [-6.25,5.6])put(x,2.6,z,.7,7.7,.6,1);
  glass(-6.6,2.6,-6.12,13.2,7.5);
  for(const x of [-6.82,6.6])put(x,2.6,-5.87,.22,7.5,11.47,13);
  put(-6.82,10.1,-6.15,13.64,.42,12.15,2);break;
 case 'store_basket_stand':
  legs(12,10,5,1);put(-6,5,-5,12,.45,10,1);
  for(let i=0;i<4;i++){
   const y=5.45+i*1.55;put(-5.5,y,-4.5,11,.5,9,7);
   for(const z of [-4.5,3.95])put(-5.5,y+.5,z,11,1.05,.55,10);
   for(const x of [-5.5,4.95])put(x,y+.5,-3.95,.55,1.05,7.9,10);
  }
  break;
 case 'store_oden_station':
  put(-7,0,-6,14,2.8,12,1);put(-6.65,2.8,-5.65,13.3,.5,11.3,15);
  for(const z of [-5,-.25,4.5])put(-6.25,3.3,z,12.5,.86,.35,2);
  for(const x of [-6.25,-2.08,2.08,5.9])put(x,3.3,-4.65,.35,.86,9.15,2);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){
   const x=-5.7+i*4.2,z=-3.9+j*4.7;
   put(x,3.3,z,2.8,1.25,2.4,[3,15,8][(i+j)%3]);
   put(x+1.1,4.55,z+.6,.28,1.45,.28,4);
  }
  break;
 case 'store_bun_steamer':
  put(-6.6,0,-6,13.2,2.5,12,1);
  for(let i=0;i<3;i++)for(let j=-4;j<=4;j++){
   const d=Math.round(Math.sqrt(25-j*j)*2)/2,y=2.5+i*2.35;
   put(j-.5,y,-d,1,1.95,d*2,2);put(j-.5,y+1.95,-d-.25,1,.4,d*2+.5,1);
  }
  put(-1.55,9.55,-1.05,3.1,.76,2.1,0);break;
 case 'street_takeaway_bag':
  put(-3.75,0,-2.4,7.5,5.3,4.8,15);put(-3.8,5.3,-2.15,7.6,.55,3.8,4);
  for(const z of [-1.7,1.1]){
   for(const x of [-2.15,1.55])put(x,5.85,z,.55,2,.55,15);
   put(-2.15,7.85,z,4.25,.55,.55,15);
  }
  break;
 case 'street_umbrella_stand':
  put(-4.8,0,-4.8,9.6,1,9.6,1);
  grid(9.6,13,(x,w)=>{
   const center=x+w/2,outer=Math.sqrt(4.8**2-center**2);
   const inner=Math.abs(center)<3.85?Math.sqrt(3.85**2-center**2):0;
   if(inner===0)put(x,1,-outer,w,6.15,outer*2,2);
   else for(const z of [-outer,inner])put(x,1,z,w,6.15,outer-inner,2);
  });
  for(const [x,z,c,h] of [[-2.8,-1.7,9,11],[.1,.9,10,14],[2.45,-1.8,11,12]]){
   put(x,1,z,1.4,h-3.1,1.4,c);put(x+.48,h-2.1,z+.45,.42,2.5,.42,0);put(x+.48,h+.4,z+.45,1.36,.42,.42,0);
  }
  break;
 case 'street_waste_station':
  put(-14,0,-4.8,28,.85,9.6,0);
  grid(28,4,(x,w,i)=>{
   const c=[9,10,8,1][i];
   put(x+.07,.85,-4.7,w-.14,7.75,9.4,1);
   put(x+.49,2,-4.83,w-.98,5.3,.13,c,'north',uv(50,i*18,16,16));
   for(const z of [-4.82,2.4])put(x+.1,8.6,z,w-.2,.7,2.4,c);
   for(const xx of [x+.1,x+w-1.72])put(xx,8.6,-2.42,1.62,.7,4.82,c);
  });break;
 default: throw new Error('Unknown district model '+key);
 }
 return cubes;
}
