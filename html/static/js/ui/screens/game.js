class game extends modal{
    layout(){
        this.active=true;
        this.ok=false
        this.cancel=false
        this.closeButton=true;
        this.no_close=true;  // Prevent default ESC close - we handle it custom with pause
        this.title="Level - 1";
        this.text="";

        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.boss_mode_activated = false;
        this.pause_game = false;

        // Death animation tracking
        this.player_dying = false;
        this.death_started_time = 0;
        this.death_explosion_duration = 2000; // 2 seconds for explosion to finish

        // Score tracking
        this.score = 0;
        this.kills = 0;
        this.run_metadata = { difficulty: "tier1", loadout: "starter", seed: Date.now() };

        // Boss spawn tracking
        this.boss_spawned = false;
        this.boss_spawn_threshold = 500; // Spawn boss when this close to level end
        this.active_boss = null;

        // Win condition
        this.player_won = false;

        // Test mode - set to true to start near end of level
        this.test_mode = false;

        this.ui = new ui(this.ctx, this);
        this.level = new level(this.window_manager);

        // Load level from ASSETS.json with optional registry metadata
        const registry = this.graphics.asset_loader.get('levels.registry') || {};
        const selected = registry.default || this.graphics.asset_loader.get('levels.level_data');
        const difficulty = registry.default_difficulty || { hp: 1, damage: 1, speed: 1 };
        const loadout = registry.default_loadout || null;
            this.level.load(selected, { difficulty_modifiers: difficulty, loadout_config: loadout, registry });
        this.level.on("loaded",this.start_level.bind(this));

        // Create HUD bars as children of this modal
        // Just specify their RELATIVE position - parent will handle absolute positioning
        this.laser_bar   = new percentage_bar_fluid(this, this.graphics, new rect(10, 10+1*50, 200, 40), "bar", "bar-red-fluid");
        this.missile_bar = new percentage_bar_fluid(this, this.graphics, new rect(30, 10+2*50, 200, 40), "bar", "bar-orange-fluid");
        this.booster_bar = new percentage_bar_fluid(this, this.graphics, new rect(30, 10+3*50, 200, 40), "bar", "bar-blue-fluid");
        this.shield_bar  = new percentage_bar_fluid(this, this.graphics, new rect(10, 10+4*50, 200, 40), "bar", "bar-blue-fluid");
        this.health_bar  = new percentage_bar_fluid(this, this.graphics, new rect(10, 10+5*50, 200, 40), "bar", "bar-green-fluid");

        // Add bars to parent's ui_components array for automatic management
        this.ui_components.push(this.laser_bar, this.missile_bar, this.booster_bar, this.shield_bar, this.health_bar);

        // NOW call resize and add_buttons AFTER components are created
        this.resize();
        this.add_buttons();
        this.no_skin();

        // Listen to modal's keyboard events
        this.on("keys", (data) => {
            this.handle_game_keys(data.kb);
        });

        // Override ESC key to pause instead of close
        this.on("escape", (event) => {
            event.defaultPrevented = true;  // Prevent modal from closing
            this.handle_escape();
        });

        this.render_callback(this.updateFrame.bind(this));

    }

    resize(){
        // Use virtual viewport dimensions (logical pixels, not physical)
        let x = 0;
        let y = 0;
        let window_width = this.graphics.viewport.virtual.width;
        let window_height = this.graphics.viewport.virtual.height;
        this.position = new rect(x, y, window_width, window_height, "left", "top");

        // Game window has no_skin(), so internal_rect equals position (no padding)
        this.internal_rect = new rect(0, 0, this.position.width, this.position.height, "left", "top");

        // Create render positions
        this.render_position = this.position.clone();
        this.render_internal_rect = this.internal_rect.clone();

        // Add positions together (in this case, both are at 0,0 so it doesn't change anything)
        this.render_internal_rect.add(this.render_position);

        // Resize all ui_components with game window position as anchor (no padding)
        for (let i = 0; i < this.ui_components.length; i++) {
            if (this.ui_components[i].resize) {
                this.ui_components[i].resize(this.render_position);
            }
        }

        // Resize close button if it exists
        if (this.closeButton && typeof this.closeButton.resize === 'function') {
            this.closeButton.resize(this.render_position);
        }
    }

    render() {
        // Call parent render first (renders game content via updateFrame callback)
        super.render();

        // NOW draw the border on top of everything
        this.draw_viewport_border();
    }







    check_mine_proximity() {
        if (!this.level.spaceship) return;

        // Check all mines for proximity to player
        for (let i = 0; i < this.level.npc.length; i++) {
            const npc = this.level.npc[i];
            if (npc.type !== "mine") continue;
            if (!npc.armed) continue;

            // Check if player is in proximity range
            if (npc.check_proximity(this.level.spaceship)) {
                console.log('[Game] Mine proximity triggered!');

                // Damage player based on mine's explosion damage
                const dx = this.level.spaceship.position.x - npc.position.x;
                const dy = this.level.spaceship.position.y - npc.position.y;
                this.level.spaceship.damage(npc.explosion_damage, dx, dy);

                // Trigger mine explosion
                npc.trigger_explosion();
            }
        }
    }

    check_collisions() {
        let collisions = [];
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        };

        // Check spaceship against all NPCs
        if (this.level.spaceship) {
            for (let i = 0; i < this.level.npc.length; i++) {
                const npc = this.level.npc[i];
                // Skip checking collision with itself
                if (npc === this.level.spaceship) continue;
                if (npc.position.y < window.y1 || npc.position.y > window.y2) continue;
                if (this.level.spaceship.check_collision(npc)) {
                    collisions.push({
                        obj1: this.level.spaceship,
                        obj2: npc,
                        type: 'ship_npc'
                    });
                }
            }

            // Check spaceship projectiles against NPCs
            if (this.level.spaceship.projectiles.length > 0 && Math.random() < 0.1) {
                console.log('[Game] Checking', this.level.spaceship.projectiles.length, 'projectiles against', this.level.npc.length, 'NPCs');
            }
            for (let p = 0; p < this.level.spaceship.projectiles.length; p++) {
                const projectile = this.level.spaceship.projectiles[p];
                for (let i = 0; i < this.level.npc.length; i++) {
                    const npc = this.level.npc[i];
                    // Skip checking collision with player's own ship
                    if (npc === this.level.spaceship) continue;
                    if (npc.position.y < window.y1 || npc.position.y > window.y2) continue;
                    if (projectile.check_collision(npc)) {
                        collisions.push({
                            obj1: projectile,
                            obj2: npc,
                            type: 'projectile_npc'
                        });
                    }
                }
            }
        }

        // Check NPC projectiles against spaceship (including boss projectiles)
        for (let i = 0; i < this.level.npc.length; i++) {
            const npc = this.level.npc[i];
            if (npc.type !== "ship" && npc.type !== "boss") continue;
            if (!npc.projectiles) continue;

            for (let p = 0; p < npc.projectiles.length; p++) {
                const projectile = npc.projectiles[p];
                if (this.level.spaceship && projectile.check_collision(this.level.spaceship)) {
                    collisions.push({
                        obj1: projectile,
                        obj2: this.level.spaceship,
                        type: 'enemy_projectile_ship'
                    });
                }
            }
        }

        // Handle all collisions
        this.handle_collisions(collisions);
    }

    handle_collisions(collisions) {
        for (let collision of collisions) {
            const {obj1, obj2, type} = collision;

            switch(type) {
                case 'ship_npc':
                    // Check if it's a powerup
                    if (obj2.type && obj2.type.startsWith('powerup_')) {
                        obj2.apply_to_ship(obj1);
                    } else {
                        // Player ship hit an NPC enemy/debris
                        // Apply physics-based collision response (bounce)
                        obj1.impact2(obj2);

                        // Calculate impact position relative to each object's center
                        const impactX = obj2.position.x - obj1.position.x;
                        const impactY = obj2.position.y - obj1.position.y;
                        obj1.damage(50, impactX, impactY);  // Reduced collision damage - ~40 collisions to kill with shields
                        obj2.damage(50);
                        obj1.explosion(impactX, impactY);  // Explosion at impact point on ship
                        obj2.explosion(-impactX, -impactY);  // Explosion at impact point on NPC
                    }
                    break;

                case 'projectile_npc':
                    // Don't destroy powerups with projectiles, just pass through
                    if (obj2.type && obj2.type.startsWith('powerup_')) {
                        break;
                    }
                    // Player projectile hit NPC
                    console.log('[Game] Player projectile HIT:', obj2.type, 'Life:', obj2.life, '→', obj2.life - 25);
                    const projImpactX = obj1.position.x - obj2.position.x;
                    const projImpactY = obj1.position.y - obj2.position.y;
                    obj1.destroy();
                    obj2.damage(25);
                    obj2.explosion(projImpactX, projImpactY);  // Explosion at projectile impact point

                    // Award score and check for kill
                    this.score += 10;
                    if (obj2.life <= 0) {
                        this.kills++;
                        // Bonus points for destroying enemy
                        if (obj2.type === "boss") {
                            this.score += 500;
                        } else if (obj2.type === "ship") {
                            this.score += 100;
                        } else {
                            this.score += 25;
                        }
                    }
                    break;

                case 'enemy_projectile_ship':
                    // Enemy projectile hit player
                    // Projectiles don't bounce - they hit or fly past
                    // (removed impact2 bounce)

                    // Calculate impact position relative to ship center
                    const enemyImpactX = obj1.position.x - obj2.position.x;
                    const enemyImpactY = obj1.position.y - obj2.position.y;
                    obj1.destroy();
                    obj2.damage(250, enemyImpactX, enemyImpactY);  // Increased damage - should take ~20 hits to kill
                    obj2.explosion(enemyImpactX, enemyImpactY);  // Explosion at enemy projectile impact point
                    break;
            }
        }
    }


    updateFrame() {
        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // window_manager already applies viewport transform, so we work in virtual coordinates
        const viewport = this.graphics.viewport;

        // Modal already handles clipping, so we don't need to save/restore here
        // Removing ctx.save() and ctx.restore() to preserve viewport transform

        // Render scrolling background before everything else
        this.render_background();

        // Skip updates if game is paused (but continue rendering)
        if (this.pause_game) {
            // Still render the game state, just don't update it
            let window = {
                y1: this.level.position.y,
                y2: this.level.position.y + this.graphics.viewport.virtual.height
            };

            // Render NPCs
            for (let b = 0; b < this.level.npc.length; b++) {
                let npc = this.level.npc[b];
                if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
                    if (npc.type == "ship" || npc.type == "boss") {
                        npc.render({ x: 0, y: window.y1 });
                    } else {
                        npc.orient({ x: 0, y: window.y1 });
                        npc.render();
                        npc.de_orient();
                    }
                }
            }

            // Render score
            this.render_score();

            // Draw game over overlay if player is dead or won
            if ((this.level.spaceship && this.level.spaceship.life <= 0) || this.player_won) {
                this.draw_game_over_overlay();
            }

            // No need to restore - modal handles it
            return;
        }

        // Clear any previous drawings
        //this.graphics.updateCanvasSizeAndDrawImage(this.level.position);

        // Only scroll level if not at end
        if (this.level.position.y > 0) {
            this.level.position.y -= this.level.speed;
        }

        // Boss spawn logic - spawn boss when nearing end of level
        if (!this.boss_spawned && this.level.position.y <= this.boss_spawn_threshold && this.level.position.y > 0) {
            this.spawn_boss();
            this.boss_spawned = true;
        }

        // Clamp level position at end but keep level_start true so controls still work
        if (this.level.position.y <= 0) {
            this.level.position.y = 0; // Clamp at 0
        }


        this.graphics.viewport.world.y = this.level.position.y;
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }

        // Check if boss was destroyed before filtering
        if (this.active_boss && this.active_boss.destroy_object) {
            console.log('[Game] Boss destroyed - YOU WIN!');
            this.you_win();
            this.active_boss = null;
        }

        this.level.npc = this.level.npc.filter(npc => !npc.destroy_object);


        // Update NPCs in viewport (bosses always update regardless of position)
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.is_boss || (npc.position.y > window.y1 - 50 && npc.position.y < window.y2)) {
                npc.update_motion(deltaTime);
            }
        }

        // Check mine proximity (before collision detection)
        this.check_mine_proximity();

        // Check collisions after all motion updates
        this.check_collisions();



        // Render NPCs and their explosions (bosses always update and render)
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.is_boss || (npc.position.y > window.y1 - 50 && npc.position.y < window.y2)) {
                npc.update_frame(deltaTime);

                if (npc.type == "ship" || npc.type == "boss") {
                    npc.render({ x: 0, y: window.y1 });
                } else {
                    npc.orient({ x: 0, y: window.y1 });
                    npc.render();
                    npc.de_orient();
                }
            }
        }

        // Update and render spaceship
        if (this.level.spaceship != null) {
            // Check if player died
            if (this.level.spaceship.life <= 0) {
                if (!this.player_dying) {
                    // Start death sequence
                    this.player_dying = true;
                    this.death_started_time = Date.now();
                    console.log('[Game] Player death - starting explosion sequence');
                } else {
                    // Check if explosion animation is complete
                    const time_since_death = Date.now() - this.death_started_time;
                    if (time_since_death >= this.death_explosion_duration) {
                        this.game_over();
                        return;
                    }
                }
            }

            this.level.spaceship.update_frame(deltaTime);
            this.level.spaceship.render({ x: 0, y: window.y1 });
        }

        // No need to restore - modal handles it

        // Update bar percentages (modal will render them automatically after this callback returns)
        if (this.level.spaceship != null && this.laser_bar && this.missile_bar && this.booster_bar && this.shield_bar && this.health_bar) {
            this.laser_bar.set_percentage(this.level.spaceship.laser_fire_control.get_cooldown_percentage());
            this.missile_bar.set_percentage(this.level.spaceship.missile_fire_control.get_cooldown_percentage());
            this.booster_bar.set_percentage(this.level.spaceship.boost_fire_control.get_cooldown_percentage());
            this.shield_bar.set_percentage(this.level.spaceship.get_shield_percentage());
            this.health_bar.set_percentage(this.level.spaceship.get_life_percentage());
        }

        // Render score display
        this.render_score();
    }

    render_background() {
        if (!this.level || !this.level.background || !this.graphics || !this.graphics.ctx) return;

        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        const bg_sprite = this.graphics.sprites.get(this.level.background);
        if (!bg_sprite) {
            console.warn('[Game] Background sprite not loaded:', this.level.background);
            return;
        }

        // Use virtual viewport dimensions - canvas transform handles scaling
        const viewport = this.graphics.viewport.virtual;
        const bg_height = bg_sprite.height;
        const bg_width = bg_sprite.width;

        // Scale background to fill viewport width
        const scale = viewport.width / bg_width;
        const scaled_height = bg_height * scale;

        // Calculate how much of the level we've scrolled through (0 to 1)
        const total_level_height = this.level.position.height;
        const scroll_progress = (this.level.position.y / total_level_height);

        // Map scroll progress to background position
        // Background scrolls downward as level progresses (same direction as level movement)
        const bg_y_offset = (scaled_height - viewport.height) * scroll_progress;

        // Draw background - tile vertically if needed
        const tiles_needed = Math.ceil(viewport.height / scaled_height) + 1;
        for (let i = -1; i < tiles_needed; i++) {
            const y_pos = Math.floor(i * scaled_height - bg_y_offset);
            // Floor destination coordinates and dimensions, add +1 to prevent gaps from sub-pixel issues
            const dest_x = 0;
            const dest_y = y_pos;
            const dest_width = Math.floor(viewport.width) + 1;
            const dest_height = Math.floor(scaled_height) + 1;

            // drawImage with 5 params: image, dx, dy, dWidth, dHeight
            ctx.drawImage(
                bg_sprite.image,
                dest_x,
                dest_y,
                dest_width,
                dest_height
            );
        }
    }

    render_score() {
        if (!this.ctx || typeof this.ctx.save !== 'function') return;

        const scoreText = `Score: ${this.score}  Kills: ${this.kills}`;
        // Position relative to game window
        const x = this.position.x + this.position.width - 250;
        const y = this.position.y + 30;

        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(scoreText, x, y);
        this.ctx.restore();
    }

    draw_viewport_border() {
        const ctx = this.graphics.ctx;
        if (!ctx) return;

        const viewport = this.graphics.viewport.virtual;
        const borderWidth = 6;

        ctx.save();

        // Draw dark border all around
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.9)'; // Dark grey
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        // Top edge
        ctx.moveTo(0, borderWidth / 2);
        ctx.lineTo(viewport.width, borderWidth / 2);
        // Left edge
        ctx.moveTo(borderWidth / 2, 0);
        ctx.lineTo(borderWidth / 2, viewport.height);
        // Bottom edge
        ctx.moveTo(0, viewport.height - borderWidth / 2);
        ctx.lineTo(viewport.width, viewport.height - borderWidth / 2);
        // Right edge
        ctx.moveTo(viewport.width - borderWidth / 2, 0);
        ctx.lineTo(viewport.width - borderWidth / 2, viewport.height);
        ctx.stroke();

        ctx.restore();
    }

    game_over() {
        // Stop the game
        this.pause_game = true;
        this.level_start = false;
        this.player_won = false;
    }

    you_win() {
        // Stop the game - player won!
        this.pause_game = true;
        this.level_start = false;
        this.player_won = true;
    }

    draw_game_over_overlay() {
        // Display game over or victory message
        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        // Use virtual viewport dimensions - canvas transform handles scaling
        const centerX = this.graphics.viewport.virtual.width / 2;
        const centerY = this.graphics.viewport.virtual.height / 2;

        ctx.save();

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);

        if (this.player_won) {
            // YOU WIN text
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 72px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('YOU WIN!', centerX, centerY - 60);

            // Victory message
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 36px monospace';
            ctx.fillText('BOSS DEFEATED!', centerX, centerY);
        } else {
            // Game Over text
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 72px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', centerX, centerY - 60);
        }

        // Score
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(`Final Score: ${this.score}`, centerX, centerY + 50);
        ctx.fillText(`Kills: ${this.kills}`, centerX, centerY + 100);

        // Instructions
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px monospace';
        ctx.fillText('Press ESC to return to menu', centerX, centerY + 160);

        ctx.restore();
    }

    async start_level() {
        this.level_start = true;

        // Test mode - start near end of level for boss testing
        if (this.test_mode) {
            this.level.position.y = this.boss_spawn_threshold + 200; // Start 200 pixels before boss spawn
            console.log('[Game] Test mode: Starting near end of level at position', this.level.position.y);
        }

        // Set the background from the level
        if (this.level.background) {
            this.set_background(this.level.background);
        }

        // Resume audio context and play background music
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        // Play level music with looping enabled
        if (this.level.track_key) {
            this.audio_manager.play(this.level.track_key, 0, true);
        }
    }

    spawn_boss() {
        // Randomly choose boss type
        const bossTypes = ['chatgpt', 'resume'];
        const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];

        // Spawn boss at top of screen (above viewport)
        const viewport = this.graphics.viewport.virtual;
        const bossX = viewport.width / 2; // Center horizontally
        const bossY = this.level.position.y - 300; // 300 pixels above top of screen

        // Create boss
        this.active_boss = new Boss(this.window_manager, bossX, bossY, bossType);

        // Set hover target to middle/upper area of screen
        this.active_boss.hover_target_y = this.level.position.y + (viewport.height * 0.25); // 25% down from top

        this.level.npc.push(this.active_boss);

        console.log('[Game] Boss spawned:', bossType, 'at position', bossX, bossY, 'hover target:', this.active_boss.hover_target_y);
    }


    handle_game_keys(kb) {
        if (this.active==false) return;

        // Only accept gameplay input if level has started AND game is not paused
        if (this.level_start == true && !this.pause_game) {
            // In your game loop, check keysPressed object to determine actions
            if (kb.is_pressed('ArrowLeft')) this.level.spaceship.bank_left();
            if (kb.is_pressed('ArrowRight')) this.level.spaceship.bank_right();
            if (kb.is_pressed('ArrowUp')) this.level.spaceship.accelerate(400);
            if (kb.is_pressed('ArrowDown')) this.level.spaceship.decelerate(400);
            if (kb.is_pressed(' ')) this.level.spaceship.fire_lazer();
            if (kb.just_stopped(' ')) this.level.spaceship.stop_firing_lazer();
            if (kb.just_stopped('Enter')) this.level.spaceship.fire_missle(this.level.npc);
            if (kb.is_pressed('a') || kb.is_pressed('A')) this.level.spaceship.strafe_left(400);
            if (kb.is_pressed('d') || kb.is_pressed('D')) this.level.spaceship.strafe_right(400);
            if (kb.is_pressed('w') || kb.is_pressed('W'))
            this.level.spaceship.accelerate(400);
            if (kb.is_pressed('s') || kb.is_pressed('S')) this.level.spaceship.decelerate(400);

            if (kb.is_pressed('Shift')) this.level.spaceship.boost();
            if (kb.just_stopped('Shift')) this.level.spaceship.stop_boost();

            // CTRL for reverse thrust/brake - applies force opposite to velocity vector
            if (kb.is_pressed('Control')) this.level.spaceship.reverse_thrust();
        }

        // These controls work even when paused
        if (this.level_start == true) {
            if (kb.just_stopped('+')) this.level.volume(+1);
            if (kb.just_stopped('-')) this.level.volume(-1);
            if (kb.just_stopped('h') ||kb.just_stopped('H')) this.help();
            if (kb.just_stopped('m') || kb.just_stopped('M')) this.ui.toggle_sound();
        }

        // Level speed controls (only when not paused)
        if (this.level_start == true && !this.pause_game) {
            // Numpad + to speed up (or = key for keyboards without numpad)
            if (kb.just_stopped('=') || kb.just_stopped('NumpadAdd')) {
                this.level.speed = Math.min(this.level.speed + 0.5, 10); // Max speed 10
                console.log('[Game] Level speed increased to', this.level.speed);
            }
            // Numpad - to slow down (or _ key)
            if (kb.just_stopped('_') || kb.just_stopped('NumpadSubtract')) {
                this.level.speed = Math.max(this.level.speed - 0.5, 0); // Min speed 0
                console.log('[Game] Level speed decreased to', this.level.speed);
            }
            // Numpad 0 to stop
            if (kb.just_stopped('Numpad0') || kb.just_stopped('0')) {
                this.level.speed = 0;
                console.log('[Game] Level speed set to 0 (stopped)');
            }
        }
    }

    handle_escape() {
        // If player is dead or won, close the game and return to menu
        if ((this.level.spaceship && this.level.spaceship.life <= 0) || this.player_won) {
            this.close();
            return;
        }

        // Toggle pause
        if (this.pause_game == true) {
            this.ui.unpause();
        } else {
            this.ui.pause();
        }
    }

    help() {
        let modal = new help();
        this.window_manager.add(modal);
    }

    delete() {
        // Stop the level music when closing the game
        if (this.level && this.level.track_key && this.audio_manager) {
            console.log('[Game] Stopping music:', this.level.track_key);
            this.audio_manager.stop(this.level.track_key);
        }

        // Also stop the level if it exists
        if (this.level) {
            this.level.stop();
        }

        // Call parent delete
        super.delete();
    }
}
