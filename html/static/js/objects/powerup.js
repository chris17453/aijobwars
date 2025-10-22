class Powerup extends game_object {
    constructor(window_manager, x, y, type) {
        super(window_manager, x, y, 48, 48,
            0.5,                  // light mass
            0,                    // rotation
            5);                   // rotation speed

        this.powerup_type = type;

        switch (type) {
            case 'health':
                this.set_image('static/debris/pdf.png'); // Green PDF icon for health
                this.set_type("powerup_health");
                this.heal_amount = 1000; // Restore more health
                break;

            case 'shield':
                this.set_image('static/debris/email.png'); // Blue email icon for shield
                this.set_type("powerup_shield");
                this.shield_duration = 5000; // 5 seconds of shield
                break;

            case 'weapon':
                this.set_image('static/debris/phone.png'); // Orange phone icon for weapon
                this.set_type("powerup_weapon");
                break;
        }

        this.set_center(24, 24);
        this.set_max_life(1); // Destroyed on pickup

        // Simple floating animation
        let float_action = [
            { type: "bank_left", frames: 2 },
            { type: "bank_right", frames: 4 },
            { type: "bank_left", frames: 2 },
            { type: "skip", frames: 2 }
        ];
        this.action_list = float_action;
        this.rotation = 180;

        // Powerups drift slowly downward
        this.velocity.y = 20;
    }

    apply_to_ship(ship) {
        switch (this.powerup_type) {
            case 'health':
                ship.life += this.heal_amount;
                if (ship.life > ship.max_life) {
                    ship.life = ship.max_life;
                }
                console.log(`Health restored! +${this.heal_amount} HP`);
                break;

            case 'shield':
                // Activate shield on ship
                if (!ship.shield_active) {
                    ship.activate_shield(this.shield_duration);
                    console.log(`Shield activated for ${this.shield_duration/1000} seconds!`);
                } else {
                    // Extend existing shield
                    ship.shield_end_time += this.shield_duration;
                    console.log(`Shield extended!`);
                }
                break;

            case 'weapon':
                // Reduce fire control cooldown temporarily
                if (ship.laser_fire_control) {
                    ship.laser_fire_control.temprature = 0;
                    ship.laser_fire_control.overheated = false;
                }
                if (ship.missile_fire_control) {
                    ship.missile_fire_control.temprature = 0;
                    ship.missile_fire_control.overheated = false;
                }
                console.log("Weapons cooled down!");
                break;
        }

        // Mark for destruction after pickup
        this.destroy();
    }
}
