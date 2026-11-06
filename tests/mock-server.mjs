export const state={components:new Map(),queue:[],responses:[],forms:[],interact:undefined,leave:undefined,entityInteract:undefined,breakBlock:undefined,hitEntity:undefined,entityLoad:undefined,intervals:[],dimensions:new Map(),properties:new Map()};
export const GameMode={Creative:'Creative',Survival:'Survival',Spectator:'Spectator'};
export class ItemStack{
  constructor(typeId,amount=1){this.typeId=typeId;this.amount=amount;this.nameTag=undefined;}
  get maxAmount(){if(this.typeId.endsWith('_bucket')&&this.typeId!=='minecraft:bucket')return 1;return this.typeId==='minecraft:bucket'?16:this.typeId.startsWith('mcpe_food:')&&!['rice','tea','tofu','cream','dough','cheese'].some(k=>this.typeId===`mcpe_food:${k}`)?16:64;}
  clone(){return Object.assign(new ItemStack(this.typeId,this.amount),{nameTag:this.nameTag});}
  isStackableWith(other){return this.typeId===other.typeId&&this.nameTag===other.nameTag;}
}
export class BlockPermutation{
  constructor(typeId,states={}){this.typeId=typeId;this.states={...states};}
  static resolve(typeId,states={}){return new BlockPermutation(typeId,states);}
  getAllStates(){return {...this.states};} getState(key){return this.states[key];}
  withState(key,value){return new BlockPermutation(this.typeId,{...this.states,[key]:value});}
}
export class FakeContainer{
  constructor(size=36){this.size=size;this.items=Array(size);this.failOnce=false;}
  getItem(i){return this.items[i]?.clone();}
  setItem(i,item){if(this.failOnce){this.failOnce=false;throw new Error('simulated container failure');}this.items[i]=item?.clone();}
  count(id){return this.items.reduce((n,s)=>n+(s?.typeId===id?s.amount:0),0);}
}
const pos=({x,y,z})=>`${x},${y},${z}`;
export class FakeDimension{
  constructor(){this.id='minecraft:overworld';this.blocks=new Map();this.drops=[];this.entities=[];this.players=[];this.sounds=[];this.unloaded=false;this.failSpawn=false;state.dimensions.set(this.id,this);}
  getBlock(loc){if(this.unloaded)return undefined;let block=this.blocks.get(pos(loc));if(!block){block=new FakeBlock('minecraft:air',{...loc},this,{});this.blocks.set(pos(loc),block);}return block;}
  put(typeId,location={x:0,y:1,z:0},states={'minecraft:cardinal_direction':'east'}){
    const b=new FakeBlock(typeId,location,this,states);this.blocks.set(pos(location),b);return b;
  }
  spawnItem(item,loc){const e=new FakeEntity('minecraft:item',loc,this);this.drops.push({item:item.clone(),loc,entity:e});return e;}
  spawnEntity(type,loc){if(this.failSpawn)throw new Error('simulated display spawn failure');const e=new FakeEntity(type,loc,this);this.entities.push(e);return e;}
  getEntities(query={}){
    return this.entities.filter(e=>e.isValid&&(!query.families||query.families.some(()=>
      e.typeId.startsWith('mcpe_food:')&&e.typeId.endsWith('_display')))
      &&(!query.location||Math.hypot(e.location.x-query.location.x,e.location.y-query.location.y,e.location.z-query.location.z)<=query.maxDistance))
      .slice(0,query.closest);
  }
  getPlayers(query={}){
    return this.players.filter(p=>p.isValid&&(!query.location||Math.hypot(p.location.x-query.location.x,p.location.y-query.location.y,p.location.z-query.location.z)<=query.maxDistance));
  }
  playSound(name,location,options){this.sounds.push({name,location,options});}
}
let entitySerial=0;
export class FakeEntity{
  constructor(typeId,location,dimension){this.id=`entity-${++entitySerial}`;this.typeId=typeId;this.location={...location};this.dimension=dimension;this.isValid=true;this.properties=new Map();this.dynamic=new Map();}
  getDynamicProperty(k){return this.dynamic.get(k);}setDynamicProperty(k,v){if(v===undefined)this.dynamic.delete(k);else this.dynamic.set(k,v);}
  setProperty(k,v){this.properties.set(k,v);}getProperty(k){return this.properties.get(k);}triggerEvent(){}
  getRotation(){return this.rotation??{x:0,y:0};}
  setRotation(rotation){this.rotation=rotation;}
  getComponent(){return undefined;}
  teleport(loc,options){this.location={...loc};this.rotation=options?.rotation;}
  tryTeleport(loc,options){if(this.failTeleport)return false;this.teleport(loc,options);return true;}
  remove(){
    this.isValid=false;
  }
}
export class FakeBlock{
  constructor(typeId,location,dimension,states){this.location=location;this.dimension=dimension;this.permutation=BlockPermutation.resolve(typeId,states);}
  get isAir(){return this.typeId==='minecraft:air';}
  get typeId(){return this.permutation.typeId;} setPermutation(p){this.permutation=p;}
  below(){return this.dimension.getBlock({...this.location,y:this.location.y-1});}
}
let playerSerial=0;
export class FakePlayer{
  constructor(dimension){this.id=`player-${++playerSerial}`;this.typeId='minecraft:player';this.isValid=true;this.isSneaking=false;this.dimension=dimension;this.location={x:.5,y:1,z:.5};this.container=new FakeContainer();this.selectedSlotIndex=0;this.actions=[];this.tags=new Set();this.mode=GameMode.Survival;this.onScreenDisplay={setActionBar:s=>this.actions.push(s)};}
  getComponent(name){return name==='minecraft:inventory'?{container:this.container}:undefined;}
  inputInfo={getMovementVector:()=>this.movement??{x:0,y:0}};
  getHeadLocation(){return {...this.location,y:this.location.y+1.62};}
  getViewDirection(){return {x:0,y:1,z:0};}
  getBlockFromViewDirection(){return undefined;}
  tryTeleport(location){this.location={...location};return true;}
  hasTag(tag){return this.tags.has(tag);} playSound(){} getGameMode(){return this.mode;}getRotation(){return {x:0,y:0};}
}
export const system={currentTick:100,beforeEvents:{startup:{subscribe:callback=>callback({blockComponentRegistry:{registerCustomComponent:(key,value)=>state.components.set(key,value)},itemComponentRegistry:{registerCustomComponent:(key,value)=>state.components.set(key,value)}})}},run:callback=>state.queue.push(callback),runInterval:callback=>{state.intervals.push(callback);return state.intervals.length;}};
const subscribe=(key,callback)=>{
  const previous=state[key];
  state[key]=event=>{previous?.(event);callback(event);};
};
export const world={getAllPlayers:()=>[...state.dimensions.values()].flatMap(d=>d.getPlayers()),getDimension:id=>state.dimensions.get(id)??state.dimensions.get('minecraft:'+id),getDynamicPropertyIds:()=>[...state.properties.keys()],getDynamicProperty:k=>state.properties.get(k),setDynamicProperty:(k,v)=>{if(v===undefined)state.properties.delete(k);else state.properties.set(k,v);},beforeEvents:{playerInteractWithBlock:{subscribe:callback=>{state.interact=callback;}},playerInteractWithEntity:{subscribe:cb=>subscribe('entityInteract',cb)},playerBreakBlock:{subscribe:cb=>state.breakBlock=cb}},afterEvents:{playerLeave:{subscribe:cb=>subscribe('leave',cb)},entityHitEntity:{subscribe:cb=>state.hitEntity=cb},entityLoad:{subscribe:cb=>subscribe('entityLoad',cb)}}};
export function interact(player,block,isFirstEvent=true,blockFace='Up'){const e={player,block,isFirstEvent,blockFace,cancel:false,itemStack:player.container.getItem(player.selectedSlotIndex)};state.interact(e);return e;}
export function flush(){const queue=state.queue.splice(0);for(const callback of queue)callback();}
export function reset(){state.queue=[];state.responses=[];state.forms=[];system.currentTick+=30;}
