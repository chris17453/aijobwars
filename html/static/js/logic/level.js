class level extends events{
    constructor(window_manager){
        super();
        //this.level_url='https://aijobwars.com/static/levels/level.json';
        this.position = { x: 0, y: 0, width: 0, height: 0 }
        this.window_manager=window_manager;
        this.audio_manager=window_manager.audio_manager;
        this.npc = [];
        this.explosions = [];
        this.projectiles =[];
        this.data=null;
        this.spaceship =null;
        this.track_key=null; // Key for background music in audio_manager
        this.speed=null;
        this.rows=0;
        this.columns=0;
        this.master_volume=0.4;
    }

    volume(level){
        this.master_volume+=level/10;
        if(this.master_volume<0) {
            this.master_volume=0;
        }
        if(this.master_volume>1){
            this.master_volume=1;
        }
        this.audio_manager.set_master_volume(this.master_volume);
    }

    stop(){
        // Stop all music and sounds associated with this level
        if(this.track_key && this.audio_manager) {
            console.log('[Level] Stopping track:', this.track_key);
            this.audio_manager.stop(this.track_key);
        }
    }


    apply_difficulty(obj) {
        if (!this.difficulty_modifiers) return;
        if (obj && typeof obj.set_max_life === "function" && obj.life) {
            obj.set_max_life(obj.life * (this.difficulty_modifiers.hp || 1));
        }
        if (obj && this.difficulty_modifiers.speed && typeof obj.accelerate === "function") {
            obj.accelerate(this.difficulty_modifiers.speed);
        }
    }

    apply_loadout(ship) {
        if (!ship || !this.loadout_config) return;
        if (typeof ship.apply_loadout === "function") {
            ship.apply_loadout(this.loadout_config);
        }
    }

    build_from_grid(grid) {
        this.rows = grid.length;
        this.columns = grid[0]?.length || 0;
        for (let line = 0; line < this.rows; line++) {
            var row = grid[line];
            for (let col = 0; col < this.columns; col++) {
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
                    case 'l': block = new Derbis(this.window_manager,x, y, "linkedin"); break;
                    case 'z': block = new Derbis(this.window_manager,x, y, "zoom"); break;
                    case 'f': block = new Derbis(this.window_manager,x, y, "facebook"); break;
                    case 'r': block = new Derbis(this.window_manager,x, y, "reddit"); break;
                    case 'g': block = new Enemy(this.window_manager,x, y, "chatgpt"); break;
                    case 'R': block = new Enemy(this.window_manager,x, y, "resume"); break;
                    case 'L': block = new Enemy(this.window_manager,x, y, "linkedin"); break;
                    case 'a': block = new Enemy(this.window_manager,x, y, "application"); break;
                    case 'i': block = new Boss(this.window_manager,x, y, "interview"); break;
                    case 'h': block = new Powerup(this.window_manager,x, y, "health"); break;
                    case 's': block = new Powerup(this.window_manager,x, y, "shield"); break;
                    case 'W': block = new Powerup(this.window_manager,x, y, "weapon"); break;
                    case 'M': block = new Mine(this.window_manager,x, y, "linkedin"); break;
                    case 'P': this.spaceship = new Ship(this.window_manager,x,y, "user"); block=this.spaceship; break;
                }
                this.apply_difficulty(block);
                this.npc.push(block);
            }
        }

        // Use virtual viewport dimensions for level positioning
        const virtual_height = this.window_manager.graphics.viewport.virtual.height;
        this.position.y = this.rows * 64 - virtual_height;
        this.position.x = 0;
        this.position.height = this.rows * 64;
        this.position.width = this.columns * 64;
    }

    async load(level, options={}) {
        this.difficulty_modifiers = options.difficulty_modifiers;
        this.loadout_config = options.loadout_config;
        try {
            const response = await fetch(level);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const level_data = await response.json();

            this.data = level_data;
            let bg = this.data['background'] || this.data?.visuals?.background;
            let music_key = this.data['music'] || this.data?.audio?.music;
            this.background=(bg);

            // Resolve music path from ASSETS.json if it's a semantic key
            let music_path = music_key;
            if (this.window_manager.graphics.asset_loader) {
                music_path = this.window_manager.graphics.asset_loader.get(music_key);
            }

            // Load background music with Web Audio API
            this.track_key = 'level_music';
            if (music_path) {
                await this.audio_manager.add(this.track_key, music_path);
            }

            this.speed = Number(this.data.speed || this.data?.pacing?.speed || 4);
            const grid = this.data.level || this.data.grid || [];
            this.build_from_grid(grid);

            if (this.spaceship) {
                this.spaceship.set_max_life(5000);
                this.apply_loadout(this.spaceship);
            }
            this.emit("loaded", { schema: this.data });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
}
