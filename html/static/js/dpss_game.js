class GamePage {
    constructor(elementIds, initialWidth, initialHeight) {

        //const gameClient = new GameClient('ws://localhost:6789', initialWidth, initialHeight);
        //gameClient.connect();

        //this.gameClient = gameClient;
        this.gameClient = null;
        this.login = document.getElementById(elementIds.loginId);
        this.game = document.getElementById(elementIds.game_id);
        this.boss_mode = document.getElementById(elementIds.boss_mode_id);
        this.canvasContainer = document.getElementById(elementIds.canvasContainerId);
        this.canvas = document.getElementById(elementIds.canvasId);
        this.ctx = this.canvas.getContext('2d');


        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.FADE_OUT_DURATION = 5;
        this.outro = "Congratulations, you've emerged victorious from the AI Job Wars! Your resilience and strategic prowess have paid off, leading you to triumph over the relentless AI competition. With your job secured, you stand as a testament to human ingenuity and determination in the face of technological advancement. But the journey doesn't end here - continue honing your skills and facing new challenges as you navigate the ever-evolving landscape of the job market. Keep pushing forward, and may success always be within your grasp!";
        this.boss_mode_activated = false;
        this.pause_game = false;
        // control plane
        
        this.graphics = new graphics(this.canvas, this.ctx); //drawing the main level logic
        this.events = new game_events(this);   //kb events and socket etc..
        this.audio_manager = new audio_manager();
        this.window_manager = new window_manager(this.graphics);
        this.ui = new ui(this.ctx, this);
        this.level = new level(this);
        this.level.load('https://aijobwars.com/static/levels/level.json');

        this.graphics.on('complete', ()=> this.init());
        


    }

    init(){
        this.laser_bar = new PercentageBar(this.graphics, 10, 10, 200, 40, "Laser");
        this.laser_timeout = new PercentageBar(this.graphics, 10, 50, 200, 40, "Laser Timeout");
        this.missile_bar = new PercentageBar(this.graphics, 220, 10, 200, 40, "Missle");
        this.missile_timeout = new PercentageBar(this.graphics, 220, 50, 200, 40, "Missle Timeout");
        this.booster_bar = new PercentageBar(this.graphics, 430, 10, 200, 40, "Booster");
        this.booster_timeout = new PercentageBar(this.graphics, 430, 50, 200, 40, "Booster Timeout");
        this.health_bar = new PercentageBar(this.graphics, 640, 10, 200, 40, "Health");


        this.create_master_menu();
        this.startRendering();
    }

    create_master_menu() {
        let h=(this.graphics.viewport.frame.height-600)/2;
        let w=this.graphics.viewport.frame.width;
        let position = new rect(50, h, 500, 650,"left","top");
        const masterMenu = this.window_manager.create_modal("Main Menu", null, position, false, false);
        this.window_manager.set_background("menu");

        let x = 30;//masterMenu.internal_rect.width/2;
        let y = 0;
        let button_spacing = 80,button_width=masterMenu.internal_rect.width-60;
        let button_position1=new rect(x,y,button_width,null,"left","top");
        let button_position2=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position3=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position4=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position5=new rect(x,masterMenu.internal_rect.height-110,button_width,null,"left","top");
        let button_position6=new rect(w/2-200,10,1024,236,"left","top");
        
        masterMenu.add_image(button_position6,"title");
        masterMenu.add_button("New Game",button_position1,this.new_game.bind(this), "button-up-cyan", "button-down-cyan");
        masterMenu.add_button("Story So Far", button_position2,this.story.bind(this), "button-up-cyan", "button-down-cyan");
        masterMenu.add_button("High Scores", button_position3,this.high_scoress_menu.bind(this), "button-up-cyan", "button-down-cyan");
        masterMenu.add_button("Credits", button_position4,this.credits_menu.bind(this),"button-up-cyan", "button-down-cyan");
        masterMenu.add_button("Exit", button_position5,this.exit.bind(this), "button-up-red", "button-down-red");

    }
    exit(event ){
        alert("I can't realy close the window...\n But I'd like to!\n Thanks for playin\n -Chris");
    }

    credits_menu(event) {
        let position = new rect(50, null, 500, 650,"left","top");
        let credits="";
        const masterMenu = this.window_manager.create_modal("Credits", credits, position, false, false);
        this.window_manager.set_background("menu");
        let x = 30;
        let button_width=masterMenu.internal_rect.width-60;
        let button_position5=new rect(x,masterMenu.internal_rect.height-110,button_width,null,"left","top");

        masterMenu.add_button("Exit", button_position5,this.credits_exit_callback.bind(this), "button-up-red", "button-down-red");

    }

    high_scoress_menu(event) {
        let position = new rect(50, null, 500, 650,"left","top");
        let credits="Created By: Charles Watkins";
        const masterMenu = this.window_manager.create_modal("Credits", credits, position, false, false);
        this.window_manager.set_background("menu");
        let x = 30;
        let button_width=masterMenu.internal_rect.width-60;
        let button_position5=new rect(x,masterMenu.internal_rect.height-110,button_width,null,"left","top");

        masterMenu.add_button("Exit", button_position5,this.credits_exit_callback.bind(this), "button-up-red", "button-down-red");

    }

    story(event) {
        let position = new rect(50, null, 500, 650,"left","top");
        let credits="Created By: Charles Watkins";
        const masterMenu = this.window_manager.create_modal("Credits", credits, position, false, false);
        this.window_manager.set_background("menu");
        let x = 30;
        let button_width=masterMenu.internal_rect.width-60;
        let button_position5=new rect(x,masterMenu.internal_rect.height-110,button_width,null,"left","top");

        masterMenu.add_button("Exit", button_position5,this.credits_exit_callback.bind(this), "button-up-red", "button-down-red");

    }


    credits_exit_callback(event){
        event.parent.close();
        this.create_master_menu();
    }

    new_game(event){
        event.parent.close();
        this.start_level();
    }

    help() {

        let help_text = "| Key           | Action                 |\n" +
            "|---------------|------------------------|\n" +
            "| Q             | Quit the game          |\n" +
            "| Arrow Left    | Bank left              |\n" +
            "| Arrow Right   | Bank right             |\n" +
            "| Arrow Up      | Accelerate             |\n" +
            "| Arrow Down    | Decelerate             |\n" +
            "| STRAFING      | WASD                   |\n" +
            "| Space         | Fire lasers            |\n" +
            "| Enter         | Fire Missiles          |\n" +
            "| M             | Toggle Sound           |\n" +
            "| +             | Volume up              |\n" +
            "| -             | Volume down            |\n" +
            "| Escape        | Toggle Pause           |\n" +
            "| CTRL + Escape | Turn on boss mode      |\n" +
            "| Escape        | Exit (from boss mode)  |\n";

        let position = new rect(null, null, 1024, 700);
        let m = this.window_manager.create_modal("HELP", help_text, position, false, true);
        // Subscribe to the 'ok' and 'cancel' events
        m.on('ok', (event) => {
            console.log("OK button clicked");
            event.instance.close();
        });

        m.on('cancel', (event) => {
            console.log("Cancel button clicked");
            event.instance.close();
        });
    }



    // Function to update canvas size and draw the background image

    check_collisions() {
        let window = { y1: this.level.position.y, y2: this.level.position.y + this.graphics.viewport.virtual.height }
        for (let i = 0; i < this.level.npc.length; i++) {
            const obj1 = this.level.npc[i];
            if (obj1.position.y < window.y1 || obj1.position.y > window.y2) continue;

            for (let j = i + 1; j < this.level.npc.length; j++) {
                const obj2 = this.level.npc[j];
                if (obj1 == obj2) continue; //wtf and why.. fix this bullshittery

                if (obj2.position.y < window.y1 || obj2.position.y > window.y2) continue;


                if (obj1.check_collision(obj2)) {
                    let center = obj1.get_combine_center(obj2);

                    obj1.orient({ x: 0, y: window.y1 });
                    obj1.render(); //( 'rgba(255, 0, 0, 0.5)');
                    obj1.de_orient();

                    obj2.orient({ x: 0, y: window.y1 });
                    obj2.render(); // 'rgba(255, 0, 0, 0.5)');
                    obj2.de_orient();
                    obj1.explosion();
                    obj2.explosion();
                    //obj2.impact(obj1);
                    //console.log("Impact");
                }
            }
        }


        let obj1 = this.level.spaceship;
        for (let j = 0; j < this.level.npc.length; j++) {
            const obj2 = this.level.npc[j];
            if (obj2.position.y < window.y1 || obj2.position.y > window.y2) continue;


            if (obj1.check_collision(obj2)) {
                let center = obj1.get_combine_center(obj2);

                obj1.orient({ x: 0, y: window.y1 });
                obj1.render(); //( 'rgba(255, 0, 0, 0.5)');
                obj1.de_orient();

                obj2.orient({ x: 0, y: window.y1 });
                obj2.render(); // 'rgba(255, 0, 0, 0.5)');
                obj2.de_orient();



                obj1.explosion();
                obj2.explosion();
                obj1.impact(obj2);
                //obj2.impact(obj1);
                //console.log("Impact");
            }

        }
    }


    updateFrame() {
        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // Clear any previous drawings
        this.graphics.updateCanvasSizeAndDrawImage(this.level.position);
        this.level.position.y -= this.level.speed;

        //TODO next level stuffs
        if (this.level.position.y == 0) {
            this.level_start = false;
        }

        this.graphics.viewport.world.y = this.level.position.y;
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];

            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
                if (npc.type == "ship") {
                    //console.log("Found it");
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
        let percentage2 = this.level.spaceship.laser_fire_control.timeout_percentage();
        this.laser_timeout.render(percentage2);

        let percentage3 = this.level.spaceship.missile_fire_control.get_cooldown_percentage();
        this.missile_bar.render(percentage3);
        let percentage4 = this.level.spaceship.missile_fire_control.timeout_percentage();
        this.missile_timeout.render(percentage4);

        let percentage5 = this.level.spaceship.get_life_percentage();
        this.health_bar.render(percentage5);


        let percentage6 = this.level.spaceship.boost_fire_control.get_cooldown_percentage();
        this.booster_bar.render(percentage6);
        let percentage7 = this.level.spaceship.boost_fire_control.timeout_percentage();
        this.booster_timeout.render(percentage7);


        this.check_collisions();
        this.level.spaceship.update_frame(deltaTime);
        this.level.spaceship.render({ x: 0, y: window.y1 });
    }



    startRendering() {
        setInterval(() => {

            this.graphics.recalc_canvas();
            if (this.window_manager.has_windows() > 0) {
                this.window_manager.resize();
                this.window_manager.render();
            } else {
                this.events.handle_keys();
                if (this.level_start == true && this.pause_game == false) {
                    this.updateFrame();
                }
            }


        }, 1000 / 24); // FPS

        //setInterval(() => {
        //    this.updatePlayerStatus();
        //}, 1000 / 10); // FPS        
    }


    start_level() {
        this.level_start = true;
        if (this.track1Sound != null && this.play_sounds) {
            this.track1Sound.play();
        }
    }
}
