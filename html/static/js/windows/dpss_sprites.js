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
        this.add("window-thinn", this.base_domain+"static/UI/UI4.png", 1721-10, 154-10, 348 + 10 * 2, 466 + 10 * 2);

        this.add("window-close-up", this.base_domain+"static/UI/UI4.png", 1806, 678, 42,42);
        this.add("window-close-down", this.base_domain+"static/UI/UI4.png", 1857, 677, 42,42);
        this.add("window-right-corner", this.base_domain+"static/UI/UI4.png", 1908, 661, 80,73);

        this.add("scroll-down", this.base_domain+"static/UI/UI4.png", 1641, 585, 32,32);
        this.add("scroll-up", this.base_domain+"static/UI/UI4.png", 1641, 144, 32,32);
        this.add("scroll-drag", this.base_domain+"static/UI/UI4.png", 1641, 194, 30,54);
        this.add("scroll-bg", this.base_domain+"static/UI/UI4.png", 1641, 267, 32,300);
        
        this.add("bar", this.base_domain+"static/UI/UI4.png", 766, 760, 357,47);
        this.add("bar-red-fluid", this.base_domain+"static/UI/UI4.png", 780, 901, 312,33);
        this.add("bar-green-fluid", this.base_domain+"static/UI/UI4.png", 1097, 901, 312,32);
        this.add("bar-blue-fluid", this.base_domain+"static/UI/UI4.png", 781, 939, 312,33);
        this.add("bar-orange-fluid", this.base_domain+"static/UI/UI4.png", 1098, 939, 312,33);
        this.add("portal", this.base_domain+"static/UI/UI4.png", 569, 763, 158,158);
        
        this.add("menu",this.base_domain+"static/UI/menu.webp");
        this.add("blue_font",this.base_domain+"static/fonts/obitron-blue.png");
        this.add("grey_font",this.base_domain+"static/fonts/obitron-grey.png");
        this.add("red_font",this.base_domain+"static/fonts/obitron-red.png");
        this.add("title",this.base_domain+"static/intro/AI-JOB-WARS-3-24-2024.png");


        this.add("static/debris/email.png");
        this.add("static/debris/pdf.png");
        this.add("static/debris/phone.png");
        this.add("static/debris/webex2.png");
        this.add("static/blocks/block.png");
        this.add("static/explosion/exp_9_128x128_35frames_strip35.png");
        this.add("static/ships/ship1.png");
        this.add("static/ships/teams.png");
        this.add("static/projectiles/Arcane Bolt.png");
        this.add("static/projectiles/Firebomb.png");
        this.add("static/ships/Water Bolt.png");
        this.add("static/ships/booster.png");


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

    on_load(callback){
        // Resolve the main promise when all image promises are resolved
        Promise.all(Object.values(this.images)).then(() => {
            this.loaded = true;
            this.emit('complete'); // Emit 'complete' event when all images are loaded
            console.log("Loaded Images");
            if(callback) callback();
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
    



}