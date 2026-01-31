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
   - Land Level Schema + Registry ✅
   - Update `logic/level.js` to load schema-defined waves ✅
   - Add 3 sample levels + a boss template ⚠️ (1 sample added in default pack)
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

## Level Roadmap (12 New Levels)
- **L1: Orbital Onboarding** — tutorialized dogfights, intro cutscene sets stakes; outro cutscene unlocks next tier.
- **L2: Debris Drift** — asteroid field with timed mine clears; cutscene shows salvage briefing and debrief.
- **L3: Factory Siege** — interior conveyor hazards; cutscene introduces sabotage objective and exit evac.
- **L4: Signal Scramble** — jammer nodes disable radar until destroyed; cutscene frames intel op and data exfil.
- **L5: Glacier Run** — ice caves with sliding physics; cutscene highlights environmental risk and victory escape.
- **L6: Stormfront Skies** — lightning that chains across enemies; cutscene tees up weather tech and aftermath.
- **L7: Crimson Armada** — elite squadron mini-bosses; cutscene sets rival aces and surrender scene.
- **L8: Relay Heist** — escort hack drone, defend uplink; cutscene briefs hack route and success transmission.
- **L9: Bioforge Breach** — organic turrets, corrosive pools; cutscene reveals mutation threat and seal-off.
- **L10: Quantum Rift** — teleporting enemies and shifting lanes; cutscene explains anomaly entry/closure.
- **L11: Dreadnought Hull** — multi-phase capital ship assault; cutscene stakes boarding and extraction.
- **L12: Nexus Showdown** — final boss with layered mechanics; opening cutscene recaps campaign, finale cinematic on win.

### Cutscene Requirements
- Every level plays a start **and** finish cutscene via the cinematic engine before gameplay and after objectives.
- Cutscenes are declared in the level schema (intro/outro handles) and loaded by the Level Registry.
- Default fallback cutscenes exist per tier to avoid missing assets; level JSON references validated at load.

### Media Player Enhancements
- Reuse the existing cinematic/media player for level cutscenes with:
  - **Playlist support** (intro + optional mid-mission + outro) driven by schema.
  - **Async preload hints** for video/audio so start cutscenes are gapless.
  - **Skip/Resume hooks** that respect accessibility settings and persist last-seen cutscene per level.
- Media player is bundled as a shared service (no UI duplication) and exposed to the modal system for consistent controls.
