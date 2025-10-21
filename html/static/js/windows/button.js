class button extends events {
  constructor(parent, graphics, label, position, anchor_position, callback, up_image, down_image, logger) {
    super();
    this.logger = logger || console;
    try {
      this.parent = parent;
      this.graphics = graphics;
      this.ctx = graphics.ctx;
      this.sprites = graphics.sprites;
      // Sanitize image paths
      this.up_image = this.sanitize_path(up_image);
      this.down_image = this.sanitize_path(down_image);
      this.label = label;
      this.is_down = false;
      this.is_hover = false;
      this.monospaced = false;
      this.centered = false;
      this.active = true;

      let x_pad = 20;
      let y_pad = 20;
      let bounds = this.graphics.font.get_bounds(label, this.monospaced);
      if (position.width == null) position.width = bounds.width + x_pad * 2;
      if (position.height == null) position.height = bounds.height + y_pad * 2;
      this.inner = new rect((position.width - bounds.width) / 2, (position.height - bounds.height) / 2, bounds.width, bounds.height);
      this.position = position;
      this.anchor_position = anchor_position;

      // Store bound event handlers to enable proper removal later
      this._bound_mouse_down = this.handle_mouse_down.bind(this);
      this._bound_mouse_up = this.handle_mouse_up.bind(this);
      this._bound_mouse_move = this.handle_mouse_move.bind(this);

      graphics.canvas.addEventListener('mousedown', this._bound_mouse_down);
      graphics.canvas.addEventListener('mouseup', this._bound_mouse_up);
      graphics.canvas.addEventListener('mousemove', this._bound_mouse_move);
      this.callback = callback;
    } catch (error) {
      this.logger.error(`button constructor: ${error.message}`);
      throw error;
    }
  }

  sanitize_path(path) {
    if (typeof path !== 'string') {
      throw new Error("Invalid path type");
    }
    // Basic sanitization: remove potentially dangerous characters
    return path.replace(/[<>"'`;]/g, '');
  }

  resize(anchor_position) {
    try {
      this.anchor_position = anchor_position;
    } catch (error) {
      this.logger.error(`resize: ${error.message}`);
    }
  }

  render() {
    try {
      if (this.active !== true) return;
      let relative_position = this.position.clone();
      let relative_inner = this.inner.clone();
      relative_position.add(this.anchor_position);
      relative_inner.add(relative_position);
      let img = this.up_image;
      if (this.is_down) {
        img = this.down_image;
      } else if (this.is_hover) {
        relative_position.x += 2;
        relative_position.y += 2;
        relative_inner.x += 2;
        relative_inner.y += 2;
      }

      this.sprites.slice_9(img, relative_position, 10, 10);
      this.graphics.font.draw_text(relative_inner, this.label, this.centered, this.monospaced);
    } catch (error) {
      this.logger.error(`render: ${error.message}`);
    }
  }

  handle_mouse_down(event) {
    try {
      if (this.active !== true) return;
      if (this.is_down) return;
      if (this.is_inside(event.offsetX, event.offsetY)) {
        this.is_down = true;
      }
    } catch (error) {
      this.logger.error(`handle_mouse_down: ${error.message}`);
    }
  }

  handle_mouse_up(event) {
    try {
      if (this.active !== true) return;
      if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
        if (this.is_down === true) {
          if (this.callback) {
            this.callback.bind(this.parent)({ parent: this.parent, event: event, instance: this });
          }
          this.emit('click', event);
        }
      }
      this.is_down = false;
    } catch (error) {
      this.logger.error(`handle_mouse_up: ${error.message}`);
    }
  }

  handle_mouse_move(event) {
    try {
      if (this.active !== true) return;
      let previously_hover = this.is_hover;
      this.is_hover = this.is_inside(event.offsetX, event.offsetY);

      if (this.is_hover && !previously_hover) {
        this.emit('mouseover', event);
      } else if (!this.is_hover && previously_hover) {
        this.emit('mouseout', event);
      }
    } catch (error) {
      this.logger.error(`handle_mouse_move: ${error.message}`);
    }
  }

  is_inside(mouse_x, mouse_y) {
    try {
      let relative_position = this.position.clone();
      relative_position.add(this.anchor_position);
      return mouse_x >= relative_position.x &&
             mouse_x <= relative_position.x + relative_position.width &&
             mouse_y >= relative_position.y &&
             mouse_y <= relative_position.y + relative_position.height;
    } catch (error) {
      this.logger.error(`is_inside: ${error.message}`);
      return false;
    }
  }

  set_active(active) {
    try {
      this.active = active;
    } catch (error) {
      this.logger.error(`set_active: ${error.message}`);
    }
  }

  delete() {
    try {
      this.graphics.canvas.removeEventListener('mousedown', this._bound_mouse_down);
      this.graphics.canvas.removeEventListener('mouseup', this._bound_mouse_up);
      this.graphics.canvas.removeEventListener('mousemove', this._bound_mouse_move);

      delete this.parent;
      delete this.graphics;
      delete this.ctx;
      delete this.sprites;
      delete this.up_image;
      delete this.down_image;
      delete this.label;
      delete this.is_down;
      delete this.is_hover;
      delete this.monospaced;
      delete this.centered;
      delete this.active;
      delete this.inner;
      delete this.position;
      delete this.anchor_position;
      delete this.callback;
      delete this._bound_mouse_down;
      delete this._bound_mouse_up;
      delete this._bound_mouse_move;
    } catch (error) {
      this.logger.error(`delete: ${error.message}`);
    }
  }
}
