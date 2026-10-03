import type { Cell } from './cell';
import { forEachNear, type Grid, rebuild } from './grid';
import { clamp } from './utils';
import { collide, limitSpeed } from './collide';

/** Everything one frame of the simulation needs. */
export interface World {
  readonly width: number;
  readonly height: number;
  readonly cells: Cell[];
  readonly grid: Grid;
  /** The fastest a cell may move per step; kept below its radius so cells never tunnel. */
  readonly maxSpeed: number;
  /** The largest random change to each velocity component per step. */
  readonly kick: number;
}

/**
 * Puts a cell that has crossed a wall back on the board, just touching the wall, and turns its
 * velocity back inwards. A cell already moving away from the wall keeps its velocity.
 */
export function keepInside(cell: Cell, width: number, height: number): void {
  const finalPositionX = clamp(cell.x, cell.radius, width - cell.radius);
  const finalPositionY = clamp(cell.y, cell.radius, height - cell.radius);

  const pushDirectionX = Math.sign(finalPositionX - cell.x);
  const pushDirectionY = Math.sign(finalPositionY - cell.y);

  cell.x = finalPositionX;
  cell.y = finalPositionY;

  if (pushDirectionX * cell.vx < 0) cell.vx *= -1;
  if (pushDirectionY * cell.vy < 0) cell.vy *= -1;
}

function processCellPair(a: Cell, b: Cell) {
  if (a.id < b.id) collide(a, b);
}

/**
 * One frame: move every cell, keep it inside, rebuild the grid, bounce touching pairs (each pair
 * once), then nudge every velocity by a random kick and cap the speed. `random` returns a number
 * in [0, 1), like `Math.random`; a kick is `(random() * 2 - 1) * kick` per component.
 */
export function step(world: World, random: () => number): void {
  for (const cell of world.cells) {
    cell.x += cell.vx;
    cell.y += cell.vy;
    keepInside(cell, world.width, world.height);
  }

  rebuild(world.grid, world.cells);

  for (const cell of world.cells) {
    forEachNear(world.grid, cell.x, cell.y, (nextCell: Cell) => processCellPair(cell, nextCell));
  }

  for (const cell of world.cells) {
    cell.vx += (random() * 2 - 1) * world.kick;
    cell.vy += (random() * 2 - 1) * world.kick;

    limitSpeed(cell, world.maxSpeed);
  }
}
