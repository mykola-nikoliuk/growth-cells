import type { World } from './step';
import { createGrid } from './grid';
import type { Cell } from './cell';

/** What the world is built from: the board size on screen and the population limits. */
export interface WorldOptions {
  readonly width: number;
  readonly height: number;
  readonly startCells: number;
  readonly maxCells: number;
}

function isCellsFitWorld(
  cellSize: number,
  width: number,
  height: number,
  cellsCount: number,
): boolean {
  const maxCols = Math.floor(width / cellSize);
  const maxRows = Math.floor(height / cellSize);
  return maxCols * maxRows >= cellsCount;
}

/**
 * The largest whole-pixel cell diameter such that `maxCells` squares of that side fit on the
 * board in whole rows and columns.
 */
export function cellDiameter(width: number, height: number, maxCells: number): number {
  let cellSize = Math.floor(Math.sqrt((width * height) / maxCells));

  while (!isCellsFitWorld(cellSize, width, height, maxCells)) {
    cellSize--;
  }

  return cellSize;
}

/**
 * A world whose cells are sized so the whole population fits, standing still in a neat grid in
 * the middle of the board. Tiles are one diameter wide; the speed limit is a thirtieth of the
 * radius per step.
 */
export function createWorld(options: WorldOptions): World {
  const { width, height } = options;
  const diameter = cellDiameter(width, height, options.maxCells);
  const radius = diameter / 2;
  const cells: Cell[] = [];
  const grid = createGrid(width, height, diameter);
  const maxSpeed = radius / 30;
  const kick = maxSpeed / 10;

  const startCellsRows = Math.min(grid.rows, Math.ceil(Math.sqrt(options.startCells)));
  const startCellsCols = Math.ceil(options.startCells / startCellsRows);
  const shiftX = (width - startCellsCols * diameter) / 2;
  const shiftY = (height - startCellsRows * diameter) / 2;

  for (let col = 0; col < startCellsCols; col++) {
    for (let row = 0; row < startCellsRows; row++) {
      if (cells.length === options.startCells) continue;

      cells.push({
        id: cells.length,
        x: shiftX + col * diameter + radius,
        y: shiftY + row * diameter + radius,
        vx: 0,
        vy: 0,
        radius,
        marked: false,
      });
    }
  }

  return {
    width,
    height,
    cells,
    grid,
    maxSpeed,
    kick,
  };
}
