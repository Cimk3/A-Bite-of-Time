import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {modelBounds} from '../tools/detail-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';

const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const baseline=read('tests/fixtures/v0.8.5-candidate.json');
const repaired=[
  'icu_bed','icu_large_patient_monitor','icu_six_channel_syringe_pump',
  'auramed_ecmo','auramed_ventilator','auramed_crrt',
  'novacare_ecmo','novacare_ventilator','novacare_crrt'
];
const entityCubes=key=>read(`${rp}/models/entity/mcpe_food/surface_${key}.geo.json`)['minecraft:geometry'][0].bones.flatMap(bone=>bone.cubes);
const texture=(key,mer=false)=>decodeRGBA(readFileSync(`${rp}/textures/entity/mcpe_food/patch085_${key}${mer?'_mer':''}.png`));

test('0.8.6 preserves 0.8.5 definitions, UUIDs and surface display order',()=>{
  const files=['items','blocks','recipes','loot_tables','functions'].flatMap(folder=>
    readdirSync(`${bp}/${folder}`,{recursive:true,withFileTypes:true})
      .filter(entry=>entry.isFile())
      .map(entry=>`${entry.parentPath}/${entry.name}`.replaceAll('\\','/').slice(bp.length+1))
  ).filter(path=>path!=='functions/mcpe_food/build_info.mcfunction'&&!Object.hasOwn(baseline.repairedBlockDefinitions,path)).sort();
  assert.equal(files.length,baseline.behaviorDefinitionCount);
  assert.equal(hash(files.map(path=>`${path}:${hash(readFileSync(`${bp}/${path}`))}\n`).join('')),baseline.behaviorDefinitionDigest);
  for(const [path,expected] of Object.entries(baseline.repairedBlockDefinitions)){
    const block=read(`${bp}/${path}`);
    delete block['minecraft:block'].components['minecraft:selection_box'];
    assert.deepEqual(block,expected,path);
  }
  for(const [i,pack] of [bp,rp].entries()){
    const manifest=read(`${pack}/manifest.json`);
    assert.deepEqual([manifest.header.uuid,...manifest.modules.map(module=>module.uuid)],baseline.uuids[i]);
  }
  const client=read(`${rp}/entity/mcpe_food/surface_display.entity.json`)['minecraft:client_entity'];
  assert.deepEqual(Object.values(client.description.geometry),baseline.surfaceGeometryOrder);
});

test('ICU bed mesh fits 1×2 and the square entity selection fits a single block across',()=>{
  const shape=read(`${bp}/entities/surface_display.json`)['minecraft:entity'].component_groups['mcpe_food:icu_bed'];
  const {low,high}=modelBounds(entityCubes('icu_bed'));
  assert.ok(baseline.bedSelectionWidth>2);
  assert.equal(shape['minecraft:collision_box'].width,1);
  assert.ok(low[0]>=-8.001&&high[0]<=8.001&&low[2]>=-16.001&&high[2]<=16.001);
});

test('repaired geometry stays in bounds and has no overlapping coplanar outward faces',()=>{
  const faces=[['west',0,0],['east',0,1],['down',1,0],['up',1,1],['north',2,0],['south',2,1]];
  for(const key of repaired){
    const cubes=entityCubes(key),{low,high}=modelBounds(cubes);
    const depth=key==='icu_bed'?16:8;
    assert.ok(cubes.length<=256&&low[0]>=-8.001&&high[0]<=8.001&&low[1]>=0&&high[1]<=32&&low[2]>=-depth-.001&&high[2]<=depth+.001,key);
    for(const [i,a] of cubes.entries())for(const b of cubes.slice(i+1))for(const [face,axis,side] of faces){
      if(!a.uv[face]||!b.uv[face])continue;
      const plane=c=>c.origin[axis]+c.size[axis]*side;
      if(Math.abs(plane(a)-plane(b))>.006)continue;
      const overlap=[0,1,2].filter(k=>k!==axis).every(k=>
        Math.min(a.origin[k]+a.size[k],b.origin[k]+b.size[k])-Math.max(a.origin[k],b.origin[k])>.001
      );
      assert.ok(!overlap,`${key}: ${face} at ${plane(a)}, cubes ${a.origin} and ${b.origin}`);
    }
    const remaining=new Set(cubes.slice(1)),connected=[cubes[0]];
    for(const a of connected)for(const b of remaining){
      const touches=a.origin.every((v,k)=>
        Math.min(v+a.size[k],b.origin[k]+b.size[k])+.005>=Math.max(v,b.origin[k])
      );
      if(touches){remaining.delete(b);connected.push(b);}
    }
    assert.equal(remaining.size,0,`${key}: detached parts`);
    const color=texture(key),mer=texture(key,true);
    assert.deepEqual([color.width,color.height,mer.width,mer.height],[128,128,128,128]);
    assert.ok(emissionIsValid(mer,'patch085_'+key),key);
  }
  const pumps=entityCubes('icu_six_channel_syringe_pump').filter(c=>String(c.uv.north?.uv)==='0,50');
  assert.equal(pumps.length,6);
});

test('all four monitor channels have continuous traces and separate numeric pixels',()=>{
  const key='icu_large_patient_monitor',map=texture(key);
  const screens=entityCubes(key).filter(c=>String(c.uv.north?.uv)==='0,0');
  assert.equal(screens.length,1);
  const pixel=(x,y)=>Array.from(map.pixels.subarray((y*map.width+x)*4,(y*map.width+x)*4+3)).join(',');
  const channels=['78,231,91','61,202,232','236,193,60','218,71,196'];
  for(const [row,color] of channels.entries()){
    const ys=Array.from({length:12},(_,y)=>12*row+y);
    for(let x=3;x<71;x++)assert.ok(ys.some(y=>pixel(x,y)===color),`trace row ${row} at ${x}`);
    for(let x=71;x<74;x++)assert.ok(ys.every(y=>pixel(x,y)!==color),`gutter row ${row} at ${x}`);
    assert.ok(ys.some(y=>Array.from({length:22},(_,x)=>x+74).some(x=>pixel(x,y)===color)));
  }
});
