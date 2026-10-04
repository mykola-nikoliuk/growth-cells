import { describe, expect, it } from 'vitest';
import type { Cell } from './cell';
import { growCells, growthPerStep } from './size';

const cell = (radius: number): Cell => ({ id: 0, x: 0, y: 0, vx: 0, vy: 0, radius, marked: false });

describe('growthPerStep', () => {
  it('spreads the way from radius / sqrt(2) back to full over the epoch', () => {
    const perStep = growthPerStep(10, 4);
    expect(10 / Math.SQRT2 + 4 * perStep).toBeCloseTo(10);
  });
});

describe('growCells', () => {
  it('grows cells that are smaller than full', () => {
    const cells = [cell(7), cell(8)];
    growCells(cells, 10, 0.5);
    expect(cells.map((c) => c.radius)).toEqual([7.5, 8.5]);
  });

  it('never grows a cell past full size', () => {
    const cells = [cell(9.8)];
    growCells(cells, 10, 0.5);
    expect(cells[0]?.radius).toBe(10);
  });

  it('leaves full-size cells alone', () => {
    const cells = [cell(10)];
    growCells(cells, 10, 0.5);
    expect(cells[0]?.radius).toBe(10);
  });
});
