import type { Cell } from './cell';
import { split } from './split';

/** Steps per second of simulated time; the clock's fixed step is derived from it. */
export const STEPS_PER_SECOND = 60;

/** Where the population is in its epochs. */
export interface Growth {
  /** Epochs finished so far. */
  epoch: number;
  readonly epochs: number;
  /** Steps since the last split. */
  steps: number;
  readonly stepsPerEpoch: number;
  readonly chance: number;
}

export function createGrowth(epochs: number, splitPeriod: number, chance: number): Growth {
  return {
    epoch: 0,
    epochs,
    steps: 0,
    stepsPerEpoch: Math.max(1, Math.round(splitPeriod * STEPS_PER_SECOND)),
    chance,
  };
}

/**
 * Counts one step and, when an epoch is up, splits the cells. After the last epoch the cells keep
 * moving but never split again. Returns whether an epoch ended on this step.
 */
export function grow(growth: Growth, cells: Cell[], random: () => number): boolean {
  if (growth.epoch >= growth.epochs) return false;

  growth.steps++;
  if (growth.steps < growth.stepsPerEpoch) return false;

  growth.steps = 0;
  growth.epoch++;
  split(cells, growth.chance, random);
  return true;
}
