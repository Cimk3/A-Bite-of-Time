import {state} from './mock-server.mjs';
class Form{
  constructor(){this.details={buttons:[],icons:[]};} title(t){this.details.title=t;return this;} body(t){this.details.body=t;return this;}
  button(t,iconPath){this.details.buttons.push(t);if(iconPath)this.details.icons.push(iconPath);return this;}button1(t){return this.button(t);}button2(t){return this.button(t);}
  show(){state.forms.push(this.details);return Promise.resolve(state.responses.shift()??{canceled:true});}
}
export class ActionFormData extends Form{}
export class MessageFormData extends Form{}

export class ModalFormData extends Form{
  dropdown(label,options,defaults){(this.details.dropdowns??=[]).push({label,options,defaults});return this;}
  label(value){this.details.label=value;return this;}
  textField(label,placeholder){this.details.field={label,placeholder};return this;}
  submitButton(value){this.details.submit=value;return this;}
}
