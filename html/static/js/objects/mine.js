class Mine extends game_object {
    constructor(window_manager, x, y, type) {
        switch (type) {
            case 'linkedin':
                super(window_manager, x, y, 128, 128,
                    8,                    // mass (heavy - hard to push)
                    0,                    // rotation
                    3);                   // rotation speed (slow menacing spin)

                this.set_image('ship_linkedin');
                this.set_type("mine");
                this.set_max_life(50); // Fragile - explodes easily
                this.set_center(64, 64);

                // Mine behavior - slow drift
                let mine_action = [
                    { type: "bank_left", frames: 20 },
                    { type: "bank_right", frames: 40 },
                    { type: "bank_left", frames: 20 },
                    { type: "skip", frames: 5 }
                ];
                this.action_list = mine_action;
                this.action_position.frame = parseInt(Math.random() * mine_action.length);

                // Proximity detection
                this.proximity_range = 150; // Explodes when player within 150 pixels
                this.armed = true;
                this.explosion_damage = 500; // Heavy damage when triggered
                break;
        }

        this.rotation = Math.random() * 360; // Random starting rotation
    }

    check_proximity(target) {
        if (!this.armed || !target) return false;

        // Calculate distance to target
        const dx = this.position.x - target.position.x;
        const dy = this.position.y - target.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.proximity_range;
    }

    trigger_explosion() {
        if (!this.armed) return;

        this.armed = false;

        // Create multiple explosions for mine detonation
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 10;  // Reduced from 30 to 10 for tighter explosion
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            let exp = new Explosion(this.window_manager,
                this.position.x + offsetX,
                this.position.y + offsetY);
            exp.set_sub();
            this.explosions.push(exp);
        }

        // Destroy the mine
        this.life = 0;
        this.destroy_object = true;

        console.log('[Mine] Detonated!');
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);
    }
}
