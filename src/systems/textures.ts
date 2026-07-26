import Phaser from 'phaser';

export const TILE = 16;

/** Tile indices used by the tilemap layers. */
export const T = {
  VOID: 0,
  ROAD: 1,
  SIDEWALK: 2,
  FLOOR: 3,
  WALL: 4,
  NEON: 5,
  INNER_WALL: 6,
  COUNTER: 7,
  DOOR: 8,
} as const;

export const TILE_COUNT = 9;

/** Object-layer tiles the player cannot walk through. Doors stay walkable. */
export const SOLID_TILES = new Set<number>([T.WALL, T.NEON, T.INNER_WALL, T.COUNTER]);

type Ctx = CanvasRenderingContext2D;

function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawTile(ctx: Ctx, i: number, ox: number) {
  switch (i) {
    case T.VOID:
      px(ctx, ox, 0, TILE, TILE, '#05050a');
      break;

    case T.ROAD:
      px(ctx, ox, 0, TILE, TILE, '#14141d');
      px(ctx, ox, 0, TILE, 1, '#0d0d15');
      // dashed lane marking down the middle
      px(ctx, ox + 7, 2, 2, 4, '#2c2c46');
      px(ctx, ox + 7, 10, 2, 4, '#2c2c46');
      break;

    case T.SIDEWALK:
      px(ctx, ox, 0, TILE, TILE, '#23233a');
      px(ctx, ox, 0, TILE, 1, '#2c2c47');
      px(ctx, ox, 0, 1, TILE, '#2c2c47');
      px(ctx, ox + 4, 5, 1, 1, '#1c1c30');
      px(ctx, ox + 11, 10, 1, 1, '#1c1c30');
      break;

    case T.FLOOR:
      px(ctx, ox, 0, TILE, TILE, '#1a1424');
      px(ctx, ox, 0, TILE, 1, '#241a30');
      px(ctx, ox, 0, 1, TILE, '#241a30');
      px(ctx, ox + 8, 8, 1, 1, '#2c2038');
      break;

    case T.WALL:
      px(ctx, ox, 0, TILE, TILE, '#201826');
      px(ctx, ox, 0, TILE, 2, '#17111c');
      // lit windows
      px(ctx, ox + 3, 4, 3, 3, '#0f8a9e');
      px(ctx, ox + 10, 4, 3, 3, '#0f8a9e');
      px(ctx, ox + 3, 10, 3, 3, '#0a5a68');
      px(ctx, ox + 10, 10, 3, 3, '#0f8a9e');
      break;

    case T.NEON:
      px(ctx, ox, 0, TILE, TILE, '#241030');
      px(ctx, ox, 0, TILE, 2, '#ff2fd6');
      px(ctx, ox, 2, TILE, 1, '#7a1668');
      px(ctx, ox + 3, 6, 3, 3, '#34ffd6');
      px(ctx, ox + 10, 6, 3, 3, '#34ffd6');
      px(ctx, ox + 6, 11, 4, 2, '#ffb43f');
      break;

    case T.INNER_WALL:
      px(ctx, ox, 0, TILE, TILE, '#2a2035');
      px(ctx, ox, 0, TILE, 3, '#3a2d4a');
      px(ctx, ox, TILE - 2, TILE, 2, '#181020');
      break;

    case T.COUNTER:
      px(ctx, ox, 0, TILE, TILE, '#1a1424');
      px(ctx, ox, 3, TILE, 8, '#3a2340');
      px(ctx, ox, 3, TILE, 1, '#ff8a3f');
      px(ctx, ox, 10, TILE, 1, '#7a3a20');
      break;

    case T.DOOR:
      px(ctx, ox, 0, TILE, TILE, '#0d0d16');
      px(ctx, ox + 2, 1, 12, 14, '#10202a');
      // glowing frame
      px(ctx, ox + 2, 1, 12, 1, '#34ffd6');
      px(ctx, ox + 2, 1, 1, 14, '#34ffd6');
      px(ctx, ox + 13, 1, 1, 14, '#34ffd6');
      px(ctx, ox + 6, 6, 4, 8, '#0a3a44');
      break;
  }
}

/** Draws the whole tileset into one horizontal strip texture. */
export function makeTilesetTexture(scene: Phaser.Scene) {
  const canvas = scene.textures.createCanvas('tiles', TILE * TILE_COUNT, TILE);
  if (!canvas) return;
  const ctx = canvas.getContext();
  for (let i = 0; i < TILE_COUNT; i++) drawTile(ctx, i, i * TILE);
  canvas.refresh();
}

const DIRS = ['down', 'up', 'left', 'right'] as const;
export type Facing = (typeof DIRS)[number];

function drawPlayer(ctx: Ctx, facing: Facing) {
  const skin = '#c99a6a';
  const jacket = '#26264a';
  const accent = '#ff2fd6';
  const legs = '#14141f';
  const visor = '#34ffd6';

  // legs
  px(ctx, 5, 12, 2, 3, legs);
  px(ctx, 9, 12, 2, 3, legs);
  // torso / jacket
  px(ctx, 4, 6, 8, 6, jacket);
  px(ctx, 4, 6, 8, 1, accent); // shoulder trim
  // head
  px(ctx, 5, 2, 6, 4, skin);

  switch (facing) {
    case 'down':
      px(ctx, 5, 3, 6, 1, visor);
      break;
    case 'up':
      px(ctx, 5, 2, 6, 2, '#1c1428'); // back of hood
      break;
    case 'left':
      px(ctx, 5, 3, 3, 1, visor);
      px(ctx, 4, 6, 1, 6, '#1c1c38'); // arm forward
      break;
    case 'right':
      px(ctx, 8, 3, 3, 1, visor);
      px(ctx, 11, 6, 1, 6, '#1c1c38');
      break;
  }
}

export function makePlayerTextures(scene: Phaser.Scene) {
  for (const facing of DIRS) {
    const canvas = scene.textures.createCanvas(`player-${facing}`, TILE, TILE);
    if (!canvas) continue;
    drawPlayer(canvas.getContext(), facing);
    canvas.refresh();
  }
}
