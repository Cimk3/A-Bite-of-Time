// The anchor is the front-left support cell, matching the existing multi-grid
// display convention. The returned positions are occupied blocks above it.
const axes = {
    north: { right: { x: -1, y: 0, z: 0 }, back: { x: 0, y: 0, z: 1 } },
    east: { right: { x: 0, y: 0, z: -1 }, back: { x: -1, y: 0, z: 0 } },
    south: { right: { x: 1, y: 0, z: 0 }, back: { x: 0, y: 0, z: -1 } },
    west: { right: { x: 0, y: 0, z: 1 }, back: { x: 1, y: 0, z: 0 } },
};
export function nativeRight(direction, legacy = false) {
    const right = axes[direction].right;
    return legacy && (direction === 'east' || direction === 'west') ? { x: -right.x, y: 0, z: -right.z } : right;
}
export function patch090Cells(item, anchor, direction, legacy = false) {
    const { back } = axes[direction], right = nativeRight(direction, legacy);
    const width = Math.ceil(item.size[0]), depth = Math.ceil(item.size[1]), height = Math.ceil(item.size[2]);
    const cells = [];
    for (let y = 0; y < height; y++) {
        for (let z = 0; z < depth; z++) {
            for (let x = 0; x < width; x++) {
                cells.push({
                    x: anchor.x + right.x * x + back.x * z,
                    y: anchor.y + 1 + y,
                    z: anchor.z + right.z * x + back.z * z,
                });
            }
        }
    }
    return cells;
}
