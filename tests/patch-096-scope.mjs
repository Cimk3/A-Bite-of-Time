import {refreshed096Keys} from '../.build/patch-096-catalog.js';

export function refresh096Visual(path){
  const name=path.split('/').at(-1);
  if(!/(?:^|\/)(?:models|textures)\//.test(path))return false;
  for(const key of refreshed096Keys){
    if(name===key+'.geo.json'||name==='surface_'+key+'.geo.json'||name===key+'.png')return true;
    if(name.startsWith(key+'_part_')&&name.endsWith('.geo.json'))return true;
    if(new RegExp('^patch(?:072|073|080|090)_'+key+'(?:_mer)?\\.png$').test(name))return true;
  }
  return false;
}
export function refresh096Block(path){
  const name=path.split('/').at(-1);
  return /^(?:packs\/FoodAndTable_BP\/)?blocks\//.test(path)&&[...refreshed096Keys].some(k=>name===k+'.json'||new RegExp('^'+k+'_part_\\d+\\.json$').test(name));
}

export function append097Asset(path){
  return /^(?:entity|render_controllers)\/mcpe_food\/(?:surface_display|digital_ad_display|tray_food_display)(?:\.entity|_food|_ware)\.json$/.test(path)||
    /^(?:entities\/(?:surface_display|digital_ad_display|tray_food_display)\.json|item_catalog\/crafting_item_catalog\.json|textures\/(?:item_texture|terrain_texture)\.json|texts\/(?:zh_CN|en_US)\.lang)$/.test(path)||
    /^functions\/mcpe_food\/(?:tasting_new|tasting_all_chinese|electronics|medical_equipment|digital_ad_screens|gym)\.mcfunction$/.test(path)||
    path==='blocks.json';
}
