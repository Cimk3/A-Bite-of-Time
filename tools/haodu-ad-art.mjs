import {readFileSync} from 'node:fs';
import {canvas, rect, text} from './art.mjs';

// Title raster is source data, so building the pack needs no system font.
const title=JSON.parse(readFileSync(new URL('../assets/digital-screens/haodu-title.json',import.meta.url),'utf8'));

export function haoduAdImage() {
  const night=[17,26,43,255], gold=[228,170,69,255], cream=[248,219,160,255];
  const stone=[177,131,77,255], shadow=[71,54,51,255], glass=[92,58,33,255];
  const image=canvas(448,320,night);
  const paint=(x,y,w,h,c)=>rect(image,x,y,w,h,c);

  title.rows.forEach((row,y)=>{
    for(let x=0;x<row.length;x++)if(row[x]==='1')paint(21+x,38+y,1,1,cream);
  });
  text(image,'HAODU HOTEL',49,102,3,gold);
  paint(24,110,16,2,gold);
  paint(253,110,34,2,gold);
  paint(23,132,101,2,gold);
  paint(138,132,149,2,gold);
  paint(129,129,4,8,cream);

  const windows=(left,top,columns,rows,dx,dy)=>{
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++) {
      const x=left+col*dx,y=top+row*dy;
      paint(x,y,19,28,shadow);
      paint(x+2,y+2,15,23,(col+row)%4===0?stone:gold);
      paint(x+3,y+13,13,10,cream);
      paint(x+8,y+2,3,23,glass);
      paint(x+2,y+10,15,2,glass);
      paint(x-1,y+27,21,3,cream);
    }
  };
  paint(67,180,365,121,stone);
  paint(59,173,384,10,shadow);
  paint(65,171,376,4,gold);
  paint(79,163,361,8,shadow);
  paint(86,160,354,4,gold);
  windows(84,193,8,3,43,33);
  for(let x=73;x<435;x+=43)paint(x,184,4,111,cream);
  paint(66,295,373,6,shadow);

  paint(318,105,96,187,stone);
  paint(323,109,10,176,cream);
  paint(397,109,10,176,cream);
  paint(338,114,53,171,shadow);
  windows(354,124,1,4,0,34);
  paint(308,101,114,7,cream);
  paint(313,94,105,8,shadow);
  for(let row=0;row<5;row++){
    const width=102-row*16,x=365-Math.floor(width/2),y=90-row*7;
    paint(x,y,width,6,shadow);
    paint(x,y,width,2,gold);
  }
  paint(361,48,8,15,gold);

  paint(200,230,134,9,cream);
  paint(188,239,157,6,gold);
  paint(181,244,171,11,shadow);
  paint(175,253,181,5,gold);
  for(const x of [193,331])paint(x,258,9,40,cream);
  paint(210,262,111,35,shadow);
  for(const x of [218,252,286]){
    paint(x,266,27,29,gold);
    paint(x+2,273,23,15,cream);
    paint(x+11,266,3,29,glass);
  }
  paint(184,299,163,5,cream);
  paint(173,304,186,4,gold);
  paint(12,309,424,3,gold);
  return image;
}
