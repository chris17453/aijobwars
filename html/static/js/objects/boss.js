class Boss extends game_object {
    constructor(window_manager, x, y, type) {
        switch (type) {
            case 'chatgpt':
                super(window_manager, x, y, 400, 400,  // Large boss - 400x400 collision box
                    15,                   // mass - very heavy
                    0,                    // rotation
                    4);                   // rotation speed

                this.set_image('static/ships/chatgpt.png');
                this.set_type("boss");
                this.set_max_life(50000); // 10x player ship health (player has 5000)
                this.set_center(200, 200); // Center point for 400x400

                // Store actual image dimensions for rendering
                this.image_source_width = 1024;
                this.image_source_height = 1024;

                // Boss enters from top then strafes horizontally
                this.action_list = [
                    { type: "accelerate", frames: 20, speed: 3 }, // Move down to center
                    { type: "strafe_left", frames: 30, speed: 2 },
                    { type: "strafe_right", frames: 60, speed: 2 },
                    { type: "strafe_left", frames: 30, speed: 2 },
                    { type: "skip", frames: 10 }
                ];

                this.bolt_type = "bolt3";
                this.projectiles = [];

                // Boss hover behavior - locks Y position while allowing X movement
                this.hover_target_y = null; // Will be set when spawned
                this.is_hovering = false;
                this.hover_damping = 0.85; // Slow down when approaching target

                // 6 cannon positions for chatGPT boss (scaled for 400x400)
                this.cannons = [
                    { x: -120, y: 80 },   // Left top
                    { x: -120, y: 160 },  // Left bottom
                    { x: 120, y: 80 },    // Right top
                    { x: 120, y: 160 },   // Right bottom
                    { x: -60, y: 120 },   // Center left
                    { x: 60, y: 120 }     // Center right
                ];

                // Boss fires more frequently
                this.laser_fire_control = new fire_control(12, 1500, 800);
                break;

            case 'resume':
                super(window_manager, x, y, 400, 400,  // Large boss - 400x400 collision box
                    15,                   // mass - very heavy
                    0,                    // rotation
                    4);                   // rotation speed

                this.set_image('static/ships/resume.png');
                this.set_type("boss");
                this.set_max_life(50000); // 10x player ship health (player has 5000)
                this.set_center(200, 200); // Center point for 400x400

                // Store actual image dimensions for rendering
                this.image_source_width = 1024;
                this.image_source_height = 1024;

                // Boss enters from top then strafes horizontally
                this.action_list = [
                    { type: "accelerate", frames: 20, speed: 3 }, // Move down to center
                    { type: "strafe_right", frames: 30, speed: 2 },
                    { type: "strafe_left", frames: 60, speed: 2 },
                    { type: "strafe_right", frames: 30, speed: 2 },
                    { type: "skip", frames: 10 }
                ];

                this.bolt_type = "bolt3";
                this.projectiles = [];

                // Boss hover behavior - locks Y position while allowing X movement
                this.hover_target_y = null; // Will be set when spawned
                this.is_hovering = false;
                this.hover_damping = 0.85; // Slow down when approaching target

                // 6 cannon positions for resume boss (scaled for 400x400)
                this.cannons = [
                    { x: -140, y: 60 },   // Left top
                    { x: -140, y: 180 },  // Left bottom
                    { x: 140, y: 60 },    // Right top
                    { x: 140, y: 180 },   // Right bottom
                    { x: 0, y: 90 },      // Center top
                    { x: 0, y: 150 }      // Center bottom
                ];

                // Boss fires more frequently
                this.laser_fire_control = new fire_control(12, 1500, 800);
                break;

            case 'interview':
                super(window_manager, x, y, 128, 128,
                    10,                   // mass - heavier than normal enemies
                    0,                    // rotation
                    6);                   // rotation speed

                this.set_image('static/ships/teams.png', 64, 1, 270); // Using teams ship as placeholder
                this.set_type("boss");
                this.set_max_life(500); // Much higher health
                this.set_center(64, 64);

                // More complex AI pattern
                let boss_action = [
                    { type: "bank_right", frames: 5 },
                    { type: "accelerate", frames: 10, speed: 3 },
                    { type: "bank_left", frames: 10 },
                    { type: "accelerate", frames: 10, speed: 3 },
                    { type: "bank_left", frames: 10 },
                    { type: "accelerate", frames: 10, speed: 3 },
                    { type: "bank_right", frames: 5 },
                    { type: "skip", frames: 5 }
                ];

                this.action_list = boss_action;
                this.bolt_type = "bolt2";
                this.projectiles = [];

                // Boss fires more frequently
                this.laser_fire_control = new fire_control(8, 2000, 1000);
                break;
        }

        this.rotation = 180;
        this.is_boss = true;
    }

    // Boss can fire weapons from multiple cannons
    fire_lazer() {
        if (this.laser_fire_control && this.laser_fire_control.can_fire()) {
            // If boss has cannons array, fire from all cannons
            if (this.cannons && this.cannons.length > 0) {
                for (let cannon of this.cannons) {
                    let cannonPos = this.get_relative_position(cannon.x, cannon.y);
                    var projectile = new Projectile(
                        this.window_manager,
                        this.position.x + cannonPos.x,
                        this.position.y + cannonPos.y,
                        this.rotation,
                        this.bolt_type
                    );
                    projectile.set_velocity(this.velocity);
                    projectile.accelerate(30);
                    this.projectiles.push(projectile);
                }
            } else {
                // Fallback to old 2-cannon system for interview boss
                let lazer1 = this.get_relative_position(-40, 35);
                var projectile1 = new Projectile(
                    this.window_manager,
                    this.position.x + lazer1.x,
                    this.position.y + lazer1.y,
                    this.rotation,
                    this.bolt_type
                );
                projectile1.set_velocity(this.velocity);
                projectile1.accelerate(30);
                this.projectiles.push(projectile1);

                let lazer2 = this.get_relative_position(+40, 35);
                var projectile2 = new Projectile(
                    this.window_manager,
                    this.position.x + lazer2.x,
                    this.position.y + lazer2.y,
                    this.rotation,
                    this.bolt_type
                );
                projectile2.set_velocity(this.velocity);
                projectile2.accelerate(30);
                this.projectiles.push(projectile2);
            }
        }
    }

    update_frame(deltaTime) {
        // Handle hover behavior - stop Y movement at target, allow X strafing
        if (this.hover_target_y !== null && !this.is_hovering) {
            // Check if boss has reached target Y position
            if (this.position.y >= this.hover_target_y) {
                this.is_hovering = true;
                this.velocity.y = 0;
                this.position.y = this.hover_target_y; // Lock Y to exact position
                console.log('[Boss] Reached hover position at', this.hover_target_y);
            } else {
                // Apply damping to Y velocity as we approach target
                const distance = this.hover_target_y - this.position.y;
                if (distance < 100) {
                    this.velocity.y *= this.hover_damping;
                }
            }
        }

        // If hovering, keep Y position locked but allow X movement
        if (this.is_hovering) {
            this.velocity.y = 0;
            this.position.y = this.hover_target_y;
        }

        super.update_frame(deltaTime);

        // Clamp boss to screen boundaries (prevent going off screen)
        const viewport = this.graphics.viewport.virtual;
        const margin = this.width / 2; // Half boss width for center-based positioning

        // Clamp X position (left/right boundaries)
        if (this.position.x < margin) {
            this.position.x = margin;
            this.velocity.x = 0; // Stop horizontal movement
        }
        if (this.position.x > viewport.width - margin) {
            this.position.x = viewport.width - margin;
            this.velocity.x = 0;
        }

        if (this.laser_fire_control) {
            this.laser_fire_control.update_frame();

            // Boss fires periodically (more frequently when hovering)
            const fireChance = this.is_hovering ? 0.08 : 0.05;
            if (Math.random() < fireChance) {
                this.fire_lazer();
            }
        }

        // Update projectiles
        const timestamp = Date.now();
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (timestamp - projectile.created > 5000) {
                this.projectiles.splice(i, 1);
            } else {
                projectile.update_frame(deltaTime);
            }
        }
    }

    render(window) {
        super.orient(window);

        // Custom render for boss - scale full source image to fit object size
        if (this.visible && this.image_source_width && this.image_source_height) {
            // Use FULL source image dimensions
            let src = new rect(0, 0, this.image_source_width, this.image_source_height);
            // Scale to object size (400x400)
            let dest = new rect(-this.center.x, -this.center.y, this.width, this.height);
            this.graphics.sprites.render(this.img, src, dest, 1, 'none');

            // Render explosions
            for(let i = 0; i < this.explosions.length; i++){
                this.explosions[i].render();
            }
        } else {
            // Fallback to normal render for interview boss
            super.render();
        }

        super.de_orient();

        // Render boss projectiles
        for (let projectile of this.projectiles) {
            projectile.orient(window);
            projectile.render();
            projectile.de_orient();
        }
    }
}
