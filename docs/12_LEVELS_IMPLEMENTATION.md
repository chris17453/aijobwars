# AI Job Wars - 12 Level Implementation

This document describes the complete 12-level game structure with intro/outro cutscenes for each level.

## Overview

The game now features 12 progressive levels, each with:
- **Unique theme** related to job searching/workplace challenges
- **Introductory cutscene** setting up the level's narrative
- **Gameplay level** with distinct enemy patterns and difficulty
- **Exit cutscene** celebrating victory and story progression
- **Progressive difficulty** across 4 tiers

## Level Structure

### Tier 1 (Levels 1-3) - Tutorial/Easy
- **L1: Orbital Onboarding** - Introduction to space combat
- **L2: Resume Rapids** - Navigate through resume document storm  
- **L3: LinkedIn Labyrinth** - Escape professional networking maze

### Tier 2 (Levels 4-6) - Moderate
- **L4: Application Asteroid** - Dodge endless job applications
- **L5: Meeting Mayhem** - Survive virtual meeting bombardment
- **L6: ChatGPT Cluster** - Face AI intelligence swarm (mini-boss)

### Tier 3 (Levels 7-9) - Hard
- **L7: Email Onslaught** - Navigate overwhelming email flood
- **L8: PDF Pandemonium** - Battle through document madness
- **L9: Phone Phalanx** - Withstand synchronized call attack

### Tier 4 (Levels 10-12) - Expert
- **L10: Webex Warfare** - Face corporate meeting platform (boss)
- **L11: Teams Terror** - Survive collaboration overload (boss)
- **L12: Interview Inferno** - Ultimate final boss challenge

## File Structure

```
html/static/asset_packages/default/
├── levels/
│   ├── registry.json                    # Master level registry
│   ├── l1_orbital_onboarding.json      # Level 1 gameplay
│   ├── l2_resume_rapids.json           # Level 2 gameplay
│   ├── l3_linkedin_labyrinth.json      # Level 3 gameplay
│   ├── l4_application_asteroid.json    # Level 4 gameplay
│   ├── l5_meeting_mayhem.json          # Level 5 gameplay
│   ├── l6_chatgpt_cluster.json         # Level 6 gameplay (mini-boss)
│   ├── l7_email_onslaught.json         # Level 7 gameplay
│   ├── l8_pdf_pandemonium.json         # Level 8 gameplay
│   ├── l9_phone_phalanx.json           # Level 9 gameplay
│   ├── l10_webex_warfare.json          # Level 10 gameplay (boss)
│   ├── l11_teams_terror.json           # Level 11 gameplay (boss)
│   └── l12_interview_inferno.json      # Level 12 gameplay (final boss)
├── storyboard/
│   └── levels/
│       ├── l2_intro.json               # Level 2 intro cutscene
│       ├── l2_outro.json               # Level 2 outro cutscene
│       ├── l3_intro.json               # Level 3 intro cutscene
│       ├── l3_outro.json               # Level 3 outro cutscene
│       ├── ... (l4-l12 intro/outro)    # Remaining cutscenes
│       ├── images/                     # PLACEHOLDER directory for images
│       └── audio/                      # PLACEHOLDER directory for audio
├── media_assets.json                    # Complete asset specification
└── ASSETS.json                          # Updated asset paths

```

## Level Design Details

Each level JSON file contains:
- `id`: Unique level identifier
- `name`: Display name
- `tier`: Difficulty tier (tier1-tier4)
- `background`: Background image reference
- `music`: Background music reference
- `speed`: Scroll speed (4-10, increasing with difficulty)
- `grid`: 24-row ASCII grid layout with enemy/obstacle placement
- `waves`: Enemy spawn patterns
- `cutscenes`: Links to intro/outro scenes

### Enemy/Obstacle Character Codes
- `.` = Boundary block
- `p` = PDF document debris
- `e` = Email debris
- `c` = Phone call debris
- `w` = Webex debris
- `t` = Teams debris (ship)
- `l` = LinkedIn debris
- `z` = Zoom debris
- `R` = Resume enemy (ship)
- `L` = LinkedIn enemy (ship)
- `g` = ChatGPT enemy (ship)
- `a` = Application enemy (ship)
- `i` = Interview boss
- `h` = Health powerup
- `s` = Shield powerup
- `W` = Weapon powerup
- `P` = Player starting position

## Cutscene Structure

Each cutscene JSON contains:
- **slide**: Scene identifier
- **images**: Array of image frames with timing
  - `path`: File path (PLACEHOLDER)
  - `timestamp`: Start time
  - `duration`: Display duration
  - `comment`: Description of visual content
- **audio**: Array of audio tracks
  - `path`: File path (PLACEHOLDER)
  - `timestamp`: Start time
  - `duration`: Audio length
  - `comment`: Narration description
- **text**: Array of subtitle words with timing
- **metadata**: Level info, theme, visual/audio notes

## Asset Requirements

### Transparency
**CRITICAL**: All visual assets MUST support transparency (alpha channel):
- Images: WebP or PNG format with alpha channel
- Videos: WebM or MP4 with transparency support
- Purpose: Enables multi-layer composition in media player

### Formats
- **Images**: WebP (preferred) or PNG with alpha channel
- **Audio**: MP3 (preferred) or OGG
- **Video**: WebM or MP4 with transparency

### Resolutions
- **Backgrounds**: 1920x1080 or higher
- **Sprites/Icons**: Variable, optimized for display
- **UI Elements**: Native resolution with transparent backgrounds

## Asset Generation Guide

See `media_assets.json` for complete specifications:
- 22 placeholder images required (2 per level for L2-L12)
- 22 placeholder audio tracks required (2 per level for L2-L12)
- Each asset includes:
  - Exact file path
  - Type and format
  - Transparency requirements
  - Detailed description
  - Visual style guide
  - Script suggestions for audio

### Asset Status
- **EXISTS**: Asset already implemented
- **PLACEHOLDER**: Requires generation

### Priority for Asset Generation
1. **High Priority**: Levels 2-6 (establish game flow)
2. **Medium Priority**: Levels 7-9 (mid-game content)
3. **Lower Priority**: Levels 10-12 (end-game polish)

## Registry Configuration

The `registry.json` file manages:
- Default level path
- Default difficulty modifiers
- Default player loadout
- All 12 levels with:
  - ID and display name
  - Difficulty tier
  - Level file path
  - Intro/outro cutscene paths
  - Difficulty modifiers (hp, damage, speed)
  - Unlock requirements (sequential progression)

### Difficulty Progression
- **Tier 1**: 1.0x modifiers (baseline)
- **Tier 2**: 1.2x modifiers (20% harder)
- **Tier 3**: 1.5x modifiers (50% harder)
- **Tier 4**: 2.0-2.5x modifiers (100-150% harder)

## Implementation Features

### Modular Design
- Each level is self-contained
- Easy to add new levels
- Cutscenes can be updated independently
- Assets referenced through semantic keys

### Multi-Level Tiered Approach
- Progressive difficulty scaling
- Unlock system ensures sequential progression
- Varied enemy types per tier
- Boss battles at tier transitions

### Media Player Integration
- Timeline-based cutscene playback
- Audio synchronization with text
- Transparent overlay support for effects
- Smooth transitions between scenes

### Future Expansion
- Add new levels by creating JSON files
- Update registry.json with new level entries
- Generate corresponding cutscene files
- Asset paths remain consistent

## Testing

To test level loading:
1. Start game and check level registry loads
2. Verify level selection shows all 12 levels
3. Test level 1 loads and plays correctly
4. Check intro cutscene plays before level start
5. Verify outro cutscene plays after level completion
6. Confirm progression to next level unlocks

## Asset Directory Setup

Create placeholder directories:
```bash
mkdir -p html/static/asset_packages/default/storyboard/levels/images
mkdir -p html/static/asset_packages/default/storyboard/levels/audio
```

## Integration Notes

- Game uses existing `level.js` class for gameplay
- Cutscenes use existing cinematic engine
- All assets referenced through ASSETS.json
- No code changes required for basic functionality
- Placeholder assets allow testing structure before final art

## Summary

This implementation provides:
✅ 12 complete game levels with distinct themes
✅ 24 cutscene files (intro + outro for each level)
✅ Progressive difficulty across 4 tiers
✅ Comprehensive asset specification (media_assets.json)
✅ Transparent asset support for layering
✅ Modular, expandable architecture
✅ Sequential unlock progression
✅ Clear documentation for asset generation

The game structure is complete and ready for asset generation and testing!
