
// This class is used to size the window..
// fit to width if < than max
// center if >max width
// height always 100% (so far)

class viewport {

    //fit
    constructor(width, height) {
        this.frame = { x: 0, y: 0, width: 0, height: 0 };
        this.requested = { width: width, height: height };
        this.virtual = { width: 0, height: 0 };
        this.given = { x: 0, y: 0, width: 0, height: 0 };
        this.world = { x:0,y:0,width: 0, height: 0 };

        this.scale = { x: 1, y: 1 };
        this.calculate();
    }

    calculate() {
        // display area size
        this.frame = { x:0,y:0,width: window.innerWidth, height: window.innerHeight };

        // what we got
        if (this.requested.width < this.frame.width) {
            this.given.width = this.requested.width;
            this.given.height = this.requested.height;
            this.given.width = this.frame.width;
            this.given.height = this.frame.height;
        } else {
            this.given.width = this.frame.width;
            this.given.height = this.frame.height;
        }
        // viewport offset
        this.given.x = (this.frame.width - this.given.width) / 2;
        this.given.y = (this.frame.height - this.given.height) / 2;

        this.calculate_scale();
        this.world.height=this.virtual.height;
        this.world.width=this.virtual.height;

    }

    calculate_scale() {
        // Virtual viewport is ALWAYS fixed at requested dimensions (e.g., 1920x1080)
        // This is the coordinate space everything is designed for
        this.virtual.width = this.requested.width;
        this.virtual.height = this.requested.height;

        // Calculate scale factors to fit the virtual viewport into physical screen
        // We want to fit the entire virtual space into the physical screen while maintaining aspect ratio
        const scaleX = this.given.width / this.virtual.width;
        const scaleY = this.given.height / this.virtual.height;

        // Use the smaller scale factor to ensure everything fits (letterbox if needed)
        // Allow both upscaling and downscaling to fit any screen size
        const uniformScale = Math.min(scaleX, scaleY);

        this.scale.x = uniformScale;
        this.scale.y = uniformScale;
    }
}
