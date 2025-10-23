#!/bin/bash

js_files=(
"./html/static/js/core/events.js"
"./html/static/js/core/containers.js"
"./html/static/js/core/asset_loader.js"
"./html/static/js/rendering/audio.js"
"./html/static/js/rendering/sprites.js"
"./html/static/js/rendering/font.js"
"./html/static/js/ui/components/button.js"
"./html/static/js/ui/components/seekbar.js"
"./html/static/js/ui/modals/modal.js"
"./html/static/js/core/viewport.js"
"./html/static/js/core/window_manager.js"
"./html/static/js/core/graphics.js"
"./html/static/js/core/kb.js"
"./html/static/js/ui/screens/menu.js"
"./html/static/js/objects/motion.js"
"./html/static/js/objects/object.js"
"./html/static/js/objects/explosion.js"
"./html/static/js/objects/debris.js"
"./html/static/js/objects/projectile.js"
"./html/static/js/objects/missiles.js"
"./html/static/js/objects/mine.js"
"./html/static/js/objects/ship.js"
"./html/static/js/objects/boss.js"
"./html/static/js/objects/enemy.js"
"./html/static/js/objects/powerup.js"
"./html/static/js/logic/fire_control.js"
"./html/static/js/logic/level.js"
"./html/static/js/logic/ui.js"
"./html/static/js/ui/modals/help.js"
"./html/static/js/ui/modals/prologue.js"
"./html/static/js/ui/modals/high_scores.js"
"./html/static/js/ui/modals/credits.js"
"./html/static/js/ui/components/ui_component.js"
"./html/static/js/ui/components/percentage_bar.js"
"./html/static/js/ui/screens/pause.js"
"./html/static/js/ui/modals/cinematic_player.js"
"./html/static/js/cinematic/scene.js"
"./html/static/js/ui/screens/game.js"
"./html/static/js/ui/screens/boss_mode.js"
"./html/static/js/ui/screens/title_screen.js"
"./html/static/js/ui/screens/intro.js"
)
# Find all JavaScript files in subdirectories
#js_files=$(find html/static/js/ -type f -name "*.js")

# Concatenate all JavaScript files into one bundle
cat "${js_files[@]}" > html/static/js/bundle.js


# Minify the bundle using uglifyjs
uglifyjs html/static/js/bundle.js -o html/static/js/bundle.min.js

# Optionally, remove the intermediate bundle.js file
# rm bundle.js
