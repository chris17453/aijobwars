class menu extends modal{
    constructor(){
        super();

        // Store button data for resize recalculation
        this.menu_buttons = [];
        this.title_image = null;  // Reference to title graphic
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

        // Calculate menu position based on orientation
        const isPortrait = this.graphics.viewport.isPortrait();

        // Add title image at top of screen
        this.setup_title_image();

        // Get title bottom position (where menu should start)
        const titleBottom = this.get_title_bottom();
        const menuTopPadding = 20;
        const menuTop = titleBottom + menuTopPadding;

        if (isPortrait) {
            // Portrait: Use minimum height, centered between title and bottom
            const marginX = 20;
            const marginBottom = 20;
            const window_width = vw - (marginX * 2);

            // Calculate minimum height based on button layout
            // Top buttons: y=30 + 3 buttons with 80px spacing = 270
            // Last regular button height = 60, ends at 330
            // Gap before Exit button = 60
            // Exit button height = 60
            // Bottom margin for Exit = 20
            // Extra padding = 20
            const baseHeight = 30 + (3 * 80) + 60 + 60 + 60 + 20 + 20; // = 490px
            const minMenuHeight = baseHeight * 1.2; // 20% larger = 588px

            // Calculate available space and center the menu
            const availableHeight = vh - menuTop - marginBottom;
            const menuHeight = Math.max(minMenuHeight, Math.min(minMenuHeight, availableHeight));

            // Center vertically in available space
            const centeredY = menuTop + (availableHeight - menuHeight) / 2;
            const x = marginX;

            this.position = new rect(x, centeredY, window_width, menuHeight, "left", "top");
        } else {
            // Landscape: Fixed width, left-anchored at 60px, extends to 90% of screen height
            let window_width = 400;
            let x = 60;  // Left-anchored at 60 pixels
            const menuBottom = vh * 0.90;
            const menuHeight = menuBottom - menuTop;
            this.position = new rect(x, menuTop, window_width, menuHeight, "left", "top");
        }

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

    setup_title_image() {
        const vw = this.graphics.viewport.virtual.width;

        // Calculate title dimensions
        let title_width = Math.min(1024, vw * 0.6);
        let title_height = title_width * (236 / 1024);  // Maintain aspect ratio
        let title_x = vw / 2 - title_width / 2;
        let title_y = 10;

        this.title_image = this.add_image(new rect(title_x, title_y, title_width, title_height, "left", "top"), "title");
    }

    get_title_bottom() {
        if (!this.title_image) return 210;  // Default

        const title_bottom = this.title_image.position.y + this.title_image.position.height;
        return title_bottom + 20;  // Add small padding
    }

    recalculate_title() {
        if (!this.title_image || !this.title_image.position) return;

        const vw = this.graphics.viewport.virtual.width;

        // Recalculate title image position - centered
        const margin = 40;
        const maxWidth = vw - (margin * 2);
        let title_width = Math.min(1024, vw * 0.6, maxWidth);
        let title_height = title_width * (236 / 1024);
        let title_x = vw / 2 - title_width / 2;

        // Set absolute positions
        this.title_image.position.x = title_x;
        this.title_image.position.y = 10;
        this.title_image.position.width = title_width;
        this.title_image.position.height = title_height;
    }

    render() {
        if (!this.active) return;

        // Call parent render first (draws dialog background, buttons, etc.)
        super.render();

        // Render title with glow
        if (this.title_image) {
            this.render_title_with_glow(this.title_image);
        }

        // Render tagline below title (only in landscape mode)
        const isPortrait = this.graphics.viewport.isPortrait();
        if (!isPortrait) {
            this.render_tagline();
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

    render_tagline() {
        if (!this.graphics || !this.graphics.ctx) return;
        if (!this.title_image) return;

        const ctx = this.graphics.ctx;
        const vw = this.graphics.viewport.virtual.width;

        // Calculate position below title
        const title_bottom = this.title_image.position.y + this.title_image.position.height;

        ctx.save();
        ctx.textAlign = 'center';

        const mainText = 'The Battle for Humanity\'s Jobs Has Begun.';
        const subText1 = 'Command your ship. Defend the last human workforce.';
        const subText2 = 'Destroy the machine overlords before they automate everything.';

        // Landscape: fit in space to the right of menu
        const menuRightEdge = 60 + 400;  // menu x + menu width
        const marginFromMenu = 40;
        const marginFromScreenEdge = 20;
        const availableWidth = vw - menuRightEdge - marginFromMenu - marginFromScreenEdge;

        // Start with default sizes and scale down if needed
        let mainFontSize = 32;
        let subFontSize = 18;

        // Measure text with current font sizes
        ctx.font = `bold ${mainFontSize}px monospace`;
        let maxWidth = ctx.measureText(mainText).width;
        ctx.font = `${subFontSize}px monospace`;
        maxWidth = Math.max(maxWidth, ctx.measureText(subText1).width, ctx.measureText(subText2).width);

        const boxPadding = 20;
        const neededWidth = maxWidth + boxPadding * 2;

        // Scale down fonts if text doesn't fit
        if (neededWidth > availableWidth) {
            const scale = availableWidth / neededWidth;
            mainFontSize = Math.max(16, Math.floor(mainFontSize * scale));
            subFontSize = Math.max(12, Math.floor(subFontSize * scale));

            // Recalculate width with new font sizes
            ctx.font = `bold ${mainFontSize}px monospace`;
            maxWidth = ctx.measureText(mainText).width;
            ctx.font = `${subFontSize}px monospace`;
            maxWidth = Math.max(maxWidth, ctx.measureText(subText1).width, ctx.measureText(subText2).width);
        }

        const boxWidth = Math.min(maxWidth + boxPadding * 2, availableWidth);
        const boxHeight = 125;
        const boxX = menuRightEdge + marginFromMenu;
        const textCenterX = boxX + boxWidth / 2;
        const boxY = title_bottom + 20;

        // Draw semi-transparent background box for all text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Optional: Add border for more definition
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw main text with glow
        ctx.font = `bold ${mainFontSize}px monospace`;
        ctx.fillStyle = '#FF6B00';
        ctx.shadowColor = 'rgba(255, 107, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillText(mainText, textCenterX, boxY + 35);

        // Clear shadow for subtext
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Subtext lines - smaller, cyan colored
        ctx.fillStyle = '#00FFFF';
        ctx.font = `${subFontSize}px monospace`;
        ctx.fillText(subText1, textCenterX, boxY + 65);
        ctx.fillText(subText2, textCenterX, boxY + 90);

        ctx.restore();
    }

    show_help() {
        let modal = new help();
        this.window_manager.add(modal);
    }

    create_menu_buttons() {
        // Clear existing menu buttons
        this.menu_buttons = [];

        const isPortrait = this.graphics.viewport.isPortrait();

        // Button sizing - use base dimensions (canvas transformation handles UI scale)
        const button_margin_x = 20;  // Margin from dialog edges
        const button_width = this.internal_rect.width - (button_margin_x * 2);
        const button_height = 60;  // Base height
        const button_spacing = 80;  // Base spacing

        let y = 30;

        // Store button definitions
        this.menu_buttons = [
            { label: "New Game", callback: this.new_game, y_offset: y, style: "cyan" },
            { label: "Prologue", callback: this.story, y_offset: y + button_spacing, style: "cyan" },
            { label: "High Scores", callback: this.high_scoress, y_offset: y + button_spacing * 2, style: "cyan" },
            { label: "Credits", callback: this.credits, y_offset: y + button_spacing * 3, style: "cyan" },
            { label: "Exit", callback: this.exit, y_offset: this.internal_rect.height - (button_height + 20), style: "red" }
        ];

        // Create actual button instances
        for (let btn_def of this.menu_buttons) {
            let button_position = new rect(button_margin_x, btn_def.y_offset, button_width, button_height, "left", "top");
            let up_img = btn_def.style === "cyan" ? "button-up-cyan" : "button-up-red";
            let down_img = btn_def.style === "cyan" ? "button-down-cyan" : "button-down-red";
            btn_def.button = this.add_button(btn_def.label, button_position, btn_def.callback, up_img, down_img);
            btn_def.position = button_position;
        }
    }

    update_dimensions_for_orientation() {
        // Just call resize() - it handles everything including button recreation
        this.resize();
    }

    recreate_buttons() {
        // Delete old buttons
        if (this.buttons) {
            this.buttons.forEach((button) => {
                if (button.delete) button.delete();
            });
        }
        this.buttons = [];

        // Recreate with new sizing
        this.create_menu_buttons();
    }

    resize() {
        // Recalculate menu position based on new viewport and orientation
        if (this.graphics && this.graphics.viewport) {
            let vw = this.graphics.viewport.virtual.width;
            let vh = this.graphics.viewport.virtual.height;
            const isPortrait = this.graphics.viewport.isPortrait();

            // Recalculate title position
            this.recalculate_title();

            // Get title bottom position (where menu should start)
            const titleBottom = this.get_title_bottom();
            const menuTopPadding = 20;
            const menuTop = titleBottom + menuTopPadding;

            if (isPortrait) {
                // Portrait: Use minimum height, centered between title and bottom
                const marginX = 20;
                const marginBottom = 20;
                const window_width = vw - (marginX * 2);

                // Calculate minimum height based on button layout
                // Top buttons: y=30 + 3 buttons with 80px spacing = 270
                // Last regular button height = 60, ends at 330
                // Gap before Exit button = 60
                // Exit button height = 60
                // Bottom margin for Exit = 20
                // Extra padding = 20
                const baseHeight = 30 + (3 * 80) + 60 + 60 + 60 + 20 + 20; // = 490px
                const minMenuHeight = baseHeight * 1.2; // 20% larger = 588px

                // Calculate available space and center the menu
                const availableHeight = vh - menuTop - marginBottom;
                const menuHeight = Math.max(minMenuHeight, Math.min(minMenuHeight, availableHeight));

                // Center vertically in available space
                const centeredY = menuTop + (availableHeight - menuHeight) / 2;
                const x = marginX;

                this.position.x = x;
                this.position.y = centeredY;
                this.position.width = window_width;
                this.position.height = menuHeight;
            } else {
                // Landscape: Fixed width, left-anchored at 60px, extends to 90% of screen height
                let window_width = 400;
                let x = 60;
                const menuBottom = vh * 0.90;
                const menuHeight = menuBottom - menuTop;

                this.position.x = x;
                this.position.y = menuTop;
                this.position.width = window_width;
                this.position.height = menuHeight;
            }
        }

        // Call parent resize to update internal_rect FIRST
        super.resize();

        // Recreate buttons to match new dialog width
        this.recreate_buttons();
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