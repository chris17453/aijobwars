class audio_manager {
    constructor(logger) {
        this.audioBuffers = new Map(); // Decoded audio buffers
        this.audioSources = new Map(); // Currently playing sources
        this.audioStates = new Map(); // Track loading state: 'loading'|'ready'|'error'
        this.playSounds = true;
        this.defaultVolume = 0.4;
        this.logger = logger || console;

        // Create Web Audio API context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create master gain node for volume control
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.defaultVolume;
        this.masterGain.connect(this.audioContext.destination);
    }

    sanitize_path(path) {
        if (typeof path !== 'string') {
            throw new Error("Invalid audio path type");
        }
        // Basic sanitization: remove potentially dangerous characters
        return path.replace(/[<>"'`;]/g, '');
    }

    async add(key, audioPath = null) {
        try {
            if (audioPath === null) audioPath = key;
            audioPath = this.sanitize_path(audioPath);

            // If already loaded or loading, return existing promise
            if (this.audioBuffers.has(key)) {
                return this.audioBuffers.get(key);
            }

            // Mark as loading
            this.audioStates.set(key, 'loading');

            // Fetch and decode audio buffer
            const response = await fetch(audioPath);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Store the decoded buffer and mark as ready
            this.audioBuffers.set(key, audioBuffer);
            this.audioStates.set(key, 'ready');

            return audioBuffer;
        } catch (error) {
            // Mark as error state
            this.audioStates.set(key, 'error');
            console.error(`add(${key}): ${error.message}`);
            throw error;
        }
    }

    get(key) {
        try {
            if (this.audioBuffers.has(key)) {
                return this.audioBuffers.get(key);
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
            return this.audioSources.has(key) && this.audioSources.get(key) !== null;
        } catch (error) {
            console.error(`is_playing(${key}): ${error.message}`);
            return false;
        }
    }

    async play(key, startTime = 0, loop = false) {
        try {
            // Resume audio context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            if (!this.playSounds || !this.audioBuffers.has(key)) {
                console.warn(`play(${key}): Sound not available or playback disabled`);
                return;
            }

            // Stop any currently playing instance
            this.stop(key);

            const audioBuffer = this.audioBuffers.get(key);

            // Create source node
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = loop; // Enable looping for background music

            // Create gain node for this source
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 1.0;

            // Connect: source -> gain -> master gain -> destination
            source.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Store source and gain for later control
            this.audioSources.set(key, { source, gainNode, startedAt: this.audioContext.currentTime - startTime });

            // Start playback from offset
            source.start(0, startTime);

            // Clean up when finished (only for non-looping sounds)
            if (!loop) {
                source.onended = () => {
                    if (this.audioSources.get(key)?.source === source) {
                        this.audioSources.delete(key);
                    }
                };
            }

        } catch (error) {
            console.error(`play(${key}): ${error.message}`, error);
        }
    }

    stop(key) {
        try {
            const sourceData = this.audioSources.get(key);
            if (sourceData) {
                try {
                    sourceData.source.stop();
                } catch (e) {
                    // Already stopped
                }
                this.audioSources.delete(key);
            }
        } catch (error) {
            console.error(`stop(${key}): ${error.message}`);
        }
    }

    pause(key) {
        // Web Audio API doesn't have pause, so we stop and track position
        try {
            const sourceData = this.audioSources.get(key);
            if (sourceData) {
                const elapsed = this.audioContext.currentTime - sourceData.startedAt;
                const wasLooping = sourceData.source.loop;
                this.stop(key);
                // Store pause position and loop state
                this.audioSources.set(key + '_paused', { elapsed, loop: wasLooping });
            }
        } catch (error) {
            console.error(`pause(${key}): ${error.message}`);
        }
    }

    async resume(key) {
        // Resume from paused position
        try {
            const pausedData = this.audioSources.get(key + '_paused');
            if (pausedData) {
                const startTime = pausedData.elapsed || 0;
                const loop = pausedData.loop || false;
                this.audioSources.delete(key + '_paused');
                await this.play(key, startTime, loop);
            }
        } catch (error) {
            console.error(`resume(${key}): ${error.message}`);
        }
    }

    sound_off() {
        try {
            this.playSounds = false;
            this.masterGain.gain.value = 0;
        } catch (error) {
            console.error(`sound_off: ${error.message}`);
        }
    }

    sound_on() {
        try {
            this.playSounds = true;
            this.masterGain.gain.value = this.defaultVolume;
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
            const sourceData = this.audioSources.get(key);
            if (sourceData && sourceData.gainNode) {
                sourceData.gainNode.gain.value = volume;
            }
        } catch (error) {
            console.error(`set_volume(${key}): ${error.message}`);
        }
    }

    set_master_volume(volume) {
        if (volume == null || isNaN(volume)) {
            console.error("Invalid volume value");
            return;
        }
        try {
            this.defaultVolume = volume;
            this.masterGain.gain.value = volume;
        } catch (error) {
            console.error(`set_master_volume: ${error.message}`);
        }
    }

    isReady(key) {
        return this.audioStates.get(key) === 'ready';
    }

    async waitForAudio(key) {
        // If already ready, return immediately
        if (this.isReady(key)) {
            return Promise.resolve();
        }

        // If in error state, reject
        if (this.audioStates.get(key) === 'error') {
            return Promise.reject(new Error(`Audio ${key} failed to load`));
        }

        // Wait for state to change to 'ready' or 'error'
        return new Promise((resolve, reject) => {
            const checkState = () => {
                const state = this.audioStates.get(key);

                if (state === 'ready') {
                    resolve();
                } else if (state === 'error') {
                    reject(new Error(`Audio ${key} failed to load`));
                } else {
                    // Still loading, check again next frame
                    requestAnimationFrame(checkState);
                }
            };
            checkState();
        });
    }
}
