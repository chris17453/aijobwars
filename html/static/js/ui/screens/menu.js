class menu extends modal{
    constructor(){
        super();

        // Store button data for resize recalculation
        this.menu_buttons = [];
        this.title_component = null;  // Reference to title_screen
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

        // Get title bottom position (where menu should start)
        const titleBottom = this.title_component ? this.title_component.getBottomY() : 210;
        const menuTopPadding = 20;
        const menuTop = titleBottom + menuTopPadding;

        if (isPortrait) {
            // Portrait: Extend to bottom of screen with small margin
            const marginX = 20;
            const marginBottom = 20;
            const window_width = vw - (marginX * 2);
            const menuHeight = vh - menuTop - marginBottom;
            const x = marginX;
            this.position = new rect(x, menuTop, window_width, menuHeight, "left", "top");
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

    // Use default modal render - no custom title/tagline rendering needed

    show_help() {
        let modal = new help();
        this.window_manager.add(modal);
    }

    create_menu_buttons() {
        // Clear existing menu buttons
        this.menu_buttons = [];

        const isPortrait = this.graphics.viewport.isPortrait();

        // Button sizing - standard height in both modes
        const button_margin_x = 20;  // Margin from dialog edges
        const button_width = this.internal_rect.width - (button_margin_x * 2);
        const button_height = 60;  // Standard height
        const button_spacing = 80;

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

            // Get title bottom position (where menu should start)
            const titleBottom = this.title_component ? this.title_component.getBottomY() : 210;
            const menuTopPadding = 20;
            const menuTop = titleBottom + menuTopPadding;

            if (isPortrait) {
                // Portrait: Extend to bottom of screen with small margin
                const marginX = 20;
                const marginBottom = 20;
                const window_width = vw - (marginX * 2);
                const menuHeight = vh - menuTop - marginBottom;
                const x = marginX;

                this.position.x = x;
                this.position.y = menuTop;
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