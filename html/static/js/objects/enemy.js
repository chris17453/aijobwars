class Enemy extends game_object {
    constructor(window_manager, x, y, type) {
        let speed = 2 + Math.random() * 3;

        switch (type) {
            case 'chatgpt':
                super(window_manager, x, y, 64, 64,
                    5,                    // mass (medium debris)
                    0,                    // rotation
                    12);                  // rotation speed
                this.set_image('static/ships/chatgpt.png');
                this.set_type("chatgpt");
                this.set_max_life(80);
                this.projectiles = [];
                this.bolt_type = "bolt2";

                let chatgpt_action = [
                    { type: "bank_left", frames: 2 },
                    { type: "accelerate", frames: 4, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "bank_right", frames: 4 },
                    { type: "accelerate", frames: 4, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "skip", frames: 3 }
                ];
                this.action_list = chatgpt_action;
                this.action_position.frame = parseInt(Math.random() * chatgpt_action.length);
                break;

            case 'resume':
                super(window_manager, x, y, 64, 64,
                    4,                    // mass (light debris)
                    0,                    // rotation
                    10);                  // rotation speed
                this.set_image('static/ships/resume.png');
                this.set_type("resume");
                this.set_max_life(60);
                this.projectiles = [];
                this.bolt_type = "bolt2";

                let resume_action = [
                    { frames: 2, type: "strafe_left", speed: speed },
                    { frames: 8, type: "accelerate", speed: speed },
                    { frames: 1, type: "lazer", speed: 5 },
                    { frames: 2, type: "strafe_right", speed: speed },
                    { frames: 8, type: "accelerate", speed: speed },
                    { frames: 1, type: "lazer", speed: 5 },
                    { frames: 5, type: "skip" }
                ];
                this.action_list = resume_action;
                this.action_position.frame = parseInt(Math.random() * resume_action.length);
                break;

            case 'application':
                super(window_manager, x, y, 64, 64,
                    6,                    // mass (medium debris)
                    0,                    // rotation
                    8);                   // rotation speed
                this.set_image('static/debris/phone.png'); // Placeholder
                this.set_type("application");
                this.set_max_life(100);

                let application_action = [
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "bank_left", frames: 3 },
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "bank_right", frames: 3 },
                    { type: "skip", frames: 4 }
                ];
                this.action_list = application_action;
                this.action_position.frame = parseInt(Math.random() * application_action.length);
                break;

            case 'linkedin':
                super(window_manager, x, y, 64, 64,
                    5,                    // mass (medium)
                    0,                    // rotation
                    10);                  // rotation speed
                this.set_image('static/ships/linkedin.png');
                this.set_type("linkedin");
                this.set_max_life(70);
                this.projectiles = [];
                this.bolt_type = "bolt2";

                let linkedin_action = [
                    { type: "bank_left", frames: 3 },
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "strafe_right", frames: 2, speed: speed },
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "bank_right", frames: 3 },
                    { type: "skip", frames: 4 }
                ];
                this.action_list = linkedin_action;
                this.action_position.frame = parseInt(Math.random() * linkedin_action.length);
                break;
        }

        this.rotation = 180;
    }

    fire_lazer() {
        if (!this.bolt_type || !this.projectiles) return;

        let lazer1 = this.get_relative_position(0, 60); // Fire from center-bottom of enemy ship
        var projectile = new Projectile(this.window_manager, this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, this.bolt_type);
        projectile.set_velocity(this.velocity);
        projectile.accelerate(50);
        this.projectiles.push(projectile);
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);

        // Update and cleanup projectiles
        if (this.projectiles) {
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
    }

    render(window) {
        super.orient(window);
        super.render();
        super.de_orient();

        // Render projectiles
        if (this.projectiles) {
            for (let projectile of this.projectiles) {
                projectile.orient(window);
                projectile.render();
                projectile.de_orient();
            }
        }
    }

    async executeAction(action) {
        super.executeAction(action);
        switch (action.type) {
            case 'lazer':
                this.fire_lazer();
                break;
        }
    }
}
