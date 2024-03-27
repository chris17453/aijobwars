class Projectile extends GameObject {
    constructor(x, y, rotation, type, sounds = false) {
        switch (type) {
            case 'lazer':
                super(x, y,16,16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_sound("accel", 'static/audio/projectiles/sfx_wpn_laser6.wav')
                this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.expire(5);
                this.set_type("laser");

                break;

            case 'bolt':
                super(x, y,16,16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_sound("accel", 'static/audio/projectiles/sfx_weapon_singleshot13.wav')
                this.set_image('static/projectiles/Firebomb.png', 16, 5, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");

                break;

            case 'thruster':
                super(x, y,16,16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_image('static/ships/Water Bolt.png', 16, 5, 90);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.center.y = 8;
                this.expire(5);
                this.set_type("thrusters");

                break;

        }


    }

}

class Ship extends GameObject {
    constructor(x, y, type) {
        switch (type) {
            case 'user':
                super(x, y,128,128,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/ship1.png');
                this.set_type("ship");

                break;

        }

        this.thrusters = []
        this.projectiles = []
        var thruster1 = new Projectile(+6, +80, 180, "thruster");
        this.thrusters.push(thruster1);
        var thruster2 = new Projectile(-26, +80, 180, "thruster");
        this.thrusters.push(thruster2);

    }

    fire_lazer() {
        let lazer1 = this.get_relative_position(-65, -15)
        var projectile = new Projectile(this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, "lazer", this.play_sounds);
        projectile.accelerate();
        this.projectiles.push(projectile);

        let lazer2 = this.get_relative_position(+50, -15)
        var projectile = new Projectile(this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, "lazer", this.play_sounds);
        projectile.accelerate();
        this.projectiles.push(projectile);

    }

    fire_missle() {
        let missle1 = this.get_relative_position(-10, -60)
        var projectile = new Projectile(this.position.x + missle1.x, this.position.y + missle1.y, this.rotation, "bolt", this.play_sounds);
        projectile.accelerate();
        this.projectiles.push(projectile);

    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);

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

    sound_off() {
        this.play_sounds = false;
        super.sound_off();
        for (let thruster of this.thrusters) {
            thruster.sound_off();
        }
        for (let projectile of this.projectiles) {
            projectile.sound_off();
        }
    }

    sound_on() {
        this.play_sounds = true;
        super.sound_on();
        for (let thruster of this.thrusters) {
            thruster.sound_on();
        }
        for (let projectile of this.projectiles) {
            projectile.sound_on();
        }


    }

    render(ctx) {
        super.orient(ctx)
        for (let thruster of this.thrusters) {
            thruster.orient(ctx)
            thruster.render(ctx)
            thruster.de_orient(ctx)
        }

        super.render(ctx);
        super.de_orient(ctx)

        for (let projectile of this.projectiles) {
            projectile.orient(ctx)

            projectile.render(ctx)
            projectile.de_orient(ctx)
        }
        //super.de_orient(ctx)
    }

}//end ship class



class Explosion extends GameObject {
    constructor(x, y) {
                super(x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10);                     // ropration speed
                this.set_image('static/explosion/exp_9_128x128_35frames_strip35.png',128,35);
                this.set_center(64,64);
                this.set_type("explosion");
                this.set_loop(false);
    }

            
}




class Derbis extends GameObject {
    constructor(x, y, type) {
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
                super(x, y,
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
                super(x, y,64,64,
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
                super(x, y,64,64,
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
                super(x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/webex.png');
                this.set_type("webex");
                this.action_list = default_action;
                break;
            case 'block':
                super(x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('static/blocks/block.png');
                this.set_type("block");
        }
        this.rotation = 180;

    } // end
}