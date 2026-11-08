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


## 0.9.0 新增模块

- src/patch-090-catalog.ts：47件统一规格，区分surface、solid与wall；分格摆放见patch-090-grid.ts。0.9.2起north方向的世界X递减，模型切片按源X正序配对；引擎本身镜像几何X，反序配对会重复镜像。
- tools/patch-090-art.mjs：新品造型、128px色图/MER与64px每格静态屏幕；park-art模块保留路灯分层和灯头发光分区。源模型体积与分格体积必须一致，分格边界外的零件不得静默丢弃。
- 0.9.0候选曾采用碰撞框数组；当前沿用0.9.1的origin/size单框，见下节。不得把官方组件文档代替目标客户端注册测试。
- 新柜架的展示实体点击必须进入solid090槽位菜单；破坏含物品的柜架时返还内容，不得套用旧创造模式静态摆件直接删除分支。
- node tools/patch-090-previews.mjs 在构建后从实际生成PNG补出12张墙屏预览。MCPE_FOOD_NEW_PREVIEWS=1仅跳过旧sheet重绘，完整包资源仍重新生成。
- 新测试使用mock API核对事务、回滚、座位占用及恢复；仍需真实Minecraft验证碰撞方向、玻璃、乘坐、触屏和光影。


## 0.9.1 兼容与朝向修复

0.9.1分格部件改为tools/native-block-boxes.mjs生成origin/size单框，覆盖碰撞与选取边界；0.9.0复合数组描述保留在旧发行fixture中，不能用其文档支持情况替代特定客户端的注册证据。运行时在保存记录前先解析所有BlockPermutation，遇到未注册部件时返回带ID的异常，不写下半件。

MacBook Air M5与LEGION复用bakeDeviceTilts烘焙110度屏幕；四款修复电脑采用+Z屏面与placementFront=180，键盘在同一侧。屏面与背壳分开，不让背壳穿过显示面。旧记录modelRevision缺省时只修正yaw一次，保留原direction、支撑、中心与DecorRecord.version=1。新摆放直接标记modelRevision=1。

patch-091-previews.mjs从实际生成的entity几何与PNG出图，build会生成patch_091_computers.png。patch-091-repairs测试检查源与实际输出方向、角度、预算和0.9.0兼容，原生放置测试从生成JSON解析ID/状态并校验四向放置。严格mock仍不是Bedrock引擎。

## 0.9.2 分格拼接与资源核对

原生模型沿源X正序切片，四向世界right轴依次为-X、-Z、+X、+Z；原生旋转依次为0、-90、180、90。north/west面的U与up面的V裁剪方向不同。只保留原表面，不给切开的内部补面，空部件保留空几何。不得改动既有实体和墙屏的朝向基准来修原生方块。

新记录nativeFacing=normal、nativeGrid=1；旧记录缺省时nativeFacing=reversed、nativePending=true，保留原direction和旧格点，待全部部件加载后解析整件的相反方向/索引。东西向旧格点另有符号差异，不能统一翻转宽度索引。任意写入失败先恢复原方块；缺部件才走整件回收。DecorRecord仍为version=1。

tools/native-world-audit.mjs独立把实际输出部件变换到世界，再消去整件朝向，检查每个面及UV样本。tools/patch-092-review.mjs读取实际BP/RP生成47件正反面、20件四向及六类旧包对照；构建时执行，发现丢面或UV不连续直接失败。测试还对四个观察面作渲染差异检查，并用实发0.9.1错误资源作为反例，不能只对未分格源模型出图。

坐标依据：[官方Origin/Size镜像X说明](https://feedback.minecraft.net/hc/en-us/articles/49852828563853-Minecraft-Bedrock-Edition-26-60-Changelog)、[官方cardinal旋转示例](https://learn.microsoft.com/en-us/minecraft/creator/documents/intro-block-traits?view=minecraft-bedrock-stable)。目标版本仍为26.52；该说明用于核对坐标约定，不表示升级引擎依赖。离线预览和独立坐标计算依然不代表真实客户端验收。


## 0.9.3 三件显示与碰撞分离

patch-093-render.ts仅列出ASML、交易工作台、文件柜。原生helper使用有效闭合小方块，再通过[稳定bone_visibility](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_geometry?view=minecraft-bedrock-stable)隐藏root；碰撞和选取仍由原始cs生成，不由helper小方块推算。运行时syncSolidWhole复用已有surfaceIndex，在solidLocal矩形中心创建一个whole外观，final nativeDirection决定正面，支持旧网格与旧reversed记录。依旧走有界恢复、owner关联和去重/删除。

patch-093-resources测试与实际0.9.2包逐字节比较其他物品资源，并逐字段确认三件原生碰撞/状态/掉落不变。patch-092-world对三件改为核对实际完整实体网格，其余17件仍核对分格拼接；四向中心/朝向、重载、拆除及失败回滚由运行时测试核对，不能把隐藏helper当可见整件渲染证据。
