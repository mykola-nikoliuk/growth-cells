import { Elm } from './Main.elm';

const node = document.getElementById('app');
if (!node) throw new Error('No #app element');
Elm.Main.init({ node });
