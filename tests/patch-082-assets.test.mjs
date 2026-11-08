import {addedDefinitions,addedBlocks,addedSurfaceCount,patch090Items,patch090Props,patch090Walls,slotIconEntries} from './patch-090-expectations.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {surfaceVisuals} from '../.build/decor-catalog.js';
import {clothingVisuals} from '../.build/patch-072-catalog.js';
import {digitalScreens,wallScreens} from '../.build/scenario-catalog.js';
import {haoduScreen,patch082Items,patch082Props} from '../.build/patch-082-catalog.js';
import {patch085Props} from '../.build/patch-085-catalog.js';
import {modelBounds} from '../tools/detail-art.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';

const read=file=>JSON.parse(readFileSync(file,'utf8'));
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
const id=key=>'mcpe_food:'+key;
const old=read('tests/fixtures/v0.8.1.json');
const order=read('tests/fixtures/v0.8.1-displays.json');
const give=key=>'give @s '+id(key)+' 4';
const body=key=>readFileSync(bp+'/functions/mcpe_food/'+key,'utf8');

test('0.8.2 adds precisely 17 creative items, 16 blocks and append-only display indices',()=>{
  for(const [folder,expected,total] of [['items',patch082Items,371],['blocks',patch082Props,522]]) {
    const current=readdirSync(bp+'/'+folder).map(f=>read(bp+'/'+folder+'/'+f)['minecraft:'+folder.slice(0,-1)].description.identifier);
    const prior=current.filter(key=>![...patch085Props,...addedDefinitions].some(item=>id(item.key)===key));
    assert.equal(prior.length,total);
    assert.deepEqual(prior.filter(k=>!old[folder].includes(k)).sort(),expected.map(d=>id(d.key)).sort());
    for(const k of old[folder])assert.ok(current.includes(k),k);
  }
  for(const [pack,uuids] of Object.entries(old.uuids)) {
    const manifest=read('packs/'+pack+'/manifest.json');
    assert.deepEqual([manifest.header.uuid,...manifest.modules.map(m=>m.uuid)],uuids);
  }
  assert.deepEqual(surfaceVisuals.map(d=>d.key),[...order.surfaceKeys,...patch082Props.map(d=>d.key),...patch085Props.map(d=>d.key),...patch090Props.map(d=>d.key),...slotIconEntries.map(d=>d.key)]);
  assert.deepEqual(clothingVisuals,order.clothingVisuals);
  assert.deepEqual(digitalScreens,[...order.digitalScreens,haoduScreen,...patch090Walls]);
  assert.deepEqual(wallScreens,[...order.wallScreens,haoduScreen,...patch090Walls]);
  assert.deepEqual(read(bp+'/mcpe_food_build.json'),read(rp+'/mcpe_food_build.json'));
});

test('old models, textures, definitions, recipes and loot are byte identical to 0.8.1',()=>{
  const hashes=read('tests/fixtures/v0.8.1-resources.json');
  assert.equal(Object.keys(hashes).length,5717);
  for(const [path,expected] of Object.entries(hashes)) {
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),expected,path);
  }
  assert.deepEqual(readdirSync(bp+'/recipes').sort(),Object.keys(old.crafting).sort());
});

test('creative groups and give commands append the approved content to their old prefixes',()=>{
  const groups=read(bp+'/item_catalog/crafting_item_catalog.json')['minecraft:crafting_items_catalog'].categories[0].groups;
  const additions={
    'medical_equipment.mcfunction':[...patch082Props,...patch085Props].filter(d=>d.group==='medical_equipment'),
    'military_police_equipment.mcfunction':patch082Props.filter(d=>d.group==='military_police_equipment'),
    'digital_ad_screens.mcfunction':[haoduScreen,...patch090Walls],
  };
  for(const [key,prior] of Object.entries(old.functions)) {
    if(['build_info.mcfunction','tasting_new.mcfunction'].includes(key))continue;
    const newItems=additions[key];
    assert.equal(body(key),newItems?prior+newItems.map(d=>give(d.key)).join('\n')+'\n':prior,key);
  }
  assert.equal(body('tasting_new.mcfunction'),patch090Items.map(d=>give(d.key)).join('\n')+'\n');
  for(const prop of patch082Items) {
    const found=groups.filter(g=>g.items.includes(id(prop.key)));
    assert.equal(found.length,1);
    assert.equal(found[0].group_identifier.name,'mcpe_food:group_'+(prop.group??'advertisements'));
  }
});

test('all new generated props stay in their supported volume with private 128px color and MER',()=>{
  for(const d of patch082Props) {
    for(const path of ['blocks/'+d.key,'entity/surface_'+d.key]) {
      const [geometry]=read(rp+'/models/'+path.replace(/\/([^/]+)$/,'/mcpe_food/$1')+'.geo.json')['minecraft:geometry'];
      assert.deepEqual([geometry.description.texture_width,geometry.description.texture_height],[128,128]);
      const cubes=geometry.bones.flatMap(b=>b.cubes??[]);
      const {low,high}=modelBounds(cubes);
      assert.ok(cubes.length<=256&&low[0]>=-8&&high[0]<=8&&low[2]>=-8&&high[2]<=8&&low[1]>=0&&high[1]<=d.height*16,d.key);
    }
    const tex=rp+'/textures/blocks/mcpe_food/patch082_'+d.key;
    const color=decodeRGBA(readFileSync(tex+'.png')),mer=decodeRGBA(readFileSync(tex+'_mer.png'));
    assert.deepEqual([color.width,color.height,mer.width,mer.height],[128,128,128,128]);
    assert.ok(emissionIsValid(mer,'patch082_'+d.key));
    assert.equal(mer.pixels.some((v,i)=>i%4===1&&v>0),d.lit,d.key);
  }
});

test('Haodu wall screen has 112×80 model units, six cubes and a private 448×320 north-facing UV',()=>{
  const [g]=read(rp+'/models/entity/mcpe_food/'+haoduScreen.key+'.geo.json')['minecraft:geometry'];
  assert.deepEqual([g.description.texture_width,g.description.texture_height],[448,320]);
  assert.equal(g.bones.flatMap(b=>b.cubes).length,6);
  assert.deepEqual(g.bones[0].cubes[0].size,[112,80,.8]);
  assert.deepEqual(g.bones[1].cubes[0].uv.north.uv_size,[448,320]);
  const c=read(rp+'/entity/mcpe_food/digital_ad_display.entity.json')['minecraft:client_entity'].description;
  assert.equal(c.geometry.g13,g.description.identifier);
  assert.equal(c.textures.f13,'textures/entity/mcpe_food/digital_content_haodu_hotel_7x5');
  const mer=decodeRGBA(readFileSync(rp+'/'+c.textures.f13+'_mer.png'));
  assert.ok(emissionIsValid(mer,'digital_content_haodu_hotel_7x5'));
});
