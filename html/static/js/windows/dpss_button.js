
class button {
  constructor(graphics, label, x, y, up_image, down_image) {
    this.graphics = graphics;
    this.ctx = graphics.ctx;
    this.sprites = graphics.sprites;
    this.up_image = up_image;
    this.down_image = down_image;
    this.label = label;

    this.is_down = false;
    this.is_hover = false;
    let btn = this.sprites.sprites[up_image];
    this.position = { x: x, y: y, width: btn.width, height: btn.height };

    this.events = {}; // Object to hold events

    graphics.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this));
    graphics.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this));
    graphics.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this));
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
    if (this.is_down) {
      this.sprites.render(this.down_image, this.position);
      this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + this.position.height / 2, this.label, true);
    } else if (this.is_hover) {
      let hover_pos = { x: this.position.x + 2, y: this.position.y + 2 };
      this.sprites.render(this.up_image, hover_pos);
      this.graphics.font.draw_text(hover_pos.x + this.position.width / 2, hover_pos.y + this.position.height / 2, this.label, true);
    } else {
      this.sprites.render(this.up_image, this.position);
      this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + this.position.height / 2, this.label, true);
    }
  }

  handle_mouse_down(event) {
    if (this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = true;
    }
  }

  handle_mouse_up(event) {
    if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = false;
      this.emit('click', event); // Emit 'click' event
    }
  }

  handle_mouse_move(event) {
    let previously_hover = this.is_hover;
    this.is_hover = this.is_inside(event.offsetX, event.offsetY);

    if (this.is_hover && !previously_hover) {
      this.emit('mouseover', event); // Emit 'mouseover' event
    } else if (!this.is_hover && previously_hover) {
      this.emit('mouseout', event); // Emit 'mouseout' event
    }
  }

  is_inside(mouse_x, mouse_y) {
    return mouse_x >= this.position.x && mouse_x <= this.position.x + this.position.width &&
      mouse_y >= this.position.y && mouse_y <= this.position.y + this.position.height;
  }
}
