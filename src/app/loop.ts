import { createClock, tick } from './clock';

/**
 * Runs `update` a fixed number of times per frame (see `tick`) and then `render` once. Returns a
 * function that stops the loop.
 */
export function startLoop(update: () => void, render: () => void): () => void {
  const clock = createClock();
  let frame = 0;

  const onFrame = (now: number) => {
    for (let steps = tick(clock, now); steps > 0; steps--) update();
    render();
    frame = requestAnimationFrame(onFrame);
  };

  frame = requestAnimationFrame(onFrame);
  return () => cancelAnimationFrame(frame);
}
