class modal {
    constructor(graphics, position, title, text, cancel = false, ok = true) {
        this.graphics = graphics;
        this.canvas = graphics.canvas;
        this.sprites = graphics.sprites;
        this.events = {}; // Object to hold modal events

        this.title = title;
        this.text = text;
        this.position = position;
        
        let modal_sprite = this.sprites.get(["window"]);
        let title_sprite = this.sprites.get(["window-title"]);

        // Set default modal size and position if not specified
        this.position.width = this.position.width || modal_sprite.width;
        this.position.height = this.position.height || modal_sprite.height;
        this.position.x = this.position.x || (window.innerWidth - this.position.width) / 2;
        this.position.y = this.position.y || (window.innerHeight - this.position.height) / 2;

        // Calculate title position within the modal
        this.title_position = new rect(
            this.position.x+(160)/2,
            this.position.y+-20,
            this.position.width - 160,
            title_sprite.height,
            "left","top"
        );


        // Calculate internal rectangle position with padding
        this.internal_rect = new rect(
            20,
            120,
            this.position.width - 20*2,
            this.position.height- 120-30,
            "left","top"
        );

        this.buttons = [];

        // Adjust button positions relative to the internal rectangle
        let buttonXOffset = this.internal_rect.x + (this.internal_rect.width - 200) / 6; // Offset for button spacing
        let buttonYOffset = this.internal_rect.y + this.internal_rect.height - 60; // Offset for button position from bottom of internal rectangle
        let mode="center";

        if (ok) {
            var button_position=new rect(this.position.left+100,this.position.bottom-60);
            let ok_instance = this.add_button("Ok", button_position, mode,"button-up-cyan", "button-down-cyan");
            ok_instance.on('click', () => { this.emit('ok', { instance: this }); });
        }
        if (cancel) {
            var button_position=new rect(this.position.right-100,this.position.bottom-60);
            let cancel_instance = this.add_button("Cancel", button_position,mode,"button-up-red", "button-down-red");
            cancel_instance.on('click', () => { this.emit('cancel', { instance: this }); });
        }

        // Add event listener for keydown event
        document.addEventListener('keydown', this.handle_key_down.bind(this));
    }

    add_button(label, position, up_image, down_image) {
        // Create and setup the new button
        
        position.x+=this.position.x+this.internal_rect.x;
        position.y+=this.position.y+this.internal_rect.y;
        
        let newButton = new button(this.graphics, label, position,up_image, down_image);
        newButton.on('click', () => { this.emit('click', { instance: this }); });
        this.buttons.push(newButton);
    }

    handle_key_down(event) {
        // Handle keydown event
        this.emit('keydown', { instance: this, event: event });
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
        
        this.sprites.slice_9("window",this.position);
        this.sprites.slice_3("window-title",this.title_position);
        let internal=this.internal_rect.clone();
        internal.x+=this.position.x;
        internal.y+=this.position.y;
        //this.sprites.draw_colored_rectangle(this.position,"red");
        //this.sprites.draw_colored_rectangle(internal,"blue");
        // Render buttons
        this.buttons.forEach(button => button.render());

        // Render title and text
        this.graphics.font.draw_text(this.title_position,this.title, true,false);
        if (this.text) {
          this.graphics.font.draw_text(internal,this.text, true, true);
        }
    }

    close() {
        // Close the modal and clean up if necessary
        this.emit('close', { instance: this });
        document.removeEventListener('keydown', this.handle_key_down.bind(this));
    }
}
