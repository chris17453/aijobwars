
class Projectile extends GameObject {
    constructor(graphics, x, y, rotation, type, sounds = false,volume) {
        switch (type) {
            case 'lazer':
                let actions = [
                    { type: "accelerate", frames: 1 }
                ];
                super(graphics, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_sound("accel", 'static/audio/projectiles/sfx_wpn_laser6.wav')
                this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.set_center(8, 8);
                this.expire(5);
                this.set_type("laser");
                this.set_volume(volume);
                //this.action_list=actions;

                break;

            case 'bolt':
                super(graphics, x, y, 16, 16,
                    600,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_sound("accel", 'static/audio/projectiles/sfx_weapon_singleshot13.wav')
                this.set_image('static/projectiles/Firebomb.png', 16, 5, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                this.set_volume(volume);
                break;

            case 'thruster':
                super(graphics, x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_image('static/ships/Water Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.center.y = 8;
                this.expire(5);
                this.set_type("thrusters");
                this.set_volume(volume);
                break;

            case 'booster':
                super(graphics, x, y, 32, 64,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_image('static/ships/booster.png', 32, 4, 0);
                this.set_velocity_loss_off();
                this.center.x = 16;
                this.center.y = 2;
                this.set_type("booster");
                this.set_visible(false);

                break;

        }


    }

}