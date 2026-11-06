# 0.8.2 墙屏恢复与候选包

直接交互仍经过支撑校验。恢复循环成功校验后调用内部同步函数，免除同次恢复的重复读墙。下一条记录开始前检查时间预算，即使前一条由于未加载或失去支撑而结束。7×5 屏占用 35 格前方空间，中心仍在现有 8 格局部展示查询范围内。

候选包使用 0.8.2-rc.1 构建标识及匹配的 BP／RP。保留候选附件与 SHA256，Windows 验收通过后按原字节上传正式版。若修复导致产物变化，先递增候选构建号并重新验收。

---

# 0.8.1 调度与派生索引

loadDecorRecords采用system.run分批，单批最多8个属性／约4ms；loading期间不允许创建／回收、拆支撑、原生冰箱恢复或孤儿清理。entityLoad仅存入去重Map，maintainDecor每tick最多处理4实体，再恢复最多2条记录／约4ms。不要重新在每个entityLoad内同步全物件或在一个tick处理24条并扫描全场。

records仍为持久真源；rememberRecord／forgetRecord统一维护占用格反向索引，失败回滚也必须经过它们。普通设备目录高度都是整数，顶面／半砖／倒置楼梯在离散占用格上保持同样高度，不为计算其他记录的占用访问区块。visuals仅查询支撑8格内的私有展示族，synchronize整件一次查询复用至所有槽位及去重。已知最大6×5屏、吸顶屏和服装／托盘部件均在此范围。

发行工具仅允许未跟踪且不属于源码归档输入的用户文件共存；所有已跟踪修改及源码输入目录中的新文件仍必须先审查提交。imgSrc不属于发行归档。

---

以下为历史版本记录。

# 0.8.0维护补充

吸顶通过可选mount字段复用v1 surface记录，不新增实体种类。ceilingSupports推导两格支撑，occupiedCells推导四格空气区；同步显示根位置为天花板下两格并向右半格，方向与显式显示属性一致。点击两处天花板均可回收，任一支撑拆除均清理一次；未加载不清理。菜单和放置继续复核手持、距离、revision、背包与支撑，失败回滚。

吸顶屏材质分为256×128屏面和128px纯色悬臂，仅该模型的均匀1px UV允许帧纹理与屏面声明尺寸不同。普通摆件保持128px。内容及美术源patch-080，已批准概念和提示词在assets/concepts/080。

---

以下为历史版本记录。

# 0.7.4维护补充

新目录patch-074-catalog、美术patch-074-art和6×5画面large-ad-art均为源；不可只编辑构建产物。两款大屏在旧11墙屏之后追加，digital-ad生成按对象类型决定画布与分组，旧信息屏索引不变。0.7.3 fixture记录560／61／11索引及旧内容。常规构建、测试、验证和打包必须顺序执行。

README是稳定入口，逐版更新记在CHANGELOG及Release说明。遵循AGENTS直接发行约定；实机结果单独记录。

---

以下为历史版本说明；其中待确认门槛由当前直接发行约定取代。

> 当前发布约定（2026-10-29）：用户要求发布0.7.3，且后续版本完成必要验证后直接发布，不再单独确认；以下试用阶段的等待条件已被此指示取代。未实测项目仍标未验证。

# 0.7.3补充

新增独立patch-073目录、美术及creativeGroup分类映射。旧5件迁入政务组，不改旧展示顺序和原发放命令。新增6件政务、五碟蘸料一体摆件及三款90°FT笔记本，共10件。新品128px、≤256方块体、MER白名单与私有资源隔离；旧110°笔记本不变。完整试用和发布门槛见[TRIAL_0.7.3](TRIAL_0.7.3.md)。0.7.2已于用户确认后发布，以下当时待确认文案仅为历史。

---

# 0.7.2正式发行阶段

2026-10-29：用户对完整0.7.2试用反馈“没问题了”，本轮朝向与统一试用获得确认，正式发行门槛已满足。保留已验收构建标识0.7.2-trial.1以便追溯；该标识不再表示发行仍待批准。具体平台、光影模式、联机和性能未单独报告，不扩大实机验收结论。

以下保留开发、试用及历史记录；此前“待确认／不发布”限制已由本次用户确认解除。最终发行检查和发布结果以本页最新记录为准。

---

# 0.7.2维护补充

当前批次0.7.2-trial.1。新增目录patch-072-catalog、建模绘图patch-072-art、服装专用clothing_display和显示方向动画。衣物不能加入tableItems或wearable；架体＋满载服装须整体核算256上限。衣物持久真源是version=1的clothing_rack.slots。

壁挂／收款机缺陷见KNOWN_ISSUES K07，不沿用0.7.1矩阵测试作为实机修复证明。display_facing必须client_sync，0值保持旧路径；q.body_y_rotation参照[官方查询文档](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Reference/Content/MolangReference/Examples/MolangConcepts/QueryFunctions.md)。

按build→test→validate→package→verify_archive顺序完成后，交付完整试用包；两个manifest与build JSON、build_info命令标识须一致。本轮不创建正式标签或Release，待用户游戏确认。

---

# 开发与发行维护说明

## 0.7.1补丁维护

四款补丁物品定义在src/patch-071-catalog.ts，几何／纹理在tools/patch-071-art.mjs；末尾追加展示索引，不插入0.7.0场景目录。tools/wall-geometry.mjs只变换壁挂变体和电子屏，显示层按原direction推导原生yaw，不能套用普通桌面旧正面辅助函数。模型及UV检查使用最终文件和独立旋转矩阵。0.7.2只交付建议Markdown。

## 0.7.0更新

0.7.0新增scenario-catalog及scenario-art、brand-art、digital-displays生成链；根AGENTS已纳入源码包。内容修改前保存0.6.0 fixture与完整key顺序。publish-release.py使用Credential Manager在进程内读取凭据，仅发布新版本或续传同提交草稿，核对五附件服务端SHA。

以下保留旧阶段说明，历史数量按对应版本理解。


当前软件基线0.7.1，文档核实于2026-10-28。先按[AGENTS](../AGENTS.md)阅读[PROJECT_CONTEXT](PROJECT_CONTEXT.md)、[PROGRESS](PROGRESS.md)和[KNOWN_ISSUES](KNOWN_ISSUES.md)；架构和历史原因以这些文件为入口，本页负责操作流程。

## 环境与真源

Node.js ≥22.15，TypeScript 5.9.3，固定server／server-ui 2.0.0和vanilla-data 1.26.52。普通构建只需Node及npm依赖，不运行Minecraft，也不调用图像API。Python标准库用于独立归档校验；只有重新排版旧高清海报才需Pillow和中文字体。

修改src内容目录和运行逻辑、tools美术／生成源、assets原始源；不要只修packs生成文件或预览。TS严格NodeNext编译至.build，build.mjs加载build-v3.mjs，生成BP／RP、四类展示实体、PBR、图标、预览和报告，最后运行无损优化。

生成器会删除并重建两个packs子目录，重写docs/CATALOG.md和docs/STORAGE.md，以及部分图像源产物和预览。人工上下文文档不由生成器覆盖。生成文案仍有时点常量，下次版本变更按KNOWN_ISSUES M03审查。

## 命令及副作用

从项目根目录依次执行，不并行运行会读写同一批产物的命令。

| 命令 | 用途／会修改什么 |
|---|---|
| `npm ci` | 根据lockfile安装依赖，写node_modules；网络或权限错误单独排查 |
| `npm run compile` | 生成src/vanilla-surfaces.ts并编译.build；不是完全只读检查 |
| `npm run build` | compile后重建BP／RP、美术产物、预览、部分docs和报告，并优化资源 |
| `npm test` | 先compile，再执行tests/*.test.mjs；会写编译／生成文件 |
| `node --test tests/*.test.mjs` | 使用已有匹配.build和packs运行测试；适合本次文档整理的验证，不能代替新代码编译 |
| `node tools/validate.mjs` | 核验最终生成资源，写validation-report并更新构建状态；必须等优化结束 |
| `npm run check` | 完整build后validate，成本高于只读检查 |
| `node tools/package.mjs` | 从当前资源归档、生成SHA256SUMS，并复制文档／预览到dist；不会先替你测试 |
| `npm run package` | check、test、package的完整发行流水线，会重建资源 |
| `python tools/verify_archive.py` | 独立检查归档、CRC、内外包和SHA，写archive-report.json |

常规功能修改最短完整顺序：

```powershell
npm ci
npm run build
npm test
node tools/validate.mjs
node tools/package.mjs
python tools/verify_archive.py
```

也可直接`npm run package`后运行Python归档检查。已有必要检查通过后，不因省略展示性输出反复重跑重型构建。所有结果以本次实际退出码与报告为准；仅文档任务不应运行生成器来验证文字。

## 新增内容与兼容

1. 变更前确认package版本、已编译目录与packs匹配，捕获旧发布基线。`node tools/capture-compat.mjs`用wx创建当前版本fixture，拒绝覆盖；别在包被新生成器覆盖后伪造旧基线。
2. 另外保存surfaceVisuals的完整key顺序。capture-compat不负责这份列表；0.6.0客户端几何已去重，不能从geometry别名反推99个不同桌号key。
3. 在对应目录追加定义，编写双语名称、创造分组、图标、选择范围、试用命令及私有资源引用。新增内容只面向创造模式，不新增生存链。
4. surfaceVisuals和广告均只追加；物品／方块ID、UUID、旧配方、掉落与作物状态保持兼容。不要重写旧fixture来让回归测试通过。
5. 新摆件128px、≤256方块体；托盘每份≤48；检查色图与MER尺寸、自发光区域、私有命名空间。详见[ASSETS](ASSETS.md)。
6. 编译、验证最终方块与实体模型、运行相关逻辑测试、检查实际UV预览；截图只能证明软件渲染，不能代替PBR或真实设备。
7. 更新四份上下文、CHANGELOG及受影响目录文档。固定统计／版本字符串需逐处核对，不只改package.json。

## 交互变更的检查点

- DecorRecord是真源，MenuSessions与revision处理重复／并发；确认后复核距离、支撑、手持与背包，同步提交、失败回滚，不跨await持写锁。
- surface_display负责桌面，tray_food_display负责三槽料理，advert_display负责广告。仅改变外观不能丢失实际器皿、菜品、槽位、方向、桌号或实例。
- 每20tick最多24条分批恢复；未加载状态跳过。下半砖实体贴面，原生摆件迁移保留内容。不得把区块卸载当作拆除。
- 冰箱由owner记录关联部件，整列空间检查，清理任一部件只回收一次；处理顶面依赖并禁止活塞拆分。
- 设备正面由placementFront控制，与screenFront分离。先查各款模型基准，不做全局反向；旧无yaw记录按direction保持，电子设备已有斜向yaw才吸附四向。

## 无损优化

optimize-release只作为完整构建末尾步骤。它压紧JSON、逐行优化PNG，并共享桌号几何与同用途MER；历史小型配方／掉落JSON保留字节。测量基线使用已提交fixtures，不要求新检出有.cache里的旧发行解包目录。

不要把压缩后PNG与源PNG字节不同直接判成画质改变；比较尺寸与解码RGBA。去重后检查所有实际引用和索引，统计读取最终产物。不要独立反复调用optimizeRelease刷新指标，见KNOWN_ISSUES M03。

## 图像源与重绘

旧12幅食品海报：assets/posters/originals、generation.json、layout.json及tools/poster-layout.py；普通构建读取保存的masters。新8幅城市广告：assets/posters/city中的图形源、中文栅格、layout及tools/city-posters.mjs，普通构建自动生成。

料理、器皿、冰箱、茶盘、电子、服务用品、文具家居分别在对应*-art.mjs中定义。需要重生成旧AI主图时使用用户允许的图像工具，不能自动换用收费API；普通构建不需要凭据。

## 发行与文档后续

- 版本同步package.json及package-lock；保持BP／RP UUID。所有清单版本由构建生成，不手工只改一半。
- package输出mcaddon、两个mcpack、完整源码ZIP及SHA256SUMS。游戏包仅含运行资源；源码ZIP收录src/tools/tests/assets/docs/previews及显式根文件／报告，不是整个工作区。
- **0.7.0已将根AGENTS列入源码ZIP显式清单并验证**；docs下交接文档随源码包收录。已经发布0.6.0的附件保持原状。
- 正式版本在现有main历史提交、新建v版本标签并推送至Cimk3/A-Bite-of-Time，创建Release上传五附件，核对uploaded状态和服务端SHA。不要覆盖旧标签、附件或重建旧历史。
- .cache里的临时发布脚本不是受维护的发行工具，不依赖它接续；使用安全凭据存储且不得输出Token。Git代理／权限问题按当前机器重新诊断。
- 仅文档整理不升版本、不重打包；当前0.7.0功能更新按完整发行验证。

## 真实验收

无npm启动服务器。将mcaddon导入Minecraft，同时启用相同版本BP／RP，在创造模式通过分组或`/function mcpe_food/tasting_new`试用。实际Windows、安卓、普通／灵动、保存／区块与联机检查表见VALIDATION和KNOWN_ISSUES；未运行的保留未验证。
