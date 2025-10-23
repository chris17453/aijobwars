class HeatSeekingMissile extends game_object {
    constructor(window_manager, x=0, y=0, rotation=0) {
        super(window_manager, x, y, 32, 32, 100, rotation, 8);
        this.target = null; // Will be set to nearest enemy
        this.maxSpeed = 800; // Maximum speed of the missile
        this.turningRate = 8; // Rate at which the missile can turn
        this.accelerationRate = 300; // Rate at which the missile accelerates

        this.set_image('static/projectiles/P4.png', 16, 4, 270);
        this.set_center(16, 16);
        this.set_velocity_loss_off();
        this.set_type("missile");
        this.expire(10);
        this.set_max_life(1);
    }

    set_target(target) {
        this.target = target;
    }

    find_nearest_target(npcs) {
        if (!npcs || npcs.length === 0) return null;

        let nearest = null;
        let nearestDist = Infinity;

        for (let npc of npcs) {
            if (npc.destroy_object) continue;
            // Only target ships and certain debris
            if (npc.type !== "ship" && npc.type !== "email" && npc.type !== "pdf") continue;

            const dx = npc.position.x - this.position.x;
            const dy = npc.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = npc;
            }
        }

        return nearest;
    }

    update_frame(deltaTime) {
        // Check if target is still valid
        if (this.target && this.target.destroy_object) {
            this.target = null;
        }

        if (this.target) {
            // Update orientation to face the target
            this.rotateTowardsTarget();

            // Accelerate towards the target
            this.accelerate_towards_target();
        }

        // Limit speed
        this.limitSpeed();

        // Update frame (from parent class)
        super.update_frame(deltaTime);
    }

    rotateTowardsTarget() {
        if (!this.target) return;

        const deltaX = this.target.position.x - this.position.x;
        const deltaY = this.target.position.y - this.position.y;

        // Calculate angle to target (0 degrees is up/north)
        const targetAngle = (Math.atan2(deltaX, -deltaY) * (180 / Math.PI) + 360) % 360;

        // Calculate shortest rotation direction
        let angleDiff = targetAngle - this.rotation;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        // Rotate towards the target
        if (Math.abs(angleDiff) > this.turningRate) {
            if (angleDiff > 0) {
                this.bank_right();
            } else {
                this.bank_left();
            }
        } else {
            // Close enough, set rotation directly
            this.rotation = targetAngle;
        }
    }

    accelerate_towards_target() {
        // Accelerate in the direction we're facing
        this.accelerate_object(this.rotation, this.accelerationRate);
    }

    limitSpeed() {
        // Calculate current speed
        const speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

        // If speed exceeds maxSpeed, reduce velocity
        if (speed > this.maxSpeed) {
            const scaleFactor = this.maxSpeed / speed;
            this.velocity.x *= scaleFactor;
            this.velocity.y *= scaleFactor;
        }
    }
}