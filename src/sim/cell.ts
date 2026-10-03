/** One ball on the board. Mutable on purpose: the simulation updates every cell every frame. */
export interface Cell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  marked: boolean;
}
