class ui{
    constructor(ctx,game_object){
        this.ctx=ctx;
        this.G=game_object;
    }
    pause_game_mode(){
        this.G.pause_game=true;
    }
    unpause_game_mode(){
        this.G.pause_game=false;
    }

    boss_mode_on(){
        this.G.game.style.display = 'none';
        this.G.boss_mode.style.display = 'block';
        this.G.boss_mode_activated=true;
        this.pause_game_mode();
    }
    boss_mode_off(){
        this.G.game.style.display = 'block';
        this.G.boss_mode.style.display = 'none';
        this.G.boss_mode_activated=false;
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
        if(this.G.audio_manager.playing()){
            this.G.level.track.pause();
            this.G.audio_manager.sound_off();

        } else {
            this.G.level.track.play();
            this.G.audio_manager.sound_on();
        }
    }


    // Not used right this second.. was part of the network websocket package
    updateChatWindow() {
        if(this.G.gameClient==null) return; //or some other default action
        const messages = this.G.gameClient.getChatMessages();
        this.G.chatWindow.innerHTML = messages.map(msg => {
            const colorStyle = `color: rgb(${msg.color.join(',')});`;
            return `<div><span style="${colorStyle}"><strong>${msg.player_name}</strong>:</span><span style="color:white"> ${msg.text}</span></div>`;
        }).join('');
        this.G.chatWindow.scrollTop = this.G.chatWindow.scrollHeight;
    }

    updatePlayerInfo() {
        if(this.G.gameClient==null) return; //or some other default action
        const profile = this.G.gameClient.getPlayerProfile();
        this.G.player = profile;
        if (profile) {
            this.G.playerNameElement.textContent = profile.name;
            this.G.playerAvatarElement.style.backgroundImage = "url(" + profile.avatar + ")";

        }
    }

    updatePlayerStatus() {
        // Get the player's spaceship object
        const spaceship = this.G.spaceship;

        // Update HTML elements with acceleration, velocity, and position
        document.getElementById('accelerationX').textContent = spaceship.acceleration.x.toFixed(2);
        document.getElementById('accelerationY').textContent = spaceship.acceleration.y.toFixed(2);
        document.getElementById('velocityX').textContent = spaceship.velocity.x.toFixed(2);
        document.getElementById('velocityY').textContent = spaceship.velocity.y.toFixed(2);
        document.getElementById('positionX').textContent = spaceship.position.x.toFixed(2);
        document.getElementById('positionY').textContent = spaceship.position.y.toFixed(2);
    }

   

}