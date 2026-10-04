import { type Config, Elm } from './Main.elm';
import { startLoop } from './app/loop';
import { draw, fitCanvas } from './app/render';
import { createGrowth, grow } from './sim/growth';
import { growCells, growthPerStep } from './sim/size';
import { step } from './sim/step';
import { createWorld } from './sim/world';

/** The config the page starts with; Elm validates it like any other. */
const DEFAULT_CONFIG = { startCells: 4, epochs: 10, splitChance: 1, splitPeriod: 2 };

const node = document.getElementById('app');
if (!node) throw new Error('No #app element');

const board = document.getElementById('board');
if (!(board instanceof HTMLCanvasElement)) throw new Error('No #board canvas');
const canvas: HTMLCanvasElement = board;
const maybeContext = canvas.getContext('2d');
if (!maybeContext) throw new Error('No 2D context');
const context: CanvasRenderingContext2D = maybeContext;

let stop = () => {};

/** Throws away the running simulation and starts a new one from a config Elm has validated. */
function restart(config: Config): void {
  stop();
  fitCanvas(canvas, context);

  const world = createWorld({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    startCells: config.startCells,
    maxCells: config.startCells * 2 ** config.epochs,
  });
  const growth = createGrowth(config.epochs, config.splitPeriod, config.splitChance);
  const fullRadius = world.cells[0]?.radius ?? 0;
  const perStep = growthPerStep(fullRadius, growth.stepsPerEpoch);

  stop = startLoop(
    () => {
      step(world, Math.random);
      if (grow(growth, world.cells, Math.random)) {
        app.ports.epochChanged.send({
          epoch: growth.epoch,
          total: world.cells.length,
          marked: world.cells.filter((cell) => cell.marked).length,
        });
      }
      growCells(world.cells, fullRadius, perStep);
    },
    () => draw(context, world),
  );
}

const app = Elm.Main.init({ node, flags: DEFAULT_CONFIG });
app.ports.restart.subscribe(restart);

// In development, `app` is reachable from the browser console, so ports can be tried by hand.
if (import.meta.env.DEV) Object.assign(window, { app });
