# 0.8.5 医疗设备概念草图（已确认）

用户确认“全部按图建模”。这些原图是建模约束，不是可直接拉伸成贴图的来源。每件最终几何保留编号对应的主体轮廓、关键部件、布局和品牌配色；为Bedrock体素模型进行有限方块化，避免照片式/圆雕效果。

| 草图编号 | 物品 | 素材 |
|---|---|---|
| 01 | CT | [01-imaging-large.png](01-imaging-large.png) |
| 02 | CTA | [01-imaging-large.png](01-imaging-large.png) |
| 03 | DSA造影 | [01-imaging-large.png](01-imaging-large.png) |
| 04 | B超 | [02-imaging-cart.png](02-imaging-cart.png) |
| 05 | 彩超 | [02-imaging-cart.png](02-imaging-cart.png) |
| 06 | 心电图推车 | [02-imaging-cart.png](02-imaging-cart.png) |
| 07–10 | 血常规、尿常规、肝功能、肾功能 | [03-lab-analyzers-a.png](03-lab-analyzers-a.png) |
| 11–13 | 血脂、CRP、心血管标志物 | [04-lab-analyzers-b.png](04-lab-analyzers-b.png) |
| 14–16 | ICU病床、大型监护仪、六联注射泵 | [05-icu-equipment.png](05-icu-equipment.png) |
| 17–19 | AuraMed ECMO、呼吸机、CRRT | [06-auramed-line.png](06-auramed-line.png) |
| 20–22 | NovaCare ECMO、呼吸机、CRRT | [07-novacare-line.png](07-novacare-line.png) |

提示词原文见 [prompts.json](prompts.json)。尺寸和布局以用户确认后的项目计划为准：CT/CTA/DSA占2×3格、病床占1×2格，其余单格；不增加设备运行、诊疗、联网、录音、耗材或开合功能。详细源模型在 `tools/patch-085-art.mjs`，分类及尺寸定义在 `src/patch-085-catalog.ts`。
