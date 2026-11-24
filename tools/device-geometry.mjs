import {faceUV} from './detail-art.mjs';
const names=['north','south','east','west','up','down'];
/** Bake the lid's intended backward tilt into positions. Production lids have
 * no cube rotations, so engine and offline Euler conventions cannot disagree.
 * 1/8-unit strips match the 128px pixel density and retain their actual UV rows.
 */
export function bakeDeviceTilts(cubes){
  return cubes.flatMap(c=>{
    if(!c.rotation?.[0]||c.rotation[1]||c.rotation[2])return[c];
    const theta=c.rotation[0]*Math.PI/180,co=Math.cos(theta),si=Math.sin(theta),pivot=c.pivot??c.origin;
    const rotate=([x,y,z])=>[x,pivot[1]+(y-pivot[1])*co-(z-pivot[2])*si,pivot[2]+(y-pivot[1])*si+(z-pivot[2])*co];
    const section=[rotate([c.origin[0],c.origin[1],c.origin[2]]),rotate([c.origin[0],c.origin[1]+c.size[1],c.origin[2]]),rotate([c.origin[0],c.origin[1]+c.size[1],c.origin[2]+c.size[2]]),rotate([c.origin[0],c.origin[1],c.origin[2]+c.size[2]])];
    const bottom=Math.min(...section.map(p=>p[1])),top=Math.max(...section.map(p=>p[1]));
    // All parts share the same 1/8-unit world Y grid. Independent subdivision
    // previously let a shell strip cross a neighboring screen strip.
    const shared=c.rotation[0]===-20,first=Math.floor(bottom*8),count=shared?Math.ceil(top*8)-first:Math.ceil((top-bottom)*8);
    return Array.from({length:count},(_,i)=>{
      const start=shared?Math.max(bottom,(first+i)/8):bottom+i*(top-bottom)/count,end=shared?Math.min(top,(first+i+1)/8):bottom+(i+1)*(top-bottom)/count,points=section.filter(p=>p[1]>=start&&p[1]<=end);
      for(let edge=0;edge<4;edge++){const a=section[edge],b=section[(edge+1)%4];for(const y of[start,end])if(Math.abs(b[1]-a[1])>1e-10){const t=(y-a[1])/(b[1]-a[1]);if(t>=0&&t<=1)points.push([a[0],y,a[2]+t*(b[2]-a[2])]);}}
      const z0=Math.min(...points.map(p=>p[2])),z1=Math.max(...points.map(p=>p[2]));
      const origin=[c.origin[0],start,z0],high=[c.origin[0]+c.size[0],end,z1];
      const sourceZ=c.origin[2]+c.size[2]/2;
      const ratio=y=>Math.max(0,Math.min(1,((y-pivot[1]+(sourceZ-pivot[2])*si)/co+pivot[1]-c.origin[1])/c.size[1]));
      const uv=Object.fromEntries(names.map(face=>{
        const old=faceUV(c,face),next={...old,uv:[...old.uv],uv_size:[...old.uv_size]};
        if(face!=='up'&&face!=='down'){
          next.uv[1]=old.uv[1]+(1-ratio(end))*old.uv_size[1];
          next.uv_size[1]=Math.min((ratio(end)-ratio(start))*old.uv_size[1],old.uv[1]+old.uv_size[1]-next.uv[1]);
        }
        return[face,next];
      }));
      // The backward stair has narrow upward-facing treads. Leaving these
      // absent exposes the gray lid through a dotted grid at oblique views.
      if(c.tag==='screen')uv.up={...uv.south,uv:[uv.south.uv[0],uv.south.uv[1]],uv_size:[uv.south.uv_size[0],.001]};
      const {rotation,pivot:unusedPivot,...rest}=c;
      return{...rest,...(c.tag==='screen'?{faces:['south','up']}:{}),origin,size:high.map((v,axis)=>v-origin[axis]),uv};
    });
  });
}
/** Measure the emitted screen coordinates, never the source rotation value. */
export function emittedLidAngle(cubes){
  const screen=cubes.filter(c=>c.tag==='screen'||(c.uv?.south?.uv_size[0]===96&&c.uv.south.uv[0]===0&&c.uv.south.uv[1]<56));
  if(screen.length===1){
    const [pitch,yaw,roll]=(screen[0].rotation??[0,0,0]).map(angle=>angle*Math.PI/180);
    const dz=Math.cos(yaw)*Math.sin(pitch)*Math.cos(roll)-Math.sin(yaw)*Math.sin(roll);
    return Math.acos(dz)*180/Math.PI;
  }
  if(screen.length<2)throw new Error('Expected a baked multi-row screen');
  const center=c=>[c.origin[1]+c.size[1]/2,c.origin[2]+c.size[2]/2];
  screen.sort((a,b)=>center(a)[0]-center(b)[0]);const bottom=center(screen[Math.floor(screen.length*.15)]),top=center(screen[Math.floor(screen.length*.85)]),dy=top[0]-bottom[0],dz=top[1]-bottom[1];
  return Math.acos(dz/Math.hypot(dy,dz))*180/Math.PI;
}
