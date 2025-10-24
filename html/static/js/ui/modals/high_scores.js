class high_scores extends modal{
    layout(){
        this.set_background("highscore");
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.closeButton=true;
        this.title="High Scores";
        this.text="";

        // Store landscape dimensions
        this.landscape_width = 800;
        this.landscape_height = 600;

        // Calculate initial dimensions
        const dims = this.calculate_dialog_dimensions(this.landscape_width, this.landscape_height);
        this.position = new rect(dims.x, dims.y, dims.width, dims.height, "left", "top");
        this.resize();
        this.add_buttons();
        this.high_scores=null;
        this.scroll_offset=0;

        // Line height - doubled in portrait mode
        const isPortrait = this.graphics.viewport.isPortrait();
        this.line_height = isPortrait ? 80 : 40;

        // Load highscores from ASSETS.json
        const highscores_path = this.graphics.asset_loader.get('game_data.highscores');
        this.load_high_scores(highscores_path);
        this.render_callback(this.render_scores.bind(this));

        // Listen to modal's keyboard events
        this.on("keys", (data) => {
            this.handle_scroll_keys(data.kb);
        });

        // Mouse wheel scrolling (use visible canvas for events)
        this._bound_wheel_handler = this.handle_wheel.bind(this);
        this.visibleCanvas.addEventListener('wheel', this._bound_wheel_handler);

        // Create scrollbar component with proper anchoring (initially inactive, will be activated when needed)
        const fontScale = isPortrait ? 2 : 1;
        const scrollbar_width = 31 * fontScale;
        const header_height = 60 * fontScale;

        // Calculate absolute x position from right edge
        const scrollbar_x = this.internal_rect.width - scrollbar_width - (5 * fontScale);

        const scrollbar_pos = new rect(
            scrollbar_x,                          // Relative to internal_rect
            header_height,                        // Distance from TOP
            scrollbar_width,
            this.internal_rect.height - header_height,
            "left",
            "top"
        );

        // Create anchor position that includes both modal position and internal_rect
        let anchor_position = new rect(0, 0, 0, 0);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);

        this.scrollbar_component = new scrollbar(
            this, this.graphics, scrollbar_pos, anchor_position, "vertical",
            () => this.get_scroll_value(),
            (value) => this.set_scroll_value(value)
        );
        this.scrollbar_component.active = false;
    }

    get_scroll_value() {
        if (!this.high_scores) return { current: 0, max: 1 };

        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale;
        const scrollable_height = this.render_internal_rect.height - header_height;
        const max_scroll = Math.max(1, (this.high_scores.length * this.line_height) - scrollable_height);

        return { current: this.scroll_offset, max: max_scroll };
    }

    set_scroll_value(value) {
        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale;
        const scrollable_height = this.render_internal_rect.height - header_height;
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);

        this.scroll_offset = Math.max(0, Math.min(value, max_scroll));
    }

    async load_high_scores(jsonFileUrl){
        try {
                const response = await fetch(jsonFileUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.high_scores=data;
        } catch (error) {
            console.error("Error loading the JSON file:", error);
        }
     }

    handle_wheel(event) {
        if (!this.active || !this.high_scores) return;

        // Check if mouse is over the modal window (use visible canvas)
        const rect = this.visibleCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (mouseX >= this.render_internal_rect.x &&
            mouseX <= this.render_internal_rect.x + this.render_internal_rect.width &&
            mouseY >= this.render_internal_rect.y &&
            mouseY <= this.render_internal_rect.y + this.render_internal_rect.height) {

            event.preventDefault();

            // Scroll by wheel delta
            this.scroll_offset += event.deltaY * 0.5;

            // Clamp scroll offset - account for portrait mode
            const isPortrait = this.graphics.viewport.isPortrait();
            const fontScale = isPortrait ? 2 : 1;
            const header_height = 60 * fontScale;
            const scrollable_height = this.render_internal_rect.height - header_height;
            const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
            this.scroll_offset = Math.max(0, Math.min(this.scroll_offset, max_scroll));
        }
    }

    handle_scroll_keys(kb) {
        if (!this.active || !this.high_scores) return;

        // Arrow key scrolling
        if (kb.is_pressed('ArrowUp')) {
            this.scroll_offset -= 5;
        }
        if (kb.is_pressed('ArrowDown')) {
            this.scroll_offset += 5;
        }

        // Page up/down scrolling - account for portrait mode
        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale;
        const scrollable_height = this.render_internal_rect.height - header_height;

        if (kb.just_stopped('PageUp')) {
            this.scroll_offset -= scrollable_height;
        }
        if (kb.just_stopped('PageDown')) {
            this.scroll_offset += scrollable_height;
        }

        // Home/End
        if (kb.just_stopped('Home')) {
            this.scroll_offset = 0;
        }
        if (kb.just_stopped('End')) {
            const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
            this.scroll_offset = max_scroll;
        }

        // Clamp scroll offset
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
        this.scroll_offset = Math.max(0, Math.min(this.scroll_offset, max_scroll));
    }

    render_scores(position) {
        if (!this.high_scores) {
            // Show loading text
            let loading_pos = new rect(position.x + position.width/2, position.y + position.height/2, null, null, "center", "center");
            this.graphics.font.draw_text(loading_pos, "Loading...", true, false);
            return;
        }

        const ctx = this.graphics.ctx;
        const isPortrait = this.graphics.viewport.isPortrait();

        // Double sizes in portrait mode
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale; // Height reserved for header
        const start_y = position.y + (70 * fontScale) - this.scroll_offset;
        const header_y = position.y + (40 * fontScale);

        // Draw column headers (fixed at top)
        ctx.save();
        ctx.fillStyle = '#00FFFF';
        ctx.font = `bold ${18 * fontScale}px monospace`;

        const rank_x = position.x + (20 * fontScale);
        const name_x = position.x + (100 * fontScale);
        const score_x = position.x + position.width - (150 * fontScale);

        ctx.fillText("Rank", rank_x, header_y);
        ctx.fillText("Name", name_x, header_y);
        ctx.fillText("Score", score_x, header_y);

        // Draw separator line
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2 * fontScale;
        ctx.beginPath();
        ctx.moveTo(position.x + (10 * fontScale), header_y + (10 * fontScale));
        ctx.lineTo(position.x + position.width - (10 * fontScale), header_y + (10 * fontScale));
        ctx.stroke();

        // Draw scores (clip to scrollable area below header)
        ctx.font = `${16 * fontScale}px monospace`;
        for (let i = 0; i < this.high_scores.length; i++) {
            const score = this.high_scores[i];
            const y = start_y + (i * this.line_height);

            // Skip if outside visible area (below header and above bottom)
            if (y < position.y + header_height || y > position.y + position.height) {
                continue;
            }

            // Highlight current player (if name matches)
            if (score.name === "Chris Watkins") {
                ctx.fillStyle = '#FFFF00';
            } else {
                // Gradient colors based on rank
                if (score.rank === 1) ctx.fillStyle = '#FFD700'; // Gold
                else if (score.rank === 2) ctx.fillStyle = '#C0C0C0'; // Silver
                else if (score.rank === 3) ctx.fillStyle = '#CD7F32'; // Bronze
                else ctx.fillStyle = '#00FF00'; // Green
            }

            ctx.fillText(score.rank.toString(), rank_x, y);
            ctx.fillText(score.name, name_x, y);
            ctx.fillText(score.score.toLocaleString(), score_x, y);
        }

        ctx.restore();

        // Update scrollbar component state
        const scrollable_height = position.height - header_height;
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);

        if (max_scroll > 0) {
            // Activate and render scrollbar
            this.scrollbar_component.active = true;
            this.scrollbar_component.render();
        } else {
            // No scrolling needed, deactivate scrollbar
            this.scrollbar_component.active = false;
        }
    }


    delete() {
        // Remove wheel event listener (from visible canvas)
        if (this._bound_wheel_handler) {
            this.visibleCanvas.removeEventListener('wheel', this._bound_wheel_handler);
        }

        // Clean up scrollbar component
        if (this.scrollbar_component) {
            this.scrollbar_component.delete();
            this.scrollbar_component = null;
        }

        super.delete();
    }
}
