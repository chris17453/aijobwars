class window_manager extends events{
    constructor(elements) {
      super();
      this.canvas = document.getElementById(elements.canvasId);
      this.ctx = this.canvas.getContext('2d');

      this.graphics = new graphics(this.canvas, this.ctx); //drawing the main level logic
      this.events = new game_events(this);   //kb events and socket etc..
      this.audio_manager = new audio_manager();
      this.windows = [];
      this.active_modal=null;
      this.background=null;
      
      setInterval(() => {
          this.graphics.recalc_canvas();
          if (this.has_windows() > 0) {
              this.resize();
              this.render();
          } 
        },1000 / 24);
    }

    set_background(key,background_url){
      //this.graphics.sprites.add(key,background_url);
        this.background=key;
    }

    has_windows(){
        if( this.windows.length>0) return true;
        return false;
    }
    add(modal_instance){
      modal_instance.init(this);
      modal_instance.layout();
      this.insert_model(modal_instance);
      
    }


    create_modal(title,text, position,cancel = false, ok = true,close=false) {
      console.log("Creating Modal");
      const modal_instance = new modal(this,this.graphics, position, title, text, cancel, ok,close);
      return this.insert_model(modal_instance);
    }
    
    insert_model(modal_instance){
      // Listen for the 'close' event to remove the modal
      modal_instance.on('close', () => {
        this.close_modal(modal_instance);
      });
      
      this.windows.forEach(modal=> modal.set_active(false));
      this.windows.push(modal_instance);
      console.log("Window Manager: Active instance");
      
      this.active_modal=modal_instance
      return modal_instance;
    }
  
    close_modal(modal_instance) {
      console.log("Window Manager: Close Modal");
      const index = this.windows.indexOf(modal_instance);
      if (index > -1) {
        this.windows.splice(index, 1); // Remove the modal from the array
        // Additional cleanup if necessary
      }
      if(this.windows.length>0) {
        let last_modal= this.windows[this.windows.length - 1];
        last_modal.set_active(true);
        this.active_modal=last_modal;

      }
    }
    resize(){
      for(let i=0;i<this.windows.length;i++) this.windows[i].resize();
    }

    render() {
      var gradient = this.graphics.ctx.createLinearGradient(0, 0, 0, this.graphics.viewport.frame.height);
      gradient.addColorStop(0, 'black');
      gradient.addColorStop(.7, 'lightgrey');
      gradient.addColorStop(.8, 'darkgrey');
      gradient.addColorStop(1, 'black');

        this.graphics.sprites.clear(gradient,this.graphics.viewport.frame);
        if (this.background){
            this.graphics.sprites.render(this.background,null,this.graphics.viewport.given,1,"contain");
        }
        if (this.active_modal) {
            this.active_modal.render();
        }
        //this.windows.forEach(window => window.render());
    }
  }

  