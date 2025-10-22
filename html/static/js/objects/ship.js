

class Ship extends game_object {

    constructor(window_manager, x, y, type) {
        super(window_manager, x, y, 128, 153,
            1,                    // mass
            0,                      // rotation
            8);                     // ropration speed
        
        this.boost_fire_control = new fire_control(1);
        this.laser_fire_control = new fire_control(5);
        this.missile_fire_control = new fire_control(10);
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        this.bolt_type=null;
        this.missile_type=null;
        this.shield_active = false;
        this.shield_end_time = 0;
        this.shield_glow_phase = 0; // For animated glow effect
        let speed=5+.5 + Math.random() * 4;

        switch (type) {
            case 'user':
                this.set_type("ship");
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_sound("lazer", 'static/audio/projectiles/sfx_wpn_laser6.wav')
                this.set_sound("missile", 'static/audio/projectiles/sfx_weapon_singleshot13.wav')
            
                this.set_image('static/ships/ship1.png');
                this.set_center(64, 64);
                this.booster = new Projectile(window_manager, +0, 100, 0, "booster");
                this.thrusters.push(this.booster);
                var thruster1 = new Projectile(window_manager, +30, 75, 0, "thruster");
                this.thrusters.push(thruster1);
                var thruster2 = new Projectile(window_manager, -30, 75, 0, "thruster");
                this.thrusters.push(thruster2);
                this.bolt_type="bolt3";
                this.missile_type="bolt4";
                break;

            case 'teams':
                this.set_type("ship");
                //this.set_sound("left", 'static/audio/ship/static.mp3')
                //this.set_sound("right", 'static/audio/ship/static.mp3')
                //this.set_sound("accel", 'static/audio/ship/static.mp3')
                //this.set_sound("decel", 'static/audio/ship/static.mp3')
                //this.set_sound("lazer", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/teams.png',64,1,270);

                //this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_rotation(270);
                this.set_center(64, 64);
                this.set_rotation_speed(10);
                this.set_max_life(100);
                this.bolt_type="bolt2";
                this.missile_type="bolt3";
                let frames=Math.random()*15+10;
                let actions = [
                    { type: "bank_right", frames: 9,  },
                    { type: "accelerate", frames: frames ,speed:speed},
                    { type: "lazer",frames: 1, speed: 5},
                    { type: "bank_left", frames: 15,  },
                    { type: "accelerate", frames: 6, speed:5},
                    { type: "skip", frames: 4 }
                ];
                this.action_list=actions;
                this.action_position.frame=parseInt(Math.random( )*actions.length);

                break;

        }
    }

    set_volume(volume) {
        super.set_volume(volume);
        for (let thruster of this.thrusters) {
            thruster.volume = volume;
        }
        for (let projectile of this.projectiles) {
            projectile.volume = volume;
        }
    }

    boost() {
        if (this.boost_fire_control.can_fire()) {
            this.booster.set_visible(true);
            this.accelerate(100);
            console.log("BOOST");
        }
    }

    stop_boost() {
        this.boost_fire_control.stop_firing();
        this.booster.set_visible(false);
    }

    activate_shield(duration) {
        this.shield_active = true;
        this.shield_end_time = Date.now() + duration;
    }

    damage(amount) {
        // Shield absorbs damage
        if (this.shield_active) {
            console.log('[Ship] Shield absorbed ' + amount + ' damage!');
            return; // No damage taken
        }
        // Normal damage
        super.damage(amount);
    }



    fire_lazer() {
        if (this.laser_fire_control.can_fire()) {
            let lazer1 = this.get_relative_position(-60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, this.bolt_type);
            projectile.set_velocity(this.velocity);
            projectile.accelerate(5);
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, this.bolt_type);
            projectile.set_velocity(this.velocity);
            projectile.accelerate(5);
            this.projectiles.push(projectile);
            this.play("lazer");
            
        }
    }
    stop_firing_lazer() {
        this.laser_fire_control.stop_firing();
    }

    fire_missle(npcs) {
        if (this.missile_fire_control.can_fire()) {
            let missle1 = this.get_relative_position(0, -80);

            // Create heat-seeking missile
            var missile = new HeatSeekingMissile(
                this.window_manager,
                this.position.x + missle1.x,
                this.position.y + missle1.y,
                this.rotation
            );

            // Set initial velocity to match ship
            missile.set_velocity(this.velocity);
            missile.accelerate(2);

            // Find and set target
            if (npcs && npcs.length > 0) {
                const target = missile.find_nearest_target(npcs);
                if (target) {
                    missile.set_target(target);
                }
            }

            this.projectiles.push(missile);
            this.missile_fire_control.stop_firing();
            this.play("missile");
        }
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);
        this.laser_fire_control.update_frame();
        this.missile_fire_control.update_frame();
        this.boost_fire_control.update_frame();

        // Update shield status
        if (this.shield_active && Date.now() > this.shield_end_time) {
            this.shield_active = false;
            console.log('[Ship] Shield deactivated');
        }

        // Update shield glow animation
        if (this.shield_active) {
            this.shield_glow_phase += deltaTime * 3; // Animate shield
        }

        // Clamp player ship to screen boundaries
        if (this.type === "ship" && this.bolt_type === "bolt3") { // User ship check
            const viewport = this.graphics.viewport.virtual;
            const margin = this.width / 2; // Half ship width for center-based positioning

            // Clamp X position (left/right boundaries)
            if (this.position.x < margin) {
                this.position.x = margin;
                this.velocity.x = 0; // Stop horizontal movement
            }
            if (this.position.x > viewport.width - margin) {
                this.position.x = viewport.width - margin;
                this.velocity.x = 0;
            }

            // Clamp Y position (top/bottom boundaries relative to world position)
            const worldY = this.position.y - this.graphics.viewport.world.y;
            const minY = margin;
            const maxY = viewport.height - margin;

            if (worldY < minY) {
                this.position.y = this.graphics.viewport.world.y + minY;
                this.velocity.y = Math.max(0, this.velocity.y); // Only stop upward movement
            }
            if (worldY > maxY) {
                this.position.y = this.graphics.viewport.world.y + maxY;
                this.velocity.y = Math.min(0, this.velocity.y); // Only stop downward movement
            }
        }

        const timestamp = Date.now(); // Corrected method to get current timestamp in milliseconds

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (timestamp - projectile.created > 5000) {
                this.projectiles.splice(i, 1); // Remove the projectile from the array
                // Optionally perform additional cleanup or logging here
            } else {
                projectile.update_frame(deltaTime); // Update the projectile if it's not deleted
            }
        }

        for (let thruster of this.thrusters) {
            thruster.update_frame(deltaTime);
        }
    }



    render(window) {
        super.orient(window)

        // Draw shield glow if active
        if (this.shield_active) {
            this.render_shield();
        }

        for (let thruster of this.thrusters) {
            thruster.orient()
            thruster.render()
            thruster.de_orient()
        }
        super.render();
        super.de_orient();

        for (let projectile of this.projectiles) {
            projectile.orient(window)
            projectile.render()
            projectile.de_orient()
        }
        super.de_orient()
    }

    render_shield() {
        if (!this.graphics || !this.graphics.ctx) return;
        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        ctx.save();

        // Create pulsing shield effect
        const pulseAlpha = 0.3 + Math.sin(this.shield_glow_phase) * 0.2;
        const radius = 70 + Math.sin(this.shield_glow_phase) * 5;

        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `rgba(0, 150, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(0, 200, 255, ${pulseAlpha})`);
        gradient.addColorStop(1, `rgba(100, 220, 255, ${pulseAlpha * 1.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner shield circle
        ctx.strokeStyle = `rgba(150, 230, 255, ${pulseAlpha * 2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
    async executeAction(action) {
       super.executeAction(action);
       switch(action.type){
        case 'lazer': this.fire_lazer(); break;
       }
    }

    destroy() {
        // For player ship, create massive multi-ring expanding explosion
        if (this.bolt_type === "bolt3") {  // User ship check
            this.create_death_explosion();
        }
        super.destroy();
    }

    create_death_explosion() {
        // Create multiple expanding circular rings of explosions
        const rings = 4;
        const explosionsPerRing = 12;

        // Get ship's current world position
        const shipX = this.position.x;
        const shipY = this.position.y;

        // Get reference to level's NPC array to add explosions as world objects
        const level = this.window_manager.modals.find(m => m.level);
        if (!level || !level.level) {
            console.error('[Ship] Cannot create death explosion - level not found');
            return;
        }

        for (let ring = 0; ring < rings; ring++) {
            const radius = 30 + (ring * 40); // Expanding rings
            const delay = ring * 100; // Stagger the rings

            setTimeout(() => {
                for (let i = 0; i < explosionsPerRing; i++) {
                    const angle = (i / explosionsPerRing) * Math.PI * 2;
                    const offsetX = Math.cos(angle) * radius;
                    const offsetY = Math.sin(angle) * radius;

                    // Create explosion as world object
                    let exp = new Explosion(this.window_manager, shipX + offsetX, shipY + offsetY);
                    exp.set_sub();  // Mark as sub-object so it doesn't collide
                    level.level.npc.push(exp);  // Add to level's NPC list
                }

                // Add some random explosions in the middle for each ring
                for (let i = 0; i < 5; i++) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const randomRadius = Math.random() * radius;
                    const offsetX = Math.cos(randomAngle) * randomRadius;
                    const offsetY = Math.sin(randomAngle) * randomRadius;

                    let exp = new Explosion(this.window_manager, shipX + offsetX, shipY + offsetY);
                    exp.set_sub();
                    level.level.npc.push(exp);
                }
            }, delay);
        }

        // Add a big central explosion at ship position
        let centerExp = new Explosion(this.window_manager, shipX, shipY);
        centerExp.set_sub();
        level.level.npc.push(centerExp);
    }

}//end ship class




