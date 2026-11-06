import { patch082Props } from './patch-082-catalog.js';
import { patch080Props } from './patch-080-catalog.js';
import { patch074Props, patch074WallVariants } from './patch-074-catalog.js';
import { patch073Props } from './patch-073-catalog.js';
import { patch072Props } from './patch-072-catalog.js';
import { patch071Props } from './patch-071-catalog.js';
import { scenarioProps, wallVariants, brandAdvertisements } from './scenario-catalog.js';
import { bottleProps, cutlery, dishes, hotpots, id, servings, vesselByKey, vessels } from './catalog.js';
import { cityAdvertisements, newProps, lifestyleItems } from './lifestyle-catalog.js';
import { restaurantItems, restaurantAccessories, numberVisuals } from './restaurant-catalog.js';
import { electronics, originalElectronics, newElectronics, officeElectronics } from './electronics-catalog.js';
export const teaTray = { key: 'gongfu_tea_tray', zh: '功夫茶盘套装', en: 'Gongfu Tea Tray Set' };
export const tray = { key: 'triple_tray', zh: '三菜连体托盘', en: 'Three Dish Tray' };
export const paperCups = [
    { key: 'coca_cola_paper_cup', zh: '可口可乐纸杯（摆件）', en: 'Coca-Cola Paper Cup (Display)', color: '#c52e35' },
    { key: 'pepsi_paper_cup', zh: '百事可乐纸杯（摆件）', en: 'Pepsi Paper Cup (Display)', color: '#2358ac' }
];
export const advertisements = [
    { key: 'ad_japanese_snacks', series: 'japanese', zh: '日式小食', en: 'Japanese Snacks', aspect: 'wide' },
    { key: 'ad_japanese_night', series: 'japanese', zh: '日式夜食', en: 'Japanese Night Bites', aspect: 'portrait' },
    { key: 'ad_wellington', series: 'western', zh: '惠灵顿牛排', en: 'Beef Wellington', aspect: 'wide' },
    { key: 'ad_lamb', series: 'western', zh: '香草烤羊排', en: 'Herb Roasted Lamb', aspect: 'square' },
    { key: 'ad_lobster', series: 'western', zh: '奶油焗龙虾', en: 'Lobster Thermidor', aspect: 'portrait' },
    { key: 'ad_cantonese_roast', series: 'cantonese', zh: '广府烧味', en: 'Cantonese Roast', aspect: 'wide' },
    { key: 'ad_dim_sum', series: 'cantonese', zh: '早茶时光', en: 'Cantonese Morning Tea', aspect: 'portrait' },
    { key: 'ad_hotpot', series: 'hotpot', zh: '铜锅涮肉', en: 'Copper Hotpot', aspect: 'wide' },
    { key: 'ad_banquet', series: 'chinese', zh: '中式盛宴', en: 'Chinese Banquet', aspect: 'wide' },
    { key: 'ad_grouper', series: 'chinese', zh: '清蒸鲜味', en: 'Steamed Grouper', aspect: 'wide' },
    { key: 'ad_home_cooking', series: 'chinese', zh: '家常好味', en: 'Chinese Bistro', aspect: 'square' },
    { key: 'ad_dessert', series: 'dessert', zh: '甜品时光', en: 'Patisserie Moments', aspect: 'portrait' },
    ...cityAdvertisements, ...brandAdvertisements
];
export const adById = new Map(advertisements.map(a => [id(a.key), a]));
export function adSize(ad, size) {
    const n = Math.max(0, Math.min(2, size)) + 1;
    return ad.aspect === 'wide' ? [n * 2, n] : ad.aspect === 'portrait' ? [n, n * 2] : [n, n];
}
export const tableItems = [...vessels, ...cutlery, ...hotpots, ...bottleProps, ...paperCups, tray, ...electronics, teaTray, ...restaurantAccessories, ...lifestyleItems, ...scenarioProps, ...patch071Props, ...patch072Props, ...patch073Props, ...patch074Props, ...patch080Props, ...patch082Props];
export const tableItemById = new Map(tableItems.map(t => [id(t.key), t]));
export const trayFoods = dishes.filter(f => vesselByKey.get(f.vessel)?.family === 'plate');
export const surfaceVisuals = [
    ...[...vessels, ...cutlery, ...hotpots, ...bottleProps, ...paperCups, tray].map(t => ({ key: t.key, zh: t.zh, en: t.en })),
    ...servings.filter(s => s.food.key !== 'tieguanyin').map(s => ({ key: s.key, zh: s.food.zh, en: s.food.en })),
    ...originalElectronics.map(t => ({ key: t.key, zh: t.zh, en: t.en })),
    ...newElectronics.map(t => ({ key: t.key, zh: t.zh, en: t.en })), teaTray,
    ...servings.filter(s => s.food.key === 'tieguanyin').map(s => ({ key: s.key, zh: s.food.zh, en: s.food.en })),
    ...officeElectronics.map(d => ({ key: d.key, zh: d.zh, en: d.en })),
    ...restaurantItems.map(d => ({ key: d.key, zh: d.zh, en: d.en })), ...numberVisuals.filter(d => d.number !== 8), ...newProps.map(d => ({ key: d.key, zh: d.zh, en: d.en })), ...scenarioProps, ...wallVariants, ...patch071Props, ...patch072Props, ...patch073Props, ...patch074Props, ...patch074WallVariants, ...patch080Props, ...patch082Props
];
export const surfaceIndex = new Map(surfaceVisuals.map((t, i) => [id(t.key), i]));
