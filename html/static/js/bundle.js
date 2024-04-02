class key_states {
    constructor() {
        this.states = [];
        this.shift = false;
        this.ctrl_state = false;
    }

    up(key) {
        if (!this.states[key] || !this.states[key].justStopped) { // Ensure the justStopped logic
            this.states[key] = { pressed: false, up: true, down: false, justStopped: true };
        }
    }

    down(key) {
        if (!this.states[key] || !this.states[key].justPressed) { // Ensure the justPressed logic
            this.states[key] = { pressed: true, up: false, down: true, justPressed: true };
        }
    }

    get_state(key) {
        if (key in this.states) {
            return this.states[key];
        }
        this.states[key] = { pressed: false, up: false, down: false };
        return this.states[key];
    }

    is_pressed(key) {
        return key in this.states && this.states[key].pressed;
    }

    just_pressed(key) {
        if (key in this.states && this.states[key].justPressed) {
            this.states[key].justPressed = false; // Reset the justPressed state after checking
            return true;
        }
        return false;
    }

    just_stopped(key) {
        if (key in this.states && this.states[key].justStopped) {
            this.states[key].justStopped = false; // Reset the justStopped state after checking
            return true;
        }
        return false;
    }

    shift() {
        if (this.shift) return true;
        return false;
    }

    ctrl() {
        if (this.ctrl_state) return true;
        return false;
    }

    event(event) {
        this.shift = event.shiftKey;
        this.ctrl_state = event.ctrlKey;
    }
}
class game_events {
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
            
            if (this.kb.just_stopped('ArrowLeft')) this.G.audio_manager.sound_off();
            if (this.kb.just_stopped('ArrowRight')) this.G.audio_manager.sound_off();
            if (this.kb.just_stopped('ArrowUp')) this.G.audio_manager.sound_off();
            if (this.kb.just_stopped('ArrowDown')) this.G.audio_manager.sound_off();

            if (this.kb.just_stopped('h') ||this.kb.just_stopped('H')) this.G.help();

            if (this.kb.just_stopped('m') || this.kb.just_stopped('M')) this.G.ui.toggle_sound();

        }


        if (this.kb.just_stopped('Escape')) {

            if (this.G.boss_mode_activated) this.G.ui.boss_mode_off();
            else if (this.kb.ctrl()) this.G.ui.boss_mode_on();

            else if (this.G.pause_game == true) this.G.ui.unpause();
            else this.G.ui.pause();
            
        }


    }

}class events{
    constructor(){
        this.events = {}; // Object to hold events

    }

on(event_name, callback) {
    if (!this.events[event_name]) {
      this.events[event_name] = [];
    }
    this.events[event_name].push(callback);
  }

  emit(event_name, data) {
    if (this.events[event_name]) {
      this.events[event_name].forEach(callback => callback(data));
    }
  }

}class rect {
    constructor(x, y, width, height, x_mode = "left", y_mode = "top") {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._y_mode = y_mode;
        this._x_mode = x_mode;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
                this._y = value;
      
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (value >= 0) {
            this._width = value;
            switch(this._x_mode) {
                
                case 'center': this._x-=value/2; break;
            }
        }
    }

    get height() {

        return this._height;
    }

    set height(value) {
        if (value >= 0) {
            this._height = value;
            switch(this._y_mode) {
                case 'center': this._y-=value/2; break;
            }
        }
    }

    set center_x(value) {
        this._x = value - this._width / 2;
    }

    set center_y(value) {
        this._y = value - this._height / 2;
    }

    get center_x() {
        if (this._width == null) return this.x;
        return parseInt(this._x + this._width / 2);
    }

    get center_y() {
        if (this._height == null) return this.y;
        return parseInt(this._y + this._height / 2);
    }


    get bottom() {
        if (this._height == null) return this.y;
        return this.y + this._height;
    }

    get right() {
        if (this._width == null) return this.x;
        return this.x + this._width;
    }

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        if (this._width != null) this.width = Math.round(this._width);
        if (this._height != null) this.height = Math.round(this._height);

    }
    clone() {
        return new rect(this._x, this._y, this._width, this._height, this._x_mode, this._y_mode);
    }

    add(rect2){
        this._x+=rect2.x;
        this._y+=rect2.y;
    }

}

class grid {
    constructor(outer, inner, size = 9) {
        this.outer = outer;
        this.inner = inner;
        if (size == 9) {
            this.quadrants = this.calculate_quadrants_9();
        }
        if (size == 3) {
            this.quadrants = this.calculate_quadrants_3();
        }
    }

    calculate_quadrants_3() {
        const quadrants = [];

        // Precompute the necessary variables for each quadrant

        let top_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);


        // Top-left quadrant (1)
        quadrants.push(new rect(this.outer.x, this.outer.y, this.inner.x - this.outer.x, this.outer.height));

        // Top-center quadrant (2)
        quadrants.push(new rect(this.inner.x, this.outer.y, this.inner.width, this.outer.height));

        // Top-right quadrant (3)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.outer.y, top_right_width, this.outer.height));

        return quadrants;
    }


    calculate_quadrants_9() {
        const quadrants = [];

        // Precompute the necessary variables for each quadrant
        let top_left_width = this.inner.x - this.outer.x;
        let top_left_height = this.inner.y - this.outer.y;

        let top_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);
        let top_right_height = this.inner.y - this.outer.y;

        let bottom_left_width = this.inner.x - this.outer.x;
        let bottom_left_height = (this.outer.y + this.outer.height) - (this.inner.y + this.inner.height);

        let bottom_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);
        let bottom_right_height = (this.outer.y + this.outer.height) - (this.inner.y + this.inner.height);

        // Top-left quadrant (1)
        quadrants.push(new rect(this.outer.x, this.outer.y, top_left_width, top_left_height));

        // Top-center quadrant (2)
        quadrants.push(new rect(this.inner.x, this.outer.y, this.inner.width, top_left_height));

        // Top-right quadrant (3)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.outer.y, top_right_width, top_right_height));

        // Middle-left quadrant (4)
        quadrants.push(new rect(this.outer.x, this.inner.y, top_left_width, this.inner.height));

        // Center quadrant (5)
        quadrants.push(new rect(this.inner.x, this.inner.y, this.inner.width, this.inner.height));

        // Middle-right quadrant (6)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.inner.y, top_right_width, this.inner.height));

        // Bottom-left quadrant (7)
        quadrants.push(new rect(this.outer.x, this.inner.y + this.inner.height, bottom_left_width, bottom_left_height));

        // Bottom-center quadrant (8)
        quadrants.push(new rect(this.inner.x, this.inner.y + this.inner.height, this.inner.width, bottom_left_height));

        // Bottom-right quadrant (9)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.inner.y + this.inner.height, bottom_right_width, bottom_right_height));

        return quadrants;
    }
}

// This class is used to size the window..
// fit to width if < than max
// center if >max width
// height always 100% (so far)

class viewport {

    //fit
    constructor(width, height) {
        this.frame = { x: 0, y: 0, width: 0, height: 0 };
        this.requested = { width: width, height: height };
        this.virtual = { width: 0, height: 0 };
        this.given = { x: 0, y: 0, width: 0, height: 0 };
        this.world = { x:0,y:0,width: 0, height: 0 };

        this.scale = { x: 1, y: 1 };
        this.calculate();
    }

    calculate() {
        // display area size
        this.frame = { x:0,y:0,width: window.innerWidth, height: window.innerHeight };

        // what we got
        if (this.requested.width < this.frame.width) {
            this.given.width = this.requested.width;
            this.given.height = this.requested.height;
        } else {
            this.given.width = this.frame.width;
            this.given.height = this.frame.height;
        }
        // viewport offset
        this.given.x = (this.frame.width - this.given.width) / 2;
        this.given.y = (this.frame.height - this.given.height) / 2;

        this.calculate_scale();
        this.world.height=this.virtual.height;
        this.world.width=this.virtual.height;

    }

    calculate_scale() {
        const scaleX = this.given.width / this.requested.width;
        if (scaleX > 1) {
            this.scale.x = 1;
            this.scale.y = 1;
            this.virtual.width = this.given.width;
            this.virtual.height = this.given.height;
        } else {
            const virtX = this.requested.width / this.given.width;
            this.scale.x = scaleX;
            this.scale.y = scaleX;
            this.virtual.width = parseInt(this.given.width * virtX);
            this.virtual.height = parseInt(this.given.height * virtX);
        }
    }
}
class sprites extends events{
    constructor(ctx) {
        super();
        this.base_domain="https://aijobwars.com/";
        this.ctx = ctx;
        this.sprites = {}; //sprite objects.. many to 1 per image possible.
        this.images={};  //image objects
        this.loaded = false; // Flag to track if all images are loaded
        this.load_promise = this.preload(); // Start the preload process and store the promise
    }

    preload(){
        return new Promise((resolve, reject) => {
            this.add("window", this.base_domain+"static/UI/UI1.png", 67, 67, 565, 332);
            this.add("window-title", this.base_domain+"static/UI/UI1.png", 162 - 10, 411 - 10, 372 + 10 * 2, 68 + 10 * 2);
            this.add("button-down-red", this.base_domain+"static/UI/UI1.png", 683, 77, 206, 68);
            this.add("button-up-red", this.base_domain+"static/UI/UI1.png", 683, 161, 206, 68);
            this.add("button-down-yellow", this.base_domain+"static/UI/UI1.png", 928, 77, 206, 68);
            this.add("button-up-yellow", this.base_domain+"static/UI/UI1.png", 927, 161, 206, 68);
            this.add("button-down-cyan", this.base_domain+"static/UI/UI1.png", 683, 281, 206, 68);
            this.add("button-up-cyan", this.base_domain+"static/UI/UI1.png", 683, 365, 206, 68);
            this.add("button-down-gray", this.base_domain+"static/UI/UI1.png", 928, 281, 206, 68);
            this.add("button-up-gray", this.base_domain+"static/UI/UI1.png", 927, 365, 206, 68);
            this.add("percentage-full", this.base_domain+"static/UI/UI1.png", 182 - 12, 707 - 12, 30 + 12 * 2, 45 + 12 * 2);
            this.add("percentage-empty", this.base_domain+"static/UI/UI1.png", 929 - 12, 707 - 12, 30 + 12 * 2, 45 + 12 * 2);
            this.add("menu",this.base_domain+"static/UI/menu.webp");
            this.add("blue_font",this.base_domain+"static/fonts/obitron-blue.png");

            // Resolve the main promise when all image promises are resolved
            Promise.all(Object.values(this.images)).then(() => {
                this.loaded = true;
                this.emit('complete'); // Emit 'complete' event when all images are loaded
                resolve();
            }).catch((error) => {
                console.error("Error preloading images:", error);
                reject(error);
            });
        });
    }

    add(key, imagePath = null, x = 0, y = 0, width = null, height = null) {
        // Check if the key already exists
        if (this.sprites[key]) {
            return this.sprites[key].image;
        }

        // Set imagePath to key if null
        if (imagePath == null) imagePath = key;

        // Create new Image object if it doesn't exist in the images array
        if (!(imagePath in this.images)) {
            this.images[imagePath] = new Promise((resolve, reject) => {
                const img = new Image();
                //img.crossorigin = `Anonymous`;


                
                // Add event listener for image load
                img.onload = () => {
                    resolve(img); // Resolve the promise with the loaded image
                };

                // Add event listener for image error
                img.onerror = (error) => {
                    reject(error); // Reject the promise if there's an error loading the image
                };

                // Set src for the image
                img.src = imagePath;
            });
        }

        // Create sprite object and return the image promise
        return this.images[imagePath].then((image) => {
            // Add image data to sprites object
            this.sprites[key] = {
                image: image,
                url: imagePath,
                x: x,
                y: y,
                width: width || image.width,
                height: height || image.height
            };
        });
    }

    get_bounds(key,position){
        let data=this.get_data(key,position);
        
        
        let left = position.width;
        let top = position.height;
        let right = 0;
        let bottom = 0;
        let found=false;
        let index=0;
        for (let y = 0; y < position.height; y++) {
            for (let x = 0; x < position.width; x++) {
                const alpha = data[index];
                if (alpha != 0) {
                    found=true;
                    left = Math.min(left, x);
                    top = Math.min(top, y);
                    right = Math.max(right, x);
                    bottom = Math.max(bottom, y);
                }
                index+= 4;
            }
        }
        if(found==false){
            left=0;
            right=position.width;
            top=0;
            bottom=position.height;
        }

        return new rect ( left, top, right-left, bottom-top,"left","top");
    }
    draw_colored_rectangle(position, color) {
        
        // Set the fill color
        this.ctx.fillStyle = color;
    
        // Draw the rectangle
        this.ctx.fillRect(position.x, position.y, position.width, position.height);
    }
    
    get_data(key, position) {
        let s = this.get(key);
        if (!s) {
            console.log("Missing image");
            return;
        }
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = position.width;
        canvas.height = position.height;
        ctx.drawImage(s.image, position.x, position.y, position.width, position.height, 0, 0, position.width, position.height);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data;
    }
       
    // Other methods like render, slice_9, slice_3...
    render(key, dest, intensity = 1, mode = 'fill') {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }

        // Save the current context state
        this.ctx.save();

        // Set global alpha for intensity
        this.ctx.globalAlpha = intensity;

        let dx = dest.x;
        let dy = dest.y;
        let dWidth = dest.width || s.width; // Take source width if destination width is not given
        let dHeight = dest.height || s.height; // Take source height if destination height is not given
        const imgAspectRatio = s.width / s.height;
        const destAspectRatio = dest.width / dest.height;

        switch (mode) {
            case 'contain':
                if (imgAspectRatio > destAspectRatio) {
                    // Image is wider
                    dHeight = dest.width / imgAspectRatio;
                    dy += (dest.height - dHeight) / 2;
                } else {
                    // Image is taller
                    dWidth = dest.height * imgAspectRatio;
                    dx += (dest.width - dWidth) / 2;
                }
                break;
            case 'cover':
                if (imgAspectRatio > destAspectRatio) {
                    // Image is wider
                    dWidth = dest.height * imgAspectRatio;
                    dx -= (dWidth - dest.width) / 2;
                } else {
                    // Image is taller
                    dHeight = dest.width / imgAspectRatio;
                    dy -= (dHeight - dest.height) / 2;
                }
                break;
            case 'none':
                if (!dest.width || !dest.height) {
                    dWidth = s.width;
                    dHeight = s.height;
                } else {
                    dx = dest.x + (dest.width - dWidth) / 2;
                    dy = dest.y + (dest.height - dHeight) / 2;
                }
                break;
            case 'scale-down':
                // Use 'none' mode if it results in a smaller image than 'contain'
                const scaleDownWidth = imgAspectRatio > destAspectRatio ? dest.width : dest.height * imgAspectRatio;
                const scaleDownHeight = imgAspectRatio > destAspectRatio ? dest.width / imgAspectRatio : dest.height;
                if (scaleDownWidth > s.width || scaleDownHeight > s.height) {
                    // Image is naturally smaller than dest
                    dWidth = s.width;
                    dHeight = s.height;
                } else {
                    // Image is larger than dest, scale down like 'contain'
                    if (imgAspectRatio > destAspectRatio) {
                        dHeight = dest.width / imgAspectRatio;
                        dy += (dest.height - dHeight) / 2;
                    } else {
                        dWidth = dest.height * imgAspectRatio;
                        dx += (dest.width - dWidth) / 2;
                    }
                }
                break;
            case 'fill':
            default:
                // Defaults to 'fill' behavior where the image is stretched to fill the dest
                break;
        }

        // Draw the image according to calculated size and position
        this.ctx.drawImage(s.image, s.x, s.y, s.width, s.height, dx, dy, dWidth, dHeight);

        // Restore the context state
        this.ctx.restore();
    }

    get(key) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
        return s;
    }

    slice_9(key, dest,x_margin=90,y_margin=90) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }

        let source_outer = new rect(s.x, s.y, s.width, s.height);
        let source_inner = new rect(s.x + x_margin, s.y + y_margin, s.width - x_margin * 2, s.height - y_margin * 2);

        let dest_outer = new rect(dest.x, dest.y, dest.width, dest.height);
        let dest_inner = new rect(dest.x + x_margin - 2, dest.y + y_margin, dest.width - (x_margin) * 2 + 2, dest.height - y_margin * 2);

        // Assuming grid class and rect class are properly defined and instantiated
        let source_grid = new grid(source_outer, source_inner, 9);
        let dest_grid = new grid(dest_outer, dest_inner, 9);

        // Draw each quadrant
        for (let index = 0; index < 9; index++) {
            let dx = dest_grid.quadrants[index].x;
            let dy = dest_grid.quadrants[index].y;
            let dWidth = dest_grid.quadrants[index].width;
            let dHeight = dest_grid.quadrants[index].height;

            // Calculate source dimensions
            let sx = source_grid.quadrants[index].x;
            let sy = source_grid.quadrants[index].y;
            let sWidth = source_grid.quadrants[index].width;
            let sHeight = source_grid.quadrants[index].height;

            // Create pattern for tiling if not a corner quadrant
            if ([0, 2, 6, 8].includes(index)) { // Corners
                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
            }
            if ([1, 3, 4, 5, 7].includes(index)) { // Other quadrants are tileds

                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

            }
        }
    }

    slice_3(key, dest) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }

        let x_margin = 90;

        let source_outer = new rect(s.x, s.y, s.width, s.height);
        let source_inner = new rect(s.x + x_margin, s.y, s.width - x_margin * 2, s.height);

        let dest_outer = new rect(dest.x, dest.y, dest.width, dest.height);
        let dest_inner = new rect(dest.x + x_margin, dest.y, dest.width - (x_margin) * 2, dest.height);

        source_outer.round();
        source_inner.round();
        dest_outer.round();
        dest_inner.round();


        // Assuming grid class and rect class are properly defined and instantiated
        let source_grid = new grid(source_outer, source_inner, 3);
        let dest_grid = new grid(dest_outer, dest_inner, 3);

        // Round coordinates and dimensions

        // Draw each quadrant
        for (let index = 0; index < 3; index++) {
            let dx = dest_grid.quadrants[index].x;
            let dy = dest_grid.quadrants[index].y;
            let dWidth = dest_grid.quadrants[index].width;
            let dHeight = dest_grid.quadrants[index].height;

            // Calculate source dimensions
            let sx = source_grid.quadrants[index].x;
            let sy = source_grid.quadrants[index].y;
            let sWidth = source_grid.quadrants[index].width;
            let sHeight = source_grid.quadrants[index].height;

            // Create pattern for tiling if not a corner quadrant
            if ([0, 2].includes(index)) { // Corners
                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            }
            if ([1].includes(index)) { // Other quadrants are tileds

                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

            }
        }
    }



}class modal {
    constructor(parent,graphics, position, title, text, cancel = false, ok = true) {
        this.parent=parent;
        this.graphics = graphics;
        this.canvas = graphics.canvas;
        this.sprites = graphics.sprites;
        this.events = {}; // Object to hold modal events
        this.ok=ok;
        this.cancel=cancel;
        this.title = title;
        this.text = text;
        this.position = position;
        
        
        this.buttons = [];

        this.resize();
        this.add_buttons()
    }

    add_buttons(){

        // Adjust button positions relative to the internal rectangle
        let mode="center";

        if (this.ok) {
            var button_position=new rect(this.position.left+100,this.position.bottom-60);
            let ok_instance = this.add_button("Ok", button_position, mode,"button-up-cyan", "button-down-cyan");
            ok_instance.on('click', () => { this.emit('ok', { instance: this }); });
        }
        if (this.cancel) {
            var button_position=new rect(this.position.right-100,this.position.bottom-60);
            let cancel_instance = this.add_button("Cancel", button_position,mode,"button-up-red", "button-down-red");
            cancel_instance.on('click', () => { this.emit('cancel', { instance: this }); });
        }

        // Add event listener for keydown event
        document.addEventListener('keydown', this.handle_key_down.bind(this));
    }
    resize(){
        //let modal_sprite = this.sprites.get(["window"]);
        //let title_sprite = this.sprites.get(["window-title"]);

        // Set default modal size and position if not specified
        //this.position.width = this.position.width || modal_sprite.width;
        //this.position.height = this.position.height || modal_sprite.height;
        
        // Calculate title position within the modal
        this.title_position = new rect(
            (160)/2,
            -20,
            this.position.width - 160,
            80,
            "left","top"
        );


        // Calculate internal rectangle position with padding
        this.internal_rect = new rect(
            20,
            70,
            this.position.width - 20*2,
            this.position.height- 70-30,
            "left","top"
        );



        this.render_position=this.position.clone();
        this.render_title_position=this.title_position.clone();
        this.render_internal_rect=this.internal_rect.clone();
        //lets recalculate the positions..
        this.render_position.add(this.graphics.viewport.given);
        this.render_title_position.add(this.render_position);
        this.render_internal_rect.add(this.render_position);
        for(let i=0;i<this.buttons.length;i++) {
            this.buttons[i].resize(this.render_internal_rect);
        }

    }
    

    add_button(label, position,callback, up_image, down_image) {
        // Create and setup the new button
        let anchor_position=new rect(0,0,0,0);
        anchor_position.add(this.graphics.viewport.given);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);
        
        let newButton = new button(this,this.graphics, label, position,anchor_position,callback,up_image, down_image);
        newButton.on('click', () => { this.emit('click', { instance: this }); });
        this.buttons.push(newButton);
    }

    handle_key_down(event) {
        // Handle keydown event
        this.emit('keydown', { instance: this, event: event });
    }

    on(event_name, callback) {
        if (!this.events[event_name]) {
            this.events[event_name] = [];
        }
        this.events[event_name].push(callback);
    }

    emit(event_name, data) {
        if (this.events[event_name]) {
            this.events[event_name].forEach(callback => callback(data));
        }
    }

    render() {
        
        this.sprites.slice_9("window",this.render_position);
        this.sprites.slice_3("window-title",this.render_title_position);
        let internal=this.internal_rect.clone();

        //this.sprites.draw_colored_rectangle(this.position,"red");
        //this.sprites.draw_colored_rectangle(internal,"blue");
        // Render buttons
        this.buttons.forEach(button => button.render());

        // Render title and text
        this.graphics.font.draw_text(this.render_title_position,this.title, true,false);
        if (this.text) {
          this.graphics.font.draw_text(internal,this.text, true, true);
        }
    }

    close() {
        // Close the modal and clean up if necessary
        this.emit('close', { instance: this });
        document.removeEventListener('keydown', this.handle_key_down.bind(this));
    }
}

class button {
  constructor(parent,graphics, label,position,anchor_position, callback, up_image, down_image) {
    this.parent=parent;
    this.graphics = graphics;
    this.ctx = graphics.ctx;
    this.sprites = graphics.sprites;
    this.up_image = up_image;
    this.down_image = down_image;
    this.label = label;
    this.is_down = false;
    this.is_hover = false;
    this.monospaced=false;
    this.centered = false;
    
    
    let x_pad=20;
    let y_pad=20;
    let bounds=this.graphics.font.get_bounds(label,this.monospaced);
    if (position.width==null) position.width=bounds.width+x_pad*2;
    if (position.height==null) position.height=bounds.height+y_pad*2;
    this.inner=new rect((position.width-bounds.width)/2,(position.height-bounds.height)/2,bounds.width,bounds.height);
        this.position = position;  
    this.anchor_position=anchor_position;
    if(this.anchor_position==null) console.log("OMG!");


    this.events = {}; // Object to hold events

    graphics.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this));
    graphics.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this));
    graphics.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this));
    this.callback=callback;
   // this.resize();
  }

  resize(anchor_position){
    this.anchor_position=anchor_position;
  }

  on(event_name, callback) {
    if (!this.events[event_name]) {
      this.events[event_name] = [];
    }
    this.events[event_name].push(callback);
  }

  emit(event_name, data) {
    data.parent=parent;
    if (this.events[event_name]) {
      this.events[event_name].forEach(callback => callback(data));
    }
  }

  render() {
    let relative_position = this.position.clone();
    let relative_inner = this.inner.clone();
    relative_position.add(this.anchor_position)
    relative_inner.add(relative_position)
    //relative_position._x_mode="left";
    //relative_position._y_mode="top";
    let img=this.up_image;
    if (this.is_down) {
      img=this.down_image;
    } else if (this.is_hover) {
      relative_position.x+=2;
      relative_position.y+=2;
      relative_inner.x+=2;  
      relative_inner.y+=2;
    }

    this.sprites.slice_9(img,relative_position ,10,10);
    
    //this.sprites.draw_colored_rectangle(relative_position,"red");
    //this.sprites.draw_colored_rectangle(relative_inner,"blue");
    this.graphics.font.draw_text(relative_inner, this.label,this.centered, this.monospaced);

}

  handle_mouse_down(event) {
    if (this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = true;
    }
  }

  handle_mouse_up(event) {
    if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = false;
      this.callback({parent:this.parent,event:event});
      this.emit('click', event); // Emit 'click' event
    }
  }

  handle_mouse_move(event) {
    let previously_hover = this.is_hover;
    this.is_hover = this.is_inside(event.offsetX, event.offsetY);

    if (this.is_hover && !previously_hover) {
      this.emit('mouseover', event); // Emit 'mouseover' event
    } else if (!this.is_hover && previously_hover) {
      this.emit('mouseout', event); // Emit 'mouseout' event
    }
  }

  is_inside(mouse_x, mouse_y) {
    let relative_position = this.position.clone();
    relative_position.add(this.anchor_position)

    return mouse_x >= relative_position.x && mouse_x <= relative_position.x + relative_position.width &&
      mouse_y >= relative_position.y && mouse_y <= relative_position.y + relative_position.height;
  }
}
class sprite_font {
    constructor(ctx,sprites, image_key) {
        this.sprites = sprites;
        this.ctx=ctx;
        this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]|`\\/@" + "°+=*$£€<>";
        this.image =image_key;
        this.spacing_width=5;
        this.mono_char_width = 22;
        this.mono_char_height = 27;
        this.char_width = 46;
        this.char_height = 43;
        this.chars_per_row = 5;
        this.char_data = [];
        this.sprite=this.sprites.get(this.image);

        this.calculate_char_data();

    }


    calculate_char_data() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const sx = (i % this.chars_per_row) * this.char_width;
            const sy = Math.floor(i / this.chars_per_row) * this.char_height; // Fixed typo: replaced 'o' with 'i'
            let sub_rect=new rect(sx,sy,this.char_width,this.char_height);
            const char_bounds = this.sprites.get_bounds(this.image,sub_rect);



            const char_data = {
                character: char,
                left: char_bounds.left + sx,
                top: char_bounds.top + sy,
                right: char_bounds.right + sx,
                bottom: char_bounds.bottom + sy,
                width: char_bounds.right - char_bounds.left,
                height: char_bounds.bottom - char_bounds.top,
                stride: char_bounds.right - char_bounds.left + 1,
                baseline: char_bounds.top
            };
            this.char_data.push(char_data);
        }
    }



    get_character(char) {
        return this.char_data.find(char_data => char_data.character === char);
    }

    get_bounds(text,monospace=false){
        try {
            let x = 0,y=0,max_x=0;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Use get_character to retrieve character data
                if(char==" ")  {
                    x+=this.mono_char_width;
                    continue;
                }
                if(char=="\n")  {
                    y+=this.mono_char_height;
                    max_x=Math.max(max_x, x);
                    x=0;
                    continue;
                }
                const char_data = this.get_character(char);
            
                if (!char_data) continue;
                if(monospace) x+=this.mono_char_width;
                else {
                    if (i<text.length-1) x+=this.spacing_width;
                    x += char_data.width;
                }

            }
            if (y==0)y=this.mono_char_height;
            max_x=Math.max(max_x, x);
            return new rect(0,0,max_x,y,"left","top")
        } catch (error) {
            console.error("Error loading image:", error);
        }
    }
    
    
    draw_text(position, text,centered=false,monospace=false) {
        position=position.clone();
        try {
            let lines=text.split("\n");
            if (centered) {
                position.y= position.center_y-(lines.length*this.mono_char_height)/2;
            } 
            
            
            for (let line in lines){
                this.draw_single_text(position,lines[line],centered,monospace);
                position.y+=this.mono_char_height;
            }
        } catch (error) {
            console.error("Error loading image:", error);
        }
    }

    draw_single_text(position, text,centered=false,monospace=false) {
        try {
                if (!this.chars_per_row) {
                console.error("Image not loaded");
                return;
            }

            let pos_x,padding=0;
            let pos_y= position.y;
            if (centered) {
                pos_x = position.center_x;
            } else {
                pos_x = position.x;
            }
            if(centered){
                let bounds=this.get_bounds(text,monospace);
                pos_x-=bounds.center_x;
            }

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Use get_character to retrieve character data
                if(char==" ")  {
                    pos_x+=this.mono_char_width;
                    continue;
                }
                if (char=="\n") return;
                const char_data = this.get_character(char);
                if (!char_data) continue;
               // if(monospace) padding=(this.mono_char_width-char_data.stride)/2;
                this.ctx.drawImage(
                    this.sprite.image,
                    char_data.left,
                    char_data.top,
                    char_data.width,
                    char_data.height,
                    pos_x+padding,
                    pos_y + char_data.baseline,
                    char_data.width,
                    char_data.height
                );
                if(monospace) pos_x+=this.mono_char_width;
                else 
                pos_x += char_data.width+this.spacing_width;
                padding=0;
            }
        } catch (error) {
            console.error("Error loading image:", error);
        }
    }
}
class window_manager {
    constructor(graphics) {
      this.graphics = graphics;
      this.windows = [];
      this.active_modal=null;
      this.background=null;
      
    }

    set_background(key,background_url){
      //this.graphics.sprites.add(key,background_url);
        this.background=key;
    }

    has_windows(){
        if( this.windows.length>0) return true;
        return false;
    }
  
    create_modal(title,text, position,cancel = false, ok = true) {
      const modal_instance = new modal(this,this.graphics, position, title, text, cancel, ok);
  
      // Listen for the 'close' event to remove the modal
      modal_instance.on('close', () => {
        this.close_modal(modal_instance);
      });
      
      this.windows.push(modal_instance);
      this.active_modal=modal_instance
      return modal_instance;
    }
  
    close_modal(modal_instance) {
      const index = this.windows.indexOf(modal_instance);
      if (index > -1) {
        this.windows.splice(index, 1); // Remove the modal from the array
        // Additional cleanup if necessary
      }
    }
    resize(){
      for(let i=0;i<this.windows.length;i++) this.windows[i].resize();
    }

    render() {
        if (this.background){
            this.graphics.sprites.render(this.background,this.graphics.viewport.given,1,"contain");
        }
        if (this.active_modal) {
            this.active_modal.render();
        }
        //this.windows.forEach(window => window.render());
    }
  }

  class audio_manager {
    constructor() {
        this.play_sounds = false;
        this.volume=.4;
        this.audio = {};
    }

    add(key, audio_path = null) {
        //dont double add it...        
        if (this.audio[key]) {1
            return this.audio[key].sound;
        }
        if (audio_path == null) audio_path = key;

        const s = new Audio(audio_path);

        this.audio[key] = {
            sound: s,
            url: audio_path,
        };


    }

    get(key) {
        const s = this.audio[key];
        if (!s) {
            console.log("Missing sound: " + key);
            return;
        }
        return s.sound;
    }

    sound_off() {
        this.play_sounds = false;
        for (let i = 0; i < this.audio.length; i++) {
            this.audio[i].sound.pause();
        }
    }

    sound_on() {
        this.play_sounds = true;
    }
    playing(){
        return this.play_sounds;
    }
    set_volume(volume) {
        if (volume == null) {
            volume = 0;
            console.log("Volume Error");
        }
        this.volume = volume;
        for (let i = 0; i < this.audio.length; i++) {
            this.audio[i].sound.volume = volume;
        }
    }

    play(key) {
        if (this.play_sounds) {
            let s = this.get(key);
            if(s) {
                s.play();
            }
        }
    }

    pause(key) {
        if (this.play_sounds) {
            let s = this.get(key);
            if (s) {
                s.pause();
            }
        }
    }

}


class fire_control {
    constructor(    temp_cycle=10,
                    over_heat = 2000, 
                    overheating_timeout = 2000,
                    ) {


        this.over_heat = over_heat;
        this.overheating_timeout = overheating_timeout;
        this.last_fired_time = 0;
        // flag
        this.overheated = false;
        this.overheated_cooldown_start=0;
   
        //internal
        this.max_rps=10;
        this.rps_min=1;
        this.rps=10;
        this.temprature=0;
        
        this.temp_cycle=temp_cycle;
        this.max_tempreture=100;
        this.is_firing=false;
        
    }

    can_fire() {
        if(this.overheated) return;
        const current_time = Date.now();
        const elapsed_time = current_time - this.last_fired_time;
        if (elapsed_time >= 1000/this.rps) {
            this.temprature+=this.temp_cycle;
            //if(this.temprature>this.)
            this.rps=this.max_rps*(1-(this.temprature/this.max_tempreture));
            if(this.rps<this.rps_min) this.rps=this.rps_min;
            if(this.temprature>this.max_tempreture) {
                this.temprature=this.max_tempreture;
                this.overheated=true;
                this.overheated_cooldown_start=0;
            }
            this.last_fired_time = current_time;
            this.is_firing=true;
            return true;
        } else {
            return false;
        }
    }

    update_frame(){
        
        const current_time = Date.now();
        if(this.overheated){
            if(this.overheated_cooldown_start!=0){
                if(current_time-this.overheated_cooldown_start>this.overheating_timeout){
                    this.overheated=false;
                    //this.overheated_cooldown_start=null;
                    this.rps=this.max_rps;
                } else {
                    
                    this.temprature-=5;
                    if(this.temprature<0) this.temprature=0;
                }
            } 
            return false;
        }
        if(this.is_firing==false) {
            this.temprature-=1;
            this.rps=(this.max_rps*this.get_cooldown_percentage())/100;
            if(this.temprature<0) this.temprature=0;
        }
    }

    get_cooldown_percentage(){
        return 100-(this.temprature/this.max_tempreture)*100;
    }

    timeout_percentage(){
        const current_time = Date.now();
        if(this.overheated){
            if(this.overheated_cooldown_start==0) return 100;
            return 100-((current_time-this.overheated_cooldown_start)/this.overheating_timeout)*100;
        }
        return 0;
    }

    stop_firing() {
        this.stopped_firing=Date.now();
        this.is_firing=false;

        
        if (this.overheated) {
            this.overheated_cooldown_start=Date.now();
        }
    }
}
class GameClient {
    constructor(serverUrl, initialWidth = 800, initialHeight = 600) {
        this.serverUrl = serverUrl;
        this.client_id = null;
        this.websocket = null;
        this.isConnected = false;
        this.balls = []; // Store balls data
        this.player = { 
            name:'',
            avatar:'',
            score:0,
            client_id:0,


        }; // Key: client_id, Value: player data including avatar

        // Load player and token from cookies if available
        const playerCookie = this.getCookie('player');
        const tokenCookie = this.getCookie('token');
        if (playerCookie && tokenCookie) {
            this.player = JSON.parse(playerCookie);
            this.token = tokenCookie;
        }

        this.chatMessages = []; // Store received chat messages        
        this.screenDimensions = { width: initialWidth, height: initialHeight };  // Initial screen dimensions
        this.eventHandlers = {
            'textMessageReceived': [],
            'playerUpdateReceived': []
        };
    }

    connect() {
        let connectionAttempts = 0;
        const maxConnectionAttempts = 0;
        const connectionTimeout = 1000; // 10 seconds
        let connectionTimer;
    
        const connectWebSocket = () => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                console.log('WebSocket connection is already open.');
                return;
            }
    
            if (maxConnectionAttempts > 0 && connectionAttempts >= maxConnectionAttempts) {
                console.error('Maximum connection attempts reached. Unable to connect.');
                return;
            }
    
            // Close and nullify the existing WebSocket instance if it exists
            if (this.websocket) {
                this.websocket.onerror = null;
                this.websocket.onclose = null;
                this.websocket.close();
                this.websocket = null;
            }
    
            this.websocket = new WebSocket(this.serverUrl);
            
            this.websocket.onopen = () => {
                console.log('Connected to the server.');
                this.isConnected = true;
                // Request the client ID or any initial setup information
                this.sendMessage({type: 'requestClientId'});
                // Reset connection attempts on successful connection
                connectionAttempts = 0;
            };
    
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'client_id':
                        this.client_id = data.client_id;
                        console.log(`Client ID received: ${this.client_id}`);
                        break;
                    case 'update':
                        this.handlePositionalUpdate(data);
                        break;
                    case 'playerProfile':
                        this.handlePlayerProfileUpdate(data);
                        break;
                    case 'chatMessage':
                        this.handleChatMessage(data);
                        break;
                    case 'updateBalls':
                        // Handle update balls message
                        this. balls = data.balls;
                        console.log("Received updated balls:", this.balls);
                        break;
                    case 'heartbeat':
                        this.websocket.send(JSON.stringify({ type: 'heartbeat_ack' }));
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            };
    
            this.websocket.onerror = (event) => {
                console.error('WebSocket error:', event);
                // Close and nullify the WebSocket instance
                if (this.websocket) {
                    this.websocket.onerror = null;
                    this.websocket.onclose = null;
                    this.websocket.close();
                    this.websocket = null;
                }
                // Increment connection attempts
                connectionAttempts++;
                // Attempt reconnection after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };
    
            this.websocket.onclose = () => {
                console.log('Disconnected from the server.');
                this.isConnected = false;
                // Close and nullify the WebSocket instance
                if (this.websocket) {
                    this.websocket.onerror = null;
                    this.websocket.onclose = null;
                    this.websocket.close();
                    this.websocket = null;
                }
                // Increment connection attempts
                connectionAttempts++;
                // Attempt reconnection after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };
        };
    
        // Set a timeout for initial connection attempt
        connectionTimer = setTimeout(() => {
            if (!this.isConnected) {
                console.error('Connection attempt timed out. Retrying...');
                // Close and nullify the WebSocket instance
                if (this.websocket) {
                    this.websocket.onerror = null;
                    this.websocket.onclose = null;
                    this.websocket.close();
                    this.websocket = null;
                }
                connectWebSocket();
            }
        }, connectionTimeout);
    
        // Initial connection attempt
        connectWebSocket();
    }
    
    

    // Function to set a cookie
    setCookie(name, value, expiryDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        const cookieValue = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`;
        document.cookie = cookieValue;
    }

    // Function to get a cookie value by name
    getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName)) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    }

    sendMessage(message) {
        if (this.isConnected && this.websocket) {
            this.websocket.send(JSON.stringify(message));
        //} else {
        //    console.error('Cannot send message, not connected to the server.');
        }
    }

    handlePositionalUpdate(data) {
        // Assuming data.balls is an array of ball objects
        this.balls = data.balls;
        //console.log('Positional update received and stored:', data.balls);
    }

    handlePlayerProfileUpdate(data) {
        // Assuming data.player contains the player's client_id and profile information
        this.player.name= data.playerProfile.name;
        this.player.avatar= data.playerProfile.avatar;
        this.player.score= data.playerProfile.score;
        this.player.client_id= data.playerProfile.client_id
        this.triggerEvent('playerUpdateReceived', data.playerProfile);
    }

    handleChatMessage(data) {
        // Assuming data.message contains the chat message details
        this.chatMessages.push({'text':data.text,'client_id':data.client_id,'player_name':data.player_name,'color':data.color});
        this.triggerEvent('textMessageReceived', data);
        console.log('Chat message received:', data.text);
    }

    sendChatMessage(text) {
        this.sendMessage({
            type: 'chatMessage',
            client_id: this.client_id,
            text: text
        });
    }

    on(eventType, handler) {
        if (this.eventHandlers.hasOwnProperty(eventType)) {
            this.eventHandlers[eventType].push(handler);
        } else {
            console.error(`Invalid event type: ${eventType}`);
        }
    }

    triggerEvent(eventType, eventData) {
        if (this.eventHandlers.hasOwnProperty(eventType)) {
            this.eventHandlers[eventType].forEach(handler => handler(eventData));
        } else {
            console.error(`Invalid event type: ${eventType}`);
        }
    }


    getBalls() {
        // Method to retrieve the current balls' positions
        return this.balls;
    }

    getPlayerProfile() {
        return this.player;
    }

    pushBall(vector, weight, speed) {
        this.sendMessage({
            type: 'pushBall',
            client_id: this.client_id,
            vector: vector,
            weight: weight,
            speed: speed
        });
    }

    viewportZoom(direction) {
        this.sendMessage({
            type: 'viewportZoom',
            client_id: this.client_id,
            direction: direction  // "in" for zoom in, "out" for zoom out
        });
    }

    viewportMove(direction) {
        this.sendMessage({
            type: 'viewportMove',
            client_id: this.client_id,
            direction: direction  // "left", "right", "up", or "down"
        });
    }
    

    getChatMessages() {
        return this.chatMessages;
    }    

    async sendScreenDimensions() {
        // Send screen dimensions to the server
        await this.sendMessage({ type: "screenDimensions", dimensions: this.screenDimensions });
    }    

    updateScreenDimensions(dimensions) {
        this.screenDimensions = dimensions;
        this.sendScreenDimensions();
    }
}

// Example usage:
// const gameClient = new GameClient('ws://localhost:6789');
// gameClient.connect();
class GameObject {
    constructor(graphics,audio_manager, x = 0, y = 0, width = 64, height = 64, mass = 100, rotation = 0, rotation_speed = 4) {
        
        this.audio_manager=audio_manager;
        this.graphics = graphics;
        this.type = "block";
        this.sounds = { left: null, right: null, accel: null, decel: null, destroy: null };
        this.width = width;
        this.height = height;
        this.img = null;
        this.rotation = rotation;
        this.rotation_speed = rotation_speed;
        this.position = new rect(x, y,width,height);
        this.acceleration = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.mass = mass;
        this.damping_factor = .1; // acceleration slow down
        this.velocity_loss = .7; // momentum slow down
        this.image_frame = 0;
        this.image_frames = 1;
        this.image_rotation = 0;  //rotate the image seperate from the acceleration factor... for images made in diff directions
        this.anchor_points = []
        this.top_level = true;
        this.created = Date.now();
        this.expires = null;
        this.action_list = null;
        this.action_position = { frame: 0, row: 0 };
        this.health = 100;
        this.destroy_object = false;
        this.loop_done = false;
        this.loop = true;
        this.center = { x: 0, y: 0 };
        this.life = 100;
        this.max_life = 100;
        this.visible = true;
        this.explosions=[];
    }
    set_rotation_speed(speed){
        this.rotation_speed=speed;
    }
    set_rotation(rotation){
        this.rotation=rotation;
    }

    play(action) {
        let s=this.audio_manager.get(this.type+action);
        if(s) s.play();
    }
    
    set_loop(loop) {
        this.loop = loop;
    }
    set_visible(visible) {
        this.visible = visible;
    }
    loop_complete() {
        return this.loop_done;
    }
    damage(damage) {
        this.life -= damage;
        if (this.life < 0) this.destroy();

    }
    set_max_life(max_life) {
        this.max_life = max_life;
        this.life = max_life;
    }
    get_life_percentage() {
        return parseInt((this.life / this.max_life) * 100);
    }

    destroy() {
        this.destroy_object = true;

    }
    set_type(type) {
        this.type = type;
    }

    set_velocity(velocity) {
        this.velocity.x = velocity.x;
        this.velocity.y = velocity.y;

    }
    set_dimensions(width, height) {
        this.width = width;
        this.height = height;
    }

    expire(seconds) {
        this.expires = seconds;
    }

    set_center(x, y) {
        this.center.x = x;
        this.center.y = y;
    }

    set_sub() {
        this.top_level = false;
    }

    get_anchor_point(indeX) {

    }
    set_velocity_loss(loss) {
        this.velocity_loss = loss;
    }

    set_velocity_loss_off(loss) {
        this.velocity_loss = 1;
    }

    set_image(img_URL, frame_width = 1, frames = 1, rotation = 0) {
        this.image_rotation = rotation;
        this.image_frames = frames;
        this.frame_width = frame_width;
        this.img=this.graphics.sprites.add(img_URL);
    }

    image_rotate(rotation) {
        this.image_rotation = rotation
    }


    set_sound(position, sound_URL) {
        this.audio_manager.add(this.type+position, sound_URL);
    }



    async move_player(direction, speed) {
        direction %= 360;

        var rotationInRadians = direction * Math.PI / 180;
        var ax = Math.sin(rotationInRadians) * this.mass * speed;
        var ay = -Math.cos(rotationInRadians) * this.mass * speed;

        this.acceleration.x += ax;
        this.acceleration.y += ay;
    }

    async bank_left() {
        this.rotation -= this.rotation_speed;
        if (this.rotation < 0)
            this.rotation += 360;
        this.audio_manager.play(this.type+"bank_left");
    }

    async bank_right() {
        this.rotation += this.rotation_speed;
        this.rotation %= 360;
        this.audio_manager.play(this.type+"bank_right");

    }

    async accelerate(speed = null) {
        this.audio_manager.play(this.type+"accel");
        if (speed == null) speed = 1;
        this.move_player(this.rotation, speed);
    }

    async decelerate(speed = null) {
        this.audio_manager.play(this.type+"decel");

        if (speed == null) speed = 1;
        this.move_player(this.rotation + 180, speed);
    }

    async strafe_left(speed = null) {
        if (speed == null) speed = 1;
        this.move_player(this.rotation + 270, speed);
        this.audio_manager.play(this.type+"bank_left");

    }

    async strafe_right(speed = null) {
        if (speed == null) speed = 1;
        this.audio_manager.play(this.type+"bank_right");
        this.move_player(this.rotation + 90, speed);

    }

    async rotate(rotation) {
        this.rotation = rotation;
    }

    update_frame(deltaTime) {
        if (this.visible == false) return;
        if (this.image_frames > 1) {

            if (this.loop == false && this.image_frame >= this.image_frames - 1) {
                this.loop_done = true;
            }

            this.image_frame++;
            this.image_frame %= this.image_frames;

        }

        if (deltaTime != 0) {

            this.acceleration.x -= this.acceleration.x * this.damping_factor;
            this.acceleration.y -= this.acceleration.y * this.damping_factor;
            // Update velocity based on acceleration
            this.velocity.x += this.acceleration.x * deltaTime;
            this.velocity.y += this.acceleration.y * deltaTime;

            // Update position based on velocity
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;

            if (this.velocity.x != 0) {
                this.velocity.x *= this.velocity_loss;
            }
            if (this.velocity.y != 0) {
                this.velocity.y *= this.velocity_loss;

            }

            

        }


        for (let b = 0; b < this.explosions.length; b++) {
            this.explosions[b].update_frame(deltaTime)
            if (this.explosions[b].loop_complete()) {
                this.explosions.splice(b, 1); // Remove the projectile from the array
            }
        }

        this.playActions();
    }//end update frame

    orient(window = null) {

        this.graphics.ctx.save();
        let scale = this.graphics.viewport.scale.x;

        let x = this.position.x;
        let y = this.position.y;
        if (window != null) {
            x -= window.x;
            y -= window.y;
            x += this.graphics.viewport.given.x;
            y += this.graphics.viewport.given.y;
        }
        //x-=this.center.x ;
        //y-=this.center.y ;

        x *= scale;
        y *= scale;

        this.graphics.ctx.translate(x, y);

        var radians = ((this.rotation + this.image_rotation) % 360) * Math.PI / 180;
        this.graphics.ctx.rotate(radians);

    }

    de_orient() {
        this.graphics.ctx.restore();
    }


    rotatePoint(x, y, cx, cy, rotation) {
        // Translate the point so that the rotation axis is at the origin
        let translatedX = x - cx;
        let translatedY = y - cy;

        // Apply the rotation matrix
        let radians = (rotation * Math.PI) / 180

        let cosTheta = Math.cos(radians);
        let sinTheta = Math.sin(radians);

        let rotatedX = translatedX * cosTheta - translatedY * sinTheta;
        let rotatedY = translatedX * sinTheta + translatedY * cosTheta;

        // Translate the point back to its original position
        rotatedX += cx;
        rotatedY += cy;

        // Return the rotated point
        return { x: rotatedX, y: rotatedY };
    }


    get_relative_position(x, y) {
        return this.rotatePoint(x, y, 0, 0, this.rotation)
    }


    render() {
        if (this.visible == false) return;
        // Define the source rectangle

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = this.width; //*this.graphics.viewport.scale.x
        let sourceHeight = this.height; //*this.graphics.viewport.scale.x
        if (this.image_frames > 1) {
            sourceX = this.image_frame * this.frame_width;
            sourceWidth = this.frame_width;
        }
        let dest_height = sourceHeight * this.graphics.viewport.scale.x;
        let dest_width = sourceWidth * this.graphics.viewport.scale.x;
        let scale = this.graphics.viewport.scale.x;
        this.graphics.ctx.drawImage(this.img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            -this.center.x * scale, -this.center.y * scale, dest_width, dest_height);

        //      } else {
        //            this.graphics.ctx.drawImage(this.img,  -this.center.x, -this.center.y, sourceWidth, sourceHeight,
        //                                        -this.center.x, -this.center.y, sourceWidth, sourceHeight);

        //this.graphics.ctx.drawImage(this.img, -this.center.x, -this.center.y);
        //    }
        for(let i=0;i<this.explosions.length;i++){
            this.explosions[i].render(); 
        }
    }
    renderWithOverlay(overlayColor) {
        // Render the object normally
        if (this.image_frames > 1) {
            // Define the source rectangle
            let sourceX = this.image_frame * this.frame_width;
            let sourceY = 0;
            let sourceWidth = this.frame_width;
            let sourceHeight = this.height;

            // Save the current context state
            this.graphics.ctx.save();

            // Clip to the region of the drawn imagery
            this.graphics.ctx.beginPath();
            this.graphics.ctx.rect(-this.center.x, -this.center.y, sourceWidth, sourceHeight);
            this.graphics.ctx.clip();

            // Draw the image onto the canvas
            this.graphics.ctx.drawImage(this.img, sourceX, sourceY, sourceWidth, sourceHeight,
                -this.center.x, -this.center.y, sourceWidth, sourceHeight);

            // Apply the overlay color to the drawn imagery
            this.graphics.ctx.globalCompositeOperation = 'source-atop';
            this.graphics.ctx.fillStyle = overlayColor;
            this.graphics.ctx.fillRect(-this.center.x, -this.center.y, sourceWidth, sourceHeight);

            // Restore the previous context state
            this.graphics.ctx.restore();
        } else {
            // Save the current context state
            this.graphics.ctx.save();

            // Clip to the region of the drawn imagery
            this.graphics.ctx.beginPath();
            this.graphics.ctx.rect(-this.center.x, -this.center.y, this.width, this.height);
            this.graphics.ctx.clip();

            // Draw the image onto the canvas
            this.graphics.ctx.drawImage(this.img, -this.center.x, -this.center.y);

            // Apply the overlay color to the drawn imagery
            this.graphics.ctx.globalCompositeOperation = 'source-atop';
            this.graphics.ctx.fillStyle = overlayColor;
            this.graphics.ctx.fillRect(-this.center.x, -this.center.y, this.width, this.height);

            // Restore the previous context state
            this.graphics.ctx.restore();
        }
    }



    get_combine_center(otherObject) {
        // Calculate the center coordinates of this object
        let thisCenterX = this.position.x + this.width / 2;
        let thisCenterY = this.position.y + this.height / 2;

        // Calculate the center coordinates of the other object
        let otherCenterX = otherObject.position.x + otherObject.width / 2;
        let otherCenterY = otherObject.position.y + otherObject.height / 2;

        // Calculate the combined center coordinates
        let combinedCenterX = (thisCenterX + otherCenterX) / 2;
        let combinedCenterY = (thisCenterY + otherCenterY) / 2;

        // Return the combined center coordinates
        return { x: combinedCenterX, y: combinedCenterY };
    }

    check_collision(otherObject) {
        // Calculate the center coordinates of both objects
        let thisCenterX = this.position.x + this.width / 2;
        let thisCenterY = this.position.y + this.height / 2;
        let otherCenterX = otherObject.position.x + otherObject.width / 2;
        let otherCenterY = otherObject.position.y + otherObject.height / 2;

        // Calculate the distance between the centers of the objects
        let distanceX = Math.abs(thisCenterX - otherCenterX);
        let distanceY = Math.abs(thisCenterY - otherCenterY);

        // Calculate the combined width and height of both objects
        let combinedWidth = (this.width + otherObject.width) / 2;
        let combinedHeight = (this.height + otherObject.height) / 2;

        // Check if the distance between the centers is less than the combined width and height
        if (distanceX < combinedWidth && distanceY < combinedHeight) {
            // Collision detected or adjacent
            return true;
        }
        // No collision
        return false;
    }


    impact(otherObject) {
        // Calculate relative velocity
        let relativeVelocityX = this.velocity.x - otherObject.velocity.x;
        let relativeVelocityY = this.velocity.y - otherObject.velocity.y;

        // Calculate relative position
        let relativePositionX = otherObject.position.x - this.position.x;
        let relativePositionY = otherObject.position.y - this.position.y;

        // Calculate the angle of collision
        let collisionAngle = Math.atan2(relativePositionY, relativePositionX);

        // Calculate the component of velocities along the collision angle
        let a1 = relativeVelocityX * Math.cos(collisionAngle) + relativeVelocityY * Math.sin(collisionAngle);
        let a2 = -relativeVelocityX * Math.cos(collisionAngle) - relativeVelocityY * Math.sin(collisionAngle);


        // Calculate the optimized impulse
        let optimizedP = (2.0 * (a1 - a2)) / (1 / this.mass + 1 / otherObject.mass); // Adjusted for masses

        // Calculate the new velocities after collision
        let v1x, v1y, v2x, v2y;

        if (this.mass === 10000) {
            // Objects with mass 10000 maintain their velocities
            v1x = this.velocity.x;
            v1y = this.velocity.y;
        } else {
            v1x = this.velocity.x - optimizedP * Math.cos(collisionAngle) / this.mass;
            v1y = this.velocity.y - optimizedP * Math.sin(collisionAngle) / this.mass;
        }
        if (otherObject.mass === 10000) {
            v2x = otherObject.velocity.x;
            v2y = otherObject.velocity.y;
        } else {
            v2x = otherObject.velocity.x + optimizedP * Math.cos(collisionAngle) / otherObject.mass;
            v2y = otherObject.velocity.y + optimizedP * Math.sin(collisionAngle) / otherObject.mass;
        }

        let relativeVelocityMagnitude = Math.sqrt(Math.pow(relativeVelocityX, 2) + Math.pow(relativeVelocityY, 2));

        // Calculate damage based on relative velocity, mass, or any other relevant factors
        let damage = relativeVelocityMagnitude * (1 / this.mass + 1 / otherObject.mass);
        this.damage(damage);

        // Set the new movement vectors for the objects
        this.velocity.x = v1x;
        this.velocity.y = v1y;
        otherObject.velocity.x = v2x;
        otherObject.velocity.y = v2y;
        this.acceleration.x = 0;
        this.acceleration.y = 0;

    }




    async playActions() {
        if (this.action_list == null) return;
        let action = this.action_list[this.action_position.row];

        this.executeAction(action);

        this.action_position.frame++;
        if (this.action_position.frame >= action.frames) {
            this.action_position.row++;
            this.action_position.frame = 0;
            if (this.action_position.row >= this.action_list.length) {
                this.action_position.row = 0;
            }

        }

    }

    async executeAction(action) {
        switch (action.type) {
            case 'bank_left':
                await this.bank_left();
                //console.log("Bank left");
                break;
            case 'bank_right':
                await this.bank_right();
                //console.log("Bank Right");
                break;
            case 'accelerate':
                await this.accelerate(action.speed);
                //console.log("Accel");

                break;
            case 'decelerate':
                //console.log("Decel");
                await this.decelerate(action.speed);
                break;
            case 'rotate':
                //console.log("Decel");
                await this.rotate(action.rotation);
                break;
            case 'strafe_left':
                //console.log("Decel");
                await this.strafe_left(action.speed);
                break;
            case 'strafe_right':
                //console.log("Decel");
                await this.strafe_right(action.speed);
                break;

            case 'skip':

                break;
        }
    }

    async wait(frames) {
        return new Promise(resolve => setTimeout(resolve, frames * millisecondsPerFrame));
    }
    explosion(){
        let exp = new Explosion(this.graphics,this.audio_manager, 0,0,this.play_sounds,this.volume);
        this.explosions.push(exp);
    }

}


class Explosion extends GameObject {
    constructor(graphics,audio,x, y) {
                super(graphics,audio,x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10);                     // 
                this.set_image('static/explosion/exp_9_128x128_35frames_strip35.png',128,35);
                this.set_center(64,64);
                this.set_type("explosion");
                this.set_loop(false);
                this.set_sound("destroy","static/explosion/sfx_exp_shortest_soft9.wav");
    }

            
}


class Projectile extends GameObject {
    constructor(graphics,audio, x, y, rotation, type, sounds = false) {
        switch (type) {
            case 'lazer':
                let actions = [
                    { type: "accelerate", frames: 1 }
                ];
                super(graphics,audio, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                    );                     // ropration speed
                this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.set_center(8, 8);
                this.expire(5);
                this.set_type("laser");
                //this.action_list=actions;

                break;

            case 'bolt':
                super(graphics, audio,x, y, 16, 16,
                    600,                    // mass
                    rotation,                      // rotation
                    4,
                    );                     // ropration speed
                this.set_image('static/projectiles/Firebomb.png', 16, 5, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                break;

            case 'thruster':
                super(graphics, audio,x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    );                     // ropration speed
                this.set_image('static/ships/Water Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.center.y = 8;
                this.expire(5);
                this.set_type("thrusters");
                break;

            case 'booster':
                super(graphics, audio,x, y, 32, 64,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    );                     // ropration speed
                this.set_image('static/ships/booster.png', 32, 4, 0);
                this.set_velocity_loss_off();
                this.center.x = 16;
                this.center.y = 2;
                this.set_type("booster");
                break;

        }


    }

}


class Derbis extends GameObject {
    constructor(graphics,audio,x, y, type) {
        let speed=.5 + Math.random() * 1;
        let default_action =
            [
                { type: "bank_left", frames: 3 },
                { type: "accelerate", frames: 3 },
                { type: "bank_right", frames: 3 },
                { type: "accelerate", frames: 3 },
                { type: "decelerate", frames: 3 },
                { type: "bank_left", frames: 6 },
                { type: "decelerate", frames: 3 },
                { type: "bank_left", frames: 3 },
                { type: "skip", frames: 4 },
            ];

        switch (type) {
            case 'email':
                super(graphics,audio,x, y,64,64,
                    500,                    // mass
                    0,                      // rotation
                    10);                     // ropration speed
                this.set_image('static/debris/email.png');
                this.set_type("email");
                let email_action = [
                    { frames: 4, type: "strafe_left", speed:speed},
                    { frames: 15, type: "skip" },
                    { frames: 4, type: "strafe_right" , speed:speed},
                    { frames: 15, type: "skip"},
                ];


                this.action_list = email_action;
                break;
            case 'pdf':
                super(graphics,audio,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/pdf.png');
                this.set_type("pdf");
                let pdf_action = [
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "bank_left", frames: 4 }
                ];

                this.action_list= pdf_action;                
                break;
            case 'call':
                super(graphics,audio,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/phone.png');
                this.set_type("call");
                let call_action = [
                    { type: "bank_right", frames: 1 },

                ];

                this.action_list = call_action;
                break;

            case 'webex':
                super(graphics,audio,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/webex2.png');
                this.set_type("webex");
                this.action_list = default_action;
                break;
            case 'block':
                super(graphics,audio,x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('static/blocks/block.png');
                this.set_type("block");
        }
        this.rotation = 180;

    } // end
}
class HeatSeekingMissile extends GameObject {
    constructor(x=0, y=0, mass=100, rotation=0, rotation_speed=4) {
        super(x, y, mass, rotation, rotation_speed);
        this.target = { x: 0, y: 0 }; // Initialize target position
        this.maxSpeed = 10; // Maximum speed of the missile
        this.turningRate = 2; // Rate at which the missile can turn
        this.accelerationRate = 0.1; // Rate at which the missile accelerates
    }

    update(deltaTime) {
        // Update orientation to face the target
        this.rotateTowardsTarget();

        // Bank left or right based on orientation
        if (this.rotation < 0) {
            this.bankRight();
        } else {
            this.bankLeft();
        }

        // Accelerate towards the target
        this.accelerate();

        // Limit speed
        this.limitSpeed();

        // Update frame
        this.update_frame(deltaTime);
    }

    rotateTowardsTarget() {
        const deltaX = this.target.x - this.position.x;
        const deltaY = this.target.y - this.position.y;
        const targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const angleDiff = (targetAngle - this.rotation + 180) % 360 - 180;

        // Rotate towards the target
        if (angleDiff > this.turningRate) {
            this.bankRight();
        } else if (angleDiff < -this.turningRate) {
            this.bankLeft();
        }
    }

    bankLeft() {
        this.bank_left();
    }

    bankRight() {
        this.bank_right();
    }

    accelerate() {
        // Accelerate towards the target
        const rotationInRadians = this.rotation * (Math.PI / 180);
        const ax = Math.cos(rotationInRadians) * this.accelerationRate;
        const ay = Math.sin(rotationInRadians) * this.accelerationRate;

        this.acceleration.x += ax;
        this.acceleration.y += ay;
    }

    limitSpeed() {
        // Calculate current speed
        const speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

        // If speed exceeds maxSpeed, reduce velocity
        if (speed > this.maxSpeed) {
            const scaleFactor = this.maxSpeed / speed;
            this.velocity.x *= scaleFactor;
            this.velocity.y *= scaleFactor;
        }
    }
}

class Ship extends GameObject {

    constructor(graphics,audio, x, y, type) {
        super(graphics,audio, x, y, 128, 153,
            200,                    // mass
            0,                      // rotation
            8);                     // ropration speed
        
        this.boost_fire_control = new fire_control(3);
        this.laser_fire_control = new fire_control(3);
        this.missile_fire_control = new fire_control(10);
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        let speed=.5 + Math.random() * 4;

        switch (type) {
            case 'user':
                this.set_type("ship");
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_sound("lazer", 'static/audio/projectiles/sfx_wpn_laser6.wav')
                this.set_sound("missile", 'static/audio/projectiles/sfx_weapon_singleshot13.wav')
            
                this.set_image('static/ships/ship1.png');
                this.set_center(64, 64);
                this.booster = new Projectile(this.graphics,audio, +0, 100, 0, "booster");
                this.thrusters.push(this.booster);
                var thruster1 = new Projectile(this.graphics,audio, +30, 55, 0, "thruster");
                this.thrusters.push(thruster1);
                var thruster2 = new Projectile(this.graphics,audio, -30, 55, 0, "thruster");
                this.thrusters.push(thruster2);
                break;

            case 'teams':
                this.set_type("ship");
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_sound("lazer", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/teams.png',64,1,270);
                //this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_rotation(270);
                this.set_center(64, 64);
                this.set_rotation_speed(10);
                let frames=Math.random()*15+10;
                let actions = [
                    { type: "bank_right", frames: 9,  },
                    { type: "accelerate", frames: frames ,speed:speed},
                    { type: "lazer",frames: 1},
                    //{ type: "bank_left", frames: 15,  },
                    //{ type: "accelerate", frames: 6, speed:5},
                    { type: "skip", frames: 4 }
                ];
                this.action_list=actions;
                this.action_position.frame=parseInt(Math.random( )*actions.length);

                break;

        }
    }

    set_volume(volume) {
        super.set_volume(volume);
        for (let thruster of this.thrusters) {
            thruster.volume = volume;
        }
        for (let projectile of this.projectiles) {
            projectile.volume = volume;
        }
    }

    boost() {
        if (this.boost_fire_control.can_fire()) {
            this.booster.set_visible(true);
            this.accelerate(10);
            //this.accelerate();
            console.log("BOOST");
        }
    }

    stop_boost() {
        this.boost_fire_control.stop_firing();
        this.booster.set_visible(false);
    }



    fire_lazer() {
        if (this.laser_fire_control.can_fire()) {
            let lazer1 = this.get_relative_position(-60, -35)
            var projectile = new Projectile(this.graphics, this.audio_manager,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, "lazer");
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.graphics, this.audio_manager,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, "lazer");
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);
            this.play("lazer");
            
        }
    }
    stop_firing_lazer() {
        this.laser_fire_control.stop_firing();
    }

    fire_missle() {
        if (this.missile_fire_control.can_fire()) {
            let missle1 = this.get_relative_position(0, -80)
            var projectile = new Projectile(this.graphics, this.audio_manager,this.position.x + missle1.x, this.position.y + missle1.y, this.rotation, "bolt");
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            this.projectiles.push(projectile);
            this.missile_fire_control.stop_firing();
        }

    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);
        this.laser_fire_control.update_frame();
        this.missile_fire_control.update_frame();
        this.boost_fire_control.update_frame();

        const timestamp = Date.now(); // Corrected method to get current timestamp in milliseconds

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (timestamp - projectile.created > 5000) {
                this.projectiles.splice(i, 1); // Remove the projectile from the array
                // Optionally perform additional cleanup or logging here
            } else {
                projectile.update_frame(deltaTime); // Update the projectile if it's not deleted
            }
        }

        for (let thruster of this.thrusters) {
            thruster.update_frame(deltaTime);
        }
    }



    render(window) {
        super.orient(window)
        for (let thruster of this.thrusters) {
            thruster.orient()
            thruster.render()
            thruster.de_orient()
        }
        super.render();
        super.de_orient();

        for (let projectile of this.projectiles) {
            projectile.orient(window)
            projectile.render()
            projectile.de_orient()
        }
        //super.de_orient(ctx)
    }
    async executeAction(action) {
       super.executeAction(action);
       switch(action.type){
        case 'lazer': this.fire_lazer(); break;
       }
    }

}//end ship class




function dialog() {
    document.getElementById('next_btn').addEventListener('click', function () {
      // Handle OK button click event
      document.getElementById('intro').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      initGame();

    });

    // To show the overlay
    document.getElementById('underlay').style.display = 'flex';
  }
  document.addEventListener('DOMContentLoaded', function () {
    dialog();
  });

function blipEffect() {
    const overlay = document.getElementById('dialog_box');
    const originalBrightness = 'brightness(100%)'; // Original brightness
    const blipBrightness = 'brightness(80%)'; // Brightness during blip
    let isBlipping = false;

    function startBlip() {
        if (!isBlipping) {
            overlay.style.filter = blipBrightness; // Darken for the blip
            isBlipping = true;
            setTimeout(() => {
                overlay.style.filter = originalBrightness; // Return to original brightness
                isBlipping = false;
            }, 100); // Duration of the blip is less than 300ms
        }   
    }

    setInterval(() => {
      // Only start a new blip if not currently blipping
      if (!isBlipping) {
        startBlip();
      }
    }, Math.random() * (10000 - 5000) + 2000); // Random interval between 2 and 8 seconds
  }

  document.addEventListener('DOMContentLoaded', function () {
    //blipEffect(); // Start the blipping effect when the document is ready
  });class graphics extends events{

    constructor(canvas=null,ctx=null){
        super();    
        this.canvas=canvas
        this.ctx=ctx;
        this.font=null;
        this.sprites=new sprites(ctx);
        this.sprites.on("complete", () => this.load_font()); // Using arrow function to preserve 'this'
        this.backround=null;
        this.viewport=new viewport(1920,window.innerHeight);
        this.frame_background_color='#222';
        this.background_color='#000000';

    }
    load_font(){
        let font=new sprite_font(this.ctx,this.sprites, "blue_font");
        this.font = font;
        this.emit('complete');
    }

    set_background(image_url){
        this.backround=new Image();
        this.backround.src=image_url;
    }

    recalc_canvas(){
        this.viewport.calculate();

        //reset canvas dimentions
        this.canvas.windowWidth = this.viewport.frame.width;
        this.canvas.windowHeight = this.viewport.frame.height;
        this.canvas.width = this.viewport.frame.width;
        this.canvas.height = this.viewport.frame.height;

    }


    updateCanvasSizeAndDrawImage(level_position) {
        if (this.backround==null){
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        //this corrects the window every frame.. no need for an event.. tho maybe less resource intensive
        let srcX=0;
        let srcY=0;//increment for scroll (start at bottom)
        // make it src bg width and window height
        let destX=this.viewport.given.x;
        let destY=this.viewport.given.y;
        let scaledDestWidth=this.viewport.given.width;
        let scaledDestHeight=this.viewport.given.height;

        let vp_h=this.viewport.virtual.height;
        let scrollable_height=level_position.height-vp_h;
        if( scrollable_height<0)scrollable_height=0;
        let position_percentage=((scrollable_height)/level_position.y);
        srcY=position_percentage*scrollable_height;
        
        position_percentage=level_position.y/(level_position.height-this.viewport.virtual.height);
        srcY=position_percentage*(this.backround.height-this.viewport.virtual.height);
        
        
        this.ctx.save();
        this.ctx.fillStyle = this.frame_background_color;

        // Clear the canvaFrame
        this.ctx.fillRect(this.viewport.frame.x,this.viewport.frame.y,this.viewport.frame.width,this.viewport.frame.height);

        //this.ctx.globalCompositeOperation = 'source-atop';
        //this.ctx.fillStyle = this.frame_background_color;
        //this.ctx.fillRect(this.viewport.frame.x,this.viewport.frame.y,this.viewport.frame.width,this.viewport.frame.height);

        this.ctx.restore();


        this.ctx.fillStyle = this.background_color;

        // Clear the canvas
        //this.ctx.clearRect(this.viewport.given.x,this.viewport.given.y,this.viewport.given.width,this.viewport.given.height);

        

        let bg_scale_x=this.viewport.given.width/this.backround.width;
        let bg_h=this.viewport.virtual.height;
        
        // Draw the selected portion of the original image scaled on the canvas at the specified coordinates
        this.ctx.drawImage(this.backround, 
                            srcX, srcY, 
                            this.backround.width,bg_h, 
            
                            destX, destY, 
                            scaledDestWidth, scaledDestHeight);
    }

    fade_images(percentage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Draw the first image
        ctx.globalAlpha = 1; // Reset to full opacity
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);

        // Draw the second image on top with adjusted opacity
        ctx.globalAlpha = percentage / 100; // Convert percentage to [0,1] range for alpha
        ctx.drawImage(image2, 0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 1; // Reset alpha to full opacity
    }
}
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

class PercentageBar {
    constructor(graphics, x, y, width, height, label) {
        this.graphics=graphics;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
    }

    render(percentage) {
        let vp=this.graphics.viewport.given;
        let x = this.x+vp.x;
        let y = this.y+vp.y;

        // Background with subtle gradient
        let bgGradient = this.graphics.ctx.createLinearGradient(x, y, x, y + this.height);
        bgGradient.addColorStop(0, '#222222'); // Light gray
        bgGradient.addColorStop(1, '#000000'); // Almost white
        this.graphics.ctx.fillStyle = bgGradient;
        this.graphics.ctx.fillRect(x, y, this.width, this.height);

        let adjusted_percentage=percentage;
        if (adjusted_percentage<0)adjusted_percentage=0;
        if (adjusted_percentage>100) adjusted_percentage=100;
        
        // Adjust bar color based on percentage
        const redIntensity = Math.floor(255 * (1 - adjusted_percentage / 100));
        const greenIntensity = Math.floor(255 * (adjusted_percentage/ 100));
        this.graphics.ctx.fillStyle = `rgb(${redIntensity},${greenIntensity},0)`;

        // Fill the entire bar, adjusting color based on percentage
        this.graphics.ctx.fillRect(x + 3, y + 3, (this.width - 6) * (adjusted_percentage/ 100), this.height - 6);

        // Draw outline
        this.graphics.ctx.strokeStyle = '#AAA'; // Dark gray
        this.graphics.ctx.lineWidth = 2;
        this.graphics.ctx.strokeRect(x, y, this.width, this.height);

        // Draw percentage text
        this.graphics.ctx.fillStyle = '#DDFFFF'; // Neon blue
        this.graphics.ctx.fillStyle = `rgb(${redIntensity},${redIntensity},${redIntensity})`;
        this.graphics.ctx.font = '14px IBM Plex Sans, Arial, sans-serif';
        this.graphics.ctx.textAlign = 'center';
        this.graphics.ctx.textBaseline = 'middle';
        this.graphics.ctx.fillText(percentage.toFixed(0) + '%', x + this.width / 2, y + this.height / 2 - 10);

        // Draw label text
        this.graphics.ctx.font = '14px IBM Plex Sans, Arial, sans-serif';
        this.graphics.ctx.fillText(this.label, x + this.width / 2, y + this.height / 2 + 10);
    }
}class level{
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
                            case '.': block = new Derbis(this.G.graphics,this.G.audio_manager,x, y, "block"); break;
                            case 't': block = new Ship(this.G.graphics,this.G.audio_manager,x, y, "teams"); break;
                            case 'p': block = new Derbis(this.G.graphics,this.G.audio_manager,x, y, "pdf"); break;
                            case 'e': block = new Derbis(this.G.graphics,this.G.audio_manager,x, y, "email"); break;
                            case 'c': block = new Derbis(this.G.graphics,this.G.audio_manager,x, y, "call"); break;
                            case 'w': block = new Derbis(this.G.graphics,this.G.audio_manager,x, y, "webex"); break;
                            case 'P': this.spaceship = new Ship(this.G.graphics,this.G.audio_manager,x,y, "user"); break;
                        }
                        this.npc.push(block);


                    }

                }
                this.position.y = this.rows * 64 - window.innerHeight;
                this.position.x = 0;
                this.position.height = this.rows * 64;
                this.position.width = this.columns * 64;
                
                this.spaceship.set_max_life(5000);
                this.G.start_level();
                // You can access other properties similarly
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        }
}class GamePage {
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
        let mode="center";

        masterMenu.add_button("New Game",button_position1,null, "button-up-cyan", "button-down-cyan");
        masterMenu.add_button("Story So Far", button_position2,null, "button-up-cyan", "button-down-cyan");
        masterMenu.add_button("High Scores", button_position3,null, "button-up-cyan", "button-down-cyan");
        masterMenu.add_button("Credits", button_position4,this.credits_menu_callback,"button-up-cyan", "button-down-cyan");
        masterMenu.add_button("Exit", button_position5,this.exit_callback, "button-up-red", "button-down-red");

    }
    exit_callback(){
        alert("I can't realy close the window...\n But I'd like to!\n Thanks for playin\n -Chris");
    }

    credits_menu_callback(event) {
        let position = new rect(50, null, 500, 650,"left","top");
        let credits="Created By: Charles Watkins";
        const masterMenu = this.window_manager.create_modal("Main Menu", credits, position, false, false);
        this.window_manager.set_background("menu");

        let x = 30;
        let button_width=masterMenu.internal_rect.width-60;
        let button_position5=new rect(x,masterMenu.internal_rect.height-110,button_width,null,"left","top");

        masterMenu.add_button("Exit", button_position5,this.credits_exit_callback, "button-up-red", "button-down-red");

    }

    credits_exit_callback(event){
        event.close();
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
