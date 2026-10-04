import type { Cell } from './cell';

const SEPARATION_PER_STEP = 0.1;

/**
 * Pushes two overlapping cells apart along the line between their centres, removing a tenth of
 * the overlap per step (half from each, so they stay soft and overlaps ease out), and if
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
  a.x += ((nx * overlap) / 2) * SEPARATION_PER_STEP;
  a.y += ((ny * overlap) / 2) * SEPARATION_PER_STEP;
  b.x -= ((nx * overlap) / 2) * SEPARATION_PER_STEP;
  b.y -= ((ny * overlap) / 2) * SEPARATION_PER_STEP;

  const aAlong = a.vx * nx + a.vy * ny;
  const bAlong = b.vx * nx + b.vy * ny;
  const closingSpeed = bAlong - aAlong;
  if (closingSpeed <= 0) return;

  a.vx += closingSpeed * nx;
  a.vy += closingSpeed * ny;

  b.vx += -closingSpeed * nx;
  b.vy += -closingSpeed * ny;
}

/** Scales a cell's velocity down to `max`, keeping its direction. Slower cells are left alone. */
export function limitSpeed(cell: Cell, max: number): void {
  const speed = Math.sqrt(Math.pow(cell.vx, 2) + Math.pow(cell.vy, 2));
  if (max >= speed) return;

  const scale = max / speed;
  cell.vx *= scale;
  cell.vy *= scale;
}
