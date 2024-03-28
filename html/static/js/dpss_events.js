class events {
    constructor(game_object) {
        this.G = game_object;
        this.kb = new key_states();

        if (this.G.game_client != null) {
            window.addEventListener('beforeunload', () => {
                this.G.game_client.disconnect(); // Implement this method in your this.G.game_client class\
            });

            // Subscribe to text message events
            this.G.game_client.on('textMessageReceived', (message) => {

                if (message.client_id != this.G.player.client_id) {
                    this.G.messageRecieveSound.play();
                }
                this.G.updateChatWindow();
                console.log('UI: New text message received:', message);
            });

            // Subscribe to player update events
            this.G.game_client.on('playerUpdateReceived', (playerProfile) => {
                this.G.updatePlayerInfo();
                console.log('UI: Player profile update received:', playerProfile);
            });
        }

        window.addEventListener('keydown', (event) => {
            this.kb.down(event.key);
            this.kb.event(event)
            switch (event.key) {
                case 'F5': break;
                default: event.preventDefault();
            }

        });

        window.addEventListener('keyup', (event) => {
            this.kb.up(event.key);
            this.kb.event(event)
            switch (event.key) {
                case 'F5': break;
                default: event.preventDefault();
            }
        });

    }


    handle_keys() {
        if (this.G.level_start == true && this.G.pause_game == false) {
            // In your game loop, check keysPressed object to determine actions
            if (this.kb.is_pressed('ArrowLeft')) this.G.level.spaceship.bank_left();
            if (this.kb.is_pressed('ArrowRight')) this.G.level.spaceship.bank_right();
            if (this.kb.is_pressed('ArrowUp')) this.G.level.spaceship.accelerate();
            if (this.kb.is_pressed('ArrowDown')) this.G.level.spaceship.decelerate();
            if (this.kb.is_pressed(' ')) this.G.level.spaceship.fire_lazer();
            if (this.kb.just_stopped(' ')) this.G.level.spaceship.stop_firing_lazer();
            if (this.kb.just_stopped('Enter')) this.G.level.spaceship.fire_missle();
            if (this.kb.is_pressed('a') || this.kb.is_pressed('A')) this.G.level.spaceship.strafe_left();
            if (this.kb.is_pressed('d') || this.kb.is_pressed('D')) this.G.level.spaceship.strafe_right();
            if (this.kb.is_pressed('w') || this.kb.is_pressed('W')) this.G.level.spaceship.accelerate();
            if (this.kb.is_pressed('s') || this.kb.is_pressed('S')) this.G.level.spaceship.decelerate();
            //if (this.kb.is_pressed('Escape')) this.G.level.spaceship.pause();

            if (this.kb.is_pressed('Shift')) this.G.level.spaceship.boost();
            
            if (this.kb.just_stopped('Shift')) this.G.level.spaceship.stop_boost();
            if (this.kb.just_stopped('+')) this.G.level.volume(+1);
            if (this.kb.just_stopped('-')) this.G.level.volume(-1);
            
            if (this.kb.just_stopped('ArrowLeft')) this.G.level.spaceship.stop_playing();
            if (this.kb.just_stopped('ArrowRight')) this.G.level.spaceship.stop_playing();
            if (this.kb.just_stopped('ArrowUp')) this.G.level.spaceship.stop_playing();
            if (this.kb.just_stopped('ArrowDown')) this.G.level.spaceship.stop_playing();

            if (this.kb.just_stopped('m') || this.kb.just_stopped('M')) this.G.ui.toggle_sound();

        }


        if (this.kb.just_stopped('Escape')) {

            if (this.G.boss_mode_activated) this.G.ui.boss_mode_off();
            else if (this.kb.ctrl()) this.G.ui.boss_mode_on();

            else if (this.G.pause_game == true) this.G.ui.unpause();
            else this.G.ui.pause();
            
        }


    }

}