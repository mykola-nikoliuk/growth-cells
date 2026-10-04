import { describe, expect, it } from 'vitest';
import type { Cell } from './cell';
import { createGrowth, grow } from './growth';

const cell = (id: number): Cell => ({ id, x: 0, y: 0, vx: 0, vy: 0, radius: 5, marked: false });

/** Runs `steps` steps and returns on which of them (1-based) an epoch ended. */
const run = (growth: ReturnType<typeof createGrowth>, cells: Cell[], steps: number) =>
  Array.from({ length: steps }, (_, i) => (grow(growth, cells, Math.random) ? i + 1 : 0)).filter(
    Boolean,
  );

describe('createGrowth', () => {
  it('turns the split period from seconds into whole steps', () => {
    expect(createGrowth(3, 2, 1).stepsPerEpoch).toBe(120);
    expect(createGrowth(3, 0.51, 1).stepsPerEpoch).toBe(31);
  });

  it('never makes an epoch shorter than one step', () => {
    expect(createGrowth(3, 0, 1).stepsPerEpoch).toBe(1);
  });
});

describe('grow', () => {
  it('splits once every split period', () => {
    const cells = [cell(0)];
    const growth = createGrowth(3, 0.05, 1);
    expect(run(growth, cells, 9)).toEqual([3, 6, 9]);
    expect(cells).toHaveLength(8);
    expect(growth.epoch).toBe(3);
  });

  it('stops splitting after the last epoch', () => {
    const cells = [cell(0)];
    const growth = createGrowth(2, 0.05, 1);
    expect(run(growth, cells, 30)).toEqual([3, 6]);
    expect(cells).toHaveLength(4);
  });

  it('uses the split chance', () => {
    const cells = [cell(0), cell(1)];
    grow(createGrowth(1, 0, 0), cells, Math.random);
    expect(cells).toHaveLength(2);
  });
});
