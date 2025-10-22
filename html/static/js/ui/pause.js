class pause extends modal{
    layout(){
        this.active=true;
        this.ok=true;
        this.cancel=false;
        this.closeButton=true;
        this.title="Paused";
        this.text="";
        let window_width=800;
        let window_height=600;

        // Use virtual viewport dimensions for positioning (logical pixels)
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
    }

    //render(){
    //    super.render();
    //}

}