import {patch097Foods} from './patch-097-catalog.js';
/** The single source of truth. IDs are save-file interfaces: do not rename them. */
export const NS = "mcpe_food";
export const id = (key: string): string => `${NS}:${key}`;
export type Station = "prep_counter" | "stove" | "oven" | "drink_counter";
export type FoodCategory = "chinese" | "western" | "japanese" | "dessert" | "drink";
export type VesselFamily = "plate" | "bowl" | "glass" | "mug" | "wine_glass";
export type Vessel = VesselFamily | "black_gold_bowl" | "burgundy_bowl" | "black_gold_plate" | "burgundy_platter";
export interface VesselDefinition {
  key: Vessel; family: VesselFamily; zh: string; en: string; color: string;
  theme: "porcelain" | "celadon" | "glass" | "earthen" | "black_gold" | "burgundy";
  radiusX: number; radiusZ: number; height: number; surface: number;
}
export interface Ingredient { item: string; count: number; returns?: string }
export interface Recipe {
  key: string; zh: string; en: string; category: string; station: Station;
  inputs: Ingredient[]; output: number;
}
export interface Food {
  key: string; zh: string; en: string; category: FoodCategory; legacyCategory: string; edible: boolean; recipe?: Recipe;
  vessel: Vessel; nutrition: number; saturation: number;
  shape: string; colors: string[];
}
export interface Material { key: string; zh: string; en: string; color: string; creativeOnly?: boolean }
export const legacyCategories: Record<string, [string, string]> = {
  chinese: ["家常中餐", "Chinese Classics"], cantonese: ["经典粤菜", "Cantonese"],
  huaiyang: ["淮扬名菜", "Huaiyang"], northeast: ["东北风味", "Northeastern"],
  seafood: ["海鲜料理", "Seafood"], western: ["经典西餐", "Western Classics"],
  snack: ["街头小吃", "Snacks"], drink: ["茶饮与饮品", "Drinks"], dessert: ["甜点时光", "Desserts"],
  processing: ["基础备料", "Preparation"]
  ,french: ["法国料理", "French Cuisine"], japanese: ["经典日料", "Japanese Cuisine"], hotpot: ["铜锅涮肉", "Copper Hotpot"]
};
export const categories: Record<FoodCategory, [string, string]> = {
  chinese: ["中餐", "Chinese"], western: ["西餐", "Western"], japanese: ["日料", "Japanese"],
  dessert: ["甜品", "Desserts"], drink: ["饮品", "Drinks"]
};
export function categoryFor(key: string, category: string): FoodCategory {
  if(category === "snack") return ["chicken_nuggets", "fries", "hotdog"].includes(key) ? "western" : "chinese";
  if(category === "french") return "western";
  return ["western", "japanese", "dessert", "drink"].includes(category) ? category as FoodCategory : "chinese";
}
export const recipeCategory = (recipe: Recipe): FoodCategory | "processing" => recipe.category === "processing" ? "processing" : categoryFor(recipe.key, recipe.category);
export const menuCategories: Record<string, [string, string]> = {...categories, processing: ["基础备料", "Preparation"]};
export const bottleProps = [
  {key: "baijiu_bottle", zh: "白酒瓶（摆件）", en: "Baijiu Bottle (Display)", style: "ceramic", color: "#e5dfcc"},
  {key: "premium_baijiu_bottle", zh: "珍品白酒瓶（摆件）", en: "Premium Baijiu Bottle (Display)", style: "premium", color: "#713b40"},
  {key: "premium_red_wine_bottle", zh: "珍品红酒瓶（摆件）", en: "Premium Red Wine Bottle (Display)", style: "wine", color: "#283c32"}
];
export const stations: { key: Station; zh: string; en: string; colors: string[] }[] = [
  { key: "prep_counter", zh: "料理台", en: "Preparation Counter", colors: ["#d8cdb5", "#82614b", "#496b58"] },
  { key: "stove", zh: "炉灶", en: "Cooking Stove", colors: ["#59646a", "#303b40", "#e8a25b"] },
  { key: "oven", zh: "烤箱", en: "Baking Oven", colors: ["#d3c7ae", "#424b50", "#c98349"] },
  { key: "drink_counter", zh: "饮品台", en: "Drink Counter", colors: ["#76a49a", "#405c51", "#d3b78a"] }
];
export const vessels: VesselDefinition[] = [
  { key: "plate", family: "plate", zh: "白瓷盘", en: "Porcelain Plate", color: "#e1e3d8", theme: "porcelain", radiusX: 5.7, radiusZ: 5.7, height: 1.05, surface: 0.85 },
  { key: "bowl", family: "bowl", zh: "青边瓷碗", en: "Celadon Bowl", color: "#b8d5c6", theme: "celadon", radiusX: 4.8, radiusZ: 4.8, height: 4.8, surface: 4 },
  { key: "glass", family: "glass", zh: "玻璃杯", en: "Glass", color: "#b6dfde", theme: "glass", radiusX: 2.25, radiusZ: 2.25, height: 7.5, surface: 6 },
  { key: "mug", family: "mug", zh: "陶瓷马克杯", en: "Ceramic Mug", color: "#c3926b", theme: "earthen", radiusX: 2.625, radiusZ: 2.625, height: 6, surface: 4.8 },
  { key: "black_gold_bowl", family: "bowl", zh: "黑金汤盅", en: "Black and Gold Soup Bowl", color: "#292d32", theme: "black_gold", radiusX: 4.8, radiusZ: 4.8, height: 5.8, surface: 4.9 },
  { key: "burgundy_bowl", family: "bowl", zh: "酒红小碗", en: "Burgundy Small Bowl", color: "#71363e", theme: "burgundy", radiusX: 3.6, radiusZ: 3.6, height: 3.6, surface: 2.9 },
  { key: "black_gold_plate", family: "plate", zh: "黑金圆盘", en: "Black and Gold Plate", color: "#292d32", theme: "black_gold", radiusX: 5.8, radiusZ: 5.8, height: 1.05, surface: 0.85 },
  { key: "burgundy_platter", family: "plate", zh: "酒红长盘", en: "Burgundy Oval Platter", color: "#71363e", theme: "burgundy", radiusX: 6.6, radiusZ: 4.5, height: 1.05, surface: 0.85 },
  { key: "wine_glass", family: "wine_glass", zh: "高脚杯", en: "Stemmed Wine Glass", color: "#c4dfdc", theme: "glass", radiusX: 2.25, radiusZ: 2.25, height: 9.8, surface: 8.1 }
];
export const vesselByKey = new Map(vessels.map(v => [v.key, v]));
export const hotpots = [
  { key: "copper_hotpot_empty", zh: "空铜锅", en: "Empty Copper Hotpot", filled: false },
  { key: "copper_hotpot_broth", zh: "清汤铜锅", en: "Clear Broth Copper Hotpot", filled: true }
];
export const cutlery = [
  { key: "chopsticks", zh: "竹筷", en: "Bamboo Chopsticks", color: "#b18450" },
  { key: "table_knife", zh: "餐刀", en: "Table Knife", color: "#b6c7ca" },
  { key: "fork", zh: "餐叉", en: "Table Fork", color: "#b6c7ca" },
  { key: "spoon", zh: "餐勺", en: "Table Spoon", color: "#b6c7ca" }
];
export const crops = [
  { key: "rice", zh: "水稻", en: "Rice", produceZh: "稻米", produceEn: "Rice Grains", color: "#d9ce8b", seedIngredient: "minecraft:wheat" },
  { key: "tomato", zh: "番茄", en: "Tomato", produceZh: "番茄", produceEn: "Tomato", color: "#d95b40", seedIngredient: "minecraft:beetroot" },
  { key: "soybean", zh: "大豆", en: "Soybean", produceZh: "大豆", produceEn: "Soybeans", color: "#c6bd73", seedIngredient: "minecraft:potato" },
  { key: "tea", zh: "茶树", en: "Tea", produceZh: "鲜茶叶", produceEn: "Tea Leaves", color: "#619350", seedIngredient: "minecraft:oak_leaves" },
  { key: "strawberry", zh: "草莓", en: "Strawberry", produceZh: "草莓", produceEn: "Strawberry", color: "#d35665", seedIngredient: "minecraft:sweet_berries" },
  { key: "coffee", zh: "咖啡", en: "Coffee", produceZh: "咖啡豆", produceEn: "Coffee Beans", color: "#795342", seedIngredient: "minecraft:cocoa_beans" }
];
export const materials: Material[] = [
  ...crops.map(c => ({ key: c.key, zh: c.produceZh, en: c.produceEn, color: c.color })),
  { key: "tofu", zh: "豆腐", en: "Tofu", color: "#ece2bd" },
  { key: "dough", zh: "面团", en: "Dough", color: "#dbc79c" },
  { key: "noodles", zh: "面条", en: "Noodles", color: "#e6d6a4" },
  { key: "cheese", zh: "奶酪", en: "Cheese", color: "#ecc85b" },
  { key: "cream", zh: "奶油", en: "Cream", color: "#f1e6cc" },
  { key: "sea_bass", zh: "鲜鲈鱼（创造限定）", en: "Sea Bass (Creative Only)", color: "#8dafb1", creativeOnly: true },
  { key: "shrimp", zh: "鲜虾（创造限定）", en: "Shrimp (Creative Only)", color: "#df8e72", creativeOnly: true },
  { key: "scallop", zh: "扇贝（创造限定）", en: "Scallop (Creative Only)", color: "#dfb7b0", creativeOnly: true },
  { key: "eel", zh: "黄鳝（创造限定）", en: "Eel (Creative Only)", color: "#9a8046", creativeOnly: true },
  { key: "seasoning", zh: "复合调味料（创造限定）", en: "Seasoning (Creative Only)", color: "#c19b64", creativeOnly: true },
  { key: "garlic", zh: "蒜蓉（创造限定）", en: "Garlic (Creative Only)", color: "#e9e0c6", creativeOnly: true },
  { key: "vermicelli", zh: "粉丝（创造限定）", en: "Vermicelli (Creative Only)", color: "#dce2d5", creativeOnly: true }
];
// Custom ingredient keys are unqualified here. Vanilla ingredients are explicitly namespaced.
export const ingredient = (item: string, count = 1): Ingredient => ({
  item: item.includes(":") ? item : id(item), count,
  ...(item === "minecraft:milk_bucket" || item === "minecraft:water_bucket" ? { returns: "minecraft:bucket" } : {})
});
const inputs = (pairs: [string, number][]): Ingredient[] => pairs.map(([key, count]) => ingredient(key, count));
export const processing: Recipe[] = [
  { key: "tofu", zh: "豆腐", en: "Tofu", category: "processing", station: "prep_counter", inputs: inputs([["soybean", 2], ["minecraft:water_bucket", 1]]), output: 4 },
  { key: "dough", zh: "面团", en: "Dough", category: "processing", station: "prep_counter", inputs: inputs([["minecraft:wheat", 3], ["minecraft:water_bucket", 1]]), output: 4 },
  { key: "noodles", zh: "面条", en: "Noodles", category: "processing", station: "prep_counter", inputs: inputs([["dough", 1]]), output: 2 },
  { key: "cheese", zh: "奶酪", en: "Cheese", category: "processing", station: "prep_counter", inputs: inputs([["minecraft:milk_bucket", 1]]), output: 4 },
  { key: "cream", zh: "奶油", en: "Cream", category: "processing", station: "prep_counter", inputs: inputs([["minecraft:milk_bucket", 1], ["minecraft:sugar", 1]]), output: 4 }
];
type FoodRow = [string, string, string, string, Station, Vessel, string, number, string[], [string, number][]];
const rows: FoodRow[] = [
  ["egg_fried_rice", "蛋炒饭", "Egg Fried Rice", "chinese", "stove", "bowl", "rice", 8, ["#eadb9d", "#f1c958", "#69a15c"], [["rice",2],["minecraft:egg",1]]],
  ["kung_pao_chicken", "宫保鸡丁", "Kung Pao Chicken", "chinese", "stove", "plate", "diced", 10, ["#ae623d","#bc4034","#77a358"], [["minecraft:chicken",1],["soybean",1],["seasoning",1]]],
  ["mapo_tofu", "麻婆豆腐", "Mapo Tofu", "chinese", "stove", "bowl", "tofu", 8, ["#f1ddb0","#a7402c","#699455"], [["tofu",2],["minecraft:porkchop",1],["seasoning",1]]],
  ["braised_pork", "红烧肉", "Braised Pork Belly", "chinese", "stove", "bowl", "braised", 12, ["#914728","#ce8d51","#ead0a0"], [["minecraft:porkchop",2],["minecraft:sugar",1],["seasoning",1]]],
  ["tomato_eggs", "番茄炒蛋", "Tomato and Eggs", "chinese", "stove", "plate", "scramble", 8, ["#df5338","#f0ca55","#6f9850"], [["tomato",2],["minecraft:egg",1]]],
  ["sweet_sour_pork", "糖醋里脊", "Sweet and Sour Pork", "chinese", "stove", "plate", "strips", 10, ["#df7535","#f0b04b","#72a251"], [["minecraft:porkchop",1],["tomato",1],["minecraft:sugar",1],["dough",1]]],
  ["beef_noodle_soup", "牛肉面", "Beef Noodle Soup", "chinese", "stove", "bowl", "noodle", 12, ["#e4d3a0","#875035","#6f9a4f"], [["noodles",1],["minecraft:beef",1],["minecraft:carrot",1]]],
  ["dumplings", "饺子", "Dumplings", "chinese", "stove", "plate", "dumpling", 10, ["#eee0b9","#b6bc85","#618f53"], [["dough",1],["minecraft:porkchop",1],["minecraft:carrot",1]]],
  ["white_cut_chicken", "白切鸡", "White Cut Chicken", "cantonese", "stove", "plate", "sliced_chicken", 10, ["#eed197","#f1e3c8","#63965a"], [["minecraft:chicken",2],["seasoning",1]]],
  ["char_siu", "蜜汁叉烧", "Honey Char Siu", "cantonese", "oven", "plate", "slices", 12, ["#b44834","#e4a77c","#b1783e"], [["minecraft:porkchop",2],["minecraft:honey_bottle",1],["seasoning",1]]],
  ["black_bean_ribs", "豉汁蒸排骨", "Black Bean Ribs", "cantonese", "stove", "bowl", "ribs", 10, ["#c9a28a","#584638","#679255"], [["minecraft:porkchop",1],["soybean",1],["seasoning",1]]],
  ["claypot_rice", "广式煲仔饭", "Cantonese Claypot Rice", "cantonese", "stove", "bowl", "claypot", 12, ["#e5d4a4","#a74d3b","#71a15e"], [["rice",2],["minecraft:porkchop",1],["minecraft:egg",1]]],
  ["lions_head", "清炖狮子头", "Lions Head Meatballs", "huaiyang", "stove", "bowl", "meatballs", 12, ["#bc966c","#c7d5a7","#73a060"], [["minecraft:porkchop",2],["tofu",1],["seasoning",1]]],
  ["boiled_tofu_shreds", "大煮干丝", "Huaiyang Tofu Shreds", "huaiyang", "stove", "bowl", "shreds", 8, ["#eddfb9","#db9c76","#78a259"], [["tofu",2],["shrimp",1],["seasoning",1]]],
  ["wensi_tofu", "文思豆腐", "Wensi Tofu Soup", "huaiyang", "stove", "bowl", "fine_soup", 6, ["#eee9d3","#c6d8bb","#6c9558"], [["tofu",2],["minecraft:brown_mushroom",1],["seasoning",1]]],
  ["huaiyang_eel", "软兜长鱼", "Huaiyang Braised Eel", "huaiyang", "stove", "plate", "eel", 10, ["#7f542b","#b99754","#6c984d"], [["eel",2],["garlic",1],["seasoning",1]]],
  ["guo_bao_rou", "锅包肉", "Guo Bao Rou", "northeast", "stove", "plate", "crispy_pork", 10, ["#dc9d40","#f0c779","#d2763f"], [["minecraft:porkchop",1],["dough",1],["minecraft:sugar",1],["minecraft:carrot",1]]],
  ["steamed_sea_bass", "清蒸鲈鱼", "Steamed Sea Bass", "seafood", "stove", "plate", "fish", 10, ["#9aaead","#dce3d7","#659854"], [["sea_bass",1],["seasoning",1]]],
  ["garlic_scallops", "蒜蓉粉丝蒸扇贝", "Garlic Vermicelli Scallops", "seafood", "stove", "plate", "scallops", 10, ["#ddb2aa","#f0d39f","#e4e2cc"], [["scallop",2],["garlic",1],["vermicelli",1]]],
  ["braised_prawns", "油焖大虾", "Braised Prawns", "seafood", "stove", "plate", "prawns", 10, ["#db6b43","#eea46f","#689455"], [["shrimp",2],["tomato",1],["seasoning",1]]],
  ["steak", "煎牛排", "Pan Seared Steak", "western", "stove", "plate", "steak", 12, ["#794631","#bb7751","#72a05b"], [["minecraft:beef",2],["minecraft:potato",1]]],
  ["burger", "汉堡", "Cheeseburger", "western", "prep_counter", "plate", "burger", 12, ["#d9a154","#6b4230","#7eaa4d"], [["minecraft:bread",1],["minecraft:cooked_beef",1],["cheese",1],["tomato",1]]],
  ["pizza", "披萨", "Tomato Cheese Pizza", "western", "oven", "plate", "pizza", 12, ["#d7a95c","#efd17b","#bd4f37"], [["dough",2],["cheese",2],["tomato",1]]],
  ["spaghetti", "意大利面", "Spaghetti", "western", "stove", "plate", "pasta", 10, ["#e4c57c","#b94931","#69914c"], [["noodles",1],["tomato",2],["minecraft:beef",1]]],
  ["sandwich", "三明治", "Garden Sandwich", "western", "prep_counter", "plate", "sandwich", 8, ["#e5cf9e","#78a455","#ce6647"], [["minecraft:bread",1],["cheese",1],["tomato",1]]],
  ["roast_chicken", "烤鸡", "Roast Chicken", "western", "oven", "plate", "roast", 12, ["#b97535","#e4b76c","#7b9f51"], [["minecraft:chicken",2],["minecraft:potato",1],["minecraft:carrot",1]]],
  ["mushroom_soup", "奶油蘑菇汤", "Cream of Mushroom Soup", "western", "stove", "bowl", "soup", 8, ["#d6c6a0","#997852","#739354"], [["minecraft:brown_mushroom",2],["cream",1]]],
  ["salad", "蔬菜沙拉", "Garden Salad", "western", "prep_counter", "bowl", "salad", 6, ["#79a94e","#d95e3f","#e1b44a"], [["tomato",1],["minecraft:carrot",1],["minecraft:beetroot",1]]],
  ["baozi", "包子", "Steamed Buns", "snack", "stove", "plate", "buns", 8, ["#eee0bc","#d5c6a3","#89a760"], [["dough",1],["minecraft:porkchop",1]]],
  ["spring_rolls", "春卷", "Spring Rolls", "snack", "stove", "plate", "rolls", 8, ["#dca94b","#edc879","#7c9f52"], [["dough",1],["minecraft:carrot",1],["minecraft:porkchop",1]]],
  ["chicken_nuggets", "炸鸡块", "Chicken Nuggets", "snack", "stove", "plate", "nuggets", 8, ["#d59b40","#eac16a","#9e5c31"], [["minecraft:chicken",1],["dough",1]]],
  ["fries", "薯条", "French Fries", "snack", "stove", "plate", "fries", 6, ["#e7c164","#f2d581","#d4963a"], [["minecraft:potato",2]]],
  ["hotdog", "热狗", "Hot Dog", "snack", "prep_counter", "plate", "hotdog", 8, ["#d5a15d","#aa5037","#dfb945"], [["minecraft:bread",1],["minecraft:cooked_porkchop",1],["tomato",1]]],
  ["skewers", "烤肉串", "Grilled Skewers", "snack", "oven", "plate", "skewers", 10, ["#a96936","#d9914a","#68a15a"], [["minecraft:beef",1],["tomato",1],["minecraft:stick",1]]],
  ["green_tea", "绿茶", "Green Tea", "drink", "drink_counter", "mug", "tea", 2, ["#a6b767","#688d50","#c9c599"], [["tea",2],["minecraft:water_bucket",1]]],
  ["black_coffee", "咖啡", "Black Coffee", "drink", "drink_counter", "mug", "coffee", 2, ["#55382c","#927058","#bd9b79"], [["coffee",2],["minecraft:water_bucket",1]]],
  ["milk_tea", "奶茶", "Milk Tea", "drink", "drink_counter", "glass", "milk_tea", 4, ["#c49a6c","#ead4ae","#856046"], [["tea",1],["minecraft:milk_bucket",1],["minecraft:sugar",1]]],
  ["strawberry_shake", "草莓奶昔", "Strawberry Milkshake", "drink", "drink_counter", "glass", "shake", 6, ["#e5a4b0","#f2e3cf","#c64f64"], [["strawberry",2],["minecraft:milk_bucket",1],["minecraft:sugar",1]]],
  ["tomato_juice", "番茄汁", "Tomato Juice", "drink", "drink_counter", "glass", "juice", 4, ["#cc583c","#df7851","#6d954b"], [["tomato",2],["minecraft:water_bucket",1]]],
  ["hot_chocolate", "热巧克力", "Hot Chocolate", "drink", "drink_counter", "mug", "chocolate", 6, ["#81533c","#ba8967","#ecdfc7"], [["minecraft:cocoa_beans",2],["minecraft:milk_bucket",1],["minecraft:sugar",1]]],
  ["strawberry_cake", "草莓蛋糕", "Strawberry Cake Slice", "dessert", "oven", "plate", "layer_cake", 8, ["#e8b0b8","#f2e5cf","#c8505e"], [["dough",1],["cream",1],["strawberry",2],["minecraft:sugar",1]]],
  ["chocolate_cake", "巧克力蛋糕", "Chocolate Cake Slice", "dessert", "oven", "plate", "choc_cake", 8, ["#714638","#b98762","#e0bf94"], [["dough",1],["cream",1],["minecraft:cocoa_beans",2],["minecraft:sugar",1]]],
  ["cheesecake", "芝士蛋糕", "Cheesecake Slice", "dessert", "oven", "plate", "cheesecake", 8, ["#f1dc9d","#e7bf6d","#ae793d"], [["dough",1],["cheese",2],["minecraft:sugar",1]]],
  ["pudding", "布丁", "Caramel Pudding", "dessert", "oven", "bowl", "pudding", 6, ["#ecd49a","#a26a37","#f4e4ba"], [["minecraft:milk_bucket",1],["minecraft:egg",1],["minecraft:sugar",1]]],
  ["ice_cream", "冰淇淋", "Strawberry Ice Cream", "dessert", "drink_counter", "bowl", "ice_cream", 6, ["#e9bac5","#eee2c9","#b5744c"], [["cream",1],["strawberry",1],["minecraft:sugar",1]]],
  ["donut", "甜甜圈", "Glazed Donut", "dessert", "oven", "plate", "donut", 6, ["#cf9852","#e6b0c0","#f0d777"], [["dough",1],["minecraft:sugar",2]]],
  ["cookies", "曲奇", "Chocolate Chip Cookies", "dessert", "oven", "plate", "cookies", 6, ["#d4ad68","#77503a","#edd198"], [["dough",1],["minecraft:cocoa_beans",1],["minecraft:sugar",1]]],
  ["egg_tart", "蛋挞", "Egg Tarts", "dessert", "oven", "plate", "tarts", 6, ["#d5a354","#f0d36a","#edddaa"], [["dough",1],["minecraft:egg",1],["cream",1],["minecraft:sugar",1]]]
];
export const legacyFoods: Food[] = rows.map(([key, zh, en, category, station, vessel, shape, nutrition, colors, pairs]) => ({
  key, zh: key === "egg_tart" ? "广式酥皮蛋挞" : zh, en: key === "egg_tart" ? "Cantonese Flaky Egg Tarts" : en,
  category: categoryFor(key, category), legacyCategory: category, vessel, shape, nutrition, edible: true,
  saturation: category === "drink" ? 0.25 : category === "dessert" ? 0.4 : 0.6,
  colors, recipe: { key, zh, en, category, station, inputs: inputs(pairs).map(i => i.item === "minecraft:honey_bottle" ? { ...i, returns: "minecraft:glass_bottle" } : i), output: 1 }
}));
type NewDish = [string, string, string, string, Vessel, string, string[]];
const additions: NewDish[] = [
  ["roast_goose", "烧鹅", "Cantonese Roast Goose", "cantonese", "burgundy_platter", "goose", ["#a45129","#d59245","#69934d"]],
  ["shrimp_rice_rolls", "鲜虾肠粉", "Shrimp Rice Noodle Rolls", "cantonese", "black_gold_plate", "rice_rolls", ["#efe9d6","#dfa28d","#93643f"]],
  ["dongpo_pork", "东坡肉", "Dongpo Pork", "chinese", "burgundy_platter", "dongpo", ["#98442b","#e5bc94","#5e8a49"]],
  ["peking_duck", "北京烤鸭", "Peking Roast Duck", "chinese", "burgundy_platter", "peking_duck", ["#a9542b","#eed9ae","#739654"]],
  ["buddha_jumps_wall", "佛跳墙", "Buddha Jumps Over the Wall", "chinese", "black_gold_bowl", "buddha", ["#ac7e44","#dfbb79","#6d8550"]],
  ["boeuf_bourguignon", "红酒炖牛肉", "Boeuf Bourguignon", "french", "black_gold_bowl", "bourguignon", ["#6f3e32","#be854d","#869b56"]],
  ["french_onion_soup", "法式洋葱汤", "French Onion Soup", "french", "black_gold_bowl", "onion_soup", ["#ae7940","#ead19a","#a07845"]],
  ["sushi_platter", "寿司拼盘", "Sushi Platter", "japanese", "black_gold_plate", "sushi", ["#e39172","#f1e5c9","#344a39"]],
  ["sashimi_platter", "刺身拼盘", "Sashimi Platter", "japanese", "burgundy_platter", "sashimi", ["#e88971","#b75159","#8da66b"]],
  ["tempura", "天妇罗", "Tempura", "japanese", "black_gold_plate", "tempura", ["#e3c17d","#eca17b","#789452"]],
  ["tonkotsu_ramen", "豚骨拉面", "Tonkotsu Ramen", "japanese", "black_gold_bowl", "ramen", ["#ddc99d","#b87957","#b3c573"]],
  ["unagi_don", "鳗鱼饭", "Unagi Don", "japanese", "burgundy_bowl", "unagi", ["#915331","#eee0bd","#809855"]],
  ["okonomiyaki", "大阪烧", "Okonomiyaki", "japanese", "black_gold_plate", "okonomiyaki", ["#c28b47","#704736","#f1dfb9"]],
  ["hotpot_lamb", "涮羊肉", "Poached Hotpot Lamb", "hotpot", "black_gold_plate", "cooked_lamb", ["#bd9c88","#ead5be","#7a9256"]],
  ["hotpot_beef", "涮牛肉", "Poached Hotpot Beef", "hotpot", "black_gold_plate", "cooked_beef", ["#987b65","#d8c6a8","#739255"]]
];
const displayRows: NewDish[] = [
  ["lamb_slices", "羊肉片盘", "Lamb Slice Platter", "hotpot", "burgundy_platter", "raw_lamb", ["#d58c93","#f1dacc","#729052"]],
  ["beef_slices", "牛肉片盘", "Beef Slice Platter", "hotpot", "burgundy_platter", "raw_beef", ["#b95460","#eed4c3","#6e8f54"]],
  ["tripe_platter", "毛肚盘", "Tripe Platter", "hotpot", "black_gold_plate", "tripe", ["#606461","#b8b7a5","#7c9756"]],
  ["frozen_tofu_platter", "冻豆腐盘", "Frozen Tofu Platter", "hotpot", "black_gold_plate", "frozen_tofu", ["#e4d6a5","#c5b080","#799254"]],
  ["mushroom_platter", "菌菇拼盘", "Mushroom Platter", "hotpot", "burgundy_platter", "mushrooms", ["#a0815f","#e9ddc5","#736247"]],
  ["greens_platter", "青菜拼盘", "Leafy Greens Platter", "hotpot", "burgundy_platter", "greens", ["#6b9853","#b8ca85","#e4dcb8"]],
  ["vermicelli_platter", "粉丝盘", "Vermicelli Platter", "hotpot", "black_gold_plate", "vermicelli", ["#e1e3d5","#f1ecda","#94a373"]],
  ["sesame_dip", "麻酱蘸碟", "Sesame Dipping Sauce", "hotpot", "burgundy_bowl", "sesame", ["#b99a6c","#dfc99b","#709455"]]
];
const banquetAdditions: NewDish[] = [
  ["peacock_platter", "孔雀开屏花拼", "Peacock Banquet Platter", "chinese", "black_gold_plate", "peacock", ["#956548", "#e6c59a", "#668d52"]],
  ["stir_fried_yellow_beef", "小炒黄牛肉", "Stir Fried Yellow Beef", "chinese", "burgundy_platter", "yellow_beef", ["#865039", "#d4472d", "#719651"]],
  ["truffle_abalone", "松露鲍鱼", "Truffle Abalone", "chinese", "black_gold_plate", "abalone", ["#c4a075", "#635045", "#d6b675"]],
  ["huaiyang_sanding_bao", "淮扬三丁包", "Huaiyang Three Dice Buns", "chinese", "plate", "sanding_bao", ["#f0e0be", "#aa7349", "#7b9b58"]],
  ["fruit_platter", "鲜果拼盘", "Fresh Fruit Platter", "chinese", "burgundy_platter", "fruit", ["#df6754", "#edc46a", "#8bad58"]],
  ["snow_pear_tremella", "冰糖银耳炖雪梨", "Rock Sugar Pear and Tremella", "chinese", "black_gold_bowl", "pear_tremella", ["#e5d5a2", "#f2e4c5", "#c19651"]],
  ["pickled_greens_pork", "咸菜炖猪肉", "Pork Stew with Pickled Greens", "chinese", "bowl", "pickled_pork", ["#a17753", "#7c804f", "#d9bb8e"]],
  ["jujube_lotus_soup", "红枣莲子甜汤", "Jujube and Lotus Seed Soup", "chinese", "burgundy_bowl", "lotus_soup", ["#bb9763", "#8f3e36", "#e9d7ad"]],
  ["takoyaki", "章鱼烧", "Takoyaki", "japanese", "plate", "takoyaki", ["#c29651", "#704534", "#efe0b9"]],
  ["yakisoba", "日式炒面", "Yakisoba", "japanese", "burgundy_platter", "yakisoba", ["#b28a4f", "#82613f", "#8da369"]],
  ["grilled_squid", "烤鱿鱼", "Grilled Squid", "japanese", "burgundy_platter", "squid", ["#c6997c", "#a96a4d", "#ead4af"]],
  ["oden", "关东煮", "Oden", "japanese", "black_gold_bowl", "oden", ["#c2a06d", "#e5d4aa", "#856c51"]],
  ["dorayaki", "铜锣烧", "Dorayaki", "japanese", "plate", "dorayaki", ["#c58e43", "#713e3d", "#edd8a8"]],
  ["wagyu_rice", "和牛饭", "Wagyu Rice Bowl", "japanese", "burgundy_bowl", "wagyu", ["#986144", "#ead9b9", "#6d9252"]],
  ["gunkan_sushi", "军舰寿司", "Gunkan Sushi", "japanese", "black_gold_plate", "gunkan", ["#334c3a", "#efddba", "#dd8453"]],
  ["red_bean_cake", "红豆糕", "Red Bean Cake", "dessert", "plate", "red_bean_cake", ["#a26768", "#d8b39c", "#743e43"]],
  ["mung_bean_soup", "绿豆汤", "Mung Bean Sweet Soup", "dessert", "bowl", "mung_soup", ["#92935e", "#b7b582", "#e0d5ad"]],
  ["baijiu", "白酒", "Baijiu", "drink", "glass", "clear_spirit", ["#e5dfc9", "#f1eddc", "#d0cbb8"]],
  ["premium_baijiu", "珍品白酒", "Premium Baijiu", "drink", "glass", "clear_spirit", ["#e7ddbd", "#f1e7d0", "#d7c59f"]],
  ["premium_red_wine", "珍品红酒", "Premium Red Wine", "drink", "glass", "red_wine", ["#752c3d", "#a84e5e", "#dfb4ae"]],
  ["cola", "可乐", "Cola", "drink", "glass", "cola", ["#50362c", "#b98d57", "#e9d6a9"]]
];
function creativeDishes(list: NewDish[], edible: boolean): Food[] {
  return list.map(([key, zh, en, category, vessel, shape, colors]) => ({key, zh, en, category: categoryFor(key, category), legacyCategory: category, vessel, shape, colors, edible,
    nutrition: !edible || /baijiu|red_wine/.test(key) ? 0 : category === "drink" ? 2 : category === "dessert" ? 6 : 8,
    saturation: category === "drink" ? 0.25 : category === "dessert" ? 0.4 : 0.6}));
}
const restaurantAdditions: NewDish[] = [
  ["steamed_grouper", "清蒸石斑鱼", "Steamed Grouper with Ginger and Scallions", "chinese", "burgundy_platter", "grouper", ["#7e8b7b", "#e8e1c9", "#79472d"]],
  ["poached_tiger_prawns", "白灼九节虾", "Poached Tiger Prawns", "chinese", "black_gold_plate", "tiger_prawns", ["#e27e5c", "#f1d9bb", "#9b4e38"]],
  ["smashed_cucumber", "拍黄瓜", "Smashed Cucumber", "chinese", "plate", "cucumber", ["#6c9c44", "#c5d896", "#d7b66f"]],
  ["vegetables_in_superior_broth", "上汤鲜蔬", "Vegetables in Superior Broth", "chinese", "bowl", "superior_vegetables", ["#bcd38b", "#698c48", "#e4d6a7"]],
  ["tiramisu", "提拉米苏", "Tiramisu", "dessert", "black_gold_plate", "tiramisu", ["#e5cfaa", "#79503c", "#4b332b"]],
  ["daifuku", "大福", "Daifuku", "dessert", "plate", "daifuku", ["#f0e5d2", "#b8666c", "#723e43"]],
  ["mille_feuille", "千层酥", "Mille Feuille", "dessert", "burgundy_platter", "mille_feuille", ["#c99752", "#f0dfb9", "#a96b39"]],
  ["lobster_bisque", "龙虾浓汤", "Lobster Bisque", "western", "black_gold_bowl", "lobster_bisque", ["#cd8757", "#e9b09a", "#f1dcc0"]],
  ["chicken_cordon_bleu", "蓝带鸡肉卷", "Chicken Cordon Bleu", "western", "black_gold_plate", "cordon_bleu", ["#ce9a4c", "#e9d4a5", "#bc7880"]],
  ["pan_seared_sole", "香煎龙利鱼", "Pan Seared Sole", "western", "burgundy_platter", "sole", ["#d4aa6b", "#eee0c1", "#8ba35f"]]
];
const fineDiningAdditions: NewDish[] = [
  ["beef_wellington", "惠灵顿牛排", "Beef Wellington", "western", "burgundy_platter", "wellington", ["#cc9851", "#a45b53", "#63513f"]],
  ["herb_roasted_lamb_rack", "香草烤羊排", "Herb Roasted Lamb Rack", "western", "burgundy_platter", "lamb_rack", ["#966148", "#d6b597", "#6e9451"]],
  ["wild_mushroom_risotto", "野菌烩饭", "Wild Mushroom Risotto", "western", "black_gold_bowl", "risotto", ["#d9c593", "#977854", "#eee0bb"]],
  ["lobster_thermidor", "奶油焗龙虾", "Lobster Thermidor", "western", "burgundy_platter", "thermidor", ["#bd6042", "#edcf86", "#e7b993"]],
  ["caviar_blini", "鱼子酱配薄饼", "Caviar with Blini", "western", "black_gold_plate", "caviar_blini", ["#c6a267", "#eee4cc", "#384344"]],
  ["creme_brulee", "焦糖布蕾", "Creme Brulee", "western", "burgundy_bowl", "brulee", ["#e9d4a1", "#c48a3c", "#8b5531"]],
  ["black_truffle_foie_gras", "黑松露鹅肝", "Black Truffle Foie Gras", "western", "black_gold_plate", "truffle_foie", ["#b98b64", "#dfc098", "#4a413a"]]
];
export const banquetFoods = creativeDishes(banquetAdditions, true);
export const restaurantFoods = creativeDishes(restaurantAdditions, true);
export const newFoods = creativeDishes(fineDiningAdditions, true);
export const previousDishes = [...legacyFoods, ...creativeDishes(additions, true), ...creativeDishes(displayRows, false)];
const teaBase=legacyFoods.find(f=>f.key==='green_tea')!;
export const teaFoods:Food[]=[{...teaBase,key:'tieguanyin',zh:'铁观音',en:'Tieguanyin Oolong Tea',recipe:undefined,colors:['#b59a4e','#806f35','#d1b76c']}];
const previousFoods = [...legacyFoods, ...creativeDishes(additions, true), ...banquetFoods, ...restaurantFoods, ...newFoods,...teaFoods];
export const foods: Food[] = [...previousFoods,...patch097Foods];
export const displays = creativeDishes(displayRows, false).map(f => ({...f, zh: `${f.zh}（展示）`, en: `${f.en} (Display)`}));
export const dishes = [...previousFoods, ...displays, ...patch097Foods];
export const recipes: Recipe[] = [...processing, ...legacyFoods.map(f => f.recipe!)];
export const foodById = new Map(dishes.map(f => [id(f.key), f]));
export const compatibleVessels = (food: Food): VesselDefinition[] => vessels.filter(v => food.category === "drink"
  ? v.key === "glass" || v.key === "mug" || (food.key === "premium_red_wine" && v.key === "wine_glass")
  : v.family === vesselByKey.get(food.vessel)!.family);
export const servingKey = (food: Food, vessel: Vessel): string => vessel === food.vessel ? `${food.key}_serving` : `${food.key}_on_${vessel}`;
export const servings = dishes.flatMap(food => compatibleVessels(food).map(vessel => ({key: servingKey(food, vessel.key), food, vessel})));
export const foodByServing = new Map(servings.map(s => [id(s.key), s]));
export const cropByBlock = new Map(crops.map(c => [id(`${c.key}_crop`), c]));
export const materialById = new Map(materials.map(m => [id(m.key), m]));
export function label(item: string, english = false): string {
  const found = foodById.get(item) ?? materialById.get(item);
  if (found) return english ? found.en : found.zh;
  const names: Record<string, [string, string]> = {
    wheat: ["小麦","Wheat"], water_bucket: ["水桶","Water Bucket"], milk_bucket: ["奶桶","Milk Bucket"],
    bucket: ["桶","Bucket"], glass_bottle: ["玻璃瓶","Glass Bottle"], egg: ["鸡蛋","Egg"],
    chicken: ["生鸡肉","Raw Chicken"], porkchop: ["生猪肉","Raw Porkchop"], beef: ["生牛肉","Raw Beef"],
    cooked_beef: ["牛排","Cooked Beef"], cooked_porkchop: ["熟猪排","Cooked Porkchop"], bread: ["面包","Bread"],
    sugar: ["糖","Sugar"], carrot: ["胡萝卜","Carrot"], potato: ["马铃薯","Potato"], beetroot: ["甜菜根","Beetroot"],
    brown_mushroom: ["棕色蘑菇","Brown Mushroom"], cocoa_beans: ["可可豆","Cocoa Beans"],
    honey_bottle: ["蜂蜜瓶","Honey Bottle"], stick: ["木棍","Stick"]
  };
  return names[item.replace("minecraft:", "")]?.[english ? 1 : 0] ?? item;
}
