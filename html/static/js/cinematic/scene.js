class scene {
    constructor(window_manager,scene_url) {
        this.graphics = window_manager.graphics;
        this.audio_manager = window_manager.audio_manager;
        this.scene_url = scene_url; // Updated variable name
        this.scene_data = null;
        this.audio = new Audio();
        this.start_time=null;
        this.current_img=null;
        this.playing=null;
        this.load_scene_data(this.scene_url);
    }

    async load_scene_data(scene_url) { // Updated parameter name
        let data= await fetch(scene_url) // Updated variable reference
            .then(
                response => response.json()
                )
            .then(data => {
                // Assign the parsed JSON data to a variable
                const sceneData = data;
                // You can perform further operations with the sceneData variable if needed
                return sceneData;
            });                
        this.scene_data=data;
        for(let i=0;i<this.scene_data.length;i++){
            this.load_slide(this.scene_data[i]); 
        }
        console.log("try");
        try {
            this.graphics.sprites.on_load(this.play_scene.bind(this));
        } catch (Exception) {
            console.log("ON LOAD");
            console.log(Exception);
            // Handle the exception here
        }
    }

    play_scene() {
        this.playing=true;
        console.log("Playing Scene");
    }

    get_objects_in_time() {
        const objectsToShow = [];
        const properties = ['images', 'audio', 'text'];
    
        this.elapsed = Date.now() - this.start_time;
    
        for (let property of properties) {
    
            for (let i = 0; i < this.scene_data.length; i++) {

                const slide = this.scene_data[i];
                if (!(property in slide)) continue; // Skip the loop if property doesn't exist in the scene_data
                for (let j = 0; j < slide[property].length; j++) {
                    let object = slide[property][j];
                    let timestamp = object.timestamp * 1000;
                    let duration = (object.timestamp+object.duration) * 1000;
                    if(object.duration==0) duration+=9999999;
    
                    if (this.elapsed>=timestamp &&  this.elapsed<=duration) {
                        objectsToShow.unshift({
                            data: object,
                            type:property,
                            timestamp: timestamp
                        });
                    }
                }
            }
        }
    
        return objectsToShow;
    }

    
    update_frame(position) {
        if (!this.playing || !this.scene_data) return;
        if(this.start_time==null) {
            this.start_time=Date.now();
        }

        let objects=this.get_objects_in_time();
    
        
        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='images') {
                let current_img = object.data.path;
                this.graphics.sprites.render(current_img, null, position, 1, "fill");
            }

        }

        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='audio') {
                if (this.audio_manager.is_playing(object.data.path) == false) {
                    this.audio_manager.play(object.data.path);
                }
            }
        }
        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='text') {

                let text_position=new rect(position.x+position.width/2,position.y+position.height/4,null,null,"center","center");
                let bounds=this.graphics.font.get_bounds(object.data.text,false);
                var line_count = (object.data.text.match(/\n/g) || []).length+1;

                bounds.width=position.width;
                bounds.height=this.graphics.font.mono_char_height*line_count+30;
                bounds.x=position.x+0;
                bounds.y=text_position.y-bounds.height/2;
                let current_position=this.elapsed-object.timestamp;
                let percentage=current_position/(object.data.duration*1000);
                let brightness=0;
                if(percentage<=0.5) brightness=.3+1.6*percentage;
                else  brightness=1.7-1.6*(percentage);
                this.graphics.sprites.draw_rect(bounds,"rgba(22, 22, 22, "+brightness+")");

                this.graphics.font.draw_text(text_position, object.data.text,true,false);

                
            }
        }


    }

    
    
    load_slide(slide) {
        
        //add all the images for this slide
        for(let i=0;i<slide.images.length;i++) {
            this.graphics.sprites.add(slide.images[i].path);
        }

        //add all the images for this slide
        for(let i=0;i<slide.audio.length;i++) {
            this.audio_manager.add(slide.audio[i].path);
        }
    }

    play_audio(audioPath, timestamp) {
        this.audio.src = audioPath;
        this.audio.currentTime = timestamp;
        this.audio.play();
    }
    close(){
        this.playing=false;
        //stop all audio playback
        for (let i = 0; i < this.scene_data.length; i++) {
            const slide = this.scene_data[i];
            for (let j = 0; j < slide.audio.length; j++) {
                const audio = slide.audio[j];
                this.audio_manager.stop(audio.path);
            }
        }
    }
}
