import { BlockPermutation, GameMode, ItemStack, system, world } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { compatibleVessels, menuCategories, recipeCategory, cropByBlock, foodById, foodByServing, id, label, recipes, servingKey, stations, vessels } from "./catalog.js";
import { count, MenuSessions, planCraft, planInsert, planServe } from "./inventory.js";
import { surfaceHeight } from "./supports.js";
import { handleDecorBlock, installDecor, migrateLowSurface, nativeTray, applianceTick } from './decor-runtime.js';
import { tray } from './decor-catalog.js';
const sessions = new MenuSessions();
const busyBlocks = new Set();
const cooldown = new Map();
const EN_TAG = "food_english";
const growth = (b) => Number(b.permutation.getAllStates()["mcpe_food:growth"]);
const growthPermutation = (b, age) => BlockPermutation.resolve(b.typeId, { ...b.permutation.getAllStates(), "mcpe_food:growth": age });
const tr = (p, zh, en) => p.hasTag(EN_TAG) ? en : zh;
const notify = (p, zh, en) => p.onScreenDisplay.setActionBar(tr(p, zh, en));
const inventory = (p) => p.getComponent("minecraft:inventory")?.container;
const blockKey = (b) => `${b.dimension.id}:${b.location.x},${b.location.y},${b.location.z}`;
function debounce(player, b) {
    const key = `${player.id}:${blockKey(b)}`;
    const previous = cooldown.get(key) ?? -100;
    if (system.currentTick - previous < 6)
        return false;
    cooldown.set(key, system.currentTick);
    return true;
}
function snapshot(container) {
    const originals = Array.from({ length: container.size }, (_, i) => container.getItem(i));
    return {
        originals,
        slots: originals.map((s, token) => s && ({ typeId: s.typeId, amount: s.amount,
            maxAmount: s.maxAmount, plain: s.isStackableWith(new ItemStack(s.typeId)), token }))
    };
}
/** All operations here are synchronous; restore the original slots if a write fails. */
function commit(container, before, after) {
    try {
        for (let i = 0; i < after.length; i++) {
            const s = after[i];
            if (!s) {
                if (before.originals[i])
                    container.setItem(i);
                continue;
            }
            if (s.token === i && before.originals[i]?.amount === s.amount)
                continue;
            const original = s.token === undefined ? undefined : before.originals[s.token];
            const next = original?.clone() ?? new ItemStack(s.typeId);
            next.amount = s.amount;
            container.setItem(i, next);
        }
    }
    catch (error) {
        for (let i = 0; i < before.originals.length; i++)
            container.setItem(i, before.originals[i]);
        throw error;
    }
}
function validStation(p, dimension, location, typeId) {
    if (!p.isValid || p.dimension.id !== dimension)
        return false;
    const d = p.location;
    if ((d.x - location.x - 0.5) ** 2 + (d.y - location.y - 0.5) ** 2 + (d.z - location.z - 0.5) ** 2 > 49)
        return false;
    return p.dimension.getBlock(location)?.typeId === typeId;
}
async function openKitchen(p, block, station) {
    const token = sessions.begin(p.id);
    if (token === undefined)
        return;
    const location = { ...block.location }, dimension = block.dimension.id, typeId = block.typeId;
    const english = p.hasTag(EN_TAG);
    try {
        const relevant = recipes.filter(r => r.station === station);
        const groups = Object.keys(menuCategories).filter(g => relevant.some(r => recipeCategory(r) === g));
        const stationInfo = stations.find(s => s.key === station);
        const menu = new ActionFormData().title(english ? stationInfo.en : stationInfo.zh)
            .body(tr(p, "方寸街区 · 选一道今天想做的料理。\n创造限定原料须从创造物品栏取得。", "Fangcun District · What shall we make today?\nCreative-only ingredients must be supplied from Creative inventory."));
        groups.forEach(g => menu.button(menuCategories[g][english ? 1 : 0]));
        const category = await menu.show(p);
        if (category.canceled || category.selection === undefined)
            return;
        const group = groups[category.selection];
        const choices = relevant.filter(r => recipeCategory(r) === group);
        const list = new ActionFormData().title(menuCategories[group][english ? 1 : 0]);
        choices.forEach(r => list.button(english ? r.en : r.zh, `textures/items/mcpe_food/${r.key}`));
        const selection = await list.show(p);
        if (selection.canceled || selection.selection === undefined)
            return;
        const recipe = choices[selection.selection];
        if (!recipe)
            return;
        const container = inventory(p);
        if (!container)
            return;
        const { slots } = snapshot(container);
        const detail = recipe.inputs.map(i => `${label(i.item, english)} ×${i.count}   ${english ? "Have" : "持有"}: ${count(slots, i.item)}${i.returns ? ` → ${label(i.returns, english)} ×${i.count}` : ""}`).join("\n");
        const confirmation = await new MessageFormData().title(english ? recipe.en : recipe.zh)
            .body(`${detail}\n\n${english ? "Yield" : "产出"}: ${recipe.output} ${english ? "portion(s)" : "份"}\n${tr(p, "即时制作；关闭菜单不会扣材料。", "Instant preparation. Closing does not consume ingredients.")}`)
            .button1(tr(p, "制作一份配方", "Prepare one recipe")).button2(tr(p, "取消", "Cancel")).show(p);
        if (confirmation.canceled || confirmation.selection !== 0)
            return;
        if (!sessions.claim(p.id, token))
            return;
        if (!validStation(p, dimension, location, typeId)) {
            notify(p, "厨具已移除或距离过远，请重新打开。", "Station removed or too far away. Please reopen.");
            return;
        }
        craft(p, recipe);
    }
    catch (error) {
        if (p.isValid)
            notify(p, "菜单暂不可用，请关闭聊天或其他界面后重试。", "Close chat or other screens and try again.");
        console.warn(`[Fangcun District] kitchen: ${String(error)}`);
    }
    finally {
        sessions.finish(p.id, token);
    }
}
function craft(p, recipe) {
    const container = inventory(p);
    if (!container)
        return;
    const before = snapshot(container);
    const plan = planCraft(before.slots, recipe, type => new ItemStack(type).maxAmount);
    if (!plan.ok) {
        notify(p, plan.reason === "missing" ? "材料不足，未消耗物品。" : "背包空间不足，请为成品和返还容器留出空间。", plan.reason === "missing" ? "Missing ingredients. Nothing consumed." : "Not enough room for the food and returned containers.");
        return;
    }
    commit(container, before, plan.slots);
    notify(p, `制作完成：${recipe.zh} ×${recipe.output}`, `Prepared: ${recipe.en} ×${recipe.output}`);
    p.playSound("random.orb", { volume: 0.35, pitch: 1.4 });
}
function swapVessel(block, nextId) {
    const direction = block.permutation.getState("minecraft:cardinal_direction") ?? "north";
    block.setPermutation(BlockPermutation.resolve(nextId, { "minecraft:cardinal_direction": direction }));
}
function tableInteract(p, block) {
    const key = blockKey(block);
    if (busyBlocks.has(key) || !debounce(p, block))
        return;
    busyBlocks.add(key);
    try {
        const container = inventory(p);
        if (!container)
            return;
        const hand = container.getItem(p.selectedSlotIndex);
        const served = foodByServing.get(block.typeId);
        if (served) {
            if (hand) {
                notify(p, "空手交互取餐，空餐具会留在桌上。", "Interact with an empty hand to take the serving.");
                return;
            }
            const before = snapshot(container);
            const plan = planInsert(before.slots, id(served.food.key), 1, new ItemStack(id(served.food.key)).maxAmount);
            if (!plan.ok) {
                notify(p, "背包已满，料理仍在桌上。", "Inventory full. Your serving stays on the table.");
                return;
            }
            const old = block.permutation;
            swapVessel(block, id(served.vessel.key));
            try {
                commit(container, before, plan.slots);
            }
            catch (error) {
                block.setPermutation(old);
                throw error;
            }
            notify(p, `已取餐：${served.food.zh}`, `Taken: ${served.food.en}`);
            return;
        }
        const vessel = vessels.find(v => id(v.key) === block.typeId);
        if (!vessel)
            return;
        const food = hand && foodById.get(hand.typeId);
        if (!food || !compatibleVessels(food).some(v => v.key === vessel.key)) {
            notify(p, `手持适合${vessel.zh}的成品交互即可盛装。`, `Hold a prepared dish matching this ${vessel.en.toLowerCase()}.`);
            return;
        }
        const before = snapshot(container);
        const plan = planServe(before.slots, p.selectedSlotIndex, id(food.key));
        if (!plan.ok)
            return;
        const old = block.permutation;
        swapVessel(block, id(servingKey(food, vessel.key)));
        try {
            commit(container, before, plan.slots);
        }
        catch (error) {
            block.setPermutation(old);
            throw error;
        }
        notify(p, `已盛装：${food.zh}`, `Served: ${food.en}`);
    }
    catch (error) {
        console.warn(`[Fangcun District] table: ${String(error)}`);
    }
    finally {
        busyBlocks.delete(key);
    }
}
function cropInteract(p, b) {
    const crop = cropByBlock.get(b.typeId);
    if (!crop || !debounce(p, b))
        return;
    const age = growth(b);
    const container = inventory(p);
    if (!container)
        return;
    const hand = container.getItem(p.selectedSlotIndex);
    if (hand?.typeId === "minecraft:bone_meal" && age < 3) {
        const next = growthPermutation(b, Math.min(3, age + 1));
        if (p.getGameMode() !== GameMode.Creative) {
            if (hand.amount === 1)
                container.setItem(p.selectedSlotIndex);
            else {
                hand.amount--;
                container.setItem(p.selectedSlotIndex, hand);
            }
        }
        b.setPermutation(next);
        p.playSound("item.bone_meal.use", { volume: 0.5 });
    }
    else if (age === 3) {
        // Reset first: another player cannot harvest the same mature state twice.
        b.setPermutation(growthPermutation(b, 0));
        const drop = { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 };
        b.dimension.spawnItem(new ItemStack(id(crop.key), 2), drop);
        b.dimension.spawnItem(new ItemStack(id(`${crop.key}_seeds`), 1), drop);
        notify(p, `收获${crop.produceZh}，植株已留种再生。`, `${crop.produceEn} harvested; the plant will regrow.`);
    }
    else {
        notify(p, `${crop.zh}生长阶段 ${age + 1}/4，可用骨粉催熟。`, `${crop.en} growth ${age + 1}/4. Bone meal accelerates growth.`);
    }
}
system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('mcpe_food:appliance', { onTick({ block }) { applianceTick(block); } });
    event.blockComponentRegistry.registerCustomComponent("mcpe_food:kitchen", {
        onPlayerInteract({ player, block }) {
            if (!player || player.isSneaking || !debounce(player, block))
                return;
            const station = stations.find(s => id(s.key) === block.typeId);
            if (station)
                void openKitchen(player, block, station.key);
        }
    });
    event.blockComponentRegistry.registerCustomComponent("mcpe_food:table", {
        beforeOnPlayerPlace(event) {
            if (surfaceHeight(event.block.below()) !== 1)
                event.cancel = true;
        },
        onPlayerInteract({ player, block }) { if (player && !player.isSneaking)
            tableInteract(player, block); },
        onPlace({ block }) { if (block.typeId === id(tray.key))
            nativeTray(block); },
        onTick({ block }) { migrateLowSurface(block); }
    });
    event.blockComponentRegistry.registerCustomComponent("mcpe_food:crop", {
        onRandomTick({ block }) {
            const age = growth(block);
            if (age < 3 && Math.random() < 0.45)
                block.setPermutation(growthPermutation(block, age + 1));
        },
        onPlayerInteract({ player, block }) { if (player && !player.isSneaking)
            cropInteract(player, block); }
    });
});
world.afterEvents.playerLeave.subscribe(({ playerId }) => sessions.finish(playerId));
// Cancel native item use first: serving must not also eat the held food, drink a
// milk bucket, or place the held block. Re-read the world in the next writable tick.
world.beforeEvents.playerInteractWithBlock.subscribe(event => {
    if (handleDecorBlock(event))
        return;
    if (event.player.isSneaking)
        return; // Preserve vanilla sneak-place on a counter top.
    const initialType = event.block.typeId;
    const isTable = foodByServing.has(initialType) || vessels.some(v => id(v.key) === initialType);
    const station = stations.find(s => id(s.key) === initialType);
    if (!isTable && !station && !cropByBlock.has(initialType))
        return;
    event.cancel = true;
    if (!event.isFirstEvent)
        return;
    const p = event.player, location = { ...event.block.location }, dimension = event.block.dimension;
    system.run(() => {
        try {
            if (!validStation(p, dimension.id, location, initialType))
                return;
            const b = dimension.getBlock(location);
            if (!b)
                return;
            if (isTable)
                tableInteract(p, b);
            else if (station) {
                if (debounce(p, b))
                    void openKitchen(p, b, station.key);
            }
            else
                cropInteract(p, b);
        }
        catch (error) {
            console.warn(`[Fangcun District] interaction: ${String(error)}`);
        }
    });
});
system.runInterval(() => {
    for (const [key, tick] of cooldown)
        if (system.currentTick - tick > 200)
            cooldown.delete(key);
}, 200);
installDecor({ inventory, snapshot, commit, notify, sessions });
