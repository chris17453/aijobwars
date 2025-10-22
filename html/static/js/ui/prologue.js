class prologue extends cinematic_player {

    layout() {
        this.ok = false;
        this.cancel = false;
        this.closeButton = true;
        this.title = "Prologue";
        this.text = "";
        this.active = true;

        let window_width = 800;
        let window_height = 600;
        // Use virtual viewport dimensions for positioning (logical pixels, not physical)
        let x = (this.graphics.viewport.virtual.width - window_width) / 2;
        let y = (this.graphics.viewport.virtual.height - window_height) / 2;

        this.position = new rect(x, y, window_width, window_height, "left", "top");
        this.resize();
        this.add_buttons();

        this.setup_player("static/storyboard/intro/intro_scene.json");
    }
}
