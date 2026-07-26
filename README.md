# Neon Grid

A browser-playable, pixel-art, top-down RPG set in a cyberpunk universe — in the tradition of Game Boy–era Pokémon (grid movement, tile maps, dialog boxes, turn-based encounters), reimagined in a neon-drenched dystopian city.

Fully client-side: no backend, static bundle, deployable anywhere.

## Tech Stack

- [Phaser 3](https://phaser.io/) — 2D game engine (tilemaps, sprites, input, camera)
- TypeScript
- [Vite](https://vitejs.dev/) — dev server & build

## Getting Started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (defaults to `http://localhost:5173`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build a production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
  main.ts               // Phaser game config + scene registration
  scenes/
    WorldScene.ts        // overworld: player, movement
  systems/
    Controls.ts           // input handling
```

See [PLAN.md](./PLAN.md) for the full design doc, architecture, and milestone roadmap.

## Status

Early skeleton (M0): a controllable player renders in a scene. Tile maps, NPCs, dialog, combat, and RPG systems are not yet implemented — see the milestones in [PLAN.md](./PLAN.md).
