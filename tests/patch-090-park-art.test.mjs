import test from 'node:test';
import assert from 'node:assert/strict';
import {parkLampParts,parkLampTexture} from '../tools/patch-090-park-art.mjs';
import {emissionIsValid} from '../tools/emission-policy.mjs';
import {decodeRGBA} from '../tools/png-inspect.mjs';

test('park lamp has four bounded block models and emits only from its lantern texture',()=>{
  const parts=parkLampParts(),texture=parkLampTexture();
  assert.equal(parts.length,4);
  for(const part of parts)for(const cube of part){
    assert.ok(cube.origin[0]>=-8&&cube.origin[0]+cube.size[0]<=8);
    assert.ok(cube.origin[1]>=0&&cube.origin[1]+cube.size[1]<=16);
    assert.ok(cube.origin[2]>=-8&&cube.origin[2]+cube.size[2]<=8);
  }
  const mer=decodeRGBA(texture.mer);
  assert.equal(emissionIsValid(mer,'patch090_park_lamp'),true);
  assert.equal(texture.width,128);
  mer.pixels[1]=20;
  assert.equal(emissionIsValid(mer,'patch090_park_lamp'),false);
});
