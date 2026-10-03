import { describe, expect, it } from 'vitest';
import type { Cell } from './cell';
import { createGrid } from './grid';
import { keepInside, step, type World } from './step';

const cell = (id: number, x: number, y: number, vx = 0, vy = 0): Cell => ({
  id,
  x,
  y,
  vx,
  vy,
  radius: 5,
  marked: false,
});

const world = (cells: Cell[], { maxSpeed = 4, kick = 0 } = {}): World => ({
  width: 100,
  height: 100,
  cells,
  grid: createGrid(100, 100, 10),
  maxSpeed,
  kick,
});

/** `random` that always lands in the middle of the range, so kicks are zero. */
const still = () => 0.5;

describe('keepInside', () => {
  it('leaves a cell inside the board alone', () => {
    const c = cell(0, 50, 50, -1, 1);
    keepInside(c, 100, 100);
    expect(c).toEqual(cell(0, 50, 50, -1, 1));
  });

  it('puts a cell past a wall back against it and turns it around', () => {
    const left = cell(0, 2, 50, -3, 1);
    keepInside(left, 100, 100);
    expect([left.x, left.vx, left.vy]).toEqual([5, 3, 1]);

    const bottom = cell(1, 50, 99, 1, 2);
    keepInside(bottom, 100, 100);
    expect([bottom.y, bottom.vy, bottom.vx]).toEqual([95, -2, 1]);
  });

  it('handles a corner on both axes', () => {
    const c = cell(0, 101, -1, 2, -2);
    keepInside(c, 100, 100);
    expect([c.x, c.y, c.vx, c.vy]).toEqual([95, 5, -2, 2]);
  });

  it('does not turn a cell around that is already moving away from the wall', () => {
    const c = cell(0, 3, 50, 2, 0);
    keepInside(c, 100, 100);
    expect([c.x, c.vx]).toEqual([5, 2]);
  });
});

describe('step', () => {
  it('moves each cell by its velocity', () => {
    const c = cell(0, 50, 50, 2, -1);
    step(world([c]), still);
    expect([c.x, c.y]).toEqual([52, 49]);
  });

  it('keeps cells on the board', () => {
    const c = cell(0, 6, 50, -3, 0);
    step(world([c]), still);
    expect([c.x, c.vx]).toEqual([5, 3]);
  });

  it('bounces cells that meet', () => {
    const a = cell(0, 40, 50, 2, 0);
    const b = cell(1, 50, 50, -2, 0);
    step(world([a, b]), still);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeCloseTo(10);
    expect([a.vx, b.vx]).toEqual([-2, 2]);
  });

  it('bounces a pair once whichever order the cells come in', () => {
    const a = cell(5, 40, 50, 2, 0);
    const b = cell(2, 50, 50, -2, 0);
    step(world([a, b]), still);
    expect([a.vx, b.vx]).toEqual([-2, 2]);
  });

  it('caps the speed after the kicks', () => {
    const c = cell(0, 50, 50, 3, 0);
    step(world([c], { maxSpeed: 3, kick: 1 }), () => 0.999);
    expect(Math.hypot(c.vx, c.vy)).toBeLessThanOrEqual(3 + 1e-9);
  });

  it('nudges every velocity by a random kick', () => {
    const c = cell(0, 50, 50, 1, 1);
    step(world([c], { kick: 0.5 }), () => 0.75);
    expect([c.vx, c.vy]).toEqual([1.25, 1.25]);
  });

  it('kicks each velocity component on its own', () => {
    const c = cell(0, 50, 50, 1, 1);
    const draws = [0.75, 0.25];
    step(world([c], { kick: 0.5 }), () => draws.shift() ?? 0.5);
    expect([c.vx, c.vy]).toEqual([1.25, 0.75]);
  });
});
