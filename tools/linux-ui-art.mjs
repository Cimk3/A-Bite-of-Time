import {canvas,png,rect,text} from './art.mjs';

export function writeLinuxIcons(rp,write){
 const ink=[221,242,245,255],mint=[86,218,184,255],muted=[123,158,170,255],red=[233,131,120,255];
 const designs={
  folder(im){
   rect(im,5,9,9,5,muted);rect(im,5,13,22,12,mint);rect(im,7,16,18,7,[58,152,137,255]);
  },
  terminal(im){
   rect(im,5,7,22,18,muted);rect(im,7,9,18,14,[19,36,43,255]);text(im,'>_',9,12,1,mint);
  },
  text(im){
   rect(im,8,5,16,22,ink);rect(im,19,5,5,5,muted);
   for(const y of [12,16,20])rect(im,11,y,y===20?7:10,1,[70,101,116,255]);
  },
  back(im){
   for(let i=0;i<8;i++)rect(im,6+i,14-i,3,5+2*i,mint);
   rect(im,12,14,13,5,mint);
  },
  close(im){
   for(let i=0;i<14;i++){rect(im,8+i,8+i,3,3,red);rect(im,21-i,8+i,3,3,red);}
  },
 };
 for(const [name,paint] of Object.entries(designs)){
  const im=canvas(32,32,[0,0,0,0]);
  rect(im,2,2,28,28,[31,51,61,255]);
  paint(im);
  write(rp,'textures/items/mcpe_food/linux_ui_'+name+'.png',png(32,32,im.data));
 }
}
