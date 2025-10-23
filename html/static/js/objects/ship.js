

class Ship extends game_object {

    constructor(window_manager, x, y, type) {
        super(window_manager, x, y, 128, 153,
            10,                   // mass (balanced for responsive movement and collision physics)
            0,                    // rotation
            1.5);                 // rotation speed - very fine aiming control
        
        this.boost_fire_control = new fire_control(1);
        this.laser_fire_control = new fire_control(2);  // Reduced from 5 to 2 - less heat per shot
        this.missile_fire_control = new fire_control(10);
        this.shield_fire_control = new fire_control(3, 2000, 2000); // Shield uses fire_control for auto decay/ramp
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        this.bolt_type=null;
        this.missile_type=null;

        // Shield system with decay/ramp
        this.shield_strength = 100; // 0-100, acts like inverse temperature
        this.shield_max_strength = 100;
        this.shield_regen_rate = 1; // Regen per frame when not taking damage
        this.shield_impacts = []; // Array of {x, y, time, intensity} for impact glow effects
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
            
                this.set_image('ship_player');
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
                this.set_image('ship_teams',64,1,270);

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
        // Boost applies continuous acceleration while held, not fire-rate limited
        if (!this.boost_fire_control.overheated) {
            this.booster.set_visible(true);
            this.accelerate(600);  // Higher acceleration for boost

            // Heat up the boost system
            this.boost_fire_control.temprature += 0.5;  // Gradual heat buildup
            if (this.boost_fire_control.temprature > this.boost_fire_control.max_tempreture) {
                this.boost_fire_control.temprature = this.boost_fire_control.max_tempreture;
                this.boost_fire_control.overheated = true;
                this.boost_fire_control.overheated_cooldown_start = 0;
            }
            this.boost_fire_control.is_firing = true;
        } else {
            this.booster.set_visible(false);
        }
    }

    stop_boost() {
        this.boost_fire_control.stop_firing();
        this.booster.set_visible(false);
    }

    /**
     * Reverse thrust - applies force in opposite direction of velocity to brake
     */
    reverse_thrust() {
        // Calculate magnitude of current velocity
        const velocityMagnitude = Math.sqrt(
            this.velocity.x * this.velocity.x +
            this.velocity.y * this.velocity.y
        );

        if (velocityMagnitude < 0.5) {
            // Ship is almost stopped, just zero it out
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }

        // Calculate unit vector in opposite direction of velocity
        const reverseX = -this.velocity.x / velocityMagnitude;
        const reverseY = -this.velocity.y / velocityMagnitude;

        // Apply strong braking force (300 is stronger than boost)
        const brakeForce = 300;
        this.velocity.x += reverseX * brakeForce / this.mass;
        this.velocity.y += reverseY * brakeForce / this.mass;
    }

    /**
     * Get shield strength as percentage (0-100)
     */
    get_shield_percentage() {
        return (this.shield_strength / this.shield_max_strength) * 100;
    }

    /**
     * Take damage - shields deflect damage based on strength percentage
     * @param {number} amount - Damage amount
     * @param {number} impactX - X position of impact in world space (optional)
     * @param {number} impactY - Y position of impact in world space (optional)
     */
    damage(amount, impactX = 0, impactY = 0) {
        // Calculate deflection based on shield strength
        // 100% shields = 80% deflection (20% damage taken)
        // 0% shields = 0% deflection (100% damage taken)
        const maxDeflection = 0.80; // Max 80% deflection at full shields
        const shieldPercentage = this.shield_strength / this.shield_max_strength;
        const deflectionPercentage = shieldPercentage * maxDeflection;

        // Calculate actual damage taken
        const damageDeflected = amount * deflectionPercentage;
        const damageTaken = amount - damageDeflected;

        // Reduce shield strength based on damage (shields decay when hit)
        const shieldDecay = amount * 0.15; // Shields lose 15% of incoming damage value
        this.shield_strength -= shieldDecay;
        if (this.shield_strength < 0) this.shield_strength = 0;

        // Add impact glow effect at impact point
        if (shieldPercentage > 0) {
            // Convert world space impact to ship's local rotated space
            const rotRad = (this.rotation % 360) * Math.PI / 180;
            const cos = Math.cos(-rotRad);  // Negative because we're converting TO local space
            const sin = Math.sin(-rotRad);

            const localX = impactX * cos - impactY * sin;
            const localY = impactX * sin + impactY * cos;

            this.shield_impacts.push({
                x: localX,
                y: localY,
                time: Date.now(),
                intensity: Math.min(deflectionPercentage, 1) // Brighter at higher shield strength
            });
        }

        // Apply damage to hull
        super.damage(damageTaken);

        console.log(`[Ship] Shields at ${(shieldPercentage * 100).toFixed(1)}% deflected ${deflectionPercentage.toFixed(1)}% (${damageDeflected.toFixed(1)} dmg), took ${damageTaken.toFixed(1)} damage`);
    }



    fire_lazer() {
        if (this.laser_fire_control.can_fire()) {
            let lazer1 = this.get_relative_position(-60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, this.bolt_type);

            // Set constant laser velocity - lasers don't accelerate
            const laserSpeed = 1500;  // Very fast constant speed
            const radians = this.rotation * Math.PI / 180;
            projectile.velocity.x = Math.sin(radians) * laserSpeed;
            projectile.velocity.y = -Math.cos(radians) * laserSpeed;
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, this.bolt_type);

            // Set constant laser velocity - lasers don't accelerate
            projectile.velocity.x = Math.sin(radians) * laserSpeed;
            projectile.velocity.y = -Math.cos(radians) * laserSpeed;
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

            // Give missile strong initial velocity in firing direction
            const missileInitialSpeed = 600;  // Fast initial speed
            const radians = this.rotation * Math.PI / 180;
            missile.velocity.x = Math.sin(radians) * missileInitialSpeed;
            missile.velocity.y = -Math.cos(radians) * missileInitialSpeed;

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

        // Shield regeneration - automatically ramps back up when not taking damage
        if (this.shield_strength < this.shield_max_strength) {
            this.shield_strength += this.shield_regen_rate;
            if (this.shield_strength > this.shield_max_strength) {
                this.shield_strength = this.shield_max_strength;
            }
        }

        // Health regeneration - heal over time (1.0 per second)
        if (this.life < this.max_life) {
            this.life += 1.0 * deltaTime * 60; // deltaTime is in seconds, multiply by 60 for per-second rate
            if (this.life > this.max_life) {
                this.life = this.max_life;
            }
        }

        // Update shield glow animation
        this.shield_glow_phase += deltaTime * 3;

        // Remove old impact effects (fade out after 1 second)
        const currentTime = Date.now();
        this.shield_impacts = this.shield_impacts.filter(impact =>
            currentTime - impact.time < 1000
        );

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

        // Only draw shield during impact events (when there are active impacts)
        if (this.shield_impacts.length > 0) {
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
        // Removed duplicate de_orient() - it was popping the viewport transform off the stack
    }

    render_shield() {
        if (!this.graphics || !this.graphics.ctx) return;
        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        ctx.save();

        // Calculate shield opacity based on strength (affects impact brightness)
        const shieldAlpha = (this.shield_strength / this.shield_max_strength);

        // Shield bubble radius - the protective sphere around the ship
        const shieldRadius = 80; // Shield extends beyond ship

        // Render impact glows - show section of shield bubble around impact area
        const currentTime = Date.now();
        for (let impact of this.shield_impacts) {
            const age = currentTime - impact.time;
            const lifetime = 800;
            const progress = age / lifetime;

            // Fade out over time
            const impactAlpha = (1 - progress) * impact.intensity * shieldAlpha;

            // Pulse effect - oscillates during impact
            const pulsePhase = (1 - progress) * Math.PI * 4; // 4 pulses over lifetime
            const pulse = 0.7 + Math.sin(pulsePhase) * 0.3; // Oscillate between 0.4 and 1.0

            // Calculate impact direction (normalize)
            const distance = Math.sqrt(impact.x * impact.x + impact.y * impact.y) || 1;
            const dirX = impact.x / distance;
            const dirY = impact.y / distance;

            // Project impact to shield surface
            const impactX = dirX * shieldRadius;
            const impactY = dirY * shieldRadius;

            // Draw the shield arc/section around impact point
            // Arc size expands over time
            const arcSize = 60 + (progress * 40); // Angular size in degrees
            const arcAngle = arcSize * Math.PI / 180;

            // Calculate angle of impact direction
            const impactAngle = Math.atan2(dirY, dirX);

            // Draw multiple layers for depth - inner bright ring, outer glow
            for (let layer = 0; layer < 3; layer++) {
                const layerRadius = shieldRadius + (layer * 15);
                const layerAlpha = impactAlpha * (1 - layer * 0.3) * pulse;

                // Create gradient along the shield surface - BLUE
                const gradient = ctx.createRadialGradient(
                    0, 0, shieldRadius - 5,
                    0, 0, layerRadius
                );

                gradient.addColorStop(0, `rgba(100, 150, 255, 0)`);
                gradient.addColorStop(0.8, `rgba(80, 180, 255, ${layerAlpha * 0.7})`);
                gradient.addColorStop(1, `rgba(100, 200, 255, ${layerAlpha * 0.9})`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                // Draw arc section around impact point
                ctx.arc(0, 0, layerRadius,
                    impactAngle - arcAngle / 2,
                    impactAngle + arcAngle / 2);
                ctx.arc(0, 0, shieldRadius - 5,
                    impactAngle + arcAngle / 2,
                    impactAngle - arcAngle / 2,
                    true);
                ctx.closePath();
                ctx.fill();
            }

            // Add bright blue impact flash at center of arc with pulse
            const flashGradient = ctx.createRadialGradient(
                impactX, impactY, 0,
                impactX, impactY, 30
            );
            flashGradient.addColorStop(0, `rgba(200, 230, 255, ${impactAlpha * pulse * 1.0})`);
            flashGradient.addColorStop(0.4, `rgba(100, 180, 255, ${impactAlpha * pulse * 0.8})`);
            flashGradient.addColorStop(0.7, `rgba(80, 150, 255, ${impactAlpha * pulse * 0.5})`);
            flashGradient.addColorStop(1, `rgba(60, 120, 255, 0)`);

            ctx.fillStyle = flashGradient;
            ctx.beginPath();
            ctx.arc(impactX, impactY, 30, 0, Math.PI * 2);
            ctx.fill();
        }

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
        // Create more modest explosion effect to prevent browser lockup
        const rings = 2;  // Reduced from 4 to 2
        const explosionsPerRing = 6;  // Reduced from 12 to 6

        // Get ship's current world position
        const shipX = this.position.x;
        const shipY = this.position.y;

        // Get reference to level's NPC array to add explosions as world objects
        const level = this.window_manager.modals.find(m => m.level);
        if (!level || !level.level) {
            console.error('[Ship] Cannot create death explosion - level not found');
            return;
        }

        // Add a big central explosion at ship position immediately
        let centerExp = new Explosion(this.window_manager, shipX, shipY);
        centerExp.set_sub();
        level.level.npc.push(centerExp);

        // Create staggered rings with requestAnimationFrame instead of setTimeout
        let currentRing = 0;
        const createRing = () => {
            if (currentRing >= rings) return;

            const radius = 30 + (currentRing * 50);

            // Create ring explosions
            for (let i = 0; i < explosionsPerRing; i++) {
                const angle = (i / explosionsPerRing) * Math.PI * 2;
                const offsetX = Math.cos(angle) * radius;
                const offsetY = Math.sin(angle) * radius;

                let exp = new Explosion(this.window_manager, shipX + offsetX, shipY + offsetY);
                exp.set_sub();
                level.level.npc.push(exp);
            }

            // Add 2 random explosions per ring (reduced from 5)
            for (let i = 0; i < 2; i++) {
                const randomAngle = Math.random() * Math.PI * 2;
                const randomRadius = Math.random() * radius;
                const offsetX = Math.cos(randomAngle) * randomRadius;
                const offsetY = Math.sin(randomAngle) * randomRadius;

                let exp = new Explosion(this.window_manager, shipX + offsetX, shipY + offsetY);
                exp.set_sub();
                level.level.npc.push(exp);
            }

            currentRing++;

            // Schedule next ring using setTimeout (100ms delay)
            if (currentRing < rings) {
                setTimeout(createRing, 100);
            }
        };

        // Start creating rings after a small delay
        setTimeout(createRing, 100);
    }

}//end ship class




