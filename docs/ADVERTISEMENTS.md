# 当前电子广告屏

电子广告屏现有 12 款。包括原 9 款 2×2、4×4 和 4×3 屏、两款 6×5 屏及豪都大酒店 7×5 屏。新屏使用 448×320 画布，固定深蓝金色酒店画面。屏体从点击墙面左下角向右上展开，背墙和前方空间均须完整。`/function mcpe_food/digital_ad_screens` 发放全部 12 款。

站台信息屏和政务叫号屏仍各2×1，不纳入广告命令。方向及官方灵动视效的真实客户端状态见VALIDATION与KNOWN_ISSUES。

---

以下为历史版本记录。

# 0.7.2试用补充

原23幅纸面广告与9款电子广告屏目录、品牌、尺寸和顺序不变。壁挂朝向采用私有同步显示方向，真实游戏确认前保持未解决状态。新增站台屏与政务叫号屏各2×1，进入交通／电子设备组，不混入广告分组或digital_ad_screens命令。完整试用见[TRIAL_0.7.2](TRIAL_0.7.2.md)。

---

# 独立广告画目录（当前0.7.1）

## 0.7.1朝向修复

9款固定电子广告屏保留品牌、尺寸、顺序与旧存档锚点；只修正屏面／背板几何朝向和东西墙原生显示旋转。屏面仍低强度发光，边框和纸面广告不发光。旧23幅纸面广告画面和尺寸不变。自动几何验证不代替客户端普通／灵动模式复验。

## 0.7.0更新

0.7.0纸面广告共23幅、69种尺寸；新增Template AI横幅、Luna Studio（月-工作室）竖幅、FT电脑方幅。另有9个独立电子广告屏物品，每品牌各2×2、4×4、4×3，宽×高、单位格，画面固定；背墙逐格完整检查，左下角锚定。电子屏独立于纸面尺寸索引。

| 新品牌 | 物品ID | 比例 | 世界尺寸 |
|---|---|---|---|
| Template AI | mcpe_food:ad_template_ai | 2:1 | 2×1／4×2／6×3 |
| Luna Studio（月-工作室） | mcpe_food:ad_luna_studio | 1:2 | 1×2／2×4／3×6 |
| FT电脑 | mcpe_food:ad_ft_computer | 1:1 | 1×1／2×2／3×3 |

电子屏ID为mcpe_food:digital_template_ai_2x2等，品牌后缀template_ai／luna_studio／ft_computer，尺寸后缀2x2／4x4／4x3。方屏复用同品牌方形画布，4×3使用独立横向版式。屏面低强度发光，边框／背板和纸面广告均不发光。

以下保留旧20幅广告的目录，历史数量按0.6.0理解。


20幅广告画（旧12幅高清食品广告＋新8幅城市像素广告），共60种尺寸，均有小／中／大三档。每幅一个物品，不替换原版随机画。

| 系列 | 中文标题 | 英文副标题 | 物品ID | 比例 | 小／中／大 |
|---|---|---|---|---|---|
| 日式小吃 | 日式小食 | Japanese Snacks | `mcpe_food:ad_japanese_snacks` | 2:1 | 2×1 / 4×2 / 6×3 |
| 日式小吃 | 日式夜食 | Japanese Night Bites | `mcpe_food:ad_japanese_night` | 1:2 | 1×2 / 2×4 / 3×6 |
| 西餐 | 惠灵顿牛排 | Beef Wellington | `mcpe_food:ad_wellington` | 2:1 | 2×1 / 4×2 / 6×3 |
| 西餐 | 香草烤羊排 | Herb Roasted Lamb | `mcpe_food:ad_lamb` | 1:1 | 1×1 / 2×2 / 3×3 |
| 西餐 | 奶油焗龙虾 | Lobster Thermidor | `mcpe_food:ad_lobster` | 1:2 | 1×2 / 2×4 / 3×6 |
| 粤菜 | 广府烧味 | Cantonese Roast | `mcpe_food:ad_cantonese_roast` | 2:1 | 2×1 / 4×2 / 6×3 |
| 粤菜 | 早茶时光 | Cantonese Morning Tea | `mcpe_food:ad_dim_sum` | 1:2 | 1×2 / 2×4 / 3×6 |
| 火锅 | 铜锅涮肉 | Copper Hotpot | `mcpe_food:ad_hotpot` | 2:1 | 2×1 / 4×2 / 6×3 |
| 中餐 | 中式盛宴 | Chinese Banquet | `mcpe_food:ad_banquet` | 2:1 | 2×1 / 4×2 / 6×3 |
| 中餐 | 清蒸鲜味 | Steamed Grouper | `mcpe_food:ad_grouper` | 2:1 | 2×1 / 4×2 / 6×3 |
| 中餐 | 家常好味 | Chinese Bistro | `mcpe_food:ad_home_cooking` | 1:1 | 1×1 / 2×2 / 3×3 |
| 甜品店 | 甜品时光 | Patisserie Moments | `mcpe_food:ad_dessert` | 1:2 | 1×2 / 2×4 / 3×6 |
| 城市商业 | 创作工作站 | CREATE YOUR WORLD | `mcpe_food:ad_city_computer` | 2:1 | 2×1 / 4×2 / 6×3 |
| 城市商业 | 下一关见 | NEXT LEVEL | `mcpe_food:ad_city_gaming` | 2:1 | 2×1 / 4×2 / 6×3 |
| 城市商业 | 定格此刻 | CAPTURE THE MOMENT | `mcpe_food:ad_city_camera` | 1:2 | 1×2 / 2×4 / 3×6 |
| 城市商业 | 城市声场 | CITY SOUND | `mcpe_food:ad_city_music` | 1:2 | 1×2 / 2×4 / 3×6 |
| 城市商业 | 翻开新世界 | OPEN A NEW WORLD | `mcpe_food:ad_city_bookshop` | 1:2 | 1×2 / 2×4 / 3×6 |
| 城市商业 | 花开日常 | EVERYDAY BLOOMS | `mcpe_food:ad_city_florist` | 1:1 | 1×1 / 2×2 / 3×3 |
| 城市商业 | 出发吧 | GO EXPLORE | `mcpe_food:ad_city_travel` | 2:1 | 2×1 / 4×2 / 6×3 |
| 城市商业 | 理想居所 | MAKE ROOM FOR LIFE | `mcpe_food:ad_city_home` | 1:1 | 1×1 / 2×2 / 3×3 |

新横幅256×128、竖幅128×256、方形256×256，像素风格；旧12幅海报保持原1024／2048px画面和解码像素。

## 放置与收回

持画点击完整墙面侧面，菜单选择尺寸；点击方块为画面左下角，向右、向上延伸。需要足够背墙和前方空间，与本包其他广告画不能重叠。

空手点击对应画面区域打开尺寸／收回菜单。背包满不能收回，放大受阻不改变现有画。拆画时墙保留；其他背墙失去支撑会移除广告画。

## 源文件与预览

- originals：12张内置image_gen生成的原始主图。
- masters：20份带标题和边框的游戏主贴图；旧12幅高清图与新8幅像素图并存。
- layout.json：排版文字和比例。
- generation.json：生成提示词、主题和原图项目路径。
- tools/poster-layout.py：旧12幅高清食品海报的独立中文排版脚本。
- city：新8幅城市广告的像素绘图源、中文栅格、配色与layout；生成入口tools/city-posters.mjs。

主图没有价格、真实餐厅商标或水印。各尺寸复用同一构图，普通模式与灵动视效均读取同一色图。MER为哑光非金属，无自发光。

[旧12幅食品海报总览](../previews/advertisements.png) / [新8幅城市像素广告](../previews/city_advertisements.png) / [实际UV墙面预览](../previews/poster_wall.png)。这些都是离线图片，不代表实际游戏画面。
