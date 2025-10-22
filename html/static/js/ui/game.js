class game extends modal{
    layout(){
        this.active=true;
        this.ok=false
        this.cancel=false
        this.closeButton=true;
        this.title="Level - 1";
        this.text="";
        this.resize();
        this.add_buttons();
        this.no_skin();


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

        this.ui = new ui(this.ctx, this);
        this.level = new level(this.window_manager);
        this.level.load('static/levels/level.json');
        this.level.on("loaded",this.start_level.bind(this));

        this.laser_bar   = new percentage_bar_fluid(this.window_manager, new rect(10, 10+1*50, 200, 40), "bar","bar-red-fluid");
        this.missile_bar = new percentage_bar_fluid(this.window_manager, new rect(30, 10+2*50, 200, 40), "bar","bar-orange-fluid");
        this.booster_bar = new percentage_bar_fluid(this.window_manager, new rect(30, 10+3*50, 200, 40), "bar","bar-blue-fluid");
        this.health_bar  = new percentage_bar_fluid(this.window_manager, new rect(10, 10+4*50, 200, 40), "bar","bar-green-fluid");
        
        //this.laser_timeout =  new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        //this.missile_timeout =  new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        //this.booster_timeout = new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        this.render_callback(this.updateFrame);

    }

    resize(){
        // Use virtual viewport dimensions (logical pixels, not physical)
        let x = 0;
        let y = 0;
        let window_width = this.graphics.viewport.virtual.width;
        let window_height = this.graphics.viewport.virtual.height;
        this.position = new rect(x, y, window_width, window_height, "left", "top");
        super.resize();
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
                        obj1.damage(500);  // Collision does heavy damage - 10 collisions to kill
                        obj2.damage(50);
                        obj1.explosion();
                        obj2.explosion();
                    }
                    break;

                case 'projectile_npc':
                    // Don't destroy powerups with projectiles, just pass through
                    if (obj2.type && obj2.type.startsWith('powerup_')) {
                        break;
                    }
                    // Player projectile hit NPC
                    obj1.destroy();
                    obj2.damage(25);
                    obj2.explosion();

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
                    obj1.destroy();
                    obj2.damage(250);  // Increased damage - should take ~20 hits to kill
                    obj2.explosion();
                    break;
            }
        }
    }


    updateFrame() {
        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

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

            // Draw game over overlay if player is dead
            if (this.level.spaceship && this.level.spaceship.life <= 0) {
                this.draw_game_over_overlay();
            }

            return;
        }

        // Clear any previous drawings
        //this.graphics.updateCanvasSizeAndDrawImage(this.level.position);
        this.level.position.y -= this.level.speed;

        //TODO next level stuffs
        if (this.level.position.y == 0) {
            this.level_start = false;
        }

        
        this.graphics.viewport.world.y = this.level.position.y;
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }

        this.level.npc = this.level.npc.filter(npc => !npc.destroy_object);


        // Update NPCs in viewport
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
                npc.update_motion(deltaTime);
            }
        }

        // Check collisions after all motion updates
        this.check_collisions();



        // Render NPCs and their explosions
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
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

            // Update UI bars
            let percentage1 = this.level.spaceship.laser_fire_control.get_cooldown_percentage();
            this.laser_bar.render(percentage1);
            let percentage3 = this.level.spaceship.missile_fire_control.get_cooldown_percentage();
            this.missile_bar.render(percentage3);
            let percentage5 = this.level.spaceship.get_life_percentage();
            this.health_bar.render(percentage5);
            let percentage6 = this.level.spaceship.boost_fire_control.get_cooldown_percentage();
            this.booster_bar.render(percentage6);
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
        const scroll_progress = 1 - (this.level.position.y / total_level_height);

        // Map scroll progress to background position
        // Background should scroll from bottom (start) to top (end)
        const bg_y_offset = (scaled_height - viewport.height) * scroll_progress;

        // Draw background - tile vertically if needed
        const tiles_needed = Math.ceil(viewport.height / scaled_height) + 1;
        for (let i = -1; i < tiles_needed; i++) {
            const y_pos = i * scaled_height - bg_y_offset;
            ctx.drawImage(
                bg_sprite.image,
                0,
                y_pos,
                viewport.width,
                scaled_height
            );
        }
    }

    render_score() {
        if (!this.ctx || typeof this.ctx.save !== 'function') return;

        const scoreText = `Score: ${this.score}  Kills: ${this.kills}`;
        // Use virtual viewport dimensions - canvas transform handles scaling
        const x = this.graphics.viewport.virtual.width - 250;
        const y = 30;

        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(scoreText, x, y);
        this.ctx.restore();
    }

    game_over() {
        // Stop the game
        this.pause_game = true;
        this.level_start = false;
    }

    draw_game_over_overlay() {
        // Display game over message
        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        // Use virtual viewport dimensions - canvas transform handles scaling
        const centerX = this.graphics.viewport.virtual.width / 2;
        const centerY = this.graphics.viewport.virtual.height / 2;

        ctx.save();

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);

        // Game Over text
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 72px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', centerX, centerY - 60);

        // Score
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(`Final Score: ${this.score}`, centerX, centerY + 20);
        ctx.fillText(`Kills: ${this.kills}`, centerX, centerY + 70);

        // Instructions
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px monospace';
        ctx.fillText('Press ESC to return to menu', centerX, centerY + 130);

        ctx.restore();
    }

    async start_level() {
        this.level_start = true;

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


    handle_keys(kb) {
        if (this.active==false) return;
        if (this.level_start == true) {
            // In your game loop, check keysPressed object to determine actions
            if (kb.is_pressed('ArrowLeft')) this.level.spaceship.bank_left();
            if (kb.is_pressed('ArrowRight')) this.level.spaceship.bank_right();
            if (kb.is_pressed('ArrowUp')) this.level.spaceship.accelerate();
            if (kb.is_pressed('ArrowDown')) this.level.spaceship.decelerate();
            if (kb.is_pressed(' ')) this.level.spaceship.fire_lazer();
            if (kb.just_stopped(' ')) this.level.spaceship.stop_firing_lazer();
            if (kb.just_stopped('Enter')) this.level.spaceship.fire_missle(this.level.npc);
            if (kb.is_pressed('a') || kb.is_pressed('A')) this.level.spaceship.strafe_left(50);
            if (kb.is_pressed('d') || kb.is_pressed('D')) this.level.spaceship.strafe_right(50);
            if (kb.is_pressed('w') || kb.is_pressed('W')) 
            this.level.spaceship.accelerate(50);
            if (kb.is_pressed('s') || kb.is_pressed('S')) this.level.spaceship.decelerate(50);
            //if (kb.is_pressed('Escape')) this.G.level.spaceship.pause();

            if (kb.is_pressed('Shift')) this.level.spaceship.boost();
            
            if (kb.just_stopped('Shift')) this.level.spaceship.stop_boost();
            if (kb.just_stopped('+')) this.level.volume(+1);
            if (kb.just_stopped('-')) this.level.volume(-1);
            /*
            if (kb.just_stopped('ArrowLeft')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowRight')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowUp')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowDown')) this.audio_manager.sound_off();
*/
            if (kb.just_stopped('h') ||kb.just_stopped('H')) this.help();

            if (kb.just_stopped('m') || kb.just_stopped('M')) this.ui.toggle_sound();

        }

        if (kb.just_stopped('Escape')) {
            // If player is dead, close the game and return to menu
            if (this.level.spaceship && this.level.spaceship.life <= 0) {
                this.close();
                return;
            }

            if (this.boss_mode_activated) {
                this.ui.boss_mode_off();
            } else if (kb.ctrl()) {
                this.ui.boss_mode_on();
            } else if (this.pause_game == true) {
                this.ui.unpause();
            } else {
                this.ui.pause();
            }
        }
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