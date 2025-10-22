class Boss extends game_object {
    constructor(window_manager, x, y, type) {
        switch (type) {
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

    // Boss can fire weapons
    fire_lazer() {
        if (this.laser_fire_control && this.laser_fire_control.can_fire()) {
            // Fire from left side
            let lazer1 = this.get_relative_position(-40, 35);
            var projectile1 = new Projectile(
                this.window_manager,
                this.position.x + lazer1.x,
                this.position.y + lazer1.y,
                this.rotation,
                this.bolt_type
            );
            projectile1.set_velocity(this.velocity);
            projectile1.accelerate(3);
            this.projectiles.push(projectile1);

            // Fire from right side
            let lazer2 = this.get_relative_position(+40, 35);
            var projectile2 = new Projectile(
                this.window_manager,
                this.position.x + lazer2.x,
                this.position.y + lazer2.y,
                this.rotation,
                this.bolt_type
            );
            projectile2.set_velocity(this.velocity);
            projectile2.accelerate(3);
            this.projectiles.push(projectile2);
        }
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);

        if (this.laser_fire_control) {
            this.laser_fire_control.update_frame();

            // Boss fires periodically
            if (Math.random() < 0.05) { // 5% chance each frame
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
        super.render();
        super.de_orient();

        // Render boss projectiles
        for (let projectile of this.projectiles) {
            projectile.orient(window);
            projectile.render();
            projectile.de_orient();
        }
    }
}
