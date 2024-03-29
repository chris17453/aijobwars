

class Explosion extends GameObject {
    constructor(graphics,audio,x, y) {
                super(graphics,audio,x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10);                     // 
                this.set_image('static/explosion/exp_9_128x128_35frames_strip35.png',128,35);
                this.set_center(64,64);
                this.set_type("explosion");
                this.set_loop(false);
                this.set_sound("destroy","static/explosion/sfx_exp_shortest_soft9.wav");
    }

            
}

