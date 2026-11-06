const medical = 'medical_equipment';
const police = 'military_police_equipment';

function prop(key:string, zh:string, en:string, group:string, height:number, lit=false) {
  return {key, zh, en, group, height, lit, wallOnly:false, placementFront:0};
}

export const patch082Props = [
  prop('icu_ecmo','ECMO 体外膜肺氧合设备','ECMO Console',medical,2,true),
  prop('icu_ventilator','ICU 呼吸机','ICU Ventilator',medical,2,true),
  prop('icu_crrt','CRRT 床旁血液净化机','CRRT Machine',medical,2,true),
  prop('icu_iabp','IABP 主动脉内球囊反搏泵','IABP Console',medical,2,true),
  prop('icu_manual_defibrillator','手动除颤监护仪','Manual Defibrillator',medical,1,true),
  prop('icu_high_flow_oxygen','高流量氧疗仪','High Flow Oxygen System',medical,2,true),
  prop('icu_portable_suction','便携吸引器','Portable Suction Unit',medical,1),
  prop('icu_oxygen_cart','氧气瓶推车','Oxygen Cylinder Cart',medical,2),
  prop('icu_syringe_pump_bank','三联注射泵','Triple Syringe Pump Bank',medical,1,true),
  prop('icu_pulse_oximeter','指夹血氧仪套装','Pulse Oximeter Kit',medical,1,true),
  prop('icu_emergency_cart','急救车','Emergency Cart',medical,1),
  prop('icu_exam_lamp','移动检查灯','Mobile Examination Lamp',medical,2),
  prop('police_body_camera_dock','执法记录仪充电座','Body Camera Dock',police,1,true),
  prop('police_evidence_workbench','证物整理台','Evidence Workbench',police,1,true),
  prop('police_checkpoint_kit','交通检查点套装','Traffic Checkpoint Kit',police,1),
  prop('police_breathalyzer_kit','便携酒精检测套装','Breathalyzer Kit',police,1,true),
];

export const patch082ById = new Map(patch082Props.map(d=>['mcpe_food:'+d.key,d]));
export const haoduScreen = {
  key:'digital_haodu_hotel_7x5', zh:'电子广告屏 · 豪都大酒店 7×5',
  en:'Digital Ad Screen · Haodu Hotel 7x5', brand:'haodu_hotel', width:7, height:5,
};
export const patch082Items = [...patch082Props,haoduScreen];
