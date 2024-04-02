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

  