import { Facing } from '../systems/textures';

export interface NpcDef {
  id: string;
  map: string;
  x: number;
  y: number;
  /** Sprite key prefix; see NPC_PALETTES in textures.ts. */
  sprite: string;
  facing: Facing;
  name: string;
  /** Dialog tree key; see DIALOGS in dialogs.ts. */
  dialog: string;
  wander?: boolean;
}

export const NPCS: NpcDef[] = [
  {
    id: 'vex',
    map: 'street',
    x: 11,
    y: 11,
    sprite: 'npc-vex',
    facing: 'down',
    name: 'VEX',
    dialog: 'vex',
  },
  {
    id: 'glitch',
    map: 'street',
    x: 14,
    y: 11,
    sprite: 'npc-glitch',
    facing: 'left',
    name: 'GLITCH',
    dialog: 'glitch',
    wander: true,
  },
  {
    id: 'rix',
    map: 'bar',
    x: 8,
    y: 3,
    sprite: 'npc-rix',
    facing: 'down',
    name: 'RIX',
    dialog: 'rix',
  },
];

export function npcsForMap(map: string): NpcDef[] {
  return NPCS.filter((n) => n.map === map);
}
