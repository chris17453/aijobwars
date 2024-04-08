class level extends events{
    constructor(window_manager){
        super();
        //this.level_url='https://aijobwars.com/static/levels/level.json';
        this.position = { x: 0, y: 0, width: 0, height: 0 }
        this.window_manager=window_manager;
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
                this.background=(bg);
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
                            case '.': block = new Derbis(this.window_manager,x, y, "block"); break;
                            case 't': block = new Ship(this.window_manager,x, y, "teams"); break;
                            case 'p': block = new Derbis(this.window_manager,x, y, "pdf"); break;
                            case 'e': block = new Derbis(this.window_manager,x, y, "email"); break;
                            case 'c': block = new Derbis(this.window_manager,x, y, "call"); break;
                            case 'w': block = new Derbis(this.window_manager,x, y, "webex"); break;
                            case 'P': this.spaceship = new Ship(this.window_manager,x,y, "user"); break;
                        }
                        this.npc.push(block);


                    }

                }
                this.position.y = this.rows * 64 - window.innerHeight;
                this.position.x = 0;
                this.position.height = this.rows * 64;
                this.position.width = this.columns * 64;
                
                this.spaceship.set_max_life(5000);
                this.emit("loaded");
                // You can access other properties similarly
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        }
}