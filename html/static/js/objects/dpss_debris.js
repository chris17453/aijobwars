

class Derbis extends GameObject {
    constructor(graphics,x, y, type) {
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
                super(graphics,x, y,
                    500,                    // mass
                    0,                      // rotation
                    10);                     // ropration speed
                this.set_image('static/debris/email.png');
                this.set_type("email");
                let email_action = [
                    { frames: 4, type: "strafe_left", speed:speed},
                    { frames: 15, type: "skip" },
                    { frames: 4, type: "strafe_right" , speed:speed},
                    { frames: 15, type: "skip"},
                ];


                this.action_list = email_action;
                break;
            case 'pdf':
                super(graphics,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/pdf.png');
                this.set_type("pdf");
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
                super(graphics,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/phone.png');
                this.set_type("call");
                let call_action = [
                    { type: "bank_right", frames: 1 },

                ];

                this.action_list = call_action;
                break;

            case 'webex':
                super(graphics,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/webex.png');
                this.set_type("webex");
                this.action_list = default_action;
                break;
            case 'block':
                super(graphics,x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('static/blocks/block.png');
                this.set_type("block");
        }
        this.rotation = 180;

    } // end
}
