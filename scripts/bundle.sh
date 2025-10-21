#!/bin/bash

js_files=(
"./html/static/js/windows/events.js"
"./html/static/js/windows/containers.js"
"./html/static/js/windows/audio.js"
"./html/static/js/windows/sprites.js"
"./html/static/js/windows/font.js"
"./html/static/js/windows/button.js"
"./html/static/js/windows/modal.js"
"./html/static/js/windows/viewport.js"
"./html/static/js/windows/window_manager.js"
"./html/static/js/windows/graphics.js"
"./html/static/js/ui/menu.js"
"./html/static/js/objects/motion.js"
"./html/static/js/objects/object.js"
"./html/static/js/objects/explosion.js"
"./html/static/js/objects/debris.js"
"./html/static/js/objects/projectile.js"
"./html/static/js/objects/ship.js"
"./html/static/js/windows/kb.js"
"./html/static/js/logic/fire_control.js"
"./html/static/js/logic/collision_manager.js"
"./html/static/js/logic/level.js"
"./html/static/js/logic/ui.js"
"./html/static/js/ui//help.js"
"./html/static/js/ui/prologue.js"
"./html/static/js/ui/high_scores.js"
"./html/static/js/ui/credits.js"
"./html/static/js/ui-components//percentage_bar.js"
"./html/static/js/ui/pause.js"
"./html/static/js/cinematic/scene.js"
"./html/static/js/ui/game.js"
"./html/static/js/intro.js"
)
# Find all JavaScript files in subdirectories
#js_files=$(find html/static/js/ -type f -name "*.js")

# Concatenate all JavaScript files into one bundle
cat "${js_files[@]}" > html/static/js/bundle.js


# Minify the bundle using uglifyjs
uglifyjs html/static/js/bundle.js -o html/static/js/bundle.min.js

# Optionally, remove the intermediate bundle.js file
# rm bundle.js
