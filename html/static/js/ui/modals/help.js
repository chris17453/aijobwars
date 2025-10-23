class help extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.closeButton=true;
        this.title="Help";
        let window_width=1024;
        let window_height=700;
        // Use virtual viewport dimensions for positioning (logical pixels)
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");


        this.text = "| Key           | Action                 |\n" +
            "|---------------|------------------------|\n" +
            "| Arrow Keys    | Bank left/right        |\n" +
            "|               | Accelerate/decelerate  |\n" +
            "| WASD          | Strafe movement        |\n" +
            "| Space         | Fire lasers            |\n" +
            "| Enter         | Fire Missiles          |\n" +
            "| Shift         | Boost                  |\n" +
            "| M             | Toggle Sound           |\n" +
            "| +             | Volume up              |\n" +
            "| -             | Volume down            |\n" +
            "| Escape        | Toggle Pause           |\n" +
            "| Tab           | Boss Mode (toggle)     |\n" +
            "| H             | Show this help         |\n";

            this.resize();
            this.add_buttons();
    }


}