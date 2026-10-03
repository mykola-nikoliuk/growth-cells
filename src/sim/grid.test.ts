import { describe, expect, it } from 'vitest';
import type { Cell } from './cell';
import { createGrid, forEachNear, rebuild, tileIndex } from './grid';

const cell = (x: number, y: number): Cell => ({
  id: 0,
  x,
  y,
  vx: 0,
  vy: 0,
  radius: 4,
  marked: false,
});

const near = (grid: ReturnType<typeof createGrid>, x: number, y: number) => {
  const found: Cell[] = [];
  forEachNear(grid, x, y, (c) => found.push(c));
  return found;
};

describe('createGrid', () => {
  it('covers the board, rounding partial tiles up', () => {
    const grid = createGrid(100, 50, 10);
    expect([grid.cols, grid.rows, grid.tileSize]).toEqual([10, 5, 10]);
    expect(createGrid(101, 41, 10)).toMatchObject({ cols: 11, rows: 5 });
  });

  it('starts with an empty array per tile', () => {
    const grid = createGrid(30, 20, 10);
    expect(grid.tiles).toHaveLength(6);
    expect(grid.tiles.every((tile) => tile.length === 0)).toBe(true);
    expect(new Set(grid.tiles).size).toBe(6);
  });
});

describe('tileIndex', () => {
  const grid = () => createGrid(100, 50, 10);

  it('counts row by row', () => {
    expect(tileIndex(grid(), 0, 0)).toBe(0);
    expect(tileIndex(grid(), 25, 0)).toBe(2);
    expect(tileIndex(grid(), 25, 13)).toBe(12);
    expect(tileIndex(grid(), 99.9, 49.9)).toBe(49);
  });

  it('puts points off the board into the nearest edge tile', () => {
    expect(tileIndex(grid(), -5, -5)).toBe(0);
    expect(tileIndex(grid(), 100, 50)).toBe(49);
    expect(tileIndex(grid(), 250, 3)).toBe(9);
  });
});

describe('rebuild', () => {
  it('puts each cell into the tile under its centre', () => {
    const grid = createGrid(30, 20, 10);
    const a = cell(5, 5);
    const b = cell(15, 15);
    const c = cell(16, 14);
    rebuild(grid, [a, b, c]);
    expect(grid.tiles[0]).toEqual([a]);
    expect(grid.tiles[4]).toEqual([b, c]);
  });

  it('forgets where cells were last frame', () => {
    const grid = createGrid(30, 20, 10);
    const a = cell(5, 5);
    rebuild(grid, [a]);
    a.x = 25;
    rebuild(grid, [a]);
    expect(grid.tiles[0]).toEqual([]);
    expect(grid.tiles[2]).toEqual([a]);
  });

  it('reuses the same tile arrays', () => {
    const grid = createGrid(30, 20, 10);
    const before = [...grid.tiles];
    rebuild(grid, [cell(5, 5)]);
    expect(grid.tiles.every((tile, i) => tile === before[i])).toBe(true);
  });
});

describe('forEachNear', () => {
  // A 5 × 5 grid with one cell in the middle of every tile.
  const setup = () => {
    const grid = createGrid(50, 50, 10);
    const cells = Array.from({ length: 25 }, (_, i) =>
      cell((i % 5) * 10 + 5, Math.floor(i / 5) * 10 + 5),
    );
    rebuild(grid, cells);
    return { grid, cells };
  };

  it('visits the tile under the point and the 8 around it', () => {
    const { grid, cells } = setup();
    const found = near(grid, 25, 25);
    expect(found).toHaveLength(9);
    expect(found).toEqual(expect.arrayContaining([cells[6], cells[12], cells[18]]));
    expect(found).not.toContain(cells[0]);
  });

  it('stops at the edges of the board', () => {
    const { grid } = setup();
    expect(near(grid, 5, 5)).toHaveLength(4);
    expect(near(grid, 25, 5)).toHaveLength(6);
    expect(near(grid, 45, 45)).toHaveLength(4);
  });
});
