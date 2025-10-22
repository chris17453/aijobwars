class menu extends modal{
    constructor(){
        super();

        // Store button data for resize recalculation
        this.menu_buttons = [];
        this.title_image = null;
        this.glow_phase = 0;  // For pulsing glow animation
    }

    layout(){
        //window specifics
        this.set_background("menu");
        this.ok=false;
        this.cancel=false;
        this.closeButton=false;  // No close button for main menu
        this.no_close=true;  // Prevent ESC from closing main menu
        this.title="Menu";
        this.text="";
        this.active=true;

        // Use virtual viewport dimensions (logical pixels, not physical)
        let vw = this.graphics.viewport.virtual.width;
        let vh = this.graphics.viewport.virtual.height;

        // Menu scales with viewport - fixed size, left-anchored at 60px
        let window_width = 400;
        let window_height = 600;
        let x = 60;  // Left-anchored at 60 pixels
        let y = (vh - window_height) / 2;  // Center vertically

        this.position = new rect(x, y, window_width, window_height, "left", "top");
        this.resize();
        this.add_buttons();

        // Listen to modal's keyboard events for help
        this.on("keys", (data) => {
            if (data.kb.just_stopped('h') || data.kb.just_stopped('H')) {
                this.show_help();
            }
        });

        //layout options - keep gradient for visual effect
        this.add_bg_gradient(0, 'rgba(0,0,0,0.3)');
        this.add_bg_gradient(.7, 'rgba(211,211,211,0.2)');
        this.add_bg_gradient(.8, 'rgba(169,169,169,0.2)');
        this.add_bg_gradient(1, 'rgba(0,0,0,0.3)');

        // Create buttons with viewport-relative positions
        this.create_menu_buttons();
    }

    render() {
        // Copy parent render logic but insert glow before title image
        if (this.active === false) return;
        if (!this.graphics || !this.graphics.ctx) return;
        if (!this.sprites) return;
        if (!this.render_position || !this.internal_rect || !this.render_internal_rect) return;

        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        if (this.skin) {
            this.sprites.slice_9("window", this.render_position);
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(
            this.render_internal_rect.x,
            this.render_internal_rect.y,
            this.render_internal_rect.width,
            this.render_internal_rect.height
        );
        ctx.clip();

        if (this.external_render_callback != null) {
            this.external_render_callback(this.render_internal_rect);
        }

        // Render buttons
        if (this.buttons) {
            this.buttons.forEach((button) => button.render());
        }

        // Render ui_components
        if (this.ui_components) {
            this.ui_components.forEach((component) => component.render());
        }

        // Render text
        if (this.text) {
            this.graphics.font.draw_text(this.render_internal_rect, this.text, true, true);
        }

        ctx.restore();

        // Render images with glow effect (title is here)
        if (this.images) {
            for (let i = 0; i < this.images.length; i++) {
                let image = this.images[i];

                // Apply glow effect to title image
                if (image === this.title_image) {
                    this.render_title_with_glow(image);
                } else {
                    let image_pos = image.position.clone();
                    this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");
                }
            }
        }

        if (this.skin && this.sprites && this.graphics.font) {
            this.sprites.slice_3("window-title", this.render_title_position);
            this.graphics.font.draw_text(this.render_title_position, this.title, true, false);
        }
        if (this.closeButton != null && typeof this.closeButton.render === "function") {
            this.closeButton.render();
        }
    }

    render_title_with_glow(image) {
        if (!this.graphics || !this.graphics.ctx) return;

        const ctx = this.graphics.ctx;

        // Update glow animation phase
        this.glow_phase += 0.05;

        // Calculate pulse (oscillates between 20 and 40 for shadow blur)
        const pulse = 25 + Math.sin(this.glow_phase) * 15;

        ctx.save();

        // Draw the title multiple times with increasing glow for stronger effect
        // Layer 1: Strongest glow (underneath)
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = pulse * 2;
        let image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        // Layer 2: Medium glow
        ctx.shadowColor = 'rgba(0, 230, 255, 0.6)';
        ctx.shadowBlur = pulse * 1.5;
        image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        // Layer 3: Soft glow
        ctx.shadowColor = 'rgba(0, 200, 255, 0.4)';
        ctx.shadowBlur = pulse;
        image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        // Final layer: No shadow (crisp title on top)
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        ctx.restore();

        // Extra cleanup to ensure no shadow state leaks
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    show_help() {
        let modal = new help();
        this.window_manager.add(modal);
    }

    create_menu_buttons() {
        // Clear existing menu buttons
        this.menu_buttons = [];

        // Calculate positions based on internal_rect
        let x = 20;
        let y = 30;
        let button_spacing = 80;
        let button_width = this.internal_rect.width - x * 2;

        let vw = this.graphics.viewport.virtual.width;

        // Store button definitions
        this.menu_buttons = [
            { label: "New Game", callback: this.new_game, y_offset: y, style: "cyan" },
            { label: "Prologue", callback: this.story, y_offset: y + button_spacing, style: "cyan" },
            { label: "High Scores", callback: this.high_scoress, y_offset: y + button_spacing * 2, style: "cyan" },
            { label: "Credits", callback: this.credits, y_offset: y + button_spacing * 3, style: "cyan" },
            { label: "Exit", callback: this.exit, y_offset: this.internal_rect.height - 110, style: "red" }
        ];

        // Create actual button instances
        for (let btn_def of this.menu_buttons) {
            let button_position = new rect(x, btn_def.y_offset, button_width, null, "left", "top");
            let up_img = btn_def.style === "cyan" ? "button-up-cyan" : "button-up-red";
            let down_img = btn_def.style === "cyan" ? "button-down-cyan" : "button-down-red";
            btn_def.button = this.add_button(btn_def.label, button_position, btn_def.callback, up_img, down_img);
            btn_def.position = button_position;
        }

        // Add title image - scale with viewport
        let title_width = Math.min(1024, vw * 0.6);
        let title_height = title_width * (236 / 1024);  // Maintain aspect ratio
        let title_x = vw / 2 - title_width / 2;
        let button_position6 = new rect(title_x, 10, title_width, title_height, "left", "top");
        this.title_image = this.add_image(button_position6, "title");
    }

    resize() {
        // Recalculate menu position based on new viewport - left-anchored
        if (this.graphics && this.graphics.viewport) {
            let vw = this.graphics.viewport.virtual.width;
            let vh = this.graphics.viewport.virtual.height;

            // Keep menu size fixed, left-anchored at 60px, vertically centered
            let window_width = 400;
            let window_height = 600;
            let x = 60;  // Left-anchored at 60 pixels
            let y = (vh - window_height) / 2;  // Center vertically

            this.position.x = x;
            this.position.y = y;
            this.position.width = window_width;
            this.position.height = window_height;
        }

        // Call parent resize to update internal_rect and button positions
        super.resize();

        // Update title image position to stay centered in viewport
        if (this.title_image && this.graphics && this.graphics.viewport) {
            let vw = this.graphics.viewport.virtual.width;
            let title_x = vw / 2 - 512;  // Half of 1024
            this.title_image.position.x = title_x;
        }
    }


    exit(event ){
        alert("I can't realy close the window...\n But I'd like to!\n Thanks for playin\n -Chris");
    }

    async credits(event) {
        // Resume audio context on user interaction (browser autoplay policy)
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        let modal=new credits();
        this.window_manager.add(modal)
    }

    high_scoress(event) {
        let modal=new high_scores();
        this.window_manager.add(modal)
    }

    async story(event) {
        // Resume audio context on user interaction (browser autoplay policy)
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        let modal=new prologue();
        this.window_manager.add(modal)
    }

    new_game(){
        let modal=new game();
        this.window_manager.add(modal)
    }


}