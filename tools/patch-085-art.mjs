/** 0.8.5 models are authored against the seven approved concept boards. */
import {canvas,rect,text,png} from './art.mjs';
import {modelBounds,pruneFaces} from './detail-art.mjs';
import {northFacingCubes} from './patch-072-art.mjs';
import {patch085ById,patch085ScreenIds} from '../.build/patch-085-catalog.js';

const palette={ivory:0,dark:1,steel:2,blue:3,teal:4,mint:5,red:6,amber:7,purple:8,clear:9,white:10,slate:11,pink:12};
const swatches=[
  [224,225,216],[25,32,42],[112,128,139],[63,112,174],[31,137,132],[118,173,151],
  [186,58,53],[223,155,52],[137,92,159],[172,210,219],[241,240,228],[76,88,103],[218,135,161]
];
const faceNames=['north','south','east','west','up','down'];
const screenBox={uv:[0,0],uv_size:[96,48],material_instance:'ware'};
const squareScreen={uv:[0,0],uv_size:[56,56],material_instance:'ware'};
const pumpChannelScreen={uv:[0,50],uv_size:[40,8],material_instance:'ware'};

function cubeFactory(){
  const cubes=[];
  const put=(x,y,z,w,h,d,color='ivory')=>{const c={origin:[x,y,z],size:[w,h,d],color:palette[color]??0,material:'ware'};cubes.push(c);return c;};
  const screen=(x,y,z,w,h,{square=false,frame='dark',joined=false}={})=>{
    put(x-.65,y-.65,z-.58,w+1.3,h+1.3,.58,frame);
    const c=put(x,y,joined?z-.02:z+.02,w,h,joined?.12:.08,'dark');
    c.uv={south:square? squareScreen:screenBox};return c;
  };
  const buttonRow=(x,y,z,count,step=1.25)=>{for(let i=0;i<count;i++)put(x+i*step,y,z,.72,.42,.26,i%4===0?'blue':'steel');};
  const wheels=(xs=[-5.4,4.8],zs=[-5,4.1],color='dark')=>{for(const x of xs)for(const z of zs){put(x,.35,z,1.55,1.45,1.65,color);put(x+.27,0,z+.25,1.02,.48,1.12,'steel');}};
  const base=(color='ivory',trim='steel')=>{put(-7.2,.55,-6.6,14.4,1.1,13.2,color);put(-7.6,1.65,-6.9,15.2,.65,13.8,trim);};
  const slats=(x,y,z,w,n=6,step=.78,color='dark')=>{for(let i=0;i<n;i++)put(x,y+i*step,z,w,.18,.16,color);};
  const tube=(points,color='blue',thickness=.62)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];put(Math.min(a[0],b[0])-thickness/2,Math.min(a[1],b[1])-thickness/2,Math.min(a[2],b[2])-thickness/2,Math.abs(a[0]-b[0])+thickness,Math.abs(a[1]-b[1])+thickness,Math.abs(a[2]-b[2])+thickness,color);}};
  const displayFrame=(x,y,z,w,h,color='white')=>{put(x-.7,y-.7,z-1.5,w+1.4,h+1.4,1,color);return screen(x,y,z,w,h,{frame:'dark'});};
  const steppedDisc=(cx,cy,z,r,depth,color='red',layers=8)=>{for(let i=0;i<layers;i++){const yy=-r+(i+.5)*(2*r/layers),half=Math.sqrt(Math.max(0,r*r-yy*yy));put(cx-half,cy+yy,z,half*2,2*r/layers,depth,color);}};
  const octagon=(dark=false)=>{
    const side=dark?'dark':'ivory',edge=dark?'teal':'blue',z=-7.6;
    // Open bore: the shell is built from stepped bars around the central aperture.
    put(-15,11,z,5,27,14,side);put(10,11,z,5,27,14,side);
    put(-10,37,z,20,7,14,side);put(-10,7,z,20,5,14,side);
    put(-15,35,z+7,5,3,1.2,edge);put(10,35,z+7,5,3,1.2,edge);
    put(-15,11,z+7,4,24,1.2,edge);put(11,11,z+7,4,24,1.2,edge);
    put(-9,33,z+7.1,18,2.2,.9,'dark');put(-9,13.5,z+7.1,18,2.2,.9,'dark');
    put(-10.2,15.4,z+7.1,2.1,18,.9,'dark');put(8.1,15.4,z+7.1,2.1,18,.9,'dark');
    put(-15,7,-9,7,2.2,18,'slate');put(8,7,-9,7,2.2,18,'slate');
    put(-5,43,-9,10,1.4,18,edge);put(-2.6,43,-9,5.2,1.9,.6,'steel');
    for(const x of [-13,10]){put(x,25,-.35,3,5,.5,'dark');put(x+.55,26,.2,1.9,2.5,.16,'blue');put(x+.95,22.8,.2,1.1,1,.16,'white');}
  };
  const analyzer=(baseColor='ivory',trim='blue',h=10)=>{base(baseColor,'slate');put(-6.8,2,-5.9,13.6,h,11.8,baseColor);put(-7,2,-5.9,.8,h,11.8,trim);put(6.2,2,-5.9,.8,h,11.8,trim);};

  // A solid case supports the inset display and the rear service plate.
  const console=(x,y,z,w,h,d,{color='white',trim='slate',controls=false}={})=>{
    const front=z+d;
    put(x,y,z,w,h,d,color);
    const margin=controls?2.45:.75;
    screen(x+.75,y+.75,front+.17,w-.75-margin,h-1.5,{joined:true});
    if(controls){
      for(let i=0;i<5;i++)put(x+w-1.7,y+h-1.7-i*1.15,front-.07,.97,.55,.27,i%4===0?'blue':'steel');
      put(x+w-1.83,y+.68,front-.1,1.28,1.3,.48,'dark');
    }
    rearPanel(x+.66,y+.65,z,w-1.32,h-1.3,trim);
  };
  const rearPanel=(x,y,z,w,h,trim='slate')=>{
    put(x,y,z-.35,w,h,.43,'ivory');
    for(const dx of [.32,w-.65])for(const dy of [.35,h-.65])put(x+dx,y+dy,z-.43,.27,.27,.1,'steel');
    for(let i=0;i<3;i++)put(x+w*.21,y+h*.53+i*h*.095,z-.49,w*.58,.21,.17,trim);
    put(x+w*.65,y+h*.16,z-.54,w*.18,.65,.25,'dark');
  };
  const trolley=(trim='blue')=>{
    wheels([-6.4,4.85],[-5.6,4.25]);
    for(const x of [-6.6,4.7])for(const z of [-5.8,4.05]){
      put(x,1.74,z,2.05,.98,2.08,trim);
      put(x+.3,1.48,z+.29,1.44,.42,1.49,'steel');
    }
    for(const x of [-6.42,4.88])put(x,1.92,-4.22,1.7,.71,8.58,'white');
    put(-4.75,1.89,-.99,9.76,.85,1.98,'white');
  };
  const bag=(x,y,z,liquid='blue')=>{
    put(x,y,z,2.45,3.35,1.3,'clear');
    put(x+.18,y+.25,z+1.26,2.09,1.72,.13,liquid);
    put(x+.78,y+3.26,z+.31,.88,.69,.68,'white');
    put(x+.88,y-.45,z+.38,.66,.58,.54,liquid);
  };
  const badge=(x,y,z,w,h)=>{
    put(x,y,z,w,h,.18,'white').uv={south:{uv:[0,60],uv_size:[60,10],material_instance:'ware'}};
  };
  // Route pipes as short orthogonal runs. Alternate diameters at the elbows
  // so joined segments cannot share an exposed surface.
  const pipe=(points,color,diameter=.64)=>{
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],d=diameter+(i%2)*.1;
      put(...a.map((v,j)=>Math.min(v,b[j])-d/2),...a.map((v,j)=>Math.abs(v-b[j])+d),color);
    }
  };
  return {cubes,put,screen,buttonRow,wheels,base,slats,tube,displayFrame,steppedDisc,octagon,analyzer,console,rearPanel,trolley,bag,badge,pipe};
}

// Each switch branch below follows the corresponding numbered board. Coordinates
// are model units; the final axis flip makes local -Z the display/front direction.
function buildOne(key){
  const {cubes:a,put:p,screen,buttonRow,wheels,base,slats,tube,displayFrame,steppedDisc,octagon,console,rearPanel,trolley,bag,badge,pipe}=cubeFactory();
  const panel=(x,y,z,w,h,opts)=>screen(x,y,z,w,h,opts);
  const smallCart=()=>{base('ivory','steel');wheels();p(-6.4,2,-5.8,12.8,1.8,11.6,'dark');};

  switch(key){
    case 'icu_ct_scanner':
      p(-15,0,-10,30,2.5,27,'slate');octagon(false);
      p(-5.1,5,-1,10.2,1.2,26,'ivory');p(-4.1,6.2,1,8.2,2.2,22,'blue');
      p(-4.4,2,-2,8.8,3,5,'white');p(-3.6,4.9,1,7.2,1.3,3,'steel');
      break;
    case 'icu_cta_station':
      p(-15,0,-10,30,2.5,27,'dark');octagon(true);
      p(-5.1,5,-1,10.2,1.2,26,'dark');p(-4.1,6.2,1,8.2,2.2,22,'teal');
      p(-4.4,2,-2,8.8,3,5,'slate');p(-3.6,4.9,1,7.2,1.3,3,'steel');
      // Twin contrast cylinders and a small attached touchscreen cart on the right.
      p(10.2,2,1,3.6,1.2,7,'steel');p(10.8,3.2,2,2.4,18,2.4,'white');p(13.35,3.2,2,2.4,18,2.4,'white');
      p(10.8,20.5,2,2.4,1.5,2.4,'blue');p(13.35,20.5,2,2.4,1.5,2.4,'amber');
      p(10.4,4,4.5,5.6,4,.8,'dark');p(10.7,4.4,5.35,5,.4,.18,'clear');
      p(10.5,9,6,5.2,1,1.1,'steel');p(11.1,10,6,.75,4,.7,'steel');p(10.4,14,4.6,5.8,4,1.4,'white');
      panel(10.9,15,6.05,4.8,2.3,{frame:'dark'});
      break;
    case 'icu_dsa_angiography':
      p(-15,0,-10,30,2.3,27,'slate');
      // Open asymmetric C-arm, overhead detector and separate source; no closed ring.
      p(-14,5,-8,4,32,13,'white');p(-10,35,-8,22,5,13,'white');p(8,27,-8,4,13,13,'steel');
      p(-14,6,-1,5,5,14,'blue');p(-11,32,-1,19,2,14,'blue');
      p(-2,28,1,7,7,9,'white');p(-1,27,2,5,1.4,8,'blue');
      p(-14,17,-2,11,3,16,'steel');
      p(-7,11,1,14,2.4,24,'dark');p(-6,13.4,2,12,1.5,20,'slate');p(-3.8,4,-2,7.6,7,4,'white');
      p(4,39,-4,10,2,5,'steel');p(12,35,-4,2,6,3,'dark');
      p(4,27,1,1,10,1,'steel');p(2,25,1,9,1,1,'steel');
      panel(2,18,2,5.2,6,{frame:'dark'});panel(8,18,2,5.2,6,{frame:'dark'});
      p(4,16,1,9,1,1,'steel');
      break;
    case 'icu_b_mode_ultrasound':
      smallCart();p(-5.7,2,-5,11.4,4.2,10,'ivory');p(-5.2,6.2,-4.6,10.4,1.1,9.2,'steel');
      p(-5.7,7.3,-4.5,11.4,2.3,5.4,'ivory');p(-5,9.6,-4.5,10,2.8,5.8,'white');
      panel(-4.15,10.1,1.5,8.3,4.1,{square:true,frame:'dark'});buttonRow(-4.7,7.5,4.7,8,1.2);
      p(5.7,7,-4.2,1.2,2.1,1.2,'steel');p(5.45,9,-4.2,1.7,1.6,1.8,'white');p(5.65,10.6,-3.9,1.3,1.1,1.2,'dark');
      tube([[6.3,10.8,-2.8],[6.3,7.2,-1.2],[6.3,4,0],[6.3,4,4.6]],'dark',.52);p(5.8,3.1,4.4,1.25,2.7,1.15,'steel');
      break;
    case 'icu_color_doppler_ultrasound':
      smallCart();p(-6.2,2,-5.7,12.4,11.8,11.4,'ivory');p(-6.2,2,4.9,1.2,11.8,.8,'teal');p(5,2,4.9,1.2,11.8,.8,'teal');
      p(-5.5,13.8,-4.8,11,1,9.6,'teal');p(-5.2,14.8,-4.6,10.4,2.2,5.4,'ivory');
      displayFrame(-4.6,17.2,.7,9.2,8.5,'white');p(-5.2,17,-5.4,1.4,9,1.4,'teal');p(3.8,17,-5.4,1.4,9,1.4,'teal');
      panel(-3.8,18,.75,7.6,6.8,{frame:'dark'});p(-5.1,13.8,4.9,10.2,.7,2.8,'steel');
      for(let i=0;i<3;i++){const x=2.1+i*1.65;p(x,5.7,5.25,.65,5.8,.8,'steel');p(x-.35,11.4,5.1,1.35,1.1,1.1,'white');tube([[x,11,5.3],[x,14,5.3],[x-.5,15.4,5.3]],'dark',.3);}
      p(-.2,14.5,4.5,2.5,.6,2.3,'dark');p(.35,15.1,4.72,1.3,.5,1.3,'clear');buttonRow(-4.4,14.5,5.15,6,1.35);
      break;
    case 'icu_ecg_cart':
      smallCart();p(-6,2,-5.3,12,10.5,10.6,'ivory');p(-6,2,4.9,12,1.5,1,'blue');
      p(-5.4,12.5,-4.7,10.8,1,8.5,'white');p(-4.6,13.5,-3.7,9.2,4.2,6,'ivory');
      panel(-3.5,14.3,2.35,7,2.8,{frame:'dark'});buttonRow(3.8,15.1,2.4,3,1.05);p(-4.9,13.2,5.2,6.8,.55,2.4,'slate');
      // Fixed pink-grid paper roll/tray and color-organized lead cables.
      p(-5.1,11,5.4,6.5,.25,1.3,'white');p(-5,11.3,5.52,6.3,.12,1.15,'pink');
      for(let i=0;i<6;i++)p(2.1+i*.72,4.2,5.28,.48,1.2,.48,['red','blue','amber','mint','purple','pink'][i]);
      for(let i=0;i<6;i++)tube([[2.35+i*.72,4.5,5.4],[2.35+i*.72,2.8,5.8],[2.35+i*.72,2.8,3.8]],['red','blue','amber','mint','purple','pink'][i],.22);
      break;
    case 'lab_cbc_analyzer':
      base('ivory','slate');p(-6.8,2,-5.9,13.6,7.8,11.8,'ivory');p(-7,2,-5.9,.9,7.8,11.8,'white');
      p(-5.6,9.8,-5,8.8,1.3,9.8,'white');p(3.4,9.8,-5,3.1,1.3,9.8,'ivory');
      p(-5.2,3.2,5.9,6.8,4.1,.7,'blue');p(-4.4,2.8,6.55,5.2,1.1,1,'dark');p(-3.2,3.9,7.1,1.6,1.1,.45,'clear');p(-2.6,5,7.1,.65,1,.7,'purple');
      p(2.4,5,5.95,4.1,4.8,.65,'dark');panel(2.75,5.5,6.64,3.4,3.8,{frame:'steel'});buttonRow(2.7,3.1,6.4,3,.95);
      slats(-6,4,6.05,1.7,3,.85,'slate');p(-6.5,1.8,-5.8,13,1.1,11.6,'slate');break;
    case 'lab_urinalysis_analyzer':
      base('white','amber');p(-7,2,-5.8,14,7,11.6,'amber');p(-7,8,-5.8,14,2,11.6,'white');
      p(-6.6,3,4.9,13.2,3.1,1,'ivory');p(-5.8,3.3,5.9,8.6,1.5,.5,'dark');
      for(let i=0;i<7;i++)p(-5.3+i*1.55,3.65,6.42,1.05,.7,.15,i%2?'mint':'amber');
      p(-5.8,9,-5,9.5,1.1,7.5,'white');p(2.3,9,-4.2,4.2,1,6.6,'slate');panel(2.8,10,-.45,3.2,4.2,{frame:'dark'});
      p(-5.4,10,1.1,3.7,2.2,3.7,'steel');p(-4.7,12.2,1.5,2.3,1.2,2.3,'clear');p(-4.3,13.4,1.9,1.5,.6,1.5,'white');
      p(-6.7,1.6,-5.5,13.4,.6,11,'slate');break;
    case 'lab_liver_chemistry_analyzer':
      base('slate','blue');p(-7,2,-5.8,14,8.8,11.6,'slate');p(-6.7,10.8,-5.2,13.4,1.2,10.4,'dark');
      p(-6.3,4.5,5.8,12.6,5.5,.7,'dark');p(-5.8,4.9,6.5,11.6,4.7,.35,'slate');
      // Enclosed viewing hatch with an octagonal reagent carousel.
      p(-4.9,6,6.88,9.8,2.5,.4,'steel');p(-4.4,6.3,7.3,8.8,1.9,.22,'dark');
      for(let i=0;i<8;i++){const x=-3.8+(i%4)*2.35,z=6.95+Math.floor(i/4)*.56;p(x,6.45,z,1.35,.9,.3,'purple');}
      panel(2.7,3.4,5.9,3.5,3.1,{frame:'dark'});buttonRow(2.6,2.6,6,3,1.05);p(-5.8,1.6,-5.5,11.6,.6,11,'dark');break;
    case 'lab_renal_chemistry_analyzer':
      base('white','mint');p(-6.3,2,-5.6,12.6,20,11.2,'ivory');p(-5.8,2,5.62,7.7,17,.55,'mint');
      p(-5.1,3,6.2,6.3,13,.35,'dark');p(-4.8,3.5,6.55,2.8,12,.22,'clear');p(-1.7,3.5,6.55,2.8,12,.22,'clear');
      p(1.4,8,5.62,4.1,11,.65,'white');panel(1.8,14.4,6.3,3.3,4.2,{frame:'dark'});buttonRow(2,12.7,6.35,3,.92);
      p(-6.1,4.1,-1.1,3.2,1.3,3.2,'mint');for(let i=0;i<4;i++)p(-5.8+i*1.5,5.4,-.9,.7,3.6,.7,'clear');
      p(3.1,3,2.4,3.6,1.2,3.6,'mint');for(let i=0;i<4;i++)p(3.4+i*.72,4.2,2.6,.35,1.8,.35,'amber');
      p(-6.3,1.6,-5.6,12.6,.7,11.2,'slate');break;
    case 'lab_lipid_panel_analyzer':
      base('ivory','amber');p(-6.6,2,-5.8,13.2,11,11.6,'ivory');p(-6.8,2,-5.8,2,11,11.6,'amber');
      p(-5.5,3.3,5.8,8.2,3,.8,'dark');p(-5.1,3.8,6.55,7.4,1.8,.3,'white');for(let i=0;i<5;i++)p(-4.7+i*1.3,4.2,6.9,.6,.9,.12,'amber');
      panel(-3.8,8,5.9,7,4.3,{frame:'dark'});p(-5.8,13,-5.2,10.5,1.1,9.8,'white');
      p(-5.5,1.8,5.9,7.8,1.3,.9,'amber');p(-6.2,1.6,-5.4,12.4,.6,10.8,'slate');break;
    case 'lab_crp_analyzer':
      base('white','purple');p(-6,2,-5.4,12,8.7,10.8,'white');p(-6.2,2,-5.4,12.4,1.3,10.8,'purple');
      p(-2.5,10.7,-4.5,7.5,1.2,6.8,'ivory');panel(-1.7,12,-.4,6,5.8,{frame:'purple'});
      p(-5.1,8,1.9,5.3,1.4,3.8,'purple');p(-4.8,9.4,2.1,4.7,1.2,3.4,'dark');
      p(-4.4,4,5.5,8.7,3.5,1.1,'dark');for(let i=0;i<3;i++){const x=-3.7+i*2.8;p(x,4.6,6.15,1.9,2.3,1.5,'clear');p(x,6.9,6.15,1.9,.8,1.5,'purple');p(x+.25,7.7,6.3,1.4,.6,1.1,['blue','white','amber'][i]);}
      break;
    case 'lab_cardiac_marker_analyzer':
      base('dark','white');p(-6.5,2,-5.7,13,14,11.4,'dark');p(-5.9,2,5.72,11.8,2.4,.6,'white');
      p(-5.7,3,5.7,5,3.5,.8,'white');p(-5.2,3.5,6.5,4,2.5,.25,'slate');
      for(let row=0;row<3;row++){const y=7.2+row*2.75;p(-5.5,y,5.7,6.2,2.1,.75,'slate');p(-4.9,y+.5,6.48,5,.35,.2,'white');p(-4.9,y+1.2,6.48,2.7,.25,.2,'purple');}
      p(1.1,3,5.7,4.7,7,.9,'white');panel(1.5,6.6,6.65,3.9,3.8,{frame:'dark'});p(2,3,6.65,2.4,2.4,1.2,'clear');p(2.7,5.4,6.7,1,.7,1,'red');
      p(-6.5,1.6,-5.6,13,.65,11.2,'slate');break;
    case 'icu_bed': {
      wheels([-6.4,4.85],[-14.4,12.75]);
      p(-6.9,1.74,-14.65,13.8,1.05,29.5,'slate');
      for(const x of [-4.6,3.35])for(let i=0;i<5;i++){
        p(x,2.76+i*.73,-5.9+i*2.1,1.25,.73,2.55,'steel');
        p(x+.22,2.75+i*.74,5-i*2.1,1.14,.74,2.45,'dark');
      }
      p(-6.4,6.4,-14.5,12.8,1.1,29,'white');
      p(-5.5,7.48,-12.8,11,1.45,18.5,'blue');
      for(let i=0;i<4;i++)p(-5.5,7.43,5.7+i*2.02,11,2.2+i*.65,2.02,'blue');
      for(const z of [-14.55,13.45]){
        const y=z>0?9.5:8.2;
        p(-6.5,y,z,13,3,1.1,'white');
        for(const x of [-5.98,4.72])p(x,7.23,z+.09,1.26,y-7.08,.91,'steel');
        for(const x of [-6.54,5.42])p(x,y+2.8,z+.08,1.12,1.3,.96,'white');
        p(-6.47,y+4.08,z+.03,12.94,.82,1.04,'white');
        p(-4.9,y+1.15,z-.13,9.8,.64,.22,'blue');
        p(-4.9,y+1.15,z+1.02,9.8,.64,.22,'blue');
      }
      for(const x of [-7,5.9])for(const z of [-11.5,1.7]){
        p(x,7.2,z,1.1,1.3,9.45,'white');
        p(x+.05,10.4,z+.04,1,1,9.37,'white');
        for(const dz of [.22,4.28,8.28])p(x+.11,8.44,z+dz,.87,2.02,.91,'ivory');
      }
      break;
    }
    case 'icu_large_patient_monitor':
      trolley();
      p(-1.22,2.71,-1.15,2.44,12.4,2.3,'white');
      p(-1.35,10.7,-1.28,2.7,1.14,2.56,'blue');
      p(-1.02,14.95,-1.82,4.85,1.12,3.92,'ivory');
      p(-1.58,16.03,-3.4,3.16,1.72,2.63,'steel');
      console(-6.73,17.62,-4.42,13.46,9.95,3.26,{controls:true});
      p(-1.49,19.03,-5.08,2.98,2.52,.51,'slate');
      p(-.79,15.5,-5.3,1.58,5.23,.75,'steel');
      p(-.72,15.48,-4.62,1.44,.9,3.12,'ivory');
      break;
    case 'icu_six_channel_syringe_pump': {
      trolley();
      p(-.86,2.71,-1.05,1.72,28.1,1.64,'steel');
      p(-6.15,29.88,-.91,12.3,.68,1.12,'dark');
      for(const x of [-5.84,5.13]){
        p(x,30.52,-.84,.71,1.03,.95,'steel');
        bag(x-.86,25.75,.08);
        p(x+.12,28.99,-.24,.48,1.19,.58,'steel');
      }
      p(-5.72,21.43,-1.66,11.44,2.98,5.45,'white');
      screen(-4.58,22.13,3.91,9.16,1.52,{joined:true});
      rearPanel(-4.75,21.75,-1.66,9.5,2.32);
      // Solid individual shells and cassette backs in two columns and three rows.
      for(let row=0;row<3;row++)for(let col=0;col<2;col++){
        const x=-6.42+col*6.74,y=7.85+row*4.43;
        p(x,y,-2,6.1,4.05,5.3,'white');
        p(x+.12,y+.24,-2.38,5.86,3.57,.46,'ivory');
        p(x+.67,y+.61,-2.49,4.76,.19,.14,'steel');
        const edge=x+(col?5.61:-.12);
        p(edge,y+.38,-1.6,.68,3.3,4.68,'blue');
        p(x+.62,y+2.48,3.22,4.82,1.15,.36,'dark');
        p(x+.91,y+2.76,3.57,2.76,.55,.14,'mint').uv={south:pumpChannelScreen};
        for(let i=0;i<3;i++)p(x+3.97+i*.46,y+2.77,3.53,.26,.42,.17,'steel');
        p(x+.63,y+.55,3.24,4.81,1.58,.35,'slate');
        p(x+1.02,y+.88,3.51,3.71,.91,.78,'clear');
        p(x+.52,y+1.15,3.77,.66,.4,.41,'steel');
        p(x+4.49,y+.71,3.44,.8,1.24,.94,'blue');
        for(let i=0;i<7;i++)p(x+1.31+i*.41,y+.94,4.27,.09,.26,.1,'steel');
      }
      break;
    }
    case 'auramed_ecmo':
      trolley('teal');
      p(-6.4,2.57,-5.72,12.8,1.3,11.44,'white');
      p(-5.87,3.76,-5.41,11.74,12.4,8.1,'ivory');
      rearPanel(-5.31,4.46,-5.41,10.62,10.9,'steel');
      p(-5.88,15.97,-4.82,1.14,3.34,1.16,'steel');
      p(-5.94,19.18,-4.88,9.83,1.08,1.28,'white');
      p(2.72,16.06,-4.67,1.37,3.25,1.25,'steel');
      p(-.65,16.05,-2.43,2.32,4.7,2.19,'slate');
      console(-1.99,20.58,-3.34,8.84,7.26,3.35);
      for(const x of [-6.65,5.46]){
        for(const z of [-3.98,3.69])p(x,7.05,z,1.2,6.91,1.29,'teal');
        p(x+.03,13.8,-3.94,1.14,1.03,8.86,'teal');
      }
      p(-5.79,5.12,2.61,6.65,8.36,1.3,'slate');
      steppedDisc(-2.57,9.31,3.83,3.38,1.44,'red',11);
      steppedDisc(-2.57,9.35,5.2,2.45,.62,'red',7);
      p(-3.06,8.83,5.76,.98,.96,.24,'white');
      p(1.55,5.83,2.63,4.13,8.18,2.44,'white');
      p(1.91,6.52,5,3.41,6.82,.52,'clear');
      for(const y of [6.88,9.05,11.22])p(2.27,y,5.48,2.69,.63,.15,'steel');
      for(const y of [5.5,13.61])p(1.46,y,2.58,4.31,.9,2.87,'teal');
      pipe([[-3.98,12.15,4.34],[-3.98,15,4.34],[3.53,15,4.34],[3.53,14,4.34]],'red');
      pipe([[-3.72,6.42,4.84],[-3.72,4.56,4.84],[3.58,4.56,4.84],[3.58,5.7,4.84]],'blue');
      badge(-3.16,2.82,5.68,6.32,.78);
      break;
    case 'auramed_ventilator':
      trolley('teal');
      p(-1.89,2.69,-2.81,3.78,15.57,3.58,'white');
      p(-.51,3.1,-2.89,1.02,13.35,.2,'teal');
      p(-4.91,17.94,-3.1,9.82,3.2,5.19,'ivory');
      rearPanel(-3.95,18.34,-3.1,7.9,2.32);
      console(-6.16,20.98,-3.69,11.63,8.91,3.83);
      for(const x of [-6.26,4.58])for(const y of [20.85,28.79])p(x,y,-3.82,1.02,1.28,4.19,'teal');
      buttonRow(-3.3,18.6,2.01,5,1.37);
      badge(-3.16,19.65,2.06,6.32,1.03);
      p(-2.31,7.38,-.04,4.62,.92,3.62,'ivory');
      p(-2.03,8.24,.34,4.06,4.75,2.8,'clear');
      p(-1.74,8.54,3.08,3.48,2.1,.22,'blue');
      p(-2.17,12.88,.25,4.34,.95,3.06,'teal');
      p(-.59,13.76,.88,1.18,4.39,1.24,'clear');
      pipe([[4.65,19.22,-1.42],[6.28,19.22,-1.42],[6.28,26.8,-1.42],[6.28,26.8,4.1],[6.28,21.86,4.1]],'steel',.83);
      p(5.6,21.21,2.93,1.38,.91,3.44,'teal');
      for(const z of [3.58,5.71]){
        pipe([[6.2,21.39,z],[6.2,15.93,z],[4.97,15.93,z],[4.97,11.2,z]],'blue');
        p(4.5,10.73,z-.47,.94,1.16,.94,'steel');
      }
      break;
    case 'auramed_crrt':
      trolley('teal');
      p(-6.45,2.58,-5.5,12.9,1.23,11.22,'white');
      p(-5.98,3.68,-5.21,11.96,18.7,5.4,'white');
      for(const y of [4.2,12.86])rearPanel(-5.32,y,-5.21,10.64,8.03,'steel');
      for(const x of [-6.44,5.2])p(x,3.74,-5.06,1.24,18.07,10.44,'teal');
      p(-5.26,10.13,-.14,10.52,1.18,5.45,'teal');
      p(-5.28,11.22,.08,10.56,10.82,4.84,'ivory');
      console(-6.32,21.88,-4.97,12.64,8.05,10.24);
      for(const x of [-6.47,5.25])p(x,28.54,-5.14,1.22,1.54,10.6,'teal');
      for(const y of [11.9,16.75]){
        p(-4.92,y,4.78,4.51,4.39,.84,'slate');
        steppedDisc(-2.66,y+2.2,5.51,1.82,.88,'dark',7);
        p(-3.17,y+1.67,6.33,1.02,1.06,.24,'white');
      }
      p(1.29,13.02,4.87,3.12,6.91,1.74,'clear');
      p(1.76,13.81,6.53,2.18,5.36,.21,'white');
      for(const y of [12.67,19.74])p(1.15,y,4.68,3.4,.85,2.23,'teal');
      pipe([[-.63,18.7,5.12],[.34,18.7,5.12],[.34,21.04,5.12],[2.79,21.04,5.12],[2.79,20.46,5.12]],'red',.48);
      pipe([[-.61,14.09,5.37],[.46,14.09,5.37],[.46,12.04,5.37],[2.77,12.04,5.37],[2.77,13.05,5.37]],'blue',.48);
      for(const x of [-3.92,1.15]){
        bag(x,4.75,3.02);
        p(x+.88,8.46,3.58,.69,1.72,.72,'steel');
      }
      badge(-3.16,21.03,4.88,6.32,.82);
      break;
    case 'novacare_ecmo':
      trolley('amber');
      for(const x of [-6.35,4.92])for(const z of [-5.26,4.32]){
        p(x,2.58,z,1.1,25.84,1.14,'white');
        p(x-.18,26.94,z-.18,1.46,1.68,1.5,'amber');
      }
      for(const z of [-5.14,4.44])p(-5.35,27.31,z,10.4,.87,.94,'white');
      for(const x of [-6.23,5.04])p(x,27.19,-4.27,.86,1.06,8.73,'white');
      p(-5.45,3.74,-5.16,10.9,2.06,10.4,'slate');
      p(-5.32,5.61,-4.98,10.64,.89,10.6,'white');
      for(const y of [17.65,22.27])console(-5.35,y,-4.14,10.33,3.85,8.75,{color:'slate',controls:false});
      p(-4.2,6.39,-2.9,6.77,2.08,6.91,'dark');
      steppedDisc(-.8,11.05,-1.14,3.76,5.51,'steel',11);
      steppedDisc(-.8,11.09,3.31,3.49,1.39,'amber',9);
      steppedDisc(-.8,11.14,4.55,2.95,.65,'white',9);
      p(-1.64,10.2,5.11,1.68,1.7,.46,'dark');
      p(-1.36,10.49,-1.55,1.12,1.12,.48,'slate');
      p(4.79,9.25,1.04,2.63,9.2,2.69,'clear');
      for(const y of [8.74,17.92])p(4.62,y,.92,2.98,.94,2.93,'amber');
      for(const y of [10.05,11.43,12.81,14.19,15.57])p(5.02,y,3.67,2.17,.35,.14,'white');
      pipe([[-3.91,12.58,3.76],[-4.61,12.58,3.76],[-4.61,25.44,3.76],[6.07,25.44,3.76],[6.07,18.53,3.76]],'red');
      pipe([[2.31,9.66,4.38],[6.07,9.66,4.38],[6.07,8.39,4.38],[6.07,8.39,2.6]],'blue');
      badge(-4.38,5.78,5.58,8.76,.57);
      break;
    case 'novacare_ventilator':
      trolley('amber');
      p(-4.66,2.56,-4.93,10.98,12.14,10.11,'slate');
      rearPanel(-3.99,3.48,-4.93,9.64,9.45,'dark');
      for(let i=0;i<3;i++){
        const y=3.44+i*3.5;
        p(-3.87,y,5.02,9.4,3.22,.59,'white');
        p(-.67,y+1.16,5.54,3,.68,.39,'slate');
      }
      p(-4.79,14.42,-5.08,11.24,1.28,10.47,'amber');
      p(-4.6,15.59,-4.95,10.87,3.21,9.81,'ivory');
      console(-4.48,18.69,-4.62,10.62,8.15,8.78,{controls:true});
      for(const x of [-4.44,5.53])p(x,15.92,4.61,.65,2.25,.54,'amber');
      badge(-3.76,16.75,4.77,8.72,1.17);
      pipe([[-3.84,16.73,-3.18],[-6.55,16.73,-3.18],[-6.55,27.85,-3.18],[-6.55,27.85,2.38],[-6.55,22.17,2.38]],'steel',.78);
      for(const y of [17.2,20.45,26.92])p(-7.07,y,1.85,1.04,1.09,1.06,'amber');
      p(-7.51,9.6,1.57,2.84,6.53,2.94,'clear');
      p(-7.27,10.11,4.42,2.36,2.29,.2,'blue');
      for(const y of [9.27,15.8])p(-7.64,y,1.43,3.1,.9,3.22,'slate');
      pipe([[-6.09,16.25,3],[-6.09,21.88,3],[-6.55,21.88,3]],'steel',.6);
      pipe([[-6.09,9.35,3],[-6.09,7.84,3],[-3.84,7.84,3]],'steel',.6);
      break;
    case 'novacare_crrt':
      trolley('amber');
      p(-5.27,2.62,-5.32,12.1,1.25,10.97,'slate');
      p(-5.12,3.75,-5.11,11.8,16.13,6.3,'slate');
      rearPanel(-4.53,4.26,-5.11,10.6,14.48,'dark');
      for(const x of [-5.36,5.58])p(x,3.78,1.05,1.24,14.22,4.35,'dark');
      p(-4.25,10.43,1.06,10.14,1.19,4.62,'white');
      p(-4.29,11.53,1.09,10.24,6.42,3.95,'dark');
      p(-5.18,17.8,-4.85,11.92,2.19,10.44,'white');
      for(let i=0;i<3;i++){
        const x=-3.97+i*3.38;
        p(x,11.8,4.94,3.08,5.65,.7,'slate');
        steppedDisc(x+1.54,14.65,5.55,1.44,.55,'amber',7);
        steppedDisc(x+1.54,14.69,6.04,1.05,.26,'white',5);
        p(x+1.19,14.3,6.26,.7,.7,.16,'dark');
      }
      for(const x of [-3.51,1.7]){
        bag(x,5.23,3.17,x<0?'blue':'amber');
        p(x-.32,3.78,2.89,3.09,1.06,2.15,'steel');
        p(x+.31,4.1,5.01,1.83,.46,.16,'amber');
        p(x+.91,9.03,3.66,.63,1.47,.62,'steel');
      }
      p(-6.42,10.27,-.69,2.31,8.54,2.8,'clear');
      for(const y of [10.07,18.42])p(-6.59,y,-.85,2.65,.91,3.12,'amber');
      pipe([[-5.25,18.73,.71],[-5.25,22.2,.71],[-2.92,22.2,.71],[-2.92,19.8,.71]],'steel',.65);
      p(1.48,19.87,-2.72,2.07,3.05,2.34,'slate');
      console(-1.45,22.8,-3.66,8.84,7.34,3.41,{controls:true});
      badge(-3.45,18.47,5.51,8.72,1.12);
      break;
    default: throw new Error('Unknown 0.8.5 device '+key);
  }

  // Add readable product details without changing each concept's silhouette.
  for(const c of a){
    c.uv??={};
    for(const face of faceNames)c.uv[face]??={uv:[99,56+(c.color%13)*5],uv_size:[27,4],material_instance:'ware'};
  }
  let output=northFacingCubes(pruneFaces(a));const definition=patch085ById.get('mcpe_food:'+key);
  let {low,high}=modelBounds(output);const width=definition.footprint?.width??1,depth=definition.footprint?.depth??1;
  // Center every model on its placement anchor, ground its contact surface,
  // and fit approved multi-cell silhouettes to their declared W×D footprint.
  // Single-cell pieces are only reduced if an attachment crosses that cell.
  const sx=definition.footprint?width*16/(high[0]-low[0]):Math.min(1,width*16/(high[0]-low[0]));
  const sz=definition.footprint?depth*16/(high[2]-low[2]):Math.min(1,depth*16/(high[2]-low[2]));
  const cx=(low[0]+high[0])/2,cy=low[1],cz=(low[2]+high[2])/2;
  output=output.map(c=>({...c,origin:[(c.origin[0]-cx)*sx,c.origin[1]-cy,(c.origin[2]-cz)*sz],size:[c.size[0]*sx,c.size[1],c.size[2]*sz]}));
  ({low,high}=modelBounds(output));
  if(output.length>256||low[0]<-width*8-.001||high[0]>width*8+.001||low[2]<-depth*8-.001||high[2]>depth*8+.001||low[1]<0||high[1]>definition.height*16+.001)
    throw new Error('0.8.5 concept bounds exceeded: '+key+' '+JSON.stringify({low,high,cubes:output.length,width,depth,height:definition.height}));
  return output;
}

export function patch085Cubes(key){return buildOne(key);}

function drawFan(im,colorMode=false){
  const top=Math.round(im.height*.14),bottom=Math.round(im.height*.72),center=im.width/2;
  for(let y=top;y<bottom;y++){
    const half=Math.round((y-top+1)*(im.width*.43)/(bottom-top)),left=Math.max(1,Math.round(center-half)),right=Math.min(im.width-1,Math.round(center+half));
    for(let x=left;x<right;x++){
      const edge=Math.min(x-left,right-x),pixel=edge<3?[146,157,163,255]:[75+(x+y)%25,88+(y%21),99+(x%18),255];
      rect(im,x,y,1,1,pixel);
    }
  }
  for(let i=0;i<5;i++)rect(im,Math.round(im.width*.22)+i*Math.round(im.width*.11),Math.round(im.height*.54)-i*2,Math.max(2,Math.round(im.width*.065)),2,colorMode?(i%2?[45,108,238,255]:[213,67,69,255]):[174,184,188,255]);
}
function drawWave(im,color=[71,226,124,255],baseline=18,phase=0){
  for(let x=4;x<92;x++){
    const pulse=(x+phase)%25,spike=pulse===8?8:pulse===9?14:pulse===10?5:pulse===11?-5:pulse===12?-2:0;
    const y=baseline-Math.round(Math.sin((x+phase)*.34)*2)-spike;rect(im,x,y,1,2,color);
  }
}
function drawMonitor(screen){
  const channels=[
    {color:[78,231,91,255],reading:'72',trace:[0,0,0,1,1,0,-1,5,-3,0,0,1,2,1,0,0]},
    {color:[61,202,232,255],reading:'98',trace:[-2,-2,-1,0,1,2,2,1,0,-1,-2,-2]},
    {color:[236,193,60,255],reading:'20',trace:[-2,-2,-1,0,1,2,2,2,1,0,-1,-2,-2,-2,-2,-2]},
    {color:[218,71,196,255],reading:'120/80',trace:[-2,-2,-2,2,2,2,2,2,2,2,-2,-2,-2,-2]}
  ];
  rect(screen,74,0,22,48,[20,38,51,255]);
  for(const y of [12,24,36])rect(screen,2,y,92,1,[28,47,61,255]);
  for(const x of [9,21,33,45,57,69])rect(screen,x,1,1,46,[27,43,55,255]);
  for(const [row,{color,reading,trace}] of channels.entries()){
    const baseline=8+12*row;
    let lastY=baseline-trace[0];
    for(let x=3;x<71;x++){
      const y=baseline-trace[(x-3)%trace.length];
      // Keep sharp transitions connected while the horizontal stroke is one pixel.
      rect(screen,x,Math.min(y,lastY),1,Math.abs(y-lastY)+1,color);
      lastY=y;
    }
    if(row===3){
      // Compact pressure readout fits the same numeric column as the other rows.
      const glyphs={'1':'010110010010111','2':'110001010100111','0':'111101101101111','/':'001001010100100','8':'111101111101111'};
      for(const [i,ch] of [...reading].entries()){
        const x=[74,78,82,86,89,93][i],pattern=glyphs[ch];
        for(let bit=0;bit<pattern.length;bit++)if(pattern[bit]==='1')rect(screen,x+bit%3,40+Math.floor(bit/3),1,1,color);
      }
    }else text(screen,reading,84,2+row*12,1,color);
  }
}
export function patch085Texture(key){
  const image=canvas(128,128,[224,225,216,255]),mer=canvas(128,128,[0,0,180,255]);
  for(let i=0;i<swatches.length;i++){rect(image,99,56+i*5,27,4,[...swatches[i],255]);rect(mer,99,56+i*5,27,4,[i===2?155:0,0,i===9?44:170,255]);}
  const screen=canvas(96,48,[16,29,42,255]);
  const line=(x,y,w,color=[94,186,214,255])=>rect(screen,x,y,w,1,color);
  if(key==='icu_b_mode_ultrasound'||key==='icu_color_doppler_ultrasound'){
    drawFan(screen,key==='icu_color_doppler_ultrasound');
    if(key==='icu_color_doppler_ultrasound'){rect(screen,6,5,8,3,[210,62,61,255]);rect(screen,82,5,8,3,[44,105,235,255]);}
  }else if(key==='icu_large_patient_monitor'){
    drawMonitor(screen);
  }else if(key==='icu_ecg_cart'){
    for(let i=0;i<3;i++)drawWave(screen,[[78,231,91,255],[61,202,232,255],[236,193,60,255]][i],10+i*9,i*4);
  }else if(key.startsWith('lab_')){
    rect(screen,0,0,96,7,[32,95,117,255]);text(screen,'LAB ANALYSIS',3,1,1,[225,240,237,255]);
    for(let i=0;i<4;i++){line(5,13+i*7,28+i%2*8,[118,208,221,255]);rect(screen,58,12+i*7,5,4,[i===3?124:63,181,201,255]);rect(screen,68,12+i*7,19-(i%2)*4,3,[176,216,222,255]);}
    for(let i=0;i<5;i++)rect(screen,7+i*16,42-(i%3)*4,7,4,[57,143+i*9,171+i*7,255]);
  }else if(key==='icu_ct_scanner'||key==='icu_cta_station'||key==='icu_dsa_angiography'){
    rect(screen,0,0,96,8,[30,99,142,255]);text(screen,key==='icu_ct_scanner'?'CT / SCAN':key==='icu_cta_station'?'CTA / FLOW':'DSA / VIEW',3,1,1,[232,244,240,255]);
    for(let i=0;i<7;i++){rect(screen,5+i*12,17,8,18,[26,58+i*7,85+i*6,255]);rect(screen,7+i*12,21,4,11,[74,153+i*5,182+i*4,255]);}
    for(let i=0;i<3;i++)rect(screen,6,40+i*2,28+i*12,1,[86,195,211,255]);
  }else if(key==='icu_six_channel_syringe_pump'){
    rect(screen,0,0,96,48,[15,36,43,255]);text(screen,'INFUSION / 6 CH',4,4,1,[205,232,223,255]);
    for(let i=0;i<6;i++){rect(screen,5+i*15,24,11,13,[31,73,75,255]);rect(screen,7+i*15,27,7,6,[92,210,113,255]);}
    rect(image,0,50,40,8,[21,73,49,255]);text(image,'2.0',11,50,1,[159,241,122,255]);
    rect(mer,0,50,40,8,[0,18,68,255]);
  }else{
    const nova=key.startsWith('novacare');
    const brand=key.startsWith('auramed')?'AURAMED':nova?'NOVACARE':'MEDICAL DATA';
    const accent=nova?[232,163,40,255]:[53,193,184,255];
    rect(screen,0,0,96,7,[24,45,55,255]);text(screen,brand,3,1,1,[229,239,232,255]);
    let lastY=28;
    for(let x=5;x<63;x++){
      const y=nova?(x%17<8?22:30):28-Math.round(Math.sin(x*.31)*7);
      rect(screen,x,Math.min(y,lastY),1,Math.abs(y-lastY)+1,accent);
      lastY=y;
    }
    for(let i=0;i<4;i++){rect(screen,69,13+i*7,19,4,[38,96,103,255]);rect(screen,73,14+i*7,8+i%2*5,2,accent);}
    for(let i=0;i<5;i++)rect(screen,7+i*11,40,7,3,i%2?accent:[74,112,124,255]);
  }
  if(key==='lab_urinalysis_analyzer'){
    rect(screen,4,12,26,20,[26,38,45,255]);for(let i=0;i<5;i++)rect(screen,8+i*4,16,2,12,[232,191-i*20,51,255]);
  }
  if(key==='lab_liver_chemistry_analyzer'){rect(screen,12,12,24,24,[62,67,76,255]);for(let i=0;i<8;i++)rect(screen,17+(i%4)*5,16+Math.floor(i/4)*8,3,3,[132,98,153,255]);}
  if(key==='lab_renal_chemistry_analyzer'){rect(screen,5,9,32,31,[26,40,48,255]);for(let i=0;i<6;i++)rect(screen,10+i*4,14,2,21,[86,141+i*9,137+i*9,255]);}
  if(key==='lab_crp_analyzer')text(screen,'CRP  4.8',7,11,2,[194,169,221,255]);
  if(key==='lab_cardiac_marker_analyzer')text(screen,'CARDIAC  0.8',4,10,1,[187,215,231,255]);
  if(key==='icu_ct_scanner'||key==='icu_cta_station'){
    // Distinct control UIs for the large imaging consoles.
  }
  for(let y=0;y<48;y++)image.data.set(screen.data.subarray(y*96*4,(y+1)*96*4),y*128*4);
  if(key==='icu_b_mode_ultrasound'||key==='icu_color_doppler_ultrasound'){
    const square=canvas(56,56,[16,29,42,255]);drawFan(square,key==='icu_color_doppler_ultrasound');
    for(let y=0;y<56;y++)for(let x=0;x<56;x++)image.data.set(square.data.subarray((y*56+x)*4,(y*56+x)*4+4),((y*128+x)*4));
  }
  if(patch085ScreenIds.has('mcpe_food:'+key)){
    const glow=[0,14,68,255];for(let y=0;y<48;y++)for(let x=0;x<96;x++)mer.data.set(glow,((y*128+x)*4));
    for(let i=0;i<10;i++)rect(mer,99,56+i*5,27,4,[0,0,170,255]);
  }
  if(key.startsWith('auramed_')||key.startsWith('novacare_')){
    const aura=key.startsWith('auramed_');
    rect(image,0,60,60,10,[241,240,228,255]);
    text(image,aura?'AURAMED':'NOVACARE',aura?9:6,61,1,aura?[31,137,132,255]:[25,32,42,255]);
    if(!aura){rect(image,1,64,4,2,[223,155,52,255]);rect(image,55,64,4,2,[223,155,52,255]);}
  }
  return{width:128,height:128,pixels:image.data,png:png(128,128,image.data),mer:png(128,128,mer.data)};
}
