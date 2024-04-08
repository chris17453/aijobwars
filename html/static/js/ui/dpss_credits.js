class credits extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="Credits";
        this.text="";
        let window_width=800;
        let window_height=800;
        let x=(this.graphics.viewport.given.width-window_width)/2;
        let y=(this.graphics.viewport.given.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();

        this.player= new scene(this.window_manager,"static/storyboard/credits/credits.json");
        this.on("close",()=>{ this.player.close(); })
        this.render_callback(this.player.update_frame.bind(this.player));
    }
    

    //render(){
    //    super.render();
    //}

}