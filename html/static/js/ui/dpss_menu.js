class menu extends modal{
    constructor(){
        super();

    }
    layout(){
        //window specifics
        this.ok=false;
        this.cancel=false;
        this.close=true;
        this.title="Menu";
        this.text="";
        this.active=true;
        let x=20;
        let y=30;
        let window_width=400;
        let window_height=600;
        
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
        
        //layout options

        let w=this.graphics.viewport.given.width;
        let button_spacing = 80,button_width=this.internal_rect.width-x*2;
        let button_position1=new rect(x,y,button_width,null,"left","top");
        let button_position2=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position3=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position4=new rect(x,y+=button_spacing,button_width,null,"left","top");
        let button_position5=new rect(x,this.internal_rect.height-110,button_width,null,"left","top");
        let button_position6=new rect(w/2-200,10,1024,236,"left","top");
        
        this.add_image(button_position6,"title");
        this.add_button("New Game",button_position1,this.new_game, "button-up-cyan", "button-down-cyan");
        this.add_button("Story So Far", button_position2,this.story, "button-up-cyan", "button-down-cyan");
        this.add_button("High Scores", button_position3,this.high_scoress, "button-up-cyan", "button-down-cyan");
        this.add_button("Credits", button_position4,this.credits,"button-up-cyan", "button-down-cyan");
        this.add_button("Exit", button_position5,this.exit, "button-up-red", "button-down-red");


    }


    exit(event ){
        alert("I can't realy close the window...\n But I'd like to!\n Thanks for playin\n -Chris");
    }

    credits(event) {
        let modal=new credits(this.window_manager,this.graphics,this.audio_manager);
        this.window_manager.add(modal)
    }

    high_scoress(event) {
        let modal=new high_scores(this.window_manager,this.graphics,this.audio_manager);
        this.window_manager.add(modal)
    }

    story(event) {
        let modal=new prologue(this.window_manager,this.graphics,this.audio_manager);
        this.window_manager.add(modal)
    }
    new_game(){

    }




}