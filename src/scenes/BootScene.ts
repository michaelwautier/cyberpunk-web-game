import Phaser from 'phaser';
import { makeTilesetTexture, makePlayerTextures, makeNpcTextures } from '../systems/textures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    this.add
      .text(240, 160, 'NEON GRID', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#34ffd6',
      })
      .setOrigin(0.5);

    makeTilesetTexture(this);
    makePlayerTextures(this);
    makeNpcTextures(this);

    this.scene.start('world');
  }
}
