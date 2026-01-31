class loadout extends modal {
    layout(){
        this.active=true;
        this.ok=true;
        this.cancel=true;
        this.closeButton=true;
        this.title="Loadout";
        this.text="";

        const window_width=800;
        const window_height=600;
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();

        this.selected_loadout = this.load_saved_loadout() || "starter";
    }

    load_saved_loadout(){
        try{
            return localStorage.getItem('aijobwars_loadout') || null;
        }catch(e){
            console.warn('[Loadout] failed to load', e);
            return null;
        }
    }

    save_loadout(loadout_id){
        try{
            localStorage.setItem('aijobwars_loadout', loadout_id);
        }catch(e){
            console.warn('[Loadout] failed to save', e);
        }
    }
}
