import {canvas,png,rect,text} from './art.mjs';

const sides=['north','south','east','west','up','down'];
const swatches=[
  [44,51,59],[91,102,112],[174,187,193],[24,30,35],
  [38,107,103],[75,153,137],[160,36,43],[205,58,57],
  [248,214,130],[232,184,97],[35,159,209],[115,197,195],
  [113,145,155],[64,74,85],[222,227,217],[66,198,128],
];
const tile=i=>[96+(i%4)*8,Math.floor(i/4)*8];
const uv=(at,size=[8,8],material_instance='ware')=>({uv:at,uv_size:size,material_instance});

export function patch095Texture(key){
  const color=canvas(128,128,[28,34,42,255]);
  const mer=canvas(128,128,[0,0,164,255]);
  for(const [i,rgb] of swatches.entries()){
    const [x,y]=tile(i);
    for(let j=0;j<8;j++)for(let k=0;k<8;k++){
      const v=(i*5+k*11+j*7)%9-4;
      rect(color,x+k,y+j,1,1,[...rgb.map(c=>Math.max(0,Math.min(255,c+v))),255]);
    }
    rect(mer,x,y,8,8,[i===2?130:i===1?72:0,i===15&&key==='studio_monitor_speaker'?16:0,i===2?103:171,255]);
  }
  // Front and side glazing are a separate translucent render pass.
  rect(color,96,34,16,16,[139,204,225,46]);
  for(const x of [97,98,109])rect(color,x,35,1,14,[195,229,237,88]);
  rect(mer,96,34,16,16,[3,0,48,255]);
  rect(color,0,0,96,22,[108,22,33,255]);
  rect(color,1,1,94,1,[231,121,66,255]);rect(color,1,20,94,1,[231,121,66,255]);
  text(color,'POPCORN',11,7,2,[255,230,165,255]);
  rect(color,0,25,96,18,[30,37,43,255]);text(color,'DRINK',33,30,1,[240,241,219,255]);
  for(const [x,c] of [[6,[231,88,60,255]],[77,[74,173,228,255]]])rect(color,x,31,12,4,c);
  rect(color,0,48,42,23,[15,34,41,255]);
  for(let i=0;i<7;i++)rect(color,4+i*5,64-(i%4)*3,3,3+(i%4)*3,[65,179,156,255]);
  rect(color,3,51,22,2,[176,217,201,255]);
  if(key==='gym_treadmill')rect(mer,0,48,42,23,[0,14,104,255]);
  rect(color,0,76,16,28,[25,34,38,255]);
  for(let x=0;x<2;x++)for(let y=0;y<7;y++)rect(color,2+x*7,78+y*3,4,2,y<2?[235,160,63,255]:[69,204,120,255]);
  if(key==='studio_mixing_console')rect(mer,0,76,16,28,[0,14,105,255]);
  return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}

export function lunarSignalPoster(){
  const im=canvas(128,128,[26,23,55,255]);
  for(let y=0;y<128;y++){
    const t=y/127;
    rect(im,0,y,128,1,[Math.round(21+66*t),Math.round(23+19*t),Math.round(55+37*t),255]);
  }
  for(let i=0;i<35;i++)rect(im,(i*43+7)%122+3,(i*31+9)%72+3,i%9===0?2:1,1,[233,198,163,255]);
  for(let y=-15;y<=15;y++)for(let x=-15;x<=15;x++)if(x*x+y*y<=225){
    const c=(x*3+y*7)%13===0?[207,167,137,255]:[251,218,162,255];
    rect(im,86+x,62+y,1,1,c);
  }
  for(let x=0;x<128;x++){
    const ridge=88+Math.round(Math.sin(x*.16)*5+Math.sin(x*.065)*7);
    rect(im,x,ridge,1,128-ridge,[130,61,86,255]);
    const near=103+Math.round(Math.sin(x*.13+1)*6);
    rect(im,x,near,1,128-near,[52,39,77,255]);
  }
  rect(im,68,94,4,23,[30,27,55,255]);rect(im,63,92,14,3,[252,140,114,255]);
  text(im,'LUNAR',18,10,2,[255,231,184,255]);text(im,'SIGNAL',18,27,2,[255,231,184,255]);
  rect(im,18,115,37,2,[198,155,149,255]);rect(im,18,119,25,1,[152,124,149,255]);
  return im;
}

export function patch095Cubes(key){
  const cubes=[];
  const box=(x,y,z,w,h,d,finish,faces={})=>{
    const material=finish==='glass'?'food':'ware';
    const map=finish==='glass'?uv([96,34],[16,16],material):uv(tile(finish),[8,8],material);
    const cube={origin:[x,y,z],size:[w,h,d],material,uv:Object.fromEntries(sides.map(f=>[f,faces[f]??map]))};
    cubes.push(cube);
    return cube;
  };
  const panel=(x,y,z,w,h,finish,map)=>box(x,y,z,w,h,.3,finish,{north:map});
  const bolt=(x,y,z)=>box(x,y,z,.45,.45,.18,2);
  const vents=(x,y,z,w,n)=>{for(let i=0;i<n;i++)box(x,y+i*.75,z,w,.26,.16,3);};
  const foot=(x,z,w,d)=>box(x,0,z,w,1,d,3);
  const stackWeights=(x,y,z,w,levels)=>{for(let i=0;i<levels;i++)box(x,y+i*1.05,z,w,.83,5, i%3===0?13:3);};

  switch(key){
    case 'cinema_popcorn_machine': {
      for(const x of [-7,4])for(const z of [-7,4])foot(x,z,3,3);
      box(-8,1,-8,16,1,16,3);box(-7.6,2,-7.6,15.2,10.5,15.2,6);
      panel(-6.8,3,-7.9,13.6,8.4,7,uv(tile(7)));
      box(4.8,5.1,-8,.7,4.2,.38,2);
      vents(-4,4.2,7.6,8,5);
      for(const x of [-6.3,5.7])for(const y of [3.2,10.7])bolt(x,y,7.6);
      box(-8,12.5,-8,16,1.1,16,7);box(-7.2,13.6,-7.2,14.4,.5,14.4,2);
      for(const x of [-7.6,6.8])for(const z of [-7.6,6.8])box(x,13.6,z,.8,13.4,.8,2);
      for(const x of [-7.47,7.16])box(x,14.1,-6.8,.28,12.7,13.6,'glass');
      for(const z of [-7.47,7.16])box(-6.8,14.1,z,13.6,12.7,.28,'glass');
      box(-8,27,-7.7,16,4.2,15.7,6);box(-7.4,31.2,-7.4,14.8,.8,14.8,7);
      panel(-7.1,28,-8,14.2,2.6,6,uv([0,0],[96,22]));
      box(-.55,22.7,-.55,1.1,4.3,1.1,2);
      box(-3.7,19.1,-3.5,7.4,1,7,1);box(-4.2,20.1,-3.9,8.4,2.2,7.8,2);
      box(-4.55,22.3,-4.25,9.1,.6,8.5,2);
      box(4.2,20.72,-.45,1.56,.55,.9,1);box(5.7,20.6,-.5,.6,5.7,1,3);box(5.7,26.3,-.5,.6,.7,1,3);
      for(let i=0;i<32;i++){
        const x=-6.6+(i%8)*1.64,z=-6.2+Math.floor(i/8)*3.15,h=.55+(i%4)*.24;
        box(x,14.1,z,1.15,h,1.14,i%5===0?9:8);
        if(i%4===0)box(x+.32,14.1+h,z+.15,.7,.55,.73,8);
      }
      break;
    }
    case 'cinema_dual_dispenser': {
      for(const x of [-7,4])for(const z of [-6.6,4.1])foot(x,z,3,2.5);
      box(-8,1,-8,16,1.4,16,3);box(-7.4,2.4,1.1,14.8,10.5,6.4,0);
      box(-8,12.9,-6.8,16,2.1,14.8,0);box(-8,15,-6.8,16,1,14.8,2);
      panel(-7.5,13,-7.1,15,1.85,0,uv([0,25],[96,18]));
      box(-7.3,2.4,-7.7,14.6,.65,8.8,1);
      for(let i=0;i<11;i++)box(-6.8+i*1.2,3.05,-7.1,.64,.13,5.6,3);
      for(const [x,c] of [[-4,7],[4,10]]){
        box(x-1.35,10.55,-5.5,2.7,2.35,6.6,0);
        box(x-1.2,10.4,-6,2.4,1.5,.62,c);
        box(x-.45,8.75,-4.5,.9,1.8,1.2,2);
        box(x-.58,8.35,-4.66,1.16,.4,1.52,1);
        box(x-.55,5.9,.65,1.1,2.8,.55,3);
      }
      vents(-5,6,7.5,9,5);box(4,3.6,7.5,1.8,1.5,.33,3);box(4.4,4,7.83,.45,.45,.17,2);
      break;
    }
    case 'studio_mixing_console': {
      for(const x of [-14.8,12.3])for(const z of [-6.7,4.2])foot(x,z,2.5,2.5);
      box(-16,1,-8,32,1.1,16,0);box(-15.7,2.1,-8,31.4,.4,.42,4);
      for(let band=0;band<5;band++){
        const z=-7.6+band*3,top=2.9+band*.9;
        box(-15.4,2.1,z,30.8,top-2.1,3,13);
        for(const x of [-15.4,14.4])box(x,top,z,1,.28,3,1);
        for(let i=0;i<8;i++){
          const x=-13.85+i*2.95;
          if(band<2){
            box(x,top,z+.25,.25,.08,2.45,3);
            for(let j=0;j<4;j++)box(x+.57,top,z+.3+j*.59,.32,.064,.13,12);
            if(band===i%2)box(x-.55,top+.08,z+.52+(i%3)*.52,1.32,.57,.78,2);
          }else{
            box(x-.51,top,z+.85,1.27,.34,1.35,band===4?4:1);
            box(x-.36,top+.34,z+1,.97,band===4?1.08:.56,1.02,band===3?2:3);
            box(x+.01,top+(band===4?1.42:.9),z+1.07,.19,.072,.63,5);
          }
        }
        if(band===2||band===3)box(11.8,top,z+.06,2.2,.145,2.88,3,{up:uv([0,band===2?90:76],[16,14])});
      }
      for(let i=0;i<10;i++){
        const x=-13.6+i*2.52;
        box(x,2.72,7.4,1.63,1.55,.39,1);
        box(x+.31,3.02,7.79,1.02,.92,.21,3);
      }
      box(12.55,2.68,7.4,2.1,1.64,.6,3);
      break;
    }
    case 'studio_monitor_speaker': {
      for(const x of [-6.8,4.4])for(const z of [-5.9,4])foot(x,z,2.4,2.25);
      box(-8,1,-7.05,16,14.2,15,0);box(-7.55,15.2,-6.65,15.1,.8,14.3,13);
      panel(-7.35,1.6,-7.35,14.7,13.16,3,uv(tile(3)));
      box(-7,2.1,-7.57,.27,12.1,.25,4);box(6.73,2.1,-7.57,.27,12.1,.25,4);
      for(const [cy,r] of [[7.05,4.67],[13.28,1.7]]){
        // Stepped driver rims and inset cones, supported by the cabinet baffle.
        for(let i=0;i<7;i++){
          const dy=(i-3)*r/3.6,half=r*(i===0||i===6?.55:i===1||i===5?.82:1);
          box(-half,cy+dy-r/7.2,-7.65,2*half,r/3.6,.3,13);
          box(-half*.76,cy+dy-r/7.2,-7.82,1.52*half,r/3.6,.17,i===0||i===6?3:1);
        }
        box(-r*.31,cy-r*.28,-8,r*.62,r*.56,.18,3);
      }
      box(5.5,2.42,-7.6,.68,.7,.27,15);
      box(-5.8,2.7,7.95,11.6,11.1,.02,1);
      for(let i=0;i<5;i++)box(-4.5,10.2+i*.54,7.97,8.2,.16,.03,3);
      for(const x of [-4.4,-1.2,2.9])box(x,5.2,7.97,1.35,1.2,.029,3);
      for(const x of [-4.8,1.4])box(x,3.25,7.97,3.2,1.32,.029,3);
      break;
    }
    case 'gym_treadmill': {
      for(const x of [-8,4])for(const z of [-16,12])foot(x,z,4,4);
      box(-8,1,-16,16,2.1,32,0);
      box(-5.45,3.1,-14.7,10.9,.72,27.7,4);
      for(let i=0;i<25;i++)box(-5.4,3.82,-14.4+i*1.07,10.8,.12,.18,3);
      for(const x of [-8,5.45]){
        box(x,3.1,-16,2.55,1.2,32,1);
        box(x,4.3,-15.2,2.55,.45,3,2);
        box(x+.35,4.3,10.1,1.83,13.65,2.7,0);
        box(x+.35,17.95,2.35,1.83,1.52,10.48,1);
        box(x+.3,17.84,1.85,1.93,1.7,4,3);
      }
      box(-6.1,17.85,10.3,12.2,2.1,4.3,1);
      box(-5.4,19.95,10.7,10.8,4.05,2.25,0,{north:uv([0,48],[42,23])});
      box(-2.3,18.7,10.0,4.6,.7,.31,3);
      vents(-4.9,20.72,12.95,9.8,4);
      break;
    }
    case 'gym_squat_rack': {
      for(const x of [-14.1,10.1]){
        foot(x,-16,4,32);box(x+.35,1,-15,3.3,2,30,1);
        box(x+.5,3,5.4,3,44.97,3.55,0);
        for(let j=0;j<7;j++)box(x+.75,5+j*.75,8.95,2.48,.5,2.2-j*.27,1);
        for(let j=0;j<15;j++){
          box(x+1.14,8+j*2.35,5.27,1.67,.72,.15,3);
          box(x+1.14,8.03+j*2.35,8.94,1.67,.72,.13,3);
        }
        box(x+.76,23,3.25,2.45,2.2,2.15,1);
        box(x+.76,24.2,2.64,2.45,1.49,.61,2);
        box(x+.05,44.8,4.94,3.9,3.2,4.47,1);
      }
      box(-10.25,45.1,5.45,20.4,2.24,3.5,0);
      box(-15.7,25.2,3.35,31.4,.95,1.25,2);
      for(const dir of [-1,1])for(const [x,w,r] of [[12.93,1.58,4.15],[14.51,.84,3.65],[15.35,.65,2.19]]){
        const xx=dir===1?x:-x-w;
        for(let j=0;j<5;j++){
          const half=r*(j===0||j===4?.65:1);
          box(xx,25.7-r+j*2*r/5,3.975-half,w,2*r/5,2*half,3);
        }
      }
      break;
    }
    case 'gym_incline_bench': {
      for(const z of [-15,12]){foot(-8,z,16,3);box(-6,1,z+.3,12,.45,2.4,1);}
      box(-1.7,1,-14,3.4,1.8,28,0);
      box(-1.25,2.8,-10.5,2.5,2.9,2.2,1);box(-5.1,5.7,-14,10.2,.7,11.8,0);
      box(-5.1,6.4,-14,10.2,1.5,11.8,4);
      box(-1.2,2.8,9.1,2.4,9.5,2.2,1);
      box(-4.2,6.6,-2.2,8.4,.95,1.7,0);
      for(let i=0;i<15;i++){
        const z=-1.2+i*1.07,y=7.45+i*.49;
        box(-5.25,y-.72,z,10.5,.72,1.07,0);
        box(-5.25,y,z,10.5,1.67,1.07,i%5===0?5:4);
      }
      box(-1.33,11.6,9.2,2.66,1.55,3.8,0);
      break;
    }
    case 'gym_dumbbell_rack': {
      for(const x of [-15.8,13.1]){
        foot(x,-8,2.7,16);box(x,1,4.5,2.7,22.35,2.2,0);
        for(let j=0;j<8;j++)box(x+.12+j*.012,1+j*2.6,-6+j*1.4,2.45-j*.025,2.93,2.18,1);
      }
      for(let row=0;row<3;row++){
        const y=3+row*7,z=-7+row*2.1;
        box(-13.1,y,z,26.2,.8,12-row*1.2,1);
        box(-13.1,y+.8,z,26.2,.62,.65,0);
        box(-13.1,y+.8,z+9.6-row,26.2,1,.76,0);
        for(let i=0;i<6;i++){
          const x=-12.3+i*4.13;
          box(x+.58,y+1.55,z+4.1,2.85,.7,.8,2);
          for(const xx of [x,x+2.76]){
            box(xx,y+.8,z+3.16,1.02,2.24,2.54,3);
            box(xx+.15,y+3.04,z+3.5,.74,.36,1.83,13);
          }
        }
      }
      break;
    }
    case 'gym_cable_machine': {
      for(const x of [-16,9.4]){
        foot(x,-8,6.6,16);
        box(x,1,2.8,6.6,46,3.9,0);box(x+.55,1,-4.5,1.1,45,7.3,1);
        box(x+4.95,1,-4.5,1.1,45,7.3,1);
        stackWeights(x+1.65,1,-2.6,3.3,16);
        for(const dx of [2.04,4.16])box(x+dx,17.6,-.55,.34,26.9,.34,2);
        box(x+.2,44.5,-5.4,6.2,3.5,12.04,1);
        box(x+2.2,43.2,-6,2.15,2.1,2.1,2);
        box(x+3,31.6,-5.85,.42,11.9,.48,3);
        box(x+1.65,31.1,-6.15,3.2,.5,.99,2);
        for(const dx of [1.65,4.32])box(x+dx,28.55,-6.15,.53,2.55,.99,1);
        box(x+1.65,28,-6.15,3.2,.55,.99,3);
        vents(x+.85,4.4,6.7,4.9,8);
      }
      box(-9.4,45.15,3.1,18.8,2.85,3.2,0);
      box(-3.55,45.8,2.81,7.1,1.55,.3,4);
      break;
    }
    case 'gym_mat_rack': {
      for(const x of [-8,5.4])foot(x,-8,2.6,16);
      box(-8,1,-7.8,16,1.65,15.6,0);
      for(const x of [-8,6.65]){
        box(x,2.65,-5.6,1.35,14.5,11.9,0);
        box(x,17.15,-5.6,1.35,.65,11.9,1);
      }
      for(const y of [4.5,11.5])for(const z of [-5.6,5.7])box(-6.65,y,z,13.3,1.17,.6,1);
      for(let i=0;i<3;i++){
        const x=-6.02+i*4.17,h=21.1+i*.12;
        box(x,2.65,-3.8,3.72,h-3,8.0,i===1?5:4);
        box(x+.18,h-.35,-3.55,3.36,.5,7.5,5);
        box(x+.55,h+.15,-2.83,2.62,.35,6.1,4);
        box(x+.93,h+.5,-2,1.86,.22,4.6,3);
        box(x+1.26,h+.72,-1.28,1.25,.21,3,5);
      }
      break;
    }
    case 'gym_punching_bag': {
      for(const z of [-7.75,5.1]){foot(-8,z,16,2.65);box(-7.85,1,z,15.7,1.7,2.65,0);}
      box(4.4,2.7,-6.1,2.5,1.7,12.7,1);box(4.4,4.4,3.1,2.5,43.6,3.25,0);
      for(let i=0;i<5;i++)box(4.72+i*.018,3.3+i*.75,1.1+i*.54,1.83,1.13,2.55,1);
      box(-4.7,45.4,3.1,9.1,2.6,3.25,0);
      box(-4.7,45.4,-2.04,2.7,2.6,5.14,0);
      for(let i=0;i<6;i++)box(1.2+i*.52,45-i*.51,3.45+i*.014,.78,.85,2.2,1);
      for(let i=0;i<5;i++){
        const y=44.25-i*1.16;box(-3.82,y,-1.55,.8,1.16,.68,i%2===0?2:1);
      }
      box(-5.7,36.2,-4.2,4.6,3.41,6.4,3);
      box(-7.05,14.2,-5.4,7.3,22,8.75,4);
      box(-6.47,12.75,-4.98,6.14,1.45,7.91,3);
      for(const y of [16.3,31.7]){
        box(-7.09,y,-5.45,7.38,.74,.05,5);box(-7.09,y,3.35,7.38,.74,.05,5);
        box(-7.09,y,-5.40,.04,.74,8.75,5);box(.25,y,-5.40,.04,.74,8.75,5);
      }
      break;
    }
    default: throw new Error('Unknown 0.9.5 model '+key);
  }
  return cubes;
}
