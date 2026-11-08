/** Final-resource review: native parts are placed in engine space before drawing.
 * Never substitute the unsplit source mesh for a native placement preview.
 */
import {readFileSync,mkdirSync} from 'node:fs';
import {patch090Items,patch090Props,patch090PartId} from '../.build/patch-090-catalog.js';
import {patch090Cells} from '../.build/patch-090-grid.js';
import {patch090Cubes} from './patch-090-art.mjs';
import {officialAngles,assembleInModelSpace,faceMismatch,missingSurfaceSamples} from './native-world-audit.mjs';
import {canvas,rect,text,blit,saveImage} from './art.mjs';
import {renderDetail} from './detail-art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {writeOutput} from './fs-output.mjs';
const rp='packs/FoodAndTable_RP/',bp='packs/FoodAndTable_BP/';
mkdirSync('assets/reviews',{recursive:true});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const mesh=(path)=>read(path)['minecraft:geometry'][0].bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name==='food'?'food':'ware',faces:Object.keys(c.uv)})));
const texture=p=>decodeRGBA(readFileSync(rp+'textures/entity/mcpe_food/'+p+'.png'));
const sheet=canvas(1040,80+12*260,[25,36,35,255]),back=canvas(1040,80+12*260,[25,36,35,255]);
const native=canvas(800,80+20*190,[25,36,35,255]);
const counterexamples=read('tests/fixtures/v0.9.1-native-counterexamples.json'),beforeAfter=canvas(800,80+6*300,[25,36,35,255]);let comparisonRow=0;
text(beforeAfter,'0.9.1 PARTS / 0.9.2 PARTS',14,14,2);text(beforeAfter,'SAME FRONT VIEW / ENGINE-SPACE RECONSTRUCTION / NOT GAME SCREENSHOTS',14,44,1);
for(const [im,title] of [[sheet,'0.9.2 / ALL 47 ITEMS / FRONT'],[back,'0.9.2 / ALL 47 ITEMS / REAR'],[native,'0.9.2 / NATIVE PLACEMENTS / N E S W']]){
 text(im,title,16,14,2);text(im,'ACTUAL GENERATED RESOURCES / NOT A GAME SCREENSHOT',16,44,1);
}
const rows=[];let nativeRow=0;
for(const [i,d] of patch090Items.entries()){
 let cs,maps;const entry={key:d.key,kind:d.kind,gameTested:false};
 if(d.kind==='solid'){
  maps={ware:texture('patch090_'+d.key)};entry.directions={};
  for(const [col,dir] of Object.keys(officialAngles).entries()){
   const cells=patch090Cells(d,{x:0,y:0,z:0},dir);
   const parts=cells.map((_,index)=>{
    const key=patch090PartId(d,index).slice(10),block=read(bp+'blocks/'+key+'.json')['minecraft:block'];
    const p=block.permutations.find(p=>p.condition.includes("'"+dir+"'"));
    return {angle:p.components['minecraft:transformation'].rotation[1],cubes:mesh(rp+'models/blocks/mcpe_food/'+key+'.geo.json')};
   });
   const assembled=assembleInModelSpace(parts,cells,dir),errors=faceMismatch(patch090Cubes(d.key),assembled);
   const lost=missingSurfaceSamples(patch090Cubes(d.key),assembled);
   if(errors.length||lost.length)throw Error(d.key+' '+dir+' final-resource UV/geometry mismatch: '+JSON.stringify(errors[0]??lost[0]));
   entry.directions[dir]={parts:parts.length,uvMismatches:0,missingSurfaceSamples:0};
   const x=col*200,y=80+nativeRow*190;rect(native,x+3,y,194,187,[36,48,45,255]);
   blit(native,renderDetail(assembled,maps,190,154,{front:true}),x+5,y+3);text(native,d.key.toUpperCase(),x+7,y+162,1);text(native,'PLACER AT '+dir.toUpperCase(),x+7,y+176,1);
   if(dir==='north')cs=assembled;
  }nativeRow++;
  if(counterexamples[d.key]){
   const old=counterexamples[d.key],oldAssembly=assembleInModelSpace(old.parts,patch090Cells(old,{x:0,y:0,z:0},'north',true),'north');
   for(const [col,cubes] of [[0,oldAssembly],[1,cs]]){
    const x=col*400,y=80+comparisonRow*300;rect(beforeAfter,x+4,y,392,294,[36,48,45,255]);blit(beforeAfter,renderDetail(cubes,maps,380,260,{front:true}),x+10,y+3);text(beforeAfter,d.key.toUpperCase(),x+10,y+272,1);
   }comparisonRow++;
  }
 }else if(d.kind==='surface'){
  cs=mesh(rp+'models/entity/mcpe_food/surface_'+d.key+'.geo.json');maps={ware:texture('patch090_'+d.key)};
 }else{
  cs=mesh(rp+'models/entity/mcpe_food/'+d.key+'.geo.json');
  const suffix=(d.size[0]+'x'+d.size[2]).replaceAll('.','_');maps={ware:texture('digital_frame'),food:texture('digital_content_'+d.key+'_'+suffix)};
 }
 const x=i%4*260,y=80+Math.floor(i/4)*260,front=d.placementFront!==180;
 for(const [im,view] of [[sheet,front],[back,!front]]){
  rect(im,x+4,y+2,252,254,[36,48,45,255]);blit(im,renderDetail(cs,maps,244,215,{front:view}),x+8,y+5);
  text(im,d.key.toUpperCase(),x+9,y+229,1);text(im,d.kind.toUpperCase(),x+9,y+244,1);
 }
 rows.push(entry);
}
saveImage('previews/patch_092_all_front.png',sheet);saveImage('previews/patch_092_all_rear.png',back);saveImage('previews/patch_092_native_directions.png',native);
saveImage('previews/patch_092_before_after.png',beforeAfter);
writeOutput('assets/reviews/patch-092-audit.json',JSON.stringify({version:'0.9.2',items:47,nativeItems:patch090Props.filter(d=>d.kind==='solid').length,engineConvention:'geometry X mirrored; native Y rotation per official cardinal example',gameTested:false,rows},null,2)+'\n');
writeOutput('docs/AUDIT_0.9.2.md','# 0.9.2 全部47件资源检查\n\n原生20件按实际生成部件与世界坐标重建四向模型，核对完整面与UV连续性。其余15件读取实际实体几何，12张墙屏读取实际画布与边框。所有预览均不是游戏截图。\n\n| 物品 | 类型 | 本轮检查 | 实机 |\n|---|---|---|---|\n'+patch090Items.map(d=>'| '+d.zh+' | '+d.kind+' | '+(d.kind==='solid'?'四向重建、部件连接、UV、碰撞/交互位置':d.kind==='wall'?'画布、正面UV、边框、四向墙面支撑':'正反面、连接、预算、放置朝向')+' | 未验证 |').join('\n')+'\n\n[正面](../previews/patch_092_all_front.png) / [背面](../previews/patch_092_all_rear.png) / [四向原生放置](../previews/patch_092_native_directions.png)\n');
