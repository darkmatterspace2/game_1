import './style.css'

import { SceneManager } from './game/SceneManager';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="game-container"></div>
`;

const container = document.getElementById('game-container')!;
new SceneManager(container);

