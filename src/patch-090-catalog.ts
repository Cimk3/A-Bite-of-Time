/** 0.9.0 content, shared by resource generation and placement. */
export type Patch090Kind = 'surface' | 'solid' | 'wall';
export type Patch090Item = {
  key: string;
  zh: string;
  group: string;
  kind: Patch090Kind;
  /** Width, depth and height in blocks, before rotation. */
  size: readonly [number, number, number];
  seats?: number;
  slots?: number;
  placementFront?:number;
};

export const patch090Items: readonly Patch090Item[] = [
  {key:'asml_lithography',zh:'ASML光刻机',group:'laboratory_equipment',kind:'solid',size:[6,4,4]},
  {key:'macbook_air_m5_open',zh:'MacBook Air M5',group:'electronics',kind:'surface',size:[1,1,1],placementFront:180},
  {key:'legion_laptop_open',zh:'LEGION游戏本',group:'electronics',kind:'surface',size:[1,1,1],placementFront:180},
  {key:'ps5_console_set',zh:'PS5与手柄',group:'entertainment_devices',kind:'surface',size:[1,1,1]},
  {key:'xbox_360_console_set',zh:'Xbox 360与手柄',group:'entertainment_devices',kind:'surface',size:[1,1,1]},
  {key:'park_lamp',zh:'公园路灯',group:'park',kind:'solid',size:[1,1,4]},
  {key:'park_bench',zh:'公园长椅',group:'park',kind:'solid',size:[3,1,1],seats:3},
  {key:'park_bin',zh:'公园垃圾桶',group:'park',kind:'solid',size:[1,1,1]},
  {key:'cafe_booth',zh:'咖啡店卡座',group:'cafe',kind:'solid',size:[3,2,1],seats:4},
  {key:'cafe_pastry_case',zh:'西点展示柜',group:'cafe',kind:'solid',size:[3,1,2],slots:6},
  {key:'cafe_espresso_machine',zh:'意式咖啡机',group:'cafe',kind:'solid',size:[2,1,2]},
  {key:'cafe_grinder',zh:'磨豆机',group:'cafe',kind:'solid',size:[1,1,2]},
  {key:'cafe_syrup_set',zh:'三瓶糖浆组合',group:'cafe',kind:'surface',size:[1,1,1]},
  {key:'cafe_mug',zh:'咖啡店马克杯',group:'cafe',kind:'surface',size:[1,1,1]},
  {key:'cafe_double_mug',zh:'双马克杯套装',group:'cafe',kind:'surface',size:[1,1,1]},
  {key:'cafe_takeaway_cup',zh:'打包纸杯',group:'cafe',kind:'surface',size:[1,1,1]},
  {key:'cafe_paper_bag',zh:'打包纸袋',group:'cafe',kind:'surface',size:[1,1,1]},
  {key:'cafe_register',zh:'咖啡店点单收款机',group:'cafe',kind:'solid',size:[2,1,1]},
  {key:'cafe_sealer',zh:'打包机',group:'cafe',kind:'solid',size:[2,1,1]},
  {key:'cafe_toppings',zh:'加料盒',group:'cafe',kind:'solid',size:[2,1,0.75]},
  {key:'cafe_tea_urn',zh:'保温茶桶',group:'cafe',kind:'solid',size:[1,1,2]},
  {key:'finance_terminal',zh:'自主交易终端',group:'finance',kind:'solid',size:[1,1,2]},
  {key:'finance_report',zh:'金融报表',group:'finance',kind:'wall',size:[1,0.125,1]},
  {key:'finance_trading_desk',zh:'六联屏交易工作台',group:'finance',kind:'solid',size:[3,2,2]},
  {key:'finance_monitor',zh:'行情电脑屏',group:'finance',kind:'surface',size:[1,1,1],placementFront:180},
  {key:'finance_phone',zh:'座机电话',group:'finance',kind:'surface',size:[1,1,0.5]},
  {key:'finance_board_10x4',zh:'大盘屏10×4',group:'finance',kind:'wall',size:[10,0.125,4]},
  {key:'finance_board_10x5',zh:'大盘屏10×5',group:'finance',kind:'wall',size:[10,0.125,5]},
  {key:'finance_board_5x4',zh:'大盘屏5×4',group:'finance',kind:'wall',size:[5,0.125,4]},
  {key:'finance_board_4x4',zh:'大盘屏4×4',group:'finance',kind:'wall',size:[4,0.125,4]},
  {key:'finance_ticker_10x1',zh:'股票走势条10×1',group:'finance',kind:'wall',size:[10,0.125,1]},
  {key:'finance_ticker_5x1',zh:'股票走势条5×1',group:'finance',kind:'wall',size:[5,0.125,1]},
  {key:'police_radio',zh:'警用对讲机',group:'police_station',kind:'surface',size:[1,1,1]},
  {key:'police_radio_dock',zh:'对讲机基座',group:'police_station',kind:'surface',size:[1,1,1]},
  {key:'police_first_aid_kit',zh:'应急医疗箱',group:'police_station',kind:'surface',size:[1,1,0.5]},
  {key:'police_monitoring_computer',zh:'监控值班一体机',group:'police_station',kind:'surface',size:[2,1,1],placementFront:180},
  {key:'police_service_terminal',zh:'便民服务终端',group:'police_station',kind:'solid',size:[1,1,2]},
  {key:'police_water_dispenser',zh:'饮水机',group:'police_station',kind:'solid',size:[1,1,2]},
  {key:'police_riot_cabinet',zh:'防暴装备柜',group:'police_station',kind:'solid',size:[2,1,2]},
  {key:'police_warning_light',zh:'壁挂警示灯',group:'police_station',kind:'wall',size:[1,0.5,0.5]},
  {key:'police_file_cabinet',zh:'文件柜',group:'police_station',kind:'solid',size:[2,1,2]},
  {key:'police_reception_sign',zh:'接待大厅标识',group:'police_station',kind:'wall',size:[3,0.125,1]},
  {key:'police_command_screen',zh:'综合指挥大屏',group:'police_station',kind:'wall',size:[4,0.125,2]},
  {key:'ad_novacare_5x5',zh:'NovaCare医疗器械广告屏',group:'advertisements',kind:'wall',size:[5,0.125,5]},
  {key:'ad_auramed_6x6',zh:'AuraMed医疗设备广告屏',group:'advertisements',kind:'wall',size:[6,0.125,6]},
  {key:'home_display_cabinet',zh:'物品展示柜',group:'home_decor',kind:'solid',size:[3,1,2],slots:6},
  {key:'home_display_shelf',zh:'开放展示架',group:'home_decor',kind:'solid',size:[3,1,3],slots:12},
];

export const patch090ById = new Map(patch090Items.map(item=>['mcpe_food:'+item.key,item]));
export function patch090PartId(item:Patch090Item,index:number):string {
  return 'mcpe_food:'+item.key+'_part_'+index;
}

export const patch090Props=patch090Items.filter(item=>item.kind!=='wall').map(item=>({
 ...item,en:item.key.replaceAll('_',' '),height:Math.ceil(item.size[2]),wallOnly:false,placementFront:item.placementFront??0,
 footprint:item.size[0]>1||item.size[1]>1?{width:Math.ceil(item.size[0]),depth:Math.ceil(item.size[1])}:undefined,
}));
export const patch090Walls=patch090Items.filter(item=>item.kind==='wall').map(item=>({
 ...item,en:item.key.replaceAll('_',' '),width:item.size[0],height:item.size[2],brand:item.key,
}));
