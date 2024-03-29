

class Ship extends GameObject {

    constructor(graphics,audio, x, y, type) {
        super(graphics,audio, x, y, 128, 153,
            200,                    // mass
            0,                      // rotation
            8);                     // ropration speed
        
        this.boost_fire_control = new fire_control(3);
        this.laser_fire_control = new fire_control(3);
        this.missile_fire_control = new fire_control(10);
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        let speed=.5 + Math.random() * 4;

        switch (type) {
            case 'user':
                this.set_type("ship");
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/ship1.png');
                this.set_center(64, 64);
                this.booster = new Projectile(this.graphics,audio, +0, 100, 0, "booster");
                this.thrusters.push(this.booster);
                var thruster1 = new Projectile(this.graphics,audio, +30, 55, 0, "thruster");
                this.thrusters.push(thruster1);
                var thruster2 = new Projectile(this.graphics,audio, -30, 55, 0, "thruster");
                this.thrusters.push(thruster2);
                break;

            case 'teams':
                this.set_type("ship");
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/teams.png',64,1,270);
                //this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_rotation(270);
                this.set_center(64, 64);
                this.set_rotation_speed(10);
                let frames=Math.random()*15+10;
                let actions = [
                    { type: "bank_right", frames: 9,  },
                    { type: "accelerate", frames: frames ,speed:speed},
                    { type: "lazer",frames: 1},
                    //{ type: "bank_left", frames: 15,  },
                    //{ type: "accelerate", frames: 6, speed:5},
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
            this.accelerate(10);
            //this.accelerate();
            console.log("BOOST");
        }
    }

    stop_boost() {
        this.boost_fire_control.stop_firing();
        this.booster.set_visible(false);
    }



    fire_lazer() {
        if (this.laser_fire_control.can_fire()) {
            let lazer1 = this.get_relative_position(-60, -35)
            var projectile = new Projectile(this.graphics, this.audio_manager,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, "lazer");
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.graphics, this.audio_manager,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, "lazer");
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);
        }
    }
    stop_firing_lazer() {
        this.laser_fire_control.stop_firing();
    }

    fire_missle() {
        if (this.missile_fire_control.can_fire()) {
            let missle1 = this.get_relative_position(0, -80)
            var projectile = new Projectile(this.graphics, this.audio_manager,this.position.x + missle1.x, this.position.y + missle1.y, this.rotation, "bolt");
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            this.projectiles.push(projectile);
            this.missile_fire_control.stop_firing();
        }

    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);
        this.laser_fire_control.update_frame();
        this.missile_fire_control.update_frame();
        this.boost_fire_control.update_frame();

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
        //super.de_orient(ctx)
    }
    async executeAction(action) {
       super.executeAction(action);
       switch(action.type){
        case 'lazer': this.fire_lazer(); break;
       }
    }

}//end ship class




