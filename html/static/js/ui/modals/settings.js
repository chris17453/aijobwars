class settings extends modal {
    layout(){
        this.active=true;
        this.ok=true;
        this.cancel=true;
        this.closeButton=true;
        this.title="Settings";
        this.text="";

        const window_width=800;
        const window_height=600;
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();

        this.settings_state = this.load_settings();
    }

    load_settings(){
        try{
            const raw = localStorage.getItem('aijobwars_settings');
            return raw ? JSON.parse(raw) : { keymap: {}, accessibility: { reduce_flash:false, colorblind:false, aim_assist:false } };
        }catch(e){
            console.warn('[Settings] failed to load', e);
            return { keymap: {}, accessibility: { reduce_flash:false, colorblind:false, aim_assist:false } };
        }
    }

    save_settings(){
        try{
            localStorage.setItem('aijobwars_settings', JSON.stringify(this.settings_state));
        }catch(e){
            console.warn('[Settings] failed to save', e);
        }
    }
}
