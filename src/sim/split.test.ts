import { describe, expect, it } from 'vitest';
import type { Cell } from './cell';
import { split } from './split';

const cell = (id: number, x = 50, y = 50): Cell => ({
  id,
  x,
  y,
  vx: 1,
  vy: -1,
  radius: 5,
  marked: false,
});

/** `random` that cycles through `values`. */
const sequence =
  (...values: number[]) =>
  () => {
    const value = values.shift() ?? 0.5;
    values.push(value);
    return value;
  };

/** The child a split appended, failing the test if there is none. */
const child = (cells: Cell[]): Cell => {
  const last = cells[1];
  if (!last) throw new Error('No child was born');
  return last;
};

describe('split', () => {
  it('doubles the population when the chance is 1', () => {
    const cells = [cell(0), cell(1), cell(2)];
    split(cells, 1, Math.random);
    expect(cells).toHaveLength(6);
  });

  it('leaves the population alone when the chance is 0', () => {
    const cells = [cell(0), cell(1)];
    split(cells, 0, Math.random);
    expect(cells).toHaveLength(2);
  });

  it('splits a cell only when its draw is below the chance', () => {
    const cells = [cell(0), cell(1)];
    const draws = [0.2, 0.3, 0.8];
    split(cells, 0.5, () => draws.shift() ?? 0.5);
    expect(cells).toHaveLength(3);
  });

  it('gives children the next free ids', () => {
    const cells = [cell(0), cell(1)];
    split(cells, 1, Math.random);
    expect(cells.map((c) => c.id)).toEqual([0, 1, 2, 3]);
  });

  it('halves the area of both the parent and the child', () => {
    const cells = [cell(0)];
    split(cells, 1, Math.random);
    expect(cells.map((c) => c.radius)).toEqual([5 / Math.SQRT2, 5 / Math.SQRT2]);
  });

  it('places a child next to its parent but not on it, with its size and velocity', () => {
    const cells = [cell(0, 20, 30)];
    split(cells, 1, sequence(0, 0.3));
    const born = child(cells);
    const gap = Math.hypot(born.x - 20, born.y - 30);
    expect(gap).toBeGreaterThan(0);
    expect(gap).toBeLessThan(1);
    expect([born.radius, born.vx, born.vy, born.marked]).toEqual([5 / Math.SQRT2, 1, -1, false]);
  });

  it('passes the mark on, so the whole family of a marked cell stays marked', () => {
    const cells = [{ ...cell(0), marked: true }, cell(1)];
    split(cells, 1, Math.random);
    expect(cells.map((c) => c.marked)).toEqual([true, false, true, false]);
  });

  it('points children in different directions for different draws', () => {
    const a = [cell(0)];
    const b = [cell(0)];
    split(a, 1, sequence(0, 0.1));
    split(b, 1, sequence(0, 0.6));
    expect([child(a).x, child(a).y]).not.toEqual([child(b).x, child(b).y]);
  });
});
