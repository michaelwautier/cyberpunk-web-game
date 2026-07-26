import { T } from '../systems/textures';

export interface DoorSpec {
  x: number;
  y: number;
  to: string;
  toX: number;
  toY: number;
}

export interface MapDef {
  name: string;
  width: number;
  height: number;
  /** [y][x] visual base layer. */
  ground: number[][];
  /** [y][x] overlay layer; -1 = empty. */
  objects: number[][];
  doors: DoorSpec[];
  spawn: { x: number; y: number };
}

function grid(w: number, h: number, fill: number): number[][] {
  return Array.from({ length: h }, () => Array<number>(w).fill(fill));
}

function makeStreet(): MapDef {
  const W = 40;
  const H = 28;
  const ground = grid(W, H, T.SIDEWALK);
  const objects = grid(W, H, -1);

  // Roads: a cross through the district.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const onVRoad = x >= 18 && x <= 21;
      const onHRoad = y >= 12 && y <= 15;
      if (onVRoad || onHRoad) ground[y][x] = T.ROAD;
    }
  }

  // Four building blocks in the quadrants (surrounded by a sidewalk ring).
  const blocks: [number, number, number, number][] = [
    [2, 2, 16, 10],
    [23, 2, 37, 10],
    [2, 17, 16, 25],
    [23, 17, 37, 25],
  ];
  for (const [x0, y0, x1, y1] of blocks) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        objects[y][x] = y === y0 ? T.NEON : T.WALL;
      }
    }
  }

  // A door on the bottom edge of the top-left block leads into the bar.
  objects[10][8] = T.DOOR;

  return {
    name: 'street',
    width: W,
    height: H,
    ground,
    objects,
    doors: [{ x: 8, y: 10, to: 'bar', toX: 7, toY: 10 }],
    spawn: { x: 8, y: 11 },
  };
}

function makeBar(): MapDef {
  const W = 16;
  const H = 12;
  const ground = grid(W, H, T.FLOOR);
  const objects = grid(W, H, -1);

  // Perimeter walls.
  for (let x = 0; x < W; x++) {
    objects[0][x] = T.INNER_WALL;
    objects[H - 1][x] = T.INNER_WALL;
  }
  for (let y = 0; y < H; y++) {
    objects[y][0] = T.INNER_WALL;
    objects[y][W - 1] = T.INNER_WALL;
  }

  // Bar counter near the top, with a gap to pass behind.
  for (let x = 3; x <= 12; x++) objects[3][x] = T.COUNTER;
  objects[3][8] = -1;

  // Exit door in the bottom wall back to the street.
  objects[H - 1][7] = T.DOOR;

  return {
    name: 'bar',
    width: W,
    height: H,
    ground,
    objects,
    doors: [{ x: 7, y: H - 1, to: 'street', toX: 8, toY: 11 }],
    spawn: { x: 7, y: 9 },
  };
}

export const MAPS: Record<string, () => MapDef> = {
  street: makeStreet,
  bar: makeBar,
};
