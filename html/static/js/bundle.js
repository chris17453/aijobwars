class events{
    constructor(){
        this.events = {}; // Object to hold events

    }

on(event_name, callback) {
    if (!this.events[event_name]) {
      this.events[event_name] = [];
    }
    this.events[event_name].push(callback);
  }

  emit(event_name, data=null) {
    if (data==null) {
      data={};
    }
    if(this.hasOwnProperty('parent')){
      data.parent=this.parent;
    }
    data.instance=this;
    data.event=event_name;
    

    if (this.events[event_name]) {
      this.events[event_name].forEach(callback => callback(data));
    }
  }

}class point{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
}

class rect {
    constructor(x, y, width, height, x_mode = "left", y_mode = "top") {
        this._x = x !== null ? parseInt(x) : null;
        this._y = y !== null ? parseInt(y) : null;
        this._width  = width !== null ? parseInt(width) : null;
        this._height = height !== null ? parseInt(height) : null;
        this._y_mode = y_mode !== null ? y_mode : "top";
        this._x_mode = x_mode !== null ? x_mode : "left";
    }
    
    get x() {
        return this._x;
    }

    set x(value) {
        this._x = parseInt(value);
    }

    get y() {
        return this._y;
    }

    set y(value) {
                this._y = parseInt(value);
      
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (value >= 0) {
            this._width = parseInt(value);
            switch(this._x_mode) {
                
                case 'center': parseInt(this._x-=value/2); break;
            }
        }
    }

    get height() {

        return this._height;
    }

    set height(value) {
        if (value >= 0) {
            this._height = parseInt(value);
            switch(this._y_mode) {
                case 'center': parseInt(this._y-=value/2); break;
            }
        }
    }

    set center_x(value) {
        this._x = parseInt(value - this._width / 2);
    }

    set center_y(value) {
        this._y = parseInt(value - this._height / 2);
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

    //get the scale for the rect based on another rect.
    get_scale(dest){
        let scale_x =  dest.width/this._width ;
        let scale_y =  dest.height/this._height ;
        return new point(scale_x,scale_y);
    }

    //scale the recy by the point given
    set_scale(dest){
        if (this._x!=null) this._x=parseInt(this._x*dest.x);
        if (this._y!=null) this._y=parseInt(this._y*dest.y);
        if (this._width!=null) this._width=parseInt(this._width*dest.x);
        if (this._height!=null) this._height=parseInt(this._height*dest.y);
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
class audio_manager {
    constructor() {
        this.defaultSounds = new Map();
        this.playingSounds = new Map();
        this.playSounds = true;
        this.defaultVolume = 0.4;
    }

    add(key, audioPath=null) {
        if (audioPath==null) audioPath=key;
        const sound = new Audio(audioPath);
        sound.volume = this.defaultVolume;

        this.defaultSounds.set(key, sound);

        if (!this.playingSounds.has(key)) {
            this.playingSounds.set(key, []);
        }

        return sound; // Return the default audio object
    }

    get(key) {
        if (this.defaultSounds.has(key)) {
            return this.defaultSounds.get(key);
        } else {
            return false;
        }
    }

    is_playing(key) {
        if (!this.playingSounds.has(key)) {
            return false;
        }

        return this.playingSounds.get(key).length > 0;
    }

    async play(key) {
        console.log("Attempting Playing: "+key)
        if (this.playSounds && this.defaultSounds.has(key)) {
            const defaultSound = this.defaultSounds.get(key); // Get the default audio object
            const clonedSound = defaultSound.cloneNode(true); // Clone the default audio object
            this.playingSounds.get(key).push(clonedSound); // Save cloned sound in array
            
            await new Promise((resolve) => {
                clonedSound.addEventListener('loadeddata', resolve);
            });
            clonedSound.volume=this.defaultVolume;
            clonedSound.play(); // Play the cloned audio object
            console.log("Playing: "+key)
            
            // Remove sound from playingSounds map when it finishes playing
            clonedSound.addEventListener('ended', () => {
                const index = this.playingSounds.get(key).indexOf(clonedSound);
                if (index !== -1) {
                    this.playingSounds.get(key).splice(index, 1);
                }
            });
        }
    }

    async stop(key) {
        if (this.playingSounds.has(key)) {
            this.playingSounds.get(key).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
            this.playingSounds.set(key, []); // Clear the array
        }
    }

    async pause(key) {
        if (this.playingSounds.has(key)) {
            this.playingSounds.get(key).forEach(sound => {
                sound.pause();
            });
        }
    }

    sound_off() {
        this.playSounds = false;
        this.playingSounds.forEach(sounds => {
            sounds.forEach(sound => {
                sound.pause();
            });
        });
    }

    sound_on() {
        this.playSounds = true;
        this.playingSounds.forEach(sounds => {
            sounds.forEach(sound => {
                sound.play();
            });
        });
    }

    set_volume(key, volume) {
        if (volume == null || isNaN(volume)) {
            console.error("Invalid volume value");
            return;
        }

        if (this.playingSounds.has(key)) {
            this.playingSounds.get(key).forEach(sound => {
                sound.volume = volume;
            });
        }

        if (this.defaultSounds.has(key)) {
            const defaultSound = this.defaultSounds.get(key);
            defaultSound.volume = volume;
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
    }

    preload(){

        this.add("window", "static/UI/UI1.png", 67, 67, 565, 332);
        this.add("window-title", "static/UI/UI1.png", 162 - 10, 411 - 10, 372 + 10 * 2, 68 + 10 * 2);
        this.add("button-down-red", "static/UI/UI1.png", 683, 77, 206, 68);
        this.add("button-up-red", "static/UI/UI1.png", 683, 161, 206, 68);
        this.add("button-down-yellow", "static/UI/UI1.png", 928, 77, 206, 68);
        this.add("button-up-yellow", "static/UI/UI1.png", 927, 161, 206, 68);
        this.add("button-down-cyan", "static/UI/UI1.png", 683, 281, 206, 68);
        this.add("button-up-cyan", "static/UI/UI1.png", 683, 365, 206, 68);
        this.add("button-down-gray", "static/UI/UI1.png", 928, 281, 206, 68);
        this.add("button-up-gray", "static/UI/UI1.png", 927, 365, 206, 68);
        this.add("percentage-full", "static/UI/UI1.png", 182 - 12, 707 - 12, 30 + 12 * 2, 45 + 12 * 2);
        this.add("percentage-empty", "static/UI/UI1.png", 929 - 12, 707 - 12, 30 + 12 * 2, 45 + 12 * 2);
        this.add("window-thinn", "static/UI/UI4.png", 1721-10, 154-10, 348 + 10 * 2, 466 + 10 * 2);

        this.add("window-close-up", "static/UI/UI4.png", 1806, 678, 42,42);
        this.add("window-close-down", "static/UI/UI4.png", 1857, 677, 42,42);
        this.add("window-right-corner", "static/UI/UI4.png", 1908, 661, 80,73);

        this.add("scroll-down", "static/UI/UI4.png", 1641, 585, 32,32);
        this.add("scroll-up", "static/UI/UI4.png", 1641, 144, 32,32);
        this.add("scroll-drag", "static/UI/UI4.png", 1641, 194, 30,54);
        this.add("scroll-bg", "static/UI/UI4.png", 1641, 267, 32,300);
        
        this.add("bar", "static/UI/UI4.png", 766, 760, 357,47);
        this.add("bar-red-fluid", "static/UI/UI4.png", 780, 901, 312,33);
        this.add("bar-green-fluid", "static/UI/UI4.png", 1097, 901, 312,32);
        this.add("bar-blue-fluid", "static/UI/UI4.png", 781, 939, 312,33);
        this.add("bar-orange-fluid", "static/UI/UI4.png", 1098, 939, 312,33);
        this.add("portal", "static/UI/UI4.png", 569, 763, 158,158);
        
        this.add("menu","static/UI/menu.webp");
        this.add("blue_font","static/fonts/obitron-blue.png");
        this.add("grey_font","static/fonts/obitron-grey.png");
        this.add("red_font","static/fonts/obitron-red.png");
        this.add("title","static/intro/AI-JOB-WARS-3-24-2024.png");


        this.add("email",    "static/debris/email.png");
        this.add("pdf",      "static/debris/pdf.png");
        this.add("phone",    "static/debris/phone.png");
        this.add("webex2",   "static/debris/webex2.png");
        this.add("block",    "static/blocks/block.png");
        this.add("exp_9",    "static/explosion/exp_9_128x128_35frames_strip35.png");
        this.add("ship1",    "static/ships/ship1.png");
        this.add("teams",    "static/ships/teams.png");
        this.add("Arcane",   "static/projectiles/Arcane Bolt.png");
        this.add("Firebomb", "static/projectiles/Firebomb.png");
        this.add("Water",    "static/ships/Water Bolt.png");
        this.add("booster",  "static/ships/booster.png");


        this.on_load();

    }

    add(key, imagePath = null, x = 0, y = 0, width = null, height = null) {
        // Check if the key already exists
        if (this.sprites[key]) {
            //console.warn(`Image with key '${key}' already exists.`);
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
                position: new rect(x,y,width || image.width,height||image.height),
                x: x,
                y: y,
                width: width || image.width,
                height: height || image.height
            };

        });
    }

    on_load(){
        // Resolve the main promise when all image promises are resolved
        Promise.all(Object.values(this.images)).then(() => {
            this.loaded = true;
          //  if(callback!==undefined) callback();
          this.emit('complete'); // Emit 'complete' event when all images are loaded
          console.log("Loaded Images");
          }).catch((error) => {
            console.error("Error preloading images:", error);
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
                if ( alpha >0) {
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
 
    draw_rect(position,color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x,position.y,position.width,position.height); // Rectangle position and dimensions
    }

    // Other methods like render, slice_9, slice_3...
    render(key, src,dest, intensity = 1, mode = 'fill') {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
        if (src==null) src=new rect(s.x,s.y,s.width,s.height);

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
        this.ctx.drawImage(s.image, src.x, src.y, src.width, src.height, dx, dy, dWidth, dHeight);

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
        let dest_inner = new rect(dest.x + x_margin, dest.y + y_margin, dest.width - x_margin * 2, dest.height - y_margin * 2);
        
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
            if ([1, 3, 4,  5, 7].includes(index)) { // Other quadrants are tileds

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
    clear(color,position){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x, position.y, position.width, position.height); // Fill the entire canvas with the selected color
    }
    



}class sprite_font {
    constructor(ctx,sprites, image_key) {
        this.sprites = sprites;
        this.ctx=ctx;
        this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]|`\\/@" + "°+=*$£€<>";
        this.image =image_key;
        this.spacing_width=1;
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

class button extends events{
  constructor(parent,graphics, label,position,anchor_position, callback, up_image, down_image) {
    super();
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
    this.active=true;
    
    
    let x_pad=20;
    let y_pad=20;
    let bounds=this.graphics.font.get_bounds(label,this.monospaced);
    if (position.width==null) position.width=bounds.width+x_pad*2;
    if (position.height==null) position.height=bounds.height+y_pad*2;
    this.inner=new rect((position.width-bounds.width)/2,(position.height-bounds.height)/2,bounds.width,bounds.height);
        this.position = position;  
    this.anchor_position=anchor_position;
    //if(this.anchor_position==null) console.log("OMG!");


    graphics.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this));
    graphics.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this));
    graphics.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this));
    this.callback=callback;
   // this.resize();
  }

  resize(anchor_position){
    this.anchor_position=anchor_position;
  }


  render() {
    if(this.active!=true) return;
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
    if(this.active!=true) return;

    if(this.is_down) return;
    if (this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = true;

    }
  }

  handle_mouse_up(event) {

    if(this.active!=true) return;
    //console.log("Button: IN Clicked");
    if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
      if(this.is_down == true) {
        //console.log("Button: Clicked");
        if(this.callback) {
          this.callback.bind(this.parent)({parent:this.parent,event:event,instance:this});
        }
        this.emit('click', event); // Emit 'click' event
      }
    }
    this.is_down=false;
    //console.log("Button: OUT  Clicked");
    
  }

  handle_mouse_move(event) {
    if(this.active!=true) return;

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
  set_active(active){
    this.active=active;
  }
  delete(){
      // Remove all event listeners
      this.graphics.canvas.removeEventListener('mousedown', this.handle_mouse_down.bind(this));
      this.graphics.canvas.removeEventListener('mouseup', this.handle_mouse_up.bind(this));
      this.graphics.canvas.removeEventListener('mousemove', this.handle_mouse_move.bind(this));

      // Clear other properties
      delete this.parent;
      delete this.graphics;
      delete this.ctx;
      delete this.sprites;
      delete this.up_image;
      delete this.down_image;
      delete this.label;
      delete this.is_down;
      delete this.is_hover;
      delete this.monospaced;
      delete this.centered;
      delete this.active;
      delete this.inner;
      delete this.position;
      delete this.anchor_position;
      delete this.callback;
  }

}
class modal {
    constructor(){
        this.window_manager=null;
        this.parent=null;
        this.graphics = null;
        this.active=false;
        this.events = {}; 
        this.ok=null;
        this.cancel=null;
        this.close=null;
        this.title = null;
        this.text = null;
        this.position = null;
        this.skin=true;
        this.external_render_callback=null;
        this.background=null;
        this.bg_gradient=null;

        this.buttons = [];
        this.images=[];
    }
    
    //default init assignemnt from windo manager
    init(window_manager){
        this.window_manager=window_manager;
        this.graphics=window_manager.graphics;
        this.audio_manager=window_manager.audio_manager;
        this.canvas = this.graphics.canvas;
        this.sprites = this.graphics.sprites;
    }
    add_bg_gradient(percentage,color){
        if (this.bg_gradient==null) this.bg_gradient=[];
        this.bg_gradient.push([percentage,color])
    }

    //opverride this for new layout
    layout2(position, title, text, cancel = false, ok = true,close=false) {
        this.active=true;
        this.ok=ok;
        this.cancel=cancel;
        this.close=close;
        this.title = title;
        this.text = text;
        this.position = position;

    }

    no_skin(){
        this.skin=false;
    }
    
    set_background(background){
        this.background=background;
    }

    add_buttons(){

        // Adjust button positions relative to the internal rectangle
        let mode="center";

        if (this.close) {
            var button_position=new rect(this.position.width-80,-30,42,42);
            this.close = this.create_button("", button_position, null,"window-close-up", "window-close-down");
            this.close.on('click', () => { this.emit('close', { instance: this }); });
        }


        if (this.ok) {
            var button_position=new rect(this.position.left+100,this.position.bottom-60);
            let ok_instance = this.add_button("Ok", button_position, null,"button-up-cyan", "button-down-cyan");
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
    handle_keys(){

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
        //if(this.close!=true && this.close!=null) {
            //this.close.position=new rect(this.position.width-80,-30,42,42);
       // }
        let x_padding=34;
        let y_padding=[30,50] ;
        let y_offset=0;
        if(this.skin==false) {
            x_padding=0;
            y_padding=[0,0];
            y_offset=0;
        }
        this.internal_rect = new rect(
            x_padding,
            y_offset+y_padding[0],
            this.position.width - x_padding*2,
            this.position.height- y_offset - y_padding[0]-y_padding[1],
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
    

    create_button(label, position,callback, up_image, down_image) {
        // Create and setup the new button
        let anchor_position=new rect(0,0,0,0);
        anchor_position.add(this.graphics.viewport.given);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);
        
        let new_button = new button(this,this.graphics, label, position,anchor_position,callback,up_image, down_image);
        new_button.on('click', () => { this.emit('click', { instance: this }); });
        return new_button;
    }


    add_button(label, position,callback, up_image, down_image) {
        let new_button=this.create_button(label, position,callback, up_image, down_image);
        this.buttons.push(new_button);
        return new_button;
    }

    add_image(position, key){
        let image = { position: position, key: key };
        this.images.push(image);
        return image;
    }
    
    del_image(image){
        const index = this.images.findIndex(img => img.key === image.key);
        if (index !== -1) {
            this.images.splice(index, 1);
            return true; // Return true if the image was successfully removed
        }
        return false; // Return false if the image was not found
    }
    render_callback(callback){
        this.external_render_callback=callback;

    }
    handle_key_down(event) {
        if(this.active!=true) return;
        
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
        if (this.active==false) return;
                // Begin the path for the clipping region
        //if you want to do some direct drawing on the canvas... from external of the windo manager

        if (this.skin)this.sprites.slice_9("window",this.render_position);
        let internal=this.internal_rect.clone();

        this.graphics.ctx.save();
        this.graphics.ctx.beginPath();
        this.graphics.ctx.rect(this.render_internal_rect.x,this.render_internal_rect.y,this.render_internal_rect.width,this.render_internal_rect.height);
        this.graphics.ctx.clip(); // Sets the clipping region

        if (this.external_render_callback!=null) this.external_render_callback(this.render_internal_rect);

        //this.sprites.draw_colored_rectangle(this.position,"red");
        //this.sprites.draw_colored_rectangle(internal,"blue");
        // Render buttons
        this.buttons.forEach(button => button.render());
        for(let i=0;i<this.images.length;i++) {
            let image=this.images[i];
            let image_pos=image.position.clone();
            if (this.graphics.viewport.given)
            {
                image_pos.add(this.graphics.viewport.given);
            }
            this.graphics.sprites.render(image.key, image_pos, 1,'none') ;
        }

        // Render text
        if (this.text) {
          this.graphics.font.draw_text(internal,this.text, true, true);
        }
        this.graphics.ctx.restore();
        if (this.skin) {
            //title is the last overlay
            this.sprites.slice_3("window-title",this.render_title_position);
            this.graphics.font.draw_text(this.render_title_position,this.title, true,false);
        }
        if (this.close!=null) this.close.render();
    }

    set_active(active){
        this.active=active;
        this.buttons.forEach(button => button.set_active(active));
        //this.images.forEach(button => button.set_active(active));
    }

    close() {
        if(this.active!=true) return;

        // Close the modal and clean up if necessary
        this.emit('close', { instance: this });
        console.log("Modal: Close Window");
        document.removeEventListener('keydown', this.handle_key_down.bind(this));
    }


    close() {
        //if(this.active != true) return;
    
        // Close the modal and clean up if necessary
        this.emit('close', { instance: this });
        console.log("Modal: Close Window");
    
       this.delete();
    }
    delete(){
        
        // Remove all event listeners
        document.removeEventListener('keydown', this.handle_key_down.bind(this));
        
        // Clear the events object
        this.events = {};
    
        // Delete the objects
        this.buttons.forEach(button=>button.delete());
        delete this.parent;
        delete this.graphics;
        delete this.canvas;
        delete this.sprites;
        delete this.ok;
        delete this.cancel;
        delete this.title;
        delete this.text;
        delete this.position;
        delete this.external_render_callback;
        delete this.buttons;
        delete this.images;
        delete this.images;
        // Set active to false
        this.active = false;
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
            this.given.width = this.frame.width;
            this.given.height = this.frame.height;
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
class window_manager extends events{
    constructor(elements) {
      super();
      this.canvas = document.getElementById(elements.canvasId);
      this.ctx = this.canvas.getContext('2d');

      this.graphics = new graphics(this.canvas, this.ctx); //drawing the main level logic
      this.audio_manager = new audio_manager();
      this.modals = [];
      this.active_modal=null;
      
      this.kb = new key_states();

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

      setInterval(() => {
          this.graphics.recalc_canvas();
          if (this.has_windows() > 0) {
              this.handle_keys();  
              this.resize();
              this.render();
          } 
        },1000 / 24);
    }



    has_windows(){
        if( this.modals.length>0) return true;
        return false;
    }
    add(modal_instance){
      modal_instance.init(this);
      modal_instance.layout();
      this.insert_model(modal_instance);
      
    }


    create_modal(title,text, position,cancel = false, ok = true,close=false) {
      //console.log("Creating Modal");
      const modal_instance = new modal(this,this.graphics, position, title, text, cancel, ok,close);
      return this.insert_model(modal_instance);
    }
    
    insert_model(modal_instance){
      // Listen for the 'close' event to remove the modal
      modal_instance.on('close', () => {
        this.close_modal(modal_instance);
      });
      
      this.modals.forEach(modal=> modal.set_active(false));
      this.modals.push(modal_instance);
      //console.log("Window Manager: Active instance");
      
      this.active_modal=modal_instance
      return modal_instance;
    }
  
    close_modal(modal_instance) {
      //console.log("Window Manager: Close Modal");
      const index = this.modals.indexOf(modal_instance);
      if (index > -1) {
        this.modals.splice(index, 1); // Remove the modal from the array
        // Additional cleanup if necessary
      }
      if(this.modals.length>0) {
        let last_modal= this.modals[this.modals.length - 1];
        last_modal.set_active(true);
        this.active_modal=last_modal;

      }
    }
    handle_keys(){
      if (this.active_modal) {
        this.active_modal.handle_keys(this.kb);
      }
    }
    resize(){
      for(let i=0;i<this.modals.length;i++) this.modals[i].resize();
    }

    render() {

        if (this.active_modal) {
          if (this.active_modal.bg_gradient) {
            var gradient = this.graphics.ctx.createLinearGradient(0, 0, 0, this.graphics.viewport.frame.height);
            for(let i=0;i<this.active_modal.bg_gradient.length;i++) 
              gradient.addColorStop(this.active_modal.bg_gradient[i][0],this.active_modal.bg_gradient[i][1]);
            this.graphics.sprites.clear(gradient,this.graphics.viewport.frame);
          }
    
          if (this.active_modal.background){
              this.graphics.sprites.render(this.active_modal.background,null,this.graphics.viewport.given,1,"contain");
            }
            this.active_modal.render();
        }
        //this.modals.forEach(window => window.render());
    }
  }

  class graphics extends events{

    constructor(canvas=null,ctx=null){
        super();    
        this.canvas=canvas
        this.ctx=ctx;
        this.font=null;
        this.sprites=new sprites(ctx);
        this.sprites.on("complete",this.load_font.bind(this)); // Using arrow function to preserve 
        this.sprites.preload();
        //this.sprites.on_load( this.load_font.bind(this)); // Using arrow function to preserve 'this'
        this.backround=null;
        this.viewport=new viewport(1920,window.innerHeight);
        this.frame_background_color='#222';
        this.background_color='#000000';

    }
    load_font(){
        let font=new sprite_font(this.ctx,this.sprites, "grey_font");
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
class menu extends modal{
    constructor(){
        super();
        


    }
    layout(){
        //window specifics
        this.set_background("menu");
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="Menu";
        this.text="";
        this.active=true;
        let x=20;
        let y=30;
        let window_width=400;
        let window_height=600;
        
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
        
        //layout options
        
        this.add_bg_gradient(0, 'black');
        this.add_bg_gradient(.7, 'lightgrey');
        this.add_bg_gradient(.8, 'darkgrey');
        this.add_bg_gradient(1, 'black');


        let w=this.graphics.viewport.given.width;
        let button_spacing = 80,button_width=this.internal_rect.width-x*2;
        let button_position1=new rect(x,y,button_width,null,"left","top");
        let button_position2=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position3=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position4=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position5=new rect(x,this.internal_rect.height-110,button_width,null,"left","top");
        let button_position6=new rect(w/2-200,10,1024,236,"left","top");
        
        this.add_image(button_position6,"title");
        this.add_button("New Game",button_position1,this.new_game, "button-up-cyan", "button-down-cyan");
        this.add_button("Story So Far", button_position2,this.story, "button-up-cyan", "button-down-cyan");
        this.add_button("High Scores", button_position3,this.high_scoress, "button-up-cyan", "button-down-cyan");
        this.add_button("Credits", button_position4,this.credits,"button-up-cyan", "button-down-cyan");
        this.add_button("Exit", button_position5,this.exit, "button-up-red", "button-down-red");


    }


    exit(event ){
        alert("I can't realy close the window...\n But I'd like to!\n Thanks for playin\n -Chris");
    }

    credits(event) {
        let modal=new credits();
        this.window_manager.add(modal)
    }

    high_scoress(event) {
        let modal=new high_scores();
        this.window_manager.add(modal)
    }

    story(event) {
        let modal=new prologue();
        this.window_manager.add(modal)
    }

    new_game(){
        let modal=new game();
        this.window_manager.add(modal)
    }


}class motion{
    constructor(x,y,width,height,mass,rotation){

        this.mass = mass;
        this.damping_factor = 0.1; // acceleration slow down
        this.velocity_loss = 1 ; // momentum slow down
        this.rotation = rotation;
        this.position = new rect(x, y,width,height);
        this.acceleration =new point(0,0);
        this.velocity =new point(0,0);
        this.IMMOVABLE_MASS = 10000;
        this.bounce_factor=1.2;
        this.old_state={};

    }

    save_state(){
        this.old_state['mass']=this.mass;
        this.old_state['damping_factor']=this.damping_factor;
        this.old_state['velocity_loss']=this.velocity_loss;
        this.old_state['rotation']=this.rotation;
        this.old_state['position']=this.position;
        this.old_state['acceleration']=this.acceleration;
        this.old_state['velocity']=this.velocity;
        this.old_state['IMMOVABLE_MASS']=this.IMMOVABLE_MASS;
        this.old_state['bounce_factor']=this.bounce_factor;
    }
    
    restore_state(){
        this.mass=this.old_state['mass'];
        this.damping_factor=this.old_state['damping_factor'];
        this.velocity_loss=this.old_state['velocity_loss'];
        this.rotation=this.old_state['rotation'];
        this.position=this.old_state['position'];
        this.acceleration=this.old_state['acceleration'];
        this.velocity=this.old_state['velocity'];
        this.IMMOVABLE_MASS=this.old_state['IMMOVABLE_MASS'];
        this.bounce_factor=this.old_state['bounce_factor'];
    }

    update_position(delta_time){
        this.position.x += this.velocity.x * delta_time;
        this.position.y += this.velocity.y * delta_time;
    }

    update_accelleration(delta_time){
        //slows down ho much gas we're trying giveing it

        this.acceleration.x -= this.acceleration.x * this.damping_factor;
        this.acceleration.y -= this.acceleration.y * this.damping_factor;
    }

    update_velocity(delta_time){
        //add to travel speed
        this.velocity.x += this.acceleration.x * delta_time;
        this.velocity.y += this.acceleration.y * delta_time;
        // friction
        if(this.velocity_loss!=1){
            if (this.velocity.x != 0) {
                this.velocity.x *= this.velocity_loss;
            }
            if (this.velocity.y != 0) {
                this.velocity.y *= this.velocity_loss;
            }
        }
    }

    update_motion(delta_time){
        if (delta_time != 0) {
            // we dont know if there will be a collision.. save everything if we need to recalc.
            this.save_state();
            this.update_accelleration(delta_time);
            this.update_velocity(delta_time);
            this.update_position(delta_time);
        }
    }


    async accelerate_object(direction, speed) {
        direction %= 360;

        var rotationInRadians = direction * Math.PI / 180;
        var ax = Math.sin(rotationInRadians) * this.mass * speed;
        var ay = -Math.cos(rotationInRadians) * this.mass * speed;

        this.acceleration.x += ax;
        this.acceleration.y += ay;
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

    collision_distance(otherObject) {
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
            return {x:combinedWidth-distanceX,y:combinedHeight-distanceY}
        }
        // No collision
        return false;
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

    impact2(otherObject) {
        let v1 = this.velocity;
        let v2 = otherObject.velocity;
        let m1 = this.mass;
        let m2 = otherObject.mass;
    
        // Check if either object is immovable
        let immovable1 = this.mass==10000; //
        let immovable2 = otherObject.mass==10000;
    
        // Calculate final velocities only if objects are movable
        if (!immovable1) {
            let final_v1x = immovable2 ? v1.x : (v1.x*(m1 - m2) + 2*m2*v2.x) / (m1 + m2);
            let final_v1y = immovable2 ? v1.y : (v1.y*(m1 - m2) + 2*m2*v2.y) / (m1 + m2);
            this.velocity.x = final_v1x;
            this.velocity.y = final_v1y;
        }
        
        if (!immovable2) {
            let final_v2x = immovable1 ? v2.x : (v2.x*(m2 - m1) + 2*m1*v1.x) / (m1 + m2);
            let final_v2y = immovable1 ? v2.y : (v2.y*(m2 - m1) + 2*m1*v1.y) / (m1 + m2);
            otherObject.velocity.x = final_v2x;
            otherObject.velocity.y = final_v2y;
        }
    }
    impact(otherObject) {
        let v1=this.velocity;
        let v2=otherObject.velocity;
        let m1=this.mass;
        let m2=otherObject.mass;
        if(this.mass!=10000) {
            let final_v1x = (v1.x*(m1 - m2) + 2*m2*v2.x) / (m1 + m2)
            let final_v1y = (v1.y*(m1 - m2) + 2*m2*v2.y) / (m1 + m2)
            this.velocity.x=final_v1x;
            this.velocity.y=final_v1y;
        }
        if(otherObject.mass!=10000) {
            let final_v2x = (v2.x*(m2 - m1) + 2*m1*v1.x) / (m1 + m2)
            let final_v2y = (v2.y*(m2 - m1) + 2*m1*v1.y) / (m1 + m2)
            otherObject.velocity.x=final_v2x;
            otherObject.velocity.y=final_v2y;
        }
        
    }

    adjustAccelerationDirection(object, collisionAngle, away = true) {
        // Calculate the current magnitude of the object's acceleration
        let accelerationMagnitude = Math.sqrt(object.acceleration.x ** 2 + object.acceleration.y ** 2);
        
        // Determine the new direction of the acceleration: away from or towards the collision point
        let newDirectionAngle = away ? collisionAngle + Math.PI : collisionAngle;
        
        // Adjust the object's acceleration vector
        object.acceleration.x = Math.cos(newDirectionAngle) * accelerationMagnitude;
        object.acceleration.y = Math.sin(newDirectionAngle) * accelerationMagnitude;
    }
    

}class game_object extends motion {

    static  uuid_generator = (function*() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let counter = 0;
        
        while (true) {
          let id = '';
          let currentCounter = counter;
      
          // Ensure the counter does not exceed the total number of unique combinations
          if (currentCounter >= Math.pow(chars.length, 4)) {
            throw new Error('ID space exhausted');
          }
      
          for (let i = 0; i < 4; i++) {
            id = chars[currentCounter % chars.length] + id;
            currentCounter = Math.floor(currentCounter / chars.length);
          }
          
          yield id;
          counter++;
        }
      })();


    constructor(window_manager, x = 0, y = 0, width = 64, height = 64, mass = 100, rotation = 0, rotation_speed = 4)  {
        super(x,y,width,height,mass,rotation);
        this.window_manager=window_manager;
        this.audio_manager=window_manager.audio_manager;
        this.graphics = window_manager.graphics;
        this.type = "block";
        this.sounds = { };
        this.width = width;
        this.height = height;
        this.rotation_speed = rotation_speed;
        this.img = null;
        this.image_frame = 0;
        this.image_frames = 1;
        this.image_rotation = 0;  //rotate the image seperate from the acceleration factor... for images made in diff directions
        this.anchor_points = []
        this.top_level = true;
        this.created = Date.now();
        this.expires = null;
        this.action_list = null;
        this.action_position = { frame: 0, row: 0 };
        this.destroy_object = false;
        this.loop_done = false;
        this.loop = true;
        this.center = { x: 0, y: 0 };
        this.life = 100;
        this.max_life = 100;
        this.visible = true;
        this.explosions=[];
        this.old_acceleration=null;
        this.old_velocity=null;
        this.old_position=null;

        this.id=game_object.uuid_generator.next().value;
    }

    set_rotation_speed(speed){
        this.rotation_speed=speed;
    }
    set_rotation(rotation){
        this.rotation=rotation;
    }

    play(sound_name,single=false) {
        sound_name=this.type+sound_name;
        if( sound_name in this.sounds) {
            if (single==true && this.audio_manager.is_playing(sound_name)) return;
            this.audio_manager.play(sound_name);
        }
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
        console.log("DEstory THIS!");

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
        this.img=img_URL;
        this.graphics.sprites.add(img_URL);
    }

    image_rotate(rotation) {
        this.image_rotation = rotation
    }


    set_sound(action, sound_URL) {
        //cache this to save the some ChannelSplitterNode.apply. early  optimization bites you in the ass
        this.sounds[this.type+action]=sound_URL;
        this.audio_manager.add(this.type+action, sound_URL);

    }


    async bank_left() {
        this.rotation -= this.rotation_speed;
        if (this.rotation < 0)
            this.rotation += 360;
        
        
        this.play("bank_left",true);
    }

    async bank_right() {
        this.rotation += this.rotation_speed;
        this.rotation %= 360;
        this.play("bank_right",true);

    }

    async accelerate(speed = null) {
        this.play("accel",true);
        speed = speed ?? 10;
        this.accelerate_object(this.rotation, speed);
    }

    async decelerate(speed = null) {
        this.play("decel",true);
        speed = speed ?? 10;
        this.accelerate_object(this.rotation + 180, speed);
    }

    async strafe_left(speed = null) {
        speed = speed ?? 10;
        this.accelerate_object(this.rotation + 270, speed);
        this.play("bank_left",true);

    }

    async strafe_right(speed = null) {
        speed = speed ?? 10;
        this.play("bank_right",true);
        this.accelerate_object(this.rotation + 90, speed);

    }

    async rotate(rotation) {
        this.rotation = rotation;
    }
    restore_last_position(){
        this.acceleration=this.old_acceleration;
        this.velocity=this.old_velocity;
        this.position=this.old_position;
    }

    update_frame(deltaTime) {
        this.update_motion(deltaTime);
        if (this.visible == false) return;
        if (this.image_frames > 1) {

            if (this.loop == false && this.image_frame >= this.image_frames - 1) {
                this.loop_done = true;
            }

            this.image_frame++;
            this.image_frame %= this.image_frames;
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
        
        let src= new rect(sourceX, sourceY, sourceWidth, sourceHeight);
        let dest=new rect(-this.center.x * scale, -this.center.y * scale, dest_width, dest_height);
        this.graphics.sprites.render(this.img,src,dest,1,'none'); 
        

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
                //console.log("Accel: "+this.type+" "+action.speed);
                await this.accelerate(action.speed);
                
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
        let exp = new Explosion(this.window_manager, 0,0,this.play_sounds,this.volume);
        this.explosions.push(exp);
    }

}


class Explosion extends game_object {
    constructor(window_manager,x, y) {
                super(window_manager,x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10);      
        this.set_image('static/explosion/exp_9_128x128_35frames_strip35.png',128,35);
        this.set_center(64,64);
        this.set_type("explosion");
        this.set_loop(false);
        //this.set_sound("destroy","static/explosion/sfx_exp_shortest_soft9.wav");
    }

            
}

class Derbis extends game_object {
    constructor(window_manager,x, y, type) {
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
                super(window_manager,x, y,64,64,
                    2,                    // mass
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
                super(window_manager,x, y,64,64,
                    1,                    // mass
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
                super(window_manager,x, y,64,64,
                    2,                    // mass
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
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/webex2.png');
                this.set_type("webex");
                this.action_list = default_action;
                break;
            case 'block':
                super(window_manager,x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('static/blocks/block.png');
        
                this.set_type("block");
        }
        this.rotation = 180;

    } // end
}





class Projectile extends game_object {
    constructor(window_manager, x, y, rotation, type, sounds = false) {
        let actions = [];
        switch (type) {
            case 'lazer':
                actions = [
                    { type: "accelerate", frames: 1 }
                ];
                super(window_manager, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P3.png', 16, 4, 270);
                this.set_velocity_loss_off();
                this.set_center(8, 8);
                this.expire(5);
                this.set_type("laser");
                this.action_list=actions;

                break;

            case 'bolt1':
                super(window_manager, x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P1.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 5 }
                ];
                this.action_list=actions;
                break;
            case 'bolt2':
                super(window_manager, x, y, 16, 16,
                    200,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P2.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 5 }
                ];
                this.action_list=actions;
                break;
            case 'bolt3':
                super(window_manager, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P3.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 10 }
                ];
                //this.action_list=actions;

                break;
            case 'bolt4':
                super(window_manager, x, y, 16, 16,
                    100,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('static/projectiles/P4.png', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 10 }
                ];
                this.action_list=actions;
                break;


            case 'thruster':
                super(window_manager, x, y, 16, 16,
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
                super(window_manager, x, y, 32, 64,
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


class Ship extends game_object {

    constructor(window_manager, x, y, type) {
        super(window_manager, x, y, 128, 153,
            1,                    // mass
            0,                      // rotation
            8);                     // ropration speed
        
        this.boost_fire_control = new fire_control(1);
        this.laser_fire_control = new fire_control(5);
        this.missile_fire_control = new fire_control(10);
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        this.bolt_type=null;
        this.missile_type=null;
        let speed=5+.5 + Math.random() * 4;

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
                this.booster = new Projectile(window_manager, +0, 100, 0, "booster");
                this.thrusters.push(this.booster);
                var thruster1 = new Projectile(window_manager, +30, 75, 0, "thruster");
                this.thrusters.push(thruster1);
                var thruster2 = new Projectile(window_manager, -30, 75, 0, "thruster");
                this.thrusters.push(thruster2);
                this.bolt_type="bolt3";
                this.missile_type="bolt4";
                break;

            case 'teams':
                this.set_type("ship");
                //this.set_sound("left", 'static/audio/ship/static.mp3')
                //this.set_sound("right", 'static/audio/ship/static.mp3')
                //this.set_sound("accel", 'static/audio/ship/static.mp3')
                //this.set_sound("decel", 'static/audio/ship/static.mp3')
                //this.set_sound("lazer", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/teams.png',64,1,270);

                //this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_rotation(270);
                this.set_center(64, 64);
                this.set_rotation_speed(10);
                this.bolt_type="bolt2";
                this.missile_type="bolt3";
                let frames=Math.random()*15+10;
                let actions = [
                    { type: "bank_right", frames: 9,  },
                    { type: "accelerate", frames: frames ,speed:speed},
                    { type: "lazer",frames: 1, speed: 5},
                    { type: "bank_left", frames: 15,  },
                    { type: "accelerate", frames: 6, speed:5},
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
            this.accelerate(100);
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
            var projectile = new Projectile(this.window_manager,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, this.bolt_type);
            projectile.set_velocity(this.velocity);
            projectile.accelerate(5);
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, this.bolt_type);
            projectile.set_velocity(this.velocity);
            projectile.accelerate(5);
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
            var projectile = new Projectile(this.window_manager,this.position.x + missle1.x, this.position.y + missle1.y, this.rotation, this.missile_type);
            projectile.set_velocity(this.velocity);
            projectile.accelerate(2);
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
        super.de_orient()
    }
    async executeAction(action) {
       super.executeAction(action);
       switch(action.type){
        case 'lazer': this.fire_lazer(); break;
       }
    }

}//end ship class




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
class level extends events{
    constructor(window_manager){
        super();
        //this.level_url='https://aijobwars.com/static/levels/level.json';
        this.position = { x: 0, y: 0, width: 0, height: 0 }
        this.window_manager=window_manager;
        this.npc = [];
        this.explosions = [];
        this.projectiles =[];
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
                            case 'P': this.spaceship = new Ship(this.window_manager,x,y, "user"); block=this.spaceship; break;
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
}class ui{
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

   

}class help extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="Credits";
        let window_width=1024;
        let window_height=700;
        let x=(graphics.viewport.given.width-window_width)/2;
        let y=(graphics.viewport.given.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");


        this.text = "| Key           | Action                 |\n" +
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

            this.resize();
            this.add_buttons();
    }


}class prologue extends modal{

    layout(){
        this.ok=false
        this.cancel=false
        this.close=true;
        this.title="Prologue";
        this.text="";
        this.active=true;
        
        let window_width=800;
        let window_height=600;
        let x=(this.graphics.viewport.given.width-window_width)/2;
        let y=(this.graphics.viewport.given.height-window_height)/2;

        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();

        this.player= new scene(this.window_manager,"static/storyboard/intro/intro_scene.json");
        //this.on("close",()=>{ this.player.close(); })
        this.render_callback(this.player.update_frame.bind(this.player));
    }

    render(){
        super.render();
    }

}class high_scores extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="High Scores";
        this.text="";
        let window_width=800;
        let window_height=600;
        let x=(this.graphics.viewport.given.width-window_width)/2;
        let y=(this.graphics.viewport.given.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
        this.high_scores=null;
        this.load_high_scores("static/json/highscores.json");
        

    }

    async load_high_scores(){
        try {
                const response = await fetch(jsonFileUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.high_scores=data;
        } catch (error) {
            console.error("Error loading the JSON file:", error);
        }
     }

    

    
}class credits extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="Credits";
        this.text="";
        let window_width=800;
        let window_height=800;
        let x=(this.graphics.viewport.given.width-window_width)/2;
        let y=(this.graphics.viewport.given.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();

        this.player= new scene(this.window_manager,"static/storyboard/credits/credits.json");
        this.on("close",()=>{ this.player.close(); })
        this.render_callback(this.player.update_frame.bind(this.player));
    }
    

    //render(){
    //    super.render();
    //}

}

class percentage_bar {
    constructor(window_manager,overlay_position,underlay_position, overlay,underlay) {
        this.graphics=window_manager.graphics;
        this.overlay_position=overlay_position;
        this.underlay_position=underlay_position;
        this.underlay=underlay;
        this.overlay=overlay;
    }
    
    render(percentage){
        let percentage_width=parseInt((this.underlay_position.width*percentage)/100);
        if (percentage_width!=0) {
        let render_percentage= new rect(this.underlay_position.x,this.underlay_position.y,percentage_width,this.underlay_position.height);
        //this.graphics.sprites.slice_3(this.underlay,render_percentage);
            this.graphics.sprites.render(this.underlay,null, render_percentage,1,"none");
        }
        this.graphics.sprites.slice_3(this.overlay,this.overlay_position);
        //this.graphics.sprites.render(this.underlay,null, this.underlay_position,1,"none");
        //this.graphics.sprites.render(this.overlay,null, this.overlay_position,1,"none");
    }

    render2(percentage) {
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
}



class percentage_bar_fluid extends percentage_bar{
    constructor(window_manager,position, overlay,underlay) {    
        let overlay_sprite=window_manager.graphics.sprites.get(overlay);
        let underlay_sprite=window_manager.graphics.sprites.get(underlay);

        let scale=overlay_sprite.position.get_scale(position);
        let scaled_underlay=underlay_sprite.position.clone();
        scaled_underlay.x=20;
        scaled_underlay.y=9;
        scaled_underlay.set_scale(scale);
        scaled_underlay.add(position)

        // Calculate the position of the underlay based on the scaled overlay
        
        super(window_manager,position,scaled_underlay,overlay,underlay);
    }
}
class pause extends modal{
    layout(){
        this.active=true;
        this.ok=true;
        this.cancel=false;
        this.close=true;
        this.title="Paused";
        this.text="";
        let window_width=800;
        let window_height=600;
        
        let x=(graphics.viewport.given.width-window_width)/2;
        let y=(graphics.viewport.given.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
    }

    //render(){
    //    super.render();
    //}

}class scene {
    constructor(window_manager,scene_url) {
        this.graphics = window_manager.graphics;
        this.audio_manager = window_manager.audio_manager;
        this.scene_url = scene_url; // Updated variable name
        this.scene_data = null;
        this.audio = new Audio();
        this.start_time=null;
        this.current_img=null;
        this.playing=null;
        this.load_scene_data(this.scene_url);
    }

    async load_scene_data(scene_url) { // Updated parameter name
        let data= await fetch(scene_url) // Updated variable reference
            .then(
                response => response.json()
                )
            .then(data => {
                // Assign the parsed JSON data to a variable
                const sceneData = data;
                // You can perform further operations with the sceneData variable if needed
                return sceneData;
            });                
        this.scene_data=data;
        for(let i=0;i<this.scene_data.length;i++){
            this.load_slide(this.scene_data[i]); 
        }
        console.log("try");
        try {
            this.graphics.sprites.on_load(this.play_scene.bind(this));
        } catch (Exception) {
            console.log("ON LOAD");
            console.log(Exception);
            // Handle the exception here
        }
    }

    play_scene() {
        this.playing=true;
        console.log("Playing Scene");
    }

    get_objects_in_time() {
        const objectsToShow = [];
        const properties = ['images', 'audio', 'text'];
    
        this.elapsed = Date.now() - this.start_time;
    
        for (let property of properties) {
    
            for (let i = 0; i < this.scene_data.length; i++) {

                const slide = this.scene_data[i];
                if (!(property in slide)) continue; // Skip the loop if property doesn't exist in the scene_data
                for (let j = 0; j < slide[property].length; j++) {
                    let object = slide[property][j];
                    let timestamp = object.timestamp * 1000;
                    let duration = (object.timestamp+object.duration) * 1000;
                    if(object.duration==0) duration+=9999999;
    
                    if (this.elapsed>=timestamp &&  this.elapsed<=duration) {
                        objectsToShow.unshift({
                            data: object,
                            type:property,
                            timestamp: timestamp
                        });
                    }
                }
            }
        }
    
        return objectsToShow;
    }

    
    update_frame(position) {
        if (!this.playing || !this.scene_data) return;
        if(this.start_time==null) {
            this.start_time=Date.now();
        }

        let objects=this.get_objects_in_time();
    
        
        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='images') {
                let current_img = object.data.path;
                this.graphics.sprites.render(current_img, null, position, 1, "fill");
            }

        }

        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='audio') {
                if (this.audio_manager.is_playing(object.data.path) == false) {
                    this.audio_manager.play(object.data.path);
                }
            }
        }
        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='text') {

                let text_position=new rect(position.x+position.width/2,position.y+position.height/4,null,null,"center","center");
                let bounds=this.graphics.font.get_bounds(object.data.text,false);
                var line_count = (object.data.text.match(/\n/g) || []).length+1;

                bounds.width=position.width;
                bounds.height=this.graphics.font.mono_char_height*line_count+30;
                bounds.x=position.x+0;
                bounds.y=text_position.y-bounds.height/2;
                let current_position=this.elapsed-object.timestamp;
                let percentage=current_position/(object.data.duration*1000);
                let brightness=0;
                if(percentage<=0.5) brightness=.3+1.6*percentage;
                else  brightness=1.7-1.6*(percentage);
                this.graphics.sprites.draw_rect(bounds,"rgba(22, 22, 22, "+brightness+")");

                this.graphics.font.draw_text(text_position, object.data.text,true,false);

                
            }
        }


    }

    
    
    load_slide(slide) {
        
        //add all the images for this slide
        for(let i=0;i<slide.images.length;i++) {
            this.graphics.sprites.add(slide.images[i].path);
        }

        //add all the images for this slide
        for(let i=0;i<slide.audio.length;i++) {
            this.audio_manager.add(slide.audio[i].path);
        }
    }

    play_audio(audioPath, timestamp) {
        this.audio.src = audioPath;
        this.audio.currentTime = timestamp;
        this.audio.play();
    }
    close(){
        this.playing=false;
        //stop all audio playback
        for (let i = 0; i < this.scene_data.length; i++) {
            const slide = this.scene_data[i];
            for (let j = 0; j < slide.audio.length; j++) {
                const audio = slide.audio[j];
                this.audio_manager.stop(audio.path);
            }
        }
    }
}
class game extends modal{
    layout(){
        this.active=true;
        this.ok=false
        this.cancel=false
        this.close=true;
        this.title="Level - 1";
        this.text="";
        this.resize();
        this.add_buttons();
        this.no_skin();


        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.boss_mode_activated = false;
        this.pause_game = false;
        
        this.ui = new ui(this.ctx, this);
        this.level = new level(this.window_manager);
        this.level.load('https://aijobwars.com/static/levels/level.json');
        this.level.on("loaded",this.start_level.bind(this));

        this.laser_bar   = new percentage_bar_fluid(this.window_manager, new rect(10, 10+1*50, 200, 40), "bar","bar-red-fluid");
        this.missile_bar = new percentage_bar_fluid(this.window_manager, new rect(30, 10+2*50, 200, 40), "bar","bar-orange-fluid");
        this.booster_bar = new percentage_bar_fluid(this.window_manager, new rect(30, 10+3*50, 200, 40), "bar","bar-blue-fluid");
        this.health_bar  = new percentage_bar_fluid(this.window_manager, new rect(10, 10+4*50, 200, 40), "bar","bar-green-fluid");
        
        //this.laser_timeout =  new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        //this.missile_timeout =  new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        //this.booster_timeout = new percentage_bar_fluid(this.window_manager, new rect(10, 10, 200, 40), "bar","bar-red-fluid");
        this.render_callback(this.updateFrame);

    }

    resize(){
        let x=0;//this.graphics.viewport.given.x;
        let y=this.graphics.viewport.given.y;
        let window_width=this.graphics.viewport.given.width;;
        let window_height=this.graphics.viewport.given.height;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        super.resize();
    }




    // Function to update canvas size and draw the background image
    single_collsion(obj2,j=0){
        let window = { y1: this.level.position.y, y2: this.level.position.y + this.graphics.viewport.virtual.height }
        let collisions=[];
        for (let i = j; i < this.level.npc.length; i++) {
            const obj1 = this.level.npc[i];
            if (obj1.position.y < window.y1 || obj1.position.y > window.y2) continue;
            if (obj2.position.y < window.y1 || obj2.position.y > window.y2) continue;
            if (obj1 == obj2) continue; //wtf and why.. fix this bullshittery

                if (obj1.check_collision(obj2)) {
                    collisions.push([obj1,obj2]);
                    
                }
            }
            return collisions;
    }



    check_collisions() {
        let collisions=[];
        /*for (let i = 0; i < this.level.npc.length; i++) {
            const obj1 = this.level.npc[i];
            let collision=this.single_collsion(obj1,i+1);
            if(collision.length>0) {
                collisions.push(...collision);
            }
        }*/

        /*

        for (let i = 0; i < this.level.npc.length; i++) {
            for(let e=0;e<this.level.npc[e].projectiles;e++){
                let obj1 = this.level.npc[e].projectiles[e];
                this.single_collsion(obj1);
            }
        }
        
        for(let i=0;i<this.level.spaceship.projectiles;i++){
            let obj1 = this.level.spaceship.projectiles[i];
            this.single_collsion(obj1);
        }
        */
        let obj1 = this.level.spaceship;
        let collision=this.single_collsion(obj1);
        if(collision.length>0) {
            collisions.push(...collision);
        }

        // ok we have all objects intersecting... lets do a single IMPACT.. 
        // and for those that are still intersecting.. 
        // we will loop until the thing is nolonger intersecting
        if (collisions.length>0) console.log("IN Collision");
        let deltaTime=10/24;
        for( let i=0;i<collisions.length;i++){
            let is_it_colliding  = collisions[i][0].check_collision(collisions[i][1]);
            if (is_it_colliding==false) continue; 
                
            collisions[i][0].impact(collisions[i][1]);
            let colliding = false;
            for (let o = 0; o < 100000 && colliding; o++) {
                collisions[i][0].update_position(deltaTime);
                collisions[i][1].update_position(deltaTime);
                colliding = collisions[i][0].check_collision(collisions[i][1]);
                console.log("Pushing awaay");
            }
        }
        
    }


    updateFrame() {
        //this.events.handle_keys();

        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // Clear any previous drawings
        //this.graphics.updateCanvasSizeAndDrawImage(this.level.position);
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

        this.level.npc = this.level.npc.filter(npc => !npc.destroy_object);


        // looks like we are just updating things that are not in the viewport...
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
                npc.update_motion(deltaTime);

                let collisions=this.single_collsion(npc,b+1);
                if(collisions.length!=0) {
                    npc.restore_state();
                    for(let c=0;c<collisions.length;c++){
                        npc.impact(collisions[c][0]);
                        npc.update_motion(deltaTime)
                
                    }
                }
            }
        }



        //render
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {

                if (npc.type == "ship") {
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
        let percentage3 = this.level.spaceship.missile_fire_control.get_cooldown_percentage();
        this.missile_bar.render(percentage3);
        let percentage5 = this.level.spaceship.get_life_percentage();
        this.health_bar.render(percentage5);
        let percentage6 = this.level.spaceship.boost_fire_control.get_cooldown_percentage();
        this.booster_bar.render(percentage6);
        /*
        let percentage2 = this.level.spaceship.laser_fire_control.timeout_percentage();
        this.laser_timeout.render(percentage2);

        let percentage4 = this.level.spaceship.missile_fire_control.timeout_percentage();
        this.missile_timeout.render(percentage4);



        let percentage7 = this.level.spaceship.boost_fire_control.timeout_percentage();
        this.booster_timeout.render(percentage7);

*/
        //this.check_collisions();
        //if(this.level.spaceship!=null) {
        //    this.level.spaceship.update_frame(deltaTime);
        //    this.level.spaceship.render({ x: 0, y: window.y1 });
        //}
    }



    start_level() {
        this.level_start = true;
        if (this.track1Sound != null && this.play_sounds) {
            this.track1Sound.play();
        }
    }


    handle_keys(kb) {
        if (this.active==false) return;
        if (this.level_start == true) {
            // In your game loop, check keysPressed object to determine actions
            if (kb.is_pressed('ArrowLeft')) this.level.spaceship.bank_left();
            if (kb.is_pressed('ArrowRight')) this.level.spaceship.bank_right();
            if (kb.is_pressed('ArrowUp')) this.level.spaceship.accelerate();
            if (kb.is_pressed('ArrowDown')) this.level.spaceship.decelerate();
            if (kb.is_pressed(' ')) this.level.spaceship.fire_lazer();
            if (kb.just_stopped(' ')) this.level.spaceship.stop_firing_lazer();
            if (kb.just_stopped('Enter')) this.level.spaceship.fire_missle();
            if (kb.is_pressed('a') || kb.is_pressed('A')) this.level.spaceship.strafe_left(50);
            if (kb.is_pressed('d') || kb.is_pressed('D')) this.level.spaceship.strafe_right(50);
            if (kb.is_pressed('w') || kb.is_pressed('W')) 
            this.level.spaceship.accelerate(50);
            if (kb.is_pressed('s') || kb.is_pressed('S')) this.level.spaceship.decelerate(50);
            //if (kb.is_pressed('Escape')) this.G.level.spaceship.pause();

            if (kb.is_pressed('Shift')) this.level.spaceship.boost();
            
            if (kb.just_stopped('Shift')) this.level.spaceship.stop_boost();
            if (kb.just_stopped('+')) this.level.volume(+1);
            if (kb.just_stopped('-')) this.level.volume(-1);
            /*
            if (kb.just_stopped('ArrowLeft')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowRight')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowUp')) this.audio_manager.sound_off();
            if (kb.just_stopped('ArrowDown')) this.audio_manager.sound_off();
*/
            if (kb.just_stopped('h') ||kb.just_stopped('H')) this.help();

            if (kb.just_stopped('m') || kb.just_stopped('M')) this.ui.toggle_sound();

        }

/*
        if (kb.just_stopped('Escape')) {

            if (this.G.boss_mode_activated) this.G.ui.boss_mode_off();
            else if (kb.ctrl()) this.G.ui.boss_mode_on();

            else if (this.G.pause_game == true) this.G.ui.unpause();
            else this.G.ui.pause();
            
        }
  */
    } 
}function dialog() {
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
  });