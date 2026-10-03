import type { Cell } from './cell';

/**
 * The board split into square tiles at least one cell diameter wide, so a cell can only touch
 * cells in its own tile and the 8 around it. Tile `col, row` lives at `tiles[row * cols + col]`.
 */
export interface Grid {
  readonly cols: number;
  readonly rows: number;
  readonly tileSize: number;
  readonly tiles: Cell[][];
}

function clamp(value: number, lower: number, upper = Infinity) {
  return Math.min(Math.max(value, lower), upper);
}

/** An empty grid that covers a `width × height` board; edge tiles may stick out past it. */
export function createGrid(width: number, height: number, tileSize: number): Grid {
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);
  return {
    cols,
    rows,
    tileSize: tileSize,
    tiles: Array.from({ length: cols * rows }, () => []),
  };
}

/** The index of the tile under a point. Points off the board count as the nearest edge tile. */
export function tileIndex(grid: Grid, x: number, y: number): number {
  const col = clamp(Math.floor(x / grid.tileSize), 0, grid.cols - 1);
  const row = clamp(Math.floor(y / grid.tileSize), 0, grid.rows - 1);
  return row * grid.cols + col;
}

/** Empties every tile and puts each cell into the tile under its centre. Allocates nothing. */
export function rebuild(grid: Grid, cells: readonly Cell[]): void {
  grid.tiles.forEach((tile) => (tile.length = 0));

  for (const cell of cells) {
    const index = tileIndex(grid, cell.x, cell.y);
    const tile = grid.tiles[index];
    tile?.push(cell);
  }
}

/** Calls `visit` for every cell in the tile under a point and the 8 tiles around it. */
export function forEachNear(grid: Grid, x: number, y: number, visit: (cell: Cell) => void): void {
  const col = Math.floor(x / grid.tileSize);
  const row = Math.floor(y / grid.tileSize);

  for (let rowShift = -1; rowShift <= 1; rowShift++) {
    const shiftedRow = row + rowShift;
    if (shiftedRow < 0 || shiftedRow >= grid.rows) continue;

    for (let colShift = -1; colShift <= 1; colShift++) {
      const shiftedCol = col + colShift;
      if (shiftedCol < 0 || shiftedCol >= grid.cols) continue;

      const index = shiftedRow * grid.cols + shiftedCol;
      grid.tiles[index]?.forEach(visit);
    }
  }
}
