import type { Cell } from './cell';

const DISTANCE_TO_PARENT = 0.001;

/**
 * One epoch's split: every cell that existed before the call splits with probability `chance`
 * (`random() < chance`); cells born in this call do not split again. The child takes the next
 * free id, the parent's radius, velocity and mark (so a marked cell's whole family stays marked), and sits a tiny distance from the parent in a random
 * direction, so the physics pushes the two apart along a random line.
 */
export function split(cells: Cell[], chance: number, random: () => number): void {
  const { length } = cells;
  for (let i = 0; i < length; i++) {
    const cell = cells[i];
    if (!cell || random() >= chance) continue;

    const angle = random() * 2 * Math.PI;
    const dx = Math.cos(angle) * DISTANCE_TO_PARENT;
    const dy = Math.sin(angle) * DISTANCE_TO_PARENT;

    cells.push({
      id: cells.length,
      x: cell.x + dx,
      y: cell.y + dy,
      vx: cell.vx,
      vy: cell.vy,
      radius: cell.radius,
      marked: cell.marked,
    });
  }
}
