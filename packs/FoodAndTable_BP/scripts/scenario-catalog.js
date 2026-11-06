import { patch080Props } from './patch-080-catalog.js';
import { haoduScreen, patch082Props } from './patch-082-catalog.js';
import { patch085Props } from './patch-085-catalog.js';
import { patch074Props, patch074WallVariants, patch074DigitalScreens } from './patch-074-catalog.js';
import { patch073Props } from './patch-073-catalog.js';
import { patch072Props, infoScreens } from './patch-072-catalog.js';
import { patch071Props } from './patch-071-catalog.js';
/** 0.7.0 static creative props. IDs and append order are persistent contracts. */
const group = (key, zh, en, rows) => ({ key, zh, en, items: rows.map(([key, zh, en, height, wallOnly]) => ({ key, zh, en, height, wallOnly: wallOnly === true })) });
export const scenarioGroups = [
    group('medical_equipment', '医疗器械', 'Medical Equipment', [
        ['aed_cabinet', '壁挂式AED急救箱', 'Wall AED Cabinet', 1, true], ['patient_monitor', '病人监护仪', 'Patient Monitor', 1], ['ultrasound_cart', '超声诊断推车', 'Ultrasound Cart', 2], ['infusion_pump_stand', '输液泵与支架一体组', 'Infusion Pump and Stand', 2], ['ecg_machine', '心电图机', 'ECG Machine', 1], ['medical_trolley', '医疗器械推车', 'Medical Trolley', 1], ['laboratory_microscope', '实验室显微镜', 'Laboratory Microscope', 1], ['wall_diagnostic_station', '壁挂诊断器械组', 'Wall Diagnostic Station', 1, true]
    ]),
    group('entertainment_devices', '娱乐设备', 'Entertainment Devices', [
        ['arcade_cabinet', '立式街机', 'Arcade Cabinet', 2], ['game_console_set', '游戏主机与手柄套装', 'Game Console and Controllers', 1], ['flat_screen_tv', '壁挂电视', 'Flat Screen Television', 1]
    ]),
    group('banking_equipment', '银行设备', 'Banking Equipment', [
        ['atm_terminal', 'ATM', 'ATM Terminal', 2], ['banknote_counter', '点钞机', 'Banknote Counter', 1], ['queue_ticket_kiosk', '排队取号机', 'Queue Ticket Kiosk', 2]
    ]),
    group('ai_work_devices', 'AI工作设备', 'AI Work Devices', [
        ['ai_inference_workstation', 'AI推理工作站', 'AI Inference Workstation', 1], ['ai_dual_screen_desk', '双屏AI工作台', 'Dual Screen AI Desk', 2], ['ai_compute_rack', 'AI算力机柜', 'AI Compute Rack', 2], ['pen_display_set', '数位屏与绘图笔套装', 'Pen Display and Stylus', 1]
    ]),
    group('home_appliances', '家电', 'Home Appliances', [
        ['wall_air_conditioner', '壁挂空调', 'Wall Air Conditioner', 1, true], ['microwave_oven', '微波炉', 'Microwave Oven', 1], ['front_load_washer', '滚筒洗衣机', 'Front Load Washer', 1], ['floor_air_conditioner', '柜式空调', 'Floor Air Conditioner', 2], ['standing_fan', '落地风扇', 'Standing Fan', 2], ['air_purifier', '空气净化器', 'Air Purifier', 1], ['robot_vacuum_dock', '扫地机器人与基站', 'Robot Vacuum and Dock', 1], ['electric_kettle', '电热水壶', 'Electric Kettle', 1], ['rice_cooker', '电饭煲', 'Rice Cooker', 1], ['dishwasher', '洗碗机', 'Dishwasher', 1]
    ]),
    group('teaching_equipment', '教学设备', 'Teaching Equipment', [
        ['electronic_whiteboard', '壁挂电子白板', 'Electronic Whiteboard', 1, true], ['teaching_lectern', '现代教学讲台', 'Teaching Lectern', 2], ['document_camera', '实物展台／文档摄像仪', 'Document Camera', 1]
    ])
];
export const scenarioProps = scenarioGroups.flatMap(g => g.items.map(d => ({ ...d, group: g.key })));
export const scenarioById = new Map([...scenarioProps, ...patch071Props, ...patch072Props, ...patch073Props, ...patch074Props, ...patch080Props, ...patch082Props, ...patch085Props].map(d => ['mcpe_food:' + d.key, d]));
export const wallKeys = [...scenarioProps.filter(d => d.wallOnly).map(d => d.key), 'flat_screen_tv', 'landscape_frame', 'table_clock'];
export const wallVariants = wallKeys.map(key => ({ key: key + '_wall', base: key, zh: '壁挂 ' + key, en: 'Wall ' + key }));
export const wallById = new Map([...wallKeys, ...patch074WallVariants.map(d => d.base)].map(key => ['mcpe_food:' + key, key + '_wall']));
export const brandAdvertisements = [
    { key: 'ad_template_ai', series: 'brand', zh: 'Template AI', en: 'Template AI', aspect: 'wide' },
    { key: 'ad_luna_studio', series: 'brand', zh: 'Luna Studio（月-工作室）', en: 'Luna Studio', aspect: 'portrait' },
    { key: 'ad_ft_computer', series: 'brand', zh: 'FT电脑', en: 'FT Computer', aspect: 'square' }
];
export const legacyDigitalScreens = [['2x2', 2, 2], ['4x4', 4, 4], ['4x3', 4, 3]].flatMap(([size, width, height]) => brandAdvertisements.map(ad => ({ key: `digital_${ad.key.slice(3)}_${size}`, zh: `电子广告屏 · ${ad.zh} ${width}×${height}`, en: `Digital Ad Screen · ${ad.en} ${size}`, brand: ad.key.slice(3), width, height })));
export const digitalScreens = [...legacyDigitalScreens, ...patch074DigitalScreens, haoduScreen];
// The 0.7.2 information screens keep indices 9 and 10.
export const wallScreens = [...legacyDigitalScreens, ...infoScreens, ...patch074DigitalScreens, haoduScreen];
export const digitalById = new Map(wallScreens.map(d => ['mcpe_food:' + d.key, d]));
export const scenarioScreens = new Set(['patient_monitor', 'ultrasound_cart', 'infusion_pump_stand', 'ecg_machine', 'arcade_cabinet', 'flat_screen_tv', 'atm_terminal', 'queue_ticket_kiosk', 'ai_inference_workstation', 'ai_dual_screen_desk', 'ai_compute_rack', 'pen_display_set', 'electronic_whiteboard', 'teaching_lectern']);
