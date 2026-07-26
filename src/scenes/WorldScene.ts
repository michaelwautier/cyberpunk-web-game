import Phaser from 'phaser';
import {
  ControlScheme,
  SCHEME_KEYS,
  detectScheme,
  guessScheme,
  saveScheme,
} from '../systems/Controls';
import { TILE, SOLID_TILES, T, Facing } from '../systems/textures';
import { GridMovement } from '../systems/GridMovement';
import { MAPS, MapDef } from '../data/maps';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private mover!: GridMovement;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveKeys!: Record<Facing, Phaser.Input.Keyboard.Key>;
  private scheme!: ControlScheme;
  private hint!: Phaser.GameObjects.Text;

  private map!: Phaser.Tilemaps.Tilemap;
  private def!: MapDef;
  private transitioning = false;

  constructor() {
    super('world');
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.player = this.add.sprite(0, 0, 'player-down').setDepth(10);

    this.loadMap('street');

    this.hint = this.add
      .text(6, 6, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#4ef3ff',
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.applyScheme(guessScheme());
    detectScheme().then((scheme) => {
      if (scheme !== this.scheme) this.applyScheme(scheme);
    });

    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K).on('down', () => {
      const next: ControlScheme = this.scheme === 'wasd' ? 'zqsd' : 'wasd';
      saveScheme(next);
      this.applyScheme(next);
    });

    this.cameras.main.setBackgroundColor('#05050a');
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
  }

  update() {
    if (this.transitioning) return;
    this.mover.update(this.readDirection());
  }

  private readDirection(): Facing | null {
    const k = this.moveKeys;
    if (this.cursors.up.isDown || k.up.isDown) return 'up';
    if (this.cursors.down.isDown || k.down.isDown) return 'down';
    if (this.cursors.left.isDown || k.left.isDown) return 'left';
    if (this.cursors.right.isDown || k.right.isDown) return 'right';
    return null;
  }

  private loadMap(name: string, entryX?: number, entryY?: number) {
    if (this.map) this.map.destroy();

    const def = MAPS[name]();
    this.def = def;

    this.map = this.make.tilemap({
      tileWidth: TILE,
      tileHeight: TILE,
      width: def.width,
      height: def.height,
    });
    const tileset = this.map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
    const ground = this.map.createBlankLayer('ground', tileset)!;
    const objects = this.map.createBlankLayer('objects', tileset)!;
    ground.putTilesAt(def.ground, 0, 0);
    objects.putTilesAt(def.objects, 0, 0);
    ground.setDepth(0);
    objects.setDepth(1);

    const px = def.width * TILE;
    const py = def.height * TILE;
    this.cameras.main.setBounds(0, 0, px, py);

    const sx = entryX ?? def.spawn.x;
    const sy = entryY ?? def.spawn.y;
    if (this.mover) {
      this.mover.place(sx, sy);
    } else {
      this.mover = new GridMovement(this, this.player, sx, sy, {
        isBlocked: (tx, ty) => this.isBlocked(tx, ty),
        onArrive: (tx, ty) => this.onArrive(tx, ty),
      });
    }
  }

  private isBlocked(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.def.width || ty >= this.def.height) return true;
    if (this.def.ground[ty][tx] === T.VOID) return true;
    return SOLID_TILES.has(this.def.objects[ty][tx]);
  }

  private onArrive(tx: number, ty: number) {
    const door = this.def.doors.find((d) => d.x === tx && d.y === ty);
    if (door) this.transition(door.to, door.toX, door.toY);
  }

  private transition(to: string, toX: number, toY: number) {
    this.transitioning = true;
    const cam = this.cameras.main;
    cam.fadeOut(180, 5, 5, 10);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.loadMap(to, toX, toY);
      cam.fadeIn(180, 5, 5, 10);
      this.transitioning = false;
    });
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
    this.hint?.setText(`arrows / ${scheme.toUpperCase()}  ·  [K] layout`);
  }
}
