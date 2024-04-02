class modal {
    constructor(parent,graphics, position, title, text, cancel = false, ok = true) {
        this.parent=parent;
        this.graphics = graphics;
        this.canvas = graphics.canvas;
        this.sprites = graphics.sprites;
        this.events = {}; // Object to hold modal events
        this.ok=ok;
        this.cancel=cancel;
        this.title = title;
        this.text = text;
        this.position = position;
        
        
        this.buttons = [];
        this.images=[];


        this.resize();
        this.add_buttons()
    }

    add_buttons(){

        // Adjust button positions relative to the internal rectangle
        let mode="center";

        if (this.ok) {
            var button_position=new rect(this.position.left+100,this.position.bottom-60);
            let ok_instance = this.add_button("Ok", button_position, mode,"button-up-cyan", "button-down-cyan");
            ok_instance.on('click', () => { this.emit('ok', { instance: this }); });
        }
        if (this.cancel) {
            var button_position=new rect(this.position.right-100,this.position.bottom-60);
            let cancel_instance = this.add_button("Cancel", button_position,mode,"button-up-red", "button-down-red");
            cancel_instance.on('click', () => { this.emit('cancel', { instance: this }); });
        }

        // Add event listener for keydown event
        document.addEventListener('keydown', this.handle_key_down.bind(this));
    }
    resize(){
        //let modal_sprite = this.sprites.get(["window"]);
        //let title_sprite = this.sprites.get(["window-title"]);

        // Set default modal size and position if not specified
        //this.position.width = this.position.width || modal_sprite.width;
        //this.position.height = this.position.height || modal_sprite.height;
        
        // Calculate title position within the modal
        this.title_position = new rect(
            (160)/2,
            -20,
            this.position.width - 160,
            80,
            "left","top"
        );


        // Calculate internal rectangle position with padding
        this.internal_rect = new rect(
            20,
            70,
            this.position.width - 20*2,
            this.position.height- 70-30,
            "left","top"
        );



        this.render_position=this.position.clone();
        this.render_title_position=this.title_position.clone();
        this.render_internal_rect=this.internal_rect.clone();
        //lets recalculate the positions..
        this.render_position.add(this.graphics.viewport.given);
        this.render_title_position.add(this.render_position);
        this.render_internal_rect.add(this.render_position);
        for(let i=0;i<this.buttons.length;i++) {
            this.buttons[i].resize(this.render_internal_rect);
        }

    }
    

    add_button(label, position,callback, up_image, down_image) {
        // Create and setup the new button
        let anchor_position=new rect(0,0,0,0);
        anchor_position.add(this.graphics.viewport.given);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);
        
        let newButton = new button(this,this.graphics, label, position,anchor_position,callback,up_image, down_image);
        newButton.on('click', () => { this.emit('click', { instance: this }); });
        this.buttons.push(newButton);
    }
    add_image(position, key){
        this.images.push({position:position,key:key});
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
        
        this.sprites.slice_9("window",this.render_position);
        this.sprites.slice_3("window-title",this.render_title_position);
        let internal=this.internal_rect.clone();

        //this.sprites.draw_colored_rectangle(this.position,"red");
        //this.sprites.draw_colored_rectangle(internal,"blue");
        // Render buttons
        this.buttons.forEach(button => button.render());
        for(let i=0;i<this.images.length;i++) {
            let image=this.images[i];
            this.graphics.sprites.render(image.key, image.position, 1,'none') ;
        }

        // Render title and text
        this.graphics.font.draw_text(this.render_title_position,this.title, true,false);
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
