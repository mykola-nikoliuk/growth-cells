import { describe, expect, it } from 'vitest';
import type { Cell } from './cell';
import { collide, limitSpeed } from './collide';

const cell = (x: number, y: number, vx = 0, vy = 0): Cell => ({
  x,
  y,
  vx,
  vy,
  radius: 5,
  marked: false,
});

const distance = (a: Cell, b: Cell) => Math.hypot(a.x - b.x, a.y - b.y);

describe('collide', () => {
  it('leaves cells that do not touch alone', () => {
    const a = cell(0, 0, 1, 0);
    const b = cell(11, 0, -1, 0);
    collide(a, b);
    expect(a).toEqual(cell(0, 0, 1, 0));
    expect(b).toEqual(cell(11, 0, -1, 0));
  });

  it('pushes overlapping cells apart until they just touch, half each', () => {
    const a = cell(0, 0);
    const b = cell(6, 8);
    collide(a, b);
    expect(distance(a, b)).toBeCloseTo(10);
    expect(a.x).toBeCloseTo(0);
    expect(a.y).toBeCloseTo(0);
    expect(b.x).toBeCloseTo(6);
    expect(b.y).toBeCloseTo(8);
  });

  it('moves each cell by half the overlap along the line between them', () => {
    const a = cell(0, 0);
    const b = cell(6, 0);
    collide(a, b);
    expect([a.x, b.x]).toEqual([-2, 8]);
    expect([a.y, b.y]).toEqual([0, 0]);
  });

  it('swaps velocities in a head-on hit', () => {
    const a = cell(0, 0, 2, 0);
    const b = cell(9, 0, -1, 0);
    collide(a, b);
    expect([a.vx, b.vx]).toEqual([-1, 2]);
  });

  it('keeps the part of the velocity across the line between them', () => {
    const a = cell(0, 0, 1, 3);
    const b = cell(9, 0, 0, 0);
    collide(a, b);
    expect([a.vx, a.vy]).toEqual([0, 3]);
    expect([b.vx, b.vy]).toEqual([1, 0]);
  });

  it('swaps velocities in a head-on hit along a diagonal', () => {
    const a = cell(0, 0);
    const b = cell(6, 8, -3, -4);
    collide(a, b);
    expect(a.vx).toBeCloseTo(-3);
    expect(a.vy).toBeCloseTo(-4);
    expect(b.vx).toBeCloseTo(0);
    expect(b.vy).toBeCloseTo(0);
  });

  it('keeps the total momentum and energy in an oblique hit', () => {
    const a = cell(0, 0, 1, 2);
    const b = cell(6, 8, -2, -1);
    const energy = () => a.vx ** 2 + a.vy ** 2 + b.vx ** 2 + b.vy ** 2;
    const before = energy();
    collide(a, b);
    expect(a.vx + b.vx).toBeCloseTo(-1);
    expect(a.vy + b.vy).toBeCloseTo(1);
    expect(energy()).toBeCloseTo(before);
  });

  it('does not bounce cells that are already moving apart', () => {
    const a = cell(0, 0, -1, 0);
    const b = cell(9, 0, 1, 0);
    collide(a, b);
    expect([a.vx, b.vx]).toEqual([-1, 1]);
    expect(distance(a, b)).toBeCloseTo(10);
  });

  it('separates cells that sit exactly on top of each other', () => {
    const a = cell(3, 3);
    const b = cell(3, 3);
    collide(a, b);
    expect(distance(a, b)).toBeCloseTo(10);
    expect([a.x, a.y, b.x, b.y].every(Number.isFinite)).toBe(true);
  });
});

describe('limitSpeed', () => {
  it('scales a fast cell down to the limit, keeping its direction', () => {
    const fast = cell(0, 0, 6, 8);
    limitSpeed(fast, 5);
    expect([fast.vx, fast.vy]).toEqual([3, 4]);
  });

  it('leaves a slow cell alone', () => {
    const slow = cell(0, 0, 3, 4);
    limitSpeed(slow, 5);
    expect([slow.vx, slow.vy]).toEqual([3, 4]);
  });
});
