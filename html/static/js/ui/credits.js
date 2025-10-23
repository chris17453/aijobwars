class credits extends cinematic_player {

    layout() {
        this.set_background("credits");
        this.active = true;
        this.ok = false;
        this.cancel = false;
        this.closeButton = true;
        this.title = "Credits";
        this.text = "";

        let window_width = 800;
        let window_height = 800;
        // Use virtual viewport dimensions for positioning (logical pixels)
        let x = (this.graphics.viewport.virtual.width - window_width) / 2;
        let y = (this.graphics.viewport.virtual.height - window_height) / 2;

        this.position = new rect(x, y, window_width, window_height, "left", "top");
        this.resize();
        this.add_buttons();

        this.setup_player("static/storyboard/credits/credits.json");
    }
}
