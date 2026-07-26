import Phaser from 'phaser';
import { WorldScene } from './scenes/WorldScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 320,
  zoom: 2,
  pixelArt: true,
  backgroundColor: '#0a0a12',
  physics: {
    default: 'arcade',
  },
  scene: [WorldScene],
});
