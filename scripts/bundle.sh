#!/bin/bash

js_files=(
"./html/static/js/windows/dpss_events.js"
"./html/static/js/windows/dpss_containers.js"
"./html/static/js/windows/dpss_audio.js"
"./html/static/js/windows/dpss_sprites.js"
"./html/static/js/windows/dpss_font.js"
"./html/static/js/windows/dpss_button.js"
"./html/static/js/windows/dpss_modal.js"
"./html/static/js/windows/dpss_viewport.js"
"./html/static/js/windows/dpss_window_manager.js"
"./html/static/js/windows/dpss_graphics.js"
"./html/static/js/ui/dpss_menu.js"
"./html/static/js/objects/dpss_motion.js"
"./html/static/js/objects/dpss_object.js"
"./html/static/js/objects/dpss_explosion.js"
"./html/static/js/objects/dpss_debris.js"
"./html/static/js/objects/dpss_projectile.js"
"./html/static/js/objects/dpss_ship.js"
"./html/static/js/windows/dpss_kb.js"
"./html/static/js/logic/dpss_fire_control.js"
"./html/static/js/logic/dpss_collision_manager.js"
"./html/static/js/logic/dpss_level.js"
"./html/static/js/logic/dpss_ui.js"
"./html/static/js/ui//dpss_help.js"
"./html/static/js/ui/dpss_prologue.js"
"./html/static/js/ui/dpss_high_scores.js"
"./html/static/js/ui/dpss_credits.js"
"./html/static/js/ui-components//dpss_percentage_bar.js"
"./html/static/js/ui/dpss_pause.js"
"./html/static/js/cinematic/dpss_scene.js"
"./html/static/js/ui/dpss_game.js"
"./html/static/js/dpss_intro.js"
)
# Find all JavaScript files in subdirectories
#js_files=$(find html/static/js/ -type f -name "*.js")

# Concatenate all JavaScript files into one bundle
cat "${js_files[@]}" > html/static/js/bundle.js


# Minify the bundle using uglifyjs
uglifyjs html/static/js/bundle.js -o html/static/js/bundle.min.js

# Optionally, remove the intermediate bundle.js file
# rm bundle.js
