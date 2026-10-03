import { Elm } from './Main.elm';
import { startLoop } from './app/loop';
import { draw, fitCanvas } from './app/render';
import { step } from './sim/step';
import { createWorld } from './sim/world';

/** The config the page starts with; Elm validates it like any other. */
const DEFAULT_CONFIG = { startCells: 4, epochs: 10, splitChance: 1, splitPeriod: 2 };

const node = document.getElementById('app');
if (!node) throw new Error('No #app element');
Elm.Main.init({ node, flags: DEFAULT_CONFIG });

const canvas = document.getElementById('board');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('No #board canvas');
const context = canvas.getContext('2d');
if (!context) throw new Error('No 2D context');

fitCanvas(canvas, context);
// Until the ports exist, the population limit is worked out here from the default config.
const world = createWorld({
  width: canvas.clientWidth,
  height: canvas.clientHeight,
  startCells: DEFAULT_CONFIG.startCells,
  maxCells: DEFAULT_CONFIG.startCells * 2 ** DEFAULT_CONFIG.epochs,
});

startLoop(
  () => step(world, Math.random),
  () => draw(context, world),
);
