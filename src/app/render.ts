import type { World } from '../sim/step';

const CELL_COLOR = '#4fc3a1';

/**
 * Sizes the canvas backing store to its CSS size times the device pixel ratio, so circles stay
 * sharp on high-density screens, and scales the context so drawing stays in CSS pixels.
 */
export function fitCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/** Draws every cell as one path, so the whole population costs a single fill. */
export function draw(context: CanvasRenderingContext2D, world: World): void {
  context.clearRect(0, 0, world.width, world.height);
  context.beginPath();
  for (const cell of world.cells) {
    context.moveTo(cell.x + cell.radius, cell.y);
    context.arc(cell.x, cell.y, cell.radius, 0, 2 * Math.PI);
  }
  context.fillStyle = CELL_COLOR;
  context.fill();
}
