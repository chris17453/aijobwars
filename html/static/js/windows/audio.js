class audio_manager {
    constructor(logger) {
        this.defaultSounds = new Map();
        this.playingSounds = new Map();
        this.playSounds = true;
        this.defaultVolume = 0.4;
        this.logger = logger || console;
    }

    sanitize_path(path) {
        if (typeof path !== 'string') {
            throw new Error("Invalid audio path type");
        }
        // Basic sanitization: remove potentially dangerous characters
        return path.replace(/[<>"'`;]/g, '');
    }

    add(key, audioPath = null) {
        try {
            if (audioPath === null) audioPath = key;
            audioPath = this.sanitize_path(audioPath);
            const sound = new Audio(audioPath);
            sound.volume = this.defaultVolume;
            this.defaultSounds.set(key, sound);
            if (!this.playingSounds.has(key)) {
                this.playingSounds.set(key, []);
            }
            return sound;
        } catch (error) {
            console.error(`add(${key}): ${error.message}`);
            throw error;
        }
    }

    get(key) {
        try {
            if (this.defaultSounds.has(key)) {
                return this.defaultSounds.get(key);
            } else {
                console.warn(`get(${key}): Sound not found`);
                return false;
            }
        } catch (error) {
            console.error(`get(${key}): ${error.message}`);
            throw error;
        }
    }

    is_playing(key) {
        try {
            if (!this.playingSounds.has(key)) {
                return false;
            }
            return this.playingSounds.get(key).length > 0;
        } catch (error) {
            console.error(`is_playing(${key}): ${error.message}`);
            return false;
        }
    }

    async play(key) {
        console.log("Attempting Playing: " + key);
        try {
            if (this.playSounds && this.defaultSounds.has(key)) {
                const defaultSound = this.defaultSounds.get(key);
                const clonedSound = defaultSound.cloneNode(true);
                this.playingSounds.get(key).push(clonedSound);
                await new Promise((resolve, reject) => {
                    clonedSound.addEventListener('loadeddata', resolve, { once: true });
                    clonedSound.addEventListener('error', (e) => {
                        console.error(`play(${key}): Error loading audio`, e);
                        reject(e);
                    }, { once: true });
                });
                clonedSound.volume = this.defaultVolume;
                await clonedSound.play();
                console.log("Playing: " + key);
                clonedSound.addEventListener('ended', () => {
                    const index = this.playingSounds.get(key).indexOf(clonedSound);
                    if (index !== -1) {
                        this.playingSounds.get(key).splice(index, 1);
                    }
                });
            } else {
                console.warn(`play(${key}): Sound not available or playback disabled`);
            }
        } catch (error) {
            console.error(`play(${key}): ${error.message}`);
        }
    }

    async stop(key) {
        try {
            if (this.playingSounds.has(key)) {
                this.playingSounds.get(key).forEach(sound => {
                    try {
                        sound.pause();
                        sound.currentTime = 0;
                    } catch (error) {
                        console.error(`stop(${key}) inner error: ${error.message}`);
                    }
                });
                this.playingSounds.set(key, []);
            } else {
                console.warn(`stop(${key}): No active sounds`);
            }
        } catch (error) {
            console.error(`stop(${key}): ${error.message}`);
        }
    }

    async pause(key) {
        try {
            if (this.playingSounds.has(key)) {
                this.playingSounds.get(key).forEach(sound => {
                    try {
                        sound.pause();
                    } catch (error) {
                        console.error(`pause(${key}) inner error: ${error.message}`);
                    }
                });
            } else {
                console.warn(`pause(${key}): No active sounds`);
            }
        } catch (error) {
            console.error(`pause(${key}): ${error.message}`);
        }
    }

    sound_off() {
        try {
            this.playSounds = false;
            this.playingSounds.forEach((sounds, key) => {
                sounds.forEach(sound => {
                    try {
                        sound.pause();
                    } catch (error) {
                        console.error(`sound_off(${key}) inner error: ${error.message}`);
                    }
                });
            });
        } catch (error) {
            console.error(`sound_off: ${error.message}`);
        }
    }

    sound_on() {
        try {
            this.playSounds = true;
            this.playingSounds.forEach((sounds, key) => {
                sounds.forEach(async (sound) => {
                    try {
                        await sound.play();
                    } catch (error) {
                        console.error(`sound_on(${key}) inner error: ${error.message}`);
                    }
                });
            });
        } catch (error) {
            console.error(`sound_on: ${error.message}`);
        }
    }

    set_volume(key, volume) {
        if (volume == null || isNaN(volume)) {
            console.error("Invalid volume value");
            return;
        }
        try {
            if (this.playingSounds.has(key)) {
                this.playingSounds.get(key).forEach(sound => {
                    try {
                        sound.volume = volume;
                    } catch (error) {
                        console.error(`set_volume(${key}) for playing sound: ${error.message}`);
                    }
                });
            }
            if (this.defaultSounds.has(key)) {
                try {
                    this.defaultSounds.get(key).volume = volume;
                } catch (error) {
                    console.error(`set_volume(${key}) for default sound: ${error.message}`);
                }
            }
        } catch (error) {
            console.error(`set_volume(${key}): ${error.message}`);
        }
    }
}
