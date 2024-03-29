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
  });class sprite_font {
    constructor(ctx, image_path) {
        this.ctx = ctx;
        this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]|`\\/@" + "°+=*$£€<>";
        this.image = new Image();
        this.image.src = image_path;
        this.image.crossOrigin = 'anonymous'; // Set CORS policy

        this.mono_char_width = 22;
        this.mono_char_height = 27;
        this.char_width = 46;
        this.char_height = 43;
        this.chars_per_row = 5;
        this.char_data = [];
        this.image.onload = () => {
            this.calculate_char_data();
        };
    }

    calculate_char_data() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const sx = (i % this.chars_per_row) * this.char_width;
            const sy = Math.floor(i / this.chars_per_row) * this.char_height; // Fixed typo: replaced 'o' with 'i'
            const char_bounds = this.get_character_bounds(ctx, sx, sy);
            let baseline = this.char_height; // Default baseline at the bottom



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

    get_character_bounds(ctx, sx, sy) {
        const image_data = ctx.getImageData(sx, sy, this.char_width, this.char_height);
        let left = this.char_width;
        let top = this.char_height;
        let right = 0;
        let bottom = 0;

        for (let y = 0; y < this.char_height; y++) {
            for (let x = 0; x < this.char_width; x++) {
                const alpha = image_data.data[(y * this.char_width + x) * 4 + 3];
                if (alpha !== 0) {
                    left = Math.min(left, x);
                    top = Math.min(top, y);
                    right = Math.max(right, x);
                    bottom = Math.max(bottom, y);
                }
            }
        }

        return { left, top, right, bottom };
    }

    get_character(char) {
        return this.char_data.find(char_data => char_data.character === char);
    }

    get_bounds(text,monospace=false){
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
            else x += char_data.width;
        }
        if (y==0)y=this.mono_char_height;
        max_x=Math.max(max_x, x);

        return {x:max_x,y:y};
    }
    draw_text(x, y, text,centered=false,monospace=false) {
        //var bounds=this.get_bounds(text);

        let lines=text.split("\n");
        for (let line in lines){
            this.draw_single_text(x,y,lines[line],centered,monospace);
            y+=this.mono_char_height;
        }

    }
    draw_single_text(x, y, text,centered=false,monospace=false) {
        if (!this.chars_per_row) {
            console.error("Image not loaded");
            return;
        }

        let pos_x = x,padding=0;
        if(centered){
            let bounds=this.get_bounds(text,monospace);
            pos_x-=bounds.x/2;
            y-=bounds.y/2;
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
            if(monospace) padding=(this.mono_char_width-char_data.stride)/2;
            this.ctx.drawImage(
                this.image,
                char_data.left,
                char_data.top,
                char_data.width,
                char_data.height,
                pos_x+padding,
                y + char_data.baseline,
                char_data.width,
                char_data.height
            );
            if(monospace) pos_x+=this.mono_char_width;
            else 
            pos_x += char_data.width;
            padding=0;
        }
    }
}
class sprites {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprites = {};
        this.add("window", "static/UI/UI1.png", 67, 67, 565, 332);
        this.add("window-title", "static/UI/UI1.png", 162-10, 411-10, 372+10*2, 68+10*2);
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
    }

    add(key, imagePath, x, y, width, height) {
        const img = new Image();
        img.src = imagePath;

        this.sprites[key] = {
            image: img,
            url: imagePath,
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    //dest is a x,y,width,height
    render(key, dest, intensity = 1) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
        // Save the current global alpha value
        const originalAlpha = this.ctx.globalAlpha;

        // Set a lower alpha value (e.g., 0.5 for 50% transparency)
        this.ctx.globalAlpha = intensity;

        // Draw the image with the adjusted transparency
        this.ctx.drawImage(s.image, s.x, s.y, s.width, s.height, dest.x, dest.y, s.width, s.height);

        // Restore the original global alpha value
        this.ctx.globalAlpha = originalAlpha;

    }

    slice_9(key, dest) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
    
        let x_margin = 90;
        let y_margin = 90;
    
        let source_outer = new rect(s.x, s.y, s.width, s.height);
        let source_inner = new rect(s.x + x_margin, s.y + y_margin, s.width - x_margin * 2, s.height - y_margin * 2);
    
        let dest_outer = new rect(dest.x, dest.y, dest.width, dest.height);
        let dest_inner = new rect(dest.x + x_margin-2, dest.y + y_margin, dest.width - (x_margin )* 2+2, dest.height - y_margin * 2);
    
        // Assuming grid class and rect class are properly defined and instantiated
        let source_grid = new grid( source_outer,source_inner,9);
        let dest_grid = new grid(dest_outer,dest_inner,9);
    
        // Draw each quadrant
        for(let index=0;index<9;index++){
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
            if ([0,2,6,8].includes(index)) { // Corners
                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
            } 
            if ([ 1,3,4,5,7].includes(index)){ // Other quadrants are tileds
                
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
        let dest_inner = new rect(dest.x + x_margin, dest.y ,dest.width - (x_margin) * 2, dest.height);
    
        source_outer.round();
        source_inner.round();
        dest_outer.round();
        dest_inner.round();
        

        // Assuming grid class and rect class are properly defined and instantiated
        let source_grid = new grid( source_outer,source_inner,3);
        let dest_grid = new grid(dest_outer,dest_inner,3);
    
         // Round coordinates and dimensions
    
        // Draw each quadrant
        for(let index=0;index<3;index++){
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
            if ([0,2].includes(index)) { // Corners
                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            } 
            if ([ 1].includes(index)){ // Other quadrants are tileds
                
                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                
            }
        }
    }

    
}
    



class rect {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
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
        this._width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    // Directly calculate each property when accessed
    get center_x() {
        return parseInt(this.x + this.width / 2);
    }

    get center_y() {
        return parseInt(this.y + this.height / 2);
    }

    get bottom() {
        return this.y + this.height;
    }
    get right() {
        return this.x + this.width;
    }

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }
    round(){
        this.x=parseInt(this.x);
        this.y=parseInt(this.y);
        this.width=parseInt(this.width);
        this.height=parseInt(this.height);

    }
}




class grid {
    constructor(outer, inner,size=9) {
      this.outer = outer;
      this.inner = inner;
      if(size==9){
        this.quadrants = this.calculate_quadrants_9();
      }
      if(size==3){
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
  
class button {
  constructor(graphics, label, x, y, up_image, down_image) {
    this.graphics = graphics;
    this.ctx = graphics.ctx;
    this.sprites = graphics.sprites;
    this.up_image = up_image;
    this.down_image = down_image;
    this.label = label;

    this.is_down = false;
    this.is_hover = false;
    let btn = this.sprites.sprites[up_image];
    this.position = { x: x, y: y, width: btn.width, height: btn.height };

    this.events = {}; // Object to hold events

    graphics.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this));
    graphics.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this));
    graphics.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this));
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
    if (this.is_down) {
      this.sprites.render(this.down_image, this.position);
      this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + this.position.height / 2, this.label, true);
    } else if (this.is_hover) {
      let hover_pos = { x: this.position.x + 2, y: this.position.y + 2 };
      this.sprites.render(this.up_image, hover_pos);
      this.graphics.font.draw_text(hover_pos.x + this.position.width / 2, hover_pos.y + this.position.height / 2, this.label, true);
    } else {
      this.sprites.render(this.up_image, this.position);
      this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + this.position.height / 2, this.label, true);
    }
  }

  handle_mouse_down(event) {
    if (this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = true;
    }
  }

  handle_mouse_up(event) {
    if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = false;
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
    return mouse_x >= this.position.x && mouse_x <= this.position.x + this.position.width &&
      mouse_y >= this.position.y && mouse_y <= this.position.y + this.position.height;
  }
}
class modal {
    constructor(graphics, position, title, text, cancel = false, ok = true) {
        let ok_up = "button-up-cyan";
        let ok_down = "button-down-cyan";
        let cancel_up = "button-up-red";
        let cancel_down = "button-down-red";
        this.graphics = graphics;
        this.canvas = graphics.canvas;
        this.sprites = graphics.sprites;
        this.events = {}; // Object to hold modal events

        this.title = title;
        this.text = text;
        this.position = position;
        let modal_sprite = this.sprites.sprites["window"];
        let title_sprite = this.sprites.sprites["window-title"];
        if (this.position.width == null) this.position.width = modal_sprite.width;
        if (this.position.height == null) this.position.height = modal_sprite.height;
        if (this.position.x == null) this.position.x = (window.innerWidth -this.position.width) / 2;
        if (this.position.y == null) this.position.y = (window.innerHeight -this.position.height) / 2;

        this.title_position=new rect(this.position.x+100,this.position.y-15,this.position.width-100*2,title_sprite.height);
        let b1_x = this.position.left + 50;
        let b1_y = this.position.bottom - 130;
        let b2_x = this.position.right - 260;
        let b2_y = this.position.bottom - 130;

        if (!ok || !cancel) {
            b1_x = this.position.center_x - 100;
            b2_x = b1_x;
        }
        if (ok) {
            this.ok_button = new button(graphics, "Ok", b1_x, b1_y, ok_up, ok_down);
            this.ok_button.on('click', () => {
                this.emit('ok', { instance: this });
            });
        }
        if (cancel) {
            this.cancel_button = new button(graphics, "Cancel", b2_x, b2_y, cancel_up, cancel_down);
            this.cancel_button.on('click', () => {
                this.emit('cancel', { instance: this });
            });
        }
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
        this.sprites.slice_9("window", this.position);
        this.sprites.slice_3("window-title", this.title_position);
        if (this.ok_button) this.ok_button.render();
        if (this.cancel_button) this.cancel_button.render();
        
        this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y +25, this.title, true, true);
        this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + 90, this.text, true, true);

    }

    close() {
        this.emit('close', { instance: this });
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
class GameObject {
    constructor(graphics, x = 0, y = 0, width = 64, height = 64, mass = 100, rotation = 0, rotation_speed = 4, sound = false) {
        //sounds for the object
        this.graphics = graphics;
        this.type = null;
        this.sounds = { left: null, right: null, accel: null, decel: null, destroy: null };
        this.width = width;
        this.height = height;
        // img for the object
        this.imgURL = null;
        this.img = null;
        this.rotation = rotation;
        this.rotation_speed = rotation_speed;
        this.position = { x: x, y: y };
        this.acceleration = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.mass = mass;
        this.damping_factor = .1; // acceleration slow down
        this.velocity_loss = .7; // momentum slow down
        this.image_frame = 0;
        this.image_frames = 1;
        this.image_rotation = 0;  //roptate the image seperate from the acceleration factor... for images made in diff directions
        this.anchor_points = []
        this.top_level = true;
        this.created = Date.now();
        this.expires = null;
        this.play_sounds = sound;
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
        this.volume = .5; //default to the middle
    }
    set_rotation_speed(speed){
        this.rotation_speed=speed;
    }
    set_rotation(rotation){
        this.rotation=rotation;
    }

    play(action) {
        if (this.play_sounds == false) return;
        switch (action) {
            case 'left': if (this.sounds.left != null) this.sounds.left.play(); break;
            case 'right': if (this.sounds.right != null) this.sounds.right.play(); break;
            case 'accel': if (this.sounds.accel != null) this.sounds.accel.play(); break;
            case 'decel': if (this.sounds.decel != null) this.sounds.decel.play(); break;
            case 'destroy': if (this.sounds.destroy != null) this.sounds.destroy.play(); break;
            default:
                console.log("Unknown sound position")
        }

    }
    set_volume(volume) {
        if (volume == null) {
            volume = 0;
            console.log("Volume Error");
        }
        this.volume = volume;
        if (this.sounds.left != null) this.sounds.left.volume = this.volume;
        if (this.sounds.right != null) this.sounds.right.volume = this.volume;
        if (this.sounds.accel != null) this.sounds.accel.volume = this.volume;
        if (this.sounds.decel != null) this.sounds.decel.volume = this.volume;
        if (this.sounds.destroy != null) this.sounds.destroy.volume = this.volume;

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
        this.img = new Image();
        this.img.src = img_URL;
        // Wait for the image to load completely
        this.img.onload = () => {
            if (frames != 1) {
                //this.center.x = frame_width / 2;
            } else {
                //this.center.x = this.img.width / 2;
            }
            this.center.y = this.img.height / 2;
        };
    }

    image_rotate(rotation) {
        this.image_rotation = rotation
    }


    set_sound(position, sound_URL) {
        switch (position) {
            case 'left': this.sounds.left = new Audio(sound_URL); break;
            case 'right': this.sounds.right = new Audio(sound_URL); break;
            case 'accel': this.sounds.accel = new Audio(sound_URL); break;
            case 'decel': this.sounds.decel = new Audio(sound_URL); break;
            case 'destroy': this.sounds.destroy = new Audio(sound_URL); break;
            default:
                console.log("Unknown sound position")
        }
    }

    stop_playing() {
        if (this.sounds.left != null)
            this.sounds.left.pause();
        if (this.sounds.right != null)
            this.sounds.right.pause();
        if (this.sounds.accel != null)
            this.sounds.accel.pause();
        if (this.sounds.decel != null)
            this.sounds.decel.pause();
        if (this.sounds.destroy != null)
            this.sounds.destroy.pause();
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
        if (this.play_sounds && this.sounds.left != null) {
            try {
                await this.sounds.left.play();
            } catch (e) {
                // Handle the error properly here.
            }
        }
    }

    async bank_right() {
        this.rotation += this.rotation_speed;
        this.rotation %= 360;
        if (this.play_sounds && this.sounds.right != null) {
            try {
                await this.sounds.right.play();
            } catch (e) {
                // Handle the error properly here.
            }
        }
    }

    async accelerate(speed = null) {
        if (this.play_sounds && this.sounds.accel != null && this.sounds.accel.paused) {
            this.sounds.accel.currentTime = 0;
            try {
                await this.sounds.accel.play();
            } catch (e) {
                // Handle the error properly here.
            }
        }
        if (speed == null) speed = 1;
        this.move_player(this.rotation, speed);
    }

    async decelerate(speed = null) {
        if (this.play_sounds && this.sounds.decel != null && this.sounds.decel.paused) {
            this.sounds.decel.currentTime = 0;
            try {
                await this.sounds.decel.play();
            } catch (e) {
                // Handle the error properly here.
            }
        }

        if (speed == null) speed = 1;
        this.move_player(this.rotation + 180, speed);
    }

    async strafe_left(speed = null) {
        if (speed == null) speed = 1;
        this.move_player(this.rotation + 270, speed);
    }

    async strafe_right(speed = null) {
        if (speed == null) speed = 1;
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


    sound_off() {
        this.play_sounds = false;
        this.stop_playing();
    }

    sound_on() {
        this.play_sounds = true;
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


}


class Explosion extends GameObject {
    constructor(graphics,x, y,play_sound,volume=0) {
                super(graphics,x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10,play_sound);                     // ropration speed
                this.set_image('static/explosion/exp_9_128x128_35frames_strip35.png',128,35);
                this.set_center(64,64);
                this.set_type("explosion");
                this.set_loop(false);
                this.set_sound("destroy","static/explosion/sfx_exp_shortest_soft9.wav");
                this.set_volume(volume);
    }

            
}



class Derbis extends GameObject {
    constructor(graphics,x, y, type) {
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
                super(graphics,x, y,64,64,
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
                super(graphics,x, y,64,64,
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
                super(graphics,x, y,64,64,
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
                super(graphics,x, y,64,64,
                    200,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('static/debris/webex2.png');
                this.set_type("webex");
                this.action_list = default_action;
                break;
            case 'block':
                super(graphics,x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('static/blocks/block.png');
                this.set_type("block");
        }
        this.rotation = 180;

    } // end
}

class Projectile extends GameObject {
    constructor(graphics, x, y, rotation, type, sounds = false,volume) {
        switch (type) {
            case 'lazer':
                let actions = [
                    { type: "accelerate", frames: 1 }
                ];
                super(graphics, x, y, 16, 16,
                    800,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_sound("accel", 'static/audio/projectiles/sfx_wpn_laser6.wav')
                this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.set_center(8, 8);
                this.expire(5);
                this.set_type("laser");
                this.set_volume(volume);
                //this.action_list=actions;

                break;

            case 'bolt':
                super(graphics, x, y, 16, 16,
                    600,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_sound("accel", 'static/audio/projectiles/sfx_weapon_singleshot13.wav')
                this.set_image('static/projectiles/Firebomb.png', 16, 5, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                this.set_volume(volume);
                break;

            case 'thruster':
                super(graphics, x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_image('static/ships/Water Bolt.png', 16, 5, 270);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.center.y = 8;
                this.expire(5);
                this.set_type("thrusters");
                this.set_volume(volume);
                break;

            case 'booster':
                super(graphics, x, y, 32, 64,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                    sounds);                     // ropration speed
                this.set_image('static/ships/booster.png', 32, 4, 0);
                this.set_velocity_loss_off();
                this.center.x = 16;
                this.center.y = 2;
                this.set_type("booster");
                this.set_visible(false);

                break;

        }


    }

}


class Ship extends GameObject {

    constructor(graphics, x, y, type) {
        super(graphics, x, y, 128, 153,
            200,                    // mass
            0,                      // rotation
            4);                     // ropration speed
        
        this.boost_fire_control = new fire_control(3);
        this.laser_fire_control = new fire_control(3);
        this.missile_fire_control = new fire_control(10);
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        let speed=.5 + Math.random() * 4;

        switch (type) {
            case 'user':
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/ship1.png');
                this.set_type("ship");
                this.set_center(64, 64);
                this.booster = new Projectile(this.graphics, +0, 100, 0, "booster", this.volume);
                this.thrusters.push(this.booster);
                var thruster1 = new Projectile(this.graphics, +30, 55, 0, "thruster", this.volume);
                this.thrusters.push(thruster1);
                var thruster2 = new Projectile(this.graphics, -30, 55, 0, "thruster", this.volume);
                this.thrusters.push(thruster2);
                break;

            case 'teams':
                this.set_sound("left", 'static/audio/ship/static.mp3')
                this.set_sound("right", 'static/audio/ship/static.mp3')
                this.set_sound("accel", 'static/audio/ship/static.mp3')
                this.set_sound("decel", 'static/audio/ship/static.mp3')
                this.set_image('static/ships/teams.png',64,1,270);
                //this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_rotation(270);
                this.set_type("ship");
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
            var projectile = new Projectile(this.graphics, this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, "lazer", this.play_sounds, this.volume);
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.graphics, this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, "lazer", this.play_sounds, this.volume);
            projectile.set_velocity(this.velocity);
            projectile.accelerate();
            projectile.accelerate();
            this.projectiles.push(projectile);
        }
    }
    stop_firing_lazer() {
        this.laser_fire_control.stop_firing();
    }

    fire_missle() {
        if (this.missile_fire_control.can_fire()) {
            let missle1 = this.get_relative_position(0, -80)
            var projectile = new Projectile(this.graphics, this.position.x + missle1.x, this.position.y + missle1.y, this.rotation, "bolt", this.play_sounds, this.volume);
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

    sound_off() {
        this.play_sounds = false;
        super.sound_off();
        for (let thruster of this.thrusters) {
            thruster.sound_off();
        }
        for (let projectile of this.projectiles) {
            projectile.sound_off();
        }
    }

    sound_on() {
        this.play_sounds = true;
        super.sound_on();
        for (let thruster of this.thrusters) {
            thruster.sound_on();
        }
        for (let projectile of this.projectiles) {
            projectile.sound_on();
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

}class AudioManager {
    constructor() {
        this.audioMap = new Map(); // Map to store audio elements
    }

    // Method to load an audio file and store it in the map
    load(key, src) {
        const audio = new Audio(src);
        this.audioMap.set(key, audio);
    }

    // Method to play the audio corresponding to the given key
    play(key) {
        const audio = this.audioMap.get(key);
        if (audio) {
            audio.play();
        }
    }

    // Method to stop the audio corresponding to the given key
    stop(key) {
        const audio = this.audioMap.get(key);
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Reset playback to the beginning
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
                            case 't': block = new Ship(this.G.graphics,x, y, "teams"); break;
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
        if(this.G.play_sounds){
            this.G.level.track.pause();
            this.G.level.spaceship.sound_off();
            this.G.play_sounds=false;
        } else {
            this.G.level.track.play();
            this.G.level.spaceship.sound_on();
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
}class GameClient {
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
class graphics{
    constructor(canvas=null,ctx=null){
        this.canvas=canvas
        this.ctx=ctx;
        this.font = new sprite_font(this.ctx, "https://aijobwars.com/static/fonts/obitron-blue.png");
        this.sprites=new sprites(ctx);
        this.backround=null
        this.viewport=new viewport(1920,window.innerHeight);
        this.frame_background_color='#222';
        this.background_color='#000000';

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

}
class window_manager {
    constructor(graphics) {
      this.graphics = graphics;
      this.windows = [];
    }
    has_windows(){
        if( this.windows.length>0) return true;
        return false;
    }
  
    create_modal(title,text, position,cancel = false, ok = true) {
      const modalInstance = new modal(this.graphics, position, title, text, cancel, ok);
  
      // Listen for the 'close' event to remove the modal
      modalInstance.on('close', () => {
        this.close_modal(modalInstance);
      });
  
      this.windows.push(modalInstance);
      return modalInstance;
    }
  
    close_modal(modalInstance) {
      const index = this.windows.indexOf(modalInstance);
      if (index > -1) {
        this.windows.splice(index, 1); // Remove the modal from the array
        // Additional cleanup if necessary
      }
    }
  
    render() {
      this.windows.forEach(window => window.render());
    }
  }

  


class GamePage {
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
        this.track1Sound = null;

        this.messageSendURL = 'static/audio/sfx_sounds_button11.wav'
        this.messageSendSound = new Audio(this.messageSendURL);
        this.messageRecieveURL = 'static/audio/sfx_sounds_button3.wav'
        this.messageRecieveSound = new Audio(this.messageRecieveURL);
        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.FADE_OUT_DURATION = 5;
        this.outro = "Congratulations, you've emerged victorious from the AI Job Wars! Your resilience and strategic prowess have paid off, leading you to triumph over the relentless AI competition. With your job secured, you stand as a testament to human ingenuity and determination in the face of technological advancement. But the journey doesn't end here - continue honing your skills and facing new challenges as you navigate the ever-evolving landscape of the job market. Keep pushing forward, and may success always be within your grasp!";
        this.boss_mode_activated = false;
        this.pause_game = false;
        this.play_sounds = false;

        // control plane
        this.graphics = new graphics(this.canvas, this.ctx); //drawing the main level logic
        this.events = new events(this);   //kb events and socket etc..
        this.ui = new ui(this.ctx, this);
        this.level = new level(this);
        this.level.load('https://aijobwars.com/static/levels/level.json');
        this.laser_bar = new PercentageBar(this.graphics, 10, 10, 200, 40, "Laser");
        this.laser_timeout = new PercentageBar(this.graphics, 10, 50, 200, 40, "Laser Timeout");
        this.missile_bar = new PercentageBar(this.graphics, 220, 10, 200, 40, "Missle");
        this.missile_timeout = new PercentageBar(this.graphics, 220, 50, 200, 40, "Missle Timeout");
        this.booster_bar = new PercentageBar(this.graphics, 430, 10, 200, 40, "Booster");
        this.booster_timeout = new PercentageBar(this.graphics, 430, 50, 200, 40, "Booster Timeout");
        this.health_bar = new PercentageBar(this.graphics, 640, 10, 200, 40, "Health");
        this.startRendering();
        
        this.window_manager=new window_manager(this.graphics);

    }




    help(){

        let help_text="| Key           | Action                 |\n"+
                        "|---------------|------------------------|\n"+
                        "| Q             | Quit the game          |\n"+
                        "| Arrow Left    | Bank left              |\n"+
                        "| Arrow Right   | Bank right             |\n"+
                        "| Arrow Up      | Accelerate             |\n"+
                        "| Arrow Down    | Decelerate             |\n"+
                        "| STRAFING      | WASD                   |\n"+
                        "| Space         | Fire lasers            |\n"+
                        "| Enter         | Fire Missiles          |\n"+
                        "| M             | Toggle Sound           |\n"+
                        "| +             | Volume up              |\n"+
                        "| -             | Volume down            |\n"+
                        "| Escape        | Toggle Pause           |\n"+
                        "| CTRL + Escape | Turn on boss mode      |\n"+
                        "| Escape        | Exit (from boss mode)  |\n";
        
        let position=new rect(null,null,1024,700);
        let m=this.window_manager.create_modal("HELP",help_text, position,false,true ) ;
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

                    let exp = new Explosion(this.graphics, center.x, center.y,this.play_sounds,this.master_volume);

                    exp.orient({ x: 0, y: window.y1 });
                    exp.render(); //'rgba(0, 255, 0, 0.5)');
                    exp.de_orient();

                    this.level.explosions.push(exp);
                    obj1.impact(obj2);
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

                let exp = new Explosion(this.graphics, center.x, center.y,this.play_sounds,this.level.master_volume);
                exp.play("destroy");
                exp.orient({ x: 0, y: window.y1 });
                exp.render(); //'rgba(0, 255, 0, 0.5)');
                exp.de_orient();

                this.level.explosions.push(exp);
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

        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc=this.level.npc[b];
                
            if (npc.position.y > window.y1-50 && npc.position.y < window.y2) {
                if (npc.type=="ship"){
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

        for (let b = 0; b < this.level.explosions.length; b++) {

            if (this.level.explosions[b].position.y > window.y1 && this.level.explosions[b].position.y < window.y2) {
                this.level.explosions[b].update_frame(deltaTime)
                this.level.explosions[b].orient({ x: 0, y: window.y1 });
                this.level.explosions[b].render();
                this.level.explosions[b].de_orient();
                if (this.level.explosions[b].loop_complete()) {
                    this.level.explosions.splice(b, 1); // Remove the projectile from the array


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
            if(this.window_manager.has_windows()>0) {
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
