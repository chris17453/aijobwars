class Derbis extends game_object {
    constructor(window_manager,x, y, type) {
        let speed=.5 + Math.random() * 1;
        let default_action =
            [
                { type: "bank_left", frames: 3 },
                { type: "accelerate", frames: 3 },
                { type: "bank_right", frames: 3 },
                { type: "accelerate", frames: 3 },
                { type: "decelerate", frames: 3 },
                { type: "bank_left", frames: 6 },
                { type: "decelerate", frames: 3 },
                { type: "bank_left", frames: 3 },
                { type: "skip", frames: 4 },
            ];

        switch (type) {
            case 'email':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    10);                     // ropration speed
                this.set_image('debris_email');
                this.set_type("email");
                this.set_max_life(50);
                let email_action = [
                    { frames: 4, type: "strafe_left", speed:speed},
                    { frames: 15, type: "skip" },
                    { frames: 4, type: "strafe_right" , speed:speed},
                    { frames: 15, type: "skip"},
                ];


                this.action_list = email_action;
                break;
            case 'pdf':
                super(window_manager,x, y,64,64,
                    1,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('debris_pdf');
                this.set_type("pdf");
                this.set_max_life(30);
                let pdf_action = [
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "bank_left", frames: 4 }
                ];

                this.action_list= pdf_action;
                break;
            case 'call':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('debris_phone');
                this.set_type("call");
                this.set_max_life(40);
                let call_action = [
                    { type: "bank_right", frames: 1 },

                ];

                this.action_list = call_action;
                break;

            case 'webex':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('debris_webex');
                this.set_type("webex");
                this.set_max_life(40);
                this.action_list = default_action;
                break;
            case 'block':
                super(window_manager,x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('block');
                this.set_type("block");
                break;

            case 'linkedin':
                super(window_manager,x, y,64,64,
                    3,                    // mass
                    0,                      // rotation
                    6);                     // ropration speed
                this.set_image('ship_linkedin');
                this.set_type("linkedin");
                this.set_max_life(60);
                let linkedin_action = [
                    { type: "bank_left", frames: 2 },
                    { type: "accelerate", frames: 3, speed:speed },
                    { type: "bank_right", frames: 2 },
                    { type: "skip", frames: 5 }
                ];
                this.action_list = linkedin_action;
                break;

            case 'zoom':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    8);                     // ropration speed
                this.set_image('debris_webex'); // Using webex as placeholder
                this.set_type("zoom");
                this.set_max_life(45);
                let zoom_action = [
                    { frames: 3, type: "strafe_right", speed:speed },
                    { frames: 10, type: "skip" },
                    { frames: 3, type: "strafe_left", speed:speed },
                    { frames: 10, type: "skip" }
                ];
                this.action_list = zoom_action;
                break;

            case 'facebook':
                super(window_manager,x, y,64,64,
                    3,                    // mass
                    0,                      // rotation
                    5);                     // ropration speed
                this.set_image('debris_email'); // Using email as placeholder
                this.set_type("facebook");
                this.set_max_life(55);
                let facebook_action = [
                    { type: "bank_right", frames: 3 },
                    { type: "accelerate", frames: 2, speed:speed },
                    { type: "skip", frames: 8 }
                ];
                this.action_list = facebook_action;
                break;

            case 'reddit':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    7);                     // ropration speed
                this.set_image('debris_pdf'); // Using pdf as placeholder
                this.set_type("reddit");
                this.set_max_life(40);
                let reddit_action = [
                    { type: "bank_left", frames: 1 },
                    { type: "bank_right", frames: 1 },
                    { type: "skip", frames: 3 }
                ];
                this.action_list = reddit_action;
                break;
        }
        this.rotation = 180;

    } // end
}




