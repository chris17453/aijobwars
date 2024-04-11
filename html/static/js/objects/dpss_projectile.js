
class Projectile extends game_object {
    constructor(window_manager, x, y, rotation, type, sounds = false) {
        switch (type) {
            case 'lazer':
                let actions = [
                    { type: "accelerate", frames: 1 }
                ];
                super(window_manager, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P3.png', 16, 4, 270);
                this.set_velocity_loss_off();
                this.set_center(8, 8);
                this.expire(5);
                this.set_type("laser");
                //this.action_list=actions;

                break;

            case 'bolt1':
                super(window_manager, x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P1.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                break;
            case 'bolt2':
                super(window_manager, x, y, 16, 16,
                    200,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P2.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                break;
            case 'bolt3':
                super(window_manager, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P3.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                break;
            case 'bolt4':
                super(window_manager, x, y, 16, 16,
                    100,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P4.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                break;


            case 'thruster':
                super(window_manager, x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/ships/Water Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.center.y = 8;
                this.expire(5);
                this.set_type("thrusters");
                break;

            case 'booster':
                super(window_manager, x, y, 32, 64,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/ships/booster.png', 32, 4, 0);
                this.set_velocity_loss_off();
                this.center.x = 16;
                this.center.y = 2;
                this.set_type("booster");
                break;

        }


    }

}
