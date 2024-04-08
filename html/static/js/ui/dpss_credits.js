class credits extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="Credits";
        this.text="";
        let window_width=800;
        let window_height=600;
        let x=(this.graphics.viewport.given.width-window_width)/2;
        let y=(this.graphics.viewport.given.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();

    }

    //render(){
    //    super.render();
    //}

}