# 0.8.2 已批准草图

四张 imagegen 草图在建模前生成，用户确认全部 17 件。PNG 为当时展示的原图，模型以相同轮廓、配色和识别部件为依据。真实包通过项目的体素模型、贴图和 MER 生成。

| 图板 | 图号 | 物品 ID 后缀 |
|---|---|---|
| [高阶医疗](approved-icu-advanced.png) | 01–06 | `icu_ecmo`、`icu_ventilator`、`icu_crrt`、`icu_iabp`、`icu_manual_defibrillator`、`icu_high_flow_oxygen` |
| [基础医疗](approved-icu-basic.png) | 07–12 | `icu_portable_suction`、`icu_oxygen_cart`、`icu_syringe_pump_bank`、`icu_pulse_oximeter`、`icu_emergency_cart`、`icu_exam_lamp` |
| [警务摆件](approved-police.png) | P1–P4 | `police_body_camera_dock`、`police_evidence_workbench`、`police_checkpoint_kit`、`police_breathalyzer_kit` |
| [豪都大酒店](approved-haodu-hotel.png) | 7×5 | `digital_haodu_hotel_7x5` |

所有 ID 使用 `mcpe_food:` 前缀。广告中文字以 Microsoft YaHei 生成的单色字形栅格存入美术源，建筑与排版用生成器绘制，构建时无需系统字体。

## 生成提示词

**高阶医疗**

> Use case: stylized-concept. One approval concept board for a Minecraft Bedrock voxel decoration pack, titled 'ICU / EICU — ADVANCED EQUIPMENT'. Six equal cards in a 3-column 2-row grid, plenty of padding, same clean neutral cool gray studio background, subtle square base reference and three-quarter front view. Show exactly these six isolated objects with small accurate English labels: 01 ECMO (mobile blue-gray console, compact pump head, vertical white oxygenator and two short burgundy hoses); 02 ICU VENTILATOR (ivory cart, wide teal waveform screen, twin breathing hoses secured to support arm); 03 CRRT (tall ivory gray cart, upper compact screen, three round pump housings, two translucent solution bags on top); 04 IABP (deep slate short cart, slanted color display, cylinder enclosure, neatly tethered line); 05 MANUAL DEFIBRILLATOR (compact red and ivory transport case with waveform display, two docked paddles); 06 HIGH-FLOW OXYGEN (cream and turquoise compact pedestal on short stand, humidifier chamber, one secured tube). Each object occupies at most one Minecraft block footprint, height up to two blocks. Limited cuboid components, squared hoses with 2-4 segments, wheels stylized as octagonal pixel blocks, deliberately modelable under 256 cuboids. Distinct silhouettes. The screens show fictional illustrative data only. No patient, no brand logos, no extra accessories outside the square footprint. Print six labels only.

**基础医疗**

> Use case: stylized-concept. Approval concept board for Minecraft voxel props, one 3 by 2 grid on pale neutral backdrop, matched consistent three-quarter front view, title 'ICU / EICU — BASIC EQUIPMENT'. Exactly six independently modelable single-cell props, at most two Minecraft blocks tall, one object per card with concise English label: 07 PORTABLE SUCTION (compact ivory unit with turquoise carry handle, clear amber-tinted collection jar and stowed short hose); 08 OXYGEN CART (upright white oxygen cylinder with teal collar, pressure gauge and small regulator protected by a gray cart with wheels); 09 SYRINGE PUMP BANK (short graphite tower with three stacked white pumps, visible horizontal syringe silhouettes, little lime status lights, no hanging fluid bags); 10 PULSE OXIMETER (handheld slate instrument in small dock, red fingertip clip beside it, clear numerals and turquoise trace); 11 EMERGENCY CART (red medical cart, broad pale worktop, five color-coded sealed drawers, wheels, no screen); 12 EXAM LAMP (warm-white rectangular lamp head angled down, squared articulated arm on slender post with stable wheeled base). Functional hospital shapes rendered as restrained chunky cuboids, pixel detail, clear accessories, static poses, isolated, no patients, no trademarks. Think small Bedrock furniture props, not real product photos.

**警务摆件**

> Use case: stylized-concept. A clean 2 by 2 concept sheet titled 'POLICE STATION PROPS' for a Minecraft Bedrock voxel decoration pack. One isolated square-footprint prop per cell, three-quarter view, softly lit neutral studio backdrop. Four clearly distinct designs: P1 BODY CAMERA DOCK: dark navy charging dock containing four small dark-gray rectangular body cameras, one tiny cyan status line; P2 EVIDENCE WORKBENCH: charcoal cabinet with light laminate top, evidence bags, a numbered sample tray and a small scale, all fit on top; P3 TRAFFIC CHECKPOINT KIT: compact orange-and-white traffic cones, small freestanding dark-blue CHECK sign, both grouped on one square charcoal rubber mat; P4 BREATHALYZER KIT: small open dark-blue equipment case, a handheld gray-blue breath tester with a simple readout and spare white mouthpieces laid out neatly. Limit geometry to clear voxel cuboids; one Minecraft block footprint per prop, at most two blocks tall. Generic fictional policing aesthetics, no actual police insignia, no weapons, no humans. Use the four short English captions once.

**豪都大酒店**

> Use case: ads-marketing. One Minecraft Bedrock wall digital billboard concept for the fictional hotel named exactly '豪都大酒店' in Simplified Chinese. Front-on perfectly rectangular artwork, aspect 7:5, pixel art in a luxury charcoal navy, warm gold and cream palette. Composition: large centered correctly written Chinese headline at upper left extending to middle, stylized stately warm-lit hotel facade to the right and lower middle, simplified gold linework, balanced negative space. Optional small roman text 'HAODU HOTEL', no other words. Thin dark rectangular hardware bezel. Clean stair-stepped pixel shapes, legible at a distance, dark background with warm window accents, understated hotel atmosphere. Show the billboard isolated front-on and straight, landscape, no perspective distortion, no surrounding game scenery, no gradients, no stock photograph, no real logos. This is an approval concept for a 7 blocks wide by 5 blocks tall display.
