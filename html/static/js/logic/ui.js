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
        document.getElementById('game').style.display = 'none';
        document.getElementById('boss_mode').style.display = 'block';
        this.G.boss_mode_activated=true;
        this.pause_game_mode();

        // Pause background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.pause(this.G.level.track_key);
        }
    }
    boss_mode_off(){
        document.getElementById('game').style.display = 'block';
        document.getElementById('boss_mode').style.display = 'none';
        this.G.boss_mode_activated=false;
        this.unpause_game_mode();

        // Resume background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.resume(this.G.level.track_key);
        }
    }

    pause(){
        this.pause_game_mode();

        // Pause background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.pause(this.G.level.track_key);
        }

        // Create and show the pause modal
        let pause_modal = new pause();
        pause_modal.on('ok', () => {
            this.unpause();
        });
        this.G.window_manager.add(pause_modal);
    }

    unpause(){
        this.unpause_game_mode();

        // Resume background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.resume(this.G.level.track_key);
        }
    }

    toggle_sound(){
        const audio_manager = this.G.window_manager.audio_manager;

        if(audio_manager.playSounds) {
            // Turn sound OFF
            audio_manager.sound_off();
            // Stop background music
            if(this.G.level.track_key) {
                audio_manager.stop(this.G.level.track_key);
            }
        } else {
            // Turn sound ON
            audio_manager.sound_on();
            // Resume background music with looping enabled
            if(this.G.level.track_key) {
                audio_manager.play(this.G.level.track_key, 0, true);
            }
        }
    }

    persist_setting(key, value) {
        try {
            localStorage.setItem(`aijobwars_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('[UI] Unable to persist setting', key, e);
        }
    }

    load_setting(key, fallback) {
        try {
            const raw = localStorage.getItem(`aijobwars_${key}`);
            if (raw === null || raw === undefined) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[UI] Unable to load setting', key, e);
            return fallback;
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
