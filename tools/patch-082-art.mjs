import {canvas, png, rect, text} from './art.mjs';
import {modelBounds, pruneFaces} from './detail-art.mjs';
import {northFacingCubes} from './patch-072-art.mjs';
import {patch082ById} from '../.build/patch-082-catalog.js';

const colors = {
  ivory:[223,224,213], coal:[29,36,46], steel:[129,148,160],
  blue:[64,98,154], aqua:[42,156,160], red:[184,57,51],
  wine:[115,33,49], glass:[151,193,217], amber:[208,153,57],
  lime:[145,216,86], navy:[42,56,91], orange:[231,111,37],
  warm:[245,218,151], wood:[173,160,140], purple:[126,96,160],
};
const swatches = Object.keys(colors);
const displayUV = [0,0];
const displaySize = [96,48];

const displayLabels = {
  icu_ecmo:'ECMO', icu_ventilator:'VENT', icu_crrt:'CRRT', icu_iabp:'IABP',
  icu_manual_defibrillator:'DEFIB', icu_high_flow_oxygen:'HIGH FLOW',
  icu_pulse_oximeter:'SpO2 98', police_breathalyzer_kit:'0.00',
};

export function patch082Cubes(key) {
  const cubes = [];
  const box = (x,y,z,w,h,d,color='ivory') => {
    const cube = {origin:[x,y,z],size:[w,h,d],color,material:'ware'};
    cubes.push(cube);
    return cube;
  };
  const panel = (x,y,z,w,h) => {
    box(x-.4,y-.4,z-.55,w+.8,h+.8,.55,'coal');
    const cube = box(x,y,z+.025,w,h,.045,'coal');
    cube.uv = {south:{uv:displayUV,uv_size:displaySize,material_instance:'ware'}};
  };
  const cart = (color='steel') => {
    box(-6.7,2,-5.3,13.4,1.25,10.6,color);
    for (const x of [-6,4]) for (const z of [-4.9,3]) {
      box(x,.25,z,2,1.6,1.8,'coal');
      box(x+.27,0,z+.28,1.46,2.1,1.24,'coal');
      box(x+.65,.64,z+1.81,.7,.72,.11,'steel');
    }
  };
  const drawer = (x,y,z,w,h,color='ivory') => {
    box(x,y,z,w,h,.5,color);
    box(x+w*.32,y+h*.46,z+.51,w*.36,.42,.38,'steel');
  };
  const cylinder = (x,y,z,w,h,color) => {
    box(x+w*.16,y,z,w*.68,h,w,color);
    box(x,y,z+w*.16,w,h,w*.68,color);
    box(x+w*.18,y+h,z+w*.18,w*.64,.6,w*.64,color);
  };
  const tube = (points,color,diameter=.62) => {
    for (let i=1;i<points.length;i++) {
      const start=points[i-1],end=points[i];
      const origin=start.map((v,k)=>Math.min(v,end[k])-diameter/2);
      const size=start.map((v,k)=>Math.abs(v-end[k])+diameter);
      box(...origin,...size,color);
    }
  };
  const buttonRow = (x,y,z,count) => {
    for(let i=0;i<count;i++) box(x+i*1.17,y,z,.79,.48,.23,i===1?'aqua':'steel');
  };
  const handle = (x,y,z,width,color) => {
    box(x,y,z,.75,2,1.1,color);
    box(x+width-.75,y,z,.75,2,1.1,color);
    box(x,y+1.65,z,width,.7,1.1,color);
  };

  switch (key) {
    case 'icu_ecmo':
      cart(); box(-6.1,3.25,-4.4,9.3,16,8.5,'blue');
      handle(-5.9,19.2,-.5,8.5,'steel');
      box(-6.4,11.7,-3.9,9.9,7.6,8.3,'ivory');
      panel(-5.7,14,4.45,8.3,4.5); buttonRow(-5.25,12.65,4.53,6);
      cylinder(-3.9,4.2,3,4.3,4.8,'steel'); box(-2.65,5.4,7.4,1.7,2.1,.38,'coal');
      box(4.8,3.25,-2.4,.7,18,1,'steel');
      cylinder(3.3,10.2,.1,3.65,6.9,'glass');
      box(3.1,10,.04,4,.74,3.9,'ivory'); box(3.1,17.1,.04,4,.74,3.9,'ivory');
      tube([[5,10,2],[5,5.7,2],[5,5.7,5.8],[.3,5.7,5.8]],'wine');
      tube([[5,18,1],[5,19.4,1],[6.7,19.4,1],[6.7,4.4,1],[6.7,4.4,4.6],[.3,4.4,4.6]],'wine');
      break;
    case 'icu_ventilator':
      cart('ivory'); box(-5.9,3.25,-4.4,10.1,12.2,8.6);
      for (const y of [5,8.2,11.4]) drawer(-5.4,y,4.24,8.9,2.6);
      box(-6.4,15,-4.4,12.8,1.35,9.2,'ivory');
      box(-5.95,16.4,-2.7,11.9,7.7,4.6);
      panel(-5.1,18.1,1.93,10.2,5.1); buttonRow(-3.3,16.8,2,6);
      tube([[5.3,15.5,-2.7],[5.3,25.1,-2.7],[5.3,25.1,4.6],[5.3,21.2,4.6]],'steel',1);
      for (const x of [4.75,6.35]) tube([[x,21.2,4.6],[x,11.7,4.6],[x,11.7,6.4],[2.5,11.7,6.4],[2.5,13.7,6.4]],'glass',.72);
      break;
    case 'icu_crrt':
      cart(); box(-5.9,3.25,-4.3,11.8,17.4,8.6);
      drawer(-5.4,4.15,4.33,10.8,2.5,'steel');
      panel(-4.85,15,4.33,9.7,4.8); buttonRow(-4.6,13.72,4.42,7);
      for (const x of [-4.65,-1.4,1.85]) {
        box(x,8.35,4.36,2.8,4.15,1.5,'coal');
        box(x+.25,8.65,5.9,2.3,3.5,.45,'steel');
        box(x+.83,9.45,6.38,1.14,1.83,.37,'ivory');
      }
      for (const x of [-5.15,4.35]) box(x,20.6,-2.6,.8,10,1.1,'steel');
      box(-5.15,29.7,-2.6,10.3,1,1.1,'steel');
      for (const [x,color] of [[-4.25,'glass'],[.9,'warm']]) {
        box(x,22.7,-2,3.4,5.7,2.05,color);
        box(x+.85,28.4,-1.6,1.7,1.3,1.1,'ivory');
        tube([[x+1.7,22.6,-.9],[x+1.7,21,-.9],[x+1.7,21,4.7],[x+1.7,20,4.7]],'glass',.35);
      }
      break;
    case 'icu_iabp':
      cart('navy'); box(-5.8,3.25,-4.5,11.6,14.5,8.4,'navy');
      box(-5.4,3.6,3.92,8.4,8.4,.37,'coal');
      cylinder(-3.7,3.8,3.8,3.2,6.8,'steel');
      box(-5.8,13.6,-4,11.6,6.3,8.7,'navy');
      panel(-4.95,15.4,4.74,9.9,3.7); buttonRow(-4.7,14.18,4.82,7);
      handle(-5.2,19.9,-1.2,10.4,'navy');
      tube([[.3,4.9,5.6],[5.8,4.9,5.6],[5.8,12.2,5.6],[5.8,12.2,2.1]],'ivory');
      break;
    case 'icu_manual_defibrillator':
      box(-6.2,0,-4.25,12.4,10.4,8.5,'red');
      box(-4.2,.8,4.27,8.4,8.9,.63);
      panel(-3.45,4.35,4.94,6.9,4.25); buttonRow(-2.9,2.75,5.02,5);
      handle(-3.7,10.4,-.9,7.4,'red');
      for (const x of [-6.35,4.4]) {
        box(x,3.3,4.34,1.95,5.2,1.2,'ivory');
        box(x+.37,3.6,5.56,1.21,2.8,.55,'steel');
        tube([[x+.94,3.5,5.9],[x+.94,1.5,5.9],[x+.94,1.5,4.2]],'coal',.45);
      }
      break;
    case 'icu_high_flow_oxygen':
      cart('ivory'); box(-.7,3.25,-.5,1.4,11,1.2,'steel');
      box(-4.95,13.1,-3.6,9.9,8.85,7.2);
      box(-5.05,13,-3.67,10.1,1,7.4,'aqua');
      box(-5.05,21.95,-3.67,10.1,.95,7.4,'aqua');
      panel(-4.1,17.35,3.65,8.2,3.85); buttonRow(-2.9,16.3,3.74,5);
      box(-2.2,13.4,3.68,4.4,2.45,1.85,'glass');
      box(-2.2,13.4,5.54,4.4,.75,.28,'blue');
      tube([[4.9,19,1.5],[6.4,19,1.5],[6.4,19,4.6],[6.4,14,4.6],[2.2,14,4.6]],'glass');
      break;
    case 'icu_portable_suction':
      box(-5.6,.4,-4.4,10.7,7.35,8.1);
      for(const x of [-4.6,3.35]) box(x,0,-3.65,1.4,.4,6.4,'aqua');
      handle(-3.4,7.7,-1.5,6.4,'aqua');
      cylinder(-5.7,.8,2.75,4,5.3,'amber');
      box(-5.7,6.15,2.75,4,.65,4);
      for(const y of [2.2,3.1,4]) box(-4.85,y,6.76,1.4,.15,.08);
      box(.3,4.45,3.75,3.4,2.3,.39,'coal');
      box(.68,4.8,4.17,2.64,1.65,.07);
      box(1.83,5.3,4.26,.9,.3,.1,'red');
      box(1.25,2.2,3.75,1.5,1.03,.65,'aqua');
      tube([[-3.8,6.75,4.8],[-3.8,8,4.8],[-3.8,8,.9],[5.9,8,.9],[5.9,2.1,.9],[5.9,2.1,4]],'steel');
      break;
    case 'icu_oxygen_cart':
      cart(); cylinder(-2.8,3.25,-2.9,5.6,15.3,'ivory');
      cylinder(-2.83,15,-2.93,5.66,1.7,'aqua');
      box(-.6,19.1,-.55,1.2,2.4,1.2,'steel');
      box(-1.45,20.7,-.62,2.9,1.05,1.4,'amber');
      box(-2.75,19.7,1.3,2.65,2.65,.55,'coal');
      box(-2.4,20.05,1.87,1.95,1.95,.12,'ivory');
      box(-1.85,21.13,2,.9,.24,.1,'red');
      handle(-4.8,20.1,-4.8,9.6,'steel');
      for(const x of [-4.8,4.1]) box(x,3.2,-4.8,.7,17,.8,'steel');
      box(-4.6,9.5,2.8,9.2,.8,.7,'steel');
      break;
    case 'icu_syringe_pump_bank':
      box(-6.1,0,-4.45,12.2,.8,8.9,'coal');
      for (const x of [-6.1,5.25]) box(x,.8,-4.45,.85,12.5,8.9,'coal');
      box(-6.1,13.3,-4.45,12.2,.65,8.9,'coal');
      for (const y of [1.05,5.03,9.01]) {
        box(-5.2,y,-4.18,10.4,3.5,8.25);
        box(-4.73,y+.7,4.12,5.85,2.1,.32,'coal');
        box(-4.42,y+1.22,4.46,3.8,1.06,.45,'glass');
        box(-.57,y+1,4.46,.71,1.46,.45);
        box(2,y+.6,4.12,2.6,2.35,.36,'coal');
        for(const x of [2.25,3.45]) box(x,y+1.91,4.51,.74,.56,.16,'lime');
      }
      break;
    case 'icu_pulse_oximeter':
      box(-4.7,0,-3.7,8.7,1.25,7.6,'steel');
      box(-3.8,1.25,-2,6.1,7.9,4.1,'coal');
      panel(-3.05,3.65,2.14,4.6,4.6); buttonRow(-2.6,2.29,2.22,4);
      box(3.75,.27,3.4,3.4,1.25,2.8,'red');
      box(4,.76,6.22,2.75,.33,.1,'coal');
      tube([[2.3,1.65,1.5],[5.4,1.65,1.5],[5.4,1.65,3.6]],'coal',.36);
      break;
    case 'icu_emergency_cart':
      cart('red'); box(-5.95,3.25,-4.65,11.9,10.3,9.3,'red');
      for(const [i,color] of ['red','amber','blue','aqua','purple'].entries()) {
        drawer(-5.5,3.55+i*1.9,4.7,11,1.68,color);
        box(-4.86,4.02+i*1.9,5.23,1.15,.65,.1,'ivory');
      }
      box(-6.4,13.55,-5.05,12.8,1,10.1);
      box(-6.4,14.55,-5.05,12.8,.74,.65);
      for(const x of [-6.4,5.75]) box(x,14.55,-4.4,.65,.74,9.45);
      break;
    case 'icu_exam_lamp':
      cart('ivory'); box(4.2,3.25,-.6,1.25,22.35,1.2,'steel');
      box(3.7,12.5,-.87,2.2,2.15,1.73,'ivory');
      tube([[4.8,25.65,0],[1.5,25.65,0],[1.5,24.3,0],[-1.4,24.3,0],[-1.4,22.75,0],[-4.4,22.75,0],[-4.4,21.15,0]],'ivory',1);
      box(-7.1,19.1,-2.85,6.6,1.7,5.7);
      box(-6.67,18.84,-2.45,5.74,.24,4.9,'warm');
      for (const x of [-5,-3.1]) box(x,18.79,-2.45,.18,.04,4.9,'ivory');
      break;
    case 'police_body_camera_dock':
      box(-6,0,-4.8,12,2.3,9.6,'navy');
      box(-5.55,2.3,-4.3,11.1,.5,8.6,'coal');
      box(-1.9,1.12,4.82,3.8,.38,.09,'lime');
      for(const x of [-4.6,1.2]) for(const z of [-3.65,.95]) {
        box(x,2.8,z,3.4,4.8,2.65,'coal');
        box(x+.85,5.1,z+2.67,1.65,1.55,.37,'navy');
        box(x+1.31,5.5,z+3.06,.73,.75,.15,'steel');
      }
      break;
    case 'police_evidence_workbench':
      box(-6.65,0,-4.75,13.3,8.6,9.5,'coal');
      box(-7,8.6,-5.1,14,1.05,10.2,'wood');
      for(const y of [1,3.3,5.6]) drawer(-6.25,y,4.78,6.25,1.8,'navy');
      box(.27,.7,4.78,6,7.1,.5,'navy'); box(.75,2.65,5.3,.4,2.2,.3,'steel');
      for(const [x,h] of [[-6.1,2.6],[-3.95,3.7]]) {
        box(x,9.65,-3.35,1.85,h,.92,'glass');
        box(x,9.5+h,-2.41,1.85,.24,.12,'red');
        box(x+.4,9.9,-2.4,1.05,.74,.31,'amber');
      }
      box(-4.45,9.65,.2,6.1,.55,3.7,'steel');
      for(const [i,color] of ['amber','coal','wood'].entries()) {
        box(-4.15+i*1.93,10.22,.44,1.46,.44,1.65,color);
        box(-4.1+i*1.93,10.24,2.4,1.37,.92,.5);
      }
      box(2.35,9.65,-1.75,3.95,1.45,4.1,'coal');
      box(2.15,11.13,-1.9,4.35,.5,3.15,'steel');
      box(2.9,10.05,2.38,2.6,.55,.12,'lime');
      break;
    case 'police_checkpoint_kit':
      box(-7,0,-6.2,14,.48,12.4,'coal');
      for(const [x,z] of [[-6,2.1],[-1.1,2.7],[-5.05,-3.2]]) {
        box(x,.48,z,3.8,.52,3.6,'orange');
        box(x+.51,1,z+.5,2.78,1.27,2.6,'orange');
        box(x+.82,2.27,z+.78,2.16,.91,2.04,'ivory');
        box(x+1.12,3.18,z+1.05,1.56,1.04,1.5,'orange');
        box(x+1.42,4.22,z+1.32,.96,.89,.96,'orange');
      }
      box(1.2,.48,-4.8,5.5,.47,4.15,'navy');
      box(2.2,.93,-3.7,.7,5,1,'steel'); box(5,.93,-3.7,.7,5,1,'steel');
      box(1.22,3.4,-2.8,5.44,4.55,.48,'navy');
      const sign=box(1.46,3.73,-2.29,4.96,3.9,.04,'navy');
      sign.uv={south:{uv:displayUV,uv_size:displaySize,material_instance:'ware'}};
      break;
    case 'police_breathalyzer_kit':
      box(-6.5,0,-4.7,13,.64,9.4,'navy');
      for(const x of [-6.5,5.95]) box(x,.64,-4.7,.55,1.7,9.4,'navy');
      box(-5.95,.64,4.14,11.9,1.7,.56,'navy');
      box(-6.5,.64,-4.7,13,7.7,.82,'navy');
      box(-5.94,2.25,-3.86,11.88,5.65,.26,'coal');
      box(-5.8,.65,-3.65,11.6,.34,7.55,'coal');
      box(-4.7,1,-2.6,4.8,1.25,5.5,'steel');
      panel(-4.31,2.13,-1.8,3.97,1.6);
      for(const z of [-2.55,-.55,1.45]) box(2.1,1,z,2.7,.58,.64);
      for(const x of [-4.8,3.9]) box(x,1.15,4.72,.9,.8,.23,'steel');
      break;
    default: throw new Error('Unknown 0.8.2 prop '+key);
  }

  for (const cube of cubes) {
    const row = 56+swatches.indexOf(cube.color)*4;
    cube.uv ??= {};
    for (const face of ['north','south','east','west','up','down']) {
      cube.uv[face] ??= {uv:[100,row],uv_size:[26,3],material_instance:'ware'};
    }
  }
  const output = northFacingCubes(pruneFaces(cubes));
  const {low,high}=modelBounds(output);
  const height=patch082ById.get('mcpe_food:'+key).height*16;
  if(output.length>256||low[0]<-8||high[0]>8||low[2]<-8||high[2]>8||low[1]<0||high[1]>height) {
    throw new Error('0.8.2 model exceeds its placement bounds: '+key);
  }
  return output;
}

export function patch082Texture(key) {
  const image=canvas(128,128,[223,224,213,255]);
  const mer=canvas(128,128,[0,0,172,255]);
  const definition=patch082ById.get('mcpe_food:'+key);
  for(const [i,role] of swatches.entries()) {
    const y=56+i*4;
    rect(image,99,y,29,4,[...colors[role],255]);
    rect(mer,99,y,29,4,[role==='steel'?120:0,role==='lime'&&definition.lit?12:0,role==='steel'?98:175,255]);
  }
  if(key==='police_checkpoint_kit') {
    rect(image,0,0,96,48,[37,61,107,255]);
    rect(image,5,4,86,2,[221,230,234,255]);
    rect(image,5,42,86,2,[221,230,234,255]);
    text(image,'CHECK',17,16,2,[227,232,235,255]);
  } else if (displayLabels[key]) {
    rect(image,0,0,96,48,[16,31,45,255]);
    text(image,displayLabels[key],5,5,2,[185,231,230,255]);
    if(key!=='police_breathalyzer_kit') {
      for (let x=5;x<91;x++) {
        const pulse=x%21;
        const y=32-(pulse===5?11:pulse===6?7:pulse===7?-4:pulse>12&&pulse<16?3:0);
        rect(image,x,y,1,2,[65,201,187,255]);
      }
    }
    rect(mer,0,0,96,48,[0,12,66,255]);
  }
  return {width:128,height:128,pixels:image.data,png:png(128,128,image.data),mer:png(128,128,mer.data)};
}
