# Asset Packages

This directory contains all game assets organized into swappable packages.

## Directory Structure

```
asset_packages/
└── default/                    # Default asset package (v1.0.0)
    ├── ui/
    │   ├── spritesheets/      # UI sprite atlases (UI1.png, UI4.png)
    │   └── backgrounds/       # Menu/dialog backgrounds
    │       ├── landscape/     # 16:9 aspect backgrounds
    │       └── portrait/      # 9:16 aspect backgrounds
    ├── fonts/                 # Bitmap fonts (blue, grey, red)
    ├── ships/                 # Player and enemy ship sprites
    ├── projectiles/           # Weapon projectile sprites
    ├── debris/                # Destructible objects
    ├── explosions/            # Explosion sprites and audio
    ├── blocks/                # Obstacle sprites
    ├── scenes/                # Background scenes
    ├── audio/
    │   ├── ship/             # Ship sound effects
    │   └── projectiles/      # Weapon sound effects
    ├── storyboard/
    │   ├── intro/            # Intro cinematic
    │   │   ├── images/       # Cinematic frames
    │   │   ├── tracks/       # Voice over audio
    │   │   └── intro_scene.json
    │   └── credits/          # Credits cinematic
    │       ├── images/       # Cinematic frames
    │       ├── tracks/       # Background music
    │       └── credits.json
    ├── levels/               # Level data files
    ├── data/                 # Game data (highscores, etc.)
    └── title/                # Title screen graphics
```

## Creating New Asset Packages

To create a new asset package (e.g., for different languages or visual themes):

1. Copy the `default` directory:
   ```bash
   cp -r default my_package_name
   ```

2. Replace assets in the new directory with your custom versions

3. Update the package metadata in your custom `ASSETS.json`:
   - Change `package_name` to your package name
   - Change `package_version` as needed
   - Update `description`

4. All asset paths in `ASSETS.json` should point to:
   ```
   static/asset_packages/my_package_name/...
   ```

## Asset Package Versioning

- **Package Version**: Semantic versioning (e.g., 1.0.0)
- **Package Name**: Unique identifier (e.g., "default", "holiday_theme", "spanish")

## Using Asset Packages

The game loads assets from `static/ASSETS.json` which references the active package. To switch packages, update all paths in `ASSETS.json` to point to the new package directory.

## Asset Requirements

- **UI Backgrounds**: Must have both `_landscape` and `_portrait` versions
- **Sprites**: PNG format with transparency
- **Audio**: MP3 or WAV format
- **Storyboard Images**: WebP format recommended for size
- **JSON Data**: Must maintain same structure as original files


