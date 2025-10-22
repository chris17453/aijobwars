class seekbar extends events {
    constructor(parent, graphics, position, anchor_position, get_progress_callback, seek_callback, logger) {
        super();
        this.logger = logger || console;
        try {
            this.parent = parent;
            this.graphics = graphics;
            this.ctx = graphics.ctx;
            this.position = position;
            this.anchor_position = anchor_position;
            this.get_progress_callback = get_progress_callback; // Function that returns {current, total, paused}
            this.seek_callback = seek_callback; // Function called when user seeks
            this.active = true;
            this.is_dragging = false;

            // Store bound event handlers
            this._bound_mouse_down = this.handle_mouse_down.bind(this);
            this._bound_mouse_up = this.handle_mouse_up.bind(this);
            this._bound_mouse_move = this.handle_mouse_move.bind(this);

            graphics.canvas.addEventListener('mousedown', this._bound_mouse_down);
            graphics.canvas.addEventListener('mouseup', this._bound_mouse_up);
            graphics.canvas.addEventListener('mousemove', this._bound_mouse_move);
        } catch (error) {
            this.logger.error(`seekbar constructor: ${error.message}`);
            throw error;
        }
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

            const progress_data = this.get_progress_callback();
            if (!progress_data) return;

            const {current, total, paused} = progress_data;

            // Ensure we have valid numbers
            if (typeof current !== 'number' || typeof total !== 'number') return;

            // Calculate absolute position
            let relative_position = this.position.clone();
            relative_position.add(this.anchor_position);

            const seekbar_x = relative_position.x;
            const seekbar_y = relative_position.y;
            const seekbar_width = this.position.width;
            const seekbar_height = this.position.height;

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
            this.logger.error(`render: ${error.message}`);
        }
    }

    format_time(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            const scale = viewport.scale;
            const renderedWidth = viewport.virtual.width * scale.x;
            const renderedHeight = viewport.virtual.height * scale.y;
            const offsetX = (viewport.given.width - renderedWidth) / 2;
            const offsetY = (viewport.given.height - renderedHeight) / 2;
            const virtual_mouse_x = (mouse_x - offsetX) / scale.x;

            let relative_position = this.position.clone();
            relative_position.add(this.anchor_position);

            const seekbar_x = relative_position.x;
            const seekbar_width = this.position.width;

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

    is_inside(mouse_x, mouse_y) {
        try {
            if (this.active !== true || !this.position || !this.anchor_position) return false;

            // Transform mouse coordinates to virtual space
            const viewport = this.graphics.viewport;
            const scale = viewport.scale;
            const renderedWidth = viewport.virtual.width * scale.x;
            const renderedHeight = viewport.virtual.height * scale.y;
            const offsetX = (viewport.given.width - renderedWidth) / 2;
            const offsetY = (viewport.given.height - renderedHeight) / 2;
            const virtual_mouse_x = (mouse_x - offsetX) / scale.x;
            const virtual_mouse_y = (mouse_y - offsetY) / scale.y;

            let relative_position = this.position.clone();
            relative_position.add(this.anchor_position);

            // Expand clickable area slightly above and below the bar
            const clickable_padding = 5;

            return virtual_mouse_x >= relative_position.x &&
                   virtual_mouse_x <= relative_position.x + this.position.width &&
                   virtual_mouse_y >= relative_position.y - clickable_padding &&
                   virtual_mouse_y <= relative_position.y + this.position.height + clickable_padding;
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
            // Set active to false first to prevent any ongoing operations
            this.active = false;

            if (this.graphics && this.graphics.canvas) {
                this.graphics.canvas.removeEventListener('mousedown', this._bound_mouse_down);
                this.graphics.canvas.removeEventListener('mouseup', this._bound_mouse_up);
                this.graphics.canvas.removeEventListener('mousemove', this._bound_mouse_move);
            }

            delete this.parent;
            delete this.graphics;
            delete this.ctx;
            delete this.position;
            delete this.anchor_position;
            delete this.get_progress_callback;
            delete this.seek_callback;
            delete this.is_dragging;
            delete this._bound_mouse_down;
            delete this._bound_mouse_up;
            delete this._bound_mouse_move;
        } catch (error) {
            if (this.logger) {
                this.logger.error(`delete: ${error.message}`);
            }
        }
    }
}
