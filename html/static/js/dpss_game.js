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
        this.playerNameElement = document.getElementById(elementIds.playerNameId);
        this.playerAvatarElement = document.getElementById(elementIds.playerAvatarId);
        this.chatWindow = document.getElementById(elementIds.chatWindowId);
        this.chatInput = document.getElementById(elementIds.chatInputId);
        this.chatSend = document.getElementById(elementIds.chatSendId);
        this.playerStats = document.getElementById(elementIds.playerStatsId);
        this.ballCount = document.getElementById(elementIds.ballCountId);
        this.zoomInButton = document.getElementById(elementIds.zoomInId);
        this.zoomOutButton = document.getElementById(elementIds.zoomOutId);
        this.moveLeftButton = document.getElementById(elementIds.moveLeftId);
        this.moveRightButton = document.getElementById(elementIds.moveRightId);
        this.moveUpButton = document.getElementById(elementIds.moveUpId);
        this.moveDownButton = document.getElementById(elementIds.moveDownId);

        // ASSETS1
        this.sceneImg = null;
        this.track1Sound = null;

        this.messageSendURL = 'static/audio/sfx_sounds_button11.wav'
        this.messageSendSound = new Audio(this.messageSendURL);
        this.messageRecieveURL = 'static/audio/sfx_sounds_button3.wav'
        this.messageRecieveSound = new Audio(this.messageRecieveURL);
        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.FADE_OUT_DURATION = 5;
        this.outro = "Congratulations, you've emerged victorious from the AI Job Wars! Your resilience and strategic prowess have paid off, leading you to triumph over the relentless AI competition. With your job secured, you stand as a testament to human ingenuity and determination in the face of technological advancement. But the journey doesn't end here - continue honing your skills and facing new challenges as you navigate the ever-evolving landscape of the job market. Keep pushing forward, and may success always be within your grasp!";
        this.boss_mode_activated = false;
        this.pause_game = false;
        this.play_sounds = false;

        // control plane
        this.graphics = new graphics(this.canvas, this.ctx); //drawing the main level logic
        this.events = new events(this);   //kb events and socket etc..
        this.ui = new ui(this.ctx, this);
        this.level = new level(this);
        this.level.load('https://aijobwars.com/static/levels/level.json');
        this.laser_bar = new PercentageBar(this.graphics, 10, 10, 200, 40, "Laser");
        this.laser_timeout = new PercentageBar(this.graphics, 10, 50, 200, 40, "Laser Timeout");
        this.missile_bar = new PercentageBar(this.graphics, 220, 10, 200, 40, "Missle");
        this.missile_timeout = new PercentageBar(this.graphics, 220, 50, 200, 40, "Missle Timeout");
        this.booster_bar = new PercentageBar(this.graphics, 430, 10, 200, 40, "Booster");
        this.booster_timeout = new PercentageBar(this.graphics, 430, 50, 200, 40, "Booster Timeout");
        this.health_bar = new PercentageBar(this.graphics, 640, 10, 200, 40, "Health");
        this.font = new sprite_font(this.ctx, "https://aijobwars.com/static/fonts/obitron-blue.png");
        this.startRendering();
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

                    let exp = new Explosion(this.graphics, center.x, center.y);

                    exp.orient({ x: 0, y: window.y1 });
                    exp.render(); //'rgba(0, 255, 0, 0.5)');
                    exp.de_orient();

                    this.level.explosions.push(exp);
                    obj1.impact(obj2);
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

                let exp = new Explosion(this.graphics, center.x, center.y,this.play_sounds,this.level.master_volume);
                exp.play("destroy");
                exp.orient({ x: 0, y: window.y1 });
                exp.render(); //'rgba(0, 255, 0, 0.5)');
                exp.de_orient();

                this.level.explosions.push(exp);
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

        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }
        for (let b = 0; b < this.level.npc.length; b++) {

            if (this.level.npc[b].position.y > window.y1 && this.level.npc[b].position.y < window.y2) {
                this.level.npc[b].update_frame(deltaTime)
                this.level.npc[b].orient({ x: 0, y: window.y1 });
                this.level.npc[b].render();
                this.level.npc[b].de_orient();
            }

        }

        for (let b = 0; b < this.level.explosions.length; b++) {

            if (this.level.explosions[b].position.y > window.y1 && this.level.explosions[b].position.y < window.y2) {
                this.level.explosions[b].update_frame(deltaTime)
                this.level.explosions[b].orient({ x: 0, y: window.y1 });
                this.level.explosions[b].render();
                this.level.explosions[b].de_orient();
                if (this.level.explosions[b].loop_complete()) {
                    this.level.explosions.splice(b, 1); // Remove the projectile from the array


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

            this.events.handle_keys();
            if (this.level_start == true && this.pause_game == false) {
                this.updateFrame();
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
