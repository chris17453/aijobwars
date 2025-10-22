class Enemy extends game_object {
    constructor(window_manager, x, y, type) {
        let speed = 2 + Math.random() * 3;

        switch (type) {
            case 'chatgpt':
                super(window_manager, x, y, 64, 64,
                    5,                    // mass (medium debris)
                    0,                    // rotation
                    12);                  // rotation speed
                this.set_image('static/debris/email.png'); // Placeholder
                this.set_type("chatgpt");
                this.set_max_life(80);

                let chatgpt_action = [
                    { type: "bank_left", frames: 2 },
                    { type: "accelerate", frames: 4, speed: speed },
                    { type: "bank_right", frames: 4 },
                    { type: "accelerate", frames: 4, speed: speed },
                    { type: "skip", frames: 3 }
                ];
                this.action_list = chatgpt_action;
                break;

            case 'resume':
                super(window_manager, x, y, 64, 64,
                    4,                    // mass (light debris)
                    0,                    // rotation
                    10);                  // rotation speed
                this.set_image('static/debris/pdf.png'); // Placeholder
                this.set_type("resume");
                this.set_max_life(60);

                let resume_action = [
                    { frames: 2, type: "strafe_left", speed: speed },
                    { frames: 8, type: "accelerate", speed: speed },
                    { frames: 2, type: "strafe_right", speed: speed },
                    { frames: 8, type: "accelerate", speed: speed },
                    { frames: 5, type: "skip" }
                ];
                this.action_list = resume_action;
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
                break;
        }

        this.rotation = 180;
    }
}
