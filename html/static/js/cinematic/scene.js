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
        this.paused=false;
        this.scene_ended=false;
        this.events = {};
        this.manual_time_offset = 0; // For seeking
        this.is_dragging_seekbar = false;
        this.is_seeking = false; // Prevent audio from playing during seek
        this._seek_timeout = null;
        this.currently_playing_audio = new Set(); // Track which audio files are playing
        this.load_scene_data(this.scene_url);
    }

    on(event_name, callback) {
        if (!this.events[event_name]) {
            this.events[event_name] = [];
        }
        this.events[event_name].push(callback);
    }

    emit(event_name, data) {
        if (this.events[event_name]) {
            this.events[event_name].forEach((callback) => {
                callback(data);
            });
        }
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

        // Load all slides (async audio loading)
        const loadPromises = [];
        for(let i=0;i<this.scene_data.length;i++){
            loadPromises.push(this.load_slide(this.scene_data[i]));
        }

        // Wait for all audio to finish loading
        await Promise.all(loadPromises);

        // Wait for sprites to load, then start playing
        if (this.graphics.sprites.loaded) {
            // Sprites already loaded, start immediately
            this.play_scene();
        } else {
            // Wait for sprites to load
            this.graphics.sprites.on("complete", this.play_scene.bind(this));
        }
    }

    async play_scene() {
        // Resume audio context before playing (browser autoplay policy)
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        this.playing=true;
        this.paused=false;  // Ensure we start unpaused
        this.start_time = Date.now();  // Initialize start time
    }

    get_total_duration() {
        let max_end_time = 0;
        const properties = ['images', 'audio', 'text'];

        for (let property of properties) {
            for (let i = 0; i < this.scene_data.length; i++) {
                const slide = this.scene_data[i];
                if (!(property in slide)) continue;
                for (let j = 0; j < slide[property].length; j++) {
                    let object = slide[property][j];
                    let end_time = (object.timestamp + object.duration) * 1000;
                    if (object.duration > 0 && end_time > max_end_time) {
                        max_end_time = end_time;
                    }
                }
            }
        }
        return max_end_time;
    }

    get_objects_in_time() {
        const objectsToShow = [];
        const properties = ['images', 'audio', 'text'];
    
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


    seek_to(time_ms, is_dragging) {
        // Stop all currently playing audio
        this.stop_all_audio();
        this.currently_playing_audio.clear();

        // Reset start time to seek position
        this.start_time = Date.now() - time_ms;
        this.manual_time_offset = time_ms;
        this.scene_ended = false;

        // Only prevent audio playback if actively dragging
        if (is_dragging) {
            this.is_seeking = true;
        } else {
            // For non-dragging seeks (keyboard, etc), allow audio immediately
            this.is_seeking = false;
        }
    }

    end_seek() {
        // Allow audio to play again after dragging ends
        this.is_seeking = false;
    }

    stop_all_audio() {
        if (this.scene_data) {
            for (let i = 0; i < this.scene_data.length; i++) {
                const slide = this.scene_data[i];
                if (slide.audio) {
                    for (let j = 0; j < slide.audio.length; j++) {
                        const audio = slide.audio[j];
                        this.audio_manager.stop(audio.path);
                    }
                }
            }
        }
    }

    toggle_pause() {
        this.paused = !this.paused;
        if (this.paused) {
            // Store elapsed time when pausing and stop all audio
            this.manual_time_offset = this.elapsed;
            this.stop_all_audio();
            this.currently_playing_audio.clear();
        } else {
            // Resume from stored time
            this.start_time = Date.now() - this.manual_time_offset;
        }
    }

    update_frame(position) {
        if (!this.playing || !this.scene_data) return;
        if(this.start_time==null) {
            this.start_time=Date.now();
        }

        // Calculate elapsed time
        if (this.paused) {
            this.elapsed = this.manual_time_offset;
        } else {
            this.elapsed = Date.now() - this.start_time;
        }

        // Check if scene has ended (but not if we just seeked there manually)
        if (!this.scene_ended && !this.is_seeking) {
            let total_duration = this.get_total_duration();
            if (this.elapsed >= total_duration) {
                this.scene_ended = true;
                this.emit("complete", {});
            }
        }

        let objects=this.get_objects_in_time();
    
        
        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='images') {
                let current_img = object.data.path;
                // Use "cover" mode to always fill viewport (crop edges if needed)
                this.graphics.sprites.render(current_img, null, position, 1, "cover");
            }

        }

        // Handle audio - only play if not paused and not seeking
        if (!this.paused && !this.is_seeking) {
            // Get list of audio that should be playing at this time
            let should_be_playing = new Set();
            for(let i=0;i<objects.length;i++ ) {
                let object=objects[i];
                if(object.type=='audio') {
                    should_be_playing.add(object.data.path);
                }
            }

            // Stop audio that shouldn't be playing anymore
            for (let audio_path of this.currently_playing_audio) {
                if (!should_be_playing.has(audio_path)) {
                    this.audio_manager.stop(audio_path);
                    this.currently_playing_audio.delete(audio_path);
                }
            }

            // Start audio that should be playing but isn't
            for (let audio_path of should_be_playing) {
                if (!this.currently_playing_audio.has(audio_path)) {
                    // Find ALL instances of this audio in the timeline to get the one that matches current time
                    let matching_audio = null;
                    let current_elapsed_seconds = this.elapsed / 1000;

                    // Search through all slides for this audio
                    for (let i = 0; i < this.scene_data.length; i++) {
                        const slide = this.scene_data[i];
                        if (!slide.audio) continue;

                        for (let j = 0; j < slide.audio.length; j++) {
                            const audio = slide.audio[j];
                            if (audio.path === audio_path) {
                                const audio_start = audio.timestamp;
                                const audio_end = audio.timestamp + audio.duration;

                                // Check if current time falls within this audio's playback window
                                if (current_elapsed_seconds >= audio_start && current_elapsed_seconds <= audio_end) {
                                    matching_audio = audio;
                                    break;
                                }
                            }
                        }
                        if (matching_audio) break;
                    }

                    if (matching_audio) {
                        // Calculate how far into THIS specific audio instance we should be
                        const offset_in_audio = current_elapsed_seconds - matching_audio.timestamp;

                        // Only play with offset if we're past the start and within duration
                        if (offset_in_audio >= 0 && offset_in_audio <= matching_audio.duration) {
                            // Add to Set BEFORE playing to prevent duplicate calls on subsequent frames
                            this.currently_playing_audio.add(audio_path);
                            this.audio_manager.play(audio_path, offset_in_audio);
                        }
                    }
                }
            }
        }
        for(let i=0;i<objects.length;i++ ) {
            let object=objects[i];
            if(object.type=='text') {
                // Wrap text to fit within dialog width with padding
                const text_padding = 40; // 20px padding on each side
                const max_text_width = position.width - text_padding;
                const wrapped_text = this.graphics.font.wrap_text(object.data.text, max_text_width, false);

                let text_position=new rect(position.x+position.width/2,position.y+position.height/4,null,null,"center","center");
                let bounds=this.graphics.font.get_bounds(wrapped_text,false);
                var line_count = (wrapped_text.match(/\n/g) || []).length+1;

                bounds.width=position.width;
                bounds.height=this.graphics.font.mono_char_height*line_count+30;
                bounds.x=position.x+0;
                bounds.y=text_position.y-bounds.height/2;
                this.graphics.sprites.draw_rect(bounds,"rgba(22, 22, 22, 0.8)");

                this.graphics.font.draw_text(text_position, wrapped_text,true,false);


            }
        }


    }

    
    
    async load_slide(slide) {
        //add all the images for this slide
        if (slide.images) {
            for(let i=0;i<slide.images.length;i++) {
                this.graphics.sprites.add(slide.images[i].path);
            }
        }

        //add all the audio for this slide (and wait for it to decode)
        if (slide.audio) {
            const audioPromises = [];
            for(let i=0;i<slide.audio.length;i++) {
                audioPromises.push(this.audio_manager.add(slide.audio[i].path));
            }
            await Promise.all(audioPromises);
        }
    }

    play_audio(audioPath, timestamp) {
        this.audio.src = audioPath;
        this.audio.currentTime = timestamp;
        this.audio.play();
    }

    get_progress() {
        return {
            current: this.elapsed || 0,
            total: this.get_total_duration(),
            paused: this.paused
        };
    }

    close(){
        this.playing=false;

        // Clear any pending seek timeout
        if (this._seek_timeout) {
            clearTimeout(this._seek_timeout);
        }

        // Stop all audio playback
        this.stop_all_audio();
        this.currently_playing_audio.clear();
    }
}
