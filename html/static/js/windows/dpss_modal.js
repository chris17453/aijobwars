class modal {
    constructor(graphics, position, title, text, cancel = false, ok = true) {
        let ok_up = "button-up-cyan";
        let ok_down = "button-down-cyan";
        let cancel_up = "button-up-red";
        let cancel_down = "button-down-red";
        this.graphics = graphics;
        this.canvas = graphics.canvas;
        this.sprites = graphics.sprites;
        this.events = {}; // Object to hold modal events

        this.title = title;
        this.text = text;
        this.position = position;
        let modal_sprite = this.sprites.sprites["window"];
        let title_sprite = this.sprites.sprites["window-title"];
        if (this.position.width == null) this.position.width = modal_sprite.width;
        if (this.position.height == null) this.position.height = modal_sprite.height;
        if (this.position.x == null) this.position.x = (window.innerWidth -this.position.width) / 2;
        if (this.position.y == null) this.position.y = (window.innerHeight -this.position.height) / 2;

        this.title_position=new rect(this.position.x+100,this.position.y-15,this.position.width-100*2,title_sprite.height);
        let b1_x = this.position.left + 50;
        let b1_y = this.position.bottom - 130;
        let b2_x = this.position.right - 260;
        let b2_y = this.position.bottom - 130;

        if (!ok || !cancel) {
            b1_x = this.position.center_x - 100;
            b2_x = b1_x;
        }
        if (ok) {
            this.ok_button = new button(graphics, "Ok", b1_x, b1_y, ok_up, ok_down);
            this.ok_button.on('click', () => {
                this.emit('ok', { instance: this });
            });
        }
        if (cancel) {
            this.cancel_button = new button(graphics, "Cancel", b2_x, b2_y, cancel_up, cancel_down);
            this.cancel_button.on('click', () => {
                this.emit('cancel', { instance: this });
            });
        }
    }

    on(event_name, callback) {
        if (!this.events[event_name]) {
            this.events[event_name] = [];
        }
        this.events[event_name].push(callback);
    }

    emit(event_name, data) {
        if (this.events[event_name]) {
            this.events[event_name].forEach(callback => callback(data));
        }
    }

    render() {
        this.sprites.slice_9("window", this.position);
        this.sprites.slice_3("window-title", this.title_position);
        if (this.ok_button) this.ok_button.render();
        if (this.cancel_button) this.cancel_button.render();
        
        this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y +25, this.title, true, true);
        this.graphics.font.draw_text(this.position.x + this.position.width / 2, this.position.y + 90, this.text, true, true);

    }

    close() {
        this.emit('close', { instance: this });
    }
}
