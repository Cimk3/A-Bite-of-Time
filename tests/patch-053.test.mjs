import {addedDefinitions,addedBlocks,addedSurfaceCount,patch090Items,patch090Props,patch090Walls,slotIconEntries} from './patch-090-expectations.mjs';
import {patch082Props} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,brandAdvertisements,digitalScreens} from '../.build/scenario-catalog.js';
import {newProps,cityAdvertisements} from '../.build/lifestyle-catalog.js';
import {restaurantItems} from '../.build/restaurant-catalog.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {electronics,officeElectronics} from '../.build/electronics-catalog.js';
import {surfaceVisuals} from '../.build/decor-catalog.js';
import {recipes} from '../.build/catalog.js';
import {screenYaw,screenNormal} from '../.build/device-facing.js';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {electronicCubes} from '../tools/electronics-art.mjs';
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p,'utf8'));
const screenCube=c=>c.uv?.south?.uv_size[0]===96&&c.uv.south.uv[0]===0&&c.uv.south.uv[1]<56;

test('0.5.3 adds exactly seven office props and preserves every 0.5.2 display index and interface',()=>{
  const old=read('tests/fixtures/v0.5.2.json'),keys=officeElectronics.map(d=>'mcpe_food:'+d.key).sort();assert.equal(keys.length,7);
  for(const kind of ['items','blocks']){const current=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);assert.deepEqual(current.filter(k=>!old[kind].includes(k)&&![...newProps,...cityAdvertisements,...scenarioProps,...brandAdvertisements,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch080Props,...patch082Props,...patch085Props,...addedDefinitions].some(d=>'mcpe_food:'+d.key===k)&&!restaurantItems.some(d=>'mcpe_food:'+d.key===k)).sort(),keys);for(const k of old[kind])assert.ok(current.includes(k));}
  assert.deepEqual(surfaceVisuals.slice(0,361).map(d=>d.key),read('tests/fixtures/v0.5.2-surfaces.json'));assert.equal(surfaceVisuals.length,609+patch085Props.length+addedSurfaceCount);
  for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
  assert.deepEqual(recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),old.menuRecipes);
  for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]])for(const[f,sha]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),sha);
  for(const[f,states]of Object.entries(old.cropStates))assert.deepEqual(read(`${bp}/blocks/${f}`)['minecraft:block'].description.states,states);
});

test('every emitted tilted screen stays ahead of the chassis and retains continuous top-to-bottom UV rows',()=>{
  for(const d of electronics.filter(d=>d.openAngle))for(const [folder,key]of [['blocks',d.key],['entity','surface_'+d.key]]){
    const cubes=read(`${rp}/models/${folder}/mcpe_food/${key}.geo.json`)['minecraft:geometry'][0].bones.flatMap(b=>b.cubes??[]),screen=cubes.filter(screenCube).sort((a,b)=>a.origin[1]-b.origin[1]);
    assert.ok(screen.length>30);let next=56;
    for(const c of screen){const uv=c.uv.south;assert.ok(Math.abs(uv.uv[1]+uv.uv_size[1]-next)<1e-6,`${key}: UV seam`);next=uv.uv[1];
      if(c.uv.up){assert.equal(c.uv.up.uv_size[0],96);assert.ok(c.uv.up.uv_size[1]>0);assert.ok(Math.abs(c.uv.up.uv[1]-uv.uv[1])<1e-6,`${key}: tread samples the same screen row`);}
      else {
        const corners=[0,1].flatMap(x=>[0,1].map(z=>[c.origin[0]+c.size[0]*x,c.origin[1]+c.size[1]+.002,c.origin[2]+c.size[2]*z]));
        assert.ok(cubes.some(other=>other!==c&&corners.every(p=>p.every((v,axis)=>v>=other.origin[axis]-.0001&&v<=other.origin[axis]+other.size[axis]+.0001))),`${key}: an omitted tread must be fully hidden, never an open hole`);
      }
      const front=c.origin[2]+c.size[2];
      for(const other of cubes){if(other===c||screenCube(other))continue;
        const overlaps=[0,1].every(axis=>Math.min(c.origin[axis]+c.size[axis],other.origin[axis]+other.size[axis])-Math.max(c.origin[axis],other.origin[axis])>1e-7);
        if(overlaps&&other.origin[2]<front&&other.origin[2]+other.size[2]>c.origin[2]-.3){assert.ok(front-(other.origin[2]+other.size[2])>=.019,`${key}: screen/chassis depth collision`);}
      }
    }assert.ok(Math.abs(next)<1e-6,`${key}: missing top UV`);
  }
});

test('router LEDs, server drive bays and new prop fronts face the nearest cardinal placer',()=>{
  for(const key of ['router','server_cabinet',...officeElectronics.filter(d=>d.pose!=='closed').map(d=>d.key)]){
    const d=electronics.find(d=>d.key===key);assert.equal(d.placementFront,180);
    for(let angle=0;angle<360;angle+=5){const t=angle*Math.PI/180,p={x:4*Math.sin(t),z:4*Math.cos(t)},yaw=screenYaw('mcpe_food:'+key,{x:0,z:0},p,-17),n=screenNormal(yaw,d.placementFront);assert.ok([0,90,-90,-180].includes(yaw));assert.ok((n.x*p.x+n.z*p.z)/4>=Math.SQRT1_2-1e-8);}
  }
  for(const key of ['router','server_cabinet','printer_scanner'])assert.equal(electronics.find(d=>d.key===key).screenFront,0);
});

test('office artwork distinguishes finishes, IDE, Windows, editing and notes without emissive paper',()=>{
  const images=new Set();for(const d of officeElectronics){const png=readFileSync(`assets/electronics/${d.key}.png`),mer=decodeRGBA(readFileSync(`assets/electronics/${d.key}_mer.png`));assert.equal(mer.width,128);images.add(createHash('sha256').update(png).digest('hex'));
    if(d.model==='printer')for(let y=64;y<104;y++)for(let x=0;x<80;x++)assert.equal(mer.pixels[(y*128+x)*4+1],0);
  }assert.equal(images.size,7);
  const surface=electronicCubes(electronics.find(d=>d.key==='surface_pro_keyboard')),stand=surface.filter(c=>c.tag==='kickstand').sort((a,b)=>b.origin[1]-a.origin[1])[0];
  assert.ok(surface.some(c=>c.tag==='lid_shell'&&[0,1,2].every(axis=>Math.min(c.origin[axis]+c.size[axis],stand.origin[axis]+stand.size[axis])-Math.max(c.origin[axis],stand.origin[axis])>0)),'kickstand upper mount must meet the back shell');
});
