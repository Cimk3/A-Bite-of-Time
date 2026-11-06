import {patch082Props} from '../.build/patch-082-catalog.js';
import {patch080Props} from '../.build/patch-080-catalog.js';
import {patch074Props,patch074WallVariants,patch074DigitalScreens,patch074Groups} from '../.build/patch-074-catalog.js';
import {patch073Props,governmentLegacyKeys,governmentKeys} from '../.build/patch-073-catalog.js';
import {patch072Props,clothingItems,patch072Groups} from '../.build/patch-072-catalog.js';
import {patch071Props} from '../.build/patch-071-catalog.js';
import {scenarioProps,brandAdvertisements,digitalScreens} from '../.build/scenario-catalog.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
import {officeStationery,homeDecor,newProps,cityAdvertisements} from '../.build/lifestyle-catalog.js';import {surfaceVisuals,advertisements,adSize} from '../.build/decor-catalog.js';import {electronics} from '../.build/electronics-catalog.js';import {decodeRGBA} from '../tools/png-inspect.mjs';import {screenYaw,screenNormal} from '../.build/device-facing.js';import {losslessPNG} from '../tools/optimize-release.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP',sameImage=(a,b)=>assert.deepEqual(decodeRGBA(readFileSync(a)),decodeRGBA(readFileSync(b)));
test('0.6.0 adds 30 creative items and 22 blocks; all 0.5.4 public IDs/UUIDs/recipes/drops/indices survive',()=>{
 const old=read('tests/fixtures/v0.5.4.json');for(const kind of ['items','blocks']){const keys=readdirSync(`${bp}/${kind}`).map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);assert.deepEqual(keys.filter(k=>!old[kind].includes(k)&&![...scenarioProps,...brandAdvertisements,...digitalScreens,...patch071Props,...patch072Props,...clothingItems,...patch073Props,...patch074Props,...patch080Props,...patch082Props].some(d=>'mcpe_food:'+d.key===k)).sort(),[...newProps,...(kind==='items'?cityAdvertisements:[])].map(d=>'mcpe_food:'+d.key).sort());for(const id of old[kind])assert.ok(keys.includes(id));}
 for(const[pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(x=>x.uuid)],uuids);}
 for(const[folder,entries]of [['recipes',old.crafting],['loot_tables/blocks',old.loot]]){assert.equal(readdirSync(`${bp}/${folder}`).length,Object.keys(entries).length+(folder==='recipes'?0:22+scenarioProps.length+patch071Props.length+patch072Props.length+patch073Props.length+patch074Props.length+patch080Props.length+patch082Props.length));for(const[f,sha]of Object.entries(entries))assert.equal(createHash('sha256').update(readFileSync(`${bp}/${folder}/${f}`)).digest('hex'),sha);}
 assert.equal(surfaceVisuals.length,609);assert.deepEqual(surfaceVisuals.slice(0,474).map(d=>d.key),read('tests/fixtures/v0.5.4-surfaces.json'));assert.equal(electronics.length+6,41);const priorAds=old.functions['advertisements.mcfunction'].trim().split('\n').map(s=>s.split(' ')[2]);assert.deepEqual(advertisements.slice(0,12).map(d=>'mcpe_food:'+d.key),priorAds);
 for(const d of newProps){const c=read(`${bp}/items/${d.key}.json`)['minecraft:item'].components;assert.ok(!c['minecraft:food']);assert.ok(!c['minecraft:use_animation']);}
 const groups=read(`${bp}/item_catalog/crafting_item_catalog.json`)['minecraft:crafting_items_catalog'].categories[0].groups;assert.deepEqual(groups.filter(g=>['mcpe_food:group_office_stationery','mcpe_food:group_home_decor'].includes(g.group_identifier.name)).map(g=>g.items),[officeStationery,homeDecor].map(list=>list.map(d=>'mcpe_food:'+d.key)));assert.equal(officeStationery.length,8);assert.equal(homeDecor.length,8);
});
test('all new models fit budget, have valid 128px UV and preserve front-facing four-axis placement',()=>{
 for(const d of newProps){const g=read(`${rp}/models/blocks/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],c=g.bones.flatMap(b=>b.cubes??[]);assert.equal(g.description.texture_width,128);assert.ok(c.length>2&&c.length<=256);for(const box of c)for(const f of Object.values(box.uv)){assert.ok(f.uv[0]>=0&&f.uv[1]>=0&&f.uv[0]+f.uv_size[0]<=128&&f.uv[1]+f.uv_size[1]<=128);}
 for(let a=0;a<360;a+=15){const p={x:4*Math.sin(a*Math.PI/180),z:4*Math.cos(a*Math.PI/180)},yaw=screenYaw('mcpe_food:'+d.key,{x:0,z:0},p,0);if('front' in d&&!d.front){assert.equal(yaw,undefined);continue;}const n=screenNormal(yaw);assert.ok((n.x*p.x+n.z*p.z)/4>=Math.SQRT1_2-1e-7);}
 }
});
test('city pixel posters preserve aspect and matte MER; twelve old masters retain exact decoded images',()=>{
 assert.equal(advertisements.length,23);assert.equal(cityAdvertisements.length,8);
 for(const ad of advertisements){const f=`${rp}/textures/entity/mcpe_food/${ad.key}`,color=decodeRGBA(readFileSync(f+'.png')),mer=decodeRGBA(readFileSync(f+'_mer.png'));assert.deepEqual([color.width,color.height],[mer.width,mer.height]);assert.ok(mer.pixels.every((v,i)=>i%4>1||v===0));sameImage(`assets/posters/masters/${ad.key}.png`,f+'.png');for(let size=0;size<3;size++){const[w,h]=adSize(ad,size);assert.equal(w/h,color.width/color.height);}if(ad.series==='city'){assert.equal(Math.max(color.width,color.height),256);assert.ok(new Set(Array.from({length:color.width*color.height},(_,i)=>color.pixels.slice(i*4,i*4+4).join())).size<=6);}else if(ad.series!=='brand')assert.ok(color.width>=1024&&color.height>=1024);}
});
test('lossless optimizer retains table-number slots, shares only equivalent resources and reports measured savings',()=>{
 const c=read(`${rp}/entity/mcpe_food/surface_display.entity.json`)['minecraft:client_entity'].description;assert.equal(Object.keys(c.geometry).length,609);const keys=surfaceVisuals.flatMap((v,i)=>v.key.startsWith('table_number_sign')?[`g${i}`]:[]);assert.equal(new Set(keys.map(k=>c.geometry[k])).size,1);
 for(const v of surfaceVisuals.filter(v=>/^table_number_sign_\d\d$/.test(v.key))){assert.ok(!existsSync(`${rp}/models/blocks/mcpe_food/${v.key}.geo.json`));const set=read(`${rp}/textures/entity/mcpe_food/service_${v.key}.texture_set.json`)['minecraft:texture_set'];assert.equal(set.metalness_emissive_roughness,'service_table_number_sign_mer');}
 const report=read('storage-report.json');assert.ok(report.optimizedOld.rpBytes<report.baseline.rpBytes*.5);assert.ok(report.current.rpBytes<report.baseline.rpBytes);assert.equal(report.lossless,true);
 const bytes=readFileSync('assets/lifestyle/table_clock.png');assert.deepEqual(decodeRGBA(losslessPNG(bytes)),decodeRGBA(bytes));
});
