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
        this._bound_keys_handler = (data) => {
            this.handle_cinematic_keys(data.kb);
        };
        this.on("keys", this._bound_keys_handler);

        // Create horizontal scrollbar for video scrubbing - position will be recalculated on resize
        // Start with relative dimensions (will be properly positioned in resize)
        let scrollbar_position = new rect(10, 0, 100, 20, "left", "top");
        this.video_scrollbar = this.create_video_scrollbar(
            scrollbar_position,
            () => this.player ? this.player.get_progress() : {current: 0, max: 1},
            (time) => { if (this.player) this.player.seek_to(time, true); }
        );

        // Add video scrollbar to ui_components so it gets resized automatically
        this.ui_components.push(this.video_scrollbar);

        // Initial positioning
        this.position_video_scrollbar();

        // Add click handler for pause/play (use visible canvas)
        this._bound_click_handler = this.handle_click.bind(this);
        this.graphics.visibleCanvas.addEventListener('click', this._bound_click_handler);
    }

    create_video_scrollbar(position, get_progress_callback, seek_callback) {
        // Video scrollbar is positioned relative to the modal's internal rect (virtual coordinates)
        let anchor_position = new rect(0, 0, 0, 0);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);

        // Convert progress callback to return {current, max} format expected by scrollbar
        const get_value_callback = () => {
            const progress = get_progress_callback();
            if (!progress) return {current: 0, max: 1};
            return {current: progress.current, max: progress.total};
        };

        const scrollbar_instance = new scrollbar(this, this.graphics, position, anchor_position, "horizontal", get_value_callback, seek_callback);

        // Listen for drag_end event to finalize seek
        scrollbar_instance.on('drag_end', () => {
            if (this.player) {
                const progress = get_progress_callback();
                if (progress) {
                    this.player.seek_to(progress.current, false);  // false = drag complete, allow audio
                }
            }
        });

        return scrollbar_instance;
    }

    /**
     * Position video scrollbar at bottom of dialog, anchored to left and right edges
     * Called on initial setup and whenever the dialog resizes
     */
    position_video_scrollbar() {
        if (!this.video_scrollbar || !this.internal_rect) return;

        // Scale scrollbar thickness based on orientation (match vertical scrollbar scaling)
        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const scrollbar_height = 31 * fontScale;  // Same scaling as vertical scrollbar width

        // Anchor scrollbar to left and right edges with 10px margin, 30px from bottom
        const margin_x = 10;
        const margin_bottom = 30;

        // Update the video scrollbar's position rect
        if (this.video_scrollbar._legacy_position) {
            // Update legacy position using a clone to avoid mutating shared rects
            const updated_position = this.video_scrollbar._legacy_position.clone();
            updated_position.x = margin_x;
            updated_position.y = this.internal_rect.height - margin_bottom;
            updated_position.width = this.internal_rect.width - (margin_x * 2);
            updated_position.height = scrollbar_height;

            // Persist cloned positions
            this.video_scrollbar._legacy_position = updated_position;
            this.video_scrollbar.position = updated_position.clone();
        }
    }

    /**
     * Override resize to reposition video scrollbar when dialog resizes
     */
    resize() {
        super.resize();
        this.position_video_scrollbar();
    }

    handle_click(event) {
        if (!this.active || !this.player) return;

        // Transform mouse coordinates from physical to virtual space
        const viewport = this.graphics.viewport;
        const virtual_click_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
        const virtual_click_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

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

                // Don't toggle if clicking on video scrollbar (scrollbar handles transformation internally)
                if (this.video_scrollbar && this.video_scrollbar.active) {
                    // Check if clicking inside scrollbar bounds (use visible canvas coordinates)
                    const viewport = this.graphics.viewport;
                    const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
                    const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

                    let scrollbar_absolute_pos = this.video_scrollbar.position.clone();
                    if (this.video_scrollbar._legacy_anchor_position) {
                        scrollbar_absolute_pos.add(this.video_scrollbar._legacy_anchor_position);
                    }

                    if (virtual_mouse_x >= scrollbar_absolute_pos.x &&
                        virtual_mouse_x <= scrollbar_absolute_pos.x + scrollbar_absolute_pos.width &&
                        virtual_mouse_y >= scrollbar_absolute_pos.y &&
                        virtual_mouse_y <= scrollbar_absolute_pos.y + scrollbar_absolute_pos.height) {
                        clicking_button = true;
                    }
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

        // Render video scrollbar
        if (this.video_scrollbar) {
            this.video_scrollbar.render();
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

        // Clean up video scrollbar
        if (this.video_scrollbar) {
            this.video_scrollbar.delete();
            this.video_scrollbar = null;
        }

        // Clean up keyboard listener
        if (this._bound_keys_handler && this.events && this.events.keys) {
            this.events.keys = this.events.keys.filter((cb) => cb !== this._bound_keys_handler);
        }
        this._bound_keys_handler = null;

        // Clean up click handler (from visible canvas)
        if (this._bound_click_handler && this.graphics && this.graphics.visibleCanvas && this.graphics.visibleCanvas.removeEventListener) {
            this.graphics.visibleCanvas.removeEventListener('click', this._bound_click_handler);
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
