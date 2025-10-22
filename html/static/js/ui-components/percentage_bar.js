

class percentage_bar extends ui_component {
    constructor(parent, graphics, position, overlay, underlay) {
        super(parent, graphics, position);
        this.underlay = underlay;
        this.overlay = overlay;
        this.percentage = 0;
    }

    /**
     * Render the percentage bar
     */
    render_self() {
        // Get current absolute position
        const absolute_position = this.get_absolute_position();

        // Render underlay (fluid/progress)
        let percentage_width = parseInt((absolute_position.width * this.percentage) / 100);
        if (percentage_width != 0) {
            // Calculate underlay position (inset from overlay)
            const underlay_x = absolute_position.x + 20;
            const underlay_y = absolute_position.y + 9;
            let render_percentage = new rect(underlay_x, underlay_y, percentage_width * 0.85, absolute_position.height - 18);
            this.graphics.sprites.render(this.underlay, null, render_percentage, 1, "none");
        }

        // Render overlay (bar frame)
        this.graphics.sprites.slice_3(this.overlay, absolute_position);
    }

    /**
     * Update the bar with a new percentage value
     */
    set_percentage(percentage) {
        this.percentage = percentage;
    }

    /**
     * Backward compatibility - render with percentage parameter
     */
    render(percentage = null) {
        if (percentage !== null) {
            this.set_percentage(percentage);
        }
        super.render();
    }
}


class percentage_bar_fluid extends percentage_bar {
    constructor(parent, graphics, position, overlay, underlay) {
        super(parent, graphics, position, overlay, underlay);
    }
}
