import type { Cell } from './cell';

/**
 * Pushes two overlapping cells apart along the line between their centres, half each, and if
 * they are moving towards each other, bounces them like billiard balls of equal mass: they swap
 * the parts of their velocities along that line and keep the parts across it. Cells that do not
 * overlap are left alone.
 */
export function collide(a: Cell, b: Cell): void {
  const distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  // no collision
  if (distance > a.radius + b.radius) return;

  // separate collision
  const nx = distance ? (a.x - b.x) / distance : 1;
  const ny = distance ? (a.y - b.y) / distance : 0;
  const overlap = a.radius + b.radius - distance;
  a.x += (nx * overlap) / 2;
  a.y += (ny * overlap) / 2;
  b.x -= (nx * overlap) / 2;
  b.y -= (ny * overlap) / 2;

  const closingSpeed = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (closingSpeed >= 0) return;

  const aAlong = a.vx * nx + a.vy * ny;
  const bAlong = b.vx * nx + b.vy * ny;

  a.vx += (bAlong - aAlong) * nx;
  a.vy += (bAlong - aAlong) * ny;

  b.vx += (aAlong - bAlong) * nx;
  b.vy += (aAlong - bAlong) * ny;
}

/** Scales a cell's velocity down to `max`, keeping its direction. Slower cells are left alone. */
export function limitSpeed(cell: Cell, max: number): void {
  const speed = Math.sqrt(Math.pow(cell.vx, 2) + Math.pow(cell.vy, 2));
  if (max >= speed) return;

  const scale = max / speed;
  cell.vx *= scale;
  cell.vy *= scale;
}
