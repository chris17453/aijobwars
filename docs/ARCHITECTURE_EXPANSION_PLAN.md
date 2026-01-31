# Architecture Expansion Plan

## Goal
Create a unified foundation to scale AI Job Wars to dozens of levels with improved scoreboarding, richer player features, and modernized controls, while preserving the existing virtual viewport (1920x1080), render pipeline, and modal architecture.

## Current Strengths (to keep)
- Virtual 1920×1080 viewport with scaling and letterboxing
- Centralized input, rendering, and scaling utilities
- Modal/window system for screens and overlays
- Cutscene engine and asset loader

## Expansion Pillars
1) **Levels & Content Pipeline**
   - Introduce a **Level Schema** (JSON) for spawn lists, enemy mixes, pacing curves, and scripted events.
   - Add a **Level Registry** that enumerates levels, difficulty tiers, and unlock rules.
   - Create **Content Packs** (assets + level JSON) that can be loaded dynamically to avoid code changes for new levels.
   - Extend `logic/level.js` to consume the schema and support reusable wave templates.

2) **Scoreboarding & Progression**
   - Standardize a **Score Event Bus** so kills/objectives emit events; HUD and backend listen without tight coupling.
   - Add **Run Metadata** (difficulty, ship loadout, seed) to each score submission for fair leaderboards.
   - Support **Seasonal/Weekly Boards** by namespacing leaderboard keys on the backend.
   - Add **Client-side Persistence** (localStorage) for offline highscores with sync when online.

3) **Player Features & Loadouts**
   - Define **Ship Loadout Configs** (primary, secondary, passive mods) that map to stats and visuals.
   - Add **Progression Hooks** (xp, unlock tokens) decoupled from the moment-to-moment loop.
   - Introduce **Difficulty Modifiers** (enemy HP/damage, spawn rate, bullet speed) derived from level/season settings.

4) **Controls & Accessibility**
   - Expand **InputManager** to support remappable keys, presets, and optional gamepad mapping.
   - Add **Accessibility Toggles**: reduced flashing, colorblind palettes, and aim assist strength.
   - Provide **Pause Menu Settings** backed by localStorage for persistence.

## Milestones
- **M1: Level Framework**
  - Land Level Schema + Registry
  - Update `logic/level.js` to load schema-defined waves
  - Add 3 sample levels + a boss template
- **M2: Scoreboarding**
  - Implement Score Event Bus and backend payload changes
  - Add local/seasonal leaderboards UI toggle
  - Store run metadata with submissions
- **M3: Player Features**
  - Add loadout selection screen + starter loadouts
  - Wire difficulty modifiers into spawn/scaling math
  - Persist settings and unlocks locally
- **M4: Controls & Accessibility**
  - Remappable keys/gamepad
  - Accessibility toggles surfaced in pause/settings modals
  - Add aim-assist optionality and flashing reduction

## Compatibility & Risk
- Keep existing entry points, modal flow, and viewport; new systems must be additive.
- Favor schema/config-driven changes to avoid breaking legacy content.
- Gate new features behind defaults that mirror current behavior.

## Success Criteria
- New levels can be added via JSON + assets without code edits.
- Leaderboards accept runs with metadata and support seasonal rotation.
- Players can pick loadouts and persist settings across sessions.
- Controls are remappable with accessibility options available in-game.
