class audio_manager {
    constructor() {
        this.play_sounds = false;
        this.volime=.4;
        this.audio = [];
    }

    add(key, audio_path = null) {
        //dont double add it...        
        if (this.audio[key]) {1
            return this.audio[key].sound;
        }
        if (audio_path == null) audio_path = key;

        const s = new Audio(audio_path);

        this.audio[key] = {
            sound: s,
            url: audio_path,
        };


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


