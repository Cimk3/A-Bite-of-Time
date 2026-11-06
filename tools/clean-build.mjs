import {mkdirSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.resolve(root,'.build');
if(target!==path.join(root,'.build'))throw new Error('Refusing to clean outside the generated TypeScript output directory');
rmSync(target,{recursive:true,force:true});
mkdirSync(target,{recursive:true});
