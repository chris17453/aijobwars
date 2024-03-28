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
        if(this.G.play_sounds){
            this.G.track1Sound.pause();
            this.G.spaceship.sound_off();
            this.G.play_sounds=false;
        } else {
            this.G.track1Sound.play();
            this.G.spaceship.sound_on();
            this.G.play_sounds=true;
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

class PercentageBar {
    constructor(ctx, x, y, width, height, label) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
    }

    render(percentage) {
        let x = this.x;
        let y = this.y;

        // Background with subtle gradient
        let bgGradient = this.ctx.createLinearGradient(x, y, x, y + this.height);
        bgGradient.addColorStop(0, '#222222'); // Light gray
        bgGradient.addColorStop(1, '#000000'); // Almost white
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(x, y, this.width, this.height);

        let adjusted_percentage=percentage;
        if (adjusted_percentage<0)adjusted_percentage=0;
        if (adjusted_percentage>100) adjusted_percentage=100;
        
        // Adjust bar color based on percentage
        const redIntensity = Math.floor(255 * (1 - adjusted_percentage / 100));
        const greenIntensity = Math.floor(255 * (adjusted_percentage/ 100));
        this.ctx.fillStyle = `rgb(${redIntensity},${greenIntensity},0)`;

        // Fill the entire bar, adjusting color based on percentage
        this.ctx.fillRect(x + 3, y + 3, (this.width - 6) * (adjusted_percentage/ 100), this.height - 6);

        // Draw outline
        this.ctx.strokeStyle = '#AAA'; // Dark gray
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this.width, this.height);

        // Draw percentage text
        this.ctx.fillStyle = '#DDFFFF'; // Neon blue
        this.ctx.fillStyle = `rgb(${redIntensity},${redIntensity},${redIntensity})`;
        this.ctx.font = '14px IBM Plex Sans, Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(percentage.toFixed(0) + '%', x + this.width / 2, y + this.height / 2 - 10);

        // Draw label text
        this.ctx.font = '14px IBM Plex Sans, Arial, sans-serif';
        this.ctx.fillText(this.label, x + this.width / 2, y + this.height / 2 + 10);
    }
}