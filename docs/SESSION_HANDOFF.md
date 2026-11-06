# 接续入口

先读根目录 `AGENTS.md`、`docs/PROJECT_CONTEXT.md`、`docs/PROGRESS.md`、`docs/KNOWN_ISSUES.md`，再核对版本和工作区。0.8.6 以 0.8.5 医疗候选为基线。用户原图目录 `imgSrc/` 保留在工作区。

概念图、提示词与编号表见 `assets/concepts/085/`。模型生成源为 `tools/patch-085-art.mjs`，目录和占地定义为 `src/patch-085-catalog.ts`。ICU 病床用 1×2 地面支撑，中心实体选取宽度为一格。对应的兼容、几何和运行回归测试在 `tests/patch-086-*.test.mjs`。

发布流程和实机限制分别见 [DEVELOPMENT](DEVELOPMENT.md) 与 [VALIDATION](VALIDATION.md)。
