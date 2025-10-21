class modal {
  constructor(logger) {
    this.logger = logger || console;
    try {
      this.window_manager = null;
      this.parent = null;
      this.graphics = null;
      this.active = false;
      this.events = {};
      this.ok = null;
      this.cancel = null;
      // Rename the close property to avoid clashing with the close() method
      this.closeButton = null;
      this.title = null;
      this.text = null;
      this.position = null;
      this.skin = true;
      this.external_render_callback = null;
      this.background = null;
      this.bg_gradient = null;
      this.buttons = [];
      this.images = [];
    } catch (error) {
      this.logger.error(`modal constructor: ${error.message}`);
    }
  }

  // Default init assignment from window manager
  init(window_manager) {
    try {
      this.window_manager = window_manager;
      this.graphics = window_manager.graphics;
      this.audio_manager = window_manager.audio_manager;
      this.canvas = this.graphics.canvas;
      this.sprites = this.graphics.sprites;
    } catch (error) {
      this.logger.error(`init: ${error.message}`);
    }
  }

  add_bg_gradient(percentage, color) {
    try {
      if (this.bg_gradient == null) {
        this.bg_gradient = [];
      }
      this.bg_gradient.push([percentage, color]);
    } catch (error) {
      this.logger.error(`add_bg_gradient: ${error.message}`);
    }
  }

  // Override this for new layout
  layout2(position, title, text, cancel = false, ok = true, close = false) {
    try {
      this.active = true;
      this.ok = ok;
      this.cancel = cancel;
      // Use the renamed property for the close button
      this.closeButton = close;
      this.title = title;
      this.text = text;
      this.position = position;
    } catch (error) {
      this.logger.error(`layout2: ${error.message}`);
    }
  }

  no_skin() {
    try {
      this.skin = false;
    } catch (error) {
      this.logger.error(`no_skin: ${error.message}`);
    }
  }

  set_background(background) {
    try {
      // If background is a string, sanitize it
      if (typeof background === "string") {
        background = this.sanitize_path(background);
      }
      this.background = background;
    } catch (error) {
      this.logger.error(`set_background: ${error.message}`);
    }
  }

  sanitize_path(path) {
    try {
      if (typeof path !== "string") {
        throw new Error("Invalid background path type");
      }
      return path.replace(/[<>"'`;]/g, "");
    } catch (error) {
      this.logger.error(`sanitize_path: ${error.message}`);
      throw error;
    }
  }

  add_buttons() {
    try {
      let mode = "center";
      // Store bound reference so that removeEventListener works correctly
      this._bound_handle_key_down = this.handle_key_down.bind(this);

      if (this.closeButton) {
        let button_position = new rect(this.position.width - 80, -30, 42, 42);
        this.closeButton = this.create_button("", button_position, null, "window-close-up", "window-close-down");
        this.closeButton.on("click", () => {
          this.emit("close", { instance: this });
        });
      }

      if (this.ok) {
        let button_position = new rect(this.position.left + 100, this.position.bottom - 60);
        let ok_instance = this.add_button("Ok", button_position, null, "button-up-cyan", "button-down-cyan");
        ok_instance.on("click", () => {
          this.emit("ok", { instance: this });
        });
      }
      if (this.cancel) {
        let button_position = new rect(this.position.right - 100, this.position.bottom - 60);
        let cancel_instance = this.add_button("Cancel", button_position, mode, "button-up-red", "button-down-red");
        cancel_instance.on("click", () => {
          this.emit("cancel", { instance: this });
        });
      }

      // Add event listener for keydown events
      document.addEventListener("keydown", this._bound_handle_key_down);
    } catch (error) {
      this.logger.error(`add_buttons: ${error.message}`);
    }
  }

  handle_keys() {
    // Placeholder for handling keys if needed
  }

  resize() {
    try {
      // Calculate title position within the modal
      this.title_position = new rect(
        160 / 2,
        -20,
        this.position.width - 160,
        80,
        "left",
        "top"
      );

      let x_padding = 34;
      let y_padding = [30, 50];
      let y_offset = 0;
      if (this.skin === false) {
        x_padding = 0;
        y_padding = [0, 0];
        y_offset = 0;
      }
      this.internal_rect = new rect(
        x_padding,
        y_offset + y_padding[0],
        this.position.width - x_padding * 2,
        this.position.height - y_offset - y_padding[0] - y_padding[1],
        "left",
        "top"
      );

      this.render_position = this.position.clone();
      this.render_title_position = this.title_position.clone();
      this.render_internal_rect = this.internal_rect.clone();

      // Recalculate positions based on the viewport
      this.render_position.add(this.graphics.viewport.given);
      this.render_title_position.add(this.render_position);
      this.render_internal_rect.add(this.render_position);
      for (let i = 0; i < this.buttons.length; i++) {
        this.buttons[i].resize(this.render_internal_rect);
      }
    } catch (error) {
      this.logger.error(`resize: ${error.message}`);
    }
  }

  create_button(label, position, callback, up_image, down_image) {
    try {
      let anchor_position = new rect(0, 0, 0, 0);
      anchor_position.add(this.graphics.viewport.given);
      anchor_position.add(this.position);
      anchor_position.add(this.internal_rect);

      let new_button = new button(this, this.graphics, label, position, anchor_position, callback, up_image, down_image);
      new_button.on("click", () => {
        this.emit("click", { instance: this });
      });
      return new_button;
    } catch (error) {
      this.logger.error(`create_button: ${error.message}`);
      return null;
    }
  }

  add_button(label, position, callback, up_image, down_image) {
    try {
      let new_button = this.create_button(label, position, callback, up_image, down_image);
      if (new_button) {
        this.buttons.push(new_button);
      }
      return new_button;
    } catch (error) {
      this.logger.error(`add_button: ${error.message}`);
      return null;
    }
  }

  add_image(position, key) {
    try {
      let image = { position: position, key: key };
      this.images.push(image);
      return image;
    } catch (error) {
      this.logger.error(`add_image: ${error.message}`);
      return null;
    }
  }

  del_image(image) {
    try {
      const index = this.images.findIndex((img) => img.key === image.key);
      if (index !== -1) {
        this.images.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`del_image: ${error.message}`);
      return false;
    }
  }

  render_callback(callback) {
    try {
      this.external_render_callback = callback;
    } catch (error) {
      this.logger.error(`render_callback: ${error.message}`);
    }
  }

  handle_key_down(event) {
    try {
      if (this.active !== true) return;
      this.emit("keydown", { instance: this, event: event });
    } catch (error) {
      this.logger.error(`handle_key_down: ${error.message}`);
    }
  }

  on(event_name, callback) {
    try {
      if (!this.events[event_name]) {
        this.events[event_name] = [];
      }
      this.events[event_name].push(callback);
    } catch (error) {
      this.logger.error(`on(${event_name}): ${error.message}`);
    }
  }

  emit(event_name, data) {
    try {
      if (this.events[event_name]) {
        this.events[event_name].forEach((callback) => {
          try {
            callback(data);
          } catch (cbError) {
            this.logger.error(`emit(${event_name}) callback error: ${cbError.message}`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`emit(${event_name}): ${error.message}`);
    }
  }

  render() {
    try {
      if (this.active === false) return;
      if (this.skin) {
        this.sprites.slice_9("window", this.render_position);
      }
      let internal = this.internal_rect.clone();

      this.graphics.ctx.save();
      this.graphics.ctx.beginPath();
      this.graphics.ctx.rect(
        this.render_internal_rect.x,
        this.render_internal_rect.y,
        this.render_internal_rect.width,
        this.render_internal_rect.height
      );
      this.graphics.ctx.clip();

      if (this.external_render_callback != null) {
        this.external_render_callback(this.render_internal_rect);
      }

      // Render buttons
      this.buttons.forEach((button) => button.render());
      // Render images
      for (let i = 0; i < this.images.length; i++) {
        let image = this.images[i];
        let image_pos = image.position.clone();
        if (this.graphics.viewport.given) {
          image_pos.add(this.graphics.viewport.given);
        }
        this.graphics.sprites.render(image.key, image_pos, 1, "none");
      }

      // Render text
      if (this.text) {
        this.graphics.font.draw_text(internal, this.text, true, true);
      }
      this.graphics.ctx.restore();

      if (this.skin) {
        this.sprites.slice_3("window-title", this.render_title_position);
        this.graphics.font.draw_text(this.render_title_position, this.title, true, false);
      }
      if (this.closeButton != null && typeof this.closeButton.render === "function") {
        this.closeButton.render();
      }
    } catch (error) {
      this.logger.error(`render: ${error.message}`);
    }
  }

  set_active(active) {
    try {
      this.active = active;
      this.buttons.forEach((button) => button.set_active(active));
    } catch (error) {
      this.logger.error(`set_active: ${error.message}`);
    }
  }

  close() {
    try {
      if (this.active !== true) return;
      this.emit("close", { instance: this });
      this.logger.info("Modal: Close Window");
      this.delete();
    } catch (error) {
      this.logger.error(`close: ${error.message}`);
    }
  }

  delete() {
    try {
      if (this._bound_handle_key_down) {
        document.removeEventListener("keydown", this._bound_handle_key_down);
      }
      this.events = {};
      this.buttons.forEach((button) => button.delete());
      delete this.parent;
      delete this.graphics;
      delete this.canvas;
      delete this.sprites;
      delete this.ok;
      delete this.cancel;
      delete this.title;
      delete this.text;
      delete this.position;
      delete this.external_render_callback;
      delete this.buttons;
      delete this.images;
      this.active = false;
    } catch (error) {
      this.logger.error(`delete: ${error.message}`);
    }
  }
}
