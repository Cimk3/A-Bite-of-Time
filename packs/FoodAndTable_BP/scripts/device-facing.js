import { patch090ById } from './patch-090-catalog.js';
import { patch082ById } from './patch-082-catalog.js';
import { patch085ById } from './patch-085-catalog.js';
import { patch080ById } from './patch-080-catalog.js';
import { patch074ById } from './patch-074-catalog.js';
import { patch073ById } from './patch-073-catalog.js';
import { patch072ById } from './patch-072-catalog.js';
import { patch071ById } from './patch-071-catalog.js';
import { scenarioById } from './scenario-catalog.js';
import { lifestyleItems } from './lifestyle-catalog.js';
import { restaurantAccessories } from './restaurant-catalog.js';
import { electronicsById } from './electronics-catalog.js';
export function cardinalYaw(value) { return ((Math.round(value / 90) * 90 + 180) % 360 + 360) % 360 - 180; }
/** Entity model +Z faces world -Z at yaw=0. Block and poster yaw are separate. */
export function screenYaw(definition, center, player, lookYaw) {
    const d = electronicsById.get(definition) ?? patch071ById.get(definition) ?? patch072ById.get(definition) ?? patch073ById.get(definition) ?? patch074ById.get(definition) ?? patch080ById.get(definition) ?? patch082ById.get(definition) ?? patch085ById.get(definition) ?? (patch090ById.has(definition) ? { placementFront: patch090ById.get(definition)?.placementFront ?? 0 } : undefined) ?? (scenarioById.has(definition) ? { placementFront: 180 } : undefined) ?? ([...restaurantAccessories, ...lifestyleItems.filter(d => d.front)].some(d => 'mcpe_food:' + d.key === definition) ? { placementFront: 180 } : undefined);
    if (d?.placementFront === undefined)
        return undefined;
    const dx = player.x - center.x, dz = player.z - center.z;
    const target = Math.hypot(dx, dz) < .0001 ? lookYaw + 180 : Math.atan2(-dx, dz) * 180 / Math.PI;
    return cardinalYaw(target - d.placementFront);
}
/** World-space normal of a screen, used by orientation tests and previews. */
export function screenNormal(yaw, front = 180) { const t = (yaw + front) * Math.PI / 180; return { x: -Math.sin(t), z: Math.cos(t) }; }
/** Explicit client contract: 0 legacy; 1 north, 2 east, 3 south, 4 west.
 * A Bedrock entity's local -Z front faces south at body yaw=0. */
export function displayFacing(direction) { return { north: 1, east: 2, south: 3, west: 4 }[direction] ?? 0; }
export function facingFromYaw(value) { return [3, 4, 1, 2][((Math.round(value / 90) % 4) + 4) % 4]; }
