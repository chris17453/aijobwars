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

    add(key, imagePath=null, x=0, y=0, width=null, height=null) {
        //dont double add it...        
        if (this.sprites[key]){
            return this.sprites[key].image;
        }
        if (imagePath==null) imagePath=key;
        
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
    
        if (width == null || height == null) {
            img.onload = () => {
                if (width == null) this.sprites[key].width = img.width;
                if (height == null) this.sprites[key].height = img.height;
            };
        }
        return img;
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

    get(key){
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
      return s;
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
  