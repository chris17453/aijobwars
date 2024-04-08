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
    update_frame(position) {
        if (!this.playing || !this.scene_data) return;
        if(this.start_time==null) {
            this.start_time=Date.now();
        }

        this.elapsed = Date.now() - this.start_time;
    
        let closest_image = null; // Variable to store the closest image found so far
    
        for (let i = 0; i < this.scene_data.length; i++) {
            const slide = this.scene_data[i];
            for (let j = 0; j < slide.images.length; j++) {
                const image = slide.images[j];
                const image_timestamp = image.timestamp * 1000; // Convert timestamp to milliseconds
    
                // Check if the image timestamp is less than or equal to the elapsed time
                // and closer to the current closest_image (if any)
                if (image_timestamp <= this.elapsed && (!closest_image || image_timestamp > closest_image.timestamp)) {
                    closest_image = {
                        path: image.path,
                        timestamp: image_timestamp
                    };
                }
            }
        }
    
        let closest_audio = null; // Variable to store the closest audio found so far
    
        for (let i = 0; i < this.scene_data.length; i++) {
            const slide = this.scene_data[i];
            for (let j = 0; j < slide.audio.length; j++) {
                const audio = slide.audio[j];
                const audio_timestamp = audio.timestamp * 1000; // Convert timestamp to milliseconds
                const audio_end = audio_timestamp + audio.length * 1000; // Convert timestamp to milliseconds
    
                // Check if the audio timestamp is less than or equal to the elapsed time
                // and closer to the current closest_audio (if any)
                if (audio_timestamp <= this.elapsed && audio_end > this.elapsed &&
                    (!closest_audio || audio_timestamp > closest_audio.timestamp) &&
                    (!this.last_played_audio_timestamp || audio_timestamp > this.last_played_audio_timestamp)) {
                    closest_audio = {
                        path: audio.path,
                        timestamp: audio_timestamp
                    };
                }
            }
        }
    
        if (closest_image) {
            this.current_img = closest_image.path;
            this.graphics.sprites.render(this.current_img, null, position, 1, "fill");
        }
    
        if (closest_audio && this.audio_manager.is_playing(closest_audio.path) == false) {
            this.audio_manager.play(closest_audio.path);
            this.last_played_audio_timestamp = closest_audio.timestamp;
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
