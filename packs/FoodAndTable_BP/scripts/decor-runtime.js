import { patch082ById } from './patch-082-catalog.js';
import { patch080ById, ceilingDisplayKey } from './patch-080-catalog.js';
import { patch074ById } from './patch-074-catalog.js';
import { patch073ById } from './patch-073-catalog.js';
import { patch072ById, clothingById, rackById, clothingVisuals } from './patch-072-catalog.js';
import { scenarioById, wallById, digitalById, wallScreens } from './scenario-catalog.js';
import { BlockPermutation, GameMode, ItemStack, system, world } from '@minecraft/server';
import { lifestyleItems } from './lifestyle-catalog.js';
import { restaurantAccessories, numberKey, validTableNumber } from './restaurant-catalog.js';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { compatibleVessels, foodById, foodByServing, id, servingKey, vesselByKey } from './catalog.js';
import { adById, adSize, advertisements, surfaceIndex, tableItemById, tray, trayFoods } from './decor-catalog.js';
import { electronicsById } from './electronics-catalog.js';
import { refrigeratorById } from './appliance-catalog.js';
import { screenYaw, cardinalYaw, displayFacing, facingFromYaw } from './device-facing.js';
import { planInsert, planServe } from './inventory.js';
import { isWallSupport, surfaceHeight } from './supports.js';
let io;
const PREFIX = 'mcpe_food:decor:', records = new Map(), locks = new Set(), cooldowns = new Map();
// Derived spatial index only; persisted v1 records remain the source of truth.
const occupancy = new Map(), recordCells = new Map();
const loadedEntities = new Map(), dirtyOwners = new Set();
let loading = true, loadGeneration = 0, recordCursor = records.values();
const cellKey = (dimension, p) => `${dimension}:${p.x},${p.y},${p.z}`;
function forgetRecord(uid) {
    for (const key of recordCells.get(uid) ?? []) {
        const owners = occupancy.get(key);
        owners?.delete(uid);
        if (!owners?.size)
            occupancy.delete(key);
    }
    recordCells.delete(uid);
    records.delete(uid);
    dirtyOwners.delete(uid);
}
function rememberRecord(r) {
    forgetRecord(r.uid);
    records.set(r.uid, r);
    const keys = occupiedCells(r).map(p => cellKey(r.dimension, p));
    recordCells.set(r.uid, keys);
    for (const key of keys) {
        let owners = occupancy.get(key);
        if (!owners)
            occupancy.set(key, owners = new Set());
        owners.add(r.uid);
    }
}
const yaw = { north: 0, east: -90, south: 180, west: 90 };
const normals = { north: { x: 0, y: 0, z: -1 }, south: { x: 0, y: 0, z: 1 }, east: { x: 1, y: 0, z: 0 }, west: { x: -1, y: 0, z: 0 } };
const rights = { north: { x: -1, y: 0, z: 0 }, south: { x: 1, y: 0, z: 0 }, east: { x: 0, y: 0, z: 1 }, west: { x: 0, y: 0, z: -1 } };
const add = (a, b, n = 1) => ({ x: a.x + b.x * n, y: a.y + b.y * n, z: a.z + b.z * n });
const same = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;
const copy = (r) => JSON.parse(JSON.stringify(r));
const dim = (r) => world.getDimension(r.dimension.replace(/^minecraft:/, ''));
const anchor = (r) => add(r.support, { x: 0, y: 1, z: 0 });
const safeBlock = (r, p = r.support) => { try {
    return dim(r).getBlock(p);
}
catch {
    return undefined;
} };
const empty = (b) => b?.typeId === 'minecraft:air';
const isCreative = (p) => p.getGameMode() === GameMode.Creative;
const recordForSupport = (dimension, p) => [...records.values()].find(r => !isPanel(r) && !r.mount && r.dimension === dimension && same(r.support, p));
const storageKey = (r) => PREFIX + r.uid;
function save(r) { world.setDynamicProperty(storageKey(r), JSON.stringify(r)); rememberRecord(r); }
function unique() { const n = Number(world.getDynamicProperty('mcpe_food:decor_serial') ?? 0) + 1; world.setDynamicProperty('mcpe_food:decor_serial', n); return `d${n}`; }
function near(p, r) {
    if (loading || !p.isValid || p.dimension.id !== r.dimension)
        return false;
    if (isPanel(r)) {
        const [w, h] = panelSize(r), right = rights[r.direction], normal = normals[r.direction];
        const d = { x: p.location.x - r.support.x - .5, y: p.location.y - r.support.y, z: p.location.z - r.support.z - .5 };
        const horizontal = d.x * right.x + d.z * right.z, vertical = d.y, depth = d.x * normal.x + d.z * normal.z;
        return Math.hypot(Math.max(-.5 - horizontal, 0, horizontal - (w - .5)), Math.max(-vertical, 0, vertical - h), depth) < 7;
    }
    return Math.hypot(p.location.x - r.support.x - .5, p.location.y - r.support.y - 1, p.location.z - r.support.z - .5) < 7;
}
function click(p, key) { const k = p.id + key, last = cooldowns.get(k) ?? -100; if (system.currentTick - last < 6)
    return false; cooldowns.set(k, system.currentTick); return true; }
function assertCurrent(p, r) {
    const now = records.get(r.uid);
    return !!now && now.revision === r.revision && near(p, now) && surfaceValid(now) === true;
}
/** undefined means unloaded; it must never be treated as missing support. */
function surfaceValid(r) {
    if (r.mount === 'ceiling')
        return ceilingFits(r);
    if (isPanel(r))
        return adFits(r);
    const b = safeBlock(r);
    if (!b)
        return undefined;
    if (r.kind === 'appliance') {
        if (surfaceHeight(b) !== 1)
            return false;
        for (const [i, p] of applianceCells(r).entries()) {
            const part = safeBlock(r, p);
            if (!part)
                return undefined;
            if (part.typeId !== (i === 0 ? r.definition : r.definition + '_upper') || part.permutation.getState('minecraft:cardinal_direction') !== r.direction)
                return false;
        }
        return true;
    }
    if (!surfaceHeight(b))
        return false;
    const above = safeBlock(r, anchor(r));
    if (!above)
        return undefined;
    if (r.native)
        return above.typeId === id(tray.key) && !overlaps(r);
    for (const p of occupiedCells(r)) {
        const b = safeBlock(r, p);
        if (!b)
            return undefined;
        if (!empty(b))
            return false;
    }
    return !overlaps(r);
}
export function ceilingSupports(r) { const right = rights[r.direction]; return right ? [r.support, add(r.support, right)] : []; }
function ceilingFits(r) {
    if (r.definition !== id(ceilingDisplayKey) || r.kind !== 'surface' || r.native)
        return false;
    const support = ceilingSupports(r);
    if (support.length !== 2)
        return false;
    for (const p of support) {
        const b = safeBlock(r, p);
        if (!b)
            return undefined;
        if (!isWallSupport(b))
            return false;
    }
    for (const p of occupiedCells(r)) {
        const b = safeBlock(r, p);
        if (!b)
            return undefined;
        if (!empty(b))
            return false;
    }
    return !overlaps(r);
}
function createCeiling(p, block) {
    const c = io.inventory(p), selected = p.selectedSlotIndex, definition = id(ceilingDisplayKey);
    if (!c || c.getItem(selected)?.typeId !== definition)
        return;
    const angle = screenYaw(definition, { x: block.location.x + .5, z: block.location.z + .5 }, p.location, p.getRotation().y);
    const r = { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...block.location }, kind: 'surface', mount: 'ceiling', definition, direction: 'south', native: false, slots: [], yaw: angle };
    // facingFromYaw is the same client contract used by the final display.
    r.direction = { 1: 'north', 2: 'east', 3: 'south', 4: 'west' }[facingFromYaw(angle)];
    if (!near(p, r) || ceilingFits(r) !== true)
        return;
    const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, selected, definition);
    if (!plan.ok)
        return;
    try {
        save(r);
        io.commit(c, before, plan.slots);
        synchronize(r);
    }
    catch (error) {
        restore(c, before);
        if (records.has(r.uid))
            removeDecor(r, false);
        throw error;
    }
}
function isPanel(r) { return r.kind === 'ad' || r.kind === 'digital_ad' || !!r.wallFace; }
function panelSize(r) {
    if (r.kind === 'digital_ad') {
        const d = digitalById.get(r.definition);
        return d ? [d.width, d.height] : [0, 0];
    }
    if (r.kind === 'ad') {
        const ad = advertisements.find(a => a.key === r.art);
        return ad ? adSize(ad, r.size ?? 0) : [0, 0];
    }
    return [1, 1];
}
function posterCells(r) {
    const [w, h] = panelSize(r), right = rights[r.wallFace ?? r.direction];
    if (!right)
        return [];
    const cells = [];
    for (let x = 0; x < w; x++)
        for (let y = 0; y < h; y++)
            cells.push(add(add(r.support, right, x), { x: 0, y: 1, z: 0 }, y));
    return cells;
}
function occupiedCells(r) {
    if (r.mount === 'ceiling')
        return ceilingSupports(r).flatMap(p => [add(p, { x: 0, y: -1, z: 0 }), add(p, { x: 0, y: -2, z: 0 })]);
    if (isPanel(r)) {
        const n = normals[r.wallFace ?? r.direction];
        return n ? posterCells(r).map(p => add(p, n)) : [];
    }
    if (r.kind === 'appliance')
        return applianceCells(r);
    // Catalog heights are integral; full/slab/stair tops occupy the same cells.
    // Never read every other record's support (possibly unloaded) for an overlap test.
    const count = Math.max(1, Math.ceil(scenarioById.get(r.definition)?.height ?? 1));
    return Array.from({ length: count }, (_, i) => add(r.support, { x: 0, y: i + 1, z: 0 }));
}
function overlaps(r) {
    return occupiedCells(r).some(p => { for (const uid of occupancy.get(cellKey(r.dimension, p)) ?? [])
        if (uid !== r.uid)
            return true; return false; });
}
export function adFits(r) {
    const cells = posterCells(r), n = normals[r.wallFace ?? r.direction];
    if (!cells.length || !n)
        return false;
    for (const p of cells) {
        const wall = safeBlock(r, p), front = safeBlock(r, add(p, n));
        if (!wall || !front)
            return undefined;
        if (!isWallSupport(wall) || !empty(front))
            return false;
    }
    return !overlaps(r);
}
function visuals(r) { return dim(r).getEntities({ families: ['mcpe_food_display'], location: r.support, maxDistance: 8 }).filter(e => e.getDynamicProperty('mcpe_food:owner') === r.uid); }
function visual(r, type, part, index, position, entities) {
    const existing = entities.filter(e => e.isValid && e.getDynamicProperty('mcpe_food:part') === part && e.typeId === type);
    const found = existing.shift(), entity = found ?? dim(r).spawnEntity(type, position);
    if (!found)
        entities.push(entity);
    for (const duplicate of existing)
        duplicate.remove();
    if (entity.getDynamicProperty('mcpe_food:owner') !== r.uid)
        entity.setDynamicProperty('mcpe_food:owner', r.uid);
    if (entity.getDynamicProperty('mcpe_food:part') !== part)
        entity.setDynamicProperty('mcpe_food:part', part);
    if (entity.getProperty('mcpe_food:index') !== index)
        entity.setProperty('mcpe_food:index', index);
    if (type === 'mcpe_food:surface_display' && !r.wallFace) {
        const device = electronicsById.get(r.definition) ?? scenarioById.get(r.definition) ?? [...restaurantAccessories, ...lifestyleItems].find(d => id(d.key) === r.definition);
        const shape = device ? device.key : r.kind === 'tray' || /chopsticks|table_knife|fork|spoon/.test(r.definition) ? 'flat' : /wine_glass|hotpot|bottle/.test(r.definition) ? 'tall' : 'medium';
        if (entity.getDynamicProperty('mcpe_food:shape') !== shape) {
            entity.triggerEvent(`mcpe_food:shape_${shape}`);
            entity.setDynamicProperty('mcpe_food:shape', shape);
        }
    }
    if (r.kind === 'ad' && entity.getProperty('mcpe_food:size') !== (r.size ?? 0))
        entity.setProperty('mcpe_food:size', r.size ?? 0);
    // Explicit facing is display-only: saved direction, yaw and revision stay intact.
    const explicit = !!r.wallFace || r.kind === 'digital_ad' || r.definition === id('supermarket_checkout') || patch072ById.has(r.definition) || patch073ById.has(r.definition) || patch074ById.has(r.definition) || patch080ById.has(r.definition) || patch082ById.has(r.definition) || r.kind === 'clothing_rack';
    if (type !== 'mcpe_food:advert_display' && type !== 'mcpe_food:tray_food_display') {
        const code = explicit ? (isPanel(r) ? displayFacing(r.wallFace ?? r.direction) : facingFromYaw(r.yaw ?? yaw[r.direction] ?? 0)) : 0;
        if (entity.getProperty('mcpe_food:display_facing') !== code)
            entity.setProperty('mcpe_food:display_facing', code);
    }
    // Wall meshes use local -Z as their visible front. Native entity yaw turns
    // clockwise; east/west therefore invert the legacy block-facing table.
    // Preserve the saved direction/yaw: this is only the display transform.
    const facing = r.wallFace || r.kind === 'digital_ad' ? -(yaw[r.wallFace ?? r.direction] ?? 0) : r.yaw ?? yaw[r.direction] ?? 0;
    if (!found || !same(entity.location, position) || entity.getDynamicProperty('mcpe_food:yaw') !== facing) {
        entity.teleport(position, { rotation: { x: 0, y: facing } });
        entity.setDynamicProperty('mcpe_food:yaw', facing);
    }
    return entity;
}
export function synchronize(r) {
    if (surfaceValid(r) === true)
        synchronizeValidated(r);
}
/** Only call after successful support validation in the same synchronous operation. */
function synchronizeValidated(r) {
    if (r.kind === 'appliance')
        return;
    const wanted = new Set(), entities = visuals(r);
    if (r.mount === 'ceiling') {
        const right = rights[r.direction];
        visual(r, 'mcpe_food:surface_display', 'base', surfaceIndex.get(r.definition), add({ x: r.support.x + .5, y: r.support.y - 2, z: r.support.z + .5 }, right, .5), entities);
        wanted.add('base');
    }
    else if (r.kind === 'digital_ad') {
        const d = digitalById.get(r.definition);
        const n = normals[r.direction], right = rights[r.direction];
        visual(r, 'mcpe_food:digital_ad_display', 'screen', wallScreens.indexOf(d), add(add({ x: r.support.x + .5, y: r.support.y, z: r.support.z + .5 }, right, (d.width - 1) / 2), n, .505), entities);
        wanted.add('screen');
    }
    else if (r.wallFace) {
        const n = normals[r.wallFace];
        visual(r, 'mcpe_food:surface_display', 'base', surfaceIndex.get(id(wallById.get(r.definition))), add({ x: r.support.x + .5, y: r.support.y, z: r.support.z + .5 }, n, .505), entities);
        wanted.add('base');
    }
    else if (r.kind === 'ad') {
        const ad = advertisements.find(a => a.key === r.art);
        const [w] = adSize(ad, r.size ?? 0), n = normals[r.direction], right = rights[r.direction];
        const p = add(add({ x: r.support.x + .5, y: r.support.y, z: r.support.z + .5 }, right, (w - 1) / 2), n, .521);
        visual(r, 'mcpe_food:advert_display', 'poster', advertisements.indexOf(ad), p, entities);
        wanted.add('poster');
    }
    else {
        const height = surfaceHeight(safeBlock(r)), p = { x: r.support.x + .5, y: r.support.y + height, z: r.support.z + .5 };
        if (!r.native) {
            const index = surfaceIndex.get(r.definition === id('table_number_sign') ? id(numberKey(validTableNumber(r.tableNumber) ? r.tableNumber : 8)) : r.definition);
            if (index === undefined)
                throw new Error('Unknown surface visual');
            visual(r, 'mcpe_food:surface_display', 'base', index, p, entities);
            wanted.add('base');
        }
        if (r.kind === 'clothing_rack') {
            const spec = rackById.get(r.definition);
            for (let slot = 0; slot < spec.capacity; slot++) {
                const key = r.slots[slot];
                if (!key)
                    continue;
                const index = clothingVisuals.findIndex(v => id(v.key) === key && v.pose === spec.pose && v.slot === slot);
                if (index < 0)
                    throw new Error('Unknown garment pose');
                visual(r, 'mcpe_food:clothing_display', `garment${slot}`, index, p, entities);
                wanted.add(`garment${slot}`);
            }
        }
        if (r.kind === 'tray')
            for (let slot = 0; slot < 3; slot++) {
                const key = r.slots[slot];
                if (!key)
                    continue;
                const index = trayFoods.findIndex(f => id(f.key) === key);
                if (index < 0)
                    throw new Error('Unknown tray food');
                const angle = (yaw[r.direction] ?? 0) * Math.PI / 180, offset = (slot - 1) * 4.6 / 16;
                visual(r, 'mcpe_food:tray_food_display', `slot${slot}`, index, { x: p.x + Math.cos(angle) * offset, y: p.y, z: p.z - Math.sin(angle) * offset }, entities);
                wanted.add(`slot${slot}`);
            }
    }
    for (const e of entities)
        if (e.isValid && !wanted.has(String(e.getDynamicProperty('mcpe_food:part'))))
            e.remove();
}
function restore(c, before) { before.originals.forEach((s, i) => c.setItem(i, s)); }
function change(p, old, next, plan) {
    if (!plan.ok) {
        io.notify(p, '背包空间不足或手持物已变化。', 'Inventory full or held item changed.');
        return false;
    }
    const c = io.inventory(p);
    if (!c || locks.has(old.uid) || !assertCurrent(p, old))
        return false;
    const before = io.snapshot(c);
    locks.add(old.uid);
    try {
        io.commit(c, before, plan.slots);
        save(next);
        synchronize(next);
        return true;
    }
    catch (error) {
        restore(c, before);
        save(old);
        try {
            synchronize(old);
        }
        catch { }
        throw error;
    }
    finally {
        locks.delete(old.uid);
    }
}
function drops(r) {
    if (r.kind === 'ad')
        return [id(r.art)];
    if (r.kind === 'clothing_rack')
        return [r.definition, ...r.slots.filter((s) => !!s)];
    if (r.kind === 'tray')
        return [id(tray.key), ...r.slots.filter((s) => !!s)];
    const serving = foodByServing.get(r.definition);
    return serving ? [id(serving.vessel.key), id(serving.food.key)] : [r.definition];
}
export function removeDecor(requested, drop) {
    const r = records.get(requested.uid);
    if (!r || locks.has(r.uid))
        return;
    locks.add(r.uid);
    const spawned = [], changed = [];
    try {
        if (r.kind === 'appliance') {
            const cells = applianceCells(r);
            for (const child of [...records.values()])
                if (child.uid !== r.uid && child.dimension === r.dimension && ((child.kind !== 'ad' && cells.some(p => same(p, child.support))) || (isPanel(child) && posterCells(child).some(p => cells.some(c => same(p, c))))))
                    removeDecor(child, drop);
        }
        if (drop)
            for (const key of drops(r))
                spawned.push(dim(r).spawnItem(new ItemStack(key), { x: r.support.x + .5, y: r.support.y + (r.mount === 'ceiling' ? -1 : 1), z: r.support.z + .5 }));
        if (r.kind === 'appliance')
            for (const [i, p] of applianceCells(r).entries()) {
                const block = safeBlock(r, p);
                if (block?.typeId === (i === 0 ? r.definition : r.definition + '_upper')) {
                    changed.push({ block, permutation: block.permutation });
                    block.setPermutation(BlockPermutation.resolve('minecraft:air'));
                }
            }
        if (r.native && safeBlock(r, anchor(r))?.typeId === id(tray.key))
            safeBlock(r, anchor(r)).setPermutation(BlockPermutation.resolve('minecraft:air'));
        world.setDynamicProperty(storageKey(r));
        forgetRecord(r.uid);
        for (const e of visuals(r))
            e.remove();
    }
    catch (error) {
        for (const e of spawned)
            if (e.isValid)
                e.remove();
        for (const c of changed)
            c.block.setPermutation(c.permutation);
        if (r.kind === 'tray' && r.native && safeBlock(r, anchor(r)))
            safeBlock(r, anchor(r)).setPermutation(BlockPermutation.resolve(id(tray.key), { 'minecraft:cardinal_direction': r.direction }));
        save(r);
        throw error;
    }
    finally {
        locks.delete(r.uid);
    }
}
async function trayMenu(p, r) {
    if (!click(p, r.uid))
        return;
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    const c = io.inventory(p), slotIndex = p.selectedSlotIndex, hand = c?.getItem(slotIndex), food = hand && foodById.get(hand.typeId), english = p.hasTag('food_english');
    try {
        if (hand && !trayFoods.some(f => id(f.key) === hand.typeId)) {
            io.notify(p, '托盘只接受盘装料理和盘装展示配菜。', 'This tray accepts plate dishes and display platters.');
            return;
        }
        const form = new ActionFormData().title(english ? 'Three Dish Tray' : '三菜连体托盘').body(hand ? (english ? 'Select an empty plate.' : '选择一个空盘盛装。') : (english ? 'Select a dish to take.' : '选择一道料理取回。'));
        for (let i = 0; i < 3; i++) {
            const entry = r.slots[i], info = entry && foodById.get(entry);
            form.button(`${(english ? ['Left', 'Middle', 'Right'] : ['左盘', '中盘', '右盘'])[i]} · ${info ? (english ? info.en : info.zh) : (english ? 'Empty' : '空盘')}`);
        }
        const response = await form.show(p), i = response.selection;
        if (response.canceled || i === undefined || i < 0 || i > 2 || !io.sessions.claim(p.id, token) || !assertCurrent(p, r))
            return;
        if (p.selectedSlotIndex !== slotIndex)
            return;
        const current = c?.getItem(slotIndex);
        if (current?.typeId !== hand?.typeId)
            return;
        const next = copy(r);
        next.revision++;
        let plan;
        if (food && hand) {
            if (r.slots[i])
                return;
            plan = planServe(io.snapshot(c).slots, slotIndex, hand.typeId);
            next.slots[i] = hand.typeId;
        }
        else {
            const item = r.slots[i];
            if (!item)
                return;
            plan = planInsert(io.snapshot(c).slots, item, 1, new ItemStack(item).maxAmount);
            next.slots[i] = null;
        }
        change(p, r, next, plan);
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
/** Plans every refund before committing anything. No await occurs inside the write phase. */
async function clothingMenu(p, r) {
    if (!click(p, r.uid) || !assertCurrent(p, r))
        return;
    const c = io.inventory(p), selected = p.selectedSlotIndex, hand = c?.getItem(selected), spec = rackById.get(r.definition);
    if (!c || !spec)
        return;
    const garment = hand && clothingById.get(hand.typeId);
    if (hand && (!garment || (!spec.allowHat && garment.style === 'hat'))) {
        io.notify(p, '此展示架不接受该物品。', 'This rack does not accept that item.');
        return;
    }
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    try {
        const form = new ActionFormData().title('服装陈列 / Clothing Display').body(hand ? '选择空槽放入1件服装。' : '选择服装取回，或收回整架。');
        for (let i = 0; i < spec.capacity; i++)
            form.button(`${i + 1} · ${clothingById.get(r.slots[i] ?? '')?.zh ?? '空槽 / Empty'}`);
        if (!hand)
            form.button('收回整架（返还全部服装） / Collect rack');
        const response = await form.show(p), choice = response.selection;
        if (response.canceled || choice === undefined || !Number.isInteger(choice) || choice < 0 || choice > spec.capacity || p.selectedSlotIndex !== selected || c.getItem(selected)?.typeId !== hand?.typeId || !io.sessions.claim(p.id, token) || !assertCurrent(p, r))
            return;
        if (choice === spec.capacity) {
            if (hand || locks.has(r.uid))
                return;
            const before = io.snapshot(c);
            let slots = before.slots;
            for (const key of [...r.slots.filter((k) => !!k), ...(!isCreative(p) ? [r.definition] : [])]) {
                const plan = planInsert(slots, key, 1, new ItemStack(key).maxAmount);
                if (!plan.ok) {
                    io.notify(p, '背包不足，展示架与服装保持原状。', 'Inventory full; rack and clothing unchanged.');
                    return;
                }
                slots = plan.slots;
            }
            try {
                io.commit(c, before, slots);
                removeDecor(r, false);
            }
            catch (error) {
                restore(c, before);
                throw error;
            }
            return;
        }
        const next = copy(r);
        next.revision++;
        let plan;
        if (hand) {
            if (r.slots[choice])
                return;
            plan = planServe(io.snapshot(c).slots, selected, hand.typeId);
            next.slots[choice] = hand.typeId;
        }
        else {
            const key = r.slots[choice];
            if (!key)
                return;
            plan = planInsert(io.snapshot(c).slots, key, 1, new ItemStack(key).maxAmount);
            next.slots[choice] = null;
        }
        change(p, r, next, plan);
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
async function numberMenu(p, r) {
    if (!click(p, r.uid) || !assertCurrent(p, r))
        return;
    const c = io.inventory(p);
    if (!c || c.getItem(p.selectedSlotIndex))
        return;
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    const english = p.hasTag('food_english'), empty = () => !c.getItem(p.selectedSlotIndex);
    try {
        const choice = await new ActionFormData().title(english ? 'Table Number' : '桌号牌').button(english ? 'Change number' : '修改号码').button(english ? 'Collect sign' : '收回桌号牌').show(p);
        if (choice.canceled || !assertCurrent(p, r) || !empty())
            return;
        if (choice.selection === 1) {
            if (!io.sessions.claim(p.id, token))
                return;
            const plan = planInsert(io.snapshot(c).slots, r.definition, 1, new ItemStack(r.definition).maxAmount);
            if (!plan.ok)
                return;
            const before = io.snapshot(c);
            try {
                io.commit(c, before, plan.slots);
                removeDecor(r, false);
            }
            catch (error) {
                restore(c, before);
                throw error;
            }
            return;
        }
        if (choice.selection !== 0)
            return;
        const n = validTableNumber(r.tableNumber) ? r.tableNumber : 8, digits = Array.from({ length: 10 }, (_, i) => String(i));
        const response = await new ModalFormData().title(english ? 'Table 01–99' : '桌号01—99').dropdown(english ? 'Tens' : '十位', digits, { defaultValueIndex: Math.floor(n / 10) }).dropdown(english ? 'Units' : '个位', digits, { defaultValueIndex: n % 10 }).show(p);
        if (response.canceled || !assertCurrent(p, r) || !empty() || !io.sessions.claim(p.id, token))
            return;
        const [t, u] = response.formValues ?? [];
        if (typeof t !== 'number' || typeof u !== 'number' || !Number.isInteger(t) || !Number.isInteger(u) || t < 0 || t > 9 || u < 0 || u > 9)
            return;
        const number = t * 10 + u;
        if (!validTableNumber(number)) {
            io.notify(p, '桌号必须是01至99。', 'Choose a number from 01 to 99.');
            return;
        }
        const next = copy(r);
        next.tableNumber = number;
        next.revision++;
        change(p, r, next, { ok: true, slots: io.snapshot(c).slots });
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
async function staticMenu(p, r) {
    if (!click(p, r.uid) || !assertCurrent(p, r))
        return;
    const c = io.inventory(p), selected = p.selectedSlotIndex;
    if (!c || c.getItem(selected))
        return;
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    try {
        const response = await new ActionFormData().title('收回摆件 / Collect display').button('收回 / Collect').show(p);
        if (response.canceled || response.selection !== 0 || p.selectedSlotIndex !== selected || c.getItem(selected) || !io.sessions.claim(p.id, token) || !assertCurrent(p, r))
            return;
        const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planInsert(before.slots, r.definition, 1, new ItemStack(r.definition).maxAmount);
        if (!plan.ok)
            return;
        try {
            io.commit(c, before, plan.slots);
            removeDecor(r, false);
        }
        catch (error) {
            restore(c, before);
            throw error;
        }
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
function createWall(p, block, definition, face) {
    if (!p.isValid || !normals[face])
        return;
    const c = io.inventory(p), selected = p.selectedSlotIndex;
    if (!c || c.getItem(selected)?.typeId !== definition)
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...block.location }, kind: digitalById.has(definition) ? 'digital_ad' : 'surface', definition, direction: face, native: false, slots: [], ...(digitalById.has(definition) ? {} : { wallFace: face }) };
    if (!near(p, r) || adFits(r) !== true)
        return;
    const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, selected, definition);
    if (!plan.ok)
        return;
    try {
        save(r);
        io.commit(c, before, plan.slots);
        synchronize(r);
    }
    catch (error) {
        restore(c, before);
        if (records.has(r.uid))
            removeDecor(r, false);
        throw error;
    }
}
function surfaceInteract(p, r) {
    if (r.kind === 'clothing_rack')
        return clothingMenu(p, r);
    if (scenarioById.has(r.definition) || r.wallFace || r.kind === 'digital_ad' || ['mcpe_food:landscape_frame', 'mcpe_food:table_clock'].includes(r.definition))
        return staticMenu(p, r);
    if (!click(p, r.uid) || !assertCurrent(p, r))
        return;
    const c = io.inventory(p);
    if (!c)
        return;
    const hand = c.getItem(p.selectedSlotIndex), served = foodByServing.get(r.definition), next = copy(r);
    next.revision++;
    if (served) {
        if (hand)
            return;
        next.definition = id(served.vessel.key);
        change(p, r, next, planInsert(io.snapshot(c).slots, id(served.food.key), 1, new ItemStack(id(served.food.key)).maxAmount));
        return;
    }
    const vessel = vesselByKey.get(r.definition.replace('mcpe_food:', '')), food = hand && foodById.get(hand.typeId);
    if (!vessel || !food || !compatibleVessels(food).some(v => v.key === vessel.key))
        return;
    next.definition = id(servingKey(food, vessel.key));
    change(p, r, next, planServe(io.snapshot(c).slots, p.selectedSlotIndex, hand.typeId));
}
async function posterMenu(p, r, placing = false) {
    if (!placing && !click(p, r.uid))
        return;
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    const ad = advertisements.find(a => a.key === r.art), c = io.inventory(p), selected = p.selectedSlotIndex, english = p.hasTag('food_english');
    if (!c) {
        io.sessions.finish(p.id, token);
        return;
    }
    try {
        const form = new ActionFormData().title(english ? ad.en : ad.zh).body(english ? 'Choose size; the clicked wall block is the lower-left anchor.' : '选择尺寸；点击的墙面方块是画面左下角。');
        for (let s = 0; s < 3; s++) {
            const [w, h] = adSize(ad, s);
            form.button(`${(english ? ['Small', 'Medium', 'Large'] : ['小', '中', '大'])[s]} · ${w}×${h}`);
        }
        if (!placing)
            form.button(english ? 'Take back' : '收回广告画');
        const response = await form.show(p), choice = response.selection;
        if (response.canceled || choice === undefined || !io.sessions.claim(p.id, token) || !near(p, r))
            return;
        if (!placing && !assertCurrent(p, r))
            return;
        if (choice === 3 && !placing) {
            const plan = planInsert(io.snapshot(c).slots, id(ad.key), 1, new ItemStack(id(ad.key)).maxAmount);
            if (!plan.ok) {
                io.notify(p, '背包已满，广告画保持原状。', 'Inventory full; the poster stays.');
                return;
            }
            const before = io.snapshot(c);
            try {
                io.commit(c, before, plan.slots);
                removeDecor(r, false);
            }
            catch (error) {
                restore(c, before);
                throw error;
            }
            return;
        }
        if (choice < 0 || choice > 2)
            return;
        const next = copy(r);
        next.size = choice;
        next.revision++;
        if (adFits(next) !== true) {
            io.notify(p, '背墙、前方空间不足，或与其他广告画重叠。', 'Missing backing, blocked space, or overlapping poster.');
            return;
        }
        if (placing) {
            if (p.selectedSlotIndex !== selected || c.getItem(selected)?.typeId !== id(ad.key))
                return;
            const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, selected, id(ad.key));
            if (!plan.ok)
                return;
            try {
                io.commit(c, before, plan.slots);
                save(next);
                synchronize(next);
            }
            catch (error) {
                restore(c, before);
                if (records.has(next.uid))
                    removeDecor(next, false);
                throw error;
            }
        }
        else
            change(p, r, next, { ok: true, slots: io.snapshot(c).slots });
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
function direction(p) { const angle = ((p.getRotation().y % 360) + 360) % 360; return angle < 45 || angle >= 315 ? 'south' : angle < 135 ? 'west' : angle < 225 ? 'north' : 'east'; }
function createSurface(p, support, definition) {
    const height = surfaceHeight(support), c = io.inventory(p);
    if (definition === id(ceilingDisplayKey) || scenarioById.get(definition)?.wallOnly || !height || !c || recordForSupport(support.dimension.id, support.location))
        return;
    const target = support.dimension.getBlock(add(support.location, { x: 0, y: 1, z: 0 }));
    if (!empty(target))
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: support.dimension.id, support: { ...support.location }, kind: rackById.has(definition) ? 'clothing_rack' : definition === id(tray.key) ? 'tray' : 'surface', definition, direction: direction(p), native: definition === id(tray.key) && height === 1, slots: Array.from({ length: rackById.get(definition)?.capacity ?? 3 }, () => null) };
    r.yaw = screenYaw(definition, { x: support.location.x + .5, z: support.location.z + .5 }, p.location, p.getRotation().y);
    if (!near(p, r) || surfaceValid({ ...r, native: false }) !== true)
        return;
    const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, p.selectedSlotIndex, definition);
    if (!plan.ok)
        return;
    // Publish the owner first: an engine onPlace callback must reuse this same
    // instance rather than creating a second persistent tray at the same anchor.
    try {
        save(r);
        if (r.native)
            target.setPermutation(BlockPermutation.resolve(definition, { 'minecraft:cardinal_direction': r.direction }));
        io.commit(c, before, plan.slots);
        synchronize(r);
    }
    catch (error) {
        restore(c, before);
        if (records.has(r.uid))
            removeDecor(r, false);
        if (r.native)
            target.setPermutation(BlockPermutation.resolve('minecraft:air'));
        throw error;
    }
}
export function nativeTray(block) {
    const support = block.below(), previous = recordForSupport(block.dimension.id, support.location);
    if (previous)
        return previous;
    const r = { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...support.location }, kind: 'tray', definition: id(tray.key), direction: String(block.permutation.getState('minecraft:cardinal_direction') ?? 'north'), native: true, slots: [null, null, null] };
    save(r);
    return r;
}
export function applianceCells(r) { return Array.from({ length: refrigeratorById.get(r.definition)?.height ?? 1 }, (_, i) => add(r.support, { x: 0, y: 1, z: 0 }, i + 1)); }
function createAppliance(p, support, definition) {
    const info = refrigeratorById.get(definition), c = io.inventory(p);
    if (!info || !c || surfaceHeight(support) !== 1 || recordForSupport(support.dimension.id, support.location))
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: support.dimension.id, support: { ...support.location }, kind: 'appliance', definition, direction: direction(p), native: false, slots: [] };
    if (!near(p, r))
        return;
    const blocks = applianceCells(r).map(pos => safeBlock(r, pos));
    if (blocks.some(b => !empty(b)))
        return;
    if (overlaps(r))
        return;
    const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, p.selectedSlotIndex, definition);
    if (!plan.ok)
        return;
    const original = blocks.map(b => b.permutation);
    try {
        save(r);
        blocks.forEach((b, i) => b.setPermutation(BlockPermutation.resolve(i === 0 ? definition : definition + '_upper', { 'minecraft:cardinal_direction': r.direction })));
        io.commit(c, before, plan.slots);
    }
    catch (error) {
        restore(c, before);
        blocks.forEach((b, i) => b.setPermutation(original[i]));
        world.setDynamicProperty(storageKey(r));
        forgetRecord(r.uid);
        throw error;
    }
}
/** Tick recovery for commands/orphan helper parts; ordinary placement publishes its owner first. */
export function applianceTick(block) {
    if (loading)
        return;
    const owned = [...(occupancy.get(cellKey(block.dimension.id, block.location)) ?? [])].map(uid => records.get(uid)).find(r => r?.kind === 'appliance');
    if (owned) {
        if (surfaceValid(owned) === false)
            removeDecor(owned, true);
        return;
    }
    if (block.typeId.endsWith('_upper')) {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        return;
    }
    const info = refrigeratorById.get(block.typeId), support = block.below();
    if (!info || !support)
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...support.location }, kind: 'appliance', definition: block.typeId, direction: String(block.permutation.getState('minecraft:cardinal_direction') ?? 'north'), native: false, slots: [] };
    if (surfaceHeight(support) !== 1) {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        return;
    }
    const upper = info.height === 2 ? safeBlock(r, applianceCells(r)[1]) : undefined;
    if (info.height === 2 && !upper)
        return;
    if (upper && !empty(upper)) {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        return;
    }
    save(r);
    if (upper)
        upper.setPermutation(BlockPermutation.resolve(r.definition + '_upper', { 'minecraft:cardinal_direction': r.direction }));
}
export function migrateLowSurface(block) {
    if (loading)
        return;
    const below = block.below();
    if (!below || surfaceHeight(below) !== .5)
        return;
    const old = block.permutation, definition = block.typeId;
    if (!surfaceIndex.has(definition))
        return;
    const existing = recordForSupport(block.dimension.id, below.location);
    const r = existing ?? { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...below.location }, kind: definition === id(tray.key) ? 'tray' : 'surface', definition, direction: String(old.getState('minecraft:cardinal_direction') ?? 'north'), native: false, slots: [null, null, null] };
    const next = { ...copy(r), native: false, revision: r.revision + 1 };
    try {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        save(next);
        synchronize(next);
    }
    catch (error) {
        block.setPermutation(old);
        if (existing)
            save(existing);
        else {
            world.setDynamicProperty(storageKey(next));
            forgetRecord(next.uid);
        }
        throw error;
    }
}
function posterAt(block, face) { return [...records.values()].find(r => isPanel(r) && r.dimension === block.dimension.id && r.direction === face && posterCells(r).some(p => same(p, block.location))); }
function run(p, work) { system.run(() => { Promise.resolve().then(work).catch(error => { console.warn(`[Food & Table] decor: ${String(error)}`); if (p.isValid)
    io.notify(p, '操作未完成，请重试。', 'Operation could not complete; please retry.'); }); }); }
export function handleDecorBlock(event) {
    // Do not publish new records or run vanilla interactions against a partial index.
    if (loading) {
        event.cancel = true;
        return true;
    }
    const p = event.player, block = event.block, face = String(event.blockFace).toLowerCase(), c = io.inventory(p), hand = c?.getItem(p.selectedSlotIndex), ad = hand && adById.get(hand.typeId);
    if (hand?.typeId === id(ceilingDisplayKey)) {
        event.cancel = true;
        if (face === 'down' && event.isFirstEvent) {
            const selected = p.selectedSlotIndex;
            run(p, () => { if (p.selectedSlotIndex === selected && io.inventory(p)?.getItem(selected)?.typeId === id(ceilingDisplayKey))
                createCeiling(p, block); });
        }
        return true;
    }
    const ceiling = face === 'down' ? [...records.values()].find(r => r.mount === 'ceiling' && r.dimension === block.dimension.id && ceilingSupports(r).some(c => same(c, block.location))) : undefined;
    if (ceiling) {
        event.cancel = true;
        if (!hand && event.isFirstEvent)
            run(p, () => staticMenu(p, copy(ceiling)));
        return true;
    }
    if (hand && clothingById.has(hand.typeId)) {
        event.cancel = true;
        return true;
    }
    const poster = posterAt(block, face);
    if (hand && (wallById.has(hand.typeId) || digitalById.has(hand.typeId)) && normals[face]) {
        event.cancel = true;
        if (event.isFirstEvent) {
            const definition = hand.typeId, selected = p.selectedSlotIndex;
            run(p, () => { if (p.selectedSlotIndex === selected && io.inventory(p)?.getItem(selected)?.typeId === definition)
                createWall(p, block, definition, face); });
        }
        return true;
    }
    if (hand && scenarioById.get(hand.typeId)?.wallOnly) {
        event.cancel = true;
        return true;
    }
    if (hand && refrigeratorById.has(hand.typeId) && face === 'up') {
        event.cancel = true;
        if (event.isFirstEvent) {
            const definition = hand.typeId;
            run(p, () => { if (io.inventory(p)?.getItem(p.selectedSlotIndex)?.typeId === definition)
                createAppliance(p, block, definition); });
        }
        return true;
    }
    if (ad && normals[face]) {
        event.cancel = true;
        if (event.isFirstEvent) {
            const r = { version: 1, uid: '', revision: 0, dimension: block.dimension.id, support: { ...block.location }, kind: 'ad', definition: id(ad.key), direction: face, native: false, slots: [], art: ad.key, size: 0 };
            run(p, () => { r.uid = unique(); return posterMenu(p, r, true); });
        }
        return true;
    }
    if (poster) {
        event.cancel = true;
        if (event.isFirstEvent && !hand)
            run(p, () => poster.kind === 'ad' ? posterMenu(p, copy(poster)) : staticMenu(p, copy(poster)));
        return true;
    }
    if (block.typeId === id(tray.key)) {
        event.cancel = true;
        if (event.isFirstEvent)
            run(p, () => trayMenu(p, copy(nativeTray(block))));
        return true;
    }
    if (hand && tableItemById.has(hand.typeId) && face === 'up' && recordForSupport(block.dimension.id, block.location)) {
        event.cancel = true;
        return true;
    }
    if (p.isSneaking && hand && tableItemById.has(hand.typeId) && !electronicsById.has(hand.typeId) && hand.typeId !== id(tray.key) && ['prep_counter', 'stove', 'oven', 'drink_counter'].some(k => block.typeId === id(k)))
        return false;
    if (hand && tableItemById.has(hand.typeId) && face === 'up' && surfaceHeight(block) > 0) {
        event.cancel = true;
        if (event.isFirstEvent) {
            const definition = hand.typeId;
            run(p, () => { if (io.inventory(p)?.getItem(p.selectedSlotIndex)?.typeId === definition)
                createSurface(p, block, definition); });
        }
        return true;
    }
    return false;
}
export function reconcileDecor() {
    if (loading)
        return;
    const start = Date.now();
    for (let n = 0; n < Math.min(2, records.size); n++) {
        if (n > 0 && Date.now() - start >= 4)
            break;
        const uid = dirtyOwners.values().next().value;
        if (uid !== undefined)
            dirtyOwners.delete(uid);
        let r = uid === undefined ? undefined : records.get(uid);
        if (!r) {
            let next = recordCursor.next();
            if (next.done) {
                recordCursor = records.values();
                next = recordCursor.next();
            }
            r = next.value;
        }
        if (!r)
            break;
        try {
            const valid = surfaceValid(r);
            if (valid === undefined)
                continue;
            if (r.native && surfaceHeight(safeBlock(r)) === .5 && safeBlock(r, anchor(r))?.typeId === id(tray.key)) {
                migrateLowSurface(safeBlock(r, anchor(r)));
                continue;
            }
            if (!valid) {
                removeDecor(r, true);
                continue;
            }
            synchronizeValidated(r);
        }
        catch (error) {
            console.warn(`[Food & Table] display reconciliation: ${String(error)}`);
        }
    }
}
export function loadDecorRecords() {
    const generation = ++loadGeneration, keys = world.getDynamicPropertyIds();
    let offset = 0;
    loading = true;
    records.clear();
    occupancy.clear();
    recordCells.clear();
    dirtyOwners.clear();
    recordCursor = records.values();
    const batch = () => {
        if (generation !== loadGeneration)
            return;
        const start = Date.now();
        for (let n = 0; n < 8 && offset < keys.length; n++) {
            const key = keys[offset++];
            if (!key.startsWith(PREFIX))
                continue;
            try {
                const r = JSON.parse(String(world.getDynamicProperty(key)));
                if (r.version === 1 && r.uid && r.support) {
                    if (r.kind === 'surface' && electronicsById.has(r.definition) && Number.isFinite(r.yaw)) {
                        const snapped = cardinalYaw(r.yaw);
                        if (snapped !== r.yaw) {
                            r.yaw = snapped;
                            r.revision++;
                            world.setDynamicProperty(storageKey(r), JSON.stringify(r));
                        }
                    }
                    rememberRecord(r);
                }
            }
            catch {
                console.warn(`[Food & Table] invalid decor record ${key}`);
            }
            if (Date.now() - start >= 4)
                break;
        }
        if (offset < keys.length)
            system.run(batch);
        else
            loading = false;
    };
    batch();
}
/** entityLoad can arrive in a burst before records are ready. Never repair inline. */
export function maintainDecor() {
    if (loading)
        return;
    const start = Date.now();
    for (let n = 0; n < 4; n++) {
        const next = loadedEntities.entries().next();
        if (next.done)
            break;
        const [uid, entity] = next.value;
        loadedEntities.delete(uid);
        try {
            if (entity.isValid) {
                const owner = entity.getDynamicProperty('mcpe_food:owner');
                if (owner) {
                    if (records.has(String(owner)))
                        dirtyOwners.add(String(owner));
                    else
                        entity.remove();
                }
            }
        }
        catch { }
        if (Date.now() - start >= 2)
            break;
    }
    reconcileDecor();
}
export function installDecor(adapter) {
    io = adapter;
    system.run(loadDecorRecords);
    world.beforeEvents.playerInteractWithEntity.subscribe(event => {
        if (loading) {
            if (event.target.typeId.startsWith('mcpe_food:'))
                event.cancel = true;
            return;
        }
        if (!event.target.isValid || !event.target.typeId.startsWith('mcpe_food:'))
            return;
        const owner = event.target.getDynamicProperty('mcpe_food:owner'), r = records.get(String(owner));
        if (!r)
            return;
        event.cancel = true;
        run(event.player, () => r.kind === 'tray' ? trayMenu(event.player, copy(r)) : r.kind === 'ad' ? posterMenu(event.player, copy(r)) : r.definition === id('table_number_sign') ? numberMenu(event.player, copy(r)) : surfaceInteract(event.player, copy(r)));
    });
    world.beforeEvents.playerBreakBlock.subscribe(event => {
        if (loading) {
            event.cancel = true;
            return;
        }
        const candidates = [...records.values()].filter(r => r.dimension === event.block.dimension.id && ((r.kind === 'appliance' && applianceCells(r).some(p => same(p, event.block.location))) || (r.native && same(anchor(r), event.block.location)) || (isPanel(r) && posterCells(r).some(p => same(p, event.block.location)))));
        const supportLost = [...records.values()].filter(r => !candidates.some(c => c.uid === r.uid) && r.dimension === event.block.dimension.id && (r.mount === 'ceiling' ? ceilingSupports(r).some(p => same(p, event.block.location)) : same(r.support, event.block.location)));
        if (!candidates.length && !supportLost.length)
            return;
        if (candidates.some(r => !isPanel(r)))
            event.cancel = true;
        run(event.player, () => { for (const r of [...candidates, ...supportLost])
            if (near(event.player, r))
                removeDecor(r, !isCreative(event.player)); });
    });
    world.afterEvents.entityHitEntity.subscribe(event => {
        if (loading)
            return;
        if (!event.hitEntity.isValid || event.damagingEntity.typeId !== 'minecraft:player')
            return;
        const owner = event.hitEntity.getDynamicProperty('mcpe_food:owner'), r = records.get(String(owner));
        if (r)
            removeDecor(r, !isCreative(event.damagingEntity));
    });
    world.afterEvents.entityLoad.subscribe(({ entity }) => {
        if (!entity.typeId.startsWith('mcpe_food:'))
            return;
        loadedEntities.set(entity.id, entity);
    });
    system.runInterval(maintainDecor, 1);
    system.runInterval(() => { for (const [k, t] of cooldowns)
        if (system.currentTick - t > 200)
            cooldowns.delete(k); }, 200);
}
