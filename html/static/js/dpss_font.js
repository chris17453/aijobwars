class sprite_font {
    constructor(ctx, image_path) {
        this.ctx = ctx;
        this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]|`\\/@" + "°+=*$£€<>";
        this.image = new Image();
        this.image.src = image_path;
        this.image.crossOrigin = 'anonymous'; // Set CORS policy

        this.char_width = 46;
        this.char_height = 43;
        this.chars_per_row = 5;
        this.char_data = [];
        this.image.onload = () => {
            this.calculate_char_data();
        };
    }

    calculate_char_data() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const sx = (i % this.chars_per_row) * this.char_width;
            const sy = Math.floor(i / this.chars_per_row) * this.char_height; // Fixed typo: replaced 'o' with 'i'
            const char_bounds = this.get_character_bounds(ctx, sx, sy);
            let baseline = this.char_height; // Default baseline at the bottom



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

    get_character_bounds(ctx, sx, sy) {
        const image_data = ctx.getImageData(sx, sy, this.char_width, this.char_height);
        let left = this.char_width;
        let top = this.char_height;
        let right = 0;
        let bottom = 0;

        for (let y = 0; y < this.char_height; y++) {
            for (let x = 0; x < this.char_width; x++) {
                const alpha = image_data.data[(y * this.char_width + x) * 4 + 3];
                if (alpha !== 0) {
                    left = Math.min(left, x);
                    top = Math.min(top, y);
                    right = Math.max(right, x);
                    bottom = Math.max(bottom, y);
                }
            }
        }

        return { left, top, right, bottom };
    }

    get_character(char) {
        return this.char_data.find(char_data => char_data.character === char);
    }


    draw_text(x, y, text) {
        if (!this.chars_per_row) {
            console.error("Image not loaded");
            return;
        }

        let pos_x = x;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Use get_character to retrieve character data
            const char_data = this.get_character(char);
            if (!char_data) continue;
            this.ctx.drawImage(
                this.image,
                char_data.left,
                char_data.top,
                char_data.width,
                char_data.height,
                pos_x,
                y + char_data.baseline,
                char_data.width,
                char_data.height
            );
            pos_x += char_data.width;
        }
    }
}
