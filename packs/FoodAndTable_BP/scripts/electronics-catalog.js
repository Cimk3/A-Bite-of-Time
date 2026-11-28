import { networkElectronics } from './lifestyle-catalog.js';
import { serviceElectronics } from './restaurant-catalog.js';
/** Stable, static display IDs. Open/closed laptops are independent items. */
export const originalElectronics = [
    { key: 'desktop_computer', zh: '台式电脑套装', en: 'Desktop Computer Set', model: 'desktop', style: 'desktop', pose: 'fixed' },
    { key: 'all_in_one_computer', zh: '一体机电脑套装', en: 'All-in-One Computer Set', model: 'all_in_one', style: 'silver', pose: 'fixed' },
    { key: 'silver_laptop_open', zh: '银色轻薄本（打开）', en: 'Silver Ultrabook (Open)', model: 'laptop', style: 'silver', pose: 'open' },
    { key: 'silver_laptop_closed', zh: '银色轻薄本（合起）', en: 'Silver Ultrabook (Closed)', model: 'laptop', style: 'silver', pose: 'closed' },
    { key: 'gaming_laptop_open', zh: '游戏本（打开）', en: 'Gaming Laptop (Open)', model: 'laptop', style: 'gaming', pose: 'open' },
    { key: 'gaming_laptop_closed', zh: '游戏本（合起）', en: 'Gaming Laptop (Closed)', model: 'laptop', style: 'gaming', pose: 'closed' },
    { key: 'thinkpad_open', zh: 'ThinkPad（打开）', en: 'ThinkPad (Open)', model: 'laptop', style: 'thinkpad', pose: 'open' },
    { key: 'thinkpad_closed', zh: 'ThinkPad（合起）', en: 'ThinkPad (Closed)', model: 'laptop', style: 'thinkpad', pose: 'closed' },
    { key: 'macbook_open', zh: 'MacBook（打开）', en: 'MacBook (Open)', model: 'laptop', style: 'macbook', pose: 'open' },
    { key: 'macbook_closed', zh: 'MacBook（合起）', en: 'MacBook (Closed)', model: 'laptop', style: 'macbook', pose: 'closed' },
    { key: 'router', zh: '四天线路由器', en: 'Four-Antenna Router', model: 'router', style: 'router', pose: 'fixed' },
    { key: 'server_cabinet', zh: '小型服务器机柜', en: 'Compact Server Cabinet', model: 'server', style: 'server', pose: 'fixed' },
    { key: 'ipad_air_magic_keyboard', zh: 'iPad Air与妙控键盘', en: 'iPad Air with Magic Keyboard', model: 'tablet', style: 'ipad', pose: 'fixed' },
    { key: 'crt_monitor', zh: '老式CRT显示器', en: 'Retro CRT Monitor', model: 'crt', style: 'crt', pose: 'fixed' },
    { key: 'keyboard_mouse_set', zh: '键鼠套装', en: 'Keyboard and Mouse Set', model: 'keyboard', style: 'keyboard', pose: 'fixed' }
];
export const newElectronics = [
    { key: 'dell_laptop_open', zh: '戴尔银色轻薄本（打开）', en: 'Dell Silver Ultrabook (Open)', model: 'laptop', style: 'dell', pose: 'open' },
    { key: 'dell_laptop_closed', zh: '戴尔银色轻薄本（合起）', en: 'Dell Silver Ultrabook (Closed)', model: 'laptop', style: 'dell', pose: 'closed' },
    { key: 'macbook_pro_gpt_open', zh: 'MacBook Pro · GPT（打开）', en: 'MacBook Pro with GPT (Open)', model: 'laptop', style: 'macbook_pro', pose: 'open' },
    { key: 'macbook_pro_gpt_closed', zh: 'MacBook Pro · GPT（合起）', en: 'MacBook Pro with GPT (Closed)', model: 'laptop', style: 'macbook_pro', pose: 'closed' }
];
export const officeElectronics = [
    { key: 'macbook_air_silver_open', zh: 'MacBook Air 银色（打开）', en: 'Silver MacBook Air (Open)', model: 'laptop', style: 'air_silver', pose: 'open' },
    { key: 'macbook_air_gray_open', zh: 'MacBook Air 灰色（打开）', en: 'Gray MacBook Air (Open)', model: 'laptop', style: 'air_gray', pose: 'open' },
    { key: 'thinkbook16_plus_open', zh: 'ThinkBook 16+（打开）', en: 'ThinkBook 16+ (Open)', model: 'laptop', style: 'thinkbook', pose: 'open' },
    { key: 'thinkbook16_plus_closed', zh: 'ThinkBook 16+（合起）', en: 'ThinkBook 16+ (Closed)', model: 'laptop', style: 'thinkbook', pose: 'closed' },
    { key: 'printer_scanner', zh: '打印扫描一体机', en: 'Printer and Scanner', model: 'printer', style: 'printer', pose: 'fixed' },
    { key: 'mac_studio_set', zh: 'Mac Studio 桌面套装', en: 'Mac Studio Desktop Set', model: 'studio', style: 'studio', pose: 'fixed' },
    { key: 'surface_pro_keyboard', zh: 'Surface Pro 键盘套装', en: 'Surface Pro with Keyboard', model: 'surface', style: 'surface', pose: 'fixed' }
];
export const fixedLaptopKeys = new Set(['dell_laptop_open', 'macbook_pro_gpt_open', 'macbook_air_silver_open', 'macbook_air_gray_open']);
export const laptopSpawnEvent = (index, facing) => `mcpe_food:laptop_${index}_${facing}`;
export const electronics = [...originalElectronics, ...newElectronics, ...officeElectronics, ...serviceElectronics, ...networkElectronics].map(d => ({ ...d,
    placementFront: ['keyboard'].includes(d.model) || (d.model === 'laptop' && d.pose === 'closed') ? undefined : 180,
    screenFront: ((d.model === 'laptop' && d.pose === 'open') || (d.model === 'network' && ['phone', 'ups'].includes(d.style)) || ['desktop', 'all_in_one', 'tablet', 'crt', 'studio', 'surface'].includes(d.model)) ? 180 : 0,
    openAngle: (d.model === 'laptop' && d.pose === 'open') || ['tablet', 'surface'].includes(d.model) ? (fixedLaptopKeys.has(d.key) ? 90 : 110) : undefined
}));
export const electronicsById = new Map(electronics.map(d => [`mcpe_food:${d.key}`, d]));
