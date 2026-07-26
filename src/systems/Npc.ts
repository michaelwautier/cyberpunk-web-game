import Phaser from 'phaser';
import { NpcDef } from '../data/npcs';
import { Facing } from './textures';
import { GridMovement, DELTA } from './GridMovement';

const DIRS: Facing[] = ['up', 'down', 'left', 'right'];
const WANDER_RADIUS = 2;

export interface NpcContext {
  isBlocked: (tx: number, ty: number) => boolean;
}

export class Npc {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly mover: GridMovement;
  talking = false;
  private homeX: number;
  private homeY: number;
  private nextWanderAt = 0;

  constructor(
    scene: Phaser.Scene,
    readonly def: NpcDef,
    ctx: NpcContext,
  ) {
    this.homeX = def.x;
    this.homeY = def.y;
    this.sprite = scene.add.sprite(0, 0, `${def.sprite}-${def.facing}`).setDepth(9);
    this.mover = new GridMovement(
      scene,
      this.sprite,
      def.x,
      def.y,
      { isBlocked: ctx.isBlocked, onArrive: () => {} },
      def.sprite,
    );
    this.mover.place(def.x, def.y, def.facing);
  }

  get tileX() {
    return this.mover.tileX;
  }
  get tileY() {
    return this.mover.tileY;
  }

  facePlayer(playerFacing: Facing) {
    const opposite: Record<Facing, Facing> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    this.mover.face(opposite[playerFacing]);
  }

  update(time: number) {
    if (!this.def.wander || this.talking || this.mover.isMoving) return;
    if (time < this.nextWanderAt) return;
    this.nextWanderAt = time + 1500 + Math.random() * 1500;

    const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
    const [dx, dy] = DELTA[dir];
    const tx = this.tileX + dx;
    const ty = this.tileY + dy;
    // Stay within a small home range so wanderers don't roam off.
    if (Math.abs(tx - this.homeX) + Math.abs(ty - this.homeY) > WANDER_RADIUS) {
      this.mover.face(dir);
      return;
    }
    this.mover.update(dir);
  }

  destroy() {
    this.sprite.destroy();
  }
}
