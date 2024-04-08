class rect {
    constructor(x, y, width, height, x_mode = "left", y_mode = "top") {
        this._x = x !== null ? parseInt(x) : null;
        this._y = y !== null ? parseInt(y) : null;
        this._width  = width !== null ? parseInt(width) : null;
        this._height = height !== null ? parseInt(height) : null;
        this._y_mode = y_mode !== null ? y_mode : "top";
        this._x_mode = x_mode !== null ? x_mode : "left";
    }
    
    get x() {
        return this._x;
    }

    set x(value) {
        this._x = parseInt(value);
    }

    get y() {
        return this._y;
    }

    set y(value) {
                this._y = parseInt(value);
      
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (value >= 0) {
            this._width = parseInt(value);
            switch(this._x_mode) {
                
                case 'center': parseInt(this._x-=value/2); break;
            }
        }
    }

    get height() {

        return this._height;
    }

    set height(value) {
        if (value >= 0) {
            this._height = parseInt(value);
            switch(this._y_mode) {
                case 'center': parseInt(this._y-=value/2); break;
            }
        }
    }

    set center_x(value) {
        this._x = parseInt(value - this._width / 2);
    }

    set center_y(value) {
        this._y = parseInt(value - this._height / 2);
    }

    get center_x() {
        if (this._width == null) return this.x;
        return parseInt(this._x + this._width / 2);
    }

    get center_y() {
        if (this._height == null) return this.y;
        return parseInt(this._y + this._height / 2);
    }


    get bottom() {
        if (this._height == null) return this.y;
        return this.y + this._height;
    }

    get right() {
        if (this._width == null) return this.x;
        return this.x + this._width;
    }

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        if (this._width != null) this.width = Math.round(this._width);
        if (this._height != null) this.height = Math.round(this._height);

    }
    clone() {
        return new rect(this._x, this._y, this._width, this._height, this._x_mode, this._y_mode);
    }

    add(rect2){
        this._x+=rect2.x;
        this._y+=rect2.y;
    }

}

class grid {
    constructor(outer, inner, size = 9) {
        this.outer = outer;
        this.inner = inner;
        if (size == 9) {
            this.quadrants = this.calculate_quadrants_9();
        }
        if (size == 3) {
            this.quadrants = this.calculate_quadrants_3();
        }
    }

    calculate_quadrants_3() {
        const quadrants = [];

        // Precompute the necessary variables for each quadrant

        let top_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);


        // Top-left quadrant (1)
        quadrants.push(new rect(this.outer.x, this.outer.y, this.inner.x - this.outer.x, this.outer.height));

        // Top-center quadrant (2)
        quadrants.push(new rect(this.inner.x, this.outer.y, this.inner.width, this.outer.height));

        // Top-right quadrant (3)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.outer.y, top_right_width, this.outer.height));

        return quadrants;
    }


    calculate_quadrants_9() {
        const quadrants = [];

        // Precompute the necessary variables for each quadrant
        let top_left_width = this.inner.x - this.outer.x;
        let top_left_height = this.inner.y - this.outer.y;

        let top_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);
        let top_right_height = this.inner.y - this.outer.y;

        let bottom_left_width = this.inner.x - this.outer.x;
        let bottom_left_height = (this.outer.y + this.outer.height) - (this.inner.y + this.inner.height);

        let bottom_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);
        let bottom_right_height = (this.outer.y + this.outer.height) - (this.inner.y + this.inner.height);

        // Top-left quadrant (1)
        quadrants.push(new rect(this.outer.x, this.outer.y, top_left_width, top_left_height));

        // Top-center quadrant (2)
        quadrants.push(new rect(this.inner.x, this.outer.y, this.inner.width, top_left_height));

        // Top-right quadrant (3)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.outer.y, top_right_width, top_right_height));

        // Middle-left quadrant (4)
        quadrants.push(new rect(this.outer.x, this.inner.y, top_left_width, this.inner.height));

        // Center quadrant (5)
        quadrants.push(new rect(this.inner.x, this.inner.y, this.inner.width, this.inner.height));

        // Middle-right quadrant (6)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.inner.y, top_right_width, this.inner.height));

        // Bottom-left quadrant (7)
        quadrants.push(new rect(this.outer.x, this.inner.y + this.inner.height, bottom_left_width, bottom_left_height));

        // Bottom-center quadrant (8)
        quadrants.push(new rect(this.inner.x, this.inner.y + this.inner.height, this.inner.width, bottom_left_height));

        // Bottom-right quadrant (9)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.inner.y + this.inner.height, bottom_right_width, bottom_right_height));

        return quadrants;
    }
}
