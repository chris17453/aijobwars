class sprite_font {
    constructor(ctx,sprites, image_key) {
        this.sprites = sprites;
        this.ctx=ctx;
        this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]|`\\/@" + "°+=*$£€<>";
        this.image =image_key;
        this.spacing_width=1;
        this.mono_char_width = 22;
        this.mono_char_height = 27;
        this.char_width = 46;
        this.char_height = 43;
        this.chars_per_row = 5;
        this.char_data = [];
        this.sprite=this.sprites.get(this.image);

        this.calculate_char_data();

    }


    calculate_char_data() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const sx = (i % this.chars_per_row) * this.char_width;
            const sy = Math.floor(i / this.chars_per_row) * this.char_height; // Fixed typo: replaced 'o' with 'i'
            let sub_rect=new rect(sx,sy,this.char_width,this.char_height);
            const char_bounds = this.sprites.get_bounds(this.image,sub_rect);



            const char_data = {
                character: char,
                left: char_bounds.left + sx,
                top: char_bounds.top + sy,
                right: char_bounds.right + sx,
                bottom: char_bounds.bottom + sy,
                width: char_bounds.right - char_bounds.left,
                height: char_bounds.bottom - char_bounds.top,
                stride: char_bounds.right - char_bounds.left + 1,
                baseline: char_bounds.top
            };
            this.char_data.push(char_data);
        }
    }



    get_character(char) {
        return this.char_data.find(char_data => char_data.character === char);
    }

    get_bounds(text,monospace=false){
        try {
            let x = 0,y=0,max_x=0;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Use get_character to retrieve character data
                if(char==" ")  {
                    x+=this.mono_char_width;
                    continue;
                }
                if(char=="\n")  {
                    y+=this.mono_char_height;
                    max_x=Math.max(max_x, x);
                    x=0;
                    continue;
                }
                const char_data = this.get_character(char);
            
                if (!char_data) continue;
                if(monospace) x+=this.mono_char_width;
                else {
                    if (i<text.length-1) x+=this.spacing_width;
                    x += char_data.width;
                }

            }
            if (y==0)y=this.mono_char_height;
            max_x=Math.max(max_x, x);
            return new rect(0,0,max_x,y,"left","top")
        } catch (error) {
            console.error("Error loading image:", error);
        }
    }
    
    
    draw_text(position, text,centered=false,monospace=false) {
        position=position.clone();
        try {
            let lines=text.split("\n");
            if (centered) {
                position.y= position.center_y-(lines.length*this.mono_char_height)/2;
            } 
            
            
            for (let line in lines){
                this.draw_single_text(position,lines[line],centered,monospace);
                position.y+=this.mono_char_height;
            }
        } catch (error) {
            console.error("Error loading image:", error);
        }
    }

    draw_single_text(position, text,centered=false,monospace=false) {
        try {
                if (!this.chars_per_row) {
                console.error("Image not loaded");
                return;
            }

            let pos_x,padding=0;
            let pos_y= position.y;
            if (centered) {
                pos_x = position.center_x;
            } else {
                pos_x = position.x;
            }
            if(centered){
                let bounds=this.get_bounds(text,monospace);
                pos_x-=bounds.center_x;
            }

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Use get_character to retrieve character data
                if(char==" ")  {
                    pos_x+=this.mono_char_width;
                    continue;
                }
                if (char=="\n") return;
                const char_data = this.get_character(char);
                if (!char_data) continue;
               // if(monospace) padding=(this.mono_char_width-char_data.stride)/2;
                this.ctx.drawImage(
                    this.sprite.image,
                    char_data.left,
                    char_data.top,
                    char_data.width,
                    char_data.height,
                    pos_x+padding,
                    pos_y + char_data.baseline,
                    char_data.width,
                    char_data.height
                );
                if(monospace) pos_x+=this.mono_char_width;
                else 
                pos_x += char_data.width+this.spacing_width;
                padding=0;
            }
        } catch (error) {
            console.error("Error loading image:", error);
        }
    }
}
