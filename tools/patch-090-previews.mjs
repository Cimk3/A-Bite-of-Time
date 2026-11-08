// Run after the resource build: node tools/patch-090-previews.mjs
// Samples the actual generated PNGs, not a separate illustrative mock-up.
import {readFileSync} from 'node:fs';
import {patch090Walls} from '../.build/patch-090-catalog.js';
import {canvas,rect,text,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {png} from './art.mjs';
import {patch090WallImage} from './patch-090-art.mjs';
import {writeOutput} from './fs-output.mjs';

// Optional color-only iteration; matches digital-displays.mjs's fresh wall path.
// Dimensions, MER, geometry and texture-set bindings stay unchanged.
if(process.argv.includes('--refresh-colors'))for(const d of patch090Walls){
 const key='digital_content_'+d.brand+'_'+(d.width+'x'+d.height).replaceAll('.','_');
 const im=patch090WallImage(d),bytes=png(im.width,im.height,im.data);
 writeOutput('packs/FoodAndTable_RP/textures/entity/mcpe_food/'+key+'.png',bytes);
 writeOutput('assets/digital-screens/'+key+'.png',bytes);
 const icon=canvas(128,128,[29,35,43,0]),hh=Math.round(116*im.height/im.width);
 for(let y=0;y<hh;y++)for(let x=0;x<116;x++){
  const at=(Math.floor(y*im.height/hh)*im.width+Math.floor(x*im.width/116))*4;
  icon.data.set(im.data.subarray(at,at+4),((y+Math.floor((128-hh)/2))*128+x+6)*4);
 }
 writeOutput('packs/FoodAndTable_RP/textures/items/mcpe_food/'+d.key+'.png',png(128,128,icon.data));
}

const sheet=canvas(1200,1660,[25,36,35,255]);
text(sheet,'0.9.0 WALL SCREENS / ACTUAL COLOR TEXTURES',16,14,2);
text(sheet,'STATIC ART / NOT A MINECRAFT SCREENSHOT',16,42,1);
for(const [i,d] of patch090Walls.entries()){
 const suffix=(d.width+'x'+d.height).replaceAll('.','_');
 const source=decodeRGBA(readFileSync('packs/FoodAndTable_RP/textures/entity/mcpe_food/digital_content_'+d.brand+'_'+suffix+'.png'));
 const x=i%3*400,y=60+Math.floor(i/3)*400;
 rect(sheet,x+4,y+4,392,392,[32,46,44,255]);
 const scale=Math.min(370/source.width,330/source.height),w=Math.floor(source.width*scale),h=Math.floor(source.height*scale);
 const left=x+Math.floor((400-w)/2),top=y+Math.floor((350-h)/2);
 for(let py=0;py<h;py++)for(let px=0;px<w;px++){
  const at=(Math.min(source.height-1,Math.floor(py/scale))*source.width+Math.min(source.width-1,Math.floor(px/scale)))*4;
  sheet.data.set(source.pixels.subarray(at,at+4),((top+py)*sheet.width+left+px)*4);
 }
 text(sheet,d.key.toUpperCase(),x+12,y+360,1);
 text(sheet,d.width+' X '+d.height+' / '+source.width+' X '+source.height+' PX',x+12,y+378,1);
}
saveImage('previews/patch_090_walls.png',sheet);
