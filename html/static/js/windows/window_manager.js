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

      // CRITICAL: Clear active_modal immediately to prevent render calls on deleted modal
      this.active_modal = null;

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
          // Save the current canvas state
          this.graphics.ctx.save();

          // Apply viewport scaling and centering transformation
          // This makes everything drawn in virtual coordinates automatically scale to physical pixels
          const scale = this.graphics.viewport.scale;
          const viewport = this.graphics.viewport;

          // Calculate the actual rendered size after scaling
          const renderedWidth = viewport.virtual.width * scale.x;
          const renderedHeight = viewport.virtual.height * scale.y;

          // Calculate offset to center the viewport in the canvas
          const offsetX = (viewport.given.width - renderedWidth) / 2;
          const offsetY = (viewport.given.height - renderedHeight) / 2;

          // Apply translation to center, then scale
          this.graphics.ctx.translate(offsetX, offsetY);
          this.graphics.ctx.scale(scale.x, scale.y);

          // Now everything is drawn in virtual coordinate space (1920x1080)
          // and automatically scaled and centered to fit the canvas

          // Render background first (if exists)
          if (this.active_modal.background){
              const bgRect = new rect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);
              this.graphics.sprites.render(this.active_modal.background, null, bgRect, 1, "contain");
            }

          // Then render gradient overlay (if exists)
          if (this.active_modal.bg_gradient) {
            var gradient = this.graphics.ctx.createLinearGradient(0, 0, 0, this.graphics.viewport.virtual.height);
            for(let i=0;i<this.active_modal.bg_gradient.length;i++)
              gradient.addColorStop(this.active_modal.bg_gradient[i][0],this.active_modal.bg_gradient[i][1]);

            // Draw gradient with proper transparency support
            this.graphics.ctx.fillStyle = gradient;
            this.graphics.ctx.fillRect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);
          }

            this.active_modal.render();

          // Restore the canvas state (removes the scale transformation)
          this.graphics.ctx.restore();
        }
        //this.modals.forEach(window => window.render());
    }
  }

  