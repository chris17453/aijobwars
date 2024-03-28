class level{
    constructor(game_object){
        this.G=game_object;
        //this.level_url='https://aijobwars.com/static/levels/level.json';
        this.position = { x: 0, y: 0, width: 0, height: 0 }
        this.npc = [];
        this.explosions = [];
        this.data=null;
        this.spaceship =null;
        this.track=null;
        this.speed=null;
        this.rows=0;
        this.columns=0;
        this.master_volume=.5;
    }

    volume(level){
        this.master_volume+=level/10;
        if(this.master_volume<0) {
            this.master_volume=0;
        }
        if(this.master_volume>1){
            this.master_volume=1;
        }
        this.track.volume=this.master_volume;
        this.spaceship.set_volume(this.master_volume);
    }


    load(level) {
        fetch(level)
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
                this.data = level_data;
                let bg = this.data['background'];
                let music = this.data['music'];
                this.G.graphics.set_background(bg);
                this.track = new Audio(music);
                this.speed = Number(this.data.speed);
                this.rows = Number(this.data.rows);
                this.columns = Number(this.data.columns);

                // Access level data


                for (let line = 0; line < this.rows; line++) {
                    var row = this.data.level[line];
                    for (let col = 0; col < this.columns + 2; col++) {
                        var c = row[col];
                        if (c == ' ') continue;
                        var block;
                        var x = col * 64;
                        var y = line * 64;
                        switch (c) {
                            case '.': block = new Derbis(this.G.graphics,x, y, "block"); break;
                            case 'p': block = new Derbis(this.G.graphics,x, y, "pdf"); break;
                            case 'e': block = new Derbis(this.G.graphics,x, y, "email"); break;
                            case 'c': block = new Derbis(this.G.graphics,x, y, "call"); break;
                            case 'w': block = new Derbis(this.G.graphics,x, y, "webex"); break;
                            case 'P': this.spaceship = new Ship(this.G.graphics,x,y, "user"); break;
                        }
                        this.npc.push(block);


                    }

                }
                this.position.y = this.rows * 64 - window.innerHeight;
                this.position.x = 0;
                this.position.height = this.rows * 64;
                this.position.width = this.columns * 64;
                
                this.spaceship.sound_off();
                this.spaceship.set_max_life(5000);
                this.G.start_level();
                // You can access other properties similarly
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        }
}