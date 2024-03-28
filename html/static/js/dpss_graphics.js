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
