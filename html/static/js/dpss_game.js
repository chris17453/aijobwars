class GamePage {
    constructor(elementIds, initialWidth, initialHeight) {

        //const gameClient = new GameClient('ws://localhost:6789', initialWidth, initialHeight);
        //gameClient.connect();

        //this.gameClient = gameClient;
        this.gameClient = null;
        this.login = document.getElementById(elementIds.loginId);
        this.game      = document.getElementById(elementIds.game_id);
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
        this.track1Sound =null;
        
        this.messageSendURL = 'static/audio/sfx_sounds_button11.wav'
        this.messageSendSound = new Audio(this.messageSendURL);
        this.messageRecieveURL = 'static/audio/sfx_sounds_button3.wav'
        this.messageRecieveSound = new Audio(this.messageRecieveURL);
        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time

        this.FADE_OUT_DURATION = 5;
        this.setupEventListeners();
        this.startRendering();


        this.spaceship = new Ship(initialWidth / 2, initialHeight - 100, "user");

        this.kb = new key_states();
        this.outro = "Congratulations, you've emerged victorious from the AI Job Wars! Your resilience and strategic prowess have paid off, leading you to triumph over the relentless AI competition. With your job secured, you stand as a testament to human ingenuity and determination in the face of technological advancement. But the journey doesn't end here - continue honing your skills and facing new challenges as you navigate the ever-evolving landscape of the job market. Keep pushing forward, and may success always be within your grasp!";
        this.get_level();
        this.boss_mode_activated=false;
        this.pause_game=false;
        this.play_sounds=false;
        this.spaceship.sound_off();
        this.level_position={x:0,y:0,width:0,height:0}
        this.level_npc=[];
        this.explosions=[];
    }

    setupEventListeners() {

        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('beforeunload', () => {
            gameClient.disconnect(); // Implement this method in your GameClient class
        });

        // Also, resize the canvas initially to fit its parent container
        this.resizeCanvas();


        if (this.gameClient != null) {
            // Subscribe to text message events
            this.gameClient.on('textMessageReceived', (message) => {

                if (message.client_id != this.player.client_id) {
                    this.messageRecieveSound.play();
                }
                this.updateChatWindow();
                console.log('UI: New text message received:', message);
            });

            // Subscribe to player update events
            this.gameClient.on('playerUpdateReceived', (playerProfile) => {
                this.updatePlayerInfo();
                console.log('UI: Player profile update received:', playerProfile);
            });
        }

        window.addEventListener('keydown', (event) => {
            this.kb.down(event.key);
            this.kb.event(event)
            switch(event.key){
                case 'F5': break;
                default:event.preventDefault();
            }
            
        });

        window.addEventListener('keyup', (event) => {
            this.kb.up(event.key);
            this.kb.event(event)
            switch(event.key){
                case 'F5': break;
                default:event.preventDefault();
            }
        });


    }



    updateChatWindow() {
        const messages = this.gameClient.getChatMessages();
        this.chatWindow.innerHTML = messages.map(msg => {
            const colorStyle = `color: rgb(${msg.color.join(',')});`;
            return `<div><span style="${colorStyle}"><strong>${msg.player_name}</strong>:</span><span style="color:white"> ${msg.text}</span></div>`;
        }).join('');
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    updatePlayerInfo() {
        const profile = this.gameClient.getPlayerProfile();
        this.player = profile;
        if (profile) {
            this.playerNameElement.textContent = profile.name;
            this.playerAvatarElement.style.backgroundImage = "url(" + profile.avatar + ")";

        }
    }

    updatePlayerStatus() {
        // Get the player's spaceship object
        const spaceship = this.spaceship;

        // Update HTML elements with acceleration, velocity, and position
        document.getElementById('accelerationX').textContent = spaceship.acceleration.x.toFixed(2);
        document.getElementById('accelerationY').textContent = spaceship.acceleration.y.toFixed(2);
        document.getElementById('velocityX').textContent = spaceship.velocity.x.toFixed(2);
        document.getElementById('velocityY').textContent = spaceship.velocity.y.toFixed(2);
        document.getElementById('positionX').textContent = spaceship.position.x.toFixed(2);
        document.getElementById('positionY').textContent = spaceship.position.y.toFixed(2);
    }

    // Function to update canvas size and draw the background image
    updateCanvasSizeAndDrawImage3() {
        if (this.sceneImg==null){
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        // Get the current window size
        const windowWidth = this.canvas.parentElement.clientWidth;
        const windowHeight = this.canvas.parentElement.clientHeight;

        if (this.canvas.windowHeight!=undefined && windowHeight!=this.canvas.windowHeight){
            var offset_y=this.canvas.windowHeight-windowHeight;
            this.level_position.y+=offset_y;

        }

        this.canvas.windowWidth = windowWidth
        this.canvas.windowHeight = windowHeight
        this.canvas.width = windowWidth
        this.canvas.height = windowHeight - 10

        // Calculate the aspect ratio of the image
        const imageAspectRatio = this.sceneImg.width / this.sceneImg.height;

        // Calculate the aspect ratio of the canvas
        const canvasAspectRatio = windowWidth / windowHeight;

        let drawX = 0;
        let drawY = 0;
        let drawWidth = windowWidth;
        let drawHeight = windowHeight;

        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawHeight = windowHeight;
            drawWidth = drawHeight * imageAspectRatio;
            drawX = (windowWidth - drawWidth) / 2;
        } else {
            // Image is taller than canvas
            drawWidth = windowWidth;
            drawHeight = drawWidth / imageAspectRatio;
            drawY = (windowHeight - drawHeight) / 2;
        }

        // Draw the background image to cover the entire canvas without distortion
        this.ctx.drawImage(this.sceneImg, drawX, drawY, drawWidth, drawHeight);
    }

    updateCanvasSizeAndDrawImage() {
        if (this.sceneImg == null) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
    
        // Get the current window size
        const windowWidth = this.canvas.parentElement.clientWidth;
        const windowHeight = this.canvas.parentElement.clientHeight;
    
        this.canvas.width = windowWidth;
        this.canvas.height = windowHeight - 10; // Adjust canvas height as needed
    
        // Calculate the aspect ratio of the image and the canvas
        const imageAspectRatio = this.sceneImg.width / this.sceneImg.height;
        const canvasAspectRatio = windowWidth / (windowHeight - 10);
    
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawHeight = windowHeight - 10;
            drawWidth = drawHeight * imageAspectRatio;
            drawX = (windowWidth - drawWidth) / 2;
            drawY = 0;
        } else {
            // Image is taller or equal to canvas
            drawWidth = windowWidth;
            drawHeight = drawWidth / imageAspectRatio;
            drawX = 0;
            drawY = (windowHeight - 10 - drawHeight) / 2;
        }
    
        // Calculate scrolling based on level position
        const levelProgress = (this.level_position.y+windowHeight) / this.level_position.height;
        const totalScrollableHeight = this.sceneImg.height - windowHeight;
        let currentYPosition = this.sceneImg.height- windowHeight- (levelProgress * totalScrollableHeight);
    
        
        // Adjust drawY for scrolling, making sure the image scrolls within its bounds
        drawY= currentYPosition; // Adjust based on scroll direction and ensure it doesn't exceed the image boundaries
    
        // Draw the background image with scrolling effect
        this.ctx.drawImage(this.sceneImg, drawX, drawY, drawWidth, drawHeight);
    }
    

    check_collisions(ctx) {
        let window={y1:this.level_position.y,y2:this.level_position.y+this.canvas.height}
        for (let i = 0; i < this.level_npc.length; i++) {
            const obj1 = this.level_npc[i];
            if(obj1.position.y<window.y1 || obj1.position.y>window.y2) continue;

            for (let j = i + 1; j < this.level_npc.length; j++) {
                const obj2 = this.level_npc[j];
                if (obj1==obj2) continue; //wtf and why.. fix this bullshittery

                if(obj2.position.y<window.y1 || obj2.position.y>window.y2) continue;

        
                if (obj1.check_collision(obj2)) {
                    let center=obj1.get_combine_center(obj2);
                    
                    obj1.orient(ctx,{x:0,y:window.y1});
                    obj1.renderWithOverlay(ctx, 'rgba(255, 0, 0, 0.5)');
                    obj1.de_orient(ctx);
    
                    obj2.orient(ctx,{x:0,y:window.y1});
                    obj2.renderWithOverlay(ctx, 'rgba(255, 0, 0, 0.5)');
                    obj2.de_orient(ctx);
                    
                    let exp=new Explosion(center.x,center.y);
                    
                    exp.orient(ctx,{x:0,y:window.y1});
                    exp.renderWithOverlay(ctx, 'rgba(0, 255, 0, 0.5)');
                    exp.de_orient(ctx);
                    
                    this.explosions.push(exp);
                    obj1.impact(obj2);
                    //obj2.impact(obj1);
                    //console.log("Impact");
                }
            }
        }
    }


    //3.7,15552
    //0  ,15616 
   // 32 ,15616

    updateFrame() {
        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // Clear any previous drawings
        this.updateCanvasSizeAndDrawImage();
        this.level_position.y-=this.level.speed;
        
        //TODO next level stuffs
        if (this.level_position==0) {
            this.level_start=false;
        }

        let window={y1:this.level_position.y,y2:this.level_position.y+this.canvas.height}
        for(let b=0;b<this.level_npc.length;b++){
         
            if(this.level_npc[b].position.y>window.y1 && this.level_npc[b].position.y<window.y2){
                this.level_npc[b].update_frame(deltaTime)
                this.level_npc[b].orient(this.ctx,{x:0,y:window.y1});
                this.level_npc[b].render(this.ctx);
                this.level_npc[b].de_orient(this.ctx);
            }

        }

        for(let b=0;b<this.explosions.length;b++){
         
            if(this.explosions[b].position.y>window.y1 && this.explosions[b].position.y<window.y2){
                this.explosions[b].update_frame(deltaTime)
                this.explosions[b].orient(this.ctx,{x:0,y:window.y1});
                this.explosions[b].render(this.ctx);
                this.explosions[b].de_orient(this.ctx);
                if (this.explosions[b].loop_complete()){
                    this.explosions.splice(b, 1); // Remove the projectile from the array


                }
            }

        }


        this.check_collisions(this.ctx);
        this.spaceship.update_frame(deltaTime);
        this.spaceship.render(this.ctx);
    }

     // Adjusted method to resize the canvas
    resizeCanvas() {
        const parentContainer = this.canvas.parentElement;
        const width = parentContainer.offsetWidth - 20; // Subtract margins from total width
        const height = parentContainer.offsetHeight - 30; // Subtract margins from total height

        // Set the canvas dimensions to match the parent container's dimensions minus margins
        //this.canvas.width = width;
        //this.canvas.height = height;
        if (this.gameClient != null) {
            this.gameClient.updateScreenDimensions({ width: width, height: height });
        }

    }


    handle_keys() {
        if (this.level_start==true && this.pause_game==false){
            // In your game loop, check keysPressed object to determine actions
            if (this.kb.is_pressed('ArrowLeft')) this.spaceship.bank_left();
            if (this.kb.is_pressed('ArrowRight')) this.spaceship.bank_right();
            if (this.kb.is_pressed('ArrowUp')) this.spaceship.accelerate();
            if (this.kb.is_pressed('ArrowDown')) this.spaceship.decelerate();
            if (this.kb.is_pressed(' ')) this.spaceship.fire_lazer();
            if (this.kb.is_pressed('Enter')) this.spaceship.fire_missle();
            if (this.kb.is_pressed('a') || this.kb.is_pressed('A')) this.spaceship.strafe_left();
            if (this.kb.is_pressed('d') || this.kb.is_pressed('D')) this.spaceship.strafe_right();
            if (this.kb.is_pressed('w') || this.kb.is_pressed('W')) this.spaceship.accelerate();
            if (this.kb.is_pressed('s') || this.kb.is_pressed('S')) this.spaceship.decelerate();
            //if (this.kb.is_pressed('Escape')) this.spaceship.pause();


            if (this.kb.just_stopped('ArrowLeft')) this.spaceship.stop_playing();
            if (this.kb.just_stopped('ArrowRight')) this.spaceship.stop_playing();
            if (this.kb.just_stopped('ArrowUp')) this.spaceship.stop_playing();
            if (this.kb.just_stopped('ArrowDown')) this.spaceship.stop_playing();

            if (this.kb.just_stopped('m') || this.kb.just_stopped('M')) this.toggle_sound();

        }
        

        if (this.kb.just_stopped('Escape')){
            
            if(this.boss_mode_activated) this.boss_mode_off();
            else  if(this.kb.ctrl()) this.boss_mode_on();

            else if(this.pause_game==true)  this.unpause();
            else this.pause();
        }
        
        
    }


    startRendering() {
        setInterval(() => {

            this.handle_keys();
            if(this.level_start==true && this.pause_game==false ){
                this.updateFrame();
            }
        }, 1000 / 24); // FPS

        //setInterval(() => {
        //    this.updatePlayerStatus();
        //}, 1000 / 10); // FPS        
    }

    get_level(){
        fetch('static/levels/level.json')
        .then(response => {
          // Check if the response is successful
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          // Parse the response body as text
          return response.json();
        })
        .then(level_data => {
          // Parse YAML data
          this.level = level_data;
          let bg=this.level['background'];
          let music=this.level['music'];
          this.sceneImg=new Image();
          this.sceneImg.src=bg;
          this.track1Sound=new Audio(music);
          this.level.speed=Number(this.level.speed);
          this.level.rows=Number(this.level.rows);
          this.level.columns=Number(this.level.columns);
          
          // Access level data
          

          for(let line=0;line<this.level.rows;line++){
            var row=this.level.level[line];
            for(let col=0;col<this.level.columns+2;col++) {
                var c=row[col];
                if(c== ' ') continue;
                var block;
                var x=col*64;
                var y=line*64;
                switch(c){
                    case '.': block=new Derbis(x,y,"block"); break;
                    case 'p': block=new Derbis(x,y,"pdf"); break;
                    case 'e': block=new Derbis(x,y,"email"); break;
                    case 'c': block=new Derbis(x,y,"call"); break;
                    case 'w': block=new Derbis(x,y,"webex"); break;
                }
                this.level_npc.push(block);


            }
            
          }
          this.level_position.y=this.level.rows*64-this.canvas.height;
          this.level_position.x=0;

          this.level_position.height=this.level.rows*64;
          this.level_position.width=this.level.columns*64;
          
          this.start_level();
          // You can access other properties similarly
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
       
    }
    pause_game_mode(){
        this.pause_game=true;
    }
    unpause_game_mode(){
        this.pause_game=false;
    }

    boss_mode_on(){
        this.game.style.display = 'none';
        this.boss_mode.style.display = 'block';
        this.boss_mode_activated=true;
        this.pause_game_mode();
    }
    boss_mode_off(){
        this.game.style.display = 'block';
        this.boss_mode.style.display = 'none';
        this.boss_mode_activated=false;
        this.unpause_game_mode();
      }

    pause(){
        document.getElementById('game-overlay').style.display = 'block';
        document.getElementById('game-underlay').style.display = 'block';
        document.getElementById('game-paused').style.display = 'block'; 
        this.pause_game_mode();
    }
    unpause(){
        document.getElementById('game-overlay').style.display = 'none';
        document.getElementById('game-underlay').style.display = 'none';
        document.getElementById('game-paused').style.display = 'none';
        this.unpause_game_mode();
    }

    toggle_sound(){
        if(this.play_sounds){
            this.track1Sound.pause();
            this.spaceship.sound_off();
            this.play_sounds=false;
        } else {
            this.track1Sound.play();
            this.spaceship.sound_on();
            this.play_sounds=true;
        }

    }

    start_level(){
        this.level_start = true;
        if(this.track1Sound!=null && this.play_sounds){
            this.track1Sound.play();
        }
    }
}
