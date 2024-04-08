class audio_manager {
        constructor() {
            this.defaultSounds = new Map();
            this.playingSounds = new Map();
            this.playSounds = true;
            this.defaultVolume = 0.4;
        }
    
        add(key, audioPath=null) {
            if (audioPath==null) audioPath=key;
            const sound = new Audio(audioPath);
            sound.volume = this.defaultVolume;
    
            this.defaultSounds.set(key, sound);
    
            if (!this.playingSounds.has(key)) {
                this.playingSounds.set(key, []);
            }
    
            return sound; // Return the default audio object
        }
    
        get(key) {
            if (this.defaultSounds.has(key)) {
                return this.defaultSounds.get(key);
            } else {
                return false;
            }
        }
    
        is_playing(key) {
            if (!this.playingSounds.has(key)) {
                return false;
            }
    
            return this.playingSounds.get(key).length > 0;
        }
    
        async play(key) {
            console.log("Attempting Playing: "+key)
            if (this.playSounds && this.defaultSounds.has(key)) {
                const defaultSound = this.defaultSounds.get(key); // Get the default audio object
                const clonedSound = defaultSound.cloneNode(true); // Clone the default audio object
                
                await new Promise((resolve) => {
                    clonedSound.addEventListener('loadeddata', resolve);
                });
                this.playingSounds.get(key).push(clonedSound); // Save cloned sound in array
                clonedSound.volume=this.defaultVolume;
                clonedSound.play(); // Play the cloned audio object
                console.log("Playing: "+key)
                
                // Remove sound from playingSounds map when it finishes playing
                clonedSound.addEventListener('ended', () => {
                    const index = this.playingSounds.get(key).indexOf(clonedSound);
                    if (index !== -1) {
                        this.playingSounds.get(key).splice(index, 1);
                    }
                });
            }
        }
    
        async stop(key) {
            if (this.playingSounds.has(key)) {
                this.playingSounds.get(key).forEach(sound => {
                    sound.pause();
                    sound.currentTime = 0;
                });
                this.playingSounds.set(key, []); // Clear the array
            }
        }
    
        async pause(key) {
            if (this.playingSounds.has(key)) {
                this.playingSounds.get(key).forEach(sound => {
                    sound.pause();
                });
            }
        }
    
        sound_off() {
            this.playSounds = false;
            this.playingSounds.forEach(sounds => {
                sounds.forEach(sound => {
                    sound.pause();
                });
            });
        }
    
        sound_on() {
            this.playSounds = true;
            this.playingSounds.forEach(sounds => {
                sounds.forEach(sound => {
                    sound.play();
                });
            });
        }
    
        set_volume(key, volume) {
            if (volume == null || isNaN(volume)) {
                console.error("Invalid volume value");
                return;
            }
    
            if (this.playingSounds.has(key)) {
                this.playingSounds.get(key).forEach(sound => {
                    sound.volume = volume;
                });
            }
    
            if (this.defaultSounds.has(key)) {
                const defaultSound = this.defaultSounds.get(key);
                defaultSound.volume = volume;
            }
        }
    }
    
/*
class audio_manager {
    constructor() {
        this.play_sounds = true;
        this.volume=.4;
        this.audio = [];
    }

    add(key, audio_path = null) {
        //dont double add it...        
        if (this.audio[key]) {
            return this.audio[key].sound;
        }
        if (audio_path == null) audio_path = key;

        const s = new Audio(audio_path);

        this.audio[key] = {
            sound: s,
            url: audio_path,
        };


    }
    is_playing(key){
        if(this.audio[key].sound.paused) return false;
        else return true;
    }
    stop(key){
        this.audio[key].sound.pause();
        this.audio[key].sound.currentTime = 0;
    }


    get(key) {
        const s = this.audio[key];
        if (!s) {
            console.log("Missing sound: " + key);
            return;
        }
        return s.sound;
    }

    sound_off() {
        this.play_sounds = false;
        for (let i = 0; i < this.audio.length; i++) {
            this.audio[i].sound.pause();
        }
    }

    sound_on() {
        this.play_sounds = true;
    }
    playing(){
        return this.play_sounds;
    }
    set_volume(volume) {
        if (volume == null) {
            volume = 0;
            console.log("Volume Error");
        }
        this.volume = volume;
        for (let i = 0; i < this.audio.length; i++) {
            this.audio[i].sound.volume = volume;
        }
    }

    play(key) {
        if (this.play_sounds) {
            let s = this.get(key);
            if(s) {
                s.play();
            }
        }
    }

    pause(key) {
        if (this.play_sounds) {
            let s = this.get(key);
            if (s) {
                s.pause();
            }
        }
    }

}


*/