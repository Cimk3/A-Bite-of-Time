import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {electronics} from '../.build/electronics-catalog.js';
import {emittedLidAngle} from '../tools/device-geometry.mjs';
import {cardinalYaw,screenYaw,screenNormal} from '../.build/device-facing.js';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p,'utf8'));

test('shipped lids use one upright panel or the original backward mesh without native cube rotation',()=>{
  for(const d of electronics.filter(d=>d.openAngle))for(const [folder,key]of [['blocks',d.key],['entity','surface_'+d.key]]){
    const geo=read(`${rp}/models/${folder}/mcpe_food/${key}.geo.json`)['minecraft:geometry'][0],cubes=geo.bones.flatMap(b=>b.cubes??[]);
    const screen=cubes.filter(c=>c.uv.south?.uv_size[0]===96&&c.uv.south.uv[0]===0&&c.uv.south.uv[1]<56).sort((a,b)=>a.origin[1]-b.origin[1]);
    assert.ok(d.openAngle===90?screen.length===1:screen.length>30,d.key);assert.ok(screen.every(c=>!c.rotation),`${key}: avoid engine Euler rotation interpretation`);
    if(d.openAngle===110){
      const low=screen[Math.floor(screen.length*.15)],high=screen[Math.floor(screen.length*.85)];
      assert.ok(high.origin[2]+high.size[2]/2<low.origin[2]+low.size[2]/2,key);
    }
    assert.ok(Math.abs(emittedLidAngle(cubes)-d.openAngle)<1e-7,`${key}: emitted coordinates match the declared angle`);
    assert.ok(cubes.length<=256);for(const c of cubes)assert.ok(c.size.every(x=>x>0&&Number.isFinite(x)));
  }
});

test('four-axis screen placement never emits diagonal yaw and selects the closest front toward the player',()=>{
  for(const device of electronics.filter(d=>d.screenFront))for(let deg=0;deg<360;deg+=3){
    const theta=deg*Math.PI/180,p={x:3*Math.sin(theta),z:3*Math.cos(theta)},yaw=screenYaw('mcpe_food:'+device.key,{x:0,z:0},p,71),normal=screenNormal(yaw,device.screenFront);
    assert.ok([0,90,-90,-180].includes(yaw));assert.ok((normal.x*p.x+normal.z*p.z)/3>=Math.SQRT1_2-1e-8);
  }
  for(const value of [-721,-179,-136,-91,-44,0,38,91,179,361]){const yaw=cardinalYaw(value);assert.equal(Math.abs(yaw%90),0);assert.equal(cardinalYaw(yaw),yaw);}
});

test('0.5.1 identifiers, recipes, drops, crop states and UUIDs survive subsequent patches',()=>{
  const old=read('tests/fixtures/v0.5.1.json');for(const kind of ['items','blocks'])assert.deepEqual(readdirSync(`${bp}/${kind}`).filter(f=>old[kind].includes(read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier)).sort().map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier),old[kind]);
  for(const [pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[file,hash]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${file}`)).digest('hex'),hash);
  for(const[file,content]of Object.entries(old.functions))if(!['advertisements.mcfunction','electronics.mcfunction','tasting_new.mcfunction','tasting_all_chinese.mcfunction'].includes(file))assert.equal(readFileSync(`${bp}/functions/mcpe_food/${file}`,'utf8'),content);
  for(const[file,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${file}`)['minecraft:block'].description.states,states);
});
