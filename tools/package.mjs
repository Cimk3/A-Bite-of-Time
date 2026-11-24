import {readFileSync,readdirSync,mkdirSync,copyFileSync} from 'node:fs';
import {writeOutput as writeFileSync} from './fs-output.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {zip} from './zip.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const metadata=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const version=metadata.buildLabel??metadata.version;
mkdirSync(dist,{recursive:true});
const tree=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(path.join(dir,e.name)):[path.join(dir,e.name)]);
const entries=dir=>tree(dir).sort().map(file=>[path.relative(dir,file).split(path.sep).join('/'),readFileSync(file)]);
const behavior=zip(entries(path.join(root,'packs/FoodAndTable_BP'))),resource=zip(entries(path.join(root,'packs/FoodAndTable_RP')));
const outputs=new Map([
  [`FoodAndTable_BP-${version}.mcpack`,behavior],[`FoodAndTable_RP-${version}.mcpack`,resource],
  [`FoodAndTable-${version}.mcaddon`,zip([['FoodAndTable_BP.mcpack',behavior],['FoodAndTable_RP.mcpack',resource]])]
]);
const sourceFiles=['AGENTS.md','package.json','package-lock.json','tsconfig.json','README.md','LICENSE','storage-report.json','build-report.json','validation-report.json','upgrade-report.json',...['src','tools','tests','assets','docs','previews'].flatMap(folder=>tree(path.join(root,folder)).map(file=>path.relative(root,file)))];
outputs.set(`FoodAndTable-source-${version}.zip`,zip(sourceFiles.sort().map(file=>[file.split(path.sep).join('/'),readFileSync(path.join(root,file))])));
const checksums=[];
for(const[name,data]of outputs){writeFileSync(path.join(dist,name),data);checksums.push(`${createHash('sha256').update(data).digest('hex')}  ${name}`);console.log(`${name}  ${(data.length/1024).toFixed(1)} KiB`);}
writeFileSync(path.join(dist,'SHA256SUMS.txt'),checksums.join('\n')+'\n');
copyFileSync(path.join(root,'README.md'),path.join(dist,'使用说明.md'));
for(const folder of ['docs','previews'])for(const source of tree(path.join(root,folder))){const target=path.join(dist,path.relative(root,source));mkdirSync(path.dirname(target),{recursive:true});copyFileSync(source,target);}
copyFileSync(path.join(root,'LICENSE'),path.join(dist,'LICENSE'));
console.log('Created deterministic import packages. Import the .mcaddon, then activate the behavior and resource packs in a world.');
