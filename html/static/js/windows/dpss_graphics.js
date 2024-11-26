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
