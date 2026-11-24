const home='/home/player';
const directories=['/','/home',home,home+'/Documents','/etc'];
const files=[
 [home+'/README.txt','Food & Table Linux demo\nType help for commands. Folders created with mkdir last until the desktop closes.'],
 [home+'/Documents/notes.txt','This computer belongs to the world of Food & Table.'],
 ['/etc/os-release','NAME="Food & Table Linux"\nVERSION="0.9.7"'],
] as const;
type Node={kind:'directory'}|{kind:'file';text:string};
export type LinuxDocument={name:string;path:string;text:string};
type CommandResult={output:string;exit?:true;document?:LinuxDocument};
const initialNodes:[string,Node][]=[
 ...directories.map((path):[string,Node]=>[path,{kind:'directory'}]),
 ...files.map(([path,text]):[string,Node]=>[path,{kind:'file',text}]),
];
const commands='help, pwd, ls [path], cd [path], cat <path>, open <file.txt>, uname -a, mkdir <path>, clear, exit';
const parent=(path:string)=>path.slice(0,path.lastIndexOf('/'))||'/';
const base=(path:string)=>path.slice(path.lastIndexOf('/')+1);

export class LinuxSession {
 private nodes=new Map(initialNodes);
 private location=home;
 private created=0;
 private transcript='';
 get cwd():string {return this.location;}
 get history():string {return this.transcript;}

 private resolve(path:string):string|undefined {
  if(!/^[A-Za-z0-9._~/-]{1,120}$/.test(path))return undefined;
  if(path==='~'||path.startsWith('~/'))path=home+path.slice(1);
  const stack=path.startsWith('/')?[]:this.location.split('/').filter(Boolean);
  const parts=path.split('/').filter(Boolean);
  for(const [index,segment] of parts.entries()){
   if(segment==='..')stack.pop();
   else if(segment!=='.')stack.push(segment);
   if(index<parts.length-1&&this.nodes.get('/'+stack.join('/'))?.kind!=='directory')return undefined;
  }
  return '/'+stack.join('/');
 }
 entries(path=this.location):string[]{
  return [...this.nodes].filter(([key])=>key!=='/'&&parent(key)===path)
   .map(([key,node])=>base(key)+(node.kind==='directory'?'/':'')).sort();
 }
 openText(name:string):LinuxDocument|undefined {
  const path=this.resolve(name);
  if(!path||!path.toLowerCase().endsWith('.txt'))return undefined;
  const file=this.nodes.get(path);
  if(file?.kind==='file')return {name:base(path),path,text:file.text};
  return undefined;
 }
 execute(input:string):CommandResult{
  const line=input.trim();
  if(!line)return {output:''};
  // Only printable literal commands and paths are accepted. Keep raw game
  // formatting characters and unbounded field input out of the UI transcript.
  if(line.length>140||!/^[-A-Za-z0-9._~/ ]+$/.test(line)){
   this.record('Invalid command or path.');
   return {output:'Invalid command or path.'};
  }
  const [command,arg,...extra]=line.split(/ +/),cwd=this.location;
  if(command==='clear'&&!arg){this.transcript='';return {output:''};}
  if(command==='exit'&&!arg)return {output:'',exit:true};
  if(command==='open'&&arg&&!extra.length){
   const document=this.openText(arg);
   const output=document?'':'Text file (.txt) not found.';
   this.record(cwd+' $ '+line+(output?'\n'+output:''));
   return {output,document};
  }
  const output=extra.length?'One path per command.':this.dispatch(command!,arg);
  this.record(cwd+' $ '+line+(output?'\n'+output:''));
  return {output};
 }
 private record(entry:string):void {
  this.transcript=(this.transcript+'\n'+entry).trim().split('\n').slice(-12).join('\n').slice(-950);
 }
 private dispatch(command:string,arg?:string):string {
  if(command==='help'&&!arg)return commands;
  if(command==='pwd'&&!arg)return this.location;
  if(command==='uname'&&arg==='-a')return 'Linux foodandtable 0.9.7 bedrock (simulated)';
  if(!['ls','cd','cat','mkdir'].includes(command))return 'Unknown command or arguments. Type help.';
  if(!arg&&(command==='cat'||command==='mkdir'))return 'A path is required.';
  const path=this.resolve(arg??(command==='cd'?home:'.'));
  if(!path)return 'Invalid path or missing parent directory.';
  const node=this.nodes.get(path);
  if(command==='cat')return node?.kind==='file'?node.text:'File not found.';
  if(command==='mkdir'){
   if(!path.startsWith(home+'/'))return 'You can create folders only in /home/player.';
   if(node)return 'The path already exists.';
   if(this.created>=24||path.split('/').length>10)return 'Session directory limit reached.';
   this.nodes.set(path,{kind:'directory'});this.created++;return '';
  }
  if(node?.kind!=='directory')return 'Directory not found.';
  if(command==='cd'){this.location=path;return '';}
  return this.entries(path).join('  ');
 }
}
