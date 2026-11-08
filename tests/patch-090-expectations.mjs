import {patch090Items,patch090Props,patch090Walls} from '../.build/patch-090-catalog.js';
import {slotIconEntries} from '../.build/decor-catalog.js';
export const addedBlocks=patch090Props.flatMap(d=>d.kind==='solid'?Array.from({length:d.size.reduce((n,v)=>n*Math.ceil(v),1)},(_,i)=>({key:d.key+'_part_'+i})): [d]);
addedBlocks.push({key:'cafe_toppings'});
export const addedDefinitions=[...patch090Items,...addedBlocks];
export const addedSurfaceCount=patch090Props.length+slotIconEntries.length;
export {patch090Items,patch090Props,patch090Walls,slotIconEntries};
