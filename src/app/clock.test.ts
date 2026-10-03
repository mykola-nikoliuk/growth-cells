import { describe, expect, it } from 'vitest';
import { createClock, MAX_STEPS, STEP_MS, tick } from './clock';

describe('tick', () => {
  it('runs no steps on the first frame', () => {
    expect(tick(createClock(), 1000)).toBe(0);
  });

  it('runs one step per 60 Hz frame', () => {
    const clock = createClock();
    tick(clock, 0);
    expect([1, 2, 3].map((frame) => tick(clock, frame * STEP_MS))).toEqual([1, 1, 1]);
  });

  it('carries time shorter than a step over to the next frame', () => {
    const clock = createClock();
    tick(clock, 0);
    expect(tick(clock, STEP_MS * 0.6)).toBe(0);
    expect(tick(clock, STEP_MS * 1.2)).toBe(1);
  });

  it('runs two steps per frame at 30 Hz and about one in two at 120 Hz', () => {
    const slow = createClock();
    tick(slow, 0);
    expect(tick(slow, 2 * STEP_MS)).toBe(2);

    const fast = createClock();
    tick(fast, 0);
    const steps = Array.from({ length: 120 }, (_, frame) => tick(fast, ((frame + 1) * 1000) / 120));
    expect(steps.reduce((sum, n) => sum + n, 0)).toBe(60);
  });

  it('caps a long frame and drops the time it could not catch up on', () => {
    const clock = createClock();
    tick(clock, 0);
    expect(tick(clock, 1000)).toBe(MAX_STEPS);
    expect(tick(clock, 1000 + STEP_MS)).toBe(1);
  });
});
