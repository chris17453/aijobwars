class modal {
    constructor(graphics, x = null, y = null, title, text,cancel = false, ok = true) {
      let ok_up = "button-up-cyan";
      let ok_down = "button-down-cyan";
      let cancel_up = "button-up-red";
      let cancel_down = "button-down-red";
      this.graphics = graphics;
      this.canvas = graphics.canvas;
      this.sprites = graphics.sprites;
      this.events = {}; // Object to hold modal events
  
      this.title = title;
      this.text=text;
      let modal_sprite = this.sprites.sprites["window"];
      if (x == null) x = (window.innerWidth - modal_sprite.width) / 2;
      if (y == null) y = (window.innerHeight - modal_sprite.height) / 2;
      this.position = { x: x, y: y, width: modal_sprite.width, height: modal_sprite.height };
  
      let b1_x = x + 50;
      let b1_y = y + modal_sprite.height - 130;
      let b2_x = x + modal_sprite.width - 260;
      let b2_y = y + modal_sprite.height - 130;
  
      if (!ok || !cancel) {
        b1_x = this.position.x + (this.position.width / 2) - 100;
        b2_x = b1_x;
      }
      if (ok) {
        this.ok_button = new button(graphics, "Ok", b1_x, b1_y, ok_up, ok_down);
        this.ok_button.on('click', () => {
          this.emit('ok', {instance:this});
        });
      }
      if (cancel) {
        this.cancel_button = new button(graphics, "Cancel", b2_x, b2_y, cancel_up, cancel_down);
        this.cancel_button.on('click', () => {
          this.emit('cancel', {instance:this});
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
      this.sprites.render("window", this.position);
      if (this.ok_button) this.ok_button.render();
      if (this.cancel_button) this.cancel_button.render();
      this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + 50, this.title, true);
      this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + 90, this.text, true);

    }

    close(){
        this.emit('close', {instance:this});
    }
  }
  