class scrollbar extends ui_component {
    /**
     * Scrollbar component with proper layout system
     *
     * Usage (new style with layout config):
     *   new scrollbar(parent, graphics, {
     *     anchor_x: "right", anchor_y: "top",
     *     margin_right: 10, margin_top: 10,
     *     width: 31, height: 400,
     *     orientation: "vertical"  // or "horizontal"
     *   }, get_value_callback, set_value_callback);
     *
     * Usage (legacy style - backward compatible):
     *   new scrollbar(parent, graphics, position_rect, anchor_position_rect, orientation, get_value_callback, set_value_callback);
     *
     * Callbacks:
     *   get_value_callback() - returns {current, max} where current is 0 to max
     *   set_value_callback(value) - called when user changes value
     */
    constructor(parent, graphics, position_or_config, anchor_position_or_get_value, orientation_or_set_value, get_value_or_logger, set_value_or_logger, logger) {
        // Detect legacy vs new style constructor
        let layout_config = {};
        let orientation, get_value_callback, set_value_callback;
        let legacy_anchor_position = null;
        let legacy_position = null;
        let is_legacy = (position_or_config && typeof position_or_config === 'object' && 'x' in position_or_config && 'width' in position_or_config);

        if (is_legacy) {
            // Legacy style: (parent, graphics, position, anchor_position, orientation, get_value_callback, set_value_callback, logger)
            let position = position_or_config;
            let anchor_position = anchor_position_or_get_value;
            orientation = orientation_or_set_value;
            get_value_callback = get_value_or_logger;
            set_value_callback = set_value_or_logger;

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
                anchor_y: position._y_mode || "top",
                orientation: orientation || "vertical"
            };

            // Store for assignment after super()
            legacy_anchor_position = anchor_position;
            legacy_position = position;
        } else {
            // New style: (parent, graphics, layout_config, get_value_callback, set_value_callback, logger)
            layout_config = position_or_config || {};
            get_value_callback = anchor_position_or_get_value;
            set_value_callback = orientation_or_set_value;
            orientation = layout_config.orientation || "vertical";
            layout_config.orientation = orientation;
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
            this.orientation = orientation;
            this.get_value_callback = get_value_callback;
            this.set_value_callback = set_value_callback;

            // Button and track rects for hit detection
            this.button_start_rect = null;  // Up/Left button
            this.button_end_rect = null;    // Down/Right button
            this.track_rect = null;
            this.thumb_rect = null;

            // State tracking
            this.button_start_hover = false;
            this.button_start_down = false;
            this.button_end_hover = false;
            this.button_end_down = false;
            this.thumb_hover = false;
            this.is_dragging_thumb = false;
            this.drag_start_pos = 0;  // X or Y depending on orientation
            this.drag_start_value = 0;

            // Store bound event handlers (use visible canvas)
            this._bound_mouse_down = this.handle_mouse_down.bind(this);
            this._bound_mouse_up = this.handle_mouse_up.bind(this);
            this._bound_mouse_move = this.handle_mouse_move.bind(this);

            graphics.visibleCanvas.addEventListener('mousedown', this._bound_mouse_down);
            graphics.visibleCanvas.addEventListener('mouseup', this._bound_mouse_up);
            graphics.visibleCanvas.addEventListener('mousemove', this._bound_mouse_move);
        } catch (error) {
            this.logger.error(`scrollbar constructor: ${error.message}`);
            throw error;
        }
    }

    /**
     * Legacy resize support
     */
    resize(anchor_position_or_parent_rect) {
        try {
            if (this._legacy_position && anchor_position_or_parent_rect) {
                // Legacy mode: update the anchor position
                this._legacy_anchor_position = anchor_position_or_parent_rect;

                // Update position rect
                if (this._legacy_position) {
                    this.position = this._legacy_position.clone();
                }

                this.emit('resize', { component: this, position: this.position });
            } else {
                // New style: use parent's layout system
                super.resize(anchor_position_or_parent_rect);
            }
        } catch (error) {
            this.logger.error(`scrollbar resize: ${error.message}`);
        }
    }

    render() {
        try {
            if (this.active !== true) return;
            if (!this.get_value_callback) return;

            const value_data = this.get_value_callback();
            if (!value_data) return;

            const { current, max } = value_data;
            if (typeof current !== 'number' || typeof max !== 'number' || max <= 0) return;

            // Calculate absolute position
            let scrollbar_x, scrollbar_y, scrollbar_width, scrollbar_height;

            if (this._legacy_anchor_position) {
                // Legacy mode: add anchor position
                let relative_position = this.position.clone();
                relative_position.add(this._legacy_anchor_position);
                scrollbar_x = relative_position.x;
                scrollbar_y = relative_position.y;
                scrollbar_width = this.position.width;
                scrollbar_height = this.position.height;
            } else {
                // New mode: position is already absolute
                scrollbar_x = this.position.x;
                scrollbar_y = this.position.y;
                scrollbar_width = this.position.width;
                scrollbar_height = this.position.height;
            }

            const ctx = this.graphics.ctx;
            const is_horizontal = (this.orientation === "horizontal");

            // Button and thumb dimensions scaled to scrollbar size
            // Original sprite dimensions: up=31x32, down=31x31, thumb=31x53
            const scale_factor = scrollbar_width / 31;
            const button_up_height = Math.round(32 * scale_factor);
            const button_down_height = Math.round(31 * scale_factor);
            const thumb_size = Math.round(53 * scale_factor);
            const track_padding = Math.round(5 * scale_factor);  // Scale padding with scrollbar size

            if (is_horizontal) {
                // HORIZONTAL scrollbar
                // Left button - anchored to LEFT (using up button rotated)
                const left_button_x = scrollbar_x;
                this.button_start_rect = new rect(left_button_x, scrollbar_y, button_up_height, scrollbar_height);

                // Right button - anchored to RIGHT (using down button rotated)
                const right_button_x = scrollbar_x + scrollbar_width - button_down_height;
                this.button_end_rect = new rect(right_button_x, scrollbar_y, button_down_height, scrollbar_height);

                // Track area - BETWEEN the two buttons (with padding to prevent 9-slice overlap)
                const track_x = left_button_x + button_up_height + track_padding;
                const track_width = right_button_x - track_x - track_padding;
                this.track_rect = new rect(track_x, scrollbar_y, track_width, scrollbar_height);

                // Calculate thumb position (fixed size)
                const max_thumb_x = track_x + track_width - thumb_size;
                const thumb_x = Math.min(max_thumb_x, track_x + ((current / max) * (track_width - thumb_size)));
                this.thumb_rect = new rect(thumb_x, scrollbar_y, thumb_size, scrollbar_height);

                // Draw track (9-slice) FIRST, so buttons render on top
                this.graphics.sprites.slice_9("scroll-bg", this.track_rect, 10, 30);

                // Render thumb with state
                let thumb_intensity = 1.0;
                if (this.is_dragging_thumb) thumb_intensity = 0.7;
                else if (this.thumb_hover) thumb_intensity = 0.9;

                // Rotate thumb 90° for horizontal
                ctx.save();
                ctx.translate(thumb_x + thumb_size / 2, scrollbar_y + scrollbar_height / 2);
                ctx.rotate(Math.PI / 2);
                const rotated_rect = new rect(-scrollbar_height / 2, -thumb_size / 2, scrollbar_height, thumb_size);
                this.graphics.sprites.render("scroll-drag", null, rotated_rect, thumb_intensity, "fill");
                ctx.restore();

                // Render left button ON TOP of track (rotate up button 90° clockwise)
                let left_button_intensity = 1.0;
                if (this.button_start_down) left_button_intensity = 0.7;
                else if (this.button_start_hover) left_button_intensity = 0.9;

                ctx.save();
                ctx.translate(left_button_x + button_up_height / 2, scrollbar_y + scrollbar_height / 2);
                ctx.rotate(Math.PI / 2);
                const rotated_left_rect = new rect(-scrollbar_height / 2, -button_up_height / 2, scrollbar_height, button_up_height);
                this.graphics.sprites.render("scroll-up", null, rotated_left_rect, left_button_intensity, "fill");
                ctx.restore();

                // Render right button ON TOP of track (rotate down button 90° clockwise)
                let right_button_intensity = 1.0;
                if (this.button_end_down) right_button_intensity = 0.7;
                else if (this.button_end_hover) right_button_intensity = 0.9;

                ctx.save();
                ctx.translate(right_button_x + button_down_height / 2, scrollbar_y + scrollbar_height / 2);
                ctx.rotate(Math.PI / 2);
                const rotated_right_rect = new rect(-scrollbar_height / 2, -button_down_height / 2, scrollbar_height, button_down_height);
                this.graphics.sprites.render("scroll-down", null, rotated_right_rect, right_button_intensity, "fill");
                ctx.restore();

            } else {
                // VERTICAL scrollbar
                // Up button - anchored to TOP
                const up_button_y = scrollbar_y;
                this.button_start_rect = new rect(scrollbar_x, up_button_y, scrollbar_width, button_up_height);

                // Down button - anchored to BOTTOM
                const down_button_y = scrollbar_y + scrollbar_height - button_down_height;
                this.button_end_rect = new rect(scrollbar_x, down_button_y, scrollbar_width, button_down_height);

                // Track area - BETWEEN the two buttons (with padding to prevent 9-slice overlap)
                const track_y = up_button_y + button_up_height + track_padding;
                const track_height = down_button_y - track_y - track_padding;
                this.track_rect = new rect(scrollbar_x, track_y, scrollbar_width, track_height);

                // Calculate thumb position (fixed size)
                const max_thumb_y = track_y + track_height - thumb_size;
                const thumb_y = Math.min(max_thumb_y, track_y + ((current / max) * (track_height - thumb_size)));
                this.thumb_rect = new rect(scrollbar_x, thumb_y, scrollbar_width, thumb_size);

                // Draw track (9-slice) FIRST, so buttons render on top
                this.graphics.sprites.slice_9("scroll-bg", this.track_rect, 10, 30);

                // Render thumb with state
                let thumb_intensity = 1.0;
                if (this.is_dragging_thumb) thumb_intensity = 0.7;
                else if (this.thumb_hover) thumb_intensity = 0.9;
                this.graphics.sprites.render("scroll-drag", null, this.thumb_rect, thumb_intensity, "fill");

                // Render up button ON TOP of track
                let up_button_intensity = 1.0;
                if (this.button_start_down) up_button_intensity = 0.7;
                else if (this.button_start_hover) up_button_intensity = 0.9;
                this.graphics.sprites.render("scroll-up", null, this.button_start_rect, up_button_intensity, "fill");

                // Render down button ON TOP of track
                let down_button_intensity = 1.0;
                if (this.button_end_down) down_button_intensity = 0.7;
                else if (this.button_end_hover) down_button_intensity = 0.9;
                this.graphics.sprites.render("scroll-down", null, this.button_end_rect, down_button_intensity, "fill");
            }
        } catch (error) {
            this.logger.error(`scrollbar render: ${error.message}`);
        }
    }

    handle_mouse_down(event) {
        try {
            if (this.active !== true) return;

            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

            // Check start button (up/left)
            if (this.is_inside_rect(this.button_start_rect, virtual_mouse_x, virtual_mouse_y)) {
                this.button_start_down = true;
                return;
            }

            // Check end button (down/right)
            if (this.is_inside_rect(this.button_end_rect, virtual_mouse_x, virtual_mouse_y)) {
                this.button_end_down = true;
                return;
            }

            // Check thumb - start dragging
            if (this.is_inside_rect(this.thumb_rect, virtual_mouse_x, virtual_mouse_y)) {
                this.is_dragging_thumb = true;
                this.drag_start_pos = this.orientation === "horizontal" ? virtual_mouse_x : virtual_mouse_y;
                const value_data = this.get_value_callback();
                this.drag_start_value = value_data ? value_data.current : 0;
                return;
            }

            // Check track - page scroll
            if (this.is_inside_rect(this.track_rect, virtual_mouse_x, virtual_mouse_y)) {
                const value_data = this.get_value_callback();
                if (!value_data) return;

                const is_horizontal = (this.orientation === "horizontal");
                const mouse_pos = is_horizontal ? virtual_mouse_x : virtual_mouse_y;
                const thumb_pos = is_horizontal ? this.thumb_rect.x : this.thumb_rect.y;
                const thumb_size = is_horizontal ? this.thumb_rect.width : this.thumb_rect.height;

                // Calculate page size (10% of max)
                const page_size = value_data.max * 0.1;

                let new_value = value_data.current;
                if (mouse_pos < thumb_pos) {
                    // Clicked before thumb - page backward
                    new_value -= page_size;
                } else if (mouse_pos > thumb_pos + thumb_size) {
                    // Clicked after thumb - page forward
                    new_value += page_size;
                }

                new_value = Math.max(0, Math.min(new_value, value_data.max));
                if (this.set_value_callback) {
                    this.set_value_callback(new_value);
                }
            }
        } catch (error) {
            this.logger.error(`scrollbar handle_mouse_down: ${error.message}`);
        }
    }

    handle_mouse_up(event) {
        try {
            if (this.active !== true) return;

            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

            // Handle start button click
            if (this.button_start_down && this.is_inside_rect(this.button_start_rect, virtual_mouse_x, virtual_mouse_y)) {
                const value_data = this.get_value_callback();
                if (value_data && this.set_value_callback) {
                    // Decrement by 1% of max
                    const step = value_data.max * 0.01;
                    const new_value = Math.max(0, value_data.current - step);
                    this.set_value_callback(new_value);
                }
            }

            // Handle end button click
            if (this.button_end_down && this.is_inside_rect(this.button_end_rect, virtual_mouse_x, virtual_mouse_y)) {
                const value_data = this.get_value_callback();
                if (value_data && this.set_value_callback) {
                    // Increment by 1% of max
                    const step = value_data.max * 0.01;
                    const new_value = Math.min(value_data.max, value_data.current + step);
                    this.set_value_callback(new_value);
                }
            }

            this.button_start_down = false;
            this.button_end_down = false;
            this.is_dragging_thumb = false;
        } catch (error) {
            this.logger.error(`scrollbar handle_mouse_up: ${error.message}`);
        }
    }

    handle_mouse_move(event) {
        try {
            if (this.active !== true) return;

            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

            // Handle thumb dragging
            if (this.is_dragging_thumb && this.track_rect) {
                const value_data = this.get_value_callback();
                if (!value_data) return;

                const is_horizontal = (this.orientation === "horizontal");
                const current_pos = is_horizontal ? virtual_mouse_x : virtual_mouse_y;
                const delta = current_pos - this.drag_start_pos;

                // Calculate track size and convert mouse movement to value
                const track_size = is_horizontal ? this.track_rect.width : this.track_rect.height;
                const delta_value = (delta / track_size) * value_data.max;

                let new_value = this.drag_start_value + delta_value;
                new_value = Math.max(0, Math.min(new_value, value_data.max));

                if (this.set_value_callback) {
                    this.set_value_callback(new_value);
                }
                return;
            }

            // Update hover states
            this.button_start_hover = this.is_inside_rect(this.button_start_rect, virtual_mouse_x, virtual_mouse_y);
            this.button_end_hover = this.is_inside_rect(this.button_end_rect, virtual_mouse_x, virtual_mouse_y);
            this.thumb_hover = this.is_inside_rect(this.thumb_rect, virtual_mouse_x, virtual_mouse_y);
        } catch (error) {
            this.logger.error(`scrollbar handle_mouse_move: ${error.message}`);
        }
    }

    is_inside_rect(rect, mouse_x, mouse_y) {
        if (!rect) return false;
        return mouse_x >= rect.x &&
               mouse_x <= rect.x + rect.width &&
               mouse_y >= rect.y &&
               mouse_y <= rect.y + rect.height;
    }

    delete() {
        try {
            // Set active to false first to prevent any ongoing operations
            this.active = false;

            if (this.graphics && this.graphics.visibleCanvas) {
                this.graphics.visibleCanvas.removeEventListener('mousedown', this._bound_mouse_down);
                this.graphics.visibleCanvas.removeEventListener('mouseup', this._bound_mouse_up);
                this.graphics.visibleCanvas.removeEventListener('mousemove', this._bound_mouse_move);
            }

            delete this.sprites;
            delete this.orientation;
            delete this.get_value_callback;
            delete this.set_value_callback;
            delete this.button_start_rect;
            delete this.button_end_rect;
            delete this.track_rect;
            delete this.thumb_rect;
            delete this.button_start_hover;
            delete this.button_start_down;
            delete this.button_end_hover;
            delete this.button_end_down;
            delete this.thumb_hover;
            delete this.is_dragging_thumb;
            delete this.drag_start_pos;
            delete this.drag_start_value;
            delete this._bound_mouse_down;
            delete this._bound_mouse_up;
            delete this._bound_mouse_move;
            delete this._legacy_position;
            delete this._legacy_anchor_position;

            // Call parent cleanup
            super.delete();
        } catch (error) {
            if (this.logger) {
                this.logger.error(`scrollbar delete: ${error.message}`);
            }
        }
    }
}
