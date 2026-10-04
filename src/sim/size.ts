import type { Cell } from './cell';

/**
 * How much a cell's radius grows per step so that it gets from `fullRadius / sqrt(2)`, its size
 * right after a split, back to `fullRadius` in `stepsPerEpoch` steps.
 */
export function growthPerStep(fullRadius: number, stepsPerEpoch: number): number {
  const smallRadius = fullRadius / Math.sqrt(2);
  return (fullRadius - smallRadius) / stepsPerEpoch;
}

/** Grows every cell smaller than `fullRadius` by `perStep`, never past `fullRadius`. */
export function growCells(cells: Cell[], fullRadius: number, perStep: number): void {
  for (const cell of cells) {
    cell.radius = Math.min(cell.radius + perStep, fullRadius);
  }
}
