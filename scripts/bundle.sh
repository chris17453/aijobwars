#!/bin/bash
js_files=(
    "./html/static/js/dpss_intro.js"
    "./html/static/js/windows/dpss_font.js"
    "./html/static/js/windows/dpss_sprites.js"
    "./html/static/js/windows/dpss_button.js"
    "./html/static/js/windows/dpss_modal.js"
    "./html/static/js/dpss_viewport.js"
    "./html/static/js/objects/dpss_object.js"
    "./html/static/js/objects/dpss_explosion.js"
    "./html/static/js/objects/dpss_debris.js"
    "./html/static/js/objects/dpss_projectile.js"
    "./html/static/js/objects/dpss_ship.js"
    "./html/static/js/input/dpss_kb.js"
    "./html/static/js/input/dpss_events.js"
    "./html/static/js/dpss_audio.js"
    "./html/static/js/logic/dpss_fire_control.js"
    "./html/static/js/dpss_level.js"
    "./html/static/js/dpss_ui.js"
    "./html/static/js/dpss_client.js"
    "./html/static/js/dpss_graphics.js"
    "./html/static/js/logic/dpss_collision_manager.js"
    "./html/static/js/dpss_game.js"
)

# Find all JavaScript files in subdirectories
#js_files=$(find html/static/js/ -type f -name "*.js")

# Concatenate all JavaScript files into one bundle
cat "${js_files[@]}" > html/static/js/bundle.js


# Minify the bundle using uglifyjs
uglifyjs html/static/js/bundle.js -o html/static/js/bundle.min.js

# Optionally, remove the intermediate bundle.js file
# rm bundle.js
