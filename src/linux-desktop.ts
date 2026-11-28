import {ActionFormData,ModalFormData} from '@minecraft/server-ui';
import type {Player} from '@minecraft/server';
import {LinuxSession,type LinuxDocument} from './linux-session.js';

const icon=(name:string)=>'textures/items/mcpe_food/linux_ui_'+name;
type App='desktop'|'files'|'terminal';

/** Dedicated apps share a virtual filesystem for the lifetime of the desktop. */
export async function showLinuxDesktop(player:Player,current:()=>boolean):Promise<void>{
 const en=player.hasTag('food_english'),t=(zh:string,english:string)=>en?english:zh;
 const session=new LinuxSession();
 let app:App='desktop';
 let document:LinuxDocument|undefined;
 while(current()){
  if(document){
   const file=document;
   const response=await new ActionFormData()
    .title(t('文本阅读器','Text Reader')+'  /  '+file.name)
    .body('§8'+file.path+'§r\n\n'+file.text)
    .button(t('返回','Back'),icon('back')).show(player);
   if(!current())return;
   if(!response.canceled&&response.selection!==0)return;
   document=undefined;
   continue;
  }
  if(app==='desktop'){
   const response=await new ActionFormData().title(t('方寸 Linux 桌面','Fangcun District Linux'))
    .body(t('应用程序','Applications')+'\n§8'+session.cwd+'§r')
    .button(t('文件管理器','Files'),icon('folder'))
    .button(t('终端','Terminal'),icon('terminal'))
    .button(t('关闭桌面','Close Desktop'),icon('close')).show(player);
   if(response.canceled||!current())return;
   if(response.selection===0)app='files';
   else if(response.selection===1)app='terminal';
   else return;
  }else if(app==='files'){
   const entries=session.entries().filter(name=>name.endsWith('/')||name.toLowerCase().endsWith('.txt'));
   const form=new ActionFormData().title(t('文件管理器','Files')).body('§8'+session.cwd+'§r')
    .button(t('返回桌面','Back to Desktop'),icon('back'));
   const atRoot=session.cwd==='/';
   if(!atRoot)form.button(t('上一级','Parent Folder'),icon('folder'));
   for(const name of entries)form.button(name,icon(name.endsWith('/')?'folder':'text'));
   const response=await form.show(player);
   if(!current())return;
   if(response.canceled||response.selection===0){app='desktop';continue;}
   const choice=response.selection;
   if(!atRoot&&choice===1){session.execute('cd ..');continue;}
   const name=choice===undefined?undefined:entries[choice-(atRoot?1:2)];
   if(!name)return;
   if(name.endsWith('/'))session.execute('cd '+name);
   else document=session.openText(name);
  }else{
   const response=await new ModalFormData().title(t('Linux 终端','Linux Terminal'))
    .label(session.history||t('输入 help 查看命令。\n输入 open README.txt 打开文本。','Type help for commands.\nType open README.txt to read it.'))
    .textField(session.cwd+' $',t('输入命令','Enter a command'))
    .submitButton(t('执行','Run')).show(player);
   if(!current())return;
   if(response.canceled){app='desktop';continue;}
   const line=response.formValues?.find(v=>typeof v==='string');
   if(typeof line!=='string')continue;
   const result=session.execute(line);
   if(result.exit)app='desktop';
   else document=result.document;
  }
 }
}
