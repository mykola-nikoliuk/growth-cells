/** One simulation step: the physics always advances by this much, whatever the frame rate. */
export const STEP_MS = 1000 / 60;

/** The most steps one frame may run, so a slow frame cannot snowball into slower ones. */
export const MAX_STEPS = 4;

/** Real time that has passed but has not been simulated yet. */
export interface Clock {
  last: number | null;
  lag: number;
}

export function createClock(): Clock {
  return { last: null, lag: 0 };
}

/**
 * How many fixed steps to run for a frame drawn at `now` (ms). Leftover time below one step is
 * kept for the next frame; time beyond `MAX_STEPS` is dropped, so the simulation slows down
 * instead of falling further behind.
 */
export function tick(clock: Clock, now: number): number {
  if (clock.last !== null) clock.lag += now - clock.last;
  clock.last = now;

  // The epsilon absorbs float error, so a frame exactly one step long counts as one step.
  const steps = Math.min(Math.floor(clock.lag / STEP_MS + 1e-6), MAX_STEPS);
  clock.lag = steps === MAX_STEPS ? 0 : Math.max(clock.lag - steps * STEP_MS, 0);
  return steps;
}
