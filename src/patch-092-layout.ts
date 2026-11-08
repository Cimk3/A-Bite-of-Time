import type {Patch090Item} from './patch-090-catalog.js';
import type {GridDirection,GridPosition} from './patch-090-grid.js';
export const oppositeDirection:Record<GridDirection,GridDirection>={north:'south',south:'north',east:'west',west:'east'};
/** Decide from the player to the clicked support; looking away never reverses it. */
export function facingPlayer(player:GridPosition,support:GridPosition,lookYaw:number):GridDirection {
 const x=player.x-support.x-.5,z=player.z-support.z-.5;
 if(Math.hypot(x,z)>.01)return Math.abs(x)>Math.abs(z)?x>0?'east':'west':z>0?'south':'north';
 const look=(Math.round(lookYaw/90)%4+4)%4;
 return (['north','east','south','west'] as const)[look]!;
}
/** Rotate a whole old structure inside its original footprint, not each cell alone. */
export function nativePartIndex(item:Patch090Item,index:number,reversed:boolean,direction:GridDirection='north'):number {
 if(!reversed)return index;
 const w=Math.ceil(item.size[0]),d=Math.ceil(item.size[1]),y=Math.floor(index/(w*d)),x=index%w,z=Math.floor(index/w)%d;
 return y*w*d+(d-1-z)*w+((direction==='east'||direction==='west')?x:w-1-x);
}
export const displaySlotScale=.2;
export function slotLocal(item:Patch090Item,index:number):GridPosition {
 const columns=item.slots===12?4:3,row=Math.floor(index/columns),rows=(item.slots??6)/columns;
 const units=item.size[2]*16;
 return {x:(index%columns+.5)*item.size[0]/columns-.5,y:row===0?2/16:(row*(units-2)/rows+1)/16,z:0};
}
export function seatLocal(item:Patch090Item,index:number):GridPosition {
 if(item.key==='cafe_booth')return {x:index<2?-.15625:2.09375,y:7/16,z:index%2?.9375:.0625};
 return {x:index,y:7.2/16,z:-.35/16};
}
