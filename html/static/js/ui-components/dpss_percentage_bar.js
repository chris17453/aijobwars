

class percentage_bar {
    constructor(window_manager,overlay_position,underlay_position, overlay,underlay) {
        this.graphics=window_manager.graphics;
        this.overlay_position=overlay_position;
        this.underlay_position=underlay_position;
        this.underlay=underlay;
        this.overlay=overlay;
    }
    
    render(percentage){
        let percentage_width=parseInt((this.underlay_position.width*percentage)/100);
        if (percentage_width!=0) {
        let render_percentage= new rect(this.underlay_position.x,this.underlay_position.y,percentage_width,this.underlay_position.height);
        //this.graphics.sprites.slice_3(this.underlay,render_percentage);
            this.graphics.sprites.render(this.underlay,null, render_percentage,1,"none");
        }
        this.graphics.sprites.slice_3(this.overlay,this.overlay_position);
        //this.graphics.sprites.render(this.underlay,null, this.underlay_position,1,"none");
        //this.graphics.sprites.render(this.overlay,null, this.overlay_position,1,"none");
    }

    render2(percentage) {
        let vp=this.graphics.viewport.given;
        let x = this.x+vp.x;
        let y = this.y+vp.y;

        // Background with subtle gradient
        let bgGradient = this.graphics.ctx.createLinearGradient(x, y, x, y + this.height);
        bgGradient.addColorStop(0, '#222222'); // Light gray
        bgGradient.addColorStop(1, '#000000'); // Almost white
        this.graphics.ctx.fillStyle = bgGradient;
        this.graphics.ctx.fillRect(x, y, this.width, this.height);

        let adjusted_percentage=percentage;
        if (adjusted_percentage<0)adjusted_percentage=0;
        if (adjusted_percentage>100) adjusted_percentage=100;
        
        // Adjust bar color based on percentage
        const redIntensity = Math.floor(255 * (1 - adjusted_percentage / 100));
        const greenIntensity = Math.floor(255 * (adjusted_percentage/ 100));
        this.graphics.ctx.fillStyle = `rgb(${redIntensity},${greenIntensity},0)`;

        // Fill the entire bar, adjusting color based on percentage
        this.graphics.ctx.fillRect(x + 3, y + 3, (this.width - 6) * (adjusted_percentage/ 100), this.height - 6);

        // Draw outline
        this.graphics.ctx.strokeStyle = '#AAA'; // Dark gray
        this.graphics.ctx.lineWidth = 2;
        this.graphics.ctx.strokeRect(x, y, this.width, this.height);

        // Draw percentage text
        this.graphics.ctx.fillStyle = '#DDFFFF'; // Neon blue
        this.graphics.ctx.fillStyle = `rgb(${redIntensity},${redIntensity},${redIntensity})`;
        this.graphics.ctx.font = '14px IBM Plex Sans, Arial, sans-serif';
        this.graphics.ctx.textAlign = 'center';
        this.graphics.ctx.textBaseline = 'middle';
        this.graphics.ctx.fillText(percentage.toFixed(0) + '%', x + this.width / 2, y + this.height / 2 - 10);

        // Draw label text
        this.graphics.ctx.font = '14px IBM Plex Sans, Arial, sans-serif';
        this.graphics.ctx.fillText(this.label, x + this.width / 2, y + this.height / 2 + 10);
    }
}



class percentage_bar_fluid extends percentage_bar{
    constructor(window_manager,position, overlay,underlay) {    
        let overlay_sprite=window_manager.graphics.sprites.get(overlay);
        let underlay_sprite=window_manager.graphics.sprites.get(underlay);

        let scale=overlay_sprite.position.get_scale(position);
        let scaled_underlay=underlay_sprite.position.clone();
        scaled_underlay.x=20;
        scaled_underlay.y=9;
        scaled_underlay.set_scale(scale);
        scaled_underlay.add(position)

        // Calculate the position of the underlay based on the scaled overlay
        
        super(window_manager,position,scaled_underlay,overlay,underlay);
    }
}
