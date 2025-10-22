class menu extends modal{
    constructor(){
        super();

        // Store button data for resize recalculation
        this.menu_buttons = [];
        this.title_image = null;
    }

    layout(){
        //window specifics
        this.set_background("menu");
        this.ok=false;
        this.cancel=false;
        this.closeButton=true;
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

        //layout options - keep gradient for visual effect
        this.add_bg_gradient(0, 'rgba(0,0,0,0.3)');
        this.add_bg_gradient(.7, 'rgba(211,211,211,0.2)');
        this.add_bg_gradient(.8, 'rgba(169,169,169,0.2)');
        this.add_bg_gradient(1, 'rgba(0,0,0,0.3)');

        // Create buttons with viewport-relative positions
        this.create_menu_buttons();
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
            { label: "Story So Far", callback: this.story, y_offset: y + button_spacing, style: "cyan" },
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