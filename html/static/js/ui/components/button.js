class button extends ui_component {
  /**
   * Button component with proper layout system
   *
   * Usage (new style with layout config):
   *   new button(parent, graphics, label, {
   *     anchor_x: "left", anchor_y: "top",
   *     margin_left: 20, margin_top: 10,
   *     width: 200, height: 60,
   *     width_mode: "fill"  // or "fixed" or "dynamic"
   *   }, callback, "button-up-cyan", "button-down-cyan");
   *
   * Usage (legacy style - backward compatible):
   *   new button(parent, graphics, label, position_rect, anchor_position_rect, callback, "button-up-cyan", "button-down-cyan");
   */
  constructor(parent, graphics, label, position_or_config, anchor_position_or_callback, callback_or_up_image, up_image_or_down_image, down_image_or_logger, logger) {
    // Detect legacy vs new style constructor
    let layout_config = {};
    let callback, up_image, down_image;
    let legacy_anchor_position = null;
    let legacy_position = null;
    let is_legacy = (position_or_config && typeof position_or_config === 'object' && 'x' in position_or_config && 'width' in position_or_config);

    if (is_legacy) {
      // Legacy style: (parent, graphics, label, position, anchor_position, callback, up_image, down_image, logger)
      let position = position_or_config;
      let anchor_position = anchor_position_or_callback;
      callback = callback_or_up_image;
      up_image = up_image_or_down_image;
      down_image = down_image_or_logger;

      // Convert legacy position/anchor to layout config
      layout_config = {
        mode: "absolute",
        width: position.width,
        height: position.height,
        width_mode: "fixed",
        height_mode: "fixed",
        offset_x: position.x,
        offset_y: position.y,
        anchor_x: position._x_mode || "left",
        anchor_y: position._y_mode || "top"
      };

      // Store for assignment after super()
      legacy_anchor_position = anchor_position;
      legacy_position = position;
    } else {
      // New style: (parent, graphics, label, layout_config, callback, up_image, down_image, logger)
      layout_config = position_or_config || {};
      callback = anchor_position_or_callback;
      up_image = callback_or_up_image;
      down_image = up_image_or_down_image;
    }

    super(parent, graphics, layout_config, logger);

    // NOW we can access 'this' - assign legacy properties if needed
    if (is_legacy) {
      this._legacy_anchor_position = legacy_anchor_position;
      this._legacy_position = legacy_position;
      // For legacy mode, directly set position to the legacy position (don't use layout system)
      this.position = legacy_position.clone();
    }

    try {
      this.sprites = graphics.sprites;

      // Sanitize image paths
      this.up_image = this.sanitize_path(up_image);
      this.down_image = this.sanitize_path(down_image);

      this.label = label;
      this.is_down = false;
      this.is_hover = false;
      this.monospaced = false;
      this.centered = false;
      this.callback = callback;

      // Calculate inner rect for text (will be updated in on_layout_calculated)
      this.inner = new rect(0, 0, 0, 0);
      this.calculate_inner_rect();

      // Store bound event handlers to enable proper removal later
      this._bound_mouse_down = this.handle_mouse_down.bind(this);
      this._bound_mouse_up = this.handle_mouse_up.bind(this);
      this._bound_mouse_move = this.handle_mouse_move.bind(this);

      graphics.canvas.addEventListener('mousedown', this._bound_mouse_down);
      graphics.canvas.addEventListener('mouseup', this._bound_mouse_up);
      graphics.canvas.addEventListener('mousemove', this._bound_mouse_move);
    } catch (error) {
      this.logger.error(`button constructor: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate inner rectangle for centered text
   */
  calculate_inner_rect() {
    try {
      let x_pad = 20;
      let y_pad = 20;

      if (this.graphics && this.graphics.font) {
        let bounds = this.graphics.font.get_bounds(this.label, this.monospaced);

        // If using dynamic width mode, update layout width based on text
        if (this.layout.width_mode === "dynamic") {
          this.layout.width = bounds.width + x_pad * 2;
        }
        if (this.layout.height_mode === "dynamic") {
          this.layout.height = bounds.height + y_pad * 2;
        }

        // Center text within button
        this.inner.x = (this.position.width - bounds.width) / 2;
        this.inner.y = (this.position.height - bounds.height) / 2;
        this.inner.width = bounds.width;
        this.inner.height = bounds.height;
      }
    } catch (error) {
      this.logger.error(`calculate_inner_rect: ${error.message}`);
    }
  }

  /**
   * Hook called after layout is calculated
   */
  on_layout_calculated() {
    this.calculate_inner_rect();
  }

  /**
   * Legacy resize support - converts old anchor_position to new layout system
   */
  resize(anchor_position_or_parent_rect) {
    try {
      // Check if this is legacy style (rect with x/y that looks like anchor position)
      if (this._legacy_position && anchor_position_or_parent_rect) {
        // Legacy mode: update the anchor position and recalculate
        this._legacy_anchor_position = anchor_position_or_parent_rect;

        // For legacy buttons, position is already absolute in virtual space
        // Just update our position rect to match
        if (this._legacy_position) {
          this.position = this._legacy_position.clone();
        }

        this.calculate_inner_rect();
        this.emit('resize', { component: this, position: this.position });
      } else {
        // New style: use parent's layout system
        super.resize(anchor_position_or_parent_rect);
      }
    } catch (error) {
      this.logger.error(`button resize: ${error.message}`);
    }
  }

  render() {
    try {
      if (this.active !== true) return;

      // Determine absolute position
      let render_position;
      let render_inner;

      if (this._legacy_anchor_position) {
        // Legacy mode: add anchor position
        render_position = this.position.clone();
        render_inner = this.inner.clone();
        render_position.add(this._legacy_anchor_position);
        render_inner.add(render_position);
      } else {
        // New mode: position is already absolute
        render_position = this.position.clone();
        render_inner = this.inner.clone();
        render_inner.add(render_position);
      }

      // Apply hover effect
      let img = this.up_image;
      if (this.is_down) {
        img = this.down_image;
      } else if (this.is_hover) {
        render_position.x += 2;
        render_position.y += 2;
        render_inner.x += 2;
        render_inner.y += 2;
      }

      this.sprites.slice_9(img, render_position, 10, 10);
      this.graphics.font.draw_text(render_inner, this.label, this.centered, this.monospaced);
    } catch (error) {
      this.logger.error(`button render: ${error.message}`);
    }
  }

  /**
   * Override is_inside to handle legacy anchor position
   */
  is_inside(mouse_x, mouse_y) {
    try {
      if (!this.active || !this.position) return false;

      // Transform mouse coordinates from physical to virtual space
      const viewport = this.graphics.viewport;
      const scale = viewport.scale;
      const renderedWidth = viewport.virtual.width * scale.x;
      const renderedHeight = viewport.virtual.height * scale.y;
      const offsetX = (viewport.given.width - renderedWidth) / 2;
      const offsetY = (viewport.given.height - renderedHeight) / 2;
      const virtual_mouse_x = (mouse_x - offsetX) / scale.x;
      const virtual_mouse_y = (mouse_y - offsetY) / scale.y;

      // Calculate absolute position
      let check_position = this.position.clone();
      if (this._legacy_anchor_position) {
        check_position.add(this._legacy_anchor_position);
      }

      return virtual_mouse_x >= check_position.x &&
             virtual_mouse_x <= check_position.x + check_position.width &&
             virtual_mouse_y >= check_position.y &&
             virtual_mouse_y <= check_position.y + check_position.height;
    } catch (error) {
      this.logger.error(`is_inside: ${error.message}`);
      return false;
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

  delete() {
    try {
      if (this.graphics && this.graphics.canvas) {
        this.graphics.canvas.removeEventListener('mousedown', this._bound_mouse_down);
        this.graphics.canvas.removeEventListener('mouseup', this._bound_mouse_up);
        this.graphics.canvas.removeEventListener('mousemove', this._bound_mouse_move);
      }

      delete this.sprites;
      delete this.up_image;
      delete this.down_image;
      delete this.label;
      delete this.is_down;
      delete this.is_hover;
      delete this.monospaced;
      delete this.centered;
      delete this.inner;
      delete this.callback;
      delete this._bound_mouse_down;
      delete this._bound_mouse_up;
      delete this._bound_mouse_move;
      delete this._legacy_position;
      delete this._legacy_anchor_position;

      // Call parent cleanup
      super.delete();
    } catch (error) {
      this.logger.error(`button delete: ${error.message}`);
    }
  }
}
