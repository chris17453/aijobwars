// Base class for modals that play cinematic scenes with seekbar and pause controls
class cinematic_player extends modal {

    setup_player(scene_url) {
        this.player = new scene(this.window_manager, scene_url);
        this.on("close", () => { this.player.close(); });
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

        // Create seekbar
        let seekbar_position = new rect(10, this.internal_rect.height - 30, this.internal_rect.width - 20, 20, "left", "top");
        this.seekbar = this.create_seekbar(
            seekbar_position,
            () => this.player.get_progress(),
            (time) => this.player.seek_to(time, true)
        );

        // Listen for seek end to resume audio
        this.seekbar.on('seek_end', () => {
            this.player.end_seek();
        });

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

    handle_click(event) {
        if (!this.active || !this.player) return;

        // Check if click is inside the modal window
        const click_x = event.offsetX;
        const click_y = event.offsetY;

        if (click_x >= this.position.x &&
            click_x <= this.position.x + this.position.width &&
            click_y >= this.position.y &&
            click_y <= this.position.y + this.position.height) {

            // Don't toggle if clicking on the close button
            if (this.closeButton && this.buttons) {
                let clicking_button = false;
                this.buttons.forEach((button) => {
                    if (button.is_inside(click_x, click_y)) {
                        clicking_button = true;
                    }
                });

                // Don't toggle if clicking on seekbar
                if (this.seekbar && this.seekbar.is_inside(click_x, click_y)) {
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

    handle_keys(kb) {
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
