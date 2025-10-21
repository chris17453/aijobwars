class graphics extends events {
    constructor(canvas = null, ctx = null, logger) {
      super(logger);
      this.logger = logger || console;
      try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.font = null;
        this.sprites = new sprites(ctx);
        this.sprites.on("complete", this.load_font.bind(this));
        this.sprites.preload();
        this.backround = null;
        this.viewport = new viewport(1920, window.innerHeight);
        this.frame_background_color = '#222';
        this.background_color = '#000000';
      } catch (error) {
        this.logger.error(`graphics constructor: ${error.message}`);
      }
    }
  
    sanitize_path(path) {
      if (typeof path !== 'string') {
        throw new Error("Invalid image URL type");
      }
      return path.replace(/[<>"'`;]/g, '');
    }
  
    load_font() {
      try {
        let font = new sprite_font(this.ctx, this.sprites, "grey_font", this.logger);
        this.font = font;
        this.emit('complete');
      } catch (error) {
        this.logger.error(`load_font: ${error.message}`);
      }
    }
  
    set_background(image_url) {
      try {
        image_url = this.sanitize_path(image_url);
        this.backround = new Image();
        this.backround.src = image_url;
      } catch (error) {
        this.logger.error(`set_background: ${error.message}`);
      }
    }
  
    recalc_canvas() {
      try {
        this.viewport.calculate();
        // reset canvas dimensions
        this.canvas.windowWidth = this.viewport.frame.width;
        this.canvas.windowHeight = this.viewport.frame.height;
        this.canvas.width = this.viewport.frame.width;
        this.canvas.height = this.viewport.frame.height;
      } catch (error) {
        this.logger.error(`recalc_canvas: ${error.message}`);
      }
    }
  
    updateCanvasSizeAndDrawImage(level_position) {
      try {
        if (this.backround == null) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return;
        }
        // Correct the window every frame
        let srcX = 0;
        let srcY = 0; // increment for scroll (start at bottom)
        let destX = this.viewport.given.x;
        let destY = this.viewport.given.y;
        let scaledDestWidth = this.viewport.given.width;
        let scaledDestHeight = this.viewport.given.height;
  
        let vp_h = this.viewport.virtual.height;
        let scrollable_height = level_position.height - vp_h;
        if (scrollable_height < 0) scrollable_height = 0;
        let position_percentage = (scrollable_height) / level_position.y;
        srcY = position_percentage * scrollable_height;
  
        position_percentage = level_position.y / (level_position.height - this.viewport.virtual.height);
        srcY = position_percentage * (this.backround.height - this.viewport.virtual.height);
  
        this.ctx.save();
        this.ctx.fillStyle = this.frame_background_color;
        // Clear the canvas frame
        this.ctx.fillRect(
          this.viewport.frame.x,
          this.viewport.frame.y,
          this.viewport.frame.width,
          this.viewport.frame.height
        );
        this.ctx.restore();
  
        this.ctx.fillStyle = this.background_color;
        let bg_scale_x = this.viewport.given.width / this.backround.width;
        let bg_h = this.viewport.virtual.height;
  
        // Draw the selected portion of the original image scaled on the canvas
        this.ctx.drawImage(
          this.backround,
          srcX, srcY,
          this.backround.width, bg_h,
          destX, destY,
          scaledDestWidth, scaledDestHeight
        );
      } catch (error) {
        this.logger.error(`updateCanvasSizeAndDrawImage: ${error.message}`);
      }
    }
  
    fade_images(percentage) {
      try {
        if (!this.ctx || !this.canvas) {
          this.logger.error("fade_images: Canvas or context not defined");
          return;
        }
        // Assuming image1 and image2 are defined in the proper scope
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw the first image
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(image1, 0, 0, this.canvas.width, this.canvas.height);
        // Draw the second image on top with adjusted opacity
        this.ctx.globalAlpha = percentage / 100;
        this.ctx.drawImage(image2, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
      } catch (error) {
        this.logger.error(`fade_images: ${error.message}`);
      }
    }
  }
  