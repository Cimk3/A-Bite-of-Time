export const districtGroups = [
    ['district_hotel', '酒店与家电', 'Hotel and Appliances'],
    ['district_books', '图书陈列', 'Book Displays'],
    ['district_store', '便利店', 'Convenience Store'],
    ['district_street', '街区小件', 'Neighborhood Props'],
];
const rows = [
    ['hotel_luggage_cart', '行李推车', 'Hotel Luggage Cart', 0, 'solid', [1, 1, 2]],
    ['hotel_housekeeping_cart', '客房清洁车', 'Housekeeping Cart', 0, 'solid', [2, 1, 2]],
    ['hotel_wall_hairdryer', '壁挂吹风机', 'Wall Hairdryer', 0, 'wall', [1, 1, 1]],
    ['induction_hob', '电磁炉', 'Induction Hob', 0, 'surface', [1, 1, 1]],
    ['bookshop_bookcase', '落地书架', 'Freestanding Bookcase', 1, 'solid', [1, 1, 2]],
    ['bookshop_display_table', '图书陈列台', 'Book Display Table', 1, 'solid', [2, 1, 1]],
    ['bookshop_magazine_rack', '杂志架', 'Magazine Rack', 1, 'solid', [1, 1, 2]],
    ['bookshop_desk_lamp', '台灯', 'Desk Lamp', 1, 'solid', [1, 1, 1]],
    ['store_wall_shelving', '靠墙货架', 'Wall Shelving', 2, 'solid', [2, 1, 2]],
    ['store_island_shelving', '中岛货架', 'Island Shelving', 2, 'solid', [2, 1, 1]],
    ['store_drink_cooler', '饮料冷柜', 'Beverage Cooler', 2, 'solid', [1, 1, 2]],
    ['store_hot_display', '热食保温柜', 'Heated Food Display', 2, 'surface', [1, 1, 1]],
    ['store_basket_stand', '购物篮架', 'Shopping Basket Stand', 2, 'solid', [1, 1, 1]],
    ['store_restock_cart', '补货推车', 'Restocking Cart', 2, 'solid', [2, 1, 1]],
    ['store_oden_station', '关东煮台', 'Oden Station', 2, 'surface', [1, 1, 1]],
    ['store_bun_steamer', '包子蒸柜', 'Bun Steamer', 2, 'surface', [1, 1, 1]],
    ['street_takeaway_bag', '外卖打包袋', 'Takeaway Bag', 3, 'surface', [1, 1, 1]],
    ['street_umbrella_stand', '雨伞架', 'Umbrella Stand', 3, 'solid', [1, 1, 1]],
    ['street_waste_station', '四分类垃圾桶', 'Four-stream Waste Station', 3, 'solid', [2, 1, 1]],
];
export const districtProps = rows.map(([key, zh, en, group, kind, size]) => ({
    key, zh, en, kind, size, group: districtGroups[group][0], height: Math.ceil(size[2]),
    wallOnly: kind === 'wall', placementFront: 0,
    footprint: size[0] > 1 ? { width: size[0], depth: size[1] } : undefined,
}));
export const districtKeys = new Set(districtProps.map(d => d.key));
export const districtGlassKeys = new Set(['store_drink_cooler', 'store_hot_display']);
export const deskLampKey = 'bookshop_desk_lamp';
