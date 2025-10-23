

class Explosion extends game_object {
    constructor(window_manager,x, y) {
                super(window_manager,x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10);      
        this.set_image('explosion_sprite',128,35);
        this.set_center(64,64);
        this.set_type("explosion");
        this.set_loop(false);
        //this.set_sound("destroy","static/explosion/sfx_exp_shortest_soft9.wav");
    }

            
}

