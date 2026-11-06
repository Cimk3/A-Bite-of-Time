const medical = 'medical_equipment';
function prop(key, zh, en, height, footprint) {
    return { key, zh, en, group: medical, height, footprint, wallOnly: false, placementFront: 0 };
}
/** Approved 0.8.5 concept-board order. Keep this list append-only. */
export const patch085Props = [
    prop('icu_ct_scanner', 'CT机', 'CT Scanner', 3, { width: 2, depth: 3 }),
    prop('icu_cta_station', 'CTA检查站', 'CTA Station', 3, { width: 2, depth: 3 }),
    prop('icu_dsa_angiography', 'DSA造影设备', 'DSA Angiography System', 3, { width: 2, depth: 3 }),
    prop('icu_b_mode_ultrasound', 'B超诊断仪', 'B-Mode Ultrasound', 2),
    prop('icu_color_doppler_ultrasound', '彩超诊断仪', 'Color Doppler Ultrasound', 2),
    prop('icu_ecg_cart', '心电图推车', 'ECG Cart', 2),
    prop('lab_cbc_analyzer', '血常规分析仪', 'CBC Analyzer', 1),
    prop('lab_urinalysis_analyzer', '尿常规分析仪', 'Urinalysis Analyzer', 1),
    prop('lab_liver_chemistry_analyzer', '肝功能分析仪', 'Liver Chemistry Analyzer', 1),
    prop('lab_renal_chemistry_analyzer', '肾功能分析仪', 'Renal Chemistry Analyzer', 2),
    prop('lab_lipid_panel_analyzer', '血脂分析仪', 'Lipid Panel Analyzer', 1),
    prop('lab_crp_analyzer', 'CRP分析仪', 'CRP Analyzer', 2),
    prop('lab_cardiac_marker_analyzer', '心血管标志物分析仪', 'Cardiac Marker Analyzer', 1),
    prop('icu_bed', 'ICU病床', 'ICU Bed', 2, { width: 1, depth: 2 }),
    prop('icu_large_patient_monitor', '大型床旁监护仪', 'Large Patient Monitor', 2),
    prop('icu_six_channel_syringe_pump', '六联注射泵仪器', 'Six-Channel Syringe Infusion Tower', 2),
    prop('auramed_ecmo', 'AuraMed ECMO', 'AuraMed ECMO', 2),
    prop('auramed_ventilator', 'AuraMed呼吸机', 'AuraMed Ventilator', 2),
    prop('auramed_crrt', 'AuraMed CRRT', 'AuraMed CRRT', 2),
    prop('novacare_ecmo', 'NovaCare ECMO', 'NovaCare ECMO', 2),
    prop('novacare_ventilator', 'NovaCare呼吸机', 'NovaCare Ventilator', 2),
    prop('novacare_crrt', 'NovaCare CRRT', 'NovaCare CRRT', 2)
];
export const patch085ById = new Map(patch085Props.map(d => ['mcpe_food:' + d.key, d]));
export const patch085MultiGrid = new Map(patch085Props.filter(d => d.footprint).map(d => ['mcpe_food:' + d.key, d]));
export const patch085ScreenIds = new Set([
    'icu_ct_scanner', 'icu_cta_station', 'icu_dsa_angiography', 'icu_b_mode_ultrasound', 'icu_color_doppler_ultrasound', 'icu_ecg_cart',
    'lab_cbc_analyzer', 'lab_urinalysis_analyzer', 'lab_liver_chemistry_analyzer', 'lab_renal_chemistry_analyzer', 'lab_lipid_panel_analyzer', 'lab_crp_analyzer', 'lab_cardiac_marker_analyzer',
    'icu_large_patient_monitor', 'icu_six_channel_syringe_pump', 'auramed_ecmo', 'auramed_ventilator', 'auramed_crrt', 'novacare_ecmo', 'novacare_ventilator', 'novacare_crrt'
].map(key => 'mcpe_food:' + key));
export const patch085Items = patch085Props;
