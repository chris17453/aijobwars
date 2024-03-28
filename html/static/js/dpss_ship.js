

class Ship extends GameObject {
    constructor(graphics,x, y, type) {
        switch (type) {
            case 'user':
                super(graphics,x, y,128,153,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/ship1.png');
                this.set_type("ship");
                this.set_center(64,64);
                
                break;

        }
        this.laser_fire_control=new fire_control(3);
        this.missile_fire_control=new fire_control(10);
        this.thrusters = []
        this.projectiles = []
        var thruster1 = new Projectile(this.graphics,+26, 65, 180, "thruster");
        this.thrusters.push(thruster1);
        var thruster2 = new Projectile(this.graphics,-26, 65, 180, "thruster");
        this.thrusters.push(thruster2);

    }


    

    fire_lazer() {
        if (this.laser_fire_control.can_fire()) {
            let lazer1 = this.get_relative_position(-60, -35)
            var projectile = new Projectile(this.graphics,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, "lazer", this.play_sounds);
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.graphics,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, "lazer", this.play_sounds);
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);
        }
    }
    stop_firing_lazer(){
        this.laser_fire_control.stop_firing();
    }

    fire_missle() {
        if(this.missile_fire_control.can_fire()){
            let missle1 = this.get_relative_position(0, -80)
            var projectile = new Projectile(this.graphics,this.position.x + missle1.x, this.position.y + missle1.y, this.rotation, "bolt", this.play_sounds);
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

}//end ship class




