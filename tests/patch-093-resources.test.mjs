import {refresh096Block,refresh096Visual,append097Asset} from './patch-096-scope.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {whole090Keys} from '../.build/patch-093-render.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
test('0.9.3 changes only the three reported appearances and required runtime/version data',()=>{
 const old=read('tests/fixtures/v0.9.2-resources.json');
 for(const [pack,files] of Object.entries(old.packs))for(const [file,hash] of Object.entries(files)){
  if(append097Asset(file))continue;
   if(refresh096Visual(file)||(pack==='BP'&&refresh096Block(file)))continue;
  const path='packs/FoodAndTable_'+pack+'/'+file;
  if(['manifest.json','mcpe_food_build.json','functions/mcpe_food/build_info.mcfunction','scripts/decor-runtime.js'].includes(file))continue;
  // Shared catalogs and bindings append 0.9.5 entries. The immutable
  // 0.9.3 fixture checks old assets and binding prefixes separately.
  if(pack==='BP'&&['item_catalog/crafting_item_catalog.json','entities/surface_display.json','entities/digital_ad_display.json','functions/mcpe_food/tasting_new.mcfunction','functions/mcpe_food/digital_ad_screens.mcfunction'].includes(file))continue;
  if(pack==='RP'&&(/^(entity|render_controllers)\/mcpe_food\/(surface_display|digital_ad_display)/.test(file)||['textures/item_texture.json','textures/terrain_texture.json'].includes(file)))continue;
  if(file.startsWith('scripts/')||file.startsWith('texts/')||file==='blocks.json')continue;
  if(pack==='BP'&&old.blocks[file]){
   const a=read(path),b=structuredClone(old.blocks[file]);
   assert.deepEqual(a['minecraft:block'].components['minecraft:geometry'].bone_visibility,{root:false});
   delete a['minecraft:block'].components['minecraft:geometry'];delete b['minecraft:block'].components['minecraft:geometry'];
   assert.deepEqual(a,b,file+' collision/ownership changed');continue;
  }
  if(pack==='RP'&&[...whole090Keys].some(k=>file.startsWith('models/blocks/mcpe_food/'+k+'_part_')||file==='models/entity/mcpe_food/surface_'+k+'.geo.json'))continue;
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),hash,pack+'/'+file);
 }
});
test('three appearances use complete existing meshes and valid hidden helper cubes',()=>{
 const old=read('tests/fixtures/v0.9.2-resources.json');
 for(const key of whole090Keys){
  const dir='packs/FoodAndTable_RP/models/';
  const full=read(dir+'blocks/mcpe_food/'+key+'.geo.json')['minecraft:geometry'][0];
  const entity=read(dir+'entity/mcpe_food/surface_'+key+'.geo.json')['minecraft:geometry'][0];
  assert.deepEqual(entity.bones.flatMap(b=>b.cubes??[]),full.bones.flatMap(b=>b.cubes??[]));
  assert.ok(entity.description.visible_bounds_width>=({asml_lithography:6,finance_trading_desk:3,police_file_cabinet:2})[key]);
  for(const file of Object.keys(old.blocks).filter(f=>f.startsWith('blocks/'+key+'_part_'))){
   const cs=read(dir+'blocks/mcpe_food/'+file.slice(7,-5)+'.geo.json')['minecraft:geometry'][0].bones.flatMap(b=>b.cubes??[]);
   assert.equal(cs.length,1);assert.equal(Object.keys(cs[0].uv).length,6);assert.ok(cs[0].size.every(v=>v>0));
  }
 }
});
