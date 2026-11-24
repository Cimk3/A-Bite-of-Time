export const linuxComputerKey = 'linux_desktop_computer';
export const mriKey = 'medical_mri_scanner';
const props = [
    { key: mriKey, zh: '医用磁共振设备', en: 'Medical MRI Scanner', group: 'medical_equipment', kind: 'solid', size: [3, 4, 3] },
    { key: linuxComputerKey, zh: '互动电脑 · Linux 模拟器', en: 'Interactive Linux Computer', group: 'electronics', kind: 'surface', size: [1, 1, 1] },
];
export const patch097Props = props.map(d => ({
    ...d, height: d.size[2], wallOnly: false, placementFront: 0,
    footprint: d.kind === 'solid' ? { width: d.size[0], depth: d.size[1] } : undefined,
}));
export const patch097PropKeys = new Set(props.map(d => d.key));
export const gymAd = { key: 'gym_ad_screen_4x2', zh: '方寸健身广告屏', en: 'Food & Table Fitness Ad Screen', group: 'gym', brand: 'fangcun_fitness', width: 4, height: 2 };
export const patch097Foods = [
    { key: 'yangcheng_hairy_crab', zh: '阳澄湖大闸蟹', en: 'Yangcheng Lake Hairy Crab', vessel: 'plate', shape: 'hairy_crab', colors: ['#e36525', '#f59a46', '#b64820'], nutrition: 9 },
    { key: 'chaozhou_braised_goose', zh: '潮州卤水鹅', en: 'Chaozhou Braised Goose', vessel: 'burgundy_platter', shape: 'braised_goose', colors: ['#763516', '#ba6a35', '#db9b7b'], nutrition: 10 },
    { key: 'chaozhou_oyster_omelette', zh: '潮州蚝烙', en: 'Chaozhou Oyster Omelette', vessel: 'plate', shape: 'oyster_omelette', colors: ['#db8c1e', '#ffc74c', '#d8c9ad'], nutrition: 8 },
    { key: 'ginkgo_taro_paste', zh: '福果甜芋泥', en: 'Ginkgo and Sweet Taro Paste', vessel: 'bowl', shape: 'ginkgo_taro', colors: ['#ac7fa6', '#c89cb9', '#efb935'], nutrition: 6 },
].map((d) => ({ ...d, vessel: d.vessel, category: 'chinese', legacyCategory: 'chinese', edible: true, saturation: .65 }));
export const patch097FoodKeys = new Set(patch097Foods.map(d => d.key));
export const patch097Items = [...props, ...patch097Foods, gymAd];
