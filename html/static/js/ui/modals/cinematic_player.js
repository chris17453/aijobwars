// Base class for modals that play cinematic scenes with seekbar and pause controls
class cinematic_player extends modal {

    setup_player(scene_url) {
        this.player = new scene(this.window_manager, scene_url);
        this.on("close", () => { if (this.player) this.player.close(); });
        this.player.on("complete", () => {
            // Scene finished, close the modal
            this.close();
        });
        this.render_callback(this.player.update_frame.bind(this.player));

        // Resume audio context on first user interaction (browser autoplay policy)
        this._resume_audio_once = async () => {
            if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
                await this.audio_manager.audioContext.resume();
                console.log('[CinematicPlayer] Audio context resumed on user interaction');
            }
        };
        // Call it once immediately when modal opens
        this._resume_audio_once();

        // Listen to modal's keyboard events
        this.on("keys", (data) => {
            this.handle_cinematic_keys(data.kb);
        });

        // Create seekbar - position will be recalculated on resize
        // Start with relative dimensions (will be properly positioned in resize)
        let seekbar_position = new rect(10, 0, 100, 20, "left", "top");
        this.seekbar = this.create_seekbar(
            seekbar_position,
            () => this.player ? this.player.get_progress() : null,
            (time) => { if (this.player) this.player.seek_to(time, true); }
        );

        // Add seekbar to ui_components so it gets resized automatically
        this.ui_components.push(this.seekbar);

        // Listen for seek end to resume audio
        this.seekbar.on('seek_end', () => {
            if (this.player) this.player.end_seek();
        });

        // Initial positioning
        this.position_seekbar();

        // Add click handler for pause/play
        this._bound_click_handler = this.handle_click.bind(this);
        this.graphics.canvas.addEventListener('click', this._bound_click_handler);
    }

    create_seekbar(position, get_progress_callback, seek_callback) {
        // Seekbar is positioned relative to the modal's internal rect (virtual coordinates)
        let anchor_position = new rect(0, 0, 0, 0);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);

        return new seekbar(this, this.graphics, position, anchor_position, get_progress_callback, seek_callback);
    }

    /**
     * Position seekbar at bottom of dialog, anchored to left and right edges
     * Called on initial setup and whenever the dialog resizes
     */
    position_seekbar() {
        if (!this.seekbar || !this.internal_rect) return;

        // Anchor seekbar to left and right edges with 10px margin, 30px from bottom
        const margin_x = 10;
        const margin_bottom = 30;
        const seekbar_height = 20;

        // Update the seekbar's position rect
        if (this.seekbar._legacy_position) {
            // Update legacy position directly
            this.seekbar._legacy_position.x = margin_x;
            this.seekbar._legacy_position.y = this.internal_rect.height - margin_bottom;
            this.seekbar._legacy_position.width = this.internal_rect.width - (margin_x * 2);
            this.seekbar._legacy_position.height = seekbar_height;

            // Update the actual position rect
            this.seekbar.position = this.seekbar._legacy_position.clone();
        }
    }

    /**
     * Override resize to reposition seekbar when dialog resizes
     */
    resize() {
        super.resize();
        this.position_seekbar();
    }

    handle_click(event) {
        if (!this.active || !this.player) return;

        // Transform mouse coordinates from physical to virtual space
        const viewport = this.graphics.viewport;
        const scale = viewport.scale;
        const renderedWidth = viewport.virtual.width * scale.x;
        const renderedHeight = viewport.virtual.height * scale.y;
        const offsetX = (viewport.given.width - renderedWidth) / 2;
        const offsetY = (viewport.given.height - renderedHeight) / 2;
        const virtual_click_x = (event.offsetX - offsetX) / scale.x;
        const virtual_click_y = (event.offsetY - offsetY) / scale.y;

        // Check if click is inside the modal window (using virtual coordinates)
        if (virtual_click_x >= this.position.x &&
            virtual_click_x <= this.position.x + this.position.width &&
            virtual_click_y >= this.position.y &&
            virtual_click_y <= this.position.y + this.position.height) {

            // Don't toggle if clicking on the close button
            if (this.closeButton && this.buttons) {
                let clicking_button = false;
                this.buttons.forEach((button) => {
                    if (button.is_inside(event.offsetX, event.offsetY)) {
                        clicking_button = true;
                    }
                });

                // Don't toggle if clicking on seekbar (seekbar handles transformation internally)
                if (this.seekbar && this.seekbar.is_inside(event.offsetX, event.offsetY)) {
                    clicking_button = true;
                }

                if (!clicking_button) {
                    this.player.toggle_pause();
                }
            } else {
                this.player.toggle_pause();
            }
        }
    }

    handle_cinematic_keys(kb) {
        if (!this.active || !this.player) return;

        // Space to pause/play
        if (kb.just_stopped(' ')) {
            this.player.toggle_pause();
        }

        // Left/Right arrows to seek
        if (kb.just_stopped('ArrowLeft')) {
            const new_time = Math.max(0, this.player.elapsed - 5000); // 5 seconds back
            this.player.seek_to(new_time, false);
        }
        if (kb.just_stopped('ArrowRight')) {
            const new_time = this.player.elapsed + 5000; // 5 seconds forward
            this.player.seek_to(new_time, false);
        }
    }

    render() {
        // Early exit if not active or graphics is deleted - BEFORE calling super
        if (!this.active || !this.graphics || !this.graphics.ctx) return;

        // Now safe to call super.render()
        super.render();

        // Render seekbar
        if (this.seekbar) {
            this.seekbar.render();
        }

        // Draw pause/play indicator in center of video area
        if (this.player && this.graphics && this.graphics.ctx) {
            const ctx = this.graphics.ctx;
            if (!ctx || typeof ctx.save !== 'function') return;

            const center_x = this.position.x + this.position.width / 2;
            const center_y = this.position.y + this.position.height / 2;
            const radius = 50;

            ctx.save();

            if (this.player.paused) {
                // Draw pause icon (two vertical bars)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                const bar_width = 12;
                const bar_height = 40;
                const bar_spacing = 10;
                ctx.fillRect(center_x - bar_spacing - bar_width, center_y - bar_height/2, bar_width, bar_height);
                ctx.fillRect(center_x + bar_spacing, center_y - bar_height/2, bar_width, bar_height);
            }

            ctx.restore();
        }
    }

    delete() {
        // Set inactive first to stop rendering
        this.active = false;

        // Clean up seekbar
        if (this.seekbar) {
            this.seekbar.delete();
            this.seekbar = null;
        }

        // Clean up click handler
        if (this._bound_click_handler && this.graphics && this.graphics.canvas) {
            this.graphics.canvas.removeEventListener('click', this._bound_click_handler);
            this._bound_click_handler = null;
        }

        // Clean up player
        if (this.player) {
            this.player.close();
            this.player = null;
        }

        super.delete();
    }
}
