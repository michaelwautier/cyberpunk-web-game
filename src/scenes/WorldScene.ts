import Phaser from 'phaser';
import {
  ControlScheme,
  SCHEME_KEYS,
  detectScheme,
  guessScheme,
  saveScheme,
} from '../systems/Controls';

const TILE = 16;
const SPEED = 120;

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveKeys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private scheme!: ControlScheme;
  private hint!: Phaser.GameObjects.Text;

  constructor() {
    super('world');
  }

  create() {
    this.drawGrid();

    this.player = this.add.rectangle(240, 160, TILE, TILE, 0xff2fd6);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.hint = this.add
      .text(240, 12, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#4ef3ff',
      })
      .setOrigin(0.5, 0);

    this.applyScheme(guessScheme());
    // Refine with the real keyboard layout when the browser can tell us.
    detectScheme().then((scheme) => {
      if (scheme !== this.scheme) this.applyScheme(scheme);
    });

    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K).on('down', () => {
      const next: ControlScheme = this.scheme === 'wasd' ? 'zqsd' : 'wasd';
      saveScheme(next);
      this.applyScheme(next);
    });
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const left = this.cursors.left.isDown || this.moveKeys.left.isDown;
    const right = this.cursors.right.isDown || this.moveKeys.right.isDown;
    const up = this.cursors.up.isDown || this.moveKeys.up.isDown;
    const down = this.cursors.down.isDown || this.moveKeys.down.isDown;

    body.setVelocity(
      left ? -SPEED : right ? SPEED : 0,
      up ? -SPEED : down ? SPEED : 0,
    );
    body.velocity.normalize().scale(SPEED);
  }

  private applyScheme(scheme: ControlScheme) {
    const keyboard = this.input.keyboard!;
    if (this.moveKeys) {
      for (const key of Object.values(this.moveKeys)) keyboard.removeKey(key);
    }
    const keys = SCHEME_KEYS[scheme];
    this.moveKeys = {
      up: keyboard.addKey(keys.up),
      left: keyboard.addKey(keys.left),
      down: keyboard.addKey(keys.down),
      right: keyboard.addKey(keys.right),
    };
    this.scheme = scheme;
    this.hint.setText(
      `NEON GRID — arrows / ${scheme.toUpperCase()}  ·  [K] switch layout`,
    );
  }

  private drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1c1c33, 1);
    const { width, height } = this.scale;
    for (let x = 0; x <= width; x += TILE) {
      g.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += TILE) {
      g.lineBetween(0, y, width, y);
    }
  }
}
