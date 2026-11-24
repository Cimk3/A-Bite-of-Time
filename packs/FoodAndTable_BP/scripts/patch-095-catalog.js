export const patch095Groups = [
    ['cinema', '电影院', 'Cinema'],
    ['music_studio', '音乐工作室', 'Music Studio'],
    ['gym', '健身房', 'Gym'],
];
export const patch095Items = [
    { key: 'cinema_popcorn_machine', zh: '爆米花机', en: 'Popcorn Machine', group: 'cinema', kind: 'solid', size: [1, 1, 2] },
    { key: 'cinema_dual_dispenser', zh: '双口饮料机', en: 'Dual Drink Dispenser', group: 'cinema', kind: 'surface', size: [1, 1, 1] },
    { key: 'cinema_poster_lightbox', zh: '灯箱海报柜', en: 'Poster Lightbox', group: 'cinema', kind: 'wall', size: [2, .25, 3] },
    { key: 'studio_mixing_console', zh: '调音台', en: 'Mixing Console', group: 'music_studio', kind: 'surface', size: [2, 1, .5] },
    { key: 'studio_monitor_speaker', zh: '监听音箱', en: 'Studio Monitor Speaker', group: 'music_studio', kind: 'surface', size: [1, 1, 1] },
    { key: 'gym_treadmill', zh: '跑步机', en: 'Treadmill', group: 'gym', kind: 'solid', size: [1, 2, 1.5] },
    { key: 'gym_squat_rack', zh: '深蹲架', en: 'Squat Rack', group: 'gym', kind: 'solid', size: [2, 2, 3] },
    { key: 'gym_incline_bench', zh: '可调卧推凳', en: 'Incline Bench', group: 'gym', kind: 'solid', size: [1, 2, 1] },
    { key: 'gym_dumbbell_rack', zh: '三层哑铃架', en: 'Three-Tier Dumbbell Rack', group: 'gym', kind: 'solid', size: [2, 1, 1.5] },
    { key: 'gym_cable_machine', zh: '拉索训练器', en: 'Cable Machine', group: 'gym', kind: 'solid', size: [2, 1, 3] },
    { key: 'gym_mat_rack', zh: '瑜伽垫收纳架', en: 'Yoga Mat Rack', group: 'gym', kind: 'solid', size: [1, 1, 1.5] },
    { key: 'gym_punching_bag', zh: '拳击沙袋', en: 'Punching Bag', group: 'gym', kind: 'solid', size: [1, 1, 3] },
];
export const patch095Keys = new Set(patch095Items.map(d => d.key));
export const patch095Props = patch095Items.filter(d => d.kind !== 'wall').map(d => ({
    ...d, height: Math.ceil(d.size[2]), wallOnly: false, placementFront: 0,
    footprint: d.size[0] > 1 || d.size[1] > 1 ? { width: Math.ceil(d.size[0]), depth: Math.ceil(d.size[1]) } : undefined,
}));
export const patch095Walls = patch095Items.filter(d => d.kind === 'wall').map(d => ({
    ...d, width: d.size[0], height: d.size[2], brand: d.key,
}));
