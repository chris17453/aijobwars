class credits extends cinematic_player {

    layout() {
        this.set_background("credits");
        this.active = true;
        this.ok = false;
        this.cancel = false;
        this.closeButton = true;
        this.title = "Credits";
        this.text = "";

        // Store landscape dimensions for orientation changes
        this.landscape_width = 800;
        this.landscape_height = 800;

        // Calculate dialog dimensions based on orientation
        const dims = this.calculate_dialog_dimensions(this.landscape_width, this.landscape_height);
        this.position = new rect(dims.x, dims.y, dims.width, dims.height, "left", "top");
        this.resize();
        this.add_buttons();

        // Load credits scene from ASSETS.json
        const credits_scene_path = this.graphics.asset_loader.get('cinematics.credits.data');
        this.setup_player(credits_scene_path);
    }
}
