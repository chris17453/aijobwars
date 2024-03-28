class sprites {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprites = {};
        this.add("window", "static/UI/UI1.png", 67, 67, 565, 332);
        this.add("button-down-red", "static/UI/UI1.png", 683, 77, 206, 68);
        this.add("button-up-red", "static/UI/UI1.png", 683, 161, 206, 68);
        this.add("button-down-yellow", "static/UI/UI1.png", 928, 77, 206, 68);
        this.add("button-up-yellow", "static/UI/UI1.png", 927, 161, 206, 68);
        this.add("button-down-cyan", "static/UI/UI1.png", 683, 281, 206, 68);
        this.add("button-up-cyan", "static/UI/UI1.png", 683, 365, 206, 68);
        this.add("button-down-gray", "static/UI/UI1.png", 928, 281, 206, 68);
        this.add("button-up-gray", "static/UI/UI1.png", 927, 365, 206, 68);
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
    render(key, dest,intensity=1) {
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
}

class rect {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.compute_properties();
    }
  
    compute_properties() {
      this.center_x = this.x + this.width / 2;
      this.center_y = this.y + this.height / 2;
      this.bottom = this.y + this.height;
    }
  }
  