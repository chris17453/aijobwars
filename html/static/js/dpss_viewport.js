
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
        const scaleX = this.given.width / this.requested.width;
        if (scaleX > 1) {
            this.scale.x = 1;
            this.scale.y = 1;
            this.virtual.width = this.given.width;
            this.virtual.height = this.given.height;
        } else {
            const virtX = this.requested.width / this.given.width;
            this.scale.x = scaleX;
            this.scale.y = scaleX;
            this.virtual.width = parseInt(this.given.width * virtX);
            this.virtual.height = parseInt(this.given.height * virtX);
        }
    }
}
