import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {postOfficeGroup,postOfficeProps} from '../.build/patch-099-catalog.js';
import {surfaceVisuals} from '../.build/decor-catalog.js';
import {modelBounds} from '../tools/detail-art.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';

const bp='packs/FoodAndTable_BP/',rp='packs/FoodAndTable_RP/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const id=key=>'mcpe_food:'+key;

test('0.9.9 adds exactly the nine post office items and appends saved display indices',()=>{
 const old=read('tests/fixtures/v0.9.8.json'),indices=read('tests/fixtures/v0.9.8-display-order.json');
 const ids=postOfficeProps.map(d=>id(d.key));
 assert.equal(ids.length,9);
 const files=readdirSync(bp+'items').map(f=>id(f.slice(0,-5)));
 assert.deepEqual(files.filter(key=>!old.items.includes(key)).sort(),[...ids].sort());
 assert.deepEqual(surfaceVisuals.map(d=>d.key),[...indices,...postOfficeProps.map(d=>d.key)]);
 const categories=read(bp+'item_catalog/crafting_item_catalog.json')['minecraft:crafting_items_catalog'].categories;
 const group=categories[0].groups.find(g=>g.group_identifier.name===id('group_'+postOfficeGroup));
 assert.deepEqual(group.items,ids);
 for(const key of [postOfficeGroup,'tasting_new'])
  assert.equal(readFileSync(bp+'functions/mcpe_food/'+key+'.mcfunction','utf8'),ids.map(id=>'give @s '+id+' 4\n').join(''));
});

for(const item of postOfficeProps)test(item.key+' stays within its footprint, with connected geometry and isolated screen emission',()=>{
 const model=read(rp+'models/entity/mcpe_food/surface_'+item.key+'.geo.json')['minecraft:geometry'][0];
 const cubes=model.bones.flatMap(b=>b.cubes??[]),b=modelBounds(cubes);
 const [w,d,h]=item.size;
 assert.deepEqual([model.description.texture_width,model.description.texture_height],[128,128]);
 assert.ok(cubes.length>=9&&cubes.length<=256);
 assert.ok(b.low[0]>=-w*8&&b.high[0]<=w*8&&b.low[1]===0&&b.high[1]<=h*16&&b.low[2]>=-d*8&&b.high[2]<=d*8);
 const bounds=new Map(cubes.map(c=>[c,modelBounds([c])]));
 const seen=[cubes[0]],remaining=new Set(cubes.slice(1));
 for(const a of seen)for(const b of remaining){
  const ab=bounds.get(a),bb=bounds.get(b);
  if(ab.low.every((v,i)=>Math.min(ab.high[i],bb.high[i])+.002>=Math.max(v,bb.low[i]))){remaining.delete(b);seen.push(b);}
 }
 assert.ok(remaining.size===0,'floating geometry');
 const directions=[['west',0,0],['east',0,1],['down',1,0],['up',1,1],['north',2,0],['south',2,1]];
 for(const [i,a] of cubes.entries())for(const b of cubes.slice(i+1))for(const [face,axis,end] of directions){
  if(!a.uv[face]||!b.uv[face]||Math.abs(a.origin[axis]+a.size[axis]*end-b.origin[axis]-b.size[axis]*end)>.00001)continue;
  const overlap=[0,1,2].filter(i=>i!==axis).every(j=>Math.min(a.origin[j]+a.size[j],b.origin[j]+b.size[j])-Math.max(a.origin[j],b.origin[j])>.00001);
  assert.ok(!overlap,'overlapping '+face+' surfaces');
 }
 const mer=decodeRGBA(readFileSync(rp+'textures/entity/mcpe_food/patch099_'+item.key+'_mer.png'));
 assert.ok(emissionIsValid(mer,'patch099_'+item.key));
 if(item.kind==='solid')for(let i=0;i<Math.ceil(w)*Math.ceil(d)*Math.ceil(h);i++){
  const part=read(bp+'blocks/'+item.key+'_part_'+i+'.json')['minecraft:block'];
  assert.deepEqual(part.components['minecraft:geometry'].bone_visibility,{root:false});
  assert.equal(part.components['minecraft:destruction_particles'].particle_count,0);
 }
});
