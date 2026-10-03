/** One ball on the board. Mutable on purpose: the simulation updates every cell every frame. */
export interface Cell {
  /** Stable and unique, so a pair of cells can be handled once: by the one with the lower id. */
  readonly id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  marked: boolean;
}
