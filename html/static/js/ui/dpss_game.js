class game extends modal{
    layout(){
        this.active=true;
        this.ok=false
        this.cancel=false
        this.close=true;
        this.title="Level - 1";
        this.text="";
        this.resize();
        this.add_buttons();
        this.no_skin();


        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.boss_mode_activated = false;
        this.pause_game = false;
        
        this.ui = new ui(this.ctx, this);
        this.level = new level(this.window_manager);
        this.level.load('https://aijobwars.com/static/levels/level.json');
        this.level.on("loaded",this.start_level.bind(this));

        this.laser_bar   = new percentage_bar_fluid(this.window_manager, new rect(10, 10+1*50, 200, 40), "bar","bar-red-fluid");
        this.missile_bar = new percentage_bar_fluid(this.window_manager, new rect(30, 10+2*50, 200, 40), "bar","bar-orange-fluid");
        this.booster_bar = new percentage_bar_fluid(this.window_manager, new rect(30, 10+3*50, 200, 40), "bar","bar-blue-fluid");
        this.health_bar  = new percentage_bar_fluid(this.window_manager, new rect(10, 10+4*50, 200, 40), "bar","bar-green-fluid");
        
        //this.laser_timeout =  new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        //this.missile_timeout =  new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        //this.booster_timeout = new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        this.render_callback(this.updateFrame);

    }

    resize(){
        let x=0;//this.graphics.viewport.given.x;
        let y=this.graphics.viewport.given.y;
        let window_width=this.graphics.viewport.given.width;;
        let window_height=this.graphics.viewport.given.height;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        super.resize();
    }




    // Function to update canvas size and draw the background image
    single_collsion(obj2,j=0){
        let window = { y1: this.level.position.y, y2: this.level.position.y + this.graphics.viewport.virtual.height }
        let collisions=[];
        for (let i = j; i < this.level.npc.length; i++) {
            const obj1 = this.level.npc[i];
            if (obj1.position.y < window.y1 || obj1.position.y > window.y2) continue;
            if (obj2.position.y < window.y1 || obj2.position.y > window.y2) continue;
            if (obj1 == obj2) continue; //wtf and why.. fix this bullshittery

                if (obj1.check_collision(obj2)) {
                    collisions.push([obj1,obj2]);
                    
                }
            }
            return collisions;
    }



    check_collisions() {
        let collisions=[];
        /*for (let i = 0; i < this.level.npc.length; i++) {
            const obj1 = this.level.npc[i];
            let collision=this.single_collsion(obj1,i+1);
            if(collision.length>0) {
                collisions.push(...collision);
            }
        }*/

        /*

        for (let i = 0; i < this.level.npc.length; i++) {
            for(let e=0;e<this.level.npc[e].projectiles;e++){
                let obj1 = this.level.npc[e].projectiles[e];
                this.single_collsion(obj1);
            }
        }
        
        for(let i=0;i<this.level.spaceship.projectiles;i++){
            let obj1 = this.level.spaceship.projectiles[i];
            this.single_collsion(obj1);
        }
        */
        let obj1 = this.level.spaceship;
        let collision=this.single_collsion(obj1);
        if(collision.length>0) {
            collisions.push(...collision);
        }

        // ok we have all objects intersecting... lets do a single IMPACT.. 
        // and for those that are still intersecting.. 
        // we will loop until the thing is nolonger intersecting
        if (collisions.length>0) console.log("IN Collision");
        let deltaTime=10/24;
        for( let i=0;i<collisions.length;i++){
            let is_it_colliding  = collisions[i][0].check_collision(collisions[i][1]);
            if (is_it_colliding==false) continue; 
                
            collisions[i][0].impact(collisions[i][1]);
            let colliding = false;
            for (let o = 0; o < 100000 && colliding; o++) {
                collisions[i][0].update_position(deltaTime);
                collisions[i][1].update_position(deltaTime);
                colliding = collisions[i][0].check_collision(collisions[i][1]);
                console.log("Pushing awaay");
            }
        }
        
    }


    updateFrame() {
        //this.events.handle_keys();

        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // Clear any previous drawings
        //this.graphics.updateCanvasSizeAndDrawImage(this.level.position);
        //this.level.position.y -= this.level.speed;

        //TODO next level stuffs
        if (this.level.position.y == 0) {
            this.level_start = false;
        }

        
        this.graphics.viewport.world.y = this.level.position.y;
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }

        this.level.npc = this.level.npc.filter(npc => !npc.destroy_object);

        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
                npc.update_motion(deltaTime);
                let collisions=this.single_collsion(npc,b+1);
                if(collisions.length!=0) {
                    npc.restore_state();
                    for(let c=0;c<collisions.length;c++){
                        npc.impact(collisions[c][0]);
                        npc.update_motion(deltaTime)
                
                    }
                }
            }
        }



        //render
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {

                if (npc.type == "ship") {
                    npc.update_frame(deltaTime)
                    npc.render({ x: 0, y: window.y1 });

                } else {
                    npc.update_frame(deltaTime)
                    npc.orient({ x: 0, y: window.y1 });
                    npc.render();
                    npc.de_orient();
                }

            }

        }


        let percentage1 = this.level.spaceship.laser_fire_control.get_cooldown_percentage();
        this.laser_bar.render(percentage1);
        let percentage3 = this.level.spaceship.missile_fire_control.get_cooldown_percentage();
        this.missile_bar.render(percentage3);
        let percentage5 = this.level.spaceship.get_life_percentage();
        this.health_bar.render(percentage5);
        let percentage6 = this.level.spaceship.boost_fire_control.get_cooldown_percentage();
        this.booster_bar.render(percentage6);
        /*
        let percentage2 = this.level.spaceship.laser_fire_control.timeout_percentage();
        this.laser_timeout.render(percentage2);

        let percentage4 = this.level.spaceship.missile_fire_control.timeout_percentage();
        this.missile_timeout.render(percentage4);



        let percentage7 = this.level.spaceship.boost_fire_control.timeout_percentage();
        this.booster_timeout.render(percentage7);

*/
        //this.check_collisions();
        //if(this.level.spaceship!=null) {
        //    this.level.spaceship.update_frame(deltaTime);
        //    this.level.spaceship.render({ x: 0, y: window.y1 });
        //}
    }



    start_level() {
        this.level_start = true;
        if (this.track1Sound != null && this.play_sounds) {
            this.track1Sound.play();
        }
    }


    handle_keys(kb) {
        if (this.active==false) return;
        if (this.level_start == true) {
            // In your game loop, check keysPressed object to determine actions
            if (kb.is_pressed('ArrowLeft')) this.level.spaceship.bank_left();
            if (kb.is_pressed('ArrowRight')) this.level.spaceship.bank_right();
            if (kb.is_pressed('ArrowUp')) this.level.spaceship.accelerate();
            if (kb.is_pressed('ArrowDown')) this.level.spaceship.decelerate();
            if (kb.is_pressed(' ')) this.level.spaceship.fire_lazer();
            if (kb.just_stopped(' ')) this.level.spaceship.stop_firing_lazer();
            if (kb.just_stopped('Enter')) this.level.spaceship.fire_missle();
            if (kb.is_pressed('a') || kb.is_pressed('A')) this.level.spaceship.strafe_left(50);
            if (kb.is_pressed('d') || kb.is_pressed('D')) this.level.spaceship.strafe_right(50);
            if (kb.is_pressed('w') || kb.is_pressed('W')) 
            this.level.spaceship.accelerate(50);
            if (kb.is_pressed('s') || kb.is_pressed('S')) this.level.spaceship.decelerate(50);
            //if (kb.is_pressed('Escape')) this.G.level.spaceship.pause();

            if (kb.is_pressed('Shift')) this.level.spaceship.boost();
            
            if (kb.just_stopped('Shift')) this.level.spaceship.stop_boost();
            if (kb.just_stopped('+')) this.level.volume(+1);
            if (kb.just_stopped('-')) this.level.volume(-1);
            /*
            if (kb.just_stopped('ArrowLeft')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowRight')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowUp')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowDown')) this.audio_manager.sound_off();
*/
            if (kb.just_stopped('h') ||kb.just_stopped('H')) this.help();

            if (kb.just_stopped('m') || kb.just_stopped('M')) this.ui.toggle_sound();

        }

/*
        if (kb.just_stopped('Escape')) {

            if (this.G.boss_mode_activated) this.G.ui.boss_mode_off();
            else if (kb.ctrl()) this.G.ui.boss_mode_on();

            else if (this.G.pause_game == true) this.G.ui.unpause();
            else this.G.ui.pause();
            
        }
  */
    } 
}