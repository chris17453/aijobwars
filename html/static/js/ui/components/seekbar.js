class seekbar extends ui_component {
    /**
     * Seekbar component with proper layout system
     *
     * Usage (new style with layout config):
     *   new seekbar(parent, graphics, {
     *     anchor_x: "left", anchor_y: "bottom",
     *     margin_left: 10, margin_right: 10, margin_bottom: 30,
     *     height: 20,
     *     width_mode: "fill"  // Fill parent width minus margins
     *   }, get_progress_callback, seek_callback);
     *
     * Usage (legacy style - backward compatible):
     *   new seekbar(parent, graphics, position_rect, anchor_position_rect, get_progress_callback, seek_callback);
     */
    constructor(parent, graphics, position_or_config, anchor_position_or_get_progress, get_progress_or_seek, seek_callback_or_logger, logger) {
        // Detect legacy vs new style constructor
        let layout_config = {};
        let get_progress_callback, seek_callback;
        let legacy_anchor_position = null;
        let legacy_position = null;
        let is_legacy = (position_or_config && typeof position_or_config === 'object' && 'x' in position_or_config && 'width' in position_or_config);

        if (is_legacy) {
            // Legacy style: (parent, graphics, position, anchor_position, get_progress_callback, seek_callback, logger)
            let position = position_or_config;
            let anchor_position = anchor_position_or_get_progress;
            get_progress_callback = get_progress_or_seek;
            seek_callback = seek_callback_or_logger;

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
            // New style: (parent, graphics, layout_config, get_progress_callback, seek_callback, logger)
            layout_config = position_or_config || {};
            get_progress_callback = anchor_position_or_get_progress;
            seek_callback = get_progress_or_seek;
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
            this.get_progress_callback = get_progress_callback; // Function that returns {current, total, paused}
            this.seek_callback = seek_callback; // Function called when user seeks
            this.is_dragging = false;

            // Store bound event handlers (use visible canvas for events)
            this._bound_mouse_down = this.handle_mouse_down.bind(this);
            this._bound_mouse_up = this.handle_mouse_up.bind(this);
            this._bound_mouse_move = this.handle_mouse_move.bind(this);

            graphics.visibleCanvas.addEventListener('mousedown', this._bound_mouse_down);
            graphics.visibleCanvas.addEventListener('mouseup', this._bound_mouse_up);
            graphics.visibleCanvas.addEventListener('mousemove', this._bound_mouse_move);
        } catch (error) {
            this.logger.error(`seekbar constructor: ${error.message}`);
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
            this.logger.error(`seekbar resize: ${error.message}`);
        }
    }

    render() {
        try {
            if (this.active !== true) return;
            if (!this.ctx || !this.graphics || !this.position) return;

            const progress_data = this.get_progress_callback();
            if (!progress_data) return;

            const {current, total, paused} = progress_data;

            // Ensure we have valid numbers
            if (typeof current !== 'number' || typeof total !== 'number') return;

            // Calculate absolute position
            let seekbar_x, seekbar_y, seekbar_width, seekbar_height;

            if (this._legacy_anchor_position) {
                // Legacy mode: add anchor position
                let relative_position = this.position.clone();
                relative_position.add(this._legacy_anchor_position);
                seekbar_x = relative_position.x;
                seekbar_y = relative_position.y;
                seekbar_width = this.position.width;
                seekbar_height = this.position.height;
            } else {
                // New mode: position is already absolute
                seekbar_x = this.position.x;
                seekbar_y = this.position.y;
                seekbar_width = this.position.width;
                seekbar_height = this.position.height;
            }

            // Calculate progress
            const progress = total > 0 ? Math.min(1, current / total) : 0;

            this.ctx.save();

            // Background track
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
            this.ctx.fillRect(seekbar_x, seekbar_y, seekbar_width, seekbar_height);

            // Progress bar
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.fillRect(seekbar_x, seekbar_y, seekbar_width * progress, seekbar_height);

            // Handle (thumb)
            const handle_x = seekbar_x + (seekbar_width * progress);
            const handle_width = 10;
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.fillRect(handle_x - handle_width/2, seekbar_y - 5, handle_width, seekbar_height + 10);

            // Time display
            const current_time_str = this.format_time(current / 1000);
            const total_time_str = this.format_time(total / 1000);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${current_time_str} / ${total_time_str}`, seekbar_x, seekbar_y - 10);

            // Pause/Play indicator
            this.ctx.textAlign = 'right';
            this.ctx.fillText(paused ? '[PAUSED]' : '[PLAYING]', seekbar_x + seekbar_width, seekbar_y - 10);

            this.ctx.restore();
        } catch (error) {
            this.logger.error(`seekbar render: ${error.message}`);
        }
    }

    format_time(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Override is_inside to handle legacy anchor position
     */
    is_inside(mouse_x, mouse_y) {
        try {
            if (this.active !== true || !this.position) return false;

            // Transform mouse coordinates to virtual space
            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (mouse_x - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (mouse_y - viewport.offset.y) / viewport.scale.y;

            // Calculate absolute position
            let check_position = this.position.clone();
            if (this._legacy_anchor_position) {
                check_position.add(this._legacy_anchor_position);
            }

            // Expand clickable area slightly above and below the bar
            const clickable_padding = 5;

            return virtual_mouse_x >= check_position.x &&
                   virtual_mouse_x <= check_position.x + this.position.width &&
                   virtual_mouse_y >= check_position.y - clickable_padding &&
                   virtual_mouse_y <= check_position.y + this.position.height + clickable_padding;
        } catch (error) {
            this.logger.error(`is_inside: ${error.message}`);
            return false;
        }
    }

    handle_mouse_down(event) {
        try {
            if (this.active !== true) return;
            if (this.is_inside(event.offsetX, event.offsetY)) {
                this.is_dragging = true;
                this.emit('seek_start');
                this.handle_seek(event.offsetX, event.offsetY);
            }
        } catch (error) {
            this.logger.error(`handle_mouse_down: ${error.message}`);
        }
    }

    handle_mouse_up(event) {
        try {
            if (this.active !== true) return;
            if (this.is_dragging) {
                this.is_dragging = false;
                this.emit('seek_end');
            }
        } catch (error) {
            this.logger.error(`handle_mouse_up: ${error.message}`);
        }
    }

    handle_mouse_move(event) {
        try {
            if (this.active !== true) return;
            if (this.is_dragging) {
                this.handle_seek(event.offsetX, event.offsetY);
            }
        } catch (error) {
            this.logger.error(`handle_mouse_move: ${error.message}`);
        }
    }

    handle_seek(mouse_x, mouse_y) {
        try {
            const progress_data = this.get_progress_callback();
            if (!progress_data) return;

            // Transform mouse coordinates to virtual space
            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (mouse_x - viewport.offset.x) / viewport.scale.x;

            // Calculate absolute position
            let seekbar_x, seekbar_width;
            if (this._legacy_anchor_position) {
                let relative_position = this.position.clone();
                relative_position.add(this._legacy_anchor_position);
                seekbar_x = relative_position.x;
                seekbar_width = this.position.width;
            } else {
                seekbar_x = this.position.x;
                seekbar_width = this.position.width;
            }

            // Calculate new time based on click position (in virtual coordinates)
            const click_ratio = Math.max(0, Math.min(1, (virtual_mouse_x - seekbar_x) / seekbar_width));
            const new_time = progress_data.total * click_ratio;

            if (this.seek_callback) {
                this.seek_callback(new_time);
            }

            this.emit('seek', {time: new_time, ratio: click_ratio});
        } catch (error) {
            this.logger.error(`handle_seek: ${error.message}`);
        }
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

            delete this.get_progress_callback;
            delete this.seek_callback;
            delete this.is_dragging;
            delete this._bound_mouse_down;
            delete this._bound_mouse_up;
            delete this._bound_mouse_move;
            delete this._legacy_position;
            delete this._legacy_anchor_position;

            // Call parent cleanup
            super.delete();
        } catch (error) {
            if (this.logger) {
                this.logger.error(`seekbar delete: ${error.message}`);
            }
        }
    }
}
