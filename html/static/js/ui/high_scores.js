class high_scores extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.closeButton=true;
        this.title="High Scores";
        this.text="";
        let window_width=800;
        let window_height=600;
        // Use virtual viewport dimensions for positioning (logical pixels)
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
        this.high_scores=null;
        this.scroll_offset=0;
        this.line_height=40;
        this.load_high_scores("static/json/highscores.json");
        this.render_callback(this.render_scores.bind(this));

        // Mouse wheel scrolling
        this._bound_wheel_handler = this.handle_wheel.bind(this);
        this.canvas.addEventListener('wheel', this._bound_wheel_handler);
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

        // Check if mouse is over the modal window
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (mouseX >= this.render_internal_rect.x &&
            mouseX <= this.render_internal_rect.x + this.render_internal_rect.width &&
            mouseY >= this.render_internal_rect.y &&
            mouseY <= this.render_internal_rect.y + this.render_internal_rect.height) {

            event.preventDefault();

            // Scroll by wheel delta
            this.scroll_offset += event.deltaY * 0.5;

            // Clamp scroll offset
            const header_height = 60;
            const scrollable_height = this.render_internal_rect.height - header_height;
            const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
            this.scroll_offset = Math.max(0, Math.min(this.scroll_offset, max_scroll));
        }
    }

    handle_keys(kb) {
        if (!this.active || !this.high_scores) return;

        // Arrow key scrolling
        if (kb.is_pressed('ArrowUp')) {
            this.scroll_offset -= 5;
        }
        if (kb.is_pressed('ArrowDown')) {
            this.scroll_offset += 5;
        }

        // Page up/down scrolling
        const header_height = 60;
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
        const header_height = 60; // Height reserved for header
        const start_y = position.y + 70 - this.scroll_offset;
        const header_y = position.y + 40;

        // Draw column headers (fixed at top)
        ctx.save();
        ctx.fillStyle = '#00FFFF';
        ctx.font = 'bold 18px monospace';

        const rank_x = position.x + 20;
        const name_x = position.x + 100;
        const score_x = position.x + position.width - 150;

        ctx.fillText("Rank", rank_x, header_y);
        ctx.fillText("Name", name_x, header_y);
        ctx.fillText("Score", score_x, header_y);

        // Draw separator line
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(position.x + 10, header_y + 10);
        ctx.lineTo(position.x + position.width - 10, header_y + 10);
        ctx.stroke();

        // Draw scores (clip to scrollable area below header)
        ctx.font = '16px monospace';
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

        // Draw scrollbar if needed
        const scrollable_height = position.height - header_height;
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
        if (max_scroll > 0) {
            const scrollbar_height = Math.max(30, (scrollable_height / (this.high_scores.length * this.line_height)) * scrollable_height);
            const scrollbar_y = position.y + header_height + ((this.scroll_offset / max_scroll) * (scrollable_height - scrollbar_height));
            const scrollbar_x = position.x + position.width - 15;

            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(scrollbar_x, scrollbar_y, 10, scrollbar_height);
        }

        ctx.restore();
    }

    delete() {
        // Remove wheel event listener
        if (this._bound_wheel_handler) {
            this.canvas.removeEventListener('wheel', this._bound_wheel_handler);
        }
        super.delete();
    }
}