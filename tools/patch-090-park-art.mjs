import {canvas,png,rect} from './art.mjs';

const faces=['north','south','east','west','up','down'];
const colors={metal:[0,0],trim:[16,0],light:[32,0]};
function cube(origin,size,color){
  return {origin,size,color:0,material:'ware',uv:Object.fromEntries(
    faces.map(face=>[face,{uv:colors[color],uv_size:[8,8],material_instance:'ware'}])
  )};
}

/** Four local block models, ordered bottom to top. */
export function parkLampParts(){
  return [
    [
      cube([-6,0,-6],[12,3,12],'metal'),
      cube([-4,3,-4],[8,4,8],'trim'),
      cube([-2,7,-2],[4,9,4],'metal'),
    ],
    [cube([-2,0,-2],[4,16,4],'metal')],
    [cube([-2,0,-2],[4,16,4],'metal')],
    [
      cube([-2,0,-2],[4,5,4],'metal'),
      cube([-5,5,-5],[10,1,10],'trim'),
      cube([-4,6,-4],[8,7,8],'light'),
      cube([-5,13,-5],[10,2,10],'metal'),
      cube([-2,15,-2],[4,1,4],'trim'),
    ],
  ];
}

export function parkLampTexture(){
  const image=canvas(128,128,[38,40,43,255]),mer=canvas(128,128,[0,0,185,255]);
  rect(image,0,0,8,8,[38,40,43,255]);
  rect(image,16,0,8,8,[76,77,76,255]);
  rect(image,32,0,8,8,[255,219,133,255]);
  rect(mer,32,0,8,8,[0,20,85,255]);
  return {width:128,height:128,pixels:image.data,png:png(128,128,image.data),mer:png(128,128,mer.data)};
}
