
// This class manages viewport scaling with minimum dimensions
// Maintains a minimum virtual viewport and scales appropriately
// Handles letterboxing/pillarboxing when aspect ratios don't match

class viewport {

    constructor(width, height) {
        this.frame = { x: 0, y: 0, width: 0, height: 0 };
        this.requested = { width: width, height: height };
        this.virtual = { width: 0, height: 0 };
        this.given = { x: 0, y: 0, width: 0, height: 0 };
        this.world = { x:0, y:0, width: 0, height: 0 };

        // Minimum virtual dimensions (design target) by orientation
        this.min_virtual_landscape = {
            width: 1920,
            height: 1080
        };

        this.min_virtual_portrait = {
            width: 1080,
            height: 1920
        };

        this.scale = { x: 1, y: 1 };
        this.calculate();
    }

    calculate() {
        // Display area size (force integers to match canvas dimensions)
        this.frame = {
            x: 0,
            y: 0,
            width: Math.floor(window.innerWidth),
            height: Math.floor(window.innerHeight)
        };

        // Canvas dimensions match the window
        this.given.width = Math.floor(this.frame.width);
        this.given.height = Math.floor(this.frame.height);
        this.given.x = 0;
        this.given.y = 0;

        this.calculate_scale();
        this.world.height = this.virtual.height;
        this.world.width = this.virtual.width;
    }

    calculate_scale() {
        // Select minimum dimensions based on orientation
        const isPortrait = this.given.height > this.given.width;
        const min_virtual = isPortrait ? this.min_virtual_portrait : this.min_virtual_landscape;

        // Virtual viewport is ALWAYS the minimum/design resolution
        // This ensures consistent coordinate space for all game objects
        this.virtual.width = min_virtual.width;
        this.virtual.height = min_virtual.height;

        // Calculate how much we need to scale to fit the screen
        // Use the smaller scale factor to ensure entire viewport fits (letterbox if needed)
        const scaleX = this.given.width / this.virtual.width;
        const scaleY = this.given.height / this.virtual.height;
        const uniformScale = Math.min(scaleX, scaleY);

        // Use uniform scaling to maintain aspect ratio
        this.scale.x = uniformScale;
        this.scale.y = uniformScale;

        // Calculate rendered dimensions and letterbox/pillarbox offsets
        // These are used throughout the app for coordinate transformations
        this.rendered = {
            width: this.virtual.width * this.scale.x,
            height: this.virtual.height * this.scale.y
        };

        this.offset = {
            x: (this.given.width - this.rendered.width) / 2,
            y: (this.given.height - this.rendered.height) / 2
        };
    }

    isPortrait() {
        // Portrait mode when height is greater than width
        return this.frame.height > this.frame.width;
    }
}
