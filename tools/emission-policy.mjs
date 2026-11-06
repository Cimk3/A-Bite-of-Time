import {patch082ById} from "../.build/patch-082-catalog.js";
import {patch080Screens} from '../.build/patch-080-catalog.js';
import {patch074Screens} from '../.build/patch-074-catalog.js';
import {patch073Screens} from '../.build/patch-073-catalog.js';
import {patch072Screens} from '../.build/patch-072-catalog.js';
import {scenarioScreens} from '../.build/scenario-catalog.js';
/** Only named electronics may emit, and only inside their screen/LED UV islands. */
import {electronics} from '../.build/electronics-catalog.js';
const devices=new Map(electronics.map(d=>[`device_${d.key}`,d]));
export function emissionIsValid(image,colorKey){
  if(colorKey==='digital_content_haodu_hotel_7x5')return image.width===448&&image.height===320&&image.pixels.every((v,i)=>i%4!==1||v<=24);
  if(colorKey.startsWith('patch082_')){
    const prop=patch082ById.get('mcpe_food:'+colorKey.slice(9));
    return !!prop&&image.width===128&&image.height===128&&image.pixels.every((v,i)=>{
      if(i%4!==1||v===0)return true;
      const pixel=(i-1)/4,x=pixel%128,y=Math.floor(pixel/128);
      return prop.lit&&v<=24&&((x<96&&y<48)||(x>=99&&y>=92&&y<96));
    });
  }
  if(colorKey.startsWith('digital_content_'))return ((image.width===256&&[256,192,128].includes(image.height))||(['digital_content_ft_computer_6x5','digital_content_apple_6x5'].includes(colorKey)&&image.width===384&&image.height===320))&&image.pixels.every((v,i)=>i%4!==1||v<=24);
  if(colorKey==='patch080_ceiling_screen')return image.width===256&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v<=24);
  if(colorKey.startsWith('patch080_'))return image.width===128&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v===0||(patch080Screens.has(colorKey.slice(9))&&v<=24&&((i-1)/4)%128<96&&Math.floor((i-1)/4/128)<56));
  if(colorKey.startsWith('patch074_'))return image.width===128&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v===0||(patch074Screens.has(colorKey.slice(9))&&v<=24&&((i-1)/4)%128<96&&Math.floor((i-1)/4/128)<56));
  if(colorKey.startsWith('patch073_'))return image.width===128&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v===0||(patch073Screens.has(colorKey.slice(9))&&v<=24&&((i-1)/4)%128<96&&Math.floor((i-1)/4/128)<56));
  if(colorKey.startsWith('patch072_'))return image.width===128&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v===0||(patch072Screens.has(colorKey.slice(9))&&v<=24&&((i-1)/4)%128<96&&Math.floor((i-1)/4/128)<56));
  if(colorKey.startsWith('patch071_'))return image.width===128&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v===0||(colorKey==='patch071_supermarket_checkout'&&v<=24&&((i-1)/4)%128<96&&Math.floor((i-1)/4/128)<56));
  if(colorKey.startsWith('scenario_'))return image.width===128&&image.height===128&&image.pixels.every((v,i)=>i%4!==1||v===0||(scenarioScreens.has(colorKey.slice(9))&&v<=24&&((i-1)/4)%128<96&&Math.floor((i-1)/4/128)<56));
  const device=devices.get(colorKey),closed=device?.pose==='closed';
  const screen=device&&!closed&&['desktop','all_in_one','laptop','tablet','crt','studio','surface','register','scanner'].includes(device.model);
  for(let i=1;i<image.pixels.length;i+=4){
    const value=image.pixels[i];if(value===0)continue;
    if(!device||closed||image.width!==128||image.height!==128||value>24)return false;
    const pixel=(i-1)/4,x=pixel%128,y=Math.floor(pixel/128);
    const networkLed=device.model==='network'&&x>=96&&y>=100&&y<110;
    const networkScreen=device.model==='network'&&['conference_phone','tower_ups'].includes(device.key)&&x<96&&y<56;
    const serviceLed=['register','scanner','receipt'].includes(device.model)&&x>=96&&y>=48&&y<60;
    const led=[4,9,13].some(role=>x>=96+(role%2)*16&&x<112+(role%2)*16&&y>=64+Math.floor(role/2)*8&&y<72+Math.floor(role/2)*8);
    if(!(screen&&x<96&&y<56)&&!led&&!serviceLed&&!networkLed&&!networkScreen)return false;
  }
  return true;
}
