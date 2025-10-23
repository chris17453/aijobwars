// Title and tagline component - anchored to top of screen
class title_screen extends modal {
    constructor() {
        super();
        this.glow_phase = 0;  // For pulsing glow animation
    }

    layout() {
        // No background, no buttons, no skin - just title and tagline
        this.skin = false;
        this.ok = false;
        this.cancel = false;
        this.closeButton = false;
        this.no_close = true;  // Can't close this
        this.always_active = true;  // Always stays active, even when other modals are added
        this.active = true;

        const vw = this.graphics.viewport.virtual.width;
        const vh = this.graphics.viewport.virtual.height;

        // Position at top of screen
        const topMargin = 10;
        const height = 200;  // Enough for title and tagline

        this.position = new rect(0, topMargin, vw, height, "left", "top");
        this.resize();

        // Add title image
        let title_width = Math.min(1024, vw * 0.6);
        let title_height = title_width * (236 / 1024);  // Maintain aspect ratio
        let title_x = vw / 2 - title_width / 2;
        let title_y = 10;

        this.title_image = this.add_image(new rect(title_x, title_y, title_width, title_height, "left", "top"), "title");
    }

    update_dimensions_for_orientation() {
        // Just recalculate layout - no parent resize needed for title screen
        this.recalculate_layout();
    }

    resize() {
        // Just recalculate layout - no parent resize needed for title screen
        this.recalculate_layout();
    }

    recalculate_layout() {
        if (!this.graphics || !this.graphics.viewport) return;
        if (!this.title_image || !this.title_image.position) return;

        const vw = this.graphics.viewport.virtual.width;
        const vh = this.graphics.viewport.virtual.height;
        const topMargin = 10;
        const height = 200;

        // Update modal position to span full width
        this.position.x = 0;
        this.position.y = topMargin;
        this.position.width = vw;
        this.position.height = height;

        // Recalculate title image position - ALWAYS centered with margins
        const margin = 40; // Margin from screen edges
        const maxWidth = vw - (margin * 2);
        let title_width = Math.min(1024, vw * 0.6, maxWidth);
        let title_height = title_width * (236 / 1024);
        let title_x = vw / 2 - title_width / 2;

        // Set absolute positions (not cumulative)
        this.title_image.position.x = title_x;
        this.title_image.position.y = 10;
        this.title_image.position.width = title_width;
        this.title_image.position.height = title_height;
    }

    render() {
        if (!this.active) return;
        if (!this.graphics || !this.graphics.ctx) return;
        if (!this.title_image) return;

        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        // Render title with glow
        this.render_title_with_glow(this.title_image);

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
        const isPortrait = this.graphics.viewport.isPortrait();

        // Calculate position below title
        const title_bottom = this.title_image.position.y + this.title_image.position.height;

        ctx.save();
        ctx.textAlign = 'center';

        const mainText = 'The Battle for Humanity\'s Jobs Has Begun.';
        const subText1 = 'Command your ship. Defend the last human workforce.';
        const subText2 = 'Destroy the machine overlords before they automate everything.';

        // In landscape: position tagline to the right of the menu area
        // In portrait: center the box below title
        let boxX, boxY, textCenterX, boxWidth, boxHeight;
        let mainFontSize, subFontSize;

        if (isPortrait) {
            // Portrait: use full width with margins
            const margin = 20;
            const availableWidth = vw - (margin * 2);

            // Start with default sizes and scale down if needed
            mainFontSize = 32;
            subFontSize = 18;

            // Measure and adjust
            ctx.font = `bold ${mainFontSize}px monospace`;
            let maxWidth = ctx.measureText(mainText).width;
            ctx.font = `${subFontSize}px monospace`;
            maxWidth = Math.max(maxWidth, ctx.measureText(subText1).width, ctx.measureText(subText2).width);

            // Scale down fonts if text is too wide
            if (maxWidth > availableWidth - 40) {
                const scale = (availableWidth - 40) / maxWidth;
                mainFontSize = Math.floor(mainFontSize * scale);
                subFontSize = Math.floor(subFontSize * scale);
            }

            boxWidth = availableWidth;
            boxHeight = 125;
            boxX = margin;
            textCenterX = vw / 2;
            boxY = title_bottom + 20;
        } else {
            // Landscape: fit in space to the right of menu
            const menuRightEdge = 60 + 400;  // menu x + menu width
            const marginFromMenu = 40;
            const marginFromScreenEdge = 20;
            const availableWidth = vw - menuRightEdge - marginFromMenu - marginFromScreenEdge;

            // Start with default sizes and scale down if needed
            mainFontSize = 32;
            subFontSize = 18;

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

            boxWidth = Math.min(maxWidth + boxPadding * 2, availableWidth);
            boxHeight = 125;
            boxX = menuRightEdge + marginFromMenu;
            textCenterX = boxX + boxWidth / 2;
            boxY = title_bottom + 20;
        }

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

    // Calculate the bottom position of this component (for menu positioning)
    getBottomY() {
        if (!this.title_image) return 210;  // Default

        const title_bottom = this.title_image.position.y + this.title_image.position.height;
        const isPortrait = this.graphics && this.graphics.viewport ? this.graphics.viewport.isPortrait() : false;

        if (isPortrait) {
            // In portrait, no tagline shown, so just add small padding
            return title_bottom + 20;
        } else {
            // In landscape, tagline is to the side, so menu can start just below title
            return title_bottom + 20;
        }
    }
}
