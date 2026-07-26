# Project Plan — "Neon Grid" (working title)

A browser-playable, pixel-art, top-down RPG set in a cyberpunk universe, in the visual and gameplay tradition of Game Boy–era Pokémon (grid movement, tile maps, dialog boxes, turn-based encounters) but with a neon-drenched dystopian setting.

---

## 1. Vision & Pillars

- **Look:** 16×16 (or 32×32) pixel-art tiles, top-down orthographic view, limited neon palette (deep purples/blues + cyan/magenta/amber accents), CRT-ish glow optional.
- **Feel:** Grid-based movement, snappy 4-direction walking, NPCs to talk to, buildings to enter, a city to explore.
- **Setting:** A megacity district — street level (markets, bars, alleys), corporate towers, an "undercity". Factions: megacorp, street gangs, netrunner collective.
- **Core loop (MVP):** Explore → talk to NPCs → accept quests → fight turn-based encounters (vs. rogue drones / gangers) → earn credits/upgrades → unlock new areas.

## 2. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Engine | **Phaser 3** | Batteries-included 2D web engine: tilemaps, sprites, input, audio, camera. Huge ecosystem, runs everywhere a browser runs. |
| Language | **TypeScript** | Type safety pays off fast in RPG data (items, quests, dialog trees). |
| Bundler/dev server | **Vite** | Instant HMR, trivial static build for deploy. |
| Map editing | **Tiled** (free desktop editor) | Exports JSON that Phaser loads natively; layers, collision, object placement. |
| Art | **Aseprite** (or free packs to start) | Standard pixel-art tool. Placeholder: free cyberpunk tilesets from itch.io (e.g., "Cyberpunk City" packs, CC0) until custom art. |
| Audio | Web Audio via Phaser; chiptune/synthwave loops | Free packs to start (e.g., itch.io / OpenGameArt CC0). |
| State/save | `localStorage` (JSON snapshot) | Zero backend; good enough for single-player. |
| Deploy | Static hosting (GitHub Pages / Netlify / Vercel) | The whole game is a static bundle. |

No backend at all for the MVP — fully client-side.

## 3. Architecture

```
src/
  main.ts               // Phaser game config + scene registration
  scenes/
    BootScene.ts        // asset preloading, loading bar
    WorldScene.ts       // overworld: tilemap, player, NPCs, triggers
    BattleScene.ts      // turn-based combat, launched over the world
    UIScene.ts          // persistent HUD, dialog box, menus (runs in parallel)
  systems/
    GridMovement.ts     // tile-to-tile movement w/ input buffering
    Dialog.ts           // typewriter dialog engine, branching choices
    QuestLog.ts         // quest state machine
    Inventory.ts        // items, credits, equipment
    SaveGame.ts         // serialize/restore to localStorage
    Battle.ts           // turn resolution, stats, damage formulas
  data/
    npcs.json           // NPC definitions: sprite, dialog id, schedule
    dialogs.json        // dialog trees (nodes, choices, quest hooks)
    quests.json         // objectives, rewards, prerequisites
    items.json          // consumables, gear, key items
    enemies.json        // stats, movesets, loot tables
  assets/
    tilesets/  maps/  sprites/  audio/  ui/
```

Key design decisions:
- **Data-driven content.** NPCs, dialogs, quests, items, enemies are JSON — adding content never means touching engine code.
- **Scene separation.** `UIScene` renders on top of `WorldScene` so HUD/dialog survive map transitions. `BattleScene` pauses (not destroys) the world.
- **Grid movement as a system,** not baked into the player: NPCs reuse it for wandering/patrol.
- **Trigger objects in Tiled** (door → map transition, zone → encounter chance, NPC spawn points) so level design lives in the editor.

## 4. Milestones

### M0 — Skeleton (day 1)
- Vite + TypeScript + Phaser project scaffold, ESLint/Prettier.
- Blank scene renders, deploys locally with `npm run dev`.
- ✅ *Done when: a colored rectangle "player" moves on screen in the browser.*

### M1 — Walkable World ✅ DONE
- ~~Load a Tiled map (placeholder cyberpunk tileset) with ground/walls/above-player layers.~~ **Deviation:** the tileset + character sprites are generated procedurally at boot (`systems/textures.ts`) and maps are authored in-code (`data/maps.ts`) so M1 is fully self-contained — no external asset download or Tiled install required yet. The map loader stays modular, so real Tiled/PNG assets can drop in later without touching movement/transition code.
- ✅ Grid-based tile-to-tile 4-direction movement (`systems/GridMovement.ts`), collision via solid-tile lookup, camera follow with lerp, map bounds.
- ✅ Map transitions (street ↔ bar interior) via in-map door objects with fade in/out.
- ✅ *Verified in-browser:* spawn → walk all 4 directions → walls block → enter door → land in bar at correct tile → exit door → back to street. No console errors.

### M2 — People & Words ✅ DONE
- ✅ NPC entities from `data/npcs.ts` (`systems/Npc.ts`): distinct palettes, wander within a home radius, block movement, face the player on interact.
- ✅ Dialog engine (`systems/Dialog.ts`): typewriter text, speaker portrait, branching choices with a cursor; drives itself from `data/dialogs.ts` trees.
- ✅ Interaction key (Space / E / Enter) targets the tile the player faces.
- ✅ *Verified in-browser:* three NPCs (VEX, GLITCH, RIX) across street + bar; branching flow tested — navigate choices, pick the 3rd option, land on the correct branch node, close and reset. No console errors.

### M3 — Combat (days 8–12)
- Turn-based battle scene (Pokémon-style: menu of actions, enemy front view or side view).
- Stats (HP, ATK, DEF, SPD), 3–4 abilities, damage formula, win/lose/flee.
- Encounter triggers: fixed encounters first; random zone encounters optional.
- ✅ *Done when: a street fight vs. a rogue drone can be won and lost.*

### M4 — RPG Systems (days 13–17)
- Inventory + items (medkits, gear with stat bonuses), credits currency.
- Quest log: at least one multi-step quest (talk → fetch/fight → return → reward).
- Save/load to localStorage; pause menu.
- ✅ *Done when: full loop — quest accepted, fight won, reward received, game saved and restored.*

### M5 — Vertical Slice Polish (days 18–21)
- One polished district (~3 maps), 5+ NPCs, 2 quests, 3 enemy types.
- Music + SFX, title screen, screen transitions, ambient neon animations (flickering signs, rain overlay).
- Deploy to public URL.
- ✅ *Done when: a stranger can play 15 minutes in a browser and get it.*

### Post-slice backlog (later)
Leveling/XP, cyberware upgrade tree (the "evolutions" of this world), hacking mini-game, faction reputation, day/night cycle, more districts, gamepad support, mobile touch controls.

## 5. Risks & Mitigations

- **Art is the biggest time sink.** → Start with free CC0 cyberpunk tilesets; only commission/draw custom art after the slice proves fun.
- **Scope creep (RPGs are bottomless).** → The milestone gates above are the contract; nothing from the backlog before M5 ships.
- **Combat balance.** → Keep formulas dead simple (linear) until content exists to balance against.
- **Browser perf.** → Phaser handles this scale easily; keep maps ≤100×100 tiles and use texture atlases.

## 6. Immediate Next Steps

1. `npm create vite@latest` scaffold with TypeScript, add Phaser (M0).
2. Grab a CC0 cyberpunk tileset + character sprites from itch.io.
3. Build the first street map in Tiled.
4. Implement grid movement (M1).
