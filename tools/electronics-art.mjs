import {fixedLaptopKeys} from '../.build/electronics-catalog.js';
/** Original 128px UV atlases and modeled electronics; units are sixteenths of a block. */
import {lifestyleCubes,lifestyleTexture} from './lifestyle-art.mjs';
import {serviceCubes,serviceTexture} from './service-art.mjs';
import {canvas,rect,text,png} from './art.mjs';
import {modelBounds,pruneFaces} from './detail-art.mjs';
import {bakeDeviceTilts} from './device-geometry.mjs';
export const electronicUV = {
  screen:[0,0,96,56], keyboard:[0,64,80,40], logo:[96,0,32,32],
  vents:[96,32,32,24], ports:[0,112,80,16], trackpad:[80,64,16,24]
};
const faceNames=['north','south','east','west','up','down'];
const uv=(region)=>({uv:region.slice(0,2),uv_size:region.slice(2),material_instance:'ware'});
const swatch=role=>[96+(role%2)*16,64+Math.floor(role/2)*8,16,8];
function part(x,y,z,w,h,d,role=0,overrides={},rotation,pivot){
  return {origin:[x,y,z],size:[w,h,d],color:role,material:'ware',
    uv:Object.fromEntries(faceNames.map(face=>[face,uv(overrides[face]??swatch(role))])),
    ...(rotation?{rotation,pivot}:{}),...(overrides.only?{faces:overrides.only}:{})};
}
export function electronicCubes(device){
  if(device.model==='network')return lifestyleCubes(device.key);
  if(['register','scanner','receipt'].includes(device.model))return serviceCubes(device.key);
  const a=[],put=(...args)=>{const p=part(...args);a.push(p);return p;};
  function feet(x,z,w,d,y=.02){for(const px of[x+.35,x+w-.75])for(const pz of[z+.3,z+d-.7])put(px,y,pz,.4,.16,.4,5);}
  function keyboard(x,y,z,w,d,body=1){
    const start=a.length;
    put(x,y,z,w,.28,d,body);put(x+.2,y+.285,z+.2,w-.4,.025,d-.4,2,{up:electronicUV.keyboard,only:['up']});
    for(const c of a.slice(start))c.tag='keyboard';
  }
  function mouse(x,y,z,body=1){const start=a.length;put(x+.08,y,z,.9,.25,1.5,body);put(x,y+.25,z+.15,1.06,.3,1.3,body);put(x+.48,y+.555,z+.3,.09,.06,.5,7);put(x+.515,y+.25,z+.12,.02,.27,.6,5);for(const c of a.slice(start))c.tag='mouse';}
  function monitor(x,y,z,w,h,body=1,rot,pivot){
    const start=a.length;
    put(x,y,z,w,h,.5,body,{},rot,pivot).tag='lid_shell';
    // A 0.10-unit normal gap also clears the 1/8-unit staircase at oblique views.
    const revised=fixedLaptopKeys.has(device.key);
    const margin=revised?.21:.32;
    put(x+margin,y+(revised?.26:.35),z+.60,w-2*margin,h-(revised?.54:.72),.025,3,{south:electronicUV.screen,only:['south']},rot,pivot).tag='screen';
    if(!['macbook_pro','air_silver','air_gray'].includes(device.style))put(x+w*.48,y+h-.16,z+.66,.12,.08,.025,5,{},rot,pivot);
    put(x+w*.48,y+.08,z+.66,.11,.065,.025,13,{},rot,pivot);
    put(x+w*.34,y+h*.38,z-.10,w*.32,h*.3,.025,body,{north:electronicUV.logo,only:['north']},rot,pivot);
    // Keep the lid's side faces off the base's side plane at the hinge join.
    if(rot?.[0])for(const c of a.slice(start)){c.origin[0]*=.995;c.size[0]*=.995;}
  }
  switch(device.model){
    case 'desktop':{
      feet(-4.7,-4.3,4.4,2.5);put(-4.7,.17,-4.3,4.4,.22,2.5,1);put(-3.05,.39,-4.1,1.1,3.8,.8,7);
      monitor(-6.7,4.12,-4.5,9.2,6.15);
      keyboard(-6.3,.2,1.8,8.6,3.7);mouse(2.9,.15,4.6);
      feet(4,-4.8,3.1,7.1);put(4,.18,-4.8,3.1,9.5,7.1,0);
      put(4.15,.4,2.31,2.8,8.9,.12,1);put(4.5,1.3,2.44,2.1,5.9,.04,1,{south:electronicUV.vents,only:['south']});
      put(4.45,8.45,2.44,2.2,.35,.06,1,{south:electronicUV.ports,only:['south']});put(5.35,7.65,2.48,.45,.2,.05,13);
      put(7.11,1,-4.1,.025,6.5,5.6,1,{east:electronicUV.vents,only:['east']});
      put(4.2,1,-4.86,2.7,7.7,.06,1);
      put(4.55,1.5,-4.89,2,2.2,.03,2,{north:electronicUV.ports,only:['north']});
      put(4.55,4,-4.89,2,3.9,.03,2,{north:electronicUV.vents,only:['north']});
      put(-5.9,3.85,-4.05,1.1,.42,.38,7);
      break;
    }
    case 'all_in_one':
      feet(-3,-4.8,6,3.6);put(-3,.17,-4.8,6,.23,3.6,7);put(-.55,.4,-4.2,1.1,3.1,.6,7);
      monitor(-6.5,3.5,-4.6,13,8.65,7);put(-6.1,3.55,-4.05,12.2,.85,.035,7);
      keyboard(-6,.2,2.1,9.6,3.8,7);mouse(4.2,.15,3.6,7);break;
    case 'laptop':{
      const gaming=device.style==='gaming',pro=device.style==='macbook_pro',dell=device.style==='dell',air=device.style.startsWith('air_'),thinkbook=device.style==='thinkbook',thick=gaming?.84:pro?.65:device.style==='thinkpad'?.6:thinkbook?.55:air?.27:dell?.4:.35;
      const body=['silver','macbook','dell','thinkbook','air_silver'].includes(device.style)?7:pro||air?11:1,w=gaming?12:dell?12.25:pro?12.4:thinkbook?12.8:air?11.8:11.4,d=thinkbook?9:air?8.1:dell?8.7:8.3,x=-w/2,z=-4.15;
      feet(x,z,w,d);put(x,.18,z,w,thick,d,body);
      put(x+.3,.3,z-.025,w-.6,Math.max(.12,thick-.12),.025,1,{north:electronicUV.ports,only:['north']});
      put(x-.025,.28,z+1,.025,Math.max(.13,thick-.16),5,1,{west:electronicUV.ports,only:['west']});
      put(x+w+.005,.28,z+1,.025,Math.max(.13,thick-.16),5,1,{east:electronicUV.ports,only:['east']});
      if(device.pose==='closed'){
        put(x,.18+thick+.035,z,w,gaming?.5:.25,d,body);
        if(dell)put(x+.45,.22,z+d+.013,w-.9,.12,.02,7);
        put(-1.55,.18+thick+.035+(gaming?.505:.255),-.9,3.1,.02,2.7,body,{up:electronicUV.logo,only:['up']});
      }else{
        const y=.18+thick;
        keyboard(x+.35,y+.015,-2.95,w-.7,3.5,body);
        put(-1.7,y+.03,1.1,3.4,.035,2.05,0,{up:electronicUV.trackpad,only:['up']});
        if(device.style==='thinkpad'){
          put(-.14,y+.33,-1.15,.28,.09,.28,6);
          for(let i=0;i<3;i++)put(-1.65+i*1.12,y+.05,.67,1.02,.06,.28,i===0?6:2);
        }
        for(const side of[-1,1])put(side*3.8-.5,y-.03,-4.1,1,air?.30:.33,.5,body);
        const pivot=[0,y,-4],rotation=device.openAngle===90?undefined:[-20,0,0];
        // Preserve legacy block selection bounds when the top edge stands upright.
        const screenHeight=device.openAngle===90?(dell?7.49:pro?7.53:7.16)
          :thinkbook?8:pro||dell?7.8:gaming?7.6:air?7.4:7.1;
        monitor(x,y,-4.18,w,screenHeight,body,rotation,pivot);
        if((pro||air)&&device.openAngle!==90)put(-.65,y+screenHeight-.37,-3.50,1.3,.22,.035,1,{},rotation,pivot);
        if(thinkbook){put(x+.3,y+.02,.85,.5,.025,2.5,7,{up:electronicUV.vents,only:['up']});put(x+w-2.1,y+.02,3.4,1.6,.025,.55,7,{up:electronicUV.logo,only:['up']});}
        if(dell){put(x+.2,y+.015,.95,.5,.025,2.3,7,{up:electronicUV.vents,only:['up']});put(x+w-1.7,y+.02,2.9,1.2,.025,.55,7,{up:electronicUV.logo,only:['up']});}
        if(gaming)for(const side of[-1,1])put(side*4.2-.7,y+.015,.85,1.4,.025,2.2,1,{up:electronicUV.vents,only:['up']});
      }
      break;
    }
    case 'router':
      feet(-4.8,-2.9,9.6,5.8);put(-4.8,.18,-2.9,9.6,1.25,5.8,1);put(-4.45,1.44,-2.55,8.9,.12,4.9,1,{up:electronicUV.vents});
      for(let i=0;i<5;i++)put(-2.1+i,1.05,2.91,.23,.13,.04,i===4?9:4);
      put(-3.8,.52,-2.94,7.6,.55,.03,1,{north:electronicUV.ports,only:['north']});
      for(const x of[-4.35,-2.45,2.45,4.35]){put(x-.23,1.42,-2.65,.46,.5,.46,1);put(x-.16,1.85,-2.58,.32,5.85,.32,1,{},[0,0,x<0?6:-6],[x,1.85,-2.42]);}
      break;
    case 'server':
      feet(-4.8,-4.5,9.6,9);put(-4.8,.18,-4.5,9.6,15,9,0);
      put(-4.5,.45,4.51,.35,14.4,.22,7);put(4.15,.45,4.51,.35,14.4,.22,7);
      for(let i=0;i<5;i++){
        const y=1+i*2.65;put(-4.07,y,4.52,8.14,2.45,.14,1);
        put(-3.8,y+.28,4.67,6.1,1.8,.025,1,{south:electronicUV.vents,only:['south']});
        put(2.7,y+.4,4.68,.22,.18,.03,4);put(3.15,y+.4,4.68,.22,.18,.03,i%2?9:13);
        for(const x of[-3.93,3.58]){put(x,y+.45,4.69,.2,1.25,.32,7);}
      }
      put(-3.6,14.4,4.67,7.2,.45,.025,1,{south:electronicUV.ports,only:['south']});
      put(4.81,1.3,-3.5,.025,12.3,7,0,{east:electronicUV.vents,only:['east']});break;
    case 'tablet':{
      feet(-5.7,-4,11.4,8.4);put(-5.7,.18,-4,11.4,.24,8.4,7);
      keyboard(-5.3,.43,-1.8,10.6,3.4,8);put(-1.7,.44,2,3.4,.035,1.7,0,{up:electronicUV.trackpad,only:['up']});
      put(-4.8,.43,-3.85,9.6,.38,.65,7);
      put(-4.65,.8,-3.8,9.3,3.5,.22,8,{},[-6,0,0],[0,.8,-3.7]);
      put(-4.63,4.05,-4.23,9.26,.25,.3,7);
      const rotation=[-20,0,0],pivot=[0,3,-3.5];
      monitor(-5.5,3,-3.7,11,7.1,7,rotation,pivot);
      put(4.7,9.4,-3.9,.35,.35,.07,1,{},rotation,pivot);
      break;
    }
    case 'studio':{
      feet(-6.4,-4.8,9.1,3);put(-6.4,.18,-4.8,9.1,.24,3,7);put(-2.6,.42,-4.2,1.15,3,.6,7);
      monitor(-6.7,3.42,-4.7,10.5,7.3,7);
      keyboard(-6.2,.18,1.8,8.5,3.7,7);mouse(3,.18,4,7);
      feet(4.1,-4.6,3.4,5.1);put(4.1,.18,-4.6,3.4,2.9,5.1,7);
      put(4.25,1.1,.51,3.1,.45,.025,1,{south:electronicUV.ports,only:['south']});
      put(4.5,3.09,-3.2,2.6,.02,2.1,7,{up:electronicUV.logo,only:['up']});put(6.9,.6,.52,.14,.12,.04,4);break;
    }
    case 'surface':{
      put(-5.8,.12,-3.9,11.6,.25,8.4,1);keyboard(-5.4,.38,-2,10.8,3.4,1);
      put(-1.7,.4,2,3.4,.03,1.8,0,{up:electronicUV.trackpad,only:['up']});
      const pivot=[0,.65,-3.7],rotation=[-20,0,0];monitor(-5.8,.65,-3.9,11.6,8,7,rotation,pivot);
      // Open kickstand meets the rear of the tablet, independent of the keyboard.
      put(-4.9,.42,-6.5,9.8,3.25,.16,7,{},[30,0,0],[0,.42,-6.5]).tag='kickstand';
      put(-4.5,.38,-6.65,9,.08,.28,5);break;
    }
    case 'printer':{
      feet(-5.9,-4.7,11.8,9.4);put(-5.9,.18,-4.7,11.8,4.4,9.4,1);
      put(-6,4.6,-4.8,12,1.3,9.6,8);put(-5.7,5.92,-4.5,11.4,.35,9,8);
      put(-4.9,6.28,-3.5,9.8,.025,6.5,1);put(-4.5,6.31,-3.1,9,.025,5.7,8);
      put(-4.6,.65,4.71,9.2,1.5,.03,5);put(-4.7,.4,4.8,9.4,.18,2.2,1);
      put(-3.7,.60,4.9,7.4,.035,1.9,8,{up:electronicUV.keyboard,only:['up']});
      put(-5.5,3.2,4.71,3.5,.8,.04,1,{south:electronicUV.ports,only:['south']});
      for(let i=0;i<3;i++)put(3+i*.6,3.6,4.71,.28,.28,.06,i===2?4:1);break;
    }
    case 'crt':{
      feet(-4.3,-2.6,8.6,5.8);put(-4.3,.18,-2.6,8.6,.55,5.8,8);put(-2.7,.73,-1.8,5.4,1.1,3.4,8);
      put(-5.8,1.83,-3.4,11.6,8.55,6.5,8);put(-4.9,2.45,-5,9.8,7.1,1.6,8);
      put(-5.5,2.2,3.11,11,7.8,.34,8);put(-4.8,3.45,3.46,9.6,5.8,.03,1);
      for(let i=0;i<8;i++){
        const x0=-4.6+i*1.15,x1=x0+1.15,z0=3.65+.35*Math.sin(i*Math.PI/8),z1=3.65+.35*Math.sin((i+1)*Math.PI/8);
        const length=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,angle=-Math.atan2(z1-z0,x1-x0)*180/Math.PI;
        put(cx-length/2,3.63,cz-.025,length,5.4,.025,3,{south:[i*12,0,12,56],only:['south']},[0,angle,0],[cx,3.63,cz]);
      }
      for(let i=0;i<3;i++)put(2.1+i*.7,2.55,3.48,.45,.25,.16,1);
      put(4.55,2.6,3.48,.26,.16,.08,4);put(-1.5,2.4,3.46,3,.55,.025,8,{south:electronicUV.logo,only:['south']});
      put(5.81,3,-2.9,.025,6.2,4.8,8,{east:electronicUV.vents,only:['east']});break;
    }
    case 'keyboard':keyboard(-6.8,.18,-2.6,10.9,5.2);mouse(5,.18,.3);break;
    default:throw new Error(`Unknown electronic model ${device.model}`);
  }
  // Entity coordinates reverse the front/back basis. Re-layout only these two
  // sets so the mouse is on the user's right when looking at the screen.
  if(['desktop','all_in_one','studio'].includes(device.model))for(const c of a){
    c.origin[0]=-c.origin[0]-c.size[0];
    [c.uv.east,c.uv.west]=[c.uv.west,c.uv.east];
    if(c.faces)c.faces=c.faces.map(f=>f==='east'?'west':f==='west'?'east':f);
  }
  const cubes=pruneFaces(bakeDeviceTilts(a)),bounds=modelBounds(cubes);
  if(cubes.length>256||bounds.low.some((n,i)=>n<(i===1?0:-8)-1e-6)||bounds.high.some((n,i)=>n>(i===1?16:8)+1e-6))throw new Error(`Electronic geometry exceeds one block: ${device.key}`);
  return cubes;
}

const rgb=hex=>hex.match(/\w\w/g).map(v=>parseInt(v,16));
export function electronicTexture(device){
  if(device.model==='network')return lifestyleTexture(device.key);
  if(['register','scanner','receipt'].includes(device.model))return serviceTexture(device.key);
  const color=canvas(128,128,[24,27,32,255]),mer=canvas(128,128,[0,0,195,255]);
  const metallic=['silver','macbook','ipad','dell','macbook_pro','air_silver','air_gray','thinkbook','studio','surface'].includes(device.style);
  const colors=[metallic?'#b8c0c8':'#3b424b','#20242b','#171b21','#162332','#58ca8c','#10141a','#c83343','#c4cad0','#d4d0be','#e6b65c','#bc63e5','#59616b','#323941','#83c7f1','#13181e','#4a5058'];
  const properties=colors.map((_,i)=>[i===7||i===11||i===0?190:0,[4,9,13].includes(i)&&device.pose!=='closed'?20:0,[0,7,11].includes(i)?104:i===3?36:i===5?230:190,255]);
  if(device.style==='macbook_pro')colors[7]='#646b74';
  if(device.style==='air_gray')colors[11]='#747c86';
  if(device.style==='printer'){colors[8]='#e7e9e7';properties[8]=[0,0,175,255];}
  if(!metallic&&device.model!=='desktop'&&device.model!=='server')properties[0][0]=0;
  function fill(region,c,profile){rect(color,...region,c.length===3?[...c,255]:c);rect(mer,...region,profile);}
  for(let i=0;i<16;i++){
    const region=swatch(i),base=rgb(colors[i]);fill(region,base,properties[i]);
    for(let y=region[1];y<region[1]+region[3];y++)for(let x=region[0];x<region[0]+region[2];x++){
      const n=((x*17+y*13)%7)-3,at=(y*128+x)*4;
      for(let k=0;k<3;k++)color.data[at+k]=Math.max(0,Math.min(255,base[k]+n));
    }
  }
  // Painted 80x40 keyboard island: legends, staggered rows, space bar, arrows.
  fill(electronicUV.keyboard,[49,54,61],[0,0,205,255]);
  for(let row=0;row<5;row++)for(let col=0;col<13;col++){
    const x=2+col*6+(row%2),y=65+row*7,c=device.style==='gaming'?[42+(col%3)*35,56+(row%2)*24,90+(col%4)*28,255]:[17,21,27,255];
    rect(color,x,y,5,6,c);rect(color,x+1,y+1,2,1,device.style==='gaming'?[124,209,225,255]:[179,185,190,255]);
  }
  rect(color,20,94,31,7,[19,23,29,255]);rect(color,64,95,5,4,[170,180,188,255]);
  if(device.style==='thinkpad')rect(color,36,79,3,3,[204,41,50,255]);
  if(device.style==='printer'){
    fill(electronicUV.keyboard,[238,240,238],[0,0,225,255]);
    for(let i=0;i<7;i++)rect(color,8,69+i*4,48+(i%3)*7,1,[115,129,135,255]);
  }
  fill(electronicUV.trackpad,[145,152,163],[0,0,130,255]);
  rect(color,81,65,14,1,[190,197,203,255]);rect(color,81,86,14,1,[88,97,108,255]);
  // Dedicated grille and IO islands: never shared with food or vanilla maps.
  fill(electronicUV.vents,device.style==='crt'?[173,171,155]:[39,45,53],[0,0,210,255]);
  for(let y=34;y<55;y+=3)for(let x=98;x<126;x+=4)rect(color,x,y,2,1,[8,13,19,255]);
  fill(electronicUV.ports,[40,46,55],[0,0,165,255]);
  for(let x=3;x<78;x+=13){rect(color,x,115,10,7,[7,12,17,255]);rect(color,x+2,117,6,2,[116,130,143,255]);}
  // Logo island has its own non-emissive profile, independent of the screen.
  fill(electronicUV.logo,rgb(colors[device.style==='crt'?8:metallic?7:1]),properties[metallic?7:1].map((n,i)=>i===1?0:n));
  if(['macbook','ipad','macbook_pro','air_silver','air_gray','studio'].includes(device.style)){
    const apple=['000001100000','000011000000','001110111000','011111111100','111111111100','111111110000','111111110000','111111111100','011111111100','001110111000'];
    apple.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')rect(color,100+x*2,6+y*2,2,2,[82,89,98,255]);}));
  }else if(device.style==='dell'){
    for(let y=2;y<30;y++)for(let x=98;x<126;x++){const r=Math.hypot(x-112,y-16);if(r>11&&r<12.5)rect(color,x,y,1,1,[55,73,91,255]);}
    text(color,'DELL',100,13,1,[48,64,81,255]);
  }else if(device.style==='thinkbook'){
    text(color,'THINK',97,7,1,[55,63,73,255]);text(color,'BOOK',99,18,1,[55,63,73,255]);
  }else if(device.style==='surface'){
    for(let y=0;y<2;y++)for(let x=0;x<2;x++)rect(color,103+x*10,7+y*10,8,8,[75,90,104,255]);
  }else if(device.style==='thinkpad'){
    text(color,'THINK',97,7,1,[220,222,225,255]);text(color,'PAD',104,17,1,[220,222,225,255]);rect(color,111,3,2,2,[209,45,55,255]);
  }else if(device.style==='gaming'){
    for(let i=0;i<10;i++){rect(color,101+i,6+i,2,2,[193,79,221,255]);rect(color,119-i,6+i,2,2,[110,177,230,255]);}
  }else text(color,device.style==='crt'?'CRT':'FT',device.style==='crt'?102:106,12,1,[device.style==='crt'?100:160,163,169,255]);
  const hasScreen=['desktop','all_in_one','laptop','tablet','crt','studio','surface'].includes(device.model)&&device.pose!=='closed';
  fill(electronicUV.screen,[14,24,39],[0,hasScreen?22:0,42,255]);
  if(hasScreen){
    for(let y=0;y<56;y++)for(let x=0;x<96;x++){
      let c;
      if(device.style==='crt')c=[10+Math.round(y*.08),30+Math.round(x*.08),24+Math.round(y*.1)];
      else if(device.style==='gaming')c=[25+Math.round(x*.48),15+Math.round(y*.35),50+Math.round((x+y)*.5)];
      else if(device.style==='thinkpad')c=[22+Math.round(y*.2),30+Math.round(x*.3),47+Math.round(y*.65)];
      else if(device.style==='ipad')c=[100+Math.round(70*Math.sin(x/25+y/20)),97+Math.round(y*.9),166+Math.round(55*Math.cos(x/28))];
      else if(device.style==='macbook')c=[52+Math.round(x*.9),79+Math.round(y*.9),135+Math.round(32*Math.sin(x/20+y/15))];
      else if(device.model==='all_in_one')c=[30+Math.round(y*.8),90+Math.round(x*.9),120+Math.round(y*1.1)];
      else c=[35+Math.round(x*.55),77+Math.round(y*.95),122+Math.round((x+y)*.55)];
      color.data.set([...c,255],(y*128+x)*4);
    }
    if(device.style==='crt'){
      text(color,'FOOD OS',5,5,1,[120,222,160,255]);text(color,'READY',5,17,1,[120,222,160,255]);
      for(let i=0;i<4;i++)rect(color,6,29+i*5,25+i*8,1,[61,143,97,255]);rect(color,6,49,4,2,[156,234,167,255]);
    }else if(device.style==='ipad'){
      for(let row=0;row<3;row++)for(let col=0;col<5;col++){const x=9+col*17,y=7+row*14;rect(color,x,y,9,9,[65+col*28,165-row*30,215-col*18,255]);rect(color,x+2,y+3,5,2,[235,238,247,255]);}
      rect(color,25,50,46,3,[220,222,232,255]);
    }else{
      rect(color,0,0,96,4,[28,36,47,255]);rect(color,0,51,96,5,[29,37,49,255]);
      for(let i=0;i<4;i++){rect(color,5,8+i*10,5,5,[105+i*25,174,207,255]);rect(color,4,14+i*10,10,1,[199,212,222,255]);}
      rect(color,30,13,53,29,[213,221,229,255]);rect(color,30,13,53,5,[47,67,90,255]);
      for(let i=0;i<4;i++)rect(color,35,22+i*4,20+(i%2)*17,1,[99,119,141,255]);
      for(let i=0;i<5;i++)rect(color,34+i*7,53,4,2,[143+i*15,188,214,255]);
      if(device.style==='gaming'){rect(color,33,20,47,19,[35,23,61,255]);text(color,'PLAY',40,25,1,[217,160,234,255]);}
    }
  }
  if(hasScreen&&(device.key==='silver_laptop_open'||device.style==='thinkbook'||device.style==='surface')){
    for(let y=0;y<56;y++)for(let x=0;x<96;x++){
      const r=Math.hypot((x-54)*.85,(y-25)*1.7),fold=Math.sin(Math.atan2(y-25,x-54)*5+r*.18);
      color.data.set([12+Math.round((fold+1)*12),45+Math.round((fold+1)*28),120+Math.round((fold+1)*52),255],(y*128+x)*4);
    }
    rect(color,0,50,96,6,[204,222,241,255]);
    for(let i=0;i<6;i++)rect(color,29+i*7,52,4,3,[30+i*24,103,181,255]);
    for(let y=0;y<2;y++)for(let x=0;x<2;x++)rect(color,29+x*2,51+y*2,1,1,[35,116,212,255]);
    for(let i=0;i<3;i++){rect(color,4,5+i*12,5,6,[130,190,238,255]);rect(color,3,12+i*12,10,1,[224,236,249,255]);}
  }
  if(hasScreen&&['macbook','macbook_pro','air_silver','air_gray','studio'].includes(device.style)){
    for(let y=0;y<56;y++)for(let x=0;x<96;x++){
      const ridge=Math.sin(x/15+y/11),warm=Math.sin(x/33-y/18);
      color.data.set([100+Math.round(55*warm),85+Math.round(35*ridge),152+Math.round(48*ridge),255],(y*128+x)*4);
    }
    rect(color,0,0,96,4,[207,202,217,255]);text(color,'MAC',3,0,1,[32,34,43,255]);
    rect(color,20,49,57,7,[189,187,204,255]);for(let i=0;i<8;i++)rect(color,23+i*6,50,4,5,[60+i*18,118+i*9,211-i*15,255]);
    const pro=device.style==='macbook_pro';rect(color,15,7,73,39,pro?[32,35,41,255]:[224,224,231,255]);rect(color,15,7,73,6,pro?[52,54,61,255]:[198,198,207,255]);
    for(let i=0;i<3;i++)rect(color,18+i*4,9,2,2,[[230,94,94,255],[235,192,73,255],[92,189,115,255]][i]);
    if(pro){
      text(color,'CHATGPT',39,8,1,[224,227,233,255]);rect(color,16,14,13,31,[24,27,32,255]);text(color,'GPT',35,16,1,[178,213,199,255]);
      rect(color,34,25,43,1,[201,207,216,255]);rect(color,34,28,36,1,[201,207,216,255]);
      rect(color,34,32,46,10,[15,23,24,255]);text(color,'AI READY',37,34,1,[111,197,151,255]);
      rect(color,34,43,45,2,[104,114,126,255]);
    }else{
      rect(color,16,14,17,31,[198,202,216,255]);text(color,'FINDER',41,8,1,[44,49,63,255]);
      for(let i=0;i<3;i++){rect(color,39+i*14,20,9,8,[105,168,219,255]);rect(color,38+i*14,30,11,1,[94,105,124,255]);}
    }
  }
  if(hasScreen&&device.style==='dell'){
    fill(electronicUV.screen,[9,16,18],[0,22,42,255]);
    text(color,'LINUX TTY1',3,3,1,[166,217,187,255]);text(color,'LOGIN: GUEST',3,12,1,[199,215,210,255]);
    text(color,'$ UNAME -A',3,23,1,[104,211,154,255]);text(color,'LINUX X86_64',3,32,1,[204,218,213,255]);text(color,'$ PYTHON3',3,43,1,[104,211,154,255]);rect(color,3,52,4,2,[201,234,217,255]);
  }
  if(hasScreen&&['air_silver','air_gray'].includes(device.style)){
    rect(color,5,6,86,42,[31,34,42,255]);rect(color,5,6,86,5,[48,51,61,255]);text(color,'VS CODE',29,6,1,[217,224,233,255]);
    for(let i=0;i<3;i++)rect(color,8+i*4,7,2,2,[[229,95,93,255],[229,187,76,255],[91,186,116,255]][i]);
    rect(color,6,12,6,35,[42,46,56,255]);rect(color,13,12,19,35,[35,39,48,255]);
    for(let i=0;i<5;i++){rect(color,7,15+i*6,3,3,[132,151,175,255]);rect(color,16,15+i*5,11+(i%2)*3,1,[152,167,183,255]);}
    text(color,'MAIN.TS',36,13,1,[178,193,211,255]);
    for(let i=0;i<6;i++){const y=21+i*3;rect(color,35,y,2,1,[105,115,134,255]);rect(color,40+(i%3)*3,y,9,1,[191,137,225,255]);rect(color,53+(i%3)*3,y,22-(i%2)*7,1,[126,194,179,255]);}
    rect(color,33,40,56,7,[22,26,32,255]);text(color,'> READY',36,41,1,[126,194,179,255]);
    rect(color,5,47,86,2,[42,117,170,255]);
  }
  if(hasScreen&&device.style==='studio'){
    rect(color,4,6,88,42,[32,35,43,255]);text(color,'EDIT',6,7,1,[221,226,233,255]);
    rect(color,6,14,21,20,[47,53,65,255]);for(let i=0;i<3;i++)rect(color,8,16+i*6,15,4,[84+i*19,119,155,255]);
    rect(color,30,14,58,22,[17,24,31,255]);rect(color,32,23,54,11,[73,125,132,255]);
    for(let i=0;i<4;i++)rect(color,39+i*11,18-i%2*3,9,15+i%2*3,[122+i*16,145+i*8,147,255]);
    for(let i=0;i<3;i++)for(let j=0;j<5;j++)rect(color,6+j*17,38+i*3,15,2,[79+i*40,122+j*12,177-i*22,255]);rect(color,46,37,1,10,[238,208,119,255]);
  }
  if(hasScreen&&device.style==='surface'){
    rect(color,10,6,79,41,[233,233,242,255]);rect(color,10,6,79,6,[106,78,160,255]);text(color,'NOTES',33,6,1,[244,244,250,255]);
    rect(color,11,13,17,33,[204,196,225,255]);for(let i=0;i<5;i++)rect(color,13,17+i*5,12,2,[139,125,164,255]);
    text(color,'IDEAS',33,16,1,[75,67,96,255]);for(let i=0;i<6;i++)rect(color,33,24+i*3,43-(i%3)*7,1,[113,124,143,255]);
  }
  if(fixedLaptopKeys.has(device.key)){
    // One continuous image on the upright screen. Leave the case and keyboard UVs alone.
    rect(color,0,0,96,56,[25,39,60,255]);
    if(device.style==='macbook_pro'){
      rect(color,13,8,70,40,[44,52,67,255]);
      rect(color,13,8,70,4,[60,72,93,255]);
      rect(color,21,18,32,6,[72,90,114,255]);
      rect(color,42,29,32,6,[70,110,107,255]);
      rect(color,23,41,50,2,[113,128,147,255]);
    }else{
      for(let y=0;y<50;y++){
        const edge=Math.round(29+12*Math.sin(y/12));
        rect(color,0,y,edge,1,[38,62,89,255]);
        rect(color,edge,y,96-edge,1,[45,78,108,255]);
      }
      rect(color,0,51,96,5,[20,32,49,255]);
      for(const x of [39,46,53])rect(color,x,52,3,2,[153,181,204,255]);
    }
  }
  return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data),merPixels:mer.data};
}
