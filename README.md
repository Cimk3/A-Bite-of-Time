# 方寸食光 / Food & Table

《方寸食光》是 Minecraft 基岩版的场景装饰附加包，提供料理、餐具、广告画、电子设备，以及医疗、家居、教学、实验、政务、服装店、交通、电气、新闻和军警等场景摆件。新增设备和广告以创造模式搭景为主，画面和姿态固定。

## 安装

1. 从 [Release 下载页](https://github.com/Cimk3/A-Bite-of-Time/releases/latest)下载 `.mcaddon`，打开文件导入；也可分别导入行为包（BP）和资源包（RP）。
2. 建议先备份世界，然后在世界设置中同时启用同一批次的 BP 与 RP。无需开启实验功能。
3. 进入创造模式，在物品栏的对应分组查找，或用下方命令取得物品。输入 `/function mcpe_food/build_info` 可以核对行为包构建标识，并在世界设置中检查对应资源包。

目标环境为 Minecraft 基岩版国际正式版 26.52 的 Windows 和安卓客户端。实际设备、触屏、普通模式、官方灵动视效、联机和性能验证状态见[验证记录](docs/VALIDATION.md)。

## 摆放与使用

- 普通摆件可放在支持的完整顶面、半砖或倒置楼梯顶面；正放楼梯不支持。高设备需要足够的上方空间。
- 壁挂物品和广告屏需要完整背墙及空出的前方空间。大屏从点击的左下角向右上展开，背墙和空间均须完整。
- 吸顶悬臂屏需点击完整天花板底面放置，检查两格天花板支撑及下方完整空间。
- 空手点击摆件、展示实体或对应墙面可打开收回入口。服装只能放入兼容展示架，不能穿戴或单独摆放。
- 菜品、餐具、托盘、服装展示架等已有交互按游戏内菜单操作；设备、镜面和广告屏为静态展示。

## 常用命令

| 命令 | 用途 |
|---|---|
| `/function mcpe_food/tasting_new` | 取得当前批次新增物品 |
| `/function mcpe_food/laboratory_equipment` | 实验设备 |
| `/function mcpe_food/electrical_equipment` | 电气设备 |
| `/function mcpe_food/news_equipment` | 新闻设备 |
| `/function mcpe_food/medical_equipment` | 医疗器械 |
| `/function mcpe_food/military_police_equipment` | 军警物品 |
| `/function mcpe_food/government_equipment` | 政务设备 |
| `/function mcpe_food/clothing_store` | 服装展示设施和服装 |
| `/function mcpe_food/transit_equipment` | 交通站务 |
| `/function mcpe_food/digital_ad_screens` | 电子广告屏 |
| `/function mcpe_food/electronics` | 电子设备兼容发放列表 |
| `/function mcpe_food/tasting_all_chinese` | 中餐全量列表 |

## 兼容与资源

保留已有物品、方块、配方和存档记录；普通色图与官方灵动视效 PBR 数据均使用本包私有资源。附加包不覆盖原版模型、贴图、材质、粒子或全局光照。新增内容不增加生存获取链或设备运行系统。

## 文档

- [完整物品目录](docs/CATALOG.md) · [广告说明](docs/ADVERTISEMENTS.md)
- [维护说明](docs/DEVELOPMENT.md) · [项目上下文](docs/PROJECT_CONTEXT.md)
- [进度](docs/PROGRESS.md) · [问题记录](docs/KNOWN_ISSUES.md) · [验证记录](docs/VALIDATION.md)
- [更新记录](docs/CHANGELOG.md) · [项目协作规则](AGENTS.md)

代码及美术源的使用条款见 [LICENSE](LICENSE)。
