import Phaser from 'phaser';
import { TILE, Facing } from './textures';

const DURATION = 140;

export const DELTA: Record<Facing, [number, number]> = {
  down: [0, 1],
  up: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};

export interface GridOptions {
  isBlocked: (tx: number, ty: number) => boolean;
  onArrive: (tx: number, ty: number) => void;
}

/**
 * Tile-to-tile movement in the Game Boy Pokémon tradition: input while idle
 * turns you to face a direction and, if the target tile is free, tweens you
 * one tile over. Reused by NPCs later.
 */
export class GridMovement {
  tileX: number;
  tileY: number;
  facing: Facing = 'down';
  private moving = false;

  constructor(
    private scene: Phaser.Scene,
    private sprite: Phaser.GameObjects.Sprite,
    tileX: number,
    tileY: number,
    private opts: GridOptions,
    private prefix = 'player',
  ) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.snap();
  }

  get isMoving() {
    return this.moving;
  }

  /** Place instantly on a tile (e.g. after a map transition). */
  place(tx: number, ty: number, facing: Facing = this.facing) {
    this.tileX = tx;
    this.tileY = ty;
    this.facing = facing;
    this.moving = false;
    this.snap();
  }

  update(dir: Facing | null) {
    if (this.moving || !dir) return;
    this.face(dir);
    const [dx, dy] = DELTA[dir];
    const tx = this.tileX + dx;
    const ty = this.tileY + dy;
    if (this.opts.isBlocked(tx, ty)) return;

    this.moving = true;
    this.tileX = tx;
    this.tileY = ty;
    this.scene.tweens.add({
      targets: this.sprite,
      x: tx * TILE + TILE / 2,
      y: ty * TILE + TILE / 2,
      duration: DURATION,
      onComplete: () => {
        this.moving = false;
        this.opts.onArrive(tx, ty);
      },
    });
  }

  /** Turn to face a direction without moving. */
  face(dir: Facing) {
    this.facing = dir;
    this.sprite.setTexture(`${this.prefix}-${dir}`);
  }

  private snap() {
    this.sprite.setPosition(this.tileX * TILE + TILE / 2, this.tileY * TILE + TILE / 2);
    this.sprite.setTexture(`${this.prefix}-${this.facing}`);
  }
}
