# 开发与维护说明

## 当前结构

- `src/`：内容目录、摆件持久记录、创造分组、放置和展示同步逻辑。
- `src/patch-085-catalog.ts`：0.8.5医疗器械条目与影像设备多格占地定义。
- `tools/patch-085-art.mjs`：按 `assets/concepts/085/` 已确认草图生成模型方块、固定屏幕画面、图标和 MER。
- `assets/`：模型绘制源、像素画及经批准的概念草图。不要只改 `packs/` 或 `.build/` 中的生成文件。
- `packs/`：当前BP／RP构建产物；构建会删除并重建两个目录。
- `.build/`：TypeScript编译结果；`npm run compile` 会清理并重建此目录。
- `tests/` 与 `tools/validate.mjs`：自动检查源。正式发行顺序执行完整检查。

## 0.8.5内容与兼容

新增22件静态创造模式医疗摆件，追加至既有医疗分类、发放命令、`tasting_new`及桌面展示索引。CT、CTA、DSA以2×3格占地，ICU病床为1×2格。大件支撑、空间和重叠判定读取目录中的实际高度；其余设备按原单格规则放置。AuraMed和NovaCare的ECMO、呼吸机与CRRT为不同品牌造型。所有固定屏幕不运行。

`DecorRecord.version=1`不变。新增物品只追加展示映射；旧ID、UUID、配方、作物、存档和旧索引保持。新增方向通过既有显式显示方向传递，不持续追踪玩家。

0.8.3／0.8.4未发布的车辆原型代码、相关测试、草图和候选附件已移除。当前包不声明车辆实体、控制器或道路功能；公开0.8.2附件保留。

## 构建与交付

依赖使用Node.js ≥22.15、TypeScript 5.9.3、稳定版 `@minecraft/server` 与 `server-ui` 2.0.0、vanilla-data 1.26.52。

```powershell
npm ci
npm run build
npm test
node tools/validate.mjs
npm run package
python tools/verify_archive.py
```

这些命令会顺序生成或重写编译输出、资源包、预览、报告及归档；不要并行运行读取／写入相同产物的任务。`npm run package`含测试和静态校验。若按明确要求只生成导入包，在 `npm run build`完成后直接执行 `node tools/package.mjs`，并将未运行的测试、资源校验和归档校验记录为未验证。

`.build/`只通过 `tools/clean-build.mjs`安全清理。构建脚本仅重建工作区内 `packs/FoodAndTable_BP` 与 `packs/FoodAndTable_RP`。归档工具将BP、RP分别打包，并生成组合 `.mcaddon`、源码ZIP和SHA256SUMS；源码归档包含 `AGENTS.md`、上下文文档、批准草图、源代码、预览和测试。

## 美术边界

新增资产使用私有 `mcpe_food` 路径和标识，不修改原版内容。0.8.5设备保持草图规定的轮廓、附件、占地和两家品牌配色；普通贴图为128×128、模型不超过256个方块体。仅屏幕与明确状态灯区域低强度发光，G≤24。完整图像、几何源与发光规则见[美术说明](ASSETS.md)。

## 证据边界

编译和离线生成不代表游戏引擎导入、旧世界恢复、Windows／安卓、触屏、官方灵动视效、联机或性能已验证。0.8.6 修复的放置、选取与渲染仍待真实客户端复验。
