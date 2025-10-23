
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
        // display area size (force integers to match canvas dimensions)
        this.frame = {
            x: 0,
            y: 0,
            width: Math.floor(window.innerWidth),
            height: Math.floor(window.innerHeight)
        };

        // what we got (ensure integers)
        if (this.requested.width < this.frame.width) {
            this.given.width = Math.floor(this.requested.width);
            this.given.height = Math.floor(this.requested.height);
            this.given.width = Math.floor(this.frame.width);
            this.given.height = Math.floor(this.frame.height);
        } else {
            this.given.width = Math.floor(this.frame.width);
            this.given.height = Math.floor(this.frame.height);
        }
        // viewport offset (ensure integers)
        this.given.x = Math.floor((this.frame.width - this.given.width) / 2);
        this.given.y = Math.floor((this.frame.height - this.given.height) / 2);

        this.calculate_scale();
        this.world.height=this.virtual.height;
        this.world.width=this.virtual.height;

    }

    calculate_scale() {
        // Virtual viewport matches the actual canvas dimensions
        this.virtual.width = this.given.width;
        this.virtual.height = this.given.height;

        // Scale is 1:1 since virtual matches canvas
        this.scale.x = 1;
        this.scale.y = 1;
    }

    isPortrait() {
        // Portrait mode when height is greater than width
        return this.frame.height > this.frame.width;
    }
}
