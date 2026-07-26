import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 320,
  zoom: 2,
  pixelArt: true,
  backgroundColor: '#05050a',
  scene: [BootScene, WorldScene],
});

// Exposed for debugging / automated verification.
(window as unknown as { game: Phaser.Game }).game = game;
