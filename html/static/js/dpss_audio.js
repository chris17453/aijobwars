class AudioManager {
    constructor() {
        this.audioMap = new Map(); // Map to store audio elements
    }

    // Method to load an audio file and store it in the map
    load(key, src) {
        const audio = new Audio(src);
        this.audioMap.set(key, audio);
    }

    // Method to play the audio corresponding to the given key
    play(key) {
        const audio = this.audioMap.get(key);
        if (audio) {
            audio.play();
        }
    }

    // Method to stop the audio corresponding to the given key
    stop(key) {
        const audio = this.audioMap.get(key);
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Reset playback to the beginning
        }
    }
}



