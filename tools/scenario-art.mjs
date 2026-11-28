/** Original modeled silhouettes and authored UV islands for static scene devices. */
import {canvas,rect,text,png} from './art.mjs';
import {disc,ring,pruneFaces} from './detail-art.mjs';
import {scenarioScreens,scenarioById} from '../.build/scenario-catalog.js';
export function scenarioCubes(key,wall=false){
 const a=[],put=(x,y,z,w,h,d,c=0)=>{const b={origin:[x,y,z],size:[w,h,d],color:c,material:'ware'};a.push(b);return b;};
 const round=(x,y,z,r,h,c=0)=>disc(a,x,y,z,r,r,h,c,'ware',16);
 const panel=(x,y,z,w,h)=>{const b=put(x,y,z,w,h,.06,1);b.uv={south:{uv:[0,0],uv_size:[96,56],material_instance:'ware'}};return b;};
 const buttons=(x,y,z,n=4)=>{for(let i=0;i<n;i++)put(x+i*.65,y,z,.4,.4,.12,i===0?4:2);};
 const vent=(x,y,z,w,n=6)=>{for(let i=0;i<n;i++)put(x,y+i*.35,z,w,.12,.06,1);};
 const verticalDisk=(cx,cy,z,r,depth,c=1)=>{for(let i=0;i<24;i++){const y=-r+(i+.5)*2*r/24,w=Math.sqrt(Math.max(0,r*r-y*y));put(cx-w,cy+y-r/24,z,2*w,2*r/24,depth,c);}};
 const verticalRing=(cx,cy,z,r,t,depth,c=2)=>{for(let i=0;i<28;i++){const y=-r+(i+.5)*2*r/28,outer=Math.sqrt(Math.max(0,r*r-y*y)),inner=Math.abs(y)<r-t?Math.sqrt((r-t)**2-y*y):0;for(const side of[-1,1])put(cx+(side<0?-outer:inner),cy+y-r/28,z,outer-inner,2*r/28,depth,c);}};
 const wheels=(y=0)=>{for(const x of[-4.5,3.5])for(const z of[-3,2]){put(x,y,z,1,1.2,1,1);put(x+.3,y+1.2,z+.3,.4,.6,.4,2);}};
 const cabinet=(h=10,w=12,d=9)=>{put(-w/2,0,-d/2,w,h,d,0);put(-w/2+.4,.4,d/2+.02,w-.8,h-.8,.12,3);};
 const monitor=(x,y,z,w=10,h=6)=>{put(x-.3,y-.3,z-.3,w+.6,h+.6,.5,1);panel(x,y,z+.22,w,h);};
 switch(key){
 case 'aed_cabinet':put(-5.5,0,0,11,12,1.2,3);put(-5, .5,1.2,10,11,.2,0);put(-3.3,1.6,1.45,6.6,7.2,.7,4);put(-2.5,3,2.17,5,3,.03,0);put(-.4,2.4,2.22,.8,4.2,.03,0);put(4.2,5,1.5,.3,2,.5,2);break;
 case 'wall_diagnostic_station':put(-6,0,0,12,11,.7,0);for(let i=0;i<3;i++){put(-4.6+i*3.4,4,.8,1.1,4,1,1);put(-4.8+i*3.4,8,.8,1.5,1.3,1.2,2);for(let j=0;j<8;j++)put(-4.3+i*3.4,1+j*.36,.8,.35,.22,.4,1);}break;
 case 'patient_monitor':put(-4,0,-2,8,.5,4,0);put(-.6,.5,-.6,1.2,2,1.2,2);monitor(-5,2.5,0,10,6);buttons(-3,2, .6);break;
 case 'ultrasound_cart':wheels();put(-5,1.8,-4,10,2,8,0);for(const x of[-4,3])put(x,3.8,-2,1,9,1,2);put(-5,12,-4,10,.7,8,0);monitor(-4,15,-1,8,6);for(let j=0;j<3;j++)buttons(-3.6,12.75,-1+j,10);put(4.8,9,0,.6,4,1,1);break;
 case 'infusion_pump_stand':for(const z of[-4,3])put(-4,0,z,8,.5,.7,2);put(-.25,.5,-.25,.5,31.5,.5,2);put(-4,30.5,-.25,8,.35,.5,2);put(-3.5,25.5,-.8,2,4,1.3,3);put(-3,24.7,-.4,1,.8,.5,2);put(-2,9,-1,4,5,2,0);monitor(-1.6,11,1,3.2,2);for(let i=0;i<24;i++)put(-2.9,5+i*.8,-.4,.12,.6,.12,3);break;
 case 'ecg_machine':put(-5,0,-3.5,10,3,7,0);put(3.6,3.05,-2,.4,.5,4,2);put(-3,3.05,2,5,.03,2.4,3);panel(-4,1,3.51,5,1.5);for(let i=0;i<4;i++)put(1.5+i*.6,1,3.53,.35,.35,.1,2);put(-4,3,-2,8,.08,4,3);for(let i=0;i<9;i++)put(-3+i*.7,3.1,-1, .2,.03,1+i%3*.4,1);break;
 case 'medical_trolley':
  wheels();
  for(const y of [2,9.4]){
   put(-5,y,-3.5,10,.44,7,2);
   for(const x of [-5,4.62])put(x,y+.44,-3.5,.38,1.08,7,0);
   for(const z of [-3.5,3.11])put(-4.62,y+.44,z,9.24,1.08,.39,0);
  }
  for(const x of [-4.7,4.02])for(const z of [-3.25,2.65])put(x,1.77,z,.68,7.63,.66,2);
  break;
 case 'laboratory_microscope':put(-3.5,0,-3,7,.6,6,0);put(1,.6,-2,1.3,7,1.4,2);put(-2.5,4,-2,5,.4,4,1);put(-.5,6,-.7,1,2,1,2);put(-1.2,8,-1,3,1.4,2,0);put(-2,9,-.6,1.3,2,1,1);put(-2.2,11,-.8,1.7,.4,1.4,1);for(const x of[.8,2.3])put(x,3.2,-1, .6,1.3,1.3,1);break;
 case 'arcade_cabinet':cabinet(23,12,10);put(-6,23,-5,12,3,10,4);monitor(-4.8,12,5.17,9.6,9);put(-6,9,3,12,1,4.5,1);put(-3,10,5,.4,1.5,.4,2);round(-2.8,11.5,5.2,.65,.7,4);buttons(.5,10,6,5);put(-2,3,5.18,4,.35,.15,1);break;
 case 'game_console_set':put(-5,0,-4,5,2,7,0);put(-4.6,.5,3.05,4,.18,.06,1);for(const x of[1,4]){put(x,0,0,2.5,.6,3,1);buttons(x+.2,.65,1.2,3);}vent(-4,.3,-4.05,3,3);break;
 case 'flat_screen_tv':if(!wall){put(-4,0,-2,8,.35,4,1);put(-.5,.35,-.5,1,2,1,2);}monitor(-7,wall?1:2.5,0,14,8);break;
 case 'atm_terminal':cabinet(24,12,10);monitor(-4.3,14,5.17,8.6,6);put(-4.7,10,5.2,9.4,.7,1.8,2);buttons(-3.6,10.8,6.3,8);put(-3,5,5.18,6,.4,.3,1);put(3,12,5.18,1.2,.25,.2,4);break;
 case 'banknote_counter':put(-4,0,-3.5,8,4,7,0);put(-3,4,-2,6,.4,4,1);for(const x of[-3.2,2.7])put(x,4,-3,.5,3,2,0);for(let i=0;i<7;i++)put(-2.5,4.5+i*.14,-2,5,.09,2,5);panel(-2,1,3.51,4,1.5);break;
 case 'queue_ticket_kiosk':put(-4,0,-3,8,.5,6,2);put(-2,.5,-1.5,4,13,3,0);monitor(-4,14,0,8,8);put(-2,10,1.6,4,.25,.2,1);put(-1.5,8.5,1.65,3,1.4,.05,3);break;
 case 'ai_inference_workstation':cabinet(12,8,10);for(let i=0;i<3;i++){put(-3,1+i*3.1,5.18,6,2.6,.2,1);vent(-2.7,1.3+i*3.1,5.4,4.5,5);}panel(-2.5,10.4,5.4,5,1);break;
 case 'ai_dual_screen_desk':put(-7,10,-4.5,14,.6,9,5);for(const x of[-6,5])for(const z of[-3.5,3])put(x,0,z,1,10,1,1);for(const x of[-6.4,.4]){put(x+2.4,10.6,-1,.5,2,.5,2);monitor(x,12.6,0,6,5);}for(let j=0;j<3;j++)for(let i=0;i<9;i++)put(-4+i*.8,10.7,1.5+j*.6,.6,.12,.4,1);put(4,10.7,2,1.2,.3,1.7,1);break;
 case 'ai_compute_rack':cabinet(27,12,10);for(let i=0;i<7;i++){put(-5.3,1+i*3.6,5.2,10.6,3.2,.2,1);vent(-4.7,1.4+i*3.6,5.42,7,5);put(4,2+i*3.6,5.43,.5,.3,.04,4);}panel(-3,26,5.43,6,.7);break;
 case 'pen_display_set':put(-5,0,-3,10,.4,6,1);const p=put(-4.5,.41,-2.5,9,.03,5,1);p.uv={up:{uv:[96,56],uv_size:[-96,-56],material_instance:'ware'}};put(5.5,0,-2,.3,.35,5,2);for(let i=0;i<4;i++)put(-4+i*.8,.45,2.6,.45,.05,.2,2);put(-.5,0,-3.8,1,.3,.8,1);break;
 case 'wall_air_conditioner':put(-7,1,0,14,5,3,0);put(-6.7,1.2,3.02,13.4,.6,.05,1);for(let i=0;i<6;i++)put(-6.2,2+i*.4,3.02,10,.1,.04,3);put(5,2.5,3.04,.5,.25,.04,2);break;
 case 'microwave_oven':
  put(-6.5,0,-4.5,13,7,9,0);put(-6.12,.42,4.5,9.92,6.17,.27,2);
  put(-5.7,.92,4.77,8.26,5.11,.15,1);
  for(let i=0;i<12;i++)for(let j=0;j<6;j++)put(-5.42+i*.57,1.28+j*.68,4.92,.16,.16,.025,2);
  put(3.04,1.08,4.77,.55,4.88,.38,2);
  put(4.1,.42,4.5,2.02,6.17,.25,2);put(4.33,5.12,4.75,1.56,.83,.07,1);
  for(let i=0;i<3;i++)buttons(4.37,2.6+i*.63,4.75,2);
  for(let i=0;i<5;i++)put(-6.55,1.05+i*.65,-3.5,.05,.2,3.3,1);
  break;
 case 'front_load_washer':cabinet(12,12,10);put(-5.5,10.1,5.2,11,1.4,.1,2);verticalDisk(0,5.8,5.2,3.4,.08,1);verticalRing(0,5.8,5.3,3.9,.6,.3,2);put(3,5.1,5.65,.45,1.3,.25,1);put(3.5,10.4,5.4,1,1,.2,1);break;
 case 'floor_air_conditioner':cabinet(25,8,8);for(let i=0;i<13;i++)put(-3.2,10+i*.8,4.2,6.4,.3,.1,1);put(-2,5,4.2,4,2,.1,2);break;
 case 'standing_fan':round(0,0,0,4,.5,1);put(-.3,.5,-.3,.6,13,.6,2);verticalDisk(0,17.5,-.5,4.2,.3,1);verticalRing(0,17.5,0,4.3,.35,.4,2);for(let i=-6;i<=6;i++){const x=i*.6,h=Math.sqrt(16-x*x);put(x-.05,17.5-h,.42,.1,h*2,.08,2);}for(const side of[-1,1]){put(side<0?-3.1:.4,17.1,.05,2.7,.9,.25,4);put(-.45,side<0?14.4:17.9,.06,.9,2.7,.25,4);}put(-.6,16.9,.55,1.2,1.2,.3,1);break;
 case 'air_purifier':cabinet(11,7,7);vent(-2.9,1,3.7,5.8,20);put(-2.4,11,-2,4.8,.1,4,1);break;
 case 'robot_vacuum_dock':put(-3,0,-5,6,7,3,0);put(-2,1,-1.9,4,4,.1,1);round(0,0,2.7,3.5,1.4,1);round(0,1.4,2.7,1,.4,2);break;
 case 'electric_kettle':round(0,0,0,2.7,.4,1);round(0,.4,0,2.4,4.5,0);round(0,4.9,0,2.3,.3,2);put(-.4,5.2,-.4,.8,.5,.8,1);put(2.2,1,-.5,1,3.4,1,1);put(-3.6,3.1,-.6,1.8,1.1,1.2,0);break;
 case 'rice_cooker':round(0,0,0,3.5,.5,1);round(0,.5,0,3.5,3.8,0);round(0,4.3,0,3.4,.4,2);put(-1,4.7,-.5,2,.5,1,1);put(-1.5,1,3.1,3,1,.4,2);break;
 case 'dishwasher':cabinet(12,12,10);put(-5.5,10,5.18,11,1.5,.15,1);put(-4.5,8.8,5.4,9,.4,.4,2);buttons(-3,10.4,5.4,7);break;
 case 'electronic_whiteboard':monitor(-7,1,0,14,10);put(-6.5,.7,.5,13,.2,.7,2);put(3,.95,.7,2,.1,.15,4);break;
 case 'teaching_lectern':cabinet(15,12,9);put(-7,15,-5,14,.5,10,5);monitor(-4.5,15.6,-2,7,4);put(5,15.5,0,.18,5,.18,1);put(4.6,20,0,1,.4,.5,1);break;
 case 'document_camera':put(-4,0,-3,8,.4,6,0);put(2,.4,-2,.5,8,.5,2);put(-1.5,8.4,-2,4,.5,.5,2);put(-2,8,-2.5,1.7,.8,1.5,1);put(-3,.41,-1.8,5,.03,3.8,3);break;
 default:throw Error('Unknown scenario model '+key);
 }
 if(key==='wall_air_conditioner')for(const c of a){c.origin=c.origin.map(v=>v*8/7);c.size=c.size.map(v=>v*8/7);}
 for(const c of a)for(const f of ['north','south','east','west','up','down']){c.uv??={};c.uv[f]??={uv:[98,(c.color??0)*10+60],uv_size:[28,8],material_instance:'ware'};}
 return pruneFaces(a);
}
export function scenarioTexture(key){
 const colors=[[222,228,226,255],[24,33,43,255],[137,153,163,255],[247,245,229,255],[55,154,155,255],[176,143,100,255]];
 const color=canvas(128,128,colors[0]),mer=canvas(128,128,[0,0,180,255]);
 for(let i=0;i<colors.length;i++){rect(color,96,60+i*10,32,10,colors[i]);rect(mer,96,60+i*10,32,10,[i===2?170:0,0,i===2?100:185,255]);}
 rect(color,0,0,96,56,[17,31,47,255]);
 if(['patient_monitor','ecg_machine'].includes(key)){for(let x=0;x<96;x++){const y=27+(x%24===13?-17:x%24===14?15:Math.round(Math.sin(x*.3)*2));rect(color,x,y,1,2,[93,223,171,255]);}text(color,'72  98',6,5,1,[195,232,220,255]);}
 else if(key==='electronic_whiteboard'){rect(color,0,0,96,56,[224,233,223,255]);text(color,'SCIENCE',6,5,1,[29,60,73,255]);text(color,'E=MC2',15,23,2,[29,60,73,255]);}
 else if(key==='arcade_cabinet'){for(let i=0;i<7;i++)rect(color,10+i*11,12+i%3*6,7,5,[230,172,86,255]);rect(color,38,46,19,3,[104,204,188,255]);}
 else{for(let i=0;i<5;i++){rect(color,5,8+i*8,38+i%3*13,2,[85,173,170,255]);rect(color,67,8+i*8,22,5,[43+i*12,74+i*10,104+i*8,255]);}text(color,scenarioById.get('mcpe_food:'+key)?.group.startsWith('ai')?'AI':'STATUS',5,1,1,[207,226,215,255]);}
 if(scenarioScreens.has(key))rect(mer,0,0,96,56,[0,12,65,255]);
 return{width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}
