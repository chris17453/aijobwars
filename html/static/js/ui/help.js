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
            "| Q             | Quit the game          |\n" +
            "| Arrow Left    | Bank left              |\n" +
            "| Arrow Right   | Bank right             |\n" +
            "| Arrow Up      | Accelerate             |\n" +
            "| Arrow Down    | Decelerate             |\n" +
            "| STRAFING      | WASD                   |\n" +
            "| Space         | Fire lasers            |\n" +
            "| Enter         | Fire Missiles          |\n" +
            "| M             | Toggle Sound           |\n" +
            "| +             | Volume up              |\n" +
            "| -             | Volume down            |\n" +
            "| Escape        | Toggle Pause           |\n" +
            "| CTRL + Escape | Turn on boss mode      |\n" +
            "| Escape        | Exit (from boss mode)  |\n";

            this.resize();
            this.add_buttons();
    }


}