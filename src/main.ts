import { Elm } from './Main.elm';

/** The config the page starts with; Elm validates it like any other. */
const DEFAULT_CONFIG = { startCells: 4, epochs: 10, splitChance: 1, splitPeriod: 2 };

const node = document.getElementById('app');
if (!node) throw new Error('No #app element');
Elm.Main.init({ node, flags: DEFAULT_CONFIG });
