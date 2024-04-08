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
            this.playingSounds.get(key).push(clonedSound); // Save cloned sound in array
            
            await new Promise((resolve) => {
                clonedSound.addEventListener('loadeddata', resolve);
            });
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
