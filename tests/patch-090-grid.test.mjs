import test from 'node:test';
import assert from 'node:assert/strict';
import {patch090Items} from '../.build/patch-090-catalog.js';
import {patch090Cells} from '../.build/patch-090-grid.js';

test('all 47 planned identifiers are unique and have positive dimensions',()=>{
  assert.equal(patch090Items.length,47);
  assert.equal(new Set(patch090Items.map(item=>item.key)).size,47);
  for(const item of patch090Items)assert.ok(item.size.every(size=>size>0),item.key);
});

test('floor footprints rotate around their front-left support without duplicates',()=>{
  const anchor={x:15,y:3,z:-16};
  for(const item of patch090Items.filter(item=>item.kind==='solid')){
    const [width,depth,height]=item.size.map(Math.ceil);
    for(const direction of ['north','east','south','west']){
      const cells=patch090Cells(item,anchor,direction);
      assert.equal(cells.length,width*depth*height,item.key);
      assert.equal(new Set(cells.map(cell=>JSON.stringify(cell))).size,cells.length,item.key);
      assert.deepEqual(cells[0],{x:15,y:4,z:-16});
    }
  }
});
