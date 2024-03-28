class HeatSeekingMissile extends GameObject {
    constructor(x=0, y=0, mass=100, rotation=0, rotation_speed=4) {
        super(x, y, mass, rotation, rotation_speed);
        this.target = { x: 0, y: 0 }; // Initialize target position
        this.maxSpeed = 10; // Maximum speed of the missile
        this.turningRate = 2; // Rate at which the missile can turn
        this.accelerationRate = 0.1; // Rate at which the missile accelerates
    }

    update(deltaTime) {
        // Update orientation to face the target
        this.rotateTowardsTarget();

        // Bank left or right based on orientation
        if (this.rotation < 0) {
            this.bankRight();
        } else {
            this.bankLeft();
        }

        // Accelerate towards the target
        this.accelerate();

        // Limit speed
        this.limitSpeed();

        // Update frame
        this.update_frame(deltaTime);
    }

    rotateTowardsTarget() {
        const deltaX = this.target.x - this.position.x;
        const deltaY = this.target.y - this.position.y;
        const targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const angleDiff = (targetAngle - this.rotation + 180) % 360 - 180;

        // Rotate towards the target
        if (angleDiff > this.turningRate) {
            this.bankRight();
        } else if (angleDiff < -this.turningRate) {
            this.bankLeft();
        }
    }

    bankLeft() {
        this.bank_left();
    }

    bankRight() {
        this.bank_right();
    }

    accelerate() {
        // Accelerate towards the target
        const rotationInRadians = this.rotation * (Math.PI / 180);
        const ax = Math.cos(rotationInRadians) * this.accelerationRate;
        const ay = Math.sin(rotationInRadians) * this.accelerationRate;

        this.acceleration.x += ax;
        this.acceleration.y += ay;
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