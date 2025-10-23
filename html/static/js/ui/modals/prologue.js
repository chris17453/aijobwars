class prologue extends cinematic_player {

    layout() {
        this.set_background("prologue");
        this.ok = false;
        this.cancel = false;
        this.closeButton = true;
        this.title = "Prologue";
        this.text = "";
        this.active = true;

        // Store landscape dimensions for orientation changes
        this.landscape_width = 800;
        this.landscape_height = 600;

        // Calculate dialog dimensions based on orientation
        const dims = this.calculate_dialog_dimensions(this.landscape_width, this.landscape_height);
        this.position = new rect(dims.x, dims.y, dims.width, dims.height, "left", "top");
        this.resize();
        this.add_buttons();

        // Load intro scene from ASSETS.json
        const intro_scene_path = this.graphics.asset_loader.get('cinematics.intro.data');
        this.setup_player(intro_scene_path);
    }
}
