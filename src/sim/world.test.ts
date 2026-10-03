import { describe, expect, it } from 'vitest';
import { cellDiameter, createWorld } from './world';

const fits = (width: number, height: number, diameter: number) =>
  Math.floor(width / diameter) * Math.floor(height / diameter);

describe('cellDiameter', () => {
  it('fills a board that divides evenly', () => {
    expect(cellDiameter(100, 100, 100)).toBe(10);
  });

  it('shrinks below the square root when the edges waste space', () => {
    // sqrt(390 * 844 / 64) is about 71.7, but 71px squares only fit 5 × 11 = 55.
    expect(cellDiameter(390, 844, 64)).toBe(65);
  });

  it.each([
    [390, 844, 64],
    [390, 844, 16384],
    [1920, 1080, 16384],
    [1366, 768, 1000],
  ])('picks the largest diameter that fits on %i×%i for %i cells', (width, height, maxCells) => {
    const diameter = cellDiameter(width, height, maxCells);
    expect(Number.isInteger(diameter)).toBe(true);
    expect(fits(width, height, diameter)).toBeGreaterThanOrEqual(maxCells);
    expect(fits(width, height, diameter + 1)).toBeLessThan(maxCells);
  });
});

describe('createWorld', () => {
  const options = { width: 390, height: 844, startCells: 4, maxCells: 64 };

  it('sizes cells, tiles and speed from the diameter', () => {
    const world = createWorld(options);
    expect(world.cells[0]?.radius).toBe(32.5);
    expect(world.grid.tileSize).toBe(65);
    expect(world.maxSpeed).toBeCloseTo(32.5 / 30);
    expect([world.width, world.height]).toEqual([390, 844]);
  });

  it('creates the starting cells at rest, with distinct ids', () => {
    const { cells } = createWorld(options);
    expect(cells).toHaveLength(4);
    expect(new Set(cells.map((c) => c.id)).size).toBe(4);
    expect(cells.every((c) => c.vx === 0 && c.vy === 0 && !c.marked)).toBe(true);
  });

  it('creates exactly as many cells as asked, even when they do not make a full square', () => {
    expect(createWorld({ ...options, startCells: 5 }).cells).toHaveLength(5);
  });

  it.each([5, 9])('places %i starting cells inside the board without overlaps', (startCells) => {
    const { cells } = createWorld({ ...options, startCells });
    for (const a of cells) {
      expect(a.x - a.radius).toBeGreaterThanOrEqual(0);
      expect(a.x + a.radius).toBeLessThanOrEqual(390);
      expect(a.y - a.radius).toBeGreaterThanOrEqual(0);
      expect(a.y + a.radius).toBeLessThanOrEqual(844);
      for (const b of cells) {
        if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(2 * a.radius);
      }
    }
  });

  it('centres the starting cells on the board', () => {
    const { cells } = createWorld({ ...options, startCells: 9 });
    const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;
    expect(mean(cells.map((c) => c.x))).toBeCloseTo(195);
    expect(mean(cells.map((c) => c.y))).toBeCloseTo(422);
  });
});
