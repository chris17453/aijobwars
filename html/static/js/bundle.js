class events {
  constructor(logger) {
    this.events = {}; // Object to hold events
    this.logger = logger || console;
  }

  on(event_name, callback) {
    try {
      if (typeof event_name !== 'string') {
        throw new Error("Event name must be a string");
      }
      if (typeof callback !== 'function') {
        throw new Error("Callback must be a function");
      }
      if (!this.events[event_name]) {
        this.events[event_name] = [];
      }
      this.events[event_name].push(callback);
    } catch (error) {
      this.logger.error(`on(${event_name}): ${error.message}`);
    }
  }

  emit(event_name, data = null) {
    try {
      if (data == null) {
        data = {};
      }
      if (this.hasOwnProperty('parent')) {
        data.parent = this.parent;
      }
      data.instance = this;
      data.event = event_name;

      if (this.events[event_name]) {
        this.events[event_name].forEach(callback => {
          try {
            callback(data);
          } catch (cbError) {
            this.logger.error(`emit(${event_name}) callback error: ${cbError.message}`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`emit(${event_name}): ${error.message}`);
    }
  }
}
class point{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
}

class rect {
    constructor(x, y, width, height, x_mode = "left", y_mode = "top") {
        this._x = x !== null ? parseInt(x) : null;
        this._y = y !== null ? parseInt(y) : null;
        this._width  = width !== null ? parseInt(width) : null;
        this._height = height !== null ? parseInt(height) : null;
        this._y_mode = y_mode !== null ? y_mode : "top";
        this._x_mode = x_mode !== null ? x_mode : "left";
    }
    
    get x() {
        return this._x;
    }

    set x(value) {
        this._x = parseInt(value);
    }

    get y() {
        return this._y;
    }

    set y(value) {
                this._y = parseInt(value);
      
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (value >= 0) {
            this._width = parseInt(value);
            switch(this._x_mode) {
                
                case 'center': parseInt(this._x-=value/2); break;
            }
        }
    }

    get height() {

        return this._height;
    }

    set height(value) {
        if (value >= 0) {
            this._height = parseInt(value);
            switch(this._y_mode) {
                case 'center': parseInt(this._y-=value/2); break;
            }
        }
    }

    set center_x(value) {
        this._x = parseInt(value - this._width / 2);
    }

    set center_y(value) {
        this._y = parseInt(value - this._height / 2);
    }

    get center_x() {
        if (this._width == null) return this.x;
        return parseInt(this._x + this._width / 2);
    }

    get center_y() {
        if (this._height == null) return this.y;
        return parseInt(this._y + this._height / 2);
    }


    get bottom() {
        if (this._height == null) return this.y;
        return this.y + this._height;
    }

    get right() {
        if (this._width == null) return this.x;
        return this.x + this._width;
    }

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        if (this._width != null) this.width = Math.round(this._width);
        if (this._height != null) this.height = Math.round(this._height);

    }
    clone() {
        return new rect(this._x, this._y, this._width, this._height, this._x_mode, this._y_mode);
    }

    add(rect2){
        this._x+=rect2.x;
        this._y+=rect2.y;
    }

    //get the scale for the rect based on another rect.
    get_scale(dest){
        let scale_x =  dest.width/this._width ;
        let scale_y =  dest.height/this._height ;
        return new point(scale_x,scale_y);
    }

    //scale the recy by the point given
    set_scale(dest){
        if (this._x!=null) this._x=parseInt(this._x*dest.x);
        if (this._y!=null) this._y=parseInt(this._y*dest.y);
        if (this._width!=null) this._width=parseInt(this._width*dest.x);
        if (this._height!=null) this._height=parseInt(this._height*dest.y);
    }

}

class grid {
    constructor(outer, inner, size = 9) {
        this.outer = outer;
        this.inner = inner;
        if (size == 9) {
            this.quadrants = this.calculate_quadrants_9();
        }
        if (size == 3) {
            this.quadrants = this.calculate_quadrants_3();
        }
    }

    calculate_quadrants_3() {
        const quadrants = [];

        // Precompute the necessary variables for each quadrant

        let top_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);


        // Top-left quadrant (1)
        quadrants.push(new rect(this.outer.x, this.outer.y, this.inner.x - this.outer.x, this.outer.height));

        // Top-center quadrant (2)
        quadrants.push(new rect(this.inner.x, this.outer.y, this.inner.width, this.outer.height));

        // Top-right quadrant (3)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.outer.y, top_right_width, this.outer.height));

        return quadrants;
    }


    calculate_quadrants_9() {
        const quadrants = [];

        // Precompute the necessary variables for each quadrant
        let top_left_width = this.inner.x - this.outer.x;
        let top_left_height = this.inner.y - this.outer.y;

        let top_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);
        let top_right_height = this.inner.y - this.outer.y;

        let bottom_left_width = this.inner.x - this.outer.x;
        let bottom_left_height = (this.outer.y + this.outer.height) - (this.inner.y + this.inner.height);

        let bottom_right_width = (this.outer.x + this.outer.width) - (this.inner.x + this.inner.width);
        let bottom_right_height = (this.outer.y + this.outer.height) - (this.inner.y + this.inner.height);

        // Top-left quadrant (1)
        quadrants.push(new rect(this.outer.x, this.outer.y, top_left_width, top_left_height));

        // Top-center quadrant (2)
        quadrants.push(new rect(this.inner.x, this.outer.y, this.inner.width, top_left_height));

        // Top-right quadrant (3)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.outer.y, top_right_width, top_right_height));

        // Middle-left quadrant (4)
        quadrants.push(new rect(this.outer.x, this.inner.y, top_left_width, this.inner.height));

        // Center quadrant (5)
        quadrants.push(new rect(this.inner.x, this.inner.y, this.inner.width, this.inner.height));

        // Middle-right quadrant (6)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.inner.y, top_right_width, this.inner.height));

        // Bottom-left quadrant (7)
        quadrants.push(new rect(this.outer.x, this.inner.y + this.inner.height, bottom_left_width, bottom_left_height));

        // Bottom-center quadrant (8)
        quadrants.push(new rect(this.inner.x, this.inner.y + this.inner.height, this.inner.width, bottom_left_height));

        // Bottom-right quadrant (9)
        quadrants.push(new rect(this.inner.x + this.inner.width, this.inner.y + this.inner.height, bottom_right_width, bottom_right_height));

        return quadrants;
    }
}
/**
 * Asset Loader - Loads and manages asset packages via ASSETS.json manifest
 * Allows easy swapping of asset packages for localization, themes, etc.
 */
class asset_loader extends events {
    constructor() {
        super();
        this.manifest = null;
        this.package_name = null;
        this.package_version = null;
        this.loaded = false;
    }

    /**
     * Load the asset manifest from ASSETS.json
     * @returns {Promise} Resolves when manifest is loaded
     */
    async load_manifest(manifest_path = 'static/ASSETS.json') {
        try {
            const response = await fetch(manifest_path);
            if (!response.ok) {
                throw new Error(`Failed to load manifest: ${response.status}`);
            }

            this.manifest = await response.json();
            this.package_name = this.manifest.package_name;
            this.package_version = this.manifest.package_version;
            this.loaded = true;

            console.log(`[AssetLoader] Loaded package: ${this.package_name} v${this.package_version}`);
            this.emit('loaded', { package: this.package_name, version: this.package_version });

            return this.manifest;
        } catch (error) {
            console.error('[AssetLoader] Failed to load manifest:', error);
            throw error;
        }
    }

    /**
     * Get a nested property from the assets object using dot notation
     * @param {string} path - Dot-separated path (e.g., "ui.spritesheets.ui1", "ships.player")
     * @returns {any} The value at that path, or null if not found
     */
    get(path) {
        if (!this.loaded || !this.manifest) {
            console.warn('[AssetLoader] Manifest not loaded yet');
            return null;
        }

        const parts = path.split('.');
        let current = this.manifest.assets;

        for (const part of parts) {
            if (current[part] === undefined) {
                console.warn(`[AssetLoader] Path not found: ${path}`);
                return null;
            }
            current = current[part];
        }

        return current;
    }

    /**
     * Flatten all asset paths into a single array (useful for preloading)
     * @returns {Array<string>}
     */
    get_all_assets() {
        if (!this.loaded || !this.manifest) {
            return [];
        }

        const all_assets = [];

        const flatten = (obj) => {
            if (typeof obj === 'string') {
                all_assets.push(obj);
            } else if (Array.isArray(obj)) {
                obj.forEach(item => flatten(item));
            } else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(value => flatten(value));
            }
        };

        flatten(this.manifest.assets);
        return all_assets;
    }

    /**
     * Get package information
     * @returns {Object}
     */
    get_package_info() {
        return {
            name: this.package_name,
            version: this.package_version,
            description: this.manifest?.description || ''
        };
    }
}

// This class manages viewport scaling with minimum dimensions
// Maintains a minimum virtual viewport and scales appropriately
// Handles letterboxing/pillarboxing when aspect ratios don't match

class viewport {

    constructor(width, height) {
        this.frame = { x: 0, y: 0, width: 0, height: 0 };
        this.requested = { width: width, height: height };
        this.virtual = { width: 0, height: 0 };
        this.given = { x: 0, y: 0, width: 0, height: 0 };
        this.world = { x:0, y:0, width: 0, height: 0 };

        // Minimum virtual dimensions (design target) by orientation
        this.min_virtual_landscape = {
            width: 1920,
            height: 1080
        };

        this.min_virtual_portrait = {
            width: 1080,
            height: 1920
        };

        this.scale = { x: 1, y: 1 };
        this.calculate();
    }

    calculate() {
        // Display area size (force integers to match canvas dimensions)
        this.frame = {
            x: 0,
            y: 0,
            width: Math.floor(window.innerWidth),
            height: Math.floor(window.innerHeight)
        };

        // Canvas dimensions match the window
        this.given.width = Math.floor(this.frame.width);
        this.given.height = Math.floor(this.frame.height);
        this.given.x = 0;
        this.given.y = 0;

        this.calculate_scale();
        this.world.height = this.virtual.height;
        this.world.width = this.virtual.width;
    }

    calculate_scale() {
        // Select minimum dimensions based on orientation
        const isPortrait = this.given.height > this.given.width;
        const min_virtual = isPortrait ? this.min_virtual_portrait : this.min_virtual_landscape;

        // Virtual viewport is ALWAYS the minimum/design resolution
        // This ensures consistent coordinate space for all game objects
        this.virtual.width = min_virtual.width;
        this.virtual.height = min_virtual.height;

        // Calculate how much we need to scale to fit the screen
        // Use the smaller scale factor to ensure entire viewport fits (letterbox if needed)
        const scaleX = this.given.width / this.virtual.width;
        const scaleY = this.given.height / this.virtual.height;
        const uniformScale = Math.min(scaleX, scaleY);

        // Use uniform scaling to maintain aspect ratio
        this.scale.x = uniformScale;
        this.scale.y = uniformScale;

        // Calculate rendered dimensions and letterbox/pillarbox offsets
        // These are used throughout the app for coordinate transformations
        this.rendered = {
            width: this.virtual.width * this.scale.x,
            height: this.virtual.height * this.scale.y
        };

        this.offset = {
            x: (this.given.width - this.rendered.width) / 2,
            y: (this.given.height - this.rendered.height) / 2
        };
    }

    isPortrait() {
        // Portrait mode when height is greater than width
        return this.frame.height > this.frame.width;
    }
}
class key_states {
    constructor(logger) {
      this.logger = logger || console;
      try {
        this.states = [];
        // Renamed property to avoid conflict with the method name 'shift'
        this.shift_state = false;
        this.ctrl_state = false;
      } catch (error) {
        this.logger.error(`key_states constructor: ${error.message}`);
      }
    }
  
    up(key) {
      try {
        if (!this.states[key] || !this.states[key].justStopped) { // Ensure the justStopped logic
          this.states[key] = { pressed: false, up: true, down: false, justStopped: true };
        }
      } catch (error) {
        this.logger.error(`up(${key}): ${error.message}`);
      }
    }
  
    down(key) {
      try {
        if (!this.states[key] || !this.states[key].justPressed) { // Ensure the justPressed logic
          this.states[key] = { pressed: true, up: false, down: true, justPressed: true };
        }
      } catch (error) {
        this.logger.error(`down(${key}): ${error.message}`);
      }
    }
  
    get_state(key) {
      try {
        if (key in this.states) {
          return this.states[key];
        }
        this.states[key] = { pressed: false, up: false, down: false };
        return this.states[key];
      } catch (error) {
        this.logger.error(`get_state(${key}): ${error.message}`);
        return { pressed: false, up: false, down: false };
      }
    }
  
    is_pressed(key) {
      try {
        return key in this.states && this.states[key].pressed;
      } catch (error) {
        this.logger.error(`is_pressed(${key}): ${error.message}`);
        return false;
      }
    }
  
    just_pressed(key) {
      try {
        if (key in this.states && this.states[key].justPressed) {
          this.states[key].justPressed = false; // Reset after checking
          return true;
        }
        return false;
      } catch (error) {
        this.logger.error(`just_pressed(${key}): ${error.message}`);
        return false;
      }
    }
  
    just_stopped(key) {
      try {
        if (key in this.states && this.states[key].justStopped) {
          this.states[key].justStopped = false; // Reset after checking
          return true;
        }
        return false;
      } catch (error) {
        this.logger.error(`just_stopped(${key}): ${error.message}`);
        return false;
      }
    }
  
    shift() {
      try {
        return this.shift_state;
      } catch (error) {
        this.logger.error(`shift(): ${error.message}`);
        return false;
      }
    }
  
    ctrl() {
      try {
        return this.ctrl_state;
      } catch (error) {
        this.logger.error(`ctrl(): ${error.message}`);
        return false;
      }
    }
  
    event(event) {
      try {
        this.shift_state = event.shiftKey;
        this.ctrl_state = event.ctrlKey;
      } catch (error) {
        this.logger.error(`event(): ${error.message}`);
      }
    }
  }
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
class sprites extends events{
    constructor(ctx, asset_loader) {
        super();
        this.base_domain="https://aijobwars.com/";
        this.ctx = ctx;
        this.sprites = {}; //sprite objects.. many to 1 per image possible.
        this.images={};  //image objects
        this.loaded = false; // Flag to track if all images are loaded
        this.asset_loader = asset_loader; // Asset loader for manifest-based loading
    }

    async preload(){
        // Load manifest if not already loaded
        if (!this.asset_loader.loaded) {
            await this.asset_loader.load_manifest();
        }

        console.log('[Sprites] Loading from ASSETS.json manifest...');
        this.load_assets();
    }

    load_assets(){
        const al = this.asset_loader;

        // UI Spritesheets - get paths from manifest
        const ui1 = al.get('ui.spritesheets.ui1');
        const ui4 = al.get('ui.spritesheets.ui4');

        // UI Elements from UI1.png spritesheet
        this.add("window", ui1, 67, 67, 565, 332);
        this.add("window-title", ui1, 162 - 10, 411 - 10, 372 + 10 * 2, 68 + 10 * 2);
        this.add("button-down-red", ui1, 683, 77, 206, 68);
        this.add("button-up-red", ui1, 683, 161, 206, 68);
        this.add("button-down-yellow", ui1, 928, 77, 206, 68);
        this.add("button-up-yellow", ui1, 927, 161, 206, 68);
        this.add("button-down-cyan", ui1, 683, 281, 206, 68);
        this.add("button-up-cyan", ui1, 683, 365, 206, 68);
        this.add("button-down-gray", ui1, 928, 281, 206, 68);
        this.add("button-up-gray", ui1, 927, 365, 206, 68);
        this.add("percentage-full", ui1, 182 - 12, 707 - 12, 30 + 12 * 2, 45 + 12 * 2);
        this.add("percentage-empty", ui1, 929 - 12, 707 - 12, 30 + 12 * 2, 45 + 12 * 2);

        // UI Elements from UI4.png spritesheet
        this.add("window-thinn", ui4, 1721-10, 154-10, 348 + 10 * 2, 466 + 10 * 2);
        this.add("window-close-up", ui4, 1806, 678, 42, 42);
        this.add("window-close-down", ui4, 1857, 677, 42, 42);
        this.add("window-right-corner", ui4, 1908, 661, 80, 73);

        // Scrollbar components - updated with precise coordinates
        this.add("scroll-down", ui4, 1641, 585, 31, 31);      // Down button: 1641,585 x 1672,616
        this.add("scroll-up", ui4, 1641, 143, 31, 32);        // Up button: 1641,143 x 1672,175 (rotate 90 deg)
        this.add("scroll-drag", ui4, 1641, 194, 31, 53);      // Scrollbar slider: 1641,194 x 1672,247
        this.add("scroll-bg", ui4, 1641, 267, 31, 299);       // Scroll body: 1641,267 x 1672,566
        this.add("bar", ui4, 766, 760, 357, 47);
        this.add("bar-red-fluid", ui4, 780, 901, 312, 33);
        this.add("bar-green-fluid", ui4, 1097, 901, 312, 32);
        this.add("bar-blue-fluid", ui4, 781, 939, 312, 33);
        this.add("bar-orange-fluid", ui4, 1098, 939, 312, 33);
        this.add("portal", ui4, 569, 763, 158, 158);

        // Backgrounds
        this.add("menu_landscape", al.get('ui.backgrounds.menu_landscape'));
        this.add("credits_landscape", al.get('ui.backgrounds.credits_landscape'));
        this.add("highscore_landscape", al.get('ui.backgrounds.highscore_landscape'));
        this.add("prologue_landscape", al.get('ui.backgrounds.prologue_landscape'));
        this.add("menu_portrait", al.get('ui.backgrounds.menu_portrait'));
        this.add("credits_portrait", al.get('ui.backgrounds.credits_portrait'));
        this.add("highscore_portrait", al.get('ui.backgrounds.highscore_portrait'));
        this.add("prologue_portrait", al.get('ui.backgrounds.prologue_portrait'));

        // Fonts
        this.add("blue_font", al.get('fonts.blue'));
        this.add("grey_font", al.get('fonts.grey'));
        this.add("red_font", al.get('fonts.red'));

        // Title
        this.add("title", al.get('title.logo'));

        // Debris
        this.add("debris_email", al.get('debris.email'));
        this.add("debris_pdf", al.get('debris.pdf'));
        this.add("debris_phone", al.get('debris.phone'));
        this.add("debris_webex", al.get('debris.webex'));

        // Blocks
        this.add("block", al.get('blocks.block'));

        // Explosions
        this.add("explosion_sprite", al.get('explosions.sprite'));

        // Ships
        this.add("ship_player", al.get('ships.player'));
        this.add("ship_teams", al.get('ships.teams'));
        this.add("ship_linkedin", al.get('ships.linkedin'));
        this.add("ship_chatgpt", al.get('ships.chatgpt'));
        this.add("ship_resume", al.get('ships.resume'));
        this.add("ship_booster", al.get('ships.booster'));
        this.add("ship_water_bolt", al.get('ships.water_bolt'));

        // Projectiles
        this.add("projectile_arcane_bolt", al.get('projectiles.arcane_bolt'));
        this.add("projectile_firebomb", al.get('projectiles.firebomb'));
        this.add("projectile_p1", al.get('projectiles.p1'));
        this.add("projectile_p2", al.get('projectiles.p2'));
        this.add("projectile_p3", al.get('projectiles.p3'));
        this.add("projectile_p4", al.get('projectiles.p4'));

        // Scene backgrounds
        this.add("bg_stars", al.get('scenes.bg_stars'));
        this.add("bg_stars_landscape", al.get('scenes.bg_stars'));
        this.add("bg_stars_portrait", al.get('scenes.bg_stars'));

        this.on_load();
    }

    add(key, imagePath = null, x = 0, y = 0, width = null, height = null) {
        // Check if the key already exists
        if (this.sprites[key]) {
            //console.warn(`Image with key '${key}' already exists.`);
            return this.sprites[key].image;
        }

        // Set imagePath to key if null
        if (imagePath == null) imagePath = key;

        // Create new Image object if it doesn't exist in the images array
        if (!(imagePath in this.images)) {
            this.images[imagePath] = new Promise((resolve, reject) => {
                const img = new Image();
                //img.crossorigin = `Anonymous`;
                
                // Add event listener for image load
                img.onload = () => {
                    resolve(img); // Resolve the promise with the loaded image
                };

                // Add event listener for image error
                img.onerror = (error) => {
                    reject(error); // Reject the promise if there's an error loading the image
                };

                // Set src for the image
                img.src = imagePath;
            });
        }

        // Create sprite object and return the image promise
        return this.images[imagePath].then((image) => {
            // Add image data to sprites object
            this.sprites[key] = {
                image: image,
                url: imagePath,
                position: new rect(x,y,width || image.width,height||image.height),
                x: x,
                y: y,
                width: width || image.width,
                height: height || image.height,
                collision_mask: null,  // Cache for collision mask
                mask_bounds: null      // Cache for mask bounds
            };

        });
    }

    on_load(){
        // Resolve the main promise when all image promises are resolved
        Promise.all(Object.values(this.images)).then(() => {
            this.loaded = true;
          //  if(callback!==undefined) callback();
          this.emit('complete'); // Emit 'complete' event when all images are loaded
          console.log("Loaded Images");
          }).catch((error) => {
            console.error("Error preloading images:", error);
        });
    }    

    get_or_create_collision_mask(key, position) {
        const sprite = this.sprites[key];
        if (!sprite) {
            console.log("Missing image: " + key);
            return null;
        }

        // Return cached mask if it exists
        if (sprite.collision_mask && sprite.mask_bounds) {
            return {
                collision_mask: sprite.collision_mask,
                mask_bounds: sprite.mask_bounds
            };
        }

        // Generate mask for the first time
        const pixelData = this.get_data(key, position);
        if (!pixelData) return null;

        // Create boolean mask (true = solid pixel)
        sprite.collision_mask = new Array(position.width * position.height);
        for (let i = 0; i < position.width * position.height; i++) {
            const alpha = pixelData[i * 4 + 3]; // Get alpha channel
            sprite.collision_mask[i] = alpha > 50; // Threshold for solid pixels
        }

        // Calculate tight bounding box from mask
        sprite.mask_bounds = this.get_bounds(key, position);

        console.log(`[Sprite] Collision mask generated for '${key}': ${position.width}x${position.height}`);

        return {
            collision_mask: sprite.collision_mask,
            mask_bounds: sprite.mask_bounds
        };
    }

    get_bounds(key,position){
        let data=this.get_data(key,position);


        let left = position.width;
        let top = position.height;
        let right = 0;
        let bottom = 0;
        let found=false;
        let index=0;
        for (let y = 0; y < position.height; y++) {
            for (let x = 0; x < position.width; x++) {
                const alpha = data[index];
                if ( alpha >0) {
                    found=true;
                    left = Math.min(left, x);
                    top = Math.min(top, y);
                    right = Math.max(right, x);
                    bottom = Math.max(bottom, y);
                }
                index+= 4;
            }
        }
        if(found==false){
            left=0;
            right=position.width;
            top=0;
            bottom=position.height;
        }

        return new rect ( left, top, right-left, bottom-top,"left","top");
    }
    draw_colored_rectangle(position, color) {
        
        // Set the fill color
        this.ctx.fillStyle = color;
    
        // Draw the rectangle
        this.ctx.fillRect(position.x, position.y, position.width, position.height);
    }
    
    get_data(key, position) {
        let s = this.get(key);
        if (!s) {
            console.log("Missing image");
            return;
        }
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = position.width;
        canvas.height = position.height;
        ctx.drawImage(s.image, position.x, position.y, position.width, position.height, 0, 0, position.width, position.height);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data;
    }
 
    draw_rect(position,color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x,position.y,position.width,position.height); // Rectangle position and dimensions
    }

    // Other methods like render, slice_9, slice_3...
    render(key, src,dest, intensity = 1, mode = 'fill') {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
        if (src==null) src=new rect(s.x,s.y,s.width,s.height);

        // DEBUG: Track save/restore
        this.ctx._saveCount = (this.ctx._saveCount || 0) + 1;

        // Save the current context state
        this.ctx.save();

        // Set global alpha for intensity
        this.ctx.globalAlpha = intensity;

        let dx = dest.x;
        let dy = dest.y;
        let dWidth = dest.width || s.width; // Take source width if destination width is not given
        let dHeight = dest.height || s.height; // Take source height if destination height is not given
        const imgAspectRatio = s.width / s.height;
        const destAspectRatio = dest.width / dest.height;

        switch (mode) {
            case 'contain':
                if (imgAspectRatio > destAspectRatio) {
                    // Image is wider
                    dHeight = dest.width / imgAspectRatio;
                    dy += (dest.height - dHeight) / 2;
                } else {
                    // Image is taller
                    dWidth = dest.height * imgAspectRatio;
                    dx += (dest.width - dWidth) / 2;
                }
                break;
            case 'cover':
                if (imgAspectRatio > destAspectRatio) {
                    // Image is wider
                    dWidth = dest.height * imgAspectRatio;
                    dx -= (dWidth - dest.width) / 2;
                } else {
                    // Image is taller
                    dHeight = dest.width / imgAspectRatio;
                    dy -= (dHeight - dest.height) / 2;
                }
                break;
            case 'none':
                if (!dest.width || !dest.height) {
                    dWidth = s.width;
                    dHeight = s.height;
                } else {
                    dx = dest.x + (dest.width - dWidth) / 2;
                    dy = dest.y + (dest.height - dHeight) / 2;
                }
                break;
            case 'scale-down':
                // Use 'none' mode if it results in a smaller image than 'contain'
                const scaleDownWidth = imgAspectRatio > destAspectRatio ? dest.width : dest.height * imgAspectRatio;
                const scaleDownHeight = imgAspectRatio > destAspectRatio ? dest.width / imgAspectRatio : dest.height;
                if (scaleDownWidth > s.width || scaleDownHeight > s.height) {
                    // Image is naturally smaller than dest
                    dWidth = s.width;
                    dHeight = s.height;
                } else {
                    // Image is larger than dest, scale down like 'contain'
                    if (imgAspectRatio > destAspectRatio) {
                        dHeight = dest.width / imgAspectRatio;
                        dy += (dest.height - dHeight) / 2;
                    } else {
                        dWidth = dest.height * imgAspectRatio;
                        dx += (dest.width - dWidth) / 2;
                    }
                }
                break;
            case 'fill':
            default:
                // Defaults to 'fill' behavior where the image is stretched to fill the dest
                break;
        }

        // Draw the image according to calculated size and position
        this.ctx.drawImage(s.image, src.x, src.y, src.width, src.height, dx, dy, dWidth, dHeight);

        // Restore the context state
        this.ctx.restore();
        this.ctx._saveCount = (this.ctx._saveCount || 1) - 1;
    }

    get(key) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }
        return s;
    }

    slice_9(key, dest,x_margin=90,y_margin=90) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }

        // Round destination rect
        let dx = Math.round(dest.x);
        let dy = Math.round(dest.y);
        let dw = Math.round(dest.width);
        let dh = Math.round(dest.height);

        // Top row starts at dy
        let top_y = dy;
        let top_h = y_margin;

        // Middle row starts where top ends
        let mid_y = top_y + top_h;
        let mid_h = dh - y_margin - y_margin;

        // Bottom row starts where middle ends
        let bot_y = mid_y + mid_h;
        let bot_h = (dy + dh) - bot_y;

        // Left column starts at dx
        let left_x = dx;
        let left_w = x_margin;

        // Center column starts where left ends
        let center_x = left_x + left_w;
        let center_w = dw - x_margin - x_margin;

        // Right column starts where center ends
        let right_x = center_x + center_w;
        let right_w = (dx + dw) - right_x;

        // Draw the 9 quadrants - add +1 to dimensions to prevent gaps from anti-aliasing
        // Top row
        this.ctx.drawImage(s.image, s.x, s.y, x_margin, y_margin,
                          left_x, top_y, left_w + 1, top_h + 1);
        this.ctx.drawImage(s.image, s.x + x_margin, s.y, s.width - x_margin * 2, y_margin,
                          center_x, top_y, center_w + 1, top_h + 1);
        this.ctx.drawImage(s.image, s.x + s.width - x_margin, s.y, x_margin, y_margin,
                          right_x, top_y, right_w + 1, top_h + 1);

        // Middle row
        this.ctx.drawImage(s.image, s.x, s.y + y_margin, x_margin, s.height - y_margin * 2,
                          left_x, mid_y, left_w + 1, mid_h + 1);
        this.ctx.drawImage(s.image, s.x + x_margin, s.y + y_margin, s.width - x_margin * 2, s.height - y_margin * 2,
                          center_x, mid_y, center_w + 1, mid_h + 1);
        this.ctx.drawImage(s.image, s.x + s.width - x_margin, s.y + y_margin, x_margin, s.height - y_margin * 2,
                          right_x, mid_y, right_w + 1, mid_h + 1);

        // Bottom row
        this.ctx.drawImage(s.image, s.x, s.y + s.height - y_margin, x_margin, y_margin,
                          left_x, bot_y, left_w + 1, bot_h + 1);
        this.ctx.drawImage(s.image, s.x + x_margin, s.y + s.height - y_margin, s.width - x_margin * 2, y_margin,
                          center_x, bot_y, center_w + 1, bot_h + 1);
        this.ctx.drawImage(s.image, s.x + s.width - x_margin, s.y + s.height - y_margin, x_margin, y_margin,
                          right_x, bot_y, right_w + 1, bot_h + 1);
    }

    slice_3(key, dest) {
        const s = this.sprites[key];
        if (!s) {
            console.log("Missing image: " + key);
            return;
        }

        let x_margin = 90;

        let source_outer = new rect(s.x, s.y, s.width, s.height);
        let source_inner = new rect(s.x + x_margin, s.y, s.width - x_margin * 2, s.height);

        let dest_outer = new rect(dest.x, dest.y, dest.width, dest.height);
        let dest_inner = new rect(dest.x + x_margin, dest.y, dest.width - (x_margin) * 2, dest.height);

        source_outer.round();
        source_inner.round();
        dest_outer.round();
        dest_inner.round();


        // Assuming grid class and rect class are properly defined and instantiated
        let source_grid = new grid(source_outer, source_inner, 3);
        let dest_grid = new grid(dest_outer, dest_inner, 3);

        // Round coordinates and dimensions

        // Draw each quadrant
        for (let index = 0; index < 3; index++) {
            let dx = dest_grid.quadrants[index].x;
            let dy = dest_grid.quadrants[index].y;
            let dWidth = dest_grid.quadrants[index].width;
            let dHeight = dest_grid.quadrants[index].height;

            // Calculate source dimensions
            let sx = source_grid.quadrants[index].x;
            let sy = source_grid.quadrants[index].y;
            let sWidth = source_grid.quadrants[index].width;
            let sHeight = source_grid.quadrants[index].height;

            // Create pattern for tiling if not a corner quadrant
            if ([0, 2].includes(index)) { // Corners
                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            }
            if ([1].includes(index)) { // Other quadrants are tileds

                this.ctx.drawImage(s.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

            }
        }
    }
    clear(color,position){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x, position.y, position.width, position.height); // Fill the entire canvas with the selected color
    }
    



}class sprite_font {
  constructor(ctx, sprites, image_key, logger, viewport) {
    this.sprites = sprites;
    this.ctx = ctx;
    this.viewport = viewport;
    this.logger = logger || console;
    this.characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]|`\\/@" +
      "°+=*$£€<>";
    this.image = this.sanitize_path(image_key);
    this.spacing_width = 1;
    this.mono_char_width = 22;
    this.mono_char_height = 27;
    this.char_width = 46;
    this.char_height = 43;
    this.chars_per_row = 5;
    this.char_data = [];
    this.sprite = this.sprites.get(this.image);

    this.calculate_char_data();
  }

  sanitize_path(path) {
    if (typeof path !== "string") {
      throw new Error("Invalid image key type");
    }
    return path.replace(/[<>"'`;]/g, "");
  }

  calculate_char_data() {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      for (let i = 0; i < this.characters.length; i++) {
        const char = this.characters[i];
        const sx = (i % this.chars_per_row) * this.char_width;
        const sy = Math.floor(i / this.chars_per_row) * this.char_height;
        let sub_rect = new rect(sx, sy, this.char_width, this.char_height);
        const char_bounds = this.sprites.get_bounds(this.image, sub_rect);
        const char_data = {
          character: char,
          left: char_bounds.left + sx,
          top: char_bounds.top + sy,
          right: char_bounds.right + sx,
          bottom: char_bounds.bottom + sy,
          width: char_bounds.right - char_bounds.left,
          height: char_bounds.bottom - char_bounds.top,
          stride: char_bounds.right - char_bounds.left + 1,
          baseline: char_bounds.top
        };
        this.char_data.push(char_data);
      }
    } catch (error) {
      this.logger.error(`calculate_char_data: ${error.message}`);
      throw error;
    }
  }

  get_character(char) {
    try {
      return this.char_data.find(char_data => char_data.character === char);
    } catch (error) {
      this.logger.error(`get_character(${char}): ${error.message}`);
      return null;
    }
  }

  get_bounds(text, monospace = false) {
    try {
      let x = 0,
        y = 0,
        max_x = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === " ") {
          x += this.mono_char_width;
          continue;
        }
        if (char === "\n") {
          y += this.mono_char_height;
          max_x = Math.max(max_x, x);
          x = 0;
          continue;
        }
        const char_data = this.get_character(char);
        if (!char_data) continue;
        if (monospace) {
          x += this.mono_char_width;
        } else {
          if (i < text.length - 1) x += this.spacing_width;
          x += char_data.width;
        }
      }
      if (y === 0) y = this.mono_char_height;
      max_x = Math.max(max_x, x);
      return new rect(0, 0, max_x, y, "left", "top");
    } catch (error) {
      this.logger.error(`get_bounds: ${error.message}`);
    }
  }

  /**
   * Wrap text to fit within a maximum width
   * Returns text with newlines inserted at appropriate word boundaries
   */
  wrap_text(text, max_width, monospace = false) {
    try {
      // Split into existing lines first (preserve intentional line breaks)
      const existing_lines = text.split('\n');
      const wrapped_lines = [];

      for (let line of existing_lines) {
        // Split line into words
        const words = line.split(' ');
        let current_line = '';
        let current_width = 0;

        for (let i = 0; i < words.length; i++) {
          const word = words[i];

          // Measure word width
          let word_width = 0;
          for (let j = 0; j < word.length; j++) {
            const char = word[j];
            const char_data = this.get_character(char);
            if (!char_data) continue;
            if (monospace) {
              word_width += this.mono_char_width;
            } else {
              word_width += char_data.width + this.spacing_width;
            }
          }

          // Add space width if not first word
          const space_width = this.mono_char_width;
          const total_width = current_width + (current_line ? space_width : 0) + word_width;

          if (total_width > max_width && current_line) {
            // Word would overflow, start new line
            wrapped_lines.push(current_line);
            current_line = word;
            current_width = word_width;
          } else {
            // Add word to current line
            if (current_line) {
              current_line += ' ' + word;
              current_width += space_width + word_width;
            } else {
              current_line = word;
              current_width = word_width;
            }
          }
        }

        // Add remaining text
        if (current_line) {
          wrapped_lines.push(current_line);
        }
      }

      return wrapped_lines.join('\n');
    } catch (error) {
      this.logger.error(`wrap_text: ${error.message}`);
      return text; // Return original text if wrapping fails
    }
  }

  draw_text(position, text, centered = false, monospace = false) {
    try {
      let lines = text.split("\n");
      if (centered) {
        position.y = position.center_y - (lines.length * this.mono_char_height) / 2;
      }
      for (let line in lines) {
        this.draw_single_text(position, lines[line], centered, monospace);
        position.y += this.mono_char_height;
      }
    } catch (error) {
      this.logger.error(`draw_text: ${error.message}`);
    }
  }

  draw_single_text(position, text, centered = false, monospace = false) {
    try {
      if (!this.chars_per_row) {
        this.logger.error("draw_single_text: Image not loaded");
        return;
      }

      let pos_x, padding = 0;
      let pos_y = position.y;
      if (centered) {
        pos_x = position.center_x;
      } else {
        pos_x = position.x;
      }
      if (centered) {
        let bounds = this.get_bounds(text, monospace);
        pos_x -= bounds.center_x;
      }
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === " ") {
          pos_x += this.mono_char_width;
          continue;
        }
        if (char === "\n") return;
        const char_data = this.get_character(char);
        if (!char_data) continue;

        // Draw at virtual coordinates - canvas transform handles scaling
        this.ctx.drawImage(
          this.sprite.image,
          char_data.left,
          char_data.top,
          char_data.width,
          char_data.height,
          pos_x + padding,
          pos_y + char_data.baseline,
          char_data.width,
          char_data.height
        );
        if (monospace) {
          pos_x += this.mono_char_width;
        } else {
          pos_x += char_data.width + this.spacing_width;
        }
        padding = 0;
      }
    } catch (error) {
      this.logger.error(`draw_single_text: ${error.message}`);
    }
  }
}
// Base class for all UI components with standardized layout system
class ui_component extends events {
    constructor(parent, graphics, layout_config = {}, logger) {
        super();
        this.logger = logger || console;
        this.parent = parent;
        this.graphics = graphics;
        this.ctx = graphics.ctx;
        this.active = true;

        // Layout configuration with sensible defaults
        this.layout = {
            // Positioning mode: "absolute", "relative", "anchored"
            mode: layout_config.mode || "relative",

            // Anchoring: which edges to anchor to parent
            // Can be: "top", "bottom", "left", "right", "center", or combinations like "top-left"
            anchor: {
                x: layout_config.anchor_x || "left",  // "left", "right", "center"
                y: layout_config.anchor_y || "top"     // "top", "bottom", "center"
            },

            // Margins: space outside the component (from parent edges)
            margin: {
                top: layout_config.margin_top || 0,
                right: layout_config.margin_right || 0,
                bottom: layout_config.margin_bottom || 0,
                left: layout_config.margin_left || 0
            },

            // Padding: space inside the component (for content)
            padding: {
                top: layout_config.padding_top || 0,
                right: layout_config.padding_right || 0,
                bottom: layout_config.padding_bottom || 0,
                left: layout_config.padding_left || 0
            },

            // Size mode: "fixed", "dynamic", "fill"
            width_mode: layout_config.width_mode || "fixed",   // "fixed" (px), "fill" (parent - margins), "dynamic" (content)
            height_mode: layout_config.height_mode || "fixed", // "fixed" (px), "fill" (parent - margins), "dynamic" (content)

            // Size values (used when mode is "fixed")
            width: layout_config.width || 100,
            height: layout_config.height || 40,

            // Offset from anchor point (relative positioning)
            offset_x: layout_config.offset_x || 0,
            offset_y: layout_config.offset_y || 0
        };

        // Computed position (absolute coordinates in virtual space)
        this.position = new rect(0, 0, this.layout.width, this.layout.height);

        // Parent's position (for relative positioning)
        this.parent_rect = null;

        // Content area (position minus padding)
        this.content_rect = new rect(0, 0, 0, 0);

        // Children components for event bubbling
        this.children = [];
    }

    /**
     * Calculate absolute position based on parent and layout configuration
     * This is called when parent resizes or layout properties change
     */
    calculate_layout(parent_rect) {
        try {
            if (!parent_rect) {
                this.logger.error("calculate_layout: parent_rect is required");
                return;
            }

            this.parent_rect = parent_rect;

            // 1. Calculate width based on width_mode
            let width = 0;
            switch (this.layout.width_mode) {
                case "fixed":
                    width = this.layout.width;
                    break;
                case "fill":
                    width = parent_rect.width - this.layout.margin.left - this.layout.margin.right;
                    break;
                case "dynamic":
                    // Dynamic sizing will be handled by subclasses (e.g., button measures text)
                    width = this.layout.width; // Use specified width for now
                    break;
            }

            // 2. Calculate height based on height_mode
            let height = 0;
            switch (this.layout.height_mode) {
                case "fixed":
                    height = this.layout.height;
                    break;
                case "fill":
                    height = parent_rect.height - this.layout.margin.top - this.layout.margin.bottom;
                    break;
                case "dynamic":
                    // Dynamic sizing will be handled by subclasses
                    height = this.layout.height; // Use specified height for now
                    break;
            }

            // 3. Calculate X position based on anchor_x
            let x = parent_rect.x;
            switch (this.layout.anchor.x) {
                case "left":
                    x = parent_rect.x + this.layout.margin.left + this.layout.offset_x;
                    break;
                case "right":
                    x = parent_rect.x + parent_rect.width - width - this.layout.margin.right - this.layout.offset_x;
                    break;
                case "center":
                    x = parent_rect.x + (parent_rect.width - width) / 2 + this.layout.offset_x;
                    break;
            }

            // 4. Calculate Y position based on anchor_y
            let y = parent_rect.y;
            switch (this.layout.anchor.y) {
                case "top":
                    y = parent_rect.y + this.layout.margin.top + this.layout.offset_y;
                    break;
                case "bottom":
                    y = parent_rect.y + parent_rect.height - height - this.layout.margin.bottom - this.layout.offset_y;
                    break;
                case "center":
                    y = parent_rect.y + (parent_rect.height - height) / 2 + this.layout.offset_y;
                    break;
            }

            // 5. Update position rect
            this.position.x = Math.round(x);
            this.position.y = Math.round(y);
            this.position.width = Math.round(width);
            this.position.height = Math.round(height);

            // 6. Calculate content rect (position minus padding)
            this.content_rect.x = this.position.x + this.layout.padding.left;
            this.content_rect.y = this.position.y + this.layout.padding.top;
            this.content_rect.width = this.position.width - this.layout.padding.left - this.layout.padding.right;
            this.content_rect.height = this.position.height - this.layout.padding.top - this.layout.padding.bottom;

            // 7. Call resize hook for subclasses
            this.on_layout_calculated();

            // 8. Bubble resize to children
            this.resize_children();

        } catch (error) {
            this.logger.error(`calculate_layout: ${error.message}`);
        }
    }

    /**
     * Hook for subclasses to override - called after layout is calculated
     */
    on_layout_calculated() {
        // Subclasses can override this
    }

    /**
     * Resize this component (triggered by parent)
     * This is the external API that parent components call
     */
    resize(parent_rect) {
        try {
            this.calculate_layout(parent_rect);
            this.emit('resize', { component: this, position: this.position });
        } catch (error) {
            this.logger.error(`resize: ${error.message}`);
        }
    }

    /**
     * Bubble resize event to all children
     */
    resize_children() {
        try {
            // Pass our content_rect as the parent_rect for children
            // (so children are positioned relative to our content area, not including padding)
            this.children.forEach(child => {
                if (child && child.resize && typeof child.resize === 'function') {
                    child.resize(this.content_rect);
                }
            });
        } catch (error) {
            this.logger.error(`resize_children: ${error.message}`);
        }
    }

    /**
     * Add a child component
     */
    add_child(child) {
        try {
            if (child) {
                this.children.push(child);
                // Initial layout for the child
                if (this.content_rect) {
                    child.calculate_layout(this.content_rect);
                }
            }
        } catch (error) {
            this.logger.error(`add_child: ${error.message}`);
        }
    }

    /**
     * Remove a child component
     */
    remove_child(child) {
        try {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        } catch (error) {
            this.logger.error(`remove_child: ${error.message}`);
        }
    }

    /**
     * Check if a point (in physical pixels) is inside this component
     */
    is_inside(mouse_x, mouse_y) {
        try {
            if (!this.active || !this.position) return false;

            // Transform mouse coordinates from physical to virtual space
            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (mouse_x - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (mouse_y - viewport.offset.y) / viewport.scale.y;

            // Check collision in virtual coordinate space
            return virtual_mouse_x >= this.position.x &&
                   virtual_mouse_x <= this.position.x + this.position.width &&
                   virtual_mouse_y >= this.position.y &&
                   virtual_mouse_y <= this.position.y + this.position.height;
        } catch (error) {
            this.logger.error(`is_inside: ${error.message}`);
            return false;
        }
    }

    /**
     * Update layout properties and recalculate
     */
    update_layout(new_config) {
        try {
            // Merge new config into existing layout
            Object.assign(this.layout, new_config);

            // Recalculate if we have a parent rect
            if (this.parent_rect) {
                this.calculate_layout(this.parent_rect);
            }
        } catch (error) {
            this.logger.error(`update_layout: ${error.message}`);
        }
    }

    /**
     * Set active state
     */
    set_active(active) {
        try {
            this.active = active;
            // Propagate to children
            this.children.forEach(child => {
                if (child && child.set_active && typeof child.set_active === 'function') {
                    child.set_active(active);
                }
            });
        } catch (error) {
            this.logger.error(`set_active: ${error.message}`);
        }
    }

    /**
     * Render - subclasses should override
     */
    render() {
        // Subclasses override this
    }

    /**
     * Cleanup
     */
    delete() {
        try {
            this.active = false;

            // Delete all children
            this.children.forEach(child => {
                if (child && child.delete && typeof child.delete === 'function') {
                    child.delete();
                }
            });
            this.children = [];

            // Clear references
            delete this.parent;
            delete this.graphics;
            delete this.ctx;
            delete this.layout;
            delete this.position;
            delete this.parent_rect;
            delete this.content_rect;
        } catch (error) {
            this.logger.error(`delete: ${error.message}`);
        }
    }

    /**
     * Helper: Sanitize paths for security
     */
    sanitize_path(path) {
        if (typeof path !== 'string') {
            throw new Error("Invalid path type");
        }
        return path.replace(/[<>"'`;]/g, '');
    }
}
class button extends ui_component {
  /**
   * Button component with proper layout system
   *
   * Usage (new style with layout config):
   *   new button(parent, graphics, label, {
   *     anchor_x: "left", anchor_y: "top",
   *     margin_left: 20, margin_top: 10,
   *     width: 200, height: 60,
   *     width_mode: "fill"  // or "fixed" or "dynamic"
   *   }, callback, "button-up-cyan", "button-down-cyan", "button-hover-cyan");
   *
   * Usage (legacy style - backward compatible):
   *   new button(parent, graphics, label, position_rect, anchor_position_rect, callback, "button-up-cyan", "button-down-cyan", "button-hover-cyan");
   */
  constructor(parent, graphics, label, position_or_config, anchor_position_or_callback, callback_or_up_image, up_image_or_down_image, down_image_or_hover_image, hover_image_or_logger, logger) {
    // Detect legacy vs new style constructor
    let layout_config = {};
    let callback, up_image, down_image, hover_image;
    let legacy_anchor_position = null;
    let legacy_position = null;
    let is_legacy = (position_or_config && typeof position_or_config === 'object' && 'x' in position_or_config && 'width' in position_or_config);

    if (is_legacy) {
      // Legacy style: (parent, graphics, label, position, anchor_position, callback, up_image, down_image, hover_image, logger)
      let position = position_or_config;
      let anchor_position = anchor_position_or_callback;
      callback = callback_or_up_image;
      up_image = up_image_or_down_image;
      down_image = down_image_or_hover_image;
      hover_image = hover_image_or_logger;

      // Convert legacy position/anchor to layout config
      layout_config = {
        mode: "absolute",
        width: position.width,
        height: position.height,
        width_mode: "fixed",
        height_mode: "fixed",
        offset_x: position.x,
        offset_y: position.y,
        anchor_x: position._x_mode || "left",
        anchor_y: position._y_mode || "top"
      };

      // Store for assignment after super()
      legacy_anchor_position = anchor_position;
      legacy_position = position;
    } else {
      // New style: (parent, graphics, label, layout_config, callback, up_image, down_image, hover_image, logger)
      layout_config = position_or_config || {};
      callback = anchor_position_or_callback;
      up_image = callback_or_up_image;
      down_image = up_image_or_down_image;
      hover_image = down_image_or_hover_image;
    }

    super(parent, graphics, layout_config, logger);

    // NOW we can access 'this' - assign legacy properties if needed
    if (is_legacy) {
      this._legacy_anchor_position = legacy_anchor_position;
      this._legacy_position = legacy_position;
      // For legacy mode, directly set position to the legacy position (don't use layout system)
      this.position = legacy_position.clone();
    }

    try {
      this.sprites = graphics.sprites;

      // Sanitize image paths
      this.up_image = this.sanitize_path(up_image);
      this.down_image = this.sanitize_path(down_image);
      this.hover_image = hover_image ? this.sanitize_path(hover_image) : null;

      this.label = label;
      this.is_down = false;
      this.is_hover = false;
      this.monospaced = false;
      this.centered = false;
      this.callback = callback;

      // Calculate inner rect for text (will be updated in on_layout_calculated)
      this.inner = new rect(0, 0, 0, 0);
      this.calculate_inner_rect();

      // Store bound event handlers to enable proper removal later (use visible canvas)
      this._bound_mouse_down = this.handle_mouse_down.bind(this);
      this._bound_mouse_up = this.handle_mouse_up.bind(this);
      this._bound_mouse_move = this.handle_mouse_move.bind(this);

      graphics.visibleCanvas.addEventListener('mousedown', this._bound_mouse_down);
      graphics.visibleCanvas.addEventListener('mouseup', this._bound_mouse_up);
      graphics.visibleCanvas.addEventListener('mousemove', this._bound_mouse_move);
    } catch (error) {
      this.logger.error(`button constructor: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate inner rectangle for centered text
   */
  calculate_inner_rect() {
    try {
      let x_pad = 20;
      let y_pad = 20;

      if (this.graphics && this.graphics.font) {
        let bounds = this.graphics.font.get_bounds(this.label, this.monospaced);

        // If using dynamic width mode, update layout width based on text
        if (this.layout.width_mode === "dynamic") {
          this.layout.width = bounds.width + x_pad * 2;
        }
        if (this.layout.height_mode === "dynamic") {
          this.layout.height = bounds.height + y_pad * 2;
        }

        // Center text within button
        this.inner.x = (this.position.width - bounds.width) / 2;
        this.inner.y = (this.position.height - bounds.height) / 2;
        this.inner.width = bounds.width;
        this.inner.height = bounds.height;
      }
    } catch (error) {
      this.logger.error(`calculate_inner_rect: ${error.message}`);
    }
  }

  /**
   * Hook called after layout is calculated
   */
  on_layout_calculated() {
    this.calculate_inner_rect();
  }

  /**
   * Legacy resize support - converts old anchor_position to new layout system
   */
  resize(anchor_position_or_parent_rect) {
    try {
      // Check if this is legacy style (rect with x/y that looks like anchor position)
      if (this._legacy_position && anchor_position_or_parent_rect) {
        // Legacy mode: update the anchor position and recalculate
        this._legacy_anchor_position = anchor_position_or_parent_rect;

        // For legacy buttons, position is already absolute in virtual space
        // Just update our position rect to match
        if (this._legacy_position) {
          this.position = this._legacy_position.clone();
        }

        this.calculate_inner_rect();
        this.emit('resize', { component: this, position: this.position });
      } else {
        // New style: use parent's layout system
        super.resize(anchor_position_or_parent_rect);
      }
    } catch (error) {
      this.logger.error(`button resize: ${error.message}`);
    }
  }

  render() {
    try {
      if (this.active !== true) return;

      // Determine absolute position
      let render_position;
      let render_inner;

      if (this._legacy_anchor_position) {
        // Legacy mode: add anchor position
        render_position = this.position.clone();
        render_inner = this.inner.clone();
        render_position.add(this._legacy_anchor_position);
        render_inner.add(render_position);
      } else {
        // New mode: position is already absolute
        render_position = this.position.clone();
        render_inner = this.inner.clone();
        render_inner.add(render_position);
      }

      // Apply hover effect
      let img = this.up_image;
      if (this.is_down) {
        img = this.down_image;
      } else if (this.is_hover) {
        // Use hover_image if available, otherwise use up_image with position shift
        if (this.hover_image) {
          img = this.hover_image;
        } else {
          render_position.x += 2;
          render_position.y += 2;
          render_inner.x += 2;
          render_inner.y += 2;
        }
      }

      this.sprites.slice_9(img, render_position, 10, 10);
      this.graphics.font.draw_text(render_inner, this.label, this.centered, this.monospaced);
    } catch (error) {
      this.logger.error(`button render: ${error.message}`);
    }
  }

  /**
   * Override is_inside to handle legacy anchor position
   */
  is_inside(mouse_x, mouse_y) {
    try {
      if (!this.active || !this.position) return false;

      // Transform mouse coordinates from physical to virtual space
      const viewport = this.graphics.viewport;
      const virtual_mouse_x = (mouse_x - viewport.offset.x) / viewport.scale.x;
      const virtual_mouse_y = (mouse_y - viewport.offset.y) / viewport.scale.y;

      // Calculate absolute position
      let check_position = this.position.clone();
      if (this._legacy_anchor_position) {
        check_position.add(this._legacy_anchor_position);
      }

      return virtual_mouse_x >= check_position.x &&
             virtual_mouse_x <= check_position.x + check_position.width &&
             virtual_mouse_y >= check_position.y &&
             virtual_mouse_y <= check_position.y + check_position.height;
    } catch (error) {
      this.logger.error(`is_inside: ${error.message}`);
      return false;
    }
  }

  handle_mouse_down(event) {
    try {
      if (this.active !== true) return;
      if (this.is_down) return;
      if (this.is_inside(event.offsetX, event.offsetY)) {
        this.is_down = true;
      }
    } catch (error) {
      this.logger.error(`handle_mouse_down: ${error.message}`);
    }
  }

  handle_mouse_up(event) {
    try {
      if (this.active !== true) return;
      if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
        if (this.is_down === true) {
          if (this.callback) {
            this.callback.bind(this.parent)({ parent: this.parent, event: event, instance: this });
          }
          this.emit('click', event);
        }
      }
      this.is_down = false;
    } catch (error) {
      this.logger.error(`handle_mouse_up: ${error.message}`);
    }
  }

  handle_mouse_move(event) {
    try {
      if (this.active !== true) return;
      let previously_hover = this.is_hover;
      this.is_hover = this.is_inside(event.offsetX, event.offsetY);

      if (this.is_hover && !previously_hover) {
        this.emit('mouseover', event);
      } else if (!this.is_hover && previously_hover) {
        this.emit('mouseout', event);
      }
    } catch (error) {
      this.logger.error(`handle_mouse_move: ${error.message}`);
    }
  }

  delete() {
    try {
      if (this.graphics && this.graphics.visibleCanvas) {
        this.graphics.visibleCanvas.removeEventListener('mousedown', this._bound_mouse_down);
        this.graphics.visibleCanvas.removeEventListener('mouseup', this._bound_mouse_up);
        this.graphics.visibleCanvas.removeEventListener('mousemove', this._bound_mouse_move);
      }

      delete this.sprites;
      delete this.up_image;
      delete this.down_image;
      delete this.hover_image;
      delete this.label;
      delete this.is_down;
      delete this.is_hover;
      delete this.monospaced;
      delete this.centered;
      delete this.inner;
      delete this.callback;
      delete this._bound_mouse_down;
      delete this._bound_mouse_up;
      delete this._bound_mouse_move;
      delete this._legacy_position;
      delete this._legacy_anchor_position;

      // Call parent cleanup
      super.delete();
    } catch (error) {
      this.logger.error(`button delete: ${error.message}`);
    }
  }
}
class seekbar extends ui_component {
    /**
     * Seekbar component with proper layout system
     *
     * Usage (new style with layout config):
     *   new seekbar(parent, graphics, {
     *     anchor_x: "left", anchor_y: "bottom",
     *     margin_left: 10, margin_right: 10, margin_bottom: 30,
     *     height: 20,
     *     width_mode: "fill"  // Fill parent width minus margins
     *   }, get_progress_callback, seek_callback);
     *
     * Usage (legacy style - backward compatible):
     *   new seekbar(parent, graphics, position_rect, anchor_position_rect, get_progress_callback, seek_callback);
     */
    constructor(parent, graphics, position_or_config, anchor_position_or_get_progress, get_progress_or_seek, seek_callback_or_logger, logger) {
        // Detect legacy vs new style constructor
        let layout_config = {};
        let get_progress_callback, seek_callback;
        let legacy_anchor_position = null;
        let legacy_position = null;
        let is_legacy = (position_or_config && typeof position_or_config === 'object' && 'x' in position_or_config && 'width' in position_or_config);

        if (is_legacy) {
            // Legacy style: (parent, graphics, position, anchor_position, get_progress_callback, seek_callback, logger)
            let position = position_or_config;
            let anchor_position = anchor_position_or_get_progress;
            get_progress_callback = get_progress_or_seek;
            seek_callback = seek_callback_or_logger;

            // Convert legacy position/anchor to layout config
            layout_config = {
                mode: "absolute",
                width: position.width,
                height: position.height,
                width_mode: "fixed",
                height_mode: "fixed",
                offset_x: position.x,
                offset_y: position.y,
                anchor_x: position._x_mode || "left",
                anchor_y: position._y_mode || "top"
            };

            // Store for assignment after super()
            legacy_anchor_position = anchor_position;
            legacy_position = position;
        } else {
            // New style: (parent, graphics, layout_config, get_progress_callback, seek_callback, logger)
            layout_config = position_or_config || {};
            get_progress_callback = anchor_position_or_get_progress;
            seek_callback = get_progress_or_seek;
        }

        super(parent, graphics, layout_config, logger);

        // NOW we can access 'this' - assign legacy properties if needed
        if (is_legacy) {
            this._legacy_anchor_position = legacy_anchor_position;
            this._legacy_position = legacy_position;
            // For legacy mode, directly set position to the legacy position (don't use layout system)
            this.position = legacy_position.clone();
        }

        try {
            this.get_progress_callback = get_progress_callback; // Function that returns {current, total, paused}
            this.seek_callback = seek_callback; // Function called when user seeks
            this.is_dragging = false;

            // Store bound event handlers (use visible canvas for events)
            this._bound_mouse_down = this.handle_mouse_down.bind(this);
            this._bound_mouse_up = this.handle_mouse_up.bind(this);
            this._bound_mouse_move = this.handle_mouse_move.bind(this);

            graphics.visibleCanvas.addEventListener('mousedown', this._bound_mouse_down);
            graphics.visibleCanvas.addEventListener('mouseup', this._bound_mouse_up);
            graphics.visibleCanvas.addEventListener('mousemove', this._bound_mouse_move);
        } catch (error) {
            this.logger.error(`seekbar constructor: ${error.message}`);
            throw error;
        }
    }

    /**
     * Legacy resize support
     */
    resize(anchor_position_or_parent_rect) {
        try {
            if (this._legacy_position && anchor_position_or_parent_rect) {
                // Legacy mode: update the anchor position
                this._legacy_anchor_position = anchor_position_or_parent_rect;

                // Update position rect
                if (this._legacy_position) {
                    this.position = this._legacy_position.clone();
                }

                this.emit('resize', { component: this, position: this.position });
            } else {
                // New style: use parent's layout system
                super.resize(anchor_position_or_parent_rect);
            }
        } catch (error) {
            this.logger.error(`seekbar resize: ${error.message}`);
        }
    }

    render() {
        try {
            if (this.active !== true) return;
            if (!this.ctx || !this.graphics || !this.position) return;

            const progress_data = this.get_progress_callback();
            if (!progress_data) return;

            const {current, total, paused} = progress_data;

            // Ensure we have valid numbers
            if (typeof current !== 'number' || typeof total !== 'number') return;

            // Calculate absolute position
            let seekbar_x, seekbar_y, seekbar_width, seekbar_height;

            if (this._legacy_anchor_position) {
                // Legacy mode: add anchor position
                let relative_position = this.position.clone();
                relative_position.add(this._legacy_anchor_position);
                seekbar_x = relative_position.x;
                seekbar_y = relative_position.y;
                seekbar_width = this.position.width;
                seekbar_height = this.position.height;
            } else {
                // New mode: position is already absolute
                seekbar_x = this.position.x;
                seekbar_y = this.position.y;
                seekbar_width = this.position.width;
                seekbar_height = this.position.height;
            }

            // Calculate progress
            const progress = total > 0 ? Math.min(1, current / total) : 0;

            this.ctx.save();

            // Background track
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
            this.ctx.fillRect(seekbar_x, seekbar_y, seekbar_width, seekbar_height);

            // Progress bar
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.fillRect(seekbar_x, seekbar_y, seekbar_width * progress, seekbar_height);

            // Handle (thumb)
            const handle_x = seekbar_x + (seekbar_width * progress);
            const handle_width = 10;
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.fillRect(handle_x - handle_width/2, seekbar_y - 5, handle_width, seekbar_height + 10);

            // Time display
            const current_time_str = this.format_time(current / 1000);
            const total_time_str = this.format_time(total / 1000);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${current_time_str} / ${total_time_str}`, seekbar_x, seekbar_y - 10);

            // Pause/Play indicator
            this.ctx.textAlign = 'right';
            this.ctx.fillText(paused ? '[PAUSED]' : '[PLAYING]', seekbar_x + seekbar_width, seekbar_y - 10);

            this.ctx.restore();
        } catch (error) {
            this.logger.error(`seekbar render: ${error.message}`);
        }
    }

    format_time(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Override is_inside to handle legacy anchor position
     */
    is_inside(mouse_x, mouse_y) {
        try {
            if (this.active !== true || !this.position) return false;

            // Transform mouse coordinates to virtual space
            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (mouse_x - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (mouse_y - viewport.offset.y) / viewport.scale.y;

            // Calculate absolute position
            let check_position = this.position.clone();
            if (this._legacy_anchor_position) {
                check_position.add(this._legacy_anchor_position);
            }

            // Expand clickable area slightly above and below the bar
            const clickable_padding = 5;

            return virtual_mouse_x >= check_position.x &&
                   virtual_mouse_x <= check_position.x + this.position.width &&
                   virtual_mouse_y >= check_position.y - clickable_padding &&
                   virtual_mouse_y <= check_position.y + this.position.height + clickable_padding;
        } catch (error) {
            this.logger.error(`is_inside: ${error.message}`);
            return false;
        }
    }

    handle_mouse_down(event) {
        try {
            if (this.active !== true) return;
            if (this.is_inside(event.offsetX, event.offsetY)) {
                this.is_dragging = true;
                this.emit('seek_start');
                this.handle_seek(event.offsetX, event.offsetY);
            }
        } catch (error) {
            this.logger.error(`handle_mouse_down: ${error.message}`);
        }
    }

    handle_mouse_up(event) {
        try {
            if (this.active !== true) return;
            if (this.is_dragging) {
                this.is_dragging = false;
                this.emit('seek_end');
            }
        } catch (error) {
            this.logger.error(`handle_mouse_up: ${error.message}`);
        }
    }

    handle_mouse_move(event) {
        try {
            if (this.active !== true) return;
            if (this.is_dragging) {
                this.handle_seek(event.offsetX, event.offsetY);
            }
        } catch (error) {
            this.logger.error(`handle_mouse_move: ${error.message}`);
        }
    }

    handle_seek(mouse_x, mouse_y) {
        try {
            const progress_data = this.get_progress_callback();
            if (!progress_data) return;

            // Transform mouse coordinates to virtual space
            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (mouse_x - viewport.offset.x) / viewport.scale.x;

            // Calculate absolute position
            let seekbar_x, seekbar_width;
            if (this._legacy_anchor_position) {
                let relative_position = this.position.clone();
                relative_position.add(this._legacy_anchor_position);
                seekbar_x = relative_position.x;
                seekbar_width = this.position.width;
            } else {
                seekbar_x = this.position.x;
                seekbar_width = this.position.width;
            }

            // Calculate new time based on click position (in virtual coordinates)
            const click_ratio = Math.max(0, Math.min(1, (virtual_mouse_x - seekbar_x) / seekbar_width));
            const new_time = progress_data.total * click_ratio;

            if (this.seek_callback) {
                this.seek_callback(new_time);
            }

            this.emit('seek', {time: new_time, ratio: click_ratio});
        } catch (error) {
            this.logger.error(`handle_seek: ${error.message}`);
        }
    }

    delete() {
        try {
            // Set active to false first to prevent any ongoing operations
            this.active = false;

            if (this.graphics && this.graphics.visibleCanvas) {
                this.graphics.visibleCanvas.removeEventListener('mousedown', this._bound_mouse_down);
                this.graphics.visibleCanvas.removeEventListener('mouseup', this._bound_mouse_up);
                this.graphics.visibleCanvas.removeEventListener('mousemove', this._bound_mouse_move);
            }

            delete this.get_progress_callback;
            delete this.seek_callback;
            delete this.is_dragging;
            delete this._bound_mouse_down;
            delete this._bound_mouse_up;
            delete this._bound_mouse_move;
            delete this._legacy_position;
            delete this._legacy_anchor_position;

            // Call parent cleanup
            super.delete();
        } catch (error) {
            if (this.logger) {
                this.logger.error(`seekbar delete: ${error.message}`);
            }
        }
    }
}
class scrollbar extends ui_component {
    /**
     * Scrollbar component with proper layout system
     *
     * Usage (new style with layout config):
     *   new scrollbar(parent, graphics, {
     *     anchor_x: "right", anchor_y: "top",
     *     margin_right: 10, margin_top: 10,
     *     width: 31, height: 400,
     *     orientation: "vertical"  // or "horizontal"
     *   }, get_value_callback, set_value_callback);
     *
     * Usage (legacy style - backward compatible):
     *   new scrollbar(parent, graphics, position_rect, anchor_position_rect, orientation, get_value_callback, set_value_callback);
     *
     * Callbacks:
     *   get_value_callback() - returns {current, max} where current is 0 to max
     *   set_value_callback(value) - called when user changes value
     */
    constructor(parent, graphics, position_or_config, anchor_position_or_get_value, orientation_or_set_value, get_value_or_logger, set_value_or_logger, logger) {
        // Detect legacy vs new style constructor
        let layout_config = {};
        let orientation, get_value_callback, set_value_callback;
        let legacy_anchor_position = null;
        let legacy_position = null;
        let is_legacy = (position_or_config && typeof position_or_config === 'object' && 'x' in position_or_config && 'width' in position_or_config);

        if (is_legacy) {
            // Legacy style: (parent, graphics, position, anchor_position, orientation, get_value_callback, set_value_callback, logger)
            let position = position_or_config;
            let anchor_position = anchor_position_or_get_value;
            orientation = orientation_or_set_value;
            get_value_callback = get_value_or_logger;
            set_value_callback = set_value_or_logger;

            // Convert legacy position/anchor to layout config
            layout_config = {
                mode: "absolute",
                width: position.width,
                height: position.height,
                width_mode: "fixed",
                height_mode: "fixed",
                offset_x: position.x,
                offset_y: position.y,
                anchor_x: position._x_mode || "left",
                anchor_y: position._y_mode || "top",
                orientation: orientation || "vertical"
            };

            // Store for assignment after super()
            legacy_anchor_position = anchor_position;
            legacy_position = position;
        } else {
            // New style: (parent, graphics, layout_config, get_value_callback, set_value_callback, logger)
            layout_config = position_or_config || {};
            get_value_callback = anchor_position_or_get_value;
            set_value_callback = orientation_or_set_value;
            orientation = layout_config.orientation || "vertical";
            layout_config.orientation = orientation;
        }

        super(parent, graphics, layout_config, logger);

        // NOW we can access 'this' - assign legacy properties if needed
        if (is_legacy) {
            this._legacy_anchor_position = legacy_anchor_position;
            this._legacy_position = legacy_position;
            // For legacy mode, directly set position to the legacy position (don't use layout system)
            this.position = legacy_position.clone();
        }

        try {
            this.sprites = graphics.sprites;
            this.orientation = orientation;
            this.get_value_callback = get_value_callback;
            this.set_value_callback = set_value_callback;

            // Button and track rects for hit detection
            this.button_start_rect = null;  // Up/Left button
            this.button_end_rect = null;    // Down/Right button
            this.track_rect = null;
            this.thumb_rect = null;

            // State tracking
            this.button_start_hover = false;
            this.button_start_down = false;
            this.button_end_hover = false;
            this.button_end_down = false;
            this.thumb_hover = false;
            this.is_dragging_thumb = false;
            this.drag_start_pos = 0;  // X or Y depending on orientation
            this.drag_start_value = 0;

            // Store bound event handlers (use visible canvas)
            this._bound_mouse_down = this.handle_mouse_down.bind(this);
            this._bound_mouse_up = this.handle_mouse_up.bind(this);
            this._bound_mouse_move = this.handle_mouse_move.bind(this);

            graphics.visibleCanvas.addEventListener('mousedown', this._bound_mouse_down);
            graphics.visibleCanvas.addEventListener('mouseup', this._bound_mouse_up);
            graphics.visibleCanvas.addEventListener('mousemove', this._bound_mouse_move);
        } catch (error) {
            this.logger.error(`scrollbar constructor: ${error.message}`);
            throw error;
        }
    }

    /**
     * Legacy resize support
     */
    resize(anchor_position_or_parent_rect) {
        try {
            if (this._legacy_position && anchor_position_or_parent_rect) {
                // Legacy mode: update the anchor position
                this._legacy_anchor_position = anchor_position_or_parent_rect;

                // Update position rect
                if (this._legacy_position) {
                    this.position = this._legacy_position.clone();
                }

                this.emit('resize', { component: this, position: this.position });
            } else {
                // New style: use parent's layout system
                super.resize(anchor_position_or_parent_rect);
            }
        } catch (error) {
            this.logger.error(`scrollbar resize: ${error.message}`);
        }
    }

    render() {
        try {
            if (this.active !== true) return;
            if (!this.get_value_callback) return;

            const value_data = this.get_value_callback();
            if (!value_data) return;

            const { current, max } = value_data;
            if (typeof current !== 'number' || typeof max !== 'number' || max <= 0) return;

            // Calculate absolute position (floor to pixel boundaries for crisp rendering)
            let scrollbar_x, scrollbar_y, scrollbar_width, scrollbar_height;

            if (this._legacy_anchor_position) {
                // Legacy mode: add anchor position
                let relative_position = this.position.clone();
                relative_position.add(this._legacy_anchor_position);
                scrollbar_x = Math.floor(relative_position.x);
                scrollbar_y = Math.floor(relative_position.y);
                scrollbar_width = Math.floor(this.position.width);
                scrollbar_height = Math.floor(this.position.height);
            } else {
                // New mode: position is already absolute
                scrollbar_x = Math.floor(this.position.x);
                scrollbar_y = Math.floor(this.position.y);
                scrollbar_width = Math.floor(this.position.width);
                scrollbar_height = Math.floor(this.position.height);
            }

            const ctx = this.graphics.ctx;
            const is_horizontal = (this.orientation === "horizontal");

            // Button and thumb dimensions scaled to scrollbar size
            // Original sprite dimensions: up=31x32, down=31x31, thumb=31x53
            // For vertical: scale based on width (thickness)
            // For horizontal: scale based on height (thickness)
            const scale_factor = is_horizontal ? (scrollbar_height / 31) : (scrollbar_width / 31);
            const button_up_height = Math.round(32 * scale_factor);
            const button_down_height = Math.round(31 * scale_factor);
            const thumb_size = Math.round(53 * scale_factor);
            const track_padding = 0;  // No gap between buttons and track

            if (is_horizontal) {
                // HORIZONTAL scrollbar (all positions floored to pixel boundaries)
                // Left button - anchored to LEFT (using up button rotated)
                const left_button_x = scrollbar_x;
                this.button_start_rect = new rect(left_button_x, scrollbar_y, button_up_height, scrollbar_height);

                // Right button - anchored to RIGHT (using down button rotated)
                const right_button_x = Math.floor(scrollbar_x + scrollbar_width - button_down_height);
                this.button_end_rect = new rect(right_button_x, scrollbar_y, button_down_height, scrollbar_height);

                // Track area - BETWEEN the two buttons (with padding to prevent 9-slice overlap)
                const track_x = Math.floor(left_button_x + button_up_height + track_padding);
                const track_width = Math.floor(right_button_x - track_x - track_padding);
                this.track_rect = new rect(track_x, scrollbar_y, track_width, scrollbar_height);

                // Calculate thumb position (fixed size - for horizontal, use scrollbar_height as thumb width)
                const horizontal_thumb_width = scrollbar_height;  // Match the thickness
                const max_thumb_x = track_x + track_width - horizontal_thumb_width;
                const thumb_x = Math.floor(Math.min(max_thumb_x, track_x + ((current / max) * (track_width - horizontal_thumb_width))));
                this.thumb_rect = new rect(thumb_x, scrollbar_y, horizontal_thumb_width, scrollbar_height);

                // Draw track (9-slice) FIRST, so buttons render on top
                this.graphics.sprites.slice_9("scroll-bg", this.track_rect, 10, 30);

                // Render thumb with state (square thumb for horizontal)
                let thumb_intensity = 1.0;
                if (this.is_dragging_thumb) thumb_intensity = 0.7;
                else if (this.thumb_hover) thumb_intensity = 0.9;

                // Rotate thumb -90° for horizontal (same as buttons)
                ctx.save();
                ctx.translate(thumb_x + horizontal_thumb_width / 2, scrollbar_y + scrollbar_height / 2);
                ctx.rotate(-Math.PI / 2);
                const rotated_rect = new rect(-scrollbar_height / 2, -horizontal_thumb_width / 2, scrollbar_height, horizontal_thumb_width);
                this.graphics.sprites.render("scroll-drag", null, rotated_rect, thumb_intensity, "fill");
                ctx.restore();

                // Render left button ON TOP of track (rotate up button -90° to point left)
                let left_button_intensity = 1.0;
                if (this.button_start_down) left_button_intensity = 0.7;
                else if (this.button_start_hover) left_button_intensity = 0.9;

                ctx.save();
                ctx.translate(left_button_x + button_up_height / 2, scrollbar_y + scrollbar_height / 2);
                ctx.rotate(-Math.PI / 2);  // Counter-clockwise to point left
                const rotated_left_rect = new rect(-scrollbar_height / 2, -button_up_height / 2, scrollbar_height, button_up_height);
                this.graphics.sprites.render("scroll-up", null, rotated_left_rect, left_button_intensity, "fill");
                ctx.restore();

                // Render right button ON TOP of track (rotate down button -90° to point right)
                let right_button_intensity = 1.0;
                if (this.button_end_down) right_button_intensity = 0.7;
                else if (this.button_end_hover) right_button_intensity = 0.9;

                ctx.save();
                ctx.translate(right_button_x + button_down_height / 2, scrollbar_y + scrollbar_height / 2);
                ctx.rotate(-Math.PI / 2);  // Counter-clockwise so down arrow points right
                const rotated_right_rect = new rect(-scrollbar_height / 2, -button_down_height / 2, scrollbar_height, button_down_height);
                this.graphics.sprites.render("scroll-down", null, rotated_right_rect, right_button_intensity, "fill");
                ctx.restore();

            } else {
                // VERTICAL scrollbar (all positions floored to pixel boundaries)
                // Up button - anchored to TOP
                const up_button_y = scrollbar_y;
                this.button_start_rect = new rect(scrollbar_x, up_button_y, scrollbar_width, button_up_height);

                // Down button - anchored to BOTTOM
                const down_button_y = Math.floor(scrollbar_y + scrollbar_height - button_down_height);
                this.button_end_rect = new rect(scrollbar_x, down_button_y, scrollbar_width, button_down_height);

                // Track area - BETWEEN the two buttons (with padding to prevent 9-slice overlap)
                const track_y = Math.floor(up_button_y + button_up_height + track_padding);
                const track_height = Math.floor(down_button_y - track_y - track_padding);
                this.track_rect = new rect(scrollbar_x, track_y, scrollbar_width, track_height);

                // Calculate thumb position (fixed size)
                const max_thumb_y = track_y + track_height - thumb_size;
                const thumb_y = Math.floor(Math.min(max_thumb_y, track_y + ((current / max) * (track_height - thumb_size))));
                this.thumb_rect = new rect(scrollbar_x, thumb_y, scrollbar_width, thumb_size);

                // Draw track (9-slice) FIRST, so buttons render on top
                this.graphics.sprites.slice_9("scroll-bg", this.track_rect, 10, 30);

                // Render thumb with state
                let thumb_intensity = 1.0;
                if (this.is_dragging_thumb) thumb_intensity = 0.7;
                else if (this.thumb_hover) thumb_intensity = 0.9;
                this.graphics.sprites.render("scroll-drag", null, this.thumb_rect, thumb_intensity, "fill");

                // Render up button ON TOP of track
                let up_button_intensity = 1.0;
                if (this.button_start_down) up_button_intensity = 0.7;
                else if (this.button_start_hover) up_button_intensity = 0.9;
                this.graphics.sprites.render("scroll-up", null, this.button_start_rect, up_button_intensity, "fill");

                // Render down button ON TOP of track
                let down_button_intensity = 1.0;
                if (this.button_end_down) down_button_intensity = 0.7;
                else if (this.button_end_hover) down_button_intensity = 0.9;
                this.graphics.sprites.render("scroll-down", null, this.button_end_rect, down_button_intensity, "fill");
            }
        } catch (error) {
            if (this.logger && this.logger.error) {
                this.logger.error(`scrollbar render: ${error.message}`);
            } else {
                console.error(`scrollbar render: ${error.message}`);
            }
        }
    }

    handle_mouse_down(event) {
        try {
            if (this.active !== true) return;

            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

            // Check start button (up/left)
            if (this.is_inside_rect(this.button_start_rect, virtual_mouse_x, virtual_mouse_y)) {
                this.button_start_down = true;
                return;
            }

            // Check end button (down/right)
            if (this.is_inside_rect(this.button_end_rect, virtual_mouse_x, virtual_mouse_y)) {
                this.button_end_down = true;
                return;
            }

            // Check thumb - start dragging
            if (this.is_inside_rect(this.thumb_rect, virtual_mouse_x, virtual_mouse_y)) {
                this.is_dragging_thumb = true;
                this.drag_start_pos = this.orientation === "horizontal" ? virtual_mouse_x : virtual_mouse_y;
                const value_data = this.get_value_callback();
                this.drag_start_value = value_data ? value_data.current : 0;
                return;
            }

            // Check track - page scroll
            if (this.is_inside_rect(this.track_rect, virtual_mouse_x, virtual_mouse_y)) {
                const value_data = this.get_value_callback();
                if (!value_data) return;

                const is_horizontal = (this.orientation === "horizontal");
                const mouse_pos = is_horizontal ? virtual_mouse_x : virtual_mouse_y;
                const thumb_pos = is_horizontal ? this.thumb_rect.x : this.thumb_rect.y;
                const thumb_size = is_horizontal ? this.thumb_rect.width : this.thumb_rect.height;

                // Calculate page size (10% of max)
                const page_size = value_data.max * 0.1;

                let new_value = value_data.current;
                if (mouse_pos < thumb_pos) {
                    // Clicked before thumb - page backward
                    new_value -= page_size;
                } else if (mouse_pos > thumb_pos + thumb_size) {
                    // Clicked after thumb - page forward
                    new_value += page_size;
                }

                new_value = Math.max(0, Math.min(new_value, value_data.max));
                if (this.set_value_callback) {
                    this.set_value_callback(new_value);
                }
            }
        } catch (error) {
            this.logger.error(`scrollbar handle_mouse_down: ${error.message}`);
        }
    }

    handle_mouse_up(event) {
        try {
            if (this.active !== true) return;

            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

            // Check if we were dragging - if so, emit drag_end event
            const was_dragging = this.is_dragging_thumb;

            // Handle start button click
            if (this.button_start_down && this.is_inside_rect(this.button_start_rect, virtual_mouse_x, virtual_mouse_y)) {
                const value_data = this.get_value_callback();
                if (value_data && this.set_value_callback) {
                    // Decrement by 1% of max
                    const step = value_data.max * 0.01;
                    const new_value = Math.max(0, value_data.current - step);
                    this.set_value_callback(new_value);
                }
            }

            // Handle end button click
            if (this.button_end_down && this.is_inside_rect(this.button_end_rect, virtual_mouse_x, virtual_mouse_y)) {
                const value_data = this.get_value_callback();
                if (value_data && this.set_value_callback) {
                    // Increment by 1% of max
                    const step = value_data.max * 0.01;
                    const new_value = Math.min(value_data.max, value_data.current + step);
                    this.set_value_callback(new_value);
                }
            }

            this.button_start_down = false;
            this.button_end_down = false;
            this.is_dragging_thumb = false;

            // If we were dragging, emit drag_end event
            if (was_dragging) {
                this.emit('drag_end', { component: this });
            }
        } catch (error) {
            this.logger.error(`scrollbar handle_mouse_up: ${error.message}`);
        }
    }

    handle_mouse_move(event) {
        try {
            if (this.active !== true) return;

            const viewport = this.graphics.viewport;
            const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
            const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

            // Handle thumb dragging
            if (this.is_dragging_thumb && this.track_rect) {
                const value_data = this.get_value_callback();
                if (!value_data) return;

                const is_horizontal = (this.orientation === "horizontal");
                const current_pos = is_horizontal ? virtual_mouse_x : virtual_mouse_y;
                const delta = current_pos - this.drag_start_pos;

                // Calculate track size and convert mouse movement to value
                const track_size = is_horizontal ? this.track_rect.width : this.track_rect.height;
                const delta_value = (delta / track_size) * value_data.max;

                let new_value = this.drag_start_value + delta_value;
                new_value = Math.max(0, Math.min(new_value, value_data.max));

                if (this.set_value_callback) {
                    this.set_value_callback(new_value);
                }
                return;
            }

            // Update hover states
            this.button_start_hover = this.is_inside_rect(this.button_start_rect, virtual_mouse_x, virtual_mouse_y);
            this.button_end_hover = this.is_inside_rect(this.button_end_rect, virtual_mouse_x, virtual_mouse_y);
            this.thumb_hover = this.is_inside_rect(this.thumb_rect, virtual_mouse_x, virtual_mouse_y);
        } catch (error) {
            this.logger.error(`scrollbar handle_mouse_move: ${error.message}`);
        }
    }

    is_inside_rect(rect, mouse_x, mouse_y) {
        if (!rect) return false;
        return mouse_x >= rect.x &&
               mouse_x <= rect.x + rect.width &&
               mouse_y >= rect.y &&
               mouse_y <= rect.y + rect.height;
    }

    delete() {
        try {
            // Set active to false first to prevent any ongoing operations
            this.active = false;

            if (this.graphics && this.graphics.visibleCanvas) {
                this.graphics.visibleCanvas.removeEventListener('mousedown', this._bound_mouse_down);
                this.graphics.visibleCanvas.removeEventListener('mouseup', this._bound_mouse_up);
                this.graphics.visibleCanvas.removeEventListener('mousemove', this._bound_mouse_move);
            }

            delete this.sprites;
            delete this.orientation;
            delete this.get_value_callback;
            delete this.set_value_callback;
            delete this.button_start_rect;
            delete this.button_end_rect;
            delete this.track_rect;
            delete this.thumb_rect;
            delete this.button_start_hover;
            delete this.button_start_down;
            delete this.button_end_hover;
            delete this.button_end_down;
            delete this.thumb_hover;
            delete this.is_dragging_thumb;
            delete this.drag_start_pos;
            delete this.drag_start_value;
            delete this._bound_mouse_down;
            delete this._bound_mouse_up;
            delete this._bound_mouse_move;
            delete this._legacy_position;
            delete this._legacy_anchor_position;

            // Call parent cleanup
            super.delete();
        } catch (error) {
            if (this.logger) {
                this.logger.error(`scrollbar delete: ${error.message}`);
            }
        }
    }
}


class percentage_bar extends ui_component {
    constructor(parent, graphics, position, overlay, underlay) {
        // Convert old rect-based position to layout_config
        let layout_config = {
            mode: "relative",
            anchor_x: "left",
            anchor_y: "top",
            width_mode: "fixed",
            height_mode: "fixed",
            width: position.width,
            height: position.height,
            offset_x: position.x,
            offset_y: position.y
        };

        super(parent, graphics, layout_config);
        this.underlay = underlay;
        this.overlay = overlay;
        this.percentage = 0;
    }

    /**
     * Render the percentage bar
     */
    render() {
        if (!this.active) return;

        // Use the position calculated by ui_component
        const absolute_position = this.position;

        // Render underlay (fluid/progress)
        let percentage_width = parseInt((absolute_position.width * this.percentage) / 100);
        if (percentage_width != 0) {
            // Calculate underlay position (inset from overlay)
            const underlay_x = absolute_position.x + 20;
            const underlay_y = absolute_position.y + 9;
            let render_percentage = new rect(underlay_x, underlay_y, percentage_width * 0.85, absolute_position.height - 18);
            this.graphics.sprites.render(this.underlay, null, render_percentage, 1, "none");
        }

        // Render overlay (bar frame)
        this.graphics.sprites.slice_3(this.overlay, absolute_position);
    }

    /**
     * Update the bar with a new percentage value
     */
    set_percentage(percentage) {
        this.percentage = percentage;
    }
}


class percentage_bar_fluid extends percentage_bar {
    constructor(parent, graphics, position, overlay, underlay) {
        super(parent, graphics, position, overlay, underlay);
    }
}
class modal {
  constructor(logger) {
    this.logger = logger || console;
    try {
      this.window_manager = null;
      this.parent = null;
      this.graphics = null;
      this.active = false;
      this.events = {};
      this.ok = null;
      this.cancel = null;
      // Rename the close property to avoid clashing with the close() method
      this.closeButton = null;
      this.title = null;
      this.text = null;
      this.position = null;
      this.skin = true;
      this.external_render_callback = null;
      this.background = null;
      this.bg_gradient = null;
      this.buttons = [];
      this.images = [];
      this.ui_components = [];  // Array for ui_component-based elements
      this.no_close = false;  // Flag to prevent ESC from closing
      this.kb = null;  // Modal's own keyboard state tracker
    } catch (error) {
      this.logger.error(`modal constructor: ${error.message}`);
    }
  }

  // Default init assignment from window manager
  init(window_manager) {
    try {
      this.window_manager = window_manager;
      this.graphics = window_manager.graphics;
      this.audio_manager = window_manager.audio_manager;
      this.canvas = this.graphics.canvas;  // Offscreen canvas for rendering
      this.visibleCanvas = this.graphics.visibleCanvas;  // Visible canvas for mouse events
      this.sprites = this.graphics.sprites;

      // Create modal's own keyboard state tracker
      this.kb = new key_states();
    } catch (error) {
      this.logger.error(`init: ${error.message}`);
    }
  }

  add_bg_gradient(percentage, color) {
    try {
      if (this.bg_gradient == null) {
        this.bg_gradient = [];
      }
      this.bg_gradient.push([percentage, color]);
    } catch (error) {
      this.logger.error(`add_bg_gradient: ${error.message}`);
    }
  }

  // Override this for new layout
  layout2(position, title, text, cancel = false, ok = true, close = false) {
    try {
      this.active = true;
      this.ok = ok;
      this.cancel = cancel;
      // Use the renamed property for the close button
      this.closeButton = close;
      this.title = title;
      this.text = text;
      this.position = position;
    } catch (error) {
      this.logger.error(`layout2: ${error.message}`);
    }
  }

  no_skin() {
    try {
      this.skin = false;
    } catch (error) {
      this.logger.error(`no_skin: ${error.message}`);
    }
  }

  /**
   * Calculate dialog dimensions based on orientation
   * @param {number} landscape_width - Width to use in landscape mode
   * @param {number} landscape_height - Height to use in landscape mode
   * @param {number} portrait_margin - Margin from screen edges in portrait mode (default: 20px)
   * @returns {object} - {width, height, x, y} dimensions and position
   */
  calculate_dialog_dimensions(landscape_width, landscape_height, portrait_margin = 20) {
    try {
      if (!this.graphics || !this.graphics.viewport) {
        // Fallback if graphics not initialized yet
        return {
          width: landscape_width,
          height: landscape_height,
          x: (1920 - landscape_width) / 2,
          y: (1080 - landscape_height) / 2
        };
      }

      const vw = this.graphics.viewport.virtual.width;
      const vh = this.graphics.viewport.virtual.height;
      const isPortrait = this.graphics.viewport.isPortrait();

      if (isPortrait) {
        // Portrait mode: fit as close to screen as possible with small margins
        const width = vw - (portrait_margin * 2);
        const height = vh - (portrait_margin * 2);
        const x = portrait_margin;
        const y = portrait_margin;

        return { width, height, x, y };
      } else {
        // Landscape mode: use provided dimensions, centered
        const x = (vw - landscape_width) / 2;
        const y = (vh - landscape_height) / 2;

        return {
          width: landscape_width,
          height: landscape_height,
          x, y
        };
      }
    } catch (error) {
      this.logger.error(`calculate_dialog_dimensions: ${error.message}`);
      // Fallback to landscape dimensions
      return {
        width: landscape_width,
        height: landscape_height,
        x: (1920 - landscape_width) / 2,
        y: (1080 - landscape_height) / 2
      };
    }
  }

  set_background(background) {
    try {
      // If background is a string, sanitize it and add orientation suffix
      if (typeof background === "string") {
        background = this.sanitize_path(background);

        // Append _portrait or _landscape based on viewport orientation
        if (this.graphics && this.graphics.viewport) {
          const suffix = this.graphics.viewport.isPortrait() ? "_portrait" : "_landscape";
          background = background + suffix;
        }
      }
      this.background = background;
    } catch (error) {
      this.logger.error(`set_background: ${error.message}`);
    }
  }

  sanitize_path(path) {
    try {
      if (typeof path !== "string") {
        throw new Error("Invalid background path type");
      }
      return path.replace(/[<>"'`;]/g, "");
    } catch (error) {
      this.logger.error(`sanitize_path: ${error.message}`);
      throw error;
    }
  }

  add_buttons() {
    try {
      let mode = "center";
      // Store bound reference so that removeEventListener works correctly
      this._bound_handle_key_down = this.handle_key_down.bind(this);

      if (this.closeButton) {
        // Close button is positioned relative to modal edge (not internal_rect)
        let button_position = new rect(this.position.width - 50, -20, 42, 42);
        let anchor_position = new rect(0, 0, 0, 0);
        anchor_position.add(this.position); // Only add modal position, NOT internal_rect
        this.closeButton = new button(this, this.graphics, "", button_position, anchor_position, null, "window-close-up", "window-close-down");
        this.closeButton.on("click", () => {
          this.close();  // Call close() which will emit event AND call delete()
        });
      }

      if (this.ok) {
        let button_position = new rect(this.position.left + 100, this.position.bottom - 60);
        let ok_instance = this.add_button("Ok", button_position, null, "button-up-cyan", "button-down-cyan");
        ok_instance.on("click", () => {
          this.emit("ok", { instance: this });
        });
      }
      if (this.cancel) {
        let button_position = new rect(this.position.right - 100, this.position.bottom - 60);
        let cancel_instance = this.add_button("Cancel", button_position, mode, "button-up-red", "button-down-red");
        cancel_instance.on("click", () => {
          this.emit("cancel", { instance: this });
        });
      }

      // Add event listener for keydown events
      document.addEventListener("keydown", this._bound_handle_key_down);
    } catch (error) {
      this.logger.error(`add_buttons: ${error.message}`);
    }
  }

  // Called by window_manager to update modal's keyboard state from global events
  update_keyboard_state(key, is_down) {
    try {
      if (!this.kb) return;
      if (is_down) {
        this.kb.down(key);
      } else {
        this.kb.up(key);
      }
    } catch (error) {
      this.logger.error(`update_keyboard_state: ${error.message}`);
    }
  }

  // Called every frame to process keyboard input and emit events
  handle_keys() {
    try {
      if (!this.active || !this.kb) return;

      // Emit keyboard event for child components to listen to
      this.emit("keys", { kb: this.kb });

      // Handle ESC key - emit "escape" event first for modal to override
      if (this.kb.just_stopped('Escape')) {
        // Emit escape event - modals can listen and prevent default close
        let escapeEvent = { instance: this, defaultPrevented: false };
        this.emit("escape", escapeEvent);

        // Only close if no_close is false AND event wasn't prevented
        if (!this.no_close && !escapeEvent.defaultPrevented) {
          this.close();
        }
      }
    } catch (error) {
      this.logger.error(`handle_keys: ${error.message}`);
    }
  }

  /**
   * Update dialog dimensions when orientation changes (without recreating buttons)
   */
  update_dimensions_for_orientation() {
    try {
      // This is a basic implementation - subclasses can override
      // Get the stored landscape dimensions if available, otherwise use current
      const landscape_width = this.landscape_width || this.position.width;
      const landscape_height = this.landscape_height || this.position.height;

      // Recalculate dimensions based on new orientation
      const dims = this.calculate_dialog_dimensions(landscape_width, landscape_height);

      // Update position dimensions
      this.position.x = dims.x;
      this.position.y = dims.y;
      this.position.width = dims.width;
      this.position.height = dims.height;

      // Trigger resize to update all internal positioning
      this.resize();
    } catch (error) {
      this.logger.error(`update_dimensions_for_orientation: ${error.message}`);
    }
  }

  resize() {
    try {
      // Work entirely in virtual coordinates - canvas transform handles scaling

      // Calculate title position within the modal
      this.title_position = new rect(
        160 / 2,
        -20,
        this.position.width - 160,
        80,
        "left",
        "top"
      );

      let x_padding = 34;
      let y_padding = [30, 50];
      let y_offset = 0;
      if (this.skin === false) {
        x_padding = 0;
        y_padding = [0, 0];
        y_offset = 0;
      }
      this.internal_rect = new rect(
        x_padding,
        y_offset + y_padding[0],
        this.position.width - x_padding * 2,
        this.position.height - y_offset - y_padding[0] - y_padding[1],
        "left",
        "top"
      );

      // Create render positions (no scaling needed - work in virtual coords)
      this.render_position = this.position.clone();
      this.render_title_position = this.title_position.clone();
      this.render_internal_rect = this.internal_rect.clone();

      // Add positions together (all in virtual coordinate space)
      this.render_title_position.add(this.render_position);
      this.render_internal_rect.add(this.render_position);

      // Regular buttons are anchored to internal_rect
      for (let i = 0; i < this.buttons.length; i++) {
        this.buttons[i].resize(this.render_internal_rect);
      }

      // Close button is anchored to modal position (not internal_rect)
      // Recalculate close button position based on current dialog width (anchored top-right)
      if (this.closeButton && typeof this.closeButton.resize === 'function') {
        // Update the button's position to match new dialog width
        if (this.closeButton._legacy_position) {
          this.closeButton._legacy_position.x = this.position.width - 50;
          this.closeButton._legacy_position.y = -20;
          this.closeButton.position = this.closeButton._legacy_position.clone();
        }
        this.closeButton.resize(this.render_position);
      }

      // Update all ui_component children with render_internal_rect as anchor
      for (let i = 0; i < this.ui_components.length; i++) {
        if (this.ui_components[i].resize) {
          this.ui_components[i].resize(this.render_internal_rect);
        }
      }
    } catch (error) {
      this.logger.error(`resize: ${error.message}`);
    }
  }

  create_button(label, position, callback, up_image, down_image) {
    try {
      // Anchor position is in virtual coordinates (no viewport.given offset needed)
      // Canvas transform handles all scaling and positioning
      let anchor_position = new rect(0, 0, 0, 0);
      anchor_position.add(this.position);
      anchor_position.add(this.internal_rect);

      let new_button = new button(this, this.graphics, label, position, anchor_position, callback, up_image, down_image);
      new_button.on("click", () => {
        this.emit("click", { instance: this });
      });
      return new_button;
    } catch (error) {
      this.logger.error(`create_button: ${error.message}`);
      return null;
    }
  }

  add_button(label, position, callback, up_image, down_image) {
    try {
      let new_button = this.create_button(label, position, callback, up_image, down_image);
      if (new_button) {
        this.buttons.push(new_button);
      }
      return new_button;
    } catch (error) {
      this.logger.error(`add_button: ${error.message}`);
      return null;
    }
  }

  add_image(position, key) {
    try {
      let image = { position: position, key: key };
      this.images.push(image);
      return image;
    } catch (error) {
      this.logger.error(`add_image: ${error.message}`);
      return null;
    }
  }

  del_image(image) {
    try {
      const index = this.images.findIndex((img) => img.key === image.key);
      if (index !== -1) {
        this.images.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`del_image: ${error.message}`);
      return false;
    }
  }

  render_callback(callback) {
    try {
      this.external_render_callback = callback;
    } catch (error) {
      this.logger.error(`render_callback: ${error.message}`);
    }
  }

  handle_key_down(event) {
    try {
      if (this.active !== true) return;

      // ESC closes modal unless no_close flag is set
      if (event.key === 'Escape' && !this.no_close) {
        this.close();
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      this.emit("keydown", { instance: this, event: event });
    } catch (error) {
      this.logger.error(`handle_key_down: ${error.message}`);
    }
  }

  on(event_name, callback) {
    try {
      if (!this.events[event_name]) {
        this.events[event_name] = [];
      }
      this.events[event_name].push(callback);
    } catch (error) {
      this.logger.error(`on(${event_name}): ${error.message}`);
    }
  }

  emit(event_name, data) {
    try {
      if (this.events[event_name]) {
        this.events[event_name].forEach((callback) => {
          try {
            callback(data);
          } catch (cbError) {
            this.logger.error(`emit(${event_name}) callback error: ${cbError.message}`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`emit(${event_name}): ${error.message}`);
    }
  }

  render() {
    try {
      if (this.active === false) return;
      if (!this.graphics || !this.graphics.ctx) return;
      if (!this.sprites) return;
      if (!this.render_position || !this.internal_rect || !this.render_internal_rect) return;

      // Cache ctx reference to prevent race conditions
      const ctx = this.graphics.ctx;
      if (!ctx || typeof ctx.save !== 'function') return;

      if (this.skin) {
        this.sprites.slice_9("window", this.render_position);
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(
        this.render_internal_rect.x,
        this.render_internal_rect.y,
        this.render_internal_rect.width,
        this.render_internal_rect.height
      );
      ctx.clip();

      if (this.external_render_callback != null) {
        this.external_render_callback(this.render_internal_rect);
      }

      // Render buttons
      if (this.buttons) {
        this.buttons.forEach((button) => button.render());
      }

      // Render ui_components
      if (this.ui_components) {
        this.ui_components.forEach((component) => component.render());
      }

      // Render text using render_internal_rect (absolute position with parent offset)
      if (this.text) {
        this.graphics.font.draw_text(this.render_internal_rect, this.text, true, true);
      }

      // Restore context (using cached ctx reference)
      ctx.restore();

      // Render images OUTSIDE the clipped region (in virtual coordinates)
      if (this.images) {
        for (let i = 0; i < this.images.length; i++) {
          let image = this.images[i];
          let image_pos = image.position.clone();
          // No viewport.given offset - we're in virtual coordinate space
          this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");
        }
      }

      if (this.skin && this.sprites && this.graphics.font) {
        // Clone to prevent mutation from accumulating across frames
        const title_rect = this.render_title_position.clone();
        this.sprites.slice_3("window-title", title_rect);
        this.graphics.font.draw_text(title_rect, this.title, true, false);
      }
      if (this.closeButton != null && typeof this.closeButton.render === "function") {
        this.closeButton.render();
      }
    } catch (error) {
      this.logger.error(`render: ${error.message}`);
    }
  }

  set_active(active) {
    try {
      this.active = active;
      if (this.buttons) {
        this.buttons.forEach((button) => button.set_active(active));
      }
      if (this.ui_components) {
        this.ui_components.forEach((component) => component.set_active(active));
      }
    } catch (error) {
      this.logger.error(`set_active: ${error.message}`);
    }
  }

  close() {
    try {
      if (this.active !== true) return;
      this.emit("close", { instance: this });
      this.logger.info("Modal: Close Window");
      this.delete();
    } catch (error) {
      this.logger.error(`close: ${error.message}`);
    }
  }

  delete() {
    try {
      // CRITICAL: Set active to false FIRST to stop render() from being called
      this.active = false;

      if (this._bound_handle_key_down) {
        document.removeEventListener("keydown", this._bound_handle_key_down);
      }
      this.events = {};
      if (this.buttons) {
        this.buttons.forEach((button) => button.delete());
      }
      if (this.ui_components) {
        this.ui_components.forEach((component) => component.delete());
      }
      delete this.parent;
      delete this.graphics;
      delete this.canvas;
      delete this.sprites;
      delete this.ok;
      delete this.cancel;
      delete this.title;
      delete this.text;
      delete this.position;
      delete this.external_render_callback;
      delete this.buttons;
      delete this.images;
    } catch (error) {
      this.logger.error(`delete: ${error.message}`);
    }
  }
}
class graphics extends events {
    constructor(canvas = null, ctx = null, logger) {
      super(logger);
      this.logger = logger || console;
      try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.font = null;
        this.asset_loader = new asset_loader();
        this.sprites = new sprites(ctx, this.asset_loader);
        this.sprites.on("complete", this.load_font.bind(this));
        this.sprites.preload();
        this.backround = null;
        // Fixed virtual resolution - everything is designed for 1920x1080
        this.viewport = new viewport(1920, 1080);
        this.frame_background_color = '#222';
        this.background_color = '#000000';
      } catch (error) {
        this.logger.error(`graphics constructor: ${error.message}`);
      }
    }
  
    sanitize_path(path) {
      if (typeof path !== 'string') {
        throw new Error("Invalid image URL type");
      }
      return path.replace(/[<>"'`;]/g, '');
    }
  
    load_font() {
      try {
        let font = new sprite_font(this.ctx, this.sprites, "grey_font", this.logger, this.viewport);
        this.font = font;
        this.emit('complete');
      } catch (error) {
        this.logger.error(`load_font: ${error.message}`);
      }
    }
  
    set_background(image_url) {
      try {
        image_url = this.sanitize_path(image_url);
        this.backround = new Image();
        this.backround.src = image_url;
      } catch (error) {
        this.logger.error(`set_background: ${error.message}`);
      }
    }
  
    recalc_canvas() {
      try {
        this.viewport.calculate();
        // Only update canvas dimensions if they actually changed (to avoid triggering resize events)
        if (this.canvas.width !== this.viewport.frame.width || this.canvas.height !== this.viewport.frame.height) {
          this.canvas.windowWidth = this.viewport.frame.width;
          this.canvas.windowHeight = this.viewport.frame.height;
          this.canvas.width = this.viewport.frame.width;
          this.canvas.height = this.viewport.frame.height;
        }
      } catch (error) {
        this.logger.error(`recalc_canvas: ${error.message}`);
      }
    }
  
    updateCanvasSizeAndDrawImage(level_position) {
      try {
        if (this.backround == null) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return;
        }
        // Correct the window every frame
        let srcX = 0;
        let srcY = 0; // increment for scroll (start at bottom)
        let destX = this.viewport.given.x;
        let destY = this.viewport.given.y;
        let scaledDestWidth = this.viewport.given.width;
        let scaledDestHeight = this.viewport.given.height;
  
        let vp_h = this.viewport.virtual.height;
        let scrollable_height = level_position.height - vp_h;
        if (scrollable_height < 0) scrollable_height = 0;
        let position_percentage = (scrollable_height) / level_position.y;
        srcY = position_percentage * scrollable_height;
  
        position_percentage = level_position.y / (level_position.height - this.viewport.virtual.height);
        srcY = position_percentage * (this.backround.height - this.viewport.virtual.height);
  
        this.ctx.save();
        this.ctx.fillStyle = this.frame_background_color;
        // Clear the canvas frame
        this.ctx.fillRect(
          this.viewport.frame.x,
          this.viewport.frame.y,
          this.viewport.frame.width,
          this.viewport.frame.height
        );
        this.ctx.restore();
  
        this.ctx.fillStyle = this.background_color;
        let bg_scale_x = this.viewport.given.width / this.backround.width;
        let bg_h = this.viewport.virtual.height;
  
        // Draw the selected portion of the original image scaled on the canvas
        this.ctx.drawImage(
          this.backround,
          srcX, srcY,
          this.backround.width, bg_h,
          destX, destY,
          scaledDestWidth, scaledDestHeight
        );
      } catch (error) {
        this.logger.error(`updateCanvasSizeAndDrawImage: ${error.message}`);
      }
    }
  
    fade_images(percentage) {
      try {
        if (!this.ctx || !this.canvas) {
          this.logger.error("fade_images: Canvas or context not defined");
          return;
        }
        // Assuming image1 and image2 are defined in the proper scope
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw the first image
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(image1, 0, 0, this.canvas.width, this.canvas.height);
        // Draw the second image on top with adjusted opacity
        this.ctx.globalAlpha = percentage / 100;
        this.ctx.drawImage(image2, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
      } catch (error) {
        this.logger.error(`fade_images: ${error.message}`);
      }
    }
  }
  class window_manager extends events{
    constructor(elements) {
      super();
      this.canvas = document.getElementById(elements.canvasId);
      this.ctx = this.canvas.getContext('2d');

      // Create offscreen canvas for double buffering (eliminates flicker)
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

      // Use offscreen canvas for all rendering
      this.graphics = new graphics(this.offscreenCanvas, this.offscreenCtx);

      // Store reference to visible canvas for mouse event handling
      this.graphics.visibleCanvas = this.canvas;
      this.audio_manager = new audio_manager();
      this.modals = [];
      this.active_modal=null;
      this.boss_mode_activated = false;

      this.kb = new key_states();

      // Set initial canvas size (offscreen canvas via graphics, then sync visible canvas)
      this.graphics.recalc_canvas();
      this.canvas.width = this.offscreenCanvas.width;
      this.canvas.height = this.offscreenCanvas.height;

      // DEBUG: Frame stepping mode - disabled by default (F12 to toggle, F11 to step)
      this.debug_frame_step = false;
      this.debug_render_next_frame = false;
      this.debug_frame_count = 0;

      window.addEventListener('keydown', (event) => {
          this.kb.down(event.key);
          this.kb.event(event)

          // F12 = Toggle frame stepping mode
          if (event.key === 'F12') {
              this.debug_frame_step = !this.debug_frame_step;
              console.log('[DEBUG] Frame stepping:', this.debug_frame_step ? 'ENABLED - Press F11 to render next frame' : 'DISABLED');
              event.preventDefault();
              return;
          }

          // F11 = Render next frame (when in frame step mode)
          if (event.key === 'F11') {
              if (this.debug_frame_step) {
                  this.debug_render_next_frame = true;
                  console.log('[DEBUG] ========== RENDERING FRAME', ++this.debug_frame_count, '==========');
              }
              event.preventDefault();
              return;
          }

          // Forward keyboard events to active modal's keyboard state
          if (this.active_modal && this.active_modal.update_keyboard_state) {
              this.active_modal.update_keyboard_state(event.key, true);
          }

          switch (event.key) {
              case 'F5': break;
              default: event.preventDefault();
          }

      });

      window.addEventListener('keyup', (event) => {
          this.kb.up(event.key);
          this.kb.event(event)

          // Forward keyboard events to active modal's keyboard state
          if (this.active_modal && this.active_modal.update_keyboard_state) {
              this.active_modal.update_keyboard_state(event.key, false);
          }

          switch (event.key) {
              case 'F5': break;
              case 'F11': break;
              case 'F12': break;
              default: event.preventDefault();
          }
      });

      // Track orientation for detecting changes
      this.last_orientation = null;
      this.last_canvas_dimensions = null;

      // Window resize listener - resize ALL modals on every resize
      window.addEventListener('resize', () => {
          if (!this.graphics || !this.graphics.viewport) return;

          // Recalculate canvas and viewport on resize (updates offscreen canvas)
          this.graphics.recalc_canvas();

          // Sync visible canvas dimensions with offscreen canvas
          // NOTE: Setting canvas width/height clears the canvas, so we must render immediately after
          this.canvas.width = this.offscreenCanvas.width;
          this.canvas.height = this.offscreenCanvas.height;

          // Check if dimensions actually changed
          const dimensions_key = `${this.graphics.canvas.width}x${this.graphics.canvas.height}`;
          const dimensions_changed = this.last_canvas_dimensions !== dimensions_key;

          // ONLY update modals if dimensions actually changed since last resize
          if (!dimensions_changed) {
              // Even if dimensions didn't change, we still need to render immediately
              // because setting canvas width/height cleared the visible canvas
              this.render();
              return;
          }

          this.last_canvas_dimensions = dimensions_key;

          // Check if orientation changed
          const current_orientation = this.graphics.viewport.isPortrait() ? 'portrait' : 'landscape';
          const orientationChanged = this.last_orientation !== null && this.last_orientation !== current_orientation;

          if (orientationChanged) {
              console.log(`[Orientation] Changed from ${this.last_orientation} to ${current_orientation}`);
          }

          // Update ALL modals on EVERY resize (not just orientation changes)
          this.modals.forEach(modal => {
              // Reload backgrounds if orientation changed
              if (orientationChanged && modal.background) {
                  // Extract the base name (remove _portrait or _landscape suffix)
                  let baseName = modal.background;
                  if (baseName.endsWith('_portrait') || baseName.endsWith('_landscape')) {
                      baseName = baseName.replace(/_portrait$|_landscape$/, '');
                  }

                  // Re-apply the background (which will auto-add the correct suffix)
                  modal.set_background(baseName);
              }

              // ALWAYS update dimensions on resize
              if (modal.update_dimensions_for_orientation && typeof modal.update_dimensions_for_orientation === 'function') {
                  modal.update_dimensions_for_orientation();
              } else {
                  // Fallback: just call resize if no custom update method
                  if (modal.resize && typeof modal.resize === 'function') {
                      modal.resize();
                  }
              }
          });

          this.last_orientation = current_orientation;

          // Immediately render after resize to prevent blank flash
          // (setting canvas width/height clears the canvas)
          this.render();
      });

      // Input processing loop - runs at 60 FPS for responsive input
      setInterval(() => {
          if (this.has_windows() > 0) {
              this.handle_keys();
          }
      }, 1000 / 60);

      // Render loop - runs at 24 FPS for display
      setInterval(() => {
          // Skip rendering if in frame step mode and F11 wasn't pressed
          if (this.debug_frame_step && !this.debug_render_next_frame) {
              return;
          }
          this.debug_render_next_frame = false; // Reset after rendering one frame

          // DO NOT call recalc_canvas every frame - it triggers resize events!
          // Canvas dimensions are set in the window resize listener
          if (this.has_windows() > 0) {
              this.render();
          }
      }, 1000 / 24);
    }



    has_windows(){
        if( this.modals.length>0) return true;
        return false;
    }
    add(modal_instance){
      modal_instance.init(this);
      modal_instance.layout();
      this.insert_model(modal_instance);
      
    }


    create_modal(title,text, position,cancel = false, ok = true,close=false) {
      //console.log("Creating Modal");
      const modal_instance = new modal(this,this.graphics, position, title, text, cancel, ok,close);
      return this.insert_model(modal_instance);
    }
    
    insert_model(modal_instance){
      // Listen for the 'close' event to remove the modal
      modal_instance.on('close', () => {
        this.close_modal(modal_instance);
      });

      // Deactivate all modals EXCEPT those marked as always_active (like title_screen)
      this.modals.forEach(modal=> {
        if (!modal.always_active) {
          modal.set_active(false);
        }
      });
      this.modals.push(modal_instance);
      //console.log("Window Manager: Active instance");

      this.active_modal=modal_instance
      return modal_instance;
    }
  
    close_modal(modal_instance) {
      //console.log("Window Manager: Close Modal");
      const index = this.modals.indexOf(modal_instance);
      if (index > -1) {
        this.modals.splice(index, 1); // Remove the modal from the array
        // Additional cleanup if necessary
      }

      // CRITICAL: Clear active_modal immediately to prevent render calls on deleted modal
      this.active_modal = null;

      if(this.modals.length>0) {
        let last_modal= this.modals[this.modals.length - 1];
        last_modal.set_active(true);
        this.active_modal=last_modal;
      }
    }
    handle_keys(){
      // Handle global boss mode (Tab key only)
      if (this.kb.just_stopped('Tab')) {
        if (this.boss_mode_activated) {
          this.boss_mode_off();
        } else {
          this.boss_mode_on();
        }
        return; // Don't pass Tab to modals
      }

      // If boss mode is active, ESC exits it
      if (this.kb.just_stopped('Escape') && this.boss_mode_activated) {
        this.boss_mode_off();
        return; // Don't pass to modal
      }

      // Let active modal process its own keyboard events
      if (this.active_modal && !this.boss_mode_activated) {
        this.active_modal.handle_keys();
      }
    }

    boss_mode_on(){
      document.getElementById('game').style.display = 'none';
      document.getElementById('boss_mode').style.display = 'block';
      this.boss_mode_activated = true;

      // Pause all audio
      if (this.audio_manager) {
        this.audio_manager.sound_off();
      }
    }

    boss_mode_off(){
      document.getElementById('game').style.display = 'block';
      document.getElementById('boss_mode').style.display = 'none';
      this.boss_mode_activated = false;

      // Resume audio
      if (this.audio_manager) {
        this.audio_manager.sound_on();
      }
    }
    resize(){
      for(let i=0;i<this.modals.length;i++) this.modals[i].resize();
    }

    render() {
        if (this.modals.length > 0) {
          // DEBUG: Track save/restore balance
          const initialSaveCount = this.graphics.ctx._saveCount || 0;

          // Save the current canvas state
          this.graphics.ctx.save();
          this.graphics.ctx._saveCount = (this.graphics.ctx._saveCount || 0) + 1;

          // Clear canvas with a base color (fallback for any gaps)
          this.graphics.ctx.fillStyle = '#0a1628';
          this.graphics.ctx.fillRect(0, 0, this.graphics.viewport.given.width, this.graphics.viewport.given.height);

          // Apply viewport scaling and centering transformation
          // This makes everything drawn in virtual coordinates automatically scale to physical pixels
          const viewport = this.graphics.viewport;

          // Apply translation to center (using precalculated offset), then scale
          this.graphics.ctx.translate(viewport.offset.x, viewport.offset.y);
          this.graphics.ctx.scale(viewport.scale.x, viewport.scale.y);

          // Now everything is drawn in virtual coordinate space (1920x1080)
          // and automatically scaled and centered to fit the canvas

          // Render background from active modal (if exists)
          if (this.active_modal && this.active_modal.background){
              const bgRect = new rect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);
              // Use "cover" mode to fill entire viewport (crop edges if needed)
              this.graphics.sprites.render(this.active_modal.background, null, bgRect, 1, "cover");
            }

          // Then render gradient overlay from active modal (if exists)
          if (this.active_modal && this.active_modal.bg_gradient) {
            var gradient = this.graphics.ctx.createLinearGradient(0, 0, 0, this.graphics.viewport.virtual.height);
            for(let i=0;i<this.active_modal.bg_gradient.length;i++)
              gradient.addColorStop(this.active_modal.bg_gradient[i][0],this.active_modal.bg_gradient[i][1]);

            // Draw gradient with proper transparency support
            this.graphics.ctx.fillStyle = gradient;
            this.graphics.ctx.fillRect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);
          }

          // Render ALL active modals (title screen, then menu, etc.)
          this.modals.forEach((modal, index) => {
            if (modal.active) {
              modal.render();
            }
          });

          // Restore the canvas state (removes the scale transformation)
          this.graphics.ctx.restore();
          this.graphics.ctx._saveCount = (this.graphics.ctx._saveCount || 1) - 1;

          // Fill letterbox/pillarbox areas with edge pixels from viewport
          this.fill_letterbox_with_edge_pixels();

          // DEBUG: Verify save/restore balance
          const finalSaveCount = this.graphics.ctx._saveCount || 0;
          if (finalSaveCount !== initialSaveCount) {
            console.error(`[CTX LEAK] Save/restore mismatch! Initial: ${initialSaveCount}, Final: ${finalSaveCount}`);
          }

          // BLIT: Copy the entire offscreen canvas to the visible canvas in one operation
          // This eliminates flicker by making all updates atomic
          this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        }
    }

    fill_letterbox_with_edge_pixels() {
      const ctx = this.graphics.ctx;
      const viewport = this.graphics.viewport;

      // Check if there's any letterbox/pillarbox space to fill
      const hasLeftPadding = viewport.offset.x > 0;
      const hasRightPadding = viewport.offset.x > 0;
      const hasTopPadding = viewport.offset.y > 0;
      const hasBottomPadding = viewport.offset.y > 0;

      if (!hasLeftPadding && !hasRightPadding && !hasTopPadding && !hasBottomPadding) {
        return; // No padding to fill
      }

      // Round to exact pixel boundaries to prevent sampling from wrong pixels
      const rendered_x = Math.round(viewport.offset.x);
      const rendered_y = Math.round(viewport.offset.y);
      const rendered_width = Math.round(viewport.rendered.width);
      const rendered_height = Math.round(viewport.rendered.height);

      // Left padding - sample one pixel INSIDE rendered area
      if (hasLeftPadding && rendered_x > 0) {
        const edgeData = ctx.getImageData(rendered_x + 1, rendered_y, 1, rendered_height);

        for (let x = 0; x < rendered_x; x++) {
          ctx.putImageData(edgeData, x, rendered_y);
        }
      }

      // Right padding - sample from the edge pixel
      if (hasRightPadding) {
        const right_edge_x = rendered_x + rendered_width - 1;
        const right_padding_start = rendered_x + rendered_width;
        const right_padding_width = viewport.given.width - right_padding_start;

        if (right_padding_width > 0) {
          const edgeData = ctx.getImageData(right_edge_x, rendered_y, 1, rendered_height);

          for (let x = right_padding_start; x < viewport.given.width; x++) {
            ctx.putImageData(edgeData, x, rendered_y);
          }
        }
      }

      // Top padding - sample topmost pixel row and stretch vertically
      if (hasTopPadding && rendered_y > 0) {
        const edgeData = ctx.getImageData(0, rendered_y, viewport.given.width, 1);

        for (let y = 0; y < rendered_y; y++) {
          ctx.putImageData(edgeData, 0, y);
        }
      }

      // Bottom padding - sample bottommost pixel row and stretch vertically
      if (hasBottomPadding) {
        const bottom_edge_y = rendered_y + rendered_height - 1;
        const bottom_padding_start = rendered_y + rendered_height;
        const bottom_padding_height = viewport.given.height - bottom_padding_start;

        if (bottom_padding_height > 0) {
          const edgeData = ctx.getImageData(0, bottom_edge_y, viewport.given.width, 1);

          for (let y = bottom_padding_start; y < viewport.given.height; y++) {
            ctx.putImageData(edgeData, 0, y);
          }
        }
      }
    }
  }

  class motion{
    constructor(x,y,width,height,mass,rotation){

        this.mass = mass;
        this.damping_factor = 0.1; // acceleration slow down
        this.velocity_loss = 1 ; // momentum slow down
        this.rotation = rotation;
        this.position = new rect(x, y,width,height);
        this.acceleration =new point(0,0);
        this.velocity =new point(0,0);
        this.IMMOVABLE_MASS = 10000;
        this.bounce_factor=1.2;
        this.old_state={};

    }

    save_state(){
        this.old_state['mass']=this.mass;
        this.old_state['damping_factor']=this.damping_factor;
        this.old_state['velocity_loss']=this.velocity_loss;
        this.old_state['rotation']=this.rotation;
        this.old_state['position']=this.position;
        this.old_state['acceleration']=this.acceleration;
        this.old_state['velocity']=this.velocity;
        this.old_state['IMMOVABLE_MASS']=this.IMMOVABLE_MASS;
        this.old_state['bounce_factor']=this.bounce_factor;
    }
    
    restore_state(){
        this.mass=this.old_state['mass'];
        this.damping_factor=this.old_state['damping_factor'];
        this.velocity_loss=this.old_state['velocity_loss'];
        this.rotation=this.old_state['rotation'];
        this.position=this.old_state['position'];
        this.acceleration=this.old_state['acceleration'];
        this.velocity=this.old_state['velocity'];
        this.IMMOVABLE_MASS=this.old_state['IMMOVABLE_MASS'];
        this.bounce_factor=this.old_state['bounce_factor'];
    }

    update_position(delta_time){
        this.position.x += this.velocity.x * delta_time;
        this.position.y += this.velocity.y * delta_time;
    }

    update_accelleration(delta_time){
        //slows down ho much gas we're trying giveing it

        this.acceleration.x -= this.acceleration.x * this.damping_factor;
        this.acceleration.y -= this.acceleration.y * this.damping_factor;
    }

    update_velocity(delta_time){
        //add to travel speed
        this.velocity.x += this.acceleration.x * delta_time;
        this.velocity.y += this.acceleration.y * delta_time;
        // friction
        if(this.velocity_loss!=1){
            if (this.velocity.x != 0) {
                this.velocity.x *= this.velocity_loss;
            }
            if (this.velocity.y != 0) {
                this.velocity.y *= this.velocity_loss;
            }
        }
    }

    update_motion(delta_time){
        if (delta_time != 0) {
            // we dont know if there will be a collision.. save everything if we need to recalc.
            this.save_state();
            this.update_accelleration(delta_time);
            this.update_velocity(delta_time);
            this.update_position(delta_time);
        }
    }


    async accelerate_object(direction, speed) {
        direction %= 360;

        var rotationInRadians = direction * Math.PI / 180;
        // F = ma, so a = F/m (acceleration inversely proportional to mass)
        var ax = Math.sin(rotationInRadians) * speed / this.mass;
        var ay = -Math.cos(rotationInRadians) * speed / this.mass;

        this.acceleration.x += ax;
        this.acceleration.y += ay;
    }



    get_combine_center(otherObject) {
        // Calculate the center coordinates of this object
        let thisCenterX = this.position.x + this.width / 2;
        let thisCenterY = this.position.y + this.height / 2;

        // Calculate the center coordinates of the other object
        let otherCenterX = otherObject.position.x + otherObject.width / 2;
        let otherCenterY = otherObject.position.y + otherObject.height / 2;

        // Calculate the combined center coordinates
        let combinedCenterX = (thisCenterX + otherCenterX) / 2;
        let combinedCenterY = (thisCenterY + otherCenterY) / 2;

        // Return the combined center coordinates
        return { x: combinedCenterX, y: combinedCenterY };
    }

    collision_distance(otherObject) {
        // Calculate the center coordinates of both objects
        let thisCenterX = this.position.x + this.width / 2;
        let thisCenterY = this.position.y + this.height / 2;
        let otherCenterX = otherObject.position.x + otherObject.width / 2;
        let otherCenterY = otherObject.position.y + otherObject.height / 2;

        // Calculate the distance between the centers of the objects
        let distanceX = Math.abs(thisCenterX - otherCenterX);
        let distanceY = Math.abs(thisCenterY - otherCenterY);

        // Calculate the combined width and height of both objects
        let combinedWidth = (this.width + otherObject.width) / 2;
        let combinedHeight = (this.height + otherObject.height) / 2;

        // Check if the distance between the centers is less than the combined width and height
        if (distanceX < combinedWidth && distanceY < combinedHeight) {
            // Collision detected or adjacent
            return {x:combinedWidth-distanceX,y:combinedHeight-distanceY}
        }
        // No collision
        return false;
    }

    check_collision(otherObject) {
        // DEBUG: Check if width/height are defined
        if (!this.width || !this.height || !otherObject.width || !otherObject.height) {
            console.error('[Collision] Missing dimensions:', {
                this: {type: this.type, w: this.width, h: this.height},
                other: {type: otherObject.type, w: otherObject.width, h: otherObject.height}
            });
            return false;
        }

        // First, do a fast bounding box check
        // Use mask_bounds if available for tighter collision
        const thisBounds = this.mask_bounds || {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
        const otherBounds = otherObject.mask_bounds || {
            x: 0,
            y: 0,
            width: otherObject.width,
            height: otherObject.height
        };

        // Calculate actual positions with bounds
        const thisLeft = this.position.x + thisBounds.x;
        const thisRight = thisLeft + thisBounds.width;
        const thisTop = this.position.y + thisBounds.y;
        const thisBottom = thisTop + thisBounds.height;

        const otherLeft = otherObject.position.x + otherBounds.x;
        const otherRight = otherLeft + otherBounds.width;
        const otherTop = otherObject.position.y + otherBounds.y;
        const otherBottom = otherTop + otherBounds.height;

        // Fast AABB check - if bounding boxes don't overlap, no collision
        if (thisRight < otherLeft || thisLeft > otherRight ||
            thisBottom < otherTop || thisTop > otherBottom) {
            return false;
        }

        // DEBUG: Log when AABB passes
        if (Math.random() < 0.01) { // Only log 1% to avoid spam
            console.log('[Collision] AABB passed:', {
                this: this.type,
                other: otherObject.type,
                hasMasks: !!(this.collision_mask && otherObject.collision_mask)
            });
        }

        // If both objects have collision masks, do pixel-perfect check
        if (this.collision_mask && otherObject.collision_mask) {
            return this.check_pixel_collision(otherObject);
        }

        // Fall back to circular collision for objects without masks
        let thisCenterX = this.position.x + this.width / 2;
        let thisCenterY = this.position.y + this.height / 2;
        let otherCenterX = otherObject.position.x + otherObject.width / 2;
        let otherCenterY = otherObject.position.y + otherObject.height / 2;

        let dx = thisCenterX - otherCenterX;
        let dy = thisCenterY - otherCenterY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Use larger radii (70% of average dimension) for better collision detection
        // Small projectiles (16x16) need generous hit zones to feel responsive
        let thisRadius = Math.min(this.width, this.height) * 0.7;
        let otherRadius = Math.min(otherObject.width, otherObject.height) * 0.7;
        let combinedRadius = thisRadius + otherRadius;

        const isColliding = distance < combinedRadius;

        // DEBUG: Log collisions
        if (isColliding && Math.random() < 0.05) {
            console.log('[Collision] CIRCULAR HIT!', {
                this: this.type,
                other: otherObject.type,
                distance: distance.toFixed(2),
                combinedRadius: combinedRadius.toFixed(2)
            });
        }

        return isColliding;
    }

    check_pixel_collision(otherObject) {
        // Calculate overlap region
        const overlapLeft = Math.max(this.position.x, otherObject.position.x);
        const overlapRight = Math.min(
            this.position.x + this.width,
            otherObject.position.x + otherObject.width
        );
        const overlapTop = Math.max(this.position.y, otherObject.position.y);
        const overlapBottom = Math.min(
            this.position.y + this.height,
            otherObject.position.y + otherObject.height
        );

        // Dynamic step size - smaller objects need finer sampling
        // For 16x16 projectiles, use step=2 (checks 64 pixels)
        // For larger objects, use step=4 for performance
        const smallestDimension = Math.min(
            Math.min(this.width, this.height),
            Math.min(otherObject.width, otherObject.height)
        );
        const step = smallestDimension <= 32 ? 2 : 4;
        for (let y = overlapTop; y < overlapBottom; y += step) {
            for (let x = overlapLeft; x < overlapRight; x += step) {
                // Get local coordinates for both objects
                const thisX = Math.floor(x - this.position.x);
                const thisY = Math.floor(y - this.position.y);
                const otherX = Math.floor(x - otherObject.position.x);
                const otherY = Math.floor(y - otherObject.position.y);

                // Check if coordinates are in bounds
                if (thisX >= 0 && thisX < this.width && thisY >= 0 && thisY < this.height &&
                    otherX >= 0 && otherX < otherObject.width && otherY >= 0 && otherY < otherObject.height) {

                    const thisIndex = thisY * this.width + thisX;
                    const otherIndex = otherY * otherObject.width + otherX;

                    // If both pixels are solid, we have a collision
                    if (this.collision_mask[thisIndex] && otherObject.collision_mask[otherIndex]) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    impact2(otherObject) {
        let v1 = this.velocity;
        let v2 = otherObject.velocity;
        let m1 = this.mass;
        let m2 = otherObject.mass;
    
        // Check if either object is immovable
        let immovable1 = this.mass==10000; //
        let immovable2 = otherObject.mass==10000;
    
        // Calculate final velocities only if objects are movable
        if (!immovable1) {
            let final_v1x = immovable2 ? v1.x : (v1.x*(m1 - m2) + 2*m2*v2.x) / (m1 + m2);
            let final_v1y = immovable2 ? v1.y : (v1.y*(m1 - m2) + 2*m2*v2.y) / (m1 + m2);
            this.velocity.x = final_v1x;
            this.velocity.y = final_v1y;
        }
        
        if (!immovable2) {
            let final_v2x = immovable1 ? v2.x : (v2.x*(m2 - m1) + 2*m1*v1.x) / (m1 + m2);
            let final_v2y = immovable1 ? v2.y : (v2.y*(m2 - m1) + 2*m1*v1.y) / (m1 + m2);
            otherObject.velocity.x = final_v2x;
            otherObject.velocity.y = final_v2y;
        }
    }
    impact(otherObject) {
        let v1=this.velocity;
        let v2=otherObject.velocity;
        let m1=this.mass;
        let m2=otherObject.mass;
        if(this.mass!=10000) {
            let final_v1x = (v1.x*(m1 - m2) + 2*m2*v2.x) / (m1 + m2)
            let final_v1y = (v1.y*(m1 - m2) + 2*m2*v2.y) / (m1 + m2)
            this.velocity.x=final_v1x;
            this.velocity.y=final_v1y;
        }
        if(otherObject.mass!=10000) {
            let final_v2x = (v2.x*(m2 - m1) + 2*m1*v1.x) / (m1 + m2)
            let final_v2y = (v2.y*(m2 - m1) + 2*m1*v1.y) / (m1 + m2)
            otherObject.velocity.x=final_v2x;
            otherObject.velocity.y=final_v2y;
        }
        
    }

    adjustAccelerationDirection(object, collisionAngle, away = true) {
        // Calculate the current magnitude of the object's acceleration
        let accelerationMagnitude = Math.sqrt(object.acceleration.x ** 2 + object.acceleration.y ** 2);
        
        // Determine the new direction of the acceleration: away from or towards the collision point
        let newDirectionAngle = away ? collisionAngle + Math.PI : collisionAngle;
        
        // Adjust the object's acceleration vector
        object.acceleration.x = Math.cos(newDirectionAngle) * accelerationMagnitude;
        object.acceleration.y = Math.sin(newDirectionAngle) * accelerationMagnitude;
    }
    

}class game_object extends motion {

    static  uuid_generator = (function*() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let counter = 0;
        
        while (true) {
          let id = '';
          let currentCounter = counter;
      
          // Ensure the counter does not exceed the total number of unique combinations
          if (currentCounter >= Math.pow(chars.length, 4)) {
            throw new Error('ID space exhausted');
          }
      
          for (let i = 0; i < 4; i++) {
            id = chars[currentCounter % chars.length] + id;
            currentCounter = Math.floor(currentCounter / chars.length);
          }
          
          yield id;
          counter++;
        }
      })();


    constructor(window_manager, x = 0, y = 0, width = 64, height = 64, mass = 100, rotation = 0, rotation_speed = 4)  {
        super(x,y,width,height,mass,rotation);
        this.window_manager=window_manager;
        this.audio_manager=window_manager.audio_manager;
        this.graphics = window_manager.graphics;
        this.type = "block";
        this.sounds = { };
        this.width = width;
        this.height = height;
        this.rotation_speed = rotation_speed;
        this.img = null;
        this.image_frame = 0;
        this.image_frames = 1;
        this.image_rotation = 0;  //rotate the image seperate from the acceleration factor... for images made in diff directions
        this.anchor_points = []
        this.top_level = true;
        this.created = Date.now();
        this.expires = null;
        this.action_list = null;
        this.action_position = { frame: 0, row: 0 };
        this.destroy_object = false;
        this.loop_done = false;
        this.loop = true;
        this.center = { x: 0, y: 0 };
        this.life = 100;
        this.max_life = 100;
        this.visible = true;
        this.explosions=[];
        this.old_acceleration=null;
        this.old_velocity=null;
        this.old_position=null;
        this.collision_mask = null; // Pixel-perfect collision mask
        this.mask_bounds = null; // Tight bounding box from mask

        // Health bar display
        this.show_health_bar = false;
        this.health_bar_time = 0;
        this.health_bar_duration = 3000; // Show for 3 seconds after damage

        this.id=game_object.uuid_generator.next().value;
    }

    set_rotation_speed(speed){
        this.rotation_speed=speed;
    }
    set_rotation(rotation){
        this.rotation=rotation;
    }

    play(sound_name,single=false) {
        sound_name=this.type+sound_name;
        if( sound_name in this.sounds) {
            if (single==true && this.audio_manager.is_playing(sound_name)) return;
            this.audio_manager.play(sound_name);
        }
    }
    
    set_loop(loop) {
        this.loop = loop;
    }
    set_visible(visible) {
        this.visible = visible;
    }
    loop_complete() {
        return this.loop_done;
    }
    damage(damage) {
        // Don't apply damage if already destroyed
        if (this.destroy_object) return;

        this.life -= damage;

        // Show health bar when damaged
        this.show_health_bar = true;
        this.health_bar_time = Date.now();

        if (this.life <= 0) {
            this.life = 0;
            this.destroy();
        }
    }
    set_max_life(max_life) {
        this.max_life = max_life;
        this.life = max_life;
    }
    get_life_percentage() {
        if (this.life < 0) return 0;
        if (this.life > this.max_life) return 100;
        return parseInt((this.life / this.max_life) * 100);
    }

    destroy() {
        // Prevent multiple destroy calls on the same object
        if (this.destroy_object) return;

        this.destroy_object = true;
    }
    set_type(type) {
        this.type = type;
    }

    set_velocity(velocity) {
        this.velocity.x = velocity.x;
        this.velocity.y = velocity.y;

    }
    set_dimensions(width, height) {
        this.width = width;
        this.height = height;
    }

    expire(seconds) {
        this.expires = seconds;
    }

    set_center(x, y) {
        this.center.x = x;
        this.center.y = y;
    }

    set_sub() {
        this.top_level = false;
    }

    get_anchor_point(indeX) {

    }
    set_velocity_loss(loss) {
        this.velocity_loss = loss;
    }

    set_velocity_loss_off(loss) {
        this.velocity_loss = 1;
    }

    set_image(img_URL, frame_width = 1, frames = 1, rotation = 0) {
        this.image_rotation = rotation;
        this.image_frames = frames;
        this.frame_width = frame_width;
        this.img=img_URL;
        this.graphics.sprites.add(img_URL);

        // Get or generate collision mask (cached in sprite)
        this.get_collision_mask();
    }

    get_collision_mask() {
        // Wait for sprite to load, then get or create cached mask
        const tryGetMask = () => {
            try {
                const position = new rect(0, 0, this.width, this.height);

                // Get cached mask from sprite (or generate if first time)
                const maskData = this.graphics.sprites.get_or_create_collision_mask(this.img, position);
                if (!maskData) {
                    // Retry after another delay if sprite not ready
                    setTimeout(tryGetMask, 100);
                    return;
                }

                // Reference the cached mask (not a copy)
                this.collision_mask = maskData.collision_mask;
                this.mask_bounds = maskData.mask_bounds;
                console.log(`[${this.type}] Collision mask loaded:`, this.img, 'bounds:', this.mask_bounds);
            } catch (error) {
                console.error(`[${this.type}] Failed to get collision mask:`, error);
            }
        };

        setTimeout(tryGetMask, 100); // Small delay to ensure sprite is loaded
    }

    image_rotate(rotation) {
        this.image_rotation = rotation
    }


    set_sound(action, sound_URL) {
        //cache this to save the some ChannelSplitterNode.apply. early  optimization bites you in the ass
        this.sounds[this.type+action]=sound_URL;
        // Fire and forget - load audio in background
        this.audio_manager.add(this.type+action, sound_URL).catch(err => {
            console.error(`Failed to load sound ${sound_URL}:`, err);
        });
    }


    async bank_left() {
        this.rotation -= this.rotation_speed;
        if (this.rotation < 0)
            this.rotation += 360;
        
        
        this.play("bank_left",true);
    }

    async bank_right() {
        this.rotation += this.rotation_speed;
        this.rotation %= 360;
        this.play("bank_right",true);

    }

    async accelerate(speed = null) {
        this.play("accel",true);
        speed = speed ?? 10;
        this.accelerate_object(this.rotation, speed);
    }

    async decelerate(speed = null) {
        this.play("decel",true);
        speed = speed ?? 10;
        this.accelerate_object(this.rotation + 180, speed);
    }

    async strafe_left(speed = null) {
        speed = speed ?? 10;
        this.accelerate_object(this.rotation + 270, speed);
        this.play("bank_left",true);

    }

    async strafe_right(speed = null) {
        speed = speed ?? 10;
        this.play("bank_right",true);
        this.accelerate_object(this.rotation + 90, speed);

    }

    async rotate(rotation) {
        this.rotation = rotation;
    }
    restore_last_position(){
        this.acceleration=this.old_acceleration;
        this.velocity=this.old_velocity;
        this.position=this.old_position;
    }

    update_frame(deltaTime) {
        this.update_motion(deltaTime);
        if (this.visible == false) return;
        if (this.image_frames > 1) {

            if (this.loop == false && this.image_frame >= this.image_frames - 1) {
                this.loop_done = true;
            }

            this.image_frame++;
            this.image_frame %= this.image_frames;
        }

        // Update health bar visibility
        if (this.show_health_bar) {
            const elapsed = Date.now() - this.health_bar_time;
            if (elapsed > this.health_bar_duration) {
                this.show_health_bar = false;
            }
        }

        // Update explosions - iterate backwards to safely remove completed ones
        for (let b = this.explosions.length - 1; b >= 0; b--) {
            this.explosions[b].update_frame(deltaTime);
            if (this.explosions[b].loop_complete()) {
                this.explosions.splice(b, 1);
            }
        }

        this.playActions();
    }//end update frame

    orient(window = null) {
        if (!this.graphics || !this.graphics.ctx || typeof this.graphics.ctx.save !== 'function') return;

        this.graphics.ctx.save();

        // Work in virtual coordinates - canvas transform handles scaling
        let x = this.position.x;
        let y = this.position.y;
        if (window != null) {
            x -= window.x;
            y -= window.y;
        }

        this.graphics.ctx.translate(x, y);

        var radians = ((this.rotation + this.image_rotation) % 360) * Math.PI / 180;
        this.graphics.ctx.rotate(radians);

    }

    de_orient() {
        this.graphics.ctx.restore();
    }


    rotatePoint(x, y, cx, cy, rotation) {
        // Translate the point so that the rotation axis is at the origin
        let translatedX = x - cx;
        let translatedY = y - cy;

        // Apply the rotation matrix
        let radians = (rotation * Math.PI) / 180

        let cosTheta = Math.cos(radians);
        let sinTheta = Math.sin(radians);

        let rotatedX = translatedX * cosTheta - translatedY * sinTheta;
        let rotatedY = translatedX * sinTheta + translatedY * cosTheta;

        // Translate the point back to its original position
        rotatedX += cx;
        rotatedY += cy;

        // Return the rotated point
        return { x: rotatedX, y: rotatedY };
    }


    get_relative_position(x, y) {
        return this.rotatePoint(x, y, 0, 0, this.rotation)
    }


    render() {
        if (this.visible == false) return;

        // Work in virtual coordinates - canvas transform handles scaling
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = this.width;
        let sourceHeight = this.height;
        if (this.image_frames > 1) {
            sourceX = this.image_frame * this.frame_width;
            sourceWidth = this.frame_width;
        }

        let src = new rect(sourceX, sourceY, sourceWidth, sourceHeight);
        let dest = new rect(-this.center.x, -this.center.y, sourceWidth, sourceHeight);
        this.graphics.sprites.render(this.img, src, dest, 1, 'none');

        // Render health bar if recently damaged
        if (this.show_health_bar && this.max_life > 0) {
            this.render_health_bar();
        }

        for(let i = 0; i < this.explosions.length; i++){
            this.explosions[i].render();
        }
    }

    render_health_bar() {
        if (!this.graphics || !this.graphics.ctx) return;

        const ctx = this.graphics.ctx;
        const barWidth = this.width * 0.8; // 80% of object width
        const barHeight = 6;
        const barX = -barWidth / 2;
        const barY = -this.center.y - 15; // Above the object

        const healthPercent = this.life / this.max_life;

        // Background (black)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health (green to red gradient based on health)
        let barColor;
        if (healthPercent > 0.6) {
            barColor = '#00FF00'; // Green
        } else if (healthPercent > 0.3) {
            barColor = '#FFFF00'; // Yellow
        } else {
            barColor = '#FF0000'; // Red
        }

        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border (white)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    renderWithOverlay(overlayColor) {
        // Render the object normally
        if (this.image_frames > 1) {
            // Define the source rectangle
            let sourceX = this.image_frame * this.frame_width;
            let sourceY = 0;
            let sourceWidth = this.frame_width;
            let sourceHeight = this.height;

            // Save the current context state
            if (!this.graphics || !this.graphics.ctx || typeof this.graphics.ctx.save !== 'function') return;
            this.graphics.ctx.save();

            // Clip to the region of the drawn imagery
            this.graphics.ctx.beginPath();
            this.graphics.ctx.rect(-this.center.x, -this.center.y, sourceWidth, sourceHeight);
            this.graphics.ctx.clip();

            // Draw the image onto the canvas
            this.graphics.ctx.drawImage(this.img, sourceX, sourceY, sourceWidth, sourceHeight,
                -this.center.x, -this.center.y, sourceWidth, sourceHeight);

            // Apply the overlay color to the drawn imagery
            this.graphics.ctx.globalCompositeOperation = 'source-atop';
            this.graphics.ctx.fillStyle = overlayColor;
            this.graphics.ctx.fillRect(-this.center.x, -this.center.y, sourceWidth, sourceHeight);

            // Restore the previous context state
            this.graphics.ctx.restore();
        } else {
            // Save the current context state
            if (!this.graphics || !this.graphics.ctx || typeof this.graphics.ctx.save !== 'function') return;
            this.graphics.ctx.save();

            // Clip to the region of the drawn imagery
            this.graphics.ctx.beginPath();
            this.graphics.ctx.rect(-this.center.x, -this.center.y, this.width, this.height);
            this.graphics.ctx.clip();

            // Draw the image onto the canvas
            this.graphics.ctx.drawImage(this.img, -this.center.x, -this.center.y);

            // Apply the overlay color to the drawn imagery
            this.graphics.ctx.globalCompositeOperation = 'source-atop';
            this.graphics.ctx.fillStyle = overlayColor;
            this.graphics.ctx.fillRect(-this.center.x, -this.center.y, this.width, this.height);

            // Restore the previous context state
            this.graphics.ctx.restore();
        }
    }


    

    async playActions() {
        if (this.action_list == null) return;
        let action = this.action_list[this.action_position.row];

        this.executeAction(action);

        this.action_position.frame++;
        if (this.action_position.frame >= action.frames) {
            this.action_position.row++;
            this.action_position.frame = 0;
            if (this.action_position.row >= this.action_list.length) {
                this.action_position.row = 0;
            }

        }

    }

    async executeAction(action) {
        switch (action.type) {
            case 'bank_left':
                await this.bank_left();
                //console.log("Bank left");
                break;
            case 'bank_right':
                await this.bank_right();
                //console.log("Bank Right");
                break;
            case 'accelerate':
                //console.log("Accel: "+this.type+" "+action.speed);
                await this.accelerate(action.speed);
                
                break;
            case 'decelerate':
                //console.log("Decel");
                await this.decelerate(action.speed);
                break;
            case 'rotate':
                //console.log("Decel");
                await this.rotate(action.rotation);
                break;
            case 'strafe_left':
                //console.log("Decel");
                await this.strafe_left(action.speed);
                break;
            case 'strafe_right':
                //console.log("Decel");
                await this.strafe_right(action.speed);
                break;

            case 'skip':

                break;
        }
    }

    async wait(frames) {
        return new Promise(resolve => setTimeout(resolve, frames * millisecondsPerFrame));
    }

    explosion(offsetX = 0, offsetY = 0){
        // Limit concurrent explosions to prevent visual stacking
        if (this.explosions.length >= 5) {
            // Remove oldest explosion to make room
            this.explosions.shift();
        }

        let exp = new Explosion(this.window_manager, offsetX, offsetY, this.play_sounds, this.volume);
        this.explosions.push(exp);
    }

}


class Explosion extends game_object {
    constructor(window_manager,x, y) {
                super(window_manager,x, y,128,128,
                    0,                    // mass
                    0,                      // rotation
                    10);      
        this.set_image('explosion_sprite',128,35);
        this.set_center(64,64);
        this.set_type("explosion");
        this.set_loop(false);
        //this.set_sound("destroy","static/explosion/sfx_exp_shortest_soft9.wav");
    }

            
}

class Derbis extends game_object {
    constructor(window_manager,x, y, type) {
        let speed=.5 + Math.random() * 1;
        let default_action =
            [
                { type: "bank_left", frames: 3 },
                { type: "accelerate", frames: 3 },
                { type: "bank_right", frames: 3 },
                { type: "accelerate", frames: 3 },
                { type: "decelerate", frames: 3 },
                { type: "bank_left", frames: 6 },
                { type: "decelerate", frames: 3 },
                { type: "bank_left", frames: 3 },
                { type: "skip", frames: 4 },
            ];

        switch (type) {
            case 'email':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    10);                     // ropration speed
                this.set_image('debris_email');
                this.set_type("email");
                this.set_max_life(50);
                let email_action = [
                    { frames: 4, type: "strafe_left", speed:speed},
                    { frames: 15, type: "skip" },
                    { frames: 4, type: "strafe_right" , speed:speed},
                    { frames: 15, type: "skip"},
                ];


                this.action_list = email_action;
                break;
            case 'pdf':
                super(window_manager,x, y,64,64,
                    1,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('debris_pdf');
                this.set_type("pdf");
                this.set_max_life(30);
                let pdf_action = [
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "accelerate", frames: 1 },
                    { type: "bank_left", frames: 4 }
                ];

                this.action_list= pdf_action;
                break;
            case 'call':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('debris_phone');
                this.set_type("call");
                this.set_max_life(40);
                let call_action = [
                    { type: "bank_right", frames: 1 },

                ];

                this.action_list = call_action;
                break;

            case 'webex':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    4);                     // ropration speed
                this.set_image('debris_webex');
                this.set_type("webex");
                this.set_max_life(40);
                this.action_list = default_action;
                break;
            case 'block':
                super(window_manager,x, y,64,64,
                    10000,                    // mass
                    0,                      // rotation
                    0);                     // ropration speed
                this.set_image('block');
                this.set_type("block");
                break;

            case 'linkedin':
                super(window_manager,x, y,64,64,
                    3,                    // mass
                    0,                      // rotation
                    6);                     // ropration speed
                this.set_image('ship_linkedin');
                this.set_type("linkedin");
                this.set_max_life(60);
                let linkedin_action = [
                    { type: "bank_left", frames: 2 },
                    { type: "accelerate", frames: 3, speed:speed },
                    { type: "bank_right", frames: 2 },
                    { type: "skip", frames: 5 }
                ];
                this.action_list = linkedin_action;
                break;

            case 'zoom':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    8);                     // ropration speed
                this.set_image('debris_webex'); // Using webex as placeholder
                this.set_type("zoom");
                this.set_max_life(45);
                let zoom_action = [
                    { frames: 3, type: "strafe_right", speed:speed },
                    { frames: 10, type: "skip" },
                    { frames: 3, type: "strafe_left", speed:speed },
                    { frames: 10, type: "skip" }
                ];
                this.action_list = zoom_action;
                break;

            case 'facebook':
                super(window_manager,x, y,64,64,
                    3,                    // mass
                    0,                      // rotation
                    5);                     // ropration speed
                this.set_image('debris_email'); // Using email as placeholder
                this.set_type("facebook");
                this.set_max_life(55);
                let facebook_action = [
                    { type: "bank_right", frames: 3 },
                    { type: "accelerate", frames: 2, speed:speed },
                    { type: "skip", frames: 8 }
                ];
                this.action_list = facebook_action;
                break;

            case 'reddit':
                super(window_manager,x, y,64,64,
                    2,                    // mass
                    0,                      // rotation
                    7);                     // ropration speed
                this.set_image('debris_pdf'); // Using pdf as placeholder
                this.set_type("reddit");
                this.set_max_life(40);
                let reddit_action = [
                    { type: "bank_left", frames: 1 },
                    { type: "bank_right", frames: 1 },
                    { type: "skip", frames: 3 }
                ];
                this.action_list = reddit_action;
                break;
        }
        this.rotation = 180;

    } // end
}





class Projectile extends game_object {
    constructor(window_manager, x, y, rotation, type, sounds = false) {
        let actions = [];
        switch (type) {
            case 'lazer':
                actions = [
                    { type: "accelerate", frames: 1 }
                ];
                super(window_manager, x, y, 16, 16,
                    0.5,                  // mass (very light projectile for bouncing)
                    rotation,             // rotation
                    4,
                );                        // rotation speed
                this.set_image('projectile_p3', 16, 4, 270);
                this.set_velocity_loss_off();
                this.set_center(8, 8);
                this.expire(5);
                this.set_type("laser");
                this.action_list=actions;

                break;

            case 'bolt1':
                super(window_manager, x, y, 16, 16,
                    0.6,                  // mass (very light projectile for bouncing)
                    rotation,             // rotation
                    4,
                );                        // rotation speed
                this.set_image('projectile_p1', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 5 }
                ];
                this.action_list=actions;
                break;
            case 'bolt2':
                super(window_manager, x, y, 16, 16,
                    0.6,                  // mass (very light projectile for bouncing)
                    rotation,             // rotation
                    4,
                );                        // rotation speed
                this.set_image('projectile_p2', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 5 }
                ];
                this.action_list=actions;
                break;
            case 'bolt3':
                super(window_manager, x, y, 16, 16,
                    0.5,                  // mass (very light projectile for bouncing)
                    rotation,             // rotation
                    4,
                );                        // rotation speed
                this.set_image('projectile_p3', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                // No action list - lasers move at constant velocity
                this.action_list = null;

                break;
            case 'bolt4':
                super(window_manager, x, y, 16, 16,
                    1,                    // mass (heavier missile, but still light vs ships)
                    rotation,             // rotation
                    4,
                );                        // rotation speed
                this.set_image('projectile_p4', 16, 4, 270);
                this.center.x = 8;
                this.set_velocity_loss_off();
                this.expire(5);
                this.set_type("bolt");
                actions = [
                    { type: "accelerate", frames: 1, speed: 10 }
                ];
                this.action_list=actions;
                break;


            case 'thruster':
                super(window_manager, x, y, 16, 16,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('ship_water_bolt', 16, 5, 270);
                this.set_velocity_loss_off();
                this.center.x = 8;
                this.center.y = 8;
                this.expire(5);
                this.set_type("thrusters");
                break;

            case 'booster':
                super(window_manager, x, y, 32, 64,
                    400,                    // mass
                    rotation,                      // rotation
                    4,
                );                     // ropration speed
                this.set_image('ship_booster', 32, 4, 0);
                this.set_velocity_loss_off();
                this.center.x = 16;
                this.center.y = 2;
                this.set_type("booster");
                break;

        }


    }

}
class HeatSeekingMissile extends game_object {
    constructor(window_manager, x=0, y=0, rotation=0) {
        super(window_manager, x, y, 32, 32, 100, rotation, 8);
        this.target = null; // Will be set to nearest enemy
        this.maxSpeed = 800; // Maximum speed of the missile
        this.turningRate = 8; // Rate at which the missile can turn
        this.accelerationRate = 300; // Rate at which the missile accelerates

        this.set_image('projectile_p4', 16, 4, 270);
        this.set_center(16, 16);
        this.set_velocity_loss_off();
        this.set_type("missile");
        this.expire(10);
        this.set_max_life(1);
    }

    set_target(target) {
        this.target = target;
    }

    find_nearest_target(npcs) {
        if (!npcs || npcs.length === 0) return null;

        let nearest = null;
        let nearestDist = Infinity;

        for (let npc of npcs) {
            if (npc.destroy_object) continue;
            // Only target ships and certain debris
            if (npc.type !== "ship" && npc.type !== "email" && npc.type !== "pdf") continue;

            const dx = npc.position.x - this.position.x;
            const dy = npc.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = npc;
            }
        }

        return nearest;
    }

    update_frame(deltaTime) {
        // Check if target is still valid
        if (this.target && this.target.destroy_object) {
            this.target = null;
        }

        if (this.target) {
            // Update orientation to face the target
            this.rotateTowardsTarget();

            // Accelerate towards the target
            this.accelerate_towards_target();
        }

        // Limit speed
        this.limitSpeed();

        // Update frame (from parent class)
        super.update_frame(deltaTime);
    }

    rotateTowardsTarget() {
        if (!this.target) return;

        const deltaX = this.target.position.x - this.position.x;
        const deltaY = this.target.position.y - this.position.y;

        // Calculate angle to target (0 degrees is up/north)
        const targetAngle = (Math.atan2(deltaX, -deltaY) * (180 / Math.PI) + 360) % 360;

        // Calculate shortest rotation direction
        let angleDiff = targetAngle - this.rotation;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        // Rotate towards the target
        if (Math.abs(angleDiff) > this.turningRate) {
            if (angleDiff > 0) {
                this.bank_right();
            } else {
                this.bank_left();
            }
        } else {
            // Close enough, set rotation directly
            this.rotation = targetAngle;
        }
    }

    accelerate_towards_target() {
        // Accelerate in the direction we're facing
        this.accelerate_object(this.rotation, this.accelerationRate);
    }

    limitSpeed() {
        // Calculate current speed
        const speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

        // If speed exceeds maxSpeed, reduce velocity
        if (speed > this.maxSpeed) {
            const scaleFactor = this.maxSpeed / speed;
            this.velocity.x *= scaleFactor;
            this.velocity.y *= scaleFactor;
        }
    }
}

class Ship extends game_object {

    constructor(window_manager, x, y, type) {
        super(window_manager, x, y, 128, 153,
            10,                   // mass (balanced for responsive movement and collision physics)
            0,                    // rotation
            4.0);                 // rotation speed - faster turning with fine control
        
        this.boost_fire_control = new fire_control(1);
        this.laser_fire_control = new fire_control(2);  // Reduced from 5 to 2 - less heat per shot
        this.missile_fire_control = new fire_control(10);
        this.shield_fire_control = new fire_control(3, 2000, 2000); // Shield uses fire_control for auto decay/ramp
        this.thrusters = [];
        this.projectiles = [];
        this.booster=null;
        this.bolt_type=null;
        this.missile_type=null;

        // Shield system with decay/ramp
        this.shield_strength = 100; // 0-100, acts like inverse temperature
        this.shield_max_strength = 100;
        this.shield_regen_rate = 1; // Regen per frame when not taking damage
        this.shield_impacts = []; // Array of {x, y, time, intensity} for impact glow effects
        this.shield_glow_phase = 0; // For animated glow effect
        let speed=5+.5 + Math.random() * 4;

        switch (type) {
            case 'user':
                this.set_type("ship");
                // Load audio paths from ASSETS.json manifest
                const asset_loader = this.graphics.asset_loader;
                const ship_static = asset_loader.get('audio.ship_static');
                const laser_sound = asset_loader.get('audio.laser');
                const missile_sound = asset_loader.get('audio.missile');

                this.set_sound("left", ship_static)
                this.set_sound("right", ship_static)
                this.set_sound("accel", ship_static)
                this.set_sound("decel", ship_static)
                this.set_sound("lazer", laser_sound)
                this.set_sound("missile", missile_sound)

                this.set_image('ship_player');
                this.set_center(64, 64);
                this.booster = new Projectile(window_manager, +0, 100, 0, "booster");
                this.thrusters.push(this.booster);
                var thruster1 = new Projectile(window_manager, +30, 75, 0, "thruster");
                this.thrusters.push(thruster1);
                var thruster2 = new Projectile(window_manager, -30, 75, 0, "thruster");
                this.thrusters.push(thruster2);
                this.bolt_type="bolt3";
                this.missile_type="bolt4";
                break;

            case 'teams':
                this.set_type("ship");
                //this.set_sound("left", 'static/audio/ship/static.mp3')
                //this.set_sound("right", 'static/audio/ship/static.mp3')
                //this.set_sound("accel", 'static/audio/ship/static.mp3')
                //this.set_sound("decel", 'static/audio/ship/static.mp3')
                //this.set_sound("lazer", 'static/audio/ship/static.mp3')
                this.set_image('ship_teams',64,1,270);

                //this.set_image('static/projectiles/Arcane Bolt.png', 16, 5, 270);
                this.set_rotation(270);
                this.set_center(64, 64);
                this.set_rotation_speed(10);
                this.set_max_life(100);
                this.bolt_type="bolt2";
                this.missile_type="bolt3";
                let frames=Math.random()*15+10;
                let actions = [
                    { type: "bank_right", frames: 9,  },
                    { type: "accelerate", frames: frames ,speed:speed},
                    { type: "lazer",frames: 1, speed: 5},
                    { type: "bank_left", frames: 15,  },
                    { type: "accelerate", frames: 6, speed:5},
                    { type: "skip", frames: 4 }
                ];
                this.action_list=actions;
                this.action_position.frame=parseInt(Math.random( )*actions.length);

                break;

        }
    }

    set_volume(volume) {
        super.set_volume(volume);
        for (let thruster of this.thrusters) {
            thruster.volume = volume;
        }
        for (let projectile of this.projectiles) {
            projectile.volume = volume;
        }
    }

    boost() {
        // Boost applies continuous acceleration while held, not fire-rate limited
        if (!this.boost_fire_control.overheated) {
            this.booster.set_visible(true);
            this.accelerate(600);  // Higher acceleration for boost

            // Heat up the boost system
            this.boost_fire_control.temprature += 0.5;  // Gradual heat buildup
            if (this.boost_fire_control.temprature > this.boost_fire_control.max_tempreture) {
                this.boost_fire_control.temprature = this.boost_fire_control.max_tempreture;
                this.boost_fire_control.overheated = true;
                this.boost_fire_control.overheated_cooldown_start = 0;
            }
            this.boost_fire_control.is_firing = true;
        } else {
            this.booster.set_visible(false);
        }
    }

    stop_boost() {
        this.boost_fire_control.stop_firing();
        this.booster.set_visible(false);
    }

    /**
     * Reverse thrust - applies force in opposite direction of velocity to brake
     */
    reverse_thrust() {
        // Calculate magnitude of current velocity
        const velocityMagnitude = Math.sqrt(
            this.velocity.x * this.velocity.x +
            this.velocity.y * this.velocity.y
        );

        if (velocityMagnitude < 0.5) {
            // Ship is almost stopped, just zero it out
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }

        // Calculate unit vector in opposite direction of velocity
        const reverseX = -this.velocity.x / velocityMagnitude;
        const reverseY = -this.velocity.y / velocityMagnitude;

        // Apply strong braking force (300 is stronger than boost)
        const brakeForce = 300;
        this.velocity.x += reverseX * brakeForce / this.mass;
        this.velocity.y += reverseY * brakeForce / this.mass;
    }

    /**
     * Get shield strength as percentage (0-100)
     */
    get_shield_percentage() {
        return (this.shield_strength / this.shield_max_strength) * 100;
    }

    /**
     * Take damage - shields deflect damage based on strength percentage
     * @param {number} amount - Damage amount
     * @param {number} impactX - X position of impact in world space (optional)
     * @param {number} impactY - Y position of impact in world space (optional)
     */
    damage(amount, impactX = 0, impactY = 0) {
        // Calculate deflection based on shield strength
        // 100% shields = 80% deflection (20% damage taken)
        // 0% shields = 0% deflection (100% damage taken)
        const maxDeflection = 0.80; // Max 80% deflection at full shields
        const shieldPercentage = this.shield_strength / this.shield_max_strength;
        const deflectionPercentage = shieldPercentage * maxDeflection;

        // Calculate actual damage taken
        const damageDeflected = amount * deflectionPercentage;
        const damageTaken = amount - damageDeflected;

        // Reduce shield strength based on damage (shields decay when hit)
        const shieldDecay = amount * 0.15; // Shields lose 15% of incoming damage value
        this.shield_strength -= shieldDecay;
        if (this.shield_strength < 0) this.shield_strength = 0;

        // Add impact glow effect at impact point
        if (shieldPercentage > 0) {
            // Convert world space impact to ship's local rotated space
            const rotRad = (this.rotation % 360) * Math.PI / 180;
            const cos = Math.cos(-rotRad);  // Negative because we're converting TO local space
            const sin = Math.sin(-rotRad);

            const localX = impactX * cos - impactY * sin;
            const localY = impactX * sin + impactY * cos;

            this.shield_impacts.push({
                x: localX,
                y: localY,
                time: Date.now(),
                intensity: Math.min(deflectionPercentage, 1) // Brighter at higher shield strength
            });
        }

        // Apply damage to hull
        super.damage(damageTaken);

        console.log(`[Ship] Shields at ${(shieldPercentage * 100).toFixed(1)}% deflected ${deflectionPercentage.toFixed(1)}% (${damageDeflected.toFixed(1)} dmg), took ${damageTaken.toFixed(1)} damage`);
    }



    fire_lazer() {
        if (this.laser_fire_control.can_fire()) {
            let lazer1 = this.get_relative_position(-60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, this.bolt_type);

            // Set constant laser velocity - lasers don't accelerate
            const laserSpeed = 1500;  // Very fast constant speed
            const radians = this.rotation * Math.PI / 180;
            projectile.velocity.x = Math.sin(radians) * laserSpeed;
            projectile.velocity.y = -Math.cos(radians) * laserSpeed;
            this.projectiles.push(projectile);

            let lazer2 = this.get_relative_position(+60, -35)
            var projectile = new Projectile(this.window_manager,this.position.x + lazer2.x, this.position.y + lazer2.y, this.rotation, this.bolt_type);

            // Set constant laser velocity - lasers don't accelerate
            projectile.velocity.x = Math.sin(radians) * laserSpeed;
            projectile.velocity.y = -Math.cos(radians) * laserSpeed;
            this.projectiles.push(projectile);
            this.play("lazer");

        }
    }
    stop_firing_lazer() {
        this.laser_fire_control.stop_firing();
    }

    fire_missle(npcs) {
        if (this.missile_fire_control.can_fire()) {
            let missle1 = this.get_relative_position(0, -80);

            // Create heat-seeking missile
            var missile = new HeatSeekingMissile(
                this.window_manager,
                this.position.x + missle1.x,
                this.position.y + missle1.y,
                this.rotation
            );

            // Give missile strong initial velocity in firing direction
            const missileInitialSpeed = 600;  // Fast initial speed
            const radians = this.rotation * Math.PI / 180;
            missile.velocity.x = Math.sin(radians) * missileInitialSpeed;
            missile.velocity.y = -Math.cos(radians) * missileInitialSpeed;

            // Find and set target
            if (npcs && npcs.length > 0) {
                const target = missile.find_nearest_target(npcs);
                if (target) {
                    missile.set_target(target);
                }
            }

            this.projectiles.push(missile);
            this.missile_fire_control.stop_firing();
            this.play("missile");
        }
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);
        this.laser_fire_control.update_frame();
        this.missile_fire_control.update_frame();
        this.boost_fire_control.update_frame();

        // Shield regeneration - automatically ramps back up when not taking damage
        if (this.shield_strength < this.shield_max_strength) {
            this.shield_strength += this.shield_regen_rate;
            if (this.shield_strength > this.shield_max_strength) {
                this.shield_strength = this.shield_max_strength;
            }
        }

        // Health regeneration - heal over time (1.0 per second)
        if (this.life < this.max_life) {
            this.life += 1.0 * deltaTime * 60; // deltaTime is in seconds, multiply by 60 for per-second rate
            if (this.life > this.max_life) {
                this.life = this.max_life;
            }
        }

        // Update shield glow animation
        this.shield_glow_phase += deltaTime * 3;

        // Remove old impact effects (fade out after 1 second)
        const currentTime = Date.now();
        this.shield_impacts = this.shield_impacts.filter(impact =>
            currentTime - impact.time < 1000
        );

        // Clamp player ship to screen boundaries
        if (this.type === "ship" && this.bolt_type === "bolt3") { // User ship check
            const viewport = this.graphics.viewport.virtual;
            const margin = this.width / 2; // Half ship width for center-based positioning

            // Clamp X position (left/right boundaries)
            if (this.position.x < margin) {
                this.position.x = margin;
                this.velocity.x = 0; // Stop horizontal movement
            }
            if (this.position.x > viewport.width - margin) {
                this.position.x = viewport.width - margin;
                this.velocity.x = 0;
            }

            // Clamp Y position (top/bottom boundaries relative to world position)
            const worldY = this.position.y - this.graphics.viewport.world.y;
            const minY = margin;
            const maxY = viewport.height - margin;

            if (worldY < minY) {
                this.position.y = this.graphics.viewport.world.y + minY;
                this.velocity.y = Math.max(0, this.velocity.y); // Only stop upward movement
            }
            if (worldY > maxY) {
                this.position.y = this.graphics.viewport.world.y + maxY;
                this.velocity.y = Math.min(0, this.velocity.y); // Only stop downward movement
            }
        }

        const timestamp = Date.now(); // Corrected method to get current timestamp in milliseconds

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (timestamp - projectile.created > 5000) {
                this.projectiles.splice(i, 1); // Remove the projectile from the array
                // Optionally perform additional cleanup or logging here
            } else {
                projectile.update_frame(deltaTime); // Update the projectile if it's not deleted
            }
        }

        for (let thruster of this.thrusters) {
            thruster.update_frame(deltaTime);
        }
    }



    render(window) {
        super.orient(window)

        // Only draw shield during impact events (when there are active impacts)
        if (this.shield_impacts.length > 0) {
            this.render_shield();
        }

        for (let thruster of this.thrusters) {
            thruster.orient()
            thruster.render()
            thruster.de_orient()
        }
        super.render();
        super.de_orient();

        for (let projectile of this.projectiles) {
            projectile.orient(window)
            projectile.render()
            projectile.de_orient()
        }
        // Removed duplicate de_orient() - it was popping the viewport transform off the stack
    }

    render_shield() {
        if (!this.graphics || !this.graphics.ctx) return;
        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        ctx.save();

        // Calculate shield opacity based on strength (affects impact brightness)
        const shieldAlpha = (this.shield_strength / this.shield_max_strength);

        // Shield bubble radius - the protective sphere around the ship
        const shieldRadius = 80; // Shield extends beyond ship

        // Render impact glows - show section of shield bubble around impact area
        const currentTime = Date.now();
        for (let impact of this.shield_impacts) {
            const age = currentTime - impact.time;
            const lifetime = 800;
            const progress = age / lifetime;

            // Fade out over time
            const impactAlpha = (1 - progress) * impact.intensity * shieldAlpha;

            // Pulse effect - oscillates during impact
            const pulsePhase = (1 - progress) * Math.PI * 4; // 4 pulses over lifetime
            const pulse = 0.7 + Math.sin(pulsePhase) * 0.3; // Oscillate between 0.4 and 1.0

            // Calculate impact direction (normalize)
            const distance = Math.sqrt(impact.x * impact.x + impact.y * impact.y) || 1;
            const dirX = impact.x / distance;
            const dirY = impact.y / distance;

            // Project impact to shield surface
            const impactX = dirX * shieldRadius;
            const impactY = dirY * shieldRadius;

            // Draw the shield arc/section around impact point
            // Arc size expands over time
            const arcSize = 60 + (progress * 40); // Angular size in degrees
            const arcAngle = arcSize * Math.PI / 180;

            // Calculate angle of impact direction
            const impactAngle = Math.atan2(dirY, dirX);

            // Draw multiple layers for depth - inner bright ring, outer glow
            for (let layer = 0; layer < 3; layer++) {
                const layerRadius = shieldRadius + (layer * 15);
                const layerAlpha = impactAlpha * (1 - layer * 0.3) * pulse;

                // Create gradient along the shield surface - BLUE
                const gradient = ctx.createRadialGradient(
                    0, 0, shieldRadius - 5,
                    0, 0, layerRadius
                );

                gradient.addColorStop(0, `rgba(100, 150, 255, 0)`);
                gradient.addColorStop(0.8, `rgba(80, 180, 255, ${layerAlpha * 0.7})`);
                gradient.addColorStop(1, `rgba(100, 200, 255, ${layerAlpha * 0.9})`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                // Draw arc section around impact point
                ctx.arc(0, 0, layerRadius,
                    impactAngle - arcAngle / 2,
                    impactAngle + arcAngle / 2);
                ctx.arc(0, 0, shieldRadius - 5,
                    impactAngle + arcAngle / 2,
                    impactAngle - arcAngle / 2,
                    true);
                ctx.closePath();
                ctx.fill();
            }

            // Add bright blue impact flash at center of arc with pulse
            const flashGradient = ctx.createRadialGradient(
                impactX, impactY, 0,
                impactX, impactY, 30
            );
            flashGradient.addColorStop(0, `rgba(200, 230, 255, ${impactAlpha * pulse * 1.0})`);
            flashGradient.addColorStop(0.4, `rgba(100, 180, 255, ${impactAlpha * pulse * 0.8})`);
            flashGradient.addColorStop(0.7, `rgba(80, 150, 255, ${impactAlpha * pulse * 0.5})`);
            flashGradient.addColorStop(1, `rgba(60, 120, 255, 0)`);

            ctx.fillStyle = flashGradient;
            ctx.beginPath();
            ctx.arc(impactX, impactY, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
    async executeAction(action) {
       super.executeAction(action);
       switch(action.type){
        case 'lazer': this.fire_lazer(); break;
       }
    }

    destroy() {
        // For player ship, create massive multi-ring expanding explosion
        if (this.bolt_type === "bolt3") {  // User ship check
            this.create_death_explosion();
        }
        super.destroy();
    }

    create_death_explosion() {
        // Create more modest explosion effect to prevent browser lockup
        const rings = 2;  // Reduced from 4 to 2
        const explosionsPerRing = 6;  // Reduced from 12 to 6

        // Get ship's current world position
        const shipX = this.position.x;
        const shipY = this.position.y;

        // Get reference to level's NPC array to add explosions as world objects
        const level = this.window_manager.modals.find(m => m.level);
        if (!level || !level.level) {
            console.error('[Ship] Cannot create death explosion - level not found');
            return;
        }

        // Add a big central explosion at ship position immediately
        let centerExp = new Explosion(this.window_manager, shipX, shipY);
        centerExp.set_sub();
        level.level.npc.push(centerExp);

        // Create staggered rings with requestAnimationFrame instead of setTimeout
        let currentRing = 0;
        const createRing = () => {
            if (currentRing >= rings) return;

            const radius = 30 + (currentRing * 50);

            // Create ring explosions
            for (let i = 0; i < explosionsPerRing; i++) {
                const angle = (i / explosionsPerRing) * Math.PI * 2;
                const offsetX = Math.cos(angle) * radius;
                const offsetY = Math.sin(angle) * radius;

                let exp = new Explosion(this.window_manager, shipX + offsetX, shipY + offsetY);
                exp.set_sub();
                level.level.npc.push(exp);
            }

            // Add 2 random explosions per ring (reduced from 5)
            for (let i = 0; i < 2; i++) {
                const randomAngle = Math.random() * Math.PI * 2;
                const randomRadius = Math.random() * radius;
                const offsetX = Math.cos(randomAngle) * randomRadius;
                const offsetY = Math.sin(randomAngle) * randomRadius;

                let exp = new Explosion(this.window_manager, shipX + offsetX, shipY + offsetY);
                exp.set_sub();
                level.level.npc.push(exp);
            }

            currentRing++;

            // Schedule next ring using setTimeout (100ms delay)
            if (currentRing < rings) {
                setTimeout(createRing, 100);
            }
        };

        // Start creating rings after a small delay
        setTimeout(createRing, 100);
    }

}//end ship class




class Boss extends game_object {
    constructor(window_manager, x, y, type) {
        switch (type) {
            case 'chatgpt':
                super(window_manager, x, y, 400, 400,  // Large boss - 400x400 collision box
                    15,                   // mass - very heavy
                    0,                    // rotation
                    4);                   // rotation speed

                this.set_image('ship_chatgpt');
                this.set_type("boss");
                this.set_max_life(50000); // 10x player ship health (player has 5000)
                this.set_center(200, 200); // Center point for 400x400

                // Store actual image dimensions for rendering
                this.image_source_width = 1024;
                this.image_source_height = 1024;

                // Boss enters from top then strafes horizontally
                this.action_list = [
                    { type: "accelerate", frames: 20, speed: 3 }, // Move down to center
                    { type: "strafe_left", frames: 30, speed: 2 },
                    { type: "strafe_right", frames: 60, speed: 2 },
                    { type: "strafe_left", frames: 30, speed: 2 },
                    { type: "skip", frames: 10 }
                ];

                this.bolt_type = "bolt3";
                this.projectiles = [];

                // Boss hover behavior - locks Y position while allowing X movement
                this.hover_target_y = null; // Will be set when spawned
                this.is_hovering = false;
                this.hover_damping = 0.85; // Slow down when approaching target

                // 6 cannon positions for chatGPT boss (scaled for 400x400)
                this.cannons = [
                    { x: -120, y: 80 },   // Left top
                    { x: -120, y: 160 },  // Left bottom
                    { x: 120, y: 80 },    // Right top
                    { x: 120, y: 160 },   // Right bottom
                    { x: -60, y: 120 },   // Center left
                    { x: 60, y: 120 }     // Center right
                ];

                // Boss fires more frequently
                this.laser_fire_control = new fire_control(12, 1500, 800);
                break;

            case 'resume':
                super(window_manager, x, y, 400, 400,  // Large boss - 400x400 collision box
                    15,                   // mass - very heavy
                    0,                    // rotation
                    4);                   // rotation speed

                this.set_image('ship_resume');
                this.set_type("boss");
                this.set_max_life(50000); // 10x player ship health (player has 5000)
                this.set_center(200, 200); // Center point for 400x400

                // Store actual image dimensions for rendering
                this.image_source_width = 1024;
                this.image_source_height = 1024;

                // Boss enters from top then strafes horizontally
                this.action_list = [
                    { type: "accelerate", frames: 20, speed: 3 }, // Move down to center
                    { type: "strafe_right", frames: 30, speed: 2 },
                    { type: "strafe_left", frames: 60, speed: 2 },
                    { type: "strafe_right", frames: 30, speed: 2 },
                    { type: "skip", frames: 10 }
                ];

                this.bolt_type = "bolt3";
                this.projectiles = [];

                // Boss hover behavior - locks Y position while allowing X movement
                this.hover_target_y = null; // Will be set when spawned
                this.is_hovering = false;
                this.hover_damping = 0.85; // Slow down when approaching target

                // 6 cannon positions for resume boss (scaled for 400x400)
                this.cannons = [
                    { x: -140, y: 60 },   // Left top
                    { x: -140, y: 180 },  // Left bottom
                    { x: 140, y: 60 },    // Right top
                    { x: 140, y: 180 },   // Right bottom
                    { x: 0, y: 90 },      // Center top
                    { x: 0, y: 150 }      // Center bottom
                ];

                // Boss fires more frequently
                this.laser_fire_control = new fire_control(12, 1500, 800);
                break;

            case 'interview':
                super(window_manager, x, y, 128, 128,
                    10,                   // mass - heavier than normal enemies
                    0,                    // rotation
                    6);                   // rotation speed

                this.set_image('ship_teams', 64, 1, 270); // Using teams ship as placeholder
                this.set_type("boss");
                this.set_max_life(500); // Much higher health
                this.set_center(64, 64);

                // More complex AI pattern
                let boss_action = [
                    { type: "bank_right", frames: 5 },
                    { type: "accelerate", frames: 10, speed: 3 },
                    { type: "bank_left", frames: 10 },
                    { type: "accelerate", frames: 10, speed: 3 },
                    { type: "bank_left", frames: 10 },
                    { type: "accelerate", frames: 10, speed: 3 },
                    { type: "bank_right", frames: 5 },
                    { type: "skip", frames: 5 }
                ];

                this.action_list = boss_action;
                this.bolt_type = "bolt2";
                this.projectiles = [];

                // Boss fires more frequently
                this.laser_fire_control = new fire_control(8, 2000, 1000);
                break;
        }

        this.rotation = 180;
        this.is_boss = true;
    }

    // Boss can fire weapons from multiple cannons
    fire_lazer() {
        if (this.laser_fire_control && this.laser_fire_control.can_fire()) {
            // If boss has cannons array, fire from all cannons
            if (this.cannons && this.cannons.length > 0) {
                for (let cannon of this.cannons) {
                    let cannonPos = this.get_relative_position(cannon.x, cannon.y);
                    var projectile = new Projectile(
                        this.window_manager,
                        this.position.x + cannonPos.x,
                        this.position.y + cannonPos.y,
                        this.rotation,
                        this.bolt_type
                    );
                    projectile.set_velocity(this.velocity);
                    projectile.accelerate(30);
                    this.projectiles.push(projectile);
                }
            } else {
                // Fallback to old 2-cannon system for interview boss
                let lazer1 = this.get_relative_position(-40, 35);
                var projectile1 = new Projectile(
                    this.window_manager,
                    this.position.x + lazer1.x,
                    this.position.y + lazer1.y,
                    this.rotation,
                    this.bolt_type
                );
                projectile1.set_velocity(this.velocity);
                projectile1.accelerate(30);
                this.projectiles.push(projectile1);

                let lazer2 = this.get_relative_position(+40, 35);
                var projectile2 = new Projectile(
                    this.window_manager,
                    this.position.x + lazer2.x,
                    this.position.y + lazer2.y,
                    this.rotation,
                    this.bolt_type
                );
                projectile2.set_velocity(this.velocity);
                projectile2.accelerate(30);
                this.projectiles.push(projectile2);
            }
        }
    }

    update_frame(deltaTime) {
        // Handle hover behavior - stop Y movement at target, allow X strafing
        if (this.hover_target_y !== null && !this.is_hovering) {
            // Check if boss has reached target Y position
            if (this.position.y >= this.hover_target_y) {
                this.is_hovering = true;
                this.velocity.y = 0;
                this.position.y = this.hover_target_y; // Lock Y to exact position
                console.log('[Boss] Reached hover position at', this.hover_target_y);
            } else {
                // Apply damping to Y velocity as we approach target
                const distance = this.hover_target_y - this.position.y;
                if (distance < 100) {
                    this.velocity.y *= this.hover_damping;
                }
            }
        }

        // If hovering, keep Y position locked but allow X movement
        if (this.is_hovering) {
            this.velocity.y = 0;
            this.position.y = this.hover_target_y;
        }

        super.update_frame(deltaTime);

        // Clamp boss to screen boundaries (prevent going off screen)
        const viewport = this.graphics.viewport.virtual;
        const marginX = this.width / 2; // Half boss width for center-based positioning
        const marginY = this.height / 2; // Half boss height for center-based positioning

        // Get current viewport Y boundaries in world coordinates
        const viewportTop = this.graphics.viewport.world.y;
        const viewportBottom = viewportTop + viewport.height;

        // Clamp X position (left/right boundaries)
        if (this.position.x < marginX) {
            this.position.x = marginX;
            this.velocity.x = 0; // Stop horizontal movement
        }
        if (this.position.x > viewport.width - marginX) {
            this.position.x = viewport.width - marginX;
            this.velocity.x = 0;
        }

        // Clamp Y position (top/bottom boundaries) - boss stays within viewport
        if (this.position.y < viewportTop + marginY) {
            this.position.y = viewportTop + marginY;
            this.velocity.y = 0;
        }
        if (this.position.y > viewportBottom - marginY) {
            this.position.y = viewportBottom - marginY;
            this.velocity.y = 0;
        }

        if (this.laser_fire_control) {
            this.laser_fire_control.update_frame();

            // Boss fires periodically (more frequently when hovering)
            const fireChance = this.is_hovering ? 0.08 : 0.05;
            if (Math.random() < fireChance) {
                this.fire_lazer();
            }
        }

        // Update projectiles
        const timestamp = Date.now();
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (timestamp - projectile.created > 5000) {
                this.projectiles.splice(i, 1);
            } else {
                projectile.update_frame(deltaTime);
            }
        }
    }

    render(window) {
        super.orient(window);

        // Custom render for boss - scale full source image to fit object size
        if (this.visible && this.image_source_width && this.image_source_height) {
            // Use FULL source image dimensions
            let src = new rect(0, 0, this.image_source_width, this.image_source_height);
            // Scale to object size (400x400)
            let dest = new rect(-this.center.x, -this.center.y, this.width, this.height);
            this.graphics.sprites.render(this.img, src, dest, 1, 'none');

            // Render health bar if recently damaged
            if (this.show_health_bar && this.max_life > 0) {
                this.render_health_bar();
            }

            // Render explosions
            for(let i = 0; i < this.explosions.length; i++){
                this.explosions[i].render();
            }
        } else {
            // Fallback to normal render for interview boss
            super.render();
        }

        super.de_orient();

        // Render boss projectiles
        for (let projectile of this.projectiles) {
            projectile.orient(window);
            projectile.render();
            projectile.de_orient();
        }
    }
}
class Enemy extends game_object {
    constructor(window_manager, x, y, type) {
        let speed = 2 + Math.random() * 3;

        switch (type) {
            case 'chatgpt':
                super(window_manager, x, y, 64, 64,
                    5,                    // mass (medium debris)
                    0,                    // rotation
                    12);                  // rotation speed
                this.set_image('ship_chatgpt');
                this.set_type("chatgpt");
                this.set_max_life(80);
                this.projectiles = [];
                this.bolt_type = "bolt2";

                let chatgpt_action = [
                    { type: "bank_left", frames: 2 },
                    { type: "accelerate", frames: 4, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "bank_right", frames: 4 },
                    { type: "accelerate", frames: 4, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "skip", frames: 3 }
                ];
                this.action_list = chatgpt_action;
                this.action_position.frame = parseInt(Math.random() * chatgpt_action.length);
                break;

            case 'resume':
                super(window_manager, x, y, 64, 64,
                    4,                    // mass (light debris)
                    0,                    // rotation
                    10);                  // rotation speed
                this.set_image('ship_resume');
                this.set_type("resume");
                this.set_max_life(60);
                this.projectiles = [];
                this.bolt_type = "bolt2";

                let resume_action = [
                    { frames: 2, type: "strafe_left", speed: speed },
                    { frames: 8, type: "accelerate", speed: speed },
                    { frames: 1, type: "lazer", speed: 5 },
                    { frames: 2, type: "strafe_right", speed: speed },
                    { frames: 8, type: "accelerate", speed: speed },
                    { frames: 1, type: "lazer", speed: 5 },
                    { frames: 5, type: "skip" }
                ];
                this.action_list = resume_action;
                this.action_position.frame = parseInt(Math.random() * resume_action.length);
                break;

            case 'application':
                super(window_manager, x, y, 64, 64,
                    6,                    // mass (medium debris)
                    0,                    // rotation
                    8);                   // rotation speed
                this.set_image('debris_phone'); // Placeholder
                this.set_type("application");
                this.set_max_life(100);

                let application_action = [
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "bank_left", frames: 3 },
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "bank_right", frames: 3 },
                    { type: "skip", frames: 4 }
                ];
                this.action_list = application_action;
                this.action_position.frame = parseInt(Math.random() * application_action.length);
                break;

            case 'linkedin':
                super(window_manager, x, y, 64, 64,
                    5,                    // mass (medium)
                    0,                    // rotation
                    10);                  // rotation speed
                this.set_image('ship_linkedin');
                this.set_type("linkedin");
                this.set_max_life(70);
                this.projectiles = [];
                this.bolt_type = "bolt2";

                let linkedin_action = [
                    { type: "bank_left", frames: 3 },
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "strafe_right", frames: 2, speed: speed },
                    { type: "accelerate", frames: 6, speed: speed },
                    { type: "lazer", frames: 1, speed: 5 },
                    { type: "bank_right", frames: 3 },
                    { type: "skip", frames: 4 }
                ];
                this.action_list = linkedin_action;
                this.action_position.frame = parseInt(Math.random() * linkedin_action.length);
                break;
        }

        this.rotation = 180;
    }

    fire_lazer() {
        if (!this.bolt_type || !this.projectiles) return;

        let lazer1 = this.get_relative_position(0, 60); // Fire from center-bottom of enemy ship
        var projectile = new Projectile(this.window_manager, this.position.x + lazer1.x, this.position.y + lazer1.y, this.rotation, this.bolt_type);
        projectile.set_velocity(this.velocity);
        projectile.accelerate(50);
        this.projectiles.push(projectile);
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);

        // Update and cleanup projectiles
        if (this.projectiles) {
            const timestamp = Date.now();
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const projectile = this.projectiles[i];
                if (timestamp - projectile.created > 5000) {
                    this.projectiles.splice(i, 1);
                } else {
                    projectile.update_frame(deltaTime);
                }
            }
        }
    }

    render(window) {
        super.orient(window);
        super.render();
        super.de_orient();

        // Render projectiles
        if (this.projectiles) {
            for (let projectile of this.projectiles) {
                projectile.orient(window);
                projectile.render();
                projectile.de_orient();
            }
        }
    }

    async executeAction(action) {
        super.executeAction(action);
        switch (action.type) {
            case 'lazer':
                this.fire_lazer();
                break;
        }
    }
}
class Mine extends game_object {
    constructor(window_manager, x, y, type) {
        switch (type) {
            case 'linkedin':
                super(window_manager, x, y, 128, 128,
                    8,                    // mass (heavy - hard to push)
                    0,                    // rotation
                    3);                   // rotation speed (slow menacing spin)

                this.set_image('ship_linkedin');
                this.set_type("mine");
                this.set_max_life(50); // Fragile - explodes easily
                this.set_center(64, 64);

                // Mine behavior - slow drift
                let mine_action = [
                    { type: "bank_left", frames: 20 },
                    { type: "bank_right", frames: 40 },
                    { type: "bank_left", frames: 20 },
                    { type: "skip", frames: 5 }
                ];
                this.action_list = mine_action;
                this.action_position.frame = parseInt(Math.random() * mine_action.length);

                // Proximity detection
                this.proximity_range = 150; // Explodes when player within 150 pixels
                this.armed = true;
                this.explosion_damage = 500; // Heavy damage when triggered
                break;
        }

        this.rotation = Math.random() * 360; // Random starting rotation
    }

    check_proximity(target) {
        if (!this.armed || !target) return false;

        // Calculate distance to target
        const dx = this.position.x - target.position.x;
        const dy = this.position.y - target.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.proximity_range;
    }

    trigger_explosion() {
        if (!this.armed) return;

        this.armed = false;

        // Create multiple explosions for mine detonation
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 10;  // Reduced from 30 to 10 for tighter explosion
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            let exp = new Explosion(this.window_manager,
                this.position.x + offsetX,
                this.position.y + offsetY);
            exp.set_sub();
            this.explosions.push(exp);
        }

        // Destroy the mine
        this.life = 0;
        this.destroy_object = true;

        console.log('[Mine] Detonated!');
    }

    update_frame(deltaTime) {
        super.update_frame(deltaTime);
    }
}
class Powerup extends game_object {
    constructor(window_manager, x, y, type) {
        super(window_manager, x, y, 48, 48,
            0.5,                  // light mass
            0,                    // rotation
            5);                   // rotation speed

        this.powerup_type = type;

        switch (type) {
            case 'health':
                this.set_image('static/debris/pdf.png'); // Green PDF icon for health
                this.set_type("powerup_health");
                this.heal_amount = 1000; // Restore more health
                break;

            case 'shield':
                this.set_image('static/debris/email.png'); // Blue email icon for shield
                this.set_type("powerup_shield");
                this.shield_duration = 5000; // 5 seconds of shield
                break;

            case 'weapon':
                this.set_image('static/debris/phone.png'); // Orange phone icon for weapon
                this.set_type("powerup_weapon");
                break;
        }

        this.set_center(24, 24);
        this.set_max_life(1); // Destroyed on pickup

        // Simple floating animation
        let float_action = [
            { type: "bank_left", frames: 2 },
            { type: "bank_right", frames: 4 },
            { type: "bank_left", frames: 2 },
            { type: "skip", frames: 2 }
        ];
        this.action_list = float_action;
        this.rotation = 180;

        // Powerups drift slowly downward
        this.velocity.y = 20;
    }

    apply_to_ship(ship) {
        switch (this.powerup_type) {
            case 'health':
                ship.life += this.heal_amount;
                if (ship.life > ship.max_life) {
                    ship.life = ship.max_life;
                }
                console.log(`Health restored! +${this.heal_amount} HP`);
                break;

            case 'shield':
                // Activate shield on ship
                if (!ship.shield_active) {
                    ship.activate_shield(this.shield_duration);
                    console.log(`Shield activated for ${this.shield_duration/1000} seconds!`);
                } else {
                    // Extend existing shield
                    ship.shield_end_time += this.shield_duration;
                    console.log(`Shield extended!`);
                }
                break;

            case 'weapon':
                // Reduce fire control cooldown temporarily
                if (ship.laser_fire_control) {
                    ship.laser_fire_control.temprature = 0;
                    ship.laser_fire_control.overheated = false;
                }
                if (ship.missile_fire_control) {
                    ship.missile_fire_control.temprature = 0;
                    ship.missile_fire_control.overheated = false;
                }
                console.log("Weapons cooled down!");
                break;
        }

        // Mark for destruction after pickup
        this.destroy();
    }
}
class fire_control {
    constructor(    temp_cycle=10,
                    over_heat = 2000, 
                    overheating_timeout = 2000,
                    ) {


        this.over_heat = over_heat;
        this.overheating_timeout = overheating_timeout;
        this.last_fired_time = 0;
        // flag
        this.overheated = false;
        this.overheated_cooldown_start=0;
   
        //internal
        this.max_rps=20;  // Increased from 10 to 20 - fire twice as fast
        this.rps_min=5;   // Increased minimum from 1 to 5
        this.rps=20;
        this.temprature=0;
        
        this.temp_cycle=temp_cycle;
        this.max_tempreture=100;
        this.is_firing=false;
        
    }

    can_fire() {
        if(this.overheated) return;
        const current_time = Date.now();
        const elapsed_time = current_time - this.last_fired_time;
        if (elapsed_time >= 1000/this.rps) {
            this.temprature+=this.temp_cycle;
            //if(this.temprature>this.)
            this.rps=this.max_rps*(1-(this.temprature/this.max_tempreture));
            if(this.rps<this.rps_min) this.rps=this.rps_min;
            if(this.temprature>this.max_tempreture) {
                this.temprature=this.max_tempreture;
                this.overheated=true;
                this.overheated_cooldown_start=0;
            }
            this.last_fired_time = current_time;
            this.is_firing=true;
            return true;
        } else {
            return false;
        }
    }

    update_frame(){
        
        const current_time = Date.now();
        if(this.overheated){
            if(this.overheated_cooldown_start!=0){
                if(current_time-this.overheated_cooldown_start>this.overheating_timeout){
                    this.overheated=false;
                    //this.overheated_cooldown_start=null;
                    this.rps=this.max_rps;
                } else {
                    
                    this.temprature-=5;
                    if(this.temprature<0) this.temprature=0;
                }
            } 
            return false;
        }
        if(this.is_firing==false) {
            this.temprature-=5;  // Increased from 2 to 5 - faster cooldown
            this.rps=(this.max_rps*this.get_cooldown_percentage())/100;
            if(this.temprature<0) this.temprature=0;
        }
    }

    get_cooldown_percentage(){
        return 100-(this.temprature/this.max_tempreture)*100;
    }

    timeout_percentage(){
        const current_time = Date.now();
        if(this.overheated){
            if(this.overheated_cooldown_start==0) return 100;
            return 100-((current_time-this.overheated_cooldown_start)/this.overheating_timeout)*100;
        }
        return 0;
    }

    stop_firing() {
        this.stopped_firing=Date.now();
        this.is_firing=false;

        
        if (this.overheated) {
            this.overheated_cooldown_start=Date.now();
        }
    }
}
class level extends events{
    constructor(window_manager){
        super();
        //this.level_url='https://aijobwars.com/static/levels/level.json';
        this.position = { x: 0, y: 0, width: 0, height: 0 }
        this.window_manager=window_manager;
        this.audio_manager=window_manager.audio_manager;
        this.npc = [];
        this.explosions = [];
        this.projectiles =[];
        this.data=null;
        this.spaceship =null;
        this.track_key=null; // Key for background music in audio_manager
        this.speed=null;
        this.rows=0;
        this.columns=0;
        this.master_volume=0.4;
    }

    volume(level){
        this.master_volume+=level/10;
        if(this.master_volume<0) {
            this.master_volume=0;
        }
        if(this.master_volume>1){
            this.master_volume=1;
        }
        this.audio_manager.set_master_volume(this.master_volume);
    }

    stop(){
        // Stop all music and sounds associated with this level
        if(this.track_key && this.audio_manager) {
            console.log('[Level] Stopping track:', this.track_key);
            this.audio_manager.stop(this.track_key);
        }
    }


    load(level) {
        fetch(level)
            .then(response => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Parse the response body as text
                return response.json();
            })
            .then(async level_data => {
                // Parse YAML data
                this.data = level_data;
                let bg = this.data['background'];
                let music_key = this.data['music'];
                this.background=(bg);

                // Resolve music path from ASSETS.json if it's a semantic key
                let music_path = music_key;
                if (this.window_manager.graphics.asset_loader) {
                    music_path = this.window_manager.graphics.asset_loader.get(music_key);
                }

                // Load background music with Web Audio API
                this.track_key = 'level_music';
                await this.audio_manager.add(this.track_key, music_path);

                this.speed = Number(this.data.speed);
                this.rows = Number(this.data.rows);
                this.columns = Number(this.data.columns);

                // Access level data


                for (let line = 0; line < this.rows; line++) {
                    var row = this.data.level[line];
                    for (let col = 0; col < this.columns + 2; col++) {
                        var c = row[col];
                        if (c == ' ') continue;
                        var block;
                        var x = col * 64;
                        var y = line * 64;
                        switch (c) {
                            case '.': block = new Derbis(this.window_manager,x, y, "block"); break;
                            case 't': block = new Ship(this.window_manager,x, y, "teams"); break;
                            case 'p': block = new Derbis(this.window_manager,x, y, "pdf"); break;
                            case 'e': block = new Derbis(this.window_manager,x, y, "email"); break;
                            case 'c': block = new Derbis(this.window_manager,x, y, "call"); break;
                            case 'w': block = new Derbis(this.window_manager,x, y, "webex"); break;
                            case 'l': block = new Derbis(this.window_manager,x, y, "linkedin"); break;
                            case 'z': block = new Derbis(this.window_manager,x, y, "zoom"); break;
                            case 'f': block = new Derbis(this.window_manager,x, y, "facebook"); break;
                            case 'r': block = new Derbis(this.window_manager,x, y, "reddit"); break;
                            case 'g': block = new Enemy(this.window_manager,x, y, "chatgpt"); break;
                            case 'R': block = new Enemy(this.window_manager,x, y, "resume"); break;
                            case 'L': block = new Enemy(this.window_manager,x, y, "linkedin"); break;
                            case 'a': block = new Enemy(this.window_manager,x, y, "application"); break;
                            case 'i': block = new Boss(this.window_manager,x, y, "interview"); break;
                            case 'h': block = new Powerup(this.window_manager,x, y, "health"); break;
                            case 's': block = new Powerup(this.window_manager,x, y, "shield"); break;
                            case 'W': block = new Powerup(this.window_manager,x, y, "weapon"); break;
                            case 'M': block = new Mine(this.window_manager,x, y, "linkedin"); break;
                            case 'P': this.spaceship = new Ship(this.window_manager,x,y, "user"); block=this.spaceship; break;
                        }
                        this.npc.push(block);


                    }

                }
                // Use virtual viewport dimensions for level positioning
                const virtual_height = this.window_manager.graphics.viewport.virtual.height;
                this.position.y = this.rows * 64 - virtual_height;
                this.position.x = 0;
                this.position.height = this.rows * 64;
                this.position.width = this.columns * 64;
                
                this.spaceship.set_max_life(5000);
                this.emit("loaded");
                // You can access other properties similarly
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        }
}class ui{
    constructor(ctx,game_object){
        this.ctx=ctx;
        this.G=game_object;
    }
    pause_game_mode(){
        this.G.pause_game=true;
    }
    unpause_game_mode(){
        this.G.pause_game=false;
    }

    boss_mode_on(){
        document.getElementById('game').style.display = 'none';
        document.getElementById('boss_mode').style.display = 'block';
        this.G.boss_mode_activated=true;
        this.pause_game_mode();

        // Pause background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.pause(this.G.level.track_key);
        }
    }
    boss_mode_off(){
        document.getElementById('game').style.display = 'block';
        document.getElementById('boss_mode').style.display = 'none';
        this.G.boss_mode_activated=false;
        this.unpause_game_mode();

        // Resume background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.resume(this.G.level.track_key);
        }
    }

    pause(){
        this.pause_game_mode();

        // Pause background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.pause(this.G.level.track_key);
        }

        // Create and show the pause modal
        let pause_modal = new pause();
        pause_modal.on('ok', () => {
            this.unpause();
        });
        this.G.window_manager.add(pause_modal);
    }

    unpause(){
        this.unpause_game_mode();

        // Resume background music
        const audio_manager = this.G.window_manager.audio_manager;
        if (this.G.level && this.G.level.track_key && audio_manager) {
            audio_manager.resume(this.G.level.track_key);
        }
    }

    toggle_sound(){
        const audio_manager = this.G.window_manager.audio_manager;

        if(audio_manager.playSounds) {
            // Turn sound OFF
            audio_manager.sound_off();
            // Stop background music
            if(this.G.level.track_key) {
                audio_manager.stop(this.G.level.track_key);
            }
        } else {
            // Turn sound ON
            audio_manager.sound_on();
            // Resume background music with looping enabled
            if(this.G.level.track_key) {
                audio_manager.play(this.G.level.track_key, 0, true);
            }
        }
    }


    // Not used right this second.. was part of the network websocket package
    updateChatWindow() {
        if(this.G.gameClient==null) return; //or some other default action
        const messages = this.G.gameClient.getChatMessages();
        this.G.chatWindow.innerHTML = messages.map(msg => {
            const colorStyle = `color: rgb(${msg.color.join(',')});`;
            return `<div><span style="${colorStyle}"><strong>${msg.player_name}</strong>:</span><span style="color:white"> ${msg.text}</span></div>`;
        }).join('');
        this.G.chatWindow.scrollTop = this.G.chatWindow.scrollHeight;
    }

    updatePlayerInfo() {
        if(this.G.gameClient==null) return; //or some other default action
        const profile = this.G.gameClient.getPlayerProfile();
        this.G.player = profile;
        if (profile) {
            this.G.playerNameElement.textContent = profile.name;
            this.G.playerAvatarElement.style.backgroundImage = "url(" + profile.avatar + ")";

        }
    }

    updatePlayerStatus() {
        // Get the player's spaceship object
        const spaceship = this.G.spaceship;

        // Update HTML elements with acceleration, velocity, and position
        document.getElementById('accelerationX').textContent = spaceship.acceleration.x.toFixed(2);
        document.getElementById('accelerationY').textContent = spaceship.acceleration.y.toFixed(2);
        document.getElementById('velocityX').textContent = spaceship.velocity.x.toFixed(2);
        document.getElementById('velocityY').textContent = spaceship.velocity.y.toFixed(2);
        document.getElementById('positionX').textContent = spaceship.position.x.toFixed(2);
        document.getElementById('positionY').textContent = spaceship.position.y.toFixed(2);
    }

   

}class scene {
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
        this.pending_audio = new Map(); // Track audio waiting to load: path -> true
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
        // Reset start time to seek position
        this.start_time = Date.now() - time_ms;
        this.manual_time_offset = time_ms;
        this.scene_ended = false;

        // Only prevent audio playback if actively dragging
        if (is_dragging) {
            // During drag: mute audio but don't stop it (prevents choppy audio)
            this.is_seeking = true;
        } else {
            // Seek complete: stop all audio and allow it to restart at new position
            this.stop_all_audio();
            this.currently_playing_audio.clear();
            this.pending_audio.clear(); // Clear pending audio on seek
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
            this.pending_audio.clear(); // Clear pending audio on pause
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
                if (!this.currently_playing_audio.has(audio_path) && !this.pending_audio.has(audio_path)) {
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
                            // Check if audio is ready to play
                            if (this.audio_manager.isReady(audio_path)) {
                                // Audio is ready, play immediately
                                this.currently_playing_audio.add(audio_path);
                                this.audio_manager.play(audio_path, offset_in_audio);
                            } else {
                                // Audio not ready yet, mark as pending and wait for it
                                this.pending_audio.set(audio_path, true);

                                // Wait for audio to load, then play
                                this.audio_manager.waitForAudio(audio_path).then(() => {
                                    // Only play if still should be playing and not paused/seeking
                                    if (this.pending_audio.has(audio_path) && !this.paused && !this.is_seeking) {
                                        // Recalculate offset based on current time
                                        let current_time_seconds = this.elapsed / 1000;
                                        let new_offset = current_time_seconds - matching_audio.timestamp;

                                        // Only play if we're still within the audio's duration window
                                        if (new_offset >= 0 && new_offset <= matching_audio.duration) {
                                            this.currently_playing_audio.add(audio_path);
                                            this.audio_manager.play(audio_path, new_offset);
                                        }
                                        this.pending_audio.delete(audio_path);
                                    } else {
                                        // No longer should be playing, just remove from pending
                                        this.pending_audio.delete(audio_path);
                                    }
                                }).catch((error) => {
                                    // Audio failed to load, remove from pending
                                    console.warn(`Failed to load audio ${audio_path}:`, error);
                                    this.pending_audio.delete(audio_path);
                                });
                            }
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
        this.pending_audio.clear(); // Clear pending audio on close
    }
}
class help extends modal{
    layout(){
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.closeButton=true;
        this.title="Help";
        let window_width=1024;
        let window_height=700;
        // Use virtual viewport dimensions for positioning (logical pixels)
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");


        this.text = "| Key           | Action                 |\n" +
            "|---------------|------------------------|\n" +
            "| Arrow Keys    | Bank left/right        |\n" +
            "|               | Accelerate/decelerate  |\n" +
            "| WASD          | Strafe movement        |\n" +
            "| Space         | Fire lasers            |\n" +
            "| Enter         | Fire Missiles          |\n" +
            "| Shift         | Boost                  |\n" +
            "| M             | Toggle Sound           |\n" +
            "| +             | Volume up              |\n" +
            "| -             | Volume down            |\n" +
            "| Escape        | Toggle Pause           |\n" +
            "| Tab           | Boss Mode (toggle)     |\n" +
            "| H             | Show this help         |\n";

            this.resize();
            this.add_buttons();
    }


}// Base class for modals that play cinematic scenes with seekbar and pause controls
class cinematic_player extends modal {

    setup_player(scene_url) {
        this.player = new scene(this.window_manager, scene_url);
        this.on("close", () => { if (this.player) this.player.close(); });
        this.player.on("complete", () => {
            // Scene finished, close the modal
            this.close();
        });
        this.render_callback(this.player.update_frame.bind(this.player));

        // Resume audio context on first user interaction (browser autoplay policy)
        this._resume_audio_once = async () => {
            if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
                await this.audio_manager.audioContext.resume();
                console.log('[CinematicPlayer] Audio context resumed on user interaction');
            }
        };
        // Call it once immediately when modal opens
        this._resume_audio_once();

        // Listen to modal's keyboard events
        this.on("keys", (data) => {
            this.handle_cinematic_keys(data.kb);
        });

        // Create horizontal scrollbar for video scrubbing - position will be recalculated on resize
        // Start with relative dimensions (will be properly positioned in resize)
        let scrollbar_position = new rect(10, 0, 100, 20, "left", "top");
        this.video_scrollbar = this.create_video_scrollbar(
            scrollbar_position,
            () => this.player ? this.player.get_progress() : {current: 0, max: 1},
            (time) => { if (this.player) this.player.seek_to(time, true); }
        );

        // Add video scrollbar to ui_components so it gets resized automatically
        this.ui_components.push(this.video_scrollbar);

        // Initial positioning
        this.position_video_scrollbar();

        // Add click handler for pause/play (use visible canvas)
        this._bound_click_handler = this.handle_click.bind(this);
        this.graphics.visibleCanvas.addEventListener('click', this._bound_click_handler);
    }

    create_video_scrollbar(position, get_progress_callback, seek_callback) {
        // Video scrollbar is positioned relative to the modal's internal rect (virtual coordinates)
        let anchor_position = new rect(0, 0, 0, 0);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);

        // Convert progress callback to return {current, max} format expected by scrollbar
        const get_value_callback = () => {
            const progress = get_progress_callback();
            if (!progress) return {current: 0, max: 1};
            return {current: progress.current, max: progress.total};
        };

        const scrollbar_instance = new scrollbar(this, this.graphics, position, anchor_position, "horizontal", get_value_callback, seek_callback);

        // Listen for drag_end event to finalize seek
        scrollbar_instance.on('drag_end', () => {
            if (this.player) {
                const progress = get_progress_callback();
                if (progress) {
                    this.player.seek_to(progress.current, false);  // false = drag complete, allow audio
                }
            }
        });

        return scrollbar_instance;
    }

    /**
     * Position video scrollbar at bottom of dialog, anchored to left and right edges
     * Called on initial setup and whenever the dialog resizes
     */
    position_video_scrollbar() {
        if (!this.video_scrollbar || !this.internal_rect) return;

        // Scale scrollbar thickness based on orientation (match vertical scrollbar scaling)
        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const scrollbar_height = 31 * fontScale;  // Same scaling as vertical scrollbar width

        // Anchor scrollbar to left and right edges with 10px margin, 30px from bottom
        const margin_x = 10;
        const margin_bottom = 30;

        // Update the video scrollbar's position rect
        if (this.video_scrollbar._legacy_position) {
            // Update legacy position directly
            this.video_scrollbar._legacy_position.x = margin_x;
            this.video_scrollbar._legacy_position.y = this.internal_rect.height - margin_bottom;
            this.video_scrollbar._legacy_position.width = this.internal_rect.width - (margin_x * 2);
            this.video_scrollbar._legacy_position.height = scrollbar_height;

            // Update the actual position rect
            this.video_scrollbar.position = this.video_scrollbar._legacy_position.clone();
        }
    }

    /**
     * Override resize to reposition video scrollbar when dialog resizes
     */
    resize() {
        super.resize();
        this.position_video_scrollbar();
    }

    handle_click(event) {
        if (!this.active || !this.player) return;

        // Transform mouse coordinates from physical to virtual space
        const viewport = this.graphics.viewport;
        const virtual_click_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
        const virtual_click_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

        // Check if click is inside the modal window (using virtual coordinates)
        if (virtual_click_x >= this.position.x &&
            virtual_click_x <= this.position.x + this.position.width &&
            virtual_click_y >= this.position.y &&
            virtual_click_y <= this.position.y + this.position.height) {

            // Don't toggle if clicking on the close button
            if (this.closeButton && this.buttons) {
                let clicking_button = false;
                this.buttons.forEach((button) => {
                    if (button.is_inside(event.offsetX, event.offsetY)) {
                        clicking_button = true;
                    }
                });

                // Don't toggle if clicking on video scrollbar (scrollbar handles transformation internally)
                if (this.video_scrollbar && this.video_scrollbar.active) {
                    // Check if clicking inside scrollbar bounds (use visible canvas coordinates)
                    const viewport = this.graphics.viewport;
                    const virtual_mouse_x = (event.offsetX - viewport.offset.x) / viewport.scale.x;
                    const virtual_mouse_y = (event.offsetY - viewport.offset.y) / viewport.scale.y;

                    let scrollbar_absolute_pos = this.video_scrollbar.position.clone();
                    if (this.video_scrollbar._legacy_anchor_position) {
                        scrollbar_absolute_pos.add(this.video_scrollbar._legacy_anchor_position);
                    }

                    if (virtual_mouse_x >= scrollbar_absolute_pos.x &&
                        virtual_mouse_x <= scrollbar_absolute_pos.x + scrollbar_absolute_pos.width &&
                        virtual_mouse_y >= scrollbar_absolute_pos.y &&
                        virtual_mouse_y <= scrollbar_absolute_pos.y + scrollbar_absolute_pos.height) {
                        clicking_button = true;
                    }
                }

                if (!clicking_button) {
                    this.player.toggle_pause();
                }
            } else {
                this.player.toggle_pause();
            }
        }
    }

    handle_cinematic_keys(kb) {
        if (!this.active || !this.player) return;

        // Space to pause/play
        if (kb.just_stopped(' ')) {
            this.player.toggle_pause();
        }

        // Left/Right arrows to seek
        if (kb.just_stopped('ArrowLeft')) {
            const new_time = Math.max(0, this.player.elapsed - 5000); // 5 seconds back
            this.player.seek_to(new_time, false);
        }
        if (kb.just_stopped('ArrowRight')) {
            const new_time = this.player.elapsed + 5000; // 5 seconds forward
            this.player.seek_to(new_time, false);
        }
    }

    render() {
        // Early exit if not active or graphics is deleted - BEFORE calling super
        if (!this.active || !this.graphics || !this.graphics.ctx) return;

        // Now safe to call super.render()
        super.render();

        // Render video scrollbar
        if (this.video_scrollbar) {
            this.video_scrollbar.render();
        }

        // Draw pause/play indicator in center of video area
        if (this.player && this.graphics && this.graphics.ctx) {
            const ctx = this.graphics.ctx;
            if (!ctx || typeof ctx.save !== 'function') return;

            const center_x = this.position.x + this.position.width / 2;
            const center_y = this.position.y + this.position.height / 2;
            const radius = 50;

            ctx.save();

            if (this.player.paused) {
                // Draw pause icon (two vertical bars)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                const bar_width = 12;
                const bar_height = 40;
                const bar_spacing = 10;
                ctx.fillRect(center_x - bar_spacing - bar_width, center_y - bar_height/2, bar_width, bar_height);
                ctx.fillRect(center_x + bar_spacing, center_y - bar_height/2, bar_width, bar_height);
            }

            ctx.restore();
        }
    }

    delete() {
        // Set inactive first to stop rendering
        this.active = false;

        // Clean up video scrollbar
        if (this.video_scrollbar) {
            this.video_scrollbar.delete();
            this.video_scrollbar = null;
        }

        // Clean up click handler (from visible canvas)
        if (this._bound_click_handler && this.graphics && this.graphics.visibleCanvas) {
            this.graphics.visibleCanvas.removeEventListener('click', this._bound_click_handler);
            this._bound_click_handler = null;
        }

        // Clean up player
        if (this.player) {
            this.player.close();
            this.player = null;
        }

        super.delete();
    }
}
class prologue extends cinematic_player {

    layout() {
        this.set_background("prologue");
        this.ok = false;
        this.cancel = false;
        this.closeButton = true;
        this.title = "Prologue";
        this.text = "";
        this.active = true;

        // Store landscape dimensions
        this.landscape_width = 1400;
        this.landscape_height = 800;

        // Calculate initial dimensions
        const dims = this.calculate_dialog_dimensions(this.landscape_width, this.landscape_height);
        this.position = new rect(dims.x, dims.y, dims.width, dims.height, "left", "top");
        this.resize();
        this.add_buttons();

        // Load intro scene from ASSETS.json
        const intro_scene_path = this.graphics.asset_loader.get('cinematics.intro.data');
        this.setup_player(intro_scene_path);
    }
}
class high_scores extends modal{
    layout(){
        this.set_background("highscore");
        this.active=true;
        this.ok=false;
        this.cancel=false;
        this.closeButton=true;
        this.title="High Scores";
        this.text="";

        // Store landscape dimensions
        this.landscape_width = 800;
        this.landscape_height = 600;

        // Calculate initial dimensions
        const dims = this.calculate_dialog_dimensions(this.landscape_width, this.landscape_height);
        this.position = new rect(dims.x, dims.y, dims.width, dims.height, "left", "top");
        this.resize();
        this.add_buttons();
        this.high_scores=null;
        this.scroll_offset=0;

        // Line height - doubled in portrait mode
        const isPortrait = this.graphics.viewport.isPortrait();
        this.line_height = isPortrait ? 80 : 40;

        // Load highscores from ASSETS.json
        const highscores_path = this.graphics.asset_loader.get('game_data.highscores');
        this.load_high_scores(highscores_path);
        this.render_callback(this.render_scores.bind(this));

        // Listen to modal's keyboard events
        this.on("keys", (data) => {
            this.handle_scroll_keys(data.kb);
        });

        // Mouse wheel scrolling (use visible canvas for events)
        this._bound_wheel_handler = this.handle_wheel.bind(this);
        this.visibleCanvas.addEventListener('wheel', this._bound_wheel_handler);

        // Create scrollbar component with proper anchoring (initially inactive, will be activated when needed)
        const fontScale = isPortrait ? 2 : 1;
        const scrollbar_width = 31 * fontScale;
        const header_height = 60 * fontScale;

        // Calculate absolute x position from right edge
        const scrollbar_x = this.internal_rect.width - scrollbar_width - (5 * fontScale);

        const scrollbar_pos = new rect(
            scrollbar_x,                          // Relative to internal_rect
            header_height,                        // Distance from TOP
            scrollbar_width,
            this.internal_rect.height - header_height,
            "left",
            "top"
        );

        // Create anchor position that includes both modal position and internal_rect
        let anchor_position = new rect(0, 0, 0, 0);
        anchor_position.add(this.position);
        anchor_position.add(this.internal_rect);

        this.scrollbar_component = new scrollbar(
            this, this.graphics, scrollbar_pos, anchor_position, "vertical",
            () => this.get_scroll_value(),
            (value) => this.set_scroll_value(value)
        );
        this.scrollbar_component.active = false;
    }

    get_scroll_value() {
        if (!this.high_scores) return { current: 0, max: 1 };

        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale;
        const scrollable_height = this.render_internal_rect.height - header_height;
        const max_scroll = Math.max(1, (this.high_scores.length * this.line_height) - scrollable_height);

        return { current: this.scroll_offset, max: max_scroll };
    }

    set_scroll_value(value) {
        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale;
        const scrollable_height = this.render_internal_rect.height - header_height;
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);

        this.scroll_offset = Math.max(0, Math.min(value, max_scroll));
    }

    async load_high_scores(jsonFileUrl){
        try {
                const response = await fetch(jsonFileUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.high_scores=data;
        } catch (error) {
            console.error("Error loading the JSON file:", error);
        }
     }

    handle_wheel(event) {
        if (!this.active || !this.high_scores) return;

        // Check if mouse is over the modal window (use visible canvas)
        const rect = this.visibleCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (mouseX >= this.render_internal_rect.x &&
            mouseX <= this.render_internal_rect.x + this.render_internal_rect.width &&
            mouseY >= this.render_internal_rect.y &&
            mouseY <= this.render_internal_rect.y + this.render_internal_rect.height) {

            event.preventDefault();

            // Scroll by wheel delta
            this.scroll_offset += event.deltaY * 0.5;

            // Clamp scroll offset - account for portrait mode
            const isPortrait = this.graphics.viewport.isPortrait();
            const fontScale = isPortrait ? 2 : 1;
            const header_height = 60 * fontScale;
            const scrollable_height = this.render_internal_rect.height - header_height;
            const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
            this.scroll_offset = Math.max(0, Math.min(this.scroll_offset, max_scroll));
        }
    }

    handle_scroll_keys(kb) {
        if (!this.active || !this.high_scores) return;

        // Arrow key scrolling
        if (kb.is_pressed('ArrowUp')) {
            this.scroll_offset -= 5;
        }
        if (kb.is_pressed('ArrowDown')) {
            this.scroll_offset += 5;
        }

        // Page up/down scrolling - account for portrait mode
        const isPortrait = this.graphics.viewport.isPortrait();
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale;
        const scrollable_height = this.render_internal_rect.height - header_height;

        if (kb.just_stopped('PageUp')) {
            this.scroll_offset -= scrollable_height;
        }
        if (kb.just_stopped('PageDown')) {
            this.scroll_offset += scrollable_height;
        }

        // Home/End
        if (kb.just_stopped('Home')) {
            this.scroll_offset = 0;
        }
        if (kb.just_stopped('End')) {
            const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
            this.scroll_offset = max_scroll;
        }

        // Clamp scroll offset
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);
        this.scroll_offset = Math.max(0, Math.min(this.scroll_offset, max_scroll));
    }

    render_scores(position) {
        if (!this.high_scores) {
            // Show loading text
            let loading_pos = new rect(position.x + position.width/2, position.y + position.height/2, null, null, "center", "center");
            this.graphics.font.draw_text(loading_pos, "Loading...", true, false);
            return;
        }

        const ctx = this.graphics.ctx;
        const isPortrait = this.graphics.viewport.isPortrait();

        // Double sizes in portrait mode
        const fontScale = isPortrait ? 2 : 1;
        const header_height = 60 * fontScale; // Height reserved for header
        const start_y = position.y + (70 * fontScale) - this.scroll_offset;
        const header_y = position.y + (40 * fontScale);

        // Draw column headers (fixed at top)
        ctx.save();
        ctx.fillStyle = '#00FFFF';
        ctx.font = `bold ${18 * fontScale}px monospace`;

        const rank_x = position.x + (20 * fontScale);
        const name_x = position.x + (100 * fontScale);
        const score_x = position.x + position.width - (150 * fontScale);

        ctx.fillText("Rank", rank_x, header_y);
        ctx.fillText("Name", name_x, header_y);
        ctx.fillText("Score", score_x, header_y);

        // Draw separator line
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2 * fontScale;
        ctx.beginPath();
        ctx.moveTo(position.x + (10 * fontScale), header_y + (10 * fontScale));
        ctx.lineTo(position.x + position.width - (10 * fontScale), header_y + (10 * fontScale));
        ctx.stroke();

        // Draw scores (clip to scrollable area below header)
        ctx.font = `${16 * fontScale}px monospace`;
        for (let i = 0; i < this.high_scores.length; i++) {
            const score = this.high_scores[i];
            const y = start_y + (i * this.line_height);

            // Skip if outside visible area (below header and above bottom)
            if (y < position.y + header_height || y > position.y + position.height) {
                continue;
            }

            // Highlight current player (if name matches)
            if (score.name === "Chris Watkins") {
                ctx.fillStyle = '#FFFF00';
            } else {
                // Gradient colors based on rank
                if (score.rank === 1) ctx.fillStyle = '#FFD700'; // Gold
                else if (score.rank === 2) ctx.fillStyle = '#C0C0C0'; // Silver
                else if (score.rank === 3) ctx.fillStyle = '#CD7F32'; // Bronze
                else ctx.fillStyle = '#00FF00'; // Green
            }

            ctx.fillText(score.rank.toString(), rank_x, y);
            ctx.fillText(score.name, name_x, y);
            ctx.fillText(score.score.toLocaleString(), score_x, y);
        }

        ctx.restore();

        // Update scrollbar component state
        const scrollable_height = position.height - header_height;
        const max_scroll = Math.max(0, (this.high_scores.length * this.line_height) - scrollable_height);

        if (max_scroll > 0) {
            // Activate and render scrollbar
            this.scrollbar_component.active = true;
            this.scrollbar_component.render();
        } else {
            // No scrolling needed, deactivate scrollbar
            this.scrollbar_component.active = false;
        }
    }


    delete() {
        // Remove wheel event listener (from visible canvas)
        if (this._bound_wheel_handler) {
            this.visibleCanvas.removeEventListener('wheel', this._bound_wheel_handler);
        }

        // Clean up scrollbar component
        if (this.scrollbar_component) {
            this.scrollbar_component.delete();
            this.scrollbar_component = null;
        }

        super.delete();
    }
}
class credits extends cinematic_player {

    layout() {
        this.set_background("credits");
        this.active = true;
        this.ok = false;
        this.cancel = false;
        this.closeButton = true;
        this.title = "Credits";
        this.text = "";

        // Store landscape dimensions
        this.landscape_width = 1400;
        this.landscape_height = 800;

        // Calculate initial dimensions
        const dims = this.calculate_dialog_dimensions(this.landscape_width, this.landscape_height);
        this.position = new rect(dims.x, dims.y, dims.width, dims.height, "left", "top");
        this.resize();
        this.add_buttons();

        // Load credits scene from ASSETS.json
        const credits_scene_path = this.graphics.asset_loader.get('cinematics.credits.data');
        this.setup_player(credits_scene_path);
    }
}
class menu extends modal{
    constructor(){
        super();

        // Store button data for resize recalculation
        this.menu_buttons = [];
        this.title_image = null;  // Reference to title graphic
        this.glow_phase = 0;  // For pulsing glow animation
    }

    layout(){
        //window specifics
        this.set_background("menu");
        this.ok=false;
        this.cancel=false;
        this.closeButton=false;  // No close button for main menu
        this.no_close=true;  // Prevent ESC from closing main menu
        this.title="Menu";
        this.text="";
        this.active=true;

        // Use virtual viewport dimensions (logical pixels, not physical)
        let vw = this.graphics.viewport.virtual.width;
        let vh = this.graphics.viewport.virtual.height;

        // Calculate menu position based on orientation
        const isPortrait = this.graphics.viewport.isPortrait();

        // Add title image at top of screen
        this.setup_title_image();

        // Get title bottom position (where menu should start)
        const titleBottom = this.get_title_bottom();
        const menuTopPadding = 20;
        const menuTop = titleBottom + menuTopPadding;

        if (isPortrait) {
            // Portrait: Use minimum height, centered between title and bottom
            const marginX = 20;
            const marginBottom = 20;
            const window_width = vw - (marginX * 2);

            // Calculate minimum height based on button layout
            // Top buttons: y=30 + 3 buttons with 80px spacing = 270
            // Last regular button height = 60, ends at 330
            // Gap before Exit button = 60
            // Exit button height = 60
            // Bottom margin for Exit = 20
            // Extra padding = 20
            const baseHeight = 30 + (3 * 80) + 60 + 60 + 60 + 20 + 20; // = 490px
            const minMenuHeight = baseHeight * 1.2; // 20% larger = 588px

            // Calculate available space and center the menu
            const availableHeight = vh - menuTop - marginBottom;
            const menuHeight = Math.max(minMenuHeight, Math.min(minMenuHeight, availableHeight));

            // Center vertically in available space
            const centeredY = menuTop + (availableHeight - menuHeight) / 2;
            const x = marginX;

            this.position = new rect(x, centeredY, window_width, menuHeight, "left", "top");
        } else {
            // Landscape: Fixed width, left-anchored at 60px, extends to 90% of screen height
            let window_width = 400;
            let x = 60;  // Left-anchored at 60 pixels
            const menuBottom = vh * 0.90;
            const menuHeight = menuBottom - menuTop;
            this.position = new rect(x, menuTop, window_width, menuHeight, "left", "top");
        }

        this.resize();
        this.add_buttons();

        // Listen to modal's keyboard events for help
        this.on("keys", (data) => {
            if (data.kb.just_stopped('h') || data.kb.just_stopped('H')) {
                this.show_help();
            }
        });

        //layout options - keep gradient for visual effect
        this.add_bg_gradient(0, 'rgba(0,0,0,0.3)');
        this.add_bg_gradient(.7, 'rgba(211,211,211,0.2)');
        this.add_bg_gradient(.8, 'rgba(169,169,169,0.2)');
        this.add_bg_gradient(1, 'rgba(0,0,0,0.3)');

        // Create buttons with viewport-relative positions
        this.create_menu_buttons();
    }

    setup_title_image() {
        const vw = this.graphics.viewport.virtual.width;

        // Calculate title dimensions
        let title_width = Math.min(1024, vw * 0.6);
        let title_height = title_width * (236 / 1024);  // Maintain aspect ratio
        let title_x = vw / 2 - title_width / 2;
        let title_y = 10;

        this.title_image = this.add_image(new rect(title_x, title_y, title_width, title_height, "left", "top"), "title");
    }

    get_title_bottom() {
        if (!this.title_image) return 210;  // Default

        const title_bottom = this.title_image.position.y + this.title_image.position.height;
        return title_bottom + 20;  // Add small padding
    }

    recalculate_title() {
        if (!this.title_image || !this.title_image.position) return;

        const vw = this.graphics.viewport.virtual.width;

        // Recalculate title image position - centered
        const margin = 40;
        const maxWidth = vw - (margin * 2);
        let title_width = Math.min(1024, vw * 0.6, maxWidth);
        let title_height = title_width * (236 / 1024);
        let title_x = vw / 2 - title_width / 2;

        // Set absolute positions
        this.title_image.position.x = title_x;
        this.title_image.position.y = 10;
        this.title_image.position.width = title_width;
        this.title_image.position.height = title_height;
    }

    render() {
        if (!this.active) return;

        // Call parent render first (draws dialog background, buttons, etc.)
        super.render();

        // Render title with glow
        if (this.title_image) {
            this.render_title_with_glow(this.title_image);
        }

        // Render tagline below title (only in landscape mode)
        const isPortrait = this.graphics.viewport.isPortrait();
        if (!isPortrait) {
            this.render_tagline();
        }
    }

    render_title_with_glow(image) {
        if (!this.graphics || !this.graphics.ctx) return;

        const ctx = this.graphics.ctx;

        // Update glow animation phase
        this.glow_phase += 0.05;

        // Calculate pulse (oscillates between 20 and 40 for shadow blur)
        const pulse = 25 + Math.sin(this.glow_phase) * 15;

        ctx.save();

        // Draw the title multiple times with increasing glow for stronger effect
        // Layer 1: Strongest glow (underneath)
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = pulse * 2;
        let image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        // Layer 2: Medium glow
        ctx.shadowColor = 'rgba(0, 230, 255, 0.6)';
        ctx.shadowBlur = pulse * 1.5;
        image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        // Layer 3: Soft glow
        ctx.shadowColor = 'rgba(0, 200, 255, 0.4)';
        ctx.shadowBlur = pulse;
        image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        // Final layer: No shadow (crisp title on top)
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        image_pos = image.position.clone();
        this.graphics.sprites.render(image.key, null, image_pos, 1, "contain");

        ctx.restore();

        // Extra cleanup to ensure no shadow state leaks
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    render_tagline() {
        if (!this.graphics || !this.graphics.ctx) return;
        if (!this.title_image) return;

        const ctx = this.graphics.ctx;
        const vw = this.graphics.viewport.virtual.width;

        // Calculate position below title
        const title_bottom = this.title_image.position.y + this.title_image.position.height;

        ctx.save();
        ctx.textAlign = 'center';

        const mainText = 'The Battle for Humanity\'s Jobs Has Begun.';
        const subText1 = 'Command your ship. Defend the last human workforce.';
        const subText2 = 'Destroy the machine overlords before they automate everything.';

        // Landscape: fit in space to the right of menu
        const menuRightEdge = 60 + 400;  // menu x + menu width
        const marginFromMenu = 40;
        const marginFromScreenEdge = 20;
        const availableWidth = vw - menuRightEdge - marginFromMenu - marginFromScreenEdge;

        // Start with default sizes and scale down if needed
        let mainFontSize = 32;
        let subFontSize = 18;

        // Measure text with current font sizes
        ctx.font = `bold ${mainFontSize}px monospace`;
        let maxWidth = ctx.measureText(mainText).width;
        ctx.font = `${subFontSize}px monospace`;
        maxWidth = Math.max(maxWidth, ctx.measureText(subText1).width, ctx.measureText(subText2).width);

        const boxPadding = 20;
        const neededWidth = maxWidth + boxPadding * 2;

        // Scale down fonts if text doesn't fit
        if (neededWidth > availableWidth) {
            const scale = availableWidth / neededWidth;
            mainFontSize = Math.max(16, Math.floor(mainFontSize * scale));
            subFontSize = Math.max(12, Math.floor(subFontSize * scale));

            // Recalculate width with new font sizes
            ctx.font = `bold ${mainFontSize}px monospace`;
            maxWidth = ctx.measureText(mainText).width;
            ctx.font = `${subFontSize}px monospace`;
            maxWidth = Math.max(maxWidth, ctx.measureText(subText1).width, ctx.measureText(subText2).width);
        }

        const boxWidth = Math.min(maxWidth + boxPadding * 2, availableWidth);
        const boxHeight = 125;
        const boxX = menuRightEdge + marginFromMenu;
        const textCenterX = boxX + boxWidth / 2;
        const boxY = title_bottom + 20;

        // Draw semi-transparent background box for all text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Optional: Add border for more definition
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw main text with glow
        ctx.font = `bold ${mainFontSize}px monospace`;
        ctx.fillStyle = '#FF6B00';
        ctx.shadowColor = 'rgba(255, 107, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillText(mainText, textCenterX, boxY + 35);

        // Clear shadow for subtext
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Subtext lines - smaller, cyan colored
        ctx.fillStyle = '#00FFFF';
        ctx.font = `${subFontSize}px monospace`;
        ctx.fillText(subText1, textCenterX, boxY + 65);
        ctx.fillText(subText2, textCenterX, boxY + 90);

        ctx.restore();
    }

    show_help() {
        let modal = new help();
        this.window_manager.add(modal);
    }

    create_menu_buttons() {
        // Clear existing menu buttons
        this.menu_buttons = [];

        const isPortrait = this.graphics.viewport.isPortrait();

        // Button sizing - use base dimensions (canvas transformation handles UI scale)
        const button_margin_x = 20;  // Margin from dialog edges
        const button_width = this.internal_rect.width - (button_margin_x * 2);
        const button_height = 60;  // Base height
        const button_spacing = 80;  // Base spacing

        let y = 30;

        // Store button definitions
        this.menu_buttons = [
            { label: "New Game", callback: this.new_game, y_offset: y, style: "cyan" },
            { label: "Prologue", callback: this.story, y_offset: y + button_spacing, style: "cyan" },
            { label: "High Scores", callback: this.high_scoress, y_offset: y + button_spacing * 2, style: "cyan" },
            { label: "Credits", callback: this.credits, y_offset: y + button_spacing * 3, style: "cyan" },
            { label: "Exit", callback: this.exit, y_offset: this.internal_rect.height - (button_height + 20), style: "red" }
        ];

        // Create actual button instances
        for (let btn_def of this.menu_buttons) {
            let button_position = new rect(button_margin_x, btn_def.y_offset, button_width, button_height, "left", "top");
            let up_img = btn_def.style === "cyan" ? "button-up-cyan" : "button-up-red";
            let down_img = btn_def.style === "cyan" ? "button-down-cyan" : "button-down-red";
            btn_def.button = this.add_button(btn_def.label, button_position, btn_def.callback, up_img, down_img);
            btn_def.position = button_position;
        }
    }

    update_dimensions_for_orientation() {
        // Just call resize() - it handles everything including button recreation
        this.resize();
    }

    recreate_buttons() {
        // Delete old buttons
        if (this.buttons) {
            this.buttons.forEach((button) => {
                if (button.delete) button.delete();
            });
        }
        this.buttons = [];

        // Recreate with new sizing
        this.create_menu_buttons();
    }

    resize() {
        // Recalculate menu position based on new viewport and orientation
        if (this.graphics && this.graphics.viewport) {
            let vw = this.graphics.viewport.virtual.width;
            let vh = this.graphics.viewport.virtual.height;
            const isPortrait = this.graphics.viewport.isPortrait();

            // Recalculate title position
            this.recalculate_title();

            // Get title bottom position (where menu should start)
            const titleBottom = this.get_title_bottom();
            const menuTopPadding = 20;
            const menuTop = titleBottom + menuTopPadding;

            if (isPortrait) {
                // Portrait: Use minimum height, centered between title and bottom
                const marginX = 20;
                const marginBottom = 20;
                const window_width = vw - (marginX * 2);

                // Calculate minimum height based on button layout
                // Top buttons: y=30 + 3 buttons with 80px spacing = 270
                // Last regular button height = 60, ends at 330
                // Gap before Exit button = 60
                // Exit button height = 60
                // Bottom margin for Exit = 20
                // Extra padding = 20
                const baseHeight = 30 + (3 * 80) + 60 + 60 + 60 + 20 + 20; // = 490px
                const minMenuHeight = baseHeight * 1.2; // 20% larger = 588px

                // Calculate available space and center the menu
                const availableHeight = vh - menuTop - marginBottom;
                const menuHeight = Math.max(minMenuHeight, Math.min(minMenuHeight, availableHeight));

                // Center vertically in available space
                const centeredY = menuTop + (availableHeight - menuHeight) / 2;
                const x = marginX;

                this.position.x = x;
                this.position.y = centeredY;
                this.position.width = window_width;
                this.position.height = menuHeight;
            } else {
                // Landscape: Fixed width, left-anchored at 60px, extends to 90% of screen height
                let window_width = 400;
                let x = 60;
                const menuBottom = vh * 0.90;
                const menuHeight = menuBottom - menuTop;

                this.position.x = x;
                this.position.y = menuTop;
                this.position.width = window_width;
                this.position.height = menuHeight;
            }
        }

        // Call parent resize to update internal_rect FIRST
        super.resize();

        // Recreate buttons to match new dialog width
        this.recreate_buttons();
    }


    exit(event ){
        alert("I can't realy close the window...\n But I'd like to!\n Thanks for playin\n -Chris");
    }

    async credits(event) {
        // Resume audio context on user interaction (browser autoplay policy)
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        let modal=new credits();
        this.window_manager.add(modal)
    }

    high_scoress(event) {
        let modal=new high_scores();
        this.window_manager.add(modal)
    }

    async story(event) {
        // Resume audio context on user interaction (browser autoplay policy)
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        let modal=new prologue();
        this.window_manager.add(modal)
    }

    new_game(){
        let modal=new game();
        this.window_manager.add(modal)
    }


}class pause extends modal{
    layout(){
        this.active=true;
        this.ok=true;
        this.cancel=false;
        this.closeButton=true;
        this.title="Paused";
        this.text="";
        let window_width=800;
        let window_height=600;

        // Use virtual viewport dimensions for positioning (logical pixels)
        let x=(this.graphics.viewport.virtual.width-window_width)/2;
        let y=(this.graphics.viewport.virtual.height-window_height)/2;
        this.position = new rect(x, y, window_width,window_height,"left","top");
        this.resize();
        this.add_buttons();
    }

}class game extends modal{
    layout(){
        this.active=true;
        this.ok=false
        this.cancel=false
        this.closeButton=true;
        this.no_close=true;  // Prevent default ESC close - we handle it custom with pause
        this.title="Level - 1";
        this.text="";

        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.boss_mode_activated = false;
        this.pause_game = false;

        // Death animation tracking
        this.player_dying = false;
        this.death_started_time = 0;
        this.death_explosion_duration = 2000; // 2 seconds for explosion to finish

        // Score tracking
        this.score = 0;
        this.kills = 0;

        // Boss spawn tracking
        this.boss_spawned = false;
        this.boss_spawn_threshold = 500; // Spawn boss when this close to level end
        this.active_boss = null;

        // Win condition
        this.player_won = false;

        // Test mode - set to true to start near end of level
        this.test_mode = false;

        this.ui = new ui(this.ctx, this);
        this.level = new level(this.window_manager);

        // Load level from ASSETS.json
        const level_path = this.graphics.asset_loader.get('levels.level_data');
        this.level.load(level_path);
        this.level.on("loaded",this.start_level.bind(this));

        // Create HUD bars as children of this modal
        // Just specify their RELATIVE position - parent will handle absolute positioning
        this.laser_bar   = new percentage_bar_fluid(this, this.graphics, new rect(10, 10+1*50, 200, 40), "bar", "bar-red-fluid");
        this.missile_bar = new percentage_bar_fluid(this, this.graphics, new rect(30, 10+2*50, 200, 40), "bar", "bar-orange-fluid");
        this.booster_bar = new percentage_bar_fluid(this, this.graphics, new rect(30, 10+3*50, 200, 40), "bar", "bar-blue-fluid");
        this.shield_bar  = new percentage_bar_fluid(this, this.graphics, new rect(10, 10+4*50, 200, 40), "bar", "bar-blue-fluid");
        this.health_bar  = new percentage_bar_fluid(this, this.graphics, new rect(10, 10+5*50, 200, 40), "bar", "bar-green-fluid");

        // Add bars to parent's ui_components array for automatic management
        this.ui_components.push(this.laser_bar, this.missile_bar, this.booster_bar, this.shield_bar, this.health_bar);

        // NOW call resize and add_buttons AFTER components are created
        this.resize();
        this.add_buttons();
        this.no_skin();

        // Listen to modal's keyboard events
        this.on("keys", (data) => {
            this.handle_game_keys(data.kb);
        });

        // Override ESC key to pause instead of close
        this.on("escape", (event) => {
            event.defaultPrevented = true;  // Prevent modal from closing
            this.handle_escape();
        });

        this.render_callback(this.updateFrame.bind(this));

    }

    resize(){
        // Use virtual viewport dimensions (logical pixels, not physical)
        let x = 0;
        let y = 0;
        let window_width = this.graphics.viewport.virtual.width;
        let window_height = this.graphics.viewport.virtual.height;
        this.position = new rect(x, y, window_width, window_height, "left", "top");

        // Game window has no_skin(), so internal_rect equals position (no padding)
        this.internal_rect = new rect(0, 0, this.position.width, this.position.height, "left", "top");

        // Create render positions
        this.render_position = this.position.clone();
        this.render_internal_rect = this.internal_rect.clone();

        // Add positions together (in this case, both are at 0,0 so it doesn't change anything)
        this.render_internal_rect.add(this.render_position);

        // Resize all ui_components with game window position as anchor (no padding)
        for (let i = 0; i < this.ui_components.length; i++) {
            if (this.ui_components[i].resize) {
                this.ui_components[i].resize(this.render_position);
            }
        }

        // Resize close button if it exists
        if (this.closeButton && typeof this.closeButton.resize === 'function') {
            this.closeButton.resize(this.render_position);
        }
    }

    render() {
        // Call parent render first (renders game content via updateFrame callback)
        super.render();

        // NOW draw the border on top of everything
        this.draw_viewport_border();
    }







    check_mine_proximity() {
        if (!this.level.spaceship) return;

        // Check all mines for proximity to player
        for (let i = 0; i < this.level.npc.length; i++) {
            const npc = this.level.npc[i];
            if (npc.type !== "mine") continue;
            if (!npc.armed) continue;

            // Check if player is in proximity range
            if (npc.check_proximity(this.level.spaceship)) {
                console.log('[Game] Mine proximity triggered!');

                // Damage player based on mine's explosion damage
                const dx = this.level.spaceship.position.x - npc.position.x;
                const dy = this.level.spaceship.position.y - npc.position.y;
                this.level.spaceship.damage(npc.explosion_damage, dx, dy);

                // Trigger mine explosion
                npc.trigger_explosion();
            }
        }
    }

    check_collisions() {
        let collisions = [];
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        };

        // Check spaceship against all NPCs
        if (this.level.spaceship) {
            for (let i = 0; i < this.level.npc.length; i++) {
                const npc = this.level.npc[i];
                // Skip checking collision with itself
                if (npc === this.level.spaceship) continue;
                if (npc.position.y < window.y1 || npc.position.y > window.y2) continue;
                if (this.level.spaceship.check_collision(npc)) {
                    collisions.push({
                        obj1: this.level.spaceship,
                        obj2: npc,
                        type: 'ship_npc'
                    });
                }
            }

            // Check spaceship projectiles against NPCs
            if (this.level.spaceship.projectiles.length > 0 && Math.random() < 0.1) {
                console.log('[Game] Checking', this.level.spaceship.projectiles.length, 'projectiles against', this.level.npc.length, 'NPCs');
            }
            for (let p = 0; p < this.level.spaceship.projectiles.length; p++) {
                const projectile = this.level.spaceship.projectiles[p];
                for (let i = 0; i < this.level.npc.length; i++) {
                    const npc = this.level.npc[i];
                    // Skip checking collision with player's own ship
                    if (npc === this.level.spaceship) continue;
                    if (npc.position.y < window.y1 || npc.position.y > window.y2) continue;
                    if (projectile.check_collision(npc)) {
                        collisions.push({
                            obj1: projectile,
                            obj2: npc,
                            type: 'projectile_npc'
                        });
                    }
                }
            }
        }

        // Check NPC projectiles against spaceship (including boss projectiles)
        for (let i = 0; i < this.level.npc.length; i++) {
            const npc = this.level.npc[i];
            if (npc.type !== "ship" && npc.type !== "boss") continue;
            if (!npc.projectiles) continue;

            for (let p = 0; p < npc.projectiles.length; p++) {
                const projectile = npc.projectiles[p];
                if (this.level.spaceship && projectile.check_collision(this.level.spaceship)) {
                    collisions.push({
                        obj1: projectile,
                        obj2: this.level.spaceship,
                        type: 'enemy_projectile_ship'
                    });
                }
            }
        }

        // Handle all collisions
        this.handle_collisions(collisions);
    }

    handle_collisions(collisions) {
        for (let collision of collisions) {
            const {obj1, obj2, type} = collision;

            switch(type) {
                case 'ship_npc':
                    // Check if it's a powerup
                    if (obj2.type && obj2.type.startsWith('powerup_')) {
                        obj2.apply_to_ship(obj1);
                    } else {
                        // Player ship hit an NPC enemy/debris
                        // Apply physics-based collision response (bounce)
                        obj1.impact2(obj2);

                        // Calculate impact position relative to each object's center
                        const impactX = obj2.position.x - obj1.position.x;
                        const impactY = obj2.position.y - obj1.position.y;
                        obj1.damage(50, impactX, impactY);  // Reduced collision damage - ~40 collisions to kill with shields
                        obj2.damage(50);
                        obj1.explosion(impactX, impactY);  // Explosion at impact point on ship
                        obj2.explosion(-impactX, -impactY);  // Explosion at impact point on NPC
                    }
                    break;

                case 'projectile_npc':
                    // Don't destroy powerups with projectiles, just pass through
                    if (obj2.type && obj2.type.startsWith('powerup_')) {
                        break;
                    }
                    // Player projectile hit NPC
                    console.log('[Game] Player projectile HIT:', obj2.type, 'Life:', obj2.life, '→', obj2.life - 25);
                    const projImpactX = obj1.position.x - obj2.position.x;
                    const projImpactY = obj1.position.y - obj2.position.y;
                    obj1.destroy();
                    obj2.damage(25);
                    obj2.explosion(projImpactX, projImpactY);  // Explosion at projectile impact point

                    // Award score and check for kill
                    this.score += 10;
                    if (obj2.life <= 0) {
                        this.kills++;
                        // Bonus points for destroying enemy
                        if (obj2.type === "boss") {
                            this.score += 500;
                        } else if (obj2.type === "ship") {
                            this.score += 100;
                        } else {
                            this.score += 25;
                        }
                    }
                    break;

                case 'enemy_projectile_ship':
                    // Enemy projectile hit player
                    // Projectiles don't bounce - they hit or fly past
                    // (removed impact2 bounce)

                    // Calculate impact position relative to ship center
                    const enemyImpactX = obj1.position.x - obj2.position.x;
                    const enemyImpactY = obj1.position.y - obj2.position.y;
                    obj1.destroy();
                    obj2.damage(250, enemyImpactX, enemyImpactY);  // Increased damage - should take ~20 hits to kill
                    obj2.explosion(enemyImpactX, enemyImpactY);  // Explosion at enemy projectile impact point
                    break;
            }
        }
    }


    updateFrame() {
        // Calculate deltaTime (time since last frame)
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // window_manager already applies viewport transform, so we work in virtual coordinates
        const viewport = this.graphics.viewport;

        // Modal already handles clipping, so we don't need to save/restore here
        // Removing ctx.save() and ctx.restore() to preserve viewport transform

        // Render scrolling background before everything else
        this.render_background();

        // Skip updates if game is paused (but continue rendering)
        if (this.pause_game) {
            // Still render the game state, just don't update it
            let window = {
                y1: this.level.position.y,
                y2: this.level.position.y + this.graphics.viewport.virtual.height
            };

            // Render NPCs
            for (let b = 0; b < this.level.npc.length; b++) {
                let npc = this.level.npc[b];
                if (npc.position.y > window.y1 - 50 && npc.position.y < window.y2) {
                    if (npc.type == "ship" || npc.type == "boss") {
                        npc.render({ x: 0, y: window.y1 });
                    } else {
                        npc.orient({ x: 0, y: window.y1 });
                        npc.render();
                        npc.de_orient();
                    }
                }
            }

            // Render score
            this.render_score();

            // Draw game over overlay if player is dead or won
            if ((this.level.spaceship && this.level.spaceship.life <= 0) || this.player_won) {
                this.draw_game_over_overlay();
            }

            // No need to restore - modal handles it
            return;
        }

        // Clear any previous drawings
        //this.graphics.updateCanvasSizeAndDrawImage(this.level.position);

        // Only scroll level if not at end
        if (this.level.position.y > 0) {
            this.level.position.y -= this.level.speed;
        }

        // Boss spawn logic - spawn boss when nearing end of level
        if (!this.boss_spawned && this.level.position.y <= this.boss_spawn_threshold && this.level.position.y > 0) {
            this.spawn_boss();
            this.boss_spawned = true;
        }

        // Clamp level position at end but keep level_start true so controls still work
        if (this.level.position.y <= 0) {
            this.level.position.y = 0; // Clamp at 0
        }


        this.graphics.viewport.world.y = this.level.position.y;
        let window = {
            y1: this.level.position.y,
            y2: this.level.position.y + this.graphics.viewport.virtual.height
        }

        // Check if boss was destroyed before filtering
        if (this.active_boss && this.active_boss.destroy_object) {
            console.log('[Game] Boss destroyed - YOU WIN!');
            this.you_win();
            this.active_boss = null;
        }

        this.level.npc = this.level.npc.filter(npc => !npc.destroy_object);


        // Update NPCs in viewport (bosses always update regardless of position)
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.is_boss || (npc.position.y > window.y1 - 50 && npc.position.y < window.y2)) {
                npc.update_motion(deltaTime);
            }
        }

        // Check mine proximity (before collision detection)
        this.check_mine_proximity();

        // Check collisions after all motion updates
        this.check_collisions();



        // Render NPCs and their explosions (bosses always update and render)
        for (let b = 0; b < this.level.npc.length; b++) {
            let npc = this.level.npc[b];
            if (npc.is_boss || (npc.position.y > window.y1 - 50 && npc.position.y < window.y2)) {
                npc.update_frame(deltaTime);

                if (npc.type == "ship" || npc.type == "boss") {
                    npc.render({ x: 0, y: window.y1 });
                } else {
                    npc.orient({ x: 0, y: window.y1 });
                    npc.render();
                    npc.de_orient();
                }
            }
        }

        // Update and render spaceship
        if (this.level.spaceship != null) {
            // Check if player died
            if (this.level.spaceship.life <= 0) {
                if (!this.player_dying) {
                    // Start death sequence
                    this.player_dying = true;
                    this.death_started_time = Date.now();
                    console.log('[Game] Player death - starting explosion sequence');
                } else {
                    // Check if explosion animation is complete
                    const time_since_death = Date.now() - this.death_started_time;
                    if (time_since_death >= this.death_explosion_duration) {
                        this.game_over();
                        return;
                    }
                }
            }

            this.level.spaceship.update_frame(deltaTime);
            this.level.spaceship.render({ x: 0, y: window.y1 });
        }

        // No need to restore - modal handles it

        // Update bar percentages (modal will render them automatically after this callback returns)
        if (this.level.spaceship != null && this.laser_bar && this.missile_bar && this.booster_bar && this.shield_bar && this.health_bar) {
            this.laser_bar.set_percentage(this.level.spaceship.laser_fire_control.get_cooldown_percentage());
            this.missile_bar.set_percentage(this.level.spaceship.missile_fire_control.get_cooldown_percentage());
            this.booster_bar.set_percentage(this.level.spaceship.boost_fire_control.get_cooldown_percentage());
            this.shield_bar.set_percentage(this.level.spaceship.get_shield_percentage());
            this.health_bar.set_percentage(this.level.spaceship.get_life_percentage());
        }

        // Render score display
        this.render_score();
    }

    render_background() {
        if (!this.level || !this.level.background || !this.graphics || !this.graphics.ctx) return;

        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        const bg_sprite = this.graphics.sprites.get(this.level.background);
        if (!bg_sprite) {
            console.warn('[Game] Background sprite not loaded:', this.level.background);
            return;
        }

        // Use virtual viewport dimensions - canvas transform handles scaling
        const viewport = this.graphics.viewport.virtual;
        const bg_height = bg_sprite.height;
        const bg_width = bg_sprite.width;

        // Scale background to fill viewport width
        const scale = viewport.width / bg_width;
        const scaled_height = bg_height * scale;

        // Calculate how much of the level we've scrolled through (0 to 1)
        const total_level_height = this.level.position.height;
        const scroll_progress = (this.level.position.y / total_level_height);

        // Map scroll progress to background position
        // Background scrolls downward as level progresses (same direction as level movement)
        const bg_y_offset = (scaled_height - viewport.height) * scroll_progress;

        // Draw background - tile vertically if needed
        const tiles_needed = Math.ceil(viewport.height / scaled_height) + 1;
        for (let i = -1; i < tiles_needed; i++) {
            const y_pos = Math.floor(i * scaled_height - bg_y_offset);
            // Floor destination coordinates and dimensions, add +1 to prevent gaps from sub-pixel issues
            const dest_x = 0;
            const dest_y = y_pos;
            const dest_width = Math.floor(viewport.width) + 1;
            const dest_height = Math.floor(scaled_height) + 1;

            // drawImage with 5 params: image, dx, dy, dWidth, dHeight
            ctx.drawImage(
                bg_sprite.image,
                dest_x,
                dest_y,
                dest_width,
                dest_height
            );
        }
    }

    render_score() {
        if (!this.ctx || typeof this.ctx.save !== 'function') return;

        const scoreText = `Score: ${this.score}  Kills: ${this.kills}`;
        // Position relative to game window
        const x = this.position.x + this.position.width - 250;
        const y = this.position.y + 30;

        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(scoreText, x, y);
        this.ctx.restore();
    }

    draw_viewport_border() {
        const ctx = this.graphics.ctx;
        if (!ctx) return;

        const viewport = this.graphics.viewport.virtual;
        const borderWidth = 6;

        ctx.save();

        // Draw dark border all around
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.9)'; // Dark grey
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        // Top edge
        ctx.moveTo(0, borderWidth / 2);
        ctx.lineTo(viewport.width, borderWidth / 2);
        // Left edge
        ctx.moveTo(borderWidth / 2, 0);
        ctx.lineTo(borderWidth / 2, viewport.height);
        // Bottom edge
        ctx.moveTo(0, viewport.height - borderWidth / 2);
        ctx.lineTo(viewport.width, viewport.height - borderWidth / 2);
        // Right edge
        ctx.moveTo(viewport.width - borderWidth / 2, 0);
        ctx.lineTo(viewport.width - borderWidth / 2, viewport.height);
        ctx.stroke();

        ctx.restore();
    }

    game_over() {
        // Stop the game
        this.pause_game = true;
        this.level_start = false;
        this.player_won = false;
    }

    you_win() {
        // Stop the game - player won!
        this.pause_game = true;
        this.level_start = false;
        this.player_won = true;
    }

    draw_game_over_overlay() {
        // Display game over or victory message
        const ctx = this.graphics.ctx;
        if (!ctx || typeof ctx.save !== 'function') return;

        // Use virtual viewport dimensions - canvas transform handles scaling
        const centerX = this.graphics.viewport.virtual.width / 2;
        const centerY = this.graphics.viewport.virtual.height / 2;

        ctx.save();

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);

        if (this.player_won) {
            // YOU WIN text
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 72px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('YOU WIN!', centerX, centerY - 60);

            // Victory message
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 36px monospace';
            ctx.fillText('BOSS DEFEATED!', centerX, centerY);
        } else {
            // Game Over text
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 72px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', centerX, centerY - 60);
        }

        // Score
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(`Final Score: ${this.score}`, centerX, centerY + 50);
        ctx.fillText(`Kills: ${this.kills}`, centerX, centerY + 100);

        // Instructions
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px monospace';
        ctx.fillText('Press ESC to return to menu', centerX, centerY + 160);

        ctx.restore();
    }

    async start_level() {
        this.level_start = true;

        // Test mode - start near end of level for boss testing
        if (this.test_mode) {
            this.level.position.y = this.boss_spawn_threshold + 200; // Start 200 pixels before boss spawn
            console.log('[Game] Test mode: Starting near end of level at position', this.level.position.y);
        }

        // Set the background from the level
        if (this.level.background) {
            this.set_background(this.level.background);
        }

        // Resume audio context and play background music
        if (this.audio_manager && this.audio_manager.audioContext.state === 'suspended') {
            await this.audio_manager.audioContext.resume();
        }

        // Play level music with looping enabled
        if (this.level.track_key) {
            this.audio_manager.play(this.level.track_key, 0, true);
        }
    }

    spawn_boss() {
        // Randomly choose boss type
        const bossTypes = ['chatgpt', 'resume'];
        const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];

        // Spawn boss at top of screen (above viewport)
        const viewport = this.graphics.viewport.virtual;
        const bossX = viewport.width / 2; // Center horizontally
        const bossY = this.level.position.y - 300; // 300 pixels above top of screen

        // Create boss
        this.active_boss = new Boss(this.window_manager, bossX, bossY, bossType);

        // Set hover target to middle/upper area of screen
        this.active_boss.hover_target_y = this.level.position.y + (viewport.height * 0.25); // 25% down from top

        this.level.npc.push(this.active_boss);

        console.log('[Game] Boss spawned:', bossType, 'at position', bossX, bossY, 'hover target:', this.active_boss.hover_target_y);
    }


    handle_game_keys(kb) {
        if (this.active==false) return;

        // Only accept gameplay input if level has started AND game is not paused
        if (this.level_start == true && !this.pause_game) {
            // In your game loop, check keysPressed object to determine actions
            if (kb.is_pressed('ArrowLeft')) this.level.spaceship.bank_left();
            if (kb.is_pressed('ArrowRight')) this.level.spaceship.bank_right();
            if (kb.is_pressed('ArrowUp')) this.level.spaceship.accelerate(400);
            if (kb.is_pressed('ArrowDown')) this.level.spaceship.decelerate(400);
            if (kb.is_pressed(' ')) this.level.spaceship.fire_lazer();
            if (kb.just_stopped(' ')) this.level.spaceship.stop_firing_lazer();
            if (kb.just_stopped('Enter')) this.level.spaceship.fire_missle(this.level.npc);
            if (kb.is_pressed('a') || kb.is_pressed('A')) this.level.spaceship.strafe_left(400);
            if (kb.is_pressed('d') || kb.is_pressed('D')) this.level.spaceship.strafe_right(400);
            if (kb.is_pressed('w') || kb.is_pressed('W'))
            this.level.spaceship.accelerate(400);
            if (kb.is_pressed('s') || kb.is_pressed('S')) this.level.spaceship.decelerate(400);

            if (kb.is_pressed('Shift')) this.level.spaceship.boost();
            if (kb.just_stopped('Shift')) this.level.spaceship.stop_boost();

            // CTRL for reverse thrust/brake - applies force opposite to velocity vector
            if (kb.is_pressed('Control')) this.level.spaceship.reverse_thrust();
        }

        // These controls work even when paused
        if (this.level_start == true) {
            if (kb.just_stopped('+')) this.level.volume(+1);
            if (kb.just_stopped('-')) this.level.volume(-1);
            if (kb.just_stopped('h') ||kb.just_stopped('H')) this.help();
            if (kb.just_stopped('m') || kb.just_stopped('M')) this.ui.toggle_sound();
        }

        // Level speed controls (only when not paused)
        if (this.level_start == true && !this.pause_game) {
            // Numpad + to speed up (or = key for keyboards without numpad)
            if (kb.just_stopped('=') || kb.just_stopped('NumpadAdd')) {
                this.level.speed = Math.min(this.level.speed + 0.5, 10); // Max speed 10
                console.log('[Game] Level speed increased to', this.level.speed);
            }
            // Numpad - to slow down (or _ key)
            if (kb.just_stopped('_') || kb.just_stopped('NumpadSubtract')) {
                this.level.speed = Math.max(this.level.speed - 0.5, 0); // Min speed 0
                console.log('[Game] Level speed decreased to', this.level.speed);
            }
            // Numpad 0 to stop
            if (kb.just_stopped('Numpad0') || kb.just_stopped('0')) {
                this.level.speed = 0;
                console.log('[Game] Level speed set to 0 (stopped)');
            }
        }
    }

    handle_escape() {
        // If player is dead or won, close the game and return to menu
        if ((this.level.spaceship && this.level.spaceship.life <= 0) || this.player_won) {
            this.close();
            return;
        }

        // Toggle pause
        if (this.pause_game == true) {
            this.ui.unpause();
        } else {
            this.ui.pause();
        }
    }

    help() {
        let modal = new help();
        this.window_manager.add(modal);
    }

    delete() {
        // Stop the level music when closing the game
        if (this.level && this.level.track_key && this.audio_manager) {
            console.log('[Game] Stopping music:', this.level.track_key);
            this.audio_manager.stop(this.level.track_key);
        }

        // Also stop the level if it exists
        if (this.level) {
            this.level.stop();
        }

        // Call parent delete
        super.delete();
    }
}// Excel Boss Mode - Much more realistic and functional!
let currentSheet = 'Budget';
let selectedCell = null;

// Generate column and row headers on page load
function generateHeaders() {
    // Generate column headers (A-Z)
    const colHeaders = document.getElementById('col-headers');
    if (colHeaders) {
        colHeaders.innerHTML = '';
        for (let i = 0; i < 26; i++) {
            const header = document.createElement('div');
            header.className = 'excel-col-header';
            header.textContent = String.fromCharCode(65 + i);
            colHeaders.appendChild(header);
        }
    }

    // Generate row headers (1-50)
    const rowHeaders = document.getElementById('row-headers');
    if (rowHeaders) {
        // Keep the corner div
        const corner = rowHeaders.querySelector('.excel-corner');
        rowHeaders.innerHTML = '';
        if (corner) {
            rowHeaders.appendChild(corner);
        } else {
            const newCorner = document.createElement('div');
            newCorner.className = 'excel-corner';
            rowHeaders.appendChild(newCorner);
        }

        for (let i = 1; i <= 50; i++) {
            const header = document.createElement('div');
            header.className = 'excel-row-header';
            header.textContent = i;
            rowHeaders.appendChild(header);
        }
    }
}

// Ribbon tab functionality
function handleRibbonTab(tabName) {
    // Update active tab styling
    document.querySelectorAll('.excel-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === tabName) {
            tab.classList.add('active');
        }
    });

    // You could add different ribbon content for each tab
    // For now just show which tab is active in status bar
    const statusLeft = document.querySelector('.status-left');
    if (statusLeft) {
        statusLeft.textContent = tabName + ' tab selected';
    }
}

const sheetData = {
    'Budget': [
        ['FY 2024 Budget Analysis', '', '', '', '', '', '', '', 'Status:', 'In Review', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Department', 'Q1 Budget', 'Q1 Actual', 'Q1 Variance', 'Q2 Budget', 'Q2 Actual', 'Q2 Variance', 'YTD Budget', 'YTD Actual', 'YTD Variance', 'Remaining', 'Annual Budget', '', '', ''],
        ['Engineering', '$450,000', '$438,250', '-$11,750', '$450,000', '$462,100', '$12,100', '$900,000', '$900,350', '$350', '$1,800,000', '$3,600,000', '', '', ''],
        ['Sales', '$320,000', '$335,600', '$15,600', '$320,000', '$318,900', '-$1,100', '$640,000', '$654,500', '$14,500', '$1,280,000', '$2,560,000', '', '', ''],
        ['Marketing', '$180,000', '$172,800', '-$7,200', '$180,000', '$185,300', '$5,300', '$360,000', '$358,100', '-$1,900', '$720,000', '$1,440,000', '', '', ''],
        ['Operations', '$280,000', '$291,450', '$11,450', '$280,000', '$276,800', '-$3,200', '$560,000', '$568,250', '$8,250', '$1,120,000', '$2,240,000', '', '', ''],
        ['HR', '$125,000', '$118,900', '-$6,100', '$125,000', '$128,750', '$3,750', '$250,000', '$247,650', '-$2,350', '$500,000', '$1,000,000', '', '', ''],
        ['IT', '$220,000', '$215,600', '-$4,400', '$220,000', '$223,400', '$3,400', '$440,000', '$439,000', '-$1,000', '$880,000', '$1,760,000', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['TOTAL', '$1,575,000', '$1,572,600', '-$2,400', '$1,575,000', '$1,595,250', '$20,250', '$3,150,000', '$3,167,850', '$17,850', '$6,300,000', '$12,600,000', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Notes:', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['- Engineering over budget in Q2 due to contractor fees', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['- Sales under budget in Q2 - hiring delayed', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['- Marketing variance due to conference spending', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Next Review: 2024-07-15', '', '', '', '', 'Approved By:', 'CFO', '', '', '', '', '', '', '', ''],
    ],
    'Revenue': [
        ['2024 Revenue Dashboard', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Product Line', 'Jan', 'Feb', 'Mar', 'Q1 Total', 'Apr', 'May', 'Jun', 'Q2 Total', 'YTD Total', 'Target', 'Variance', '% of Target', '', ''],
        ['Cloud Services', '$285,400', '$298,750', '$312,900', '$897,050', '$325,600', '$338,200', '$352,100', '$1,015,900', '$1,912,950', '$1,800,000', '$112,950', '106.3%', '', ''],
        ['Professional Services', '$142,800', '$138,600', '$155,300', '$436,700', '$148,900', '$162,400', '$158,800', '$470,100', '$906,800', '$950,000', '-$43,200', '95.5%', '', ''],
        ['Licenses', '$96,500', '$102,300', '$98,700', '$297,500', '$105,800', '$99,200', '$108,400', '$313,400', '$610,900', '$580,000', '$30,900', '105.3%', '', ''],
        ['Support & Maintenance', '$188,200', '$195,400', '$201,800', '$585,400', '$208,500', '$212,300', '$218,900', '$639,700', '$1,225,100', '$1,200,000', '$25,100', '102.1%', '', ''],
        ['Training', '$45,300', '$48,900', '$52,600', '$146,800', '$55,200', '$58,800', '$61,500', '$175,500', '$322,300', '$350,000', '-$27,700', '92.1%', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['TOTAL REVENUE', '$758,200', '$783,950', '$821,300', '$2,363,450', '$844,000', '$870,900', '$899,700', '$2,614,600', '$4,978,050', '$4,880,000', '$98,050', '102.0%', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Growth Metrics', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['MoM Growth', '3.4%', '4.7%', '3.3%', '', '2.8%', '3.2%', '3.3%', '', '', '', '', '', '', ''],
        ['YoY Growth', '18.5%', '19.2%', '21.3%', '', '22.8%', '24.1%', '23.7%', '', '', '', '', '', '', ''],
    ],
    'Headcount': [
        ['Employee Headcount Report', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['As of: June 30, 2024', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Department', 'Jan 1', 'Hires', 'Terminations', 'Mar 31', 'Hires', 'Terminations', 'Jun 30', 'Budget', 'Variance', 'Open Req', '', '', '', ''],
        ['Engineering', '145', '12', '-3', '154', '8', '-2', '160', '165', '-5', '8', '', '', '', ''],
        ['Product', '32', '3', '-1', '34', '2', '0', '36', '38', '-2', '3', '', '', '', ''],
        ['Sales', '85', '8', '-5', '88', '6', '-4', '90', '95', '-5', '12', '', '', '', ''],
        ['Marketing', '28', '2', '-1', '29', '3', '-1', '31', '32', '-1', '2', '', '', '', ''],
        ['Customer Success', '45', '5', '-2', '48', '4', '-3', '49', '52', '-3', '5', '', '', '', ''],
        ['Operations', '38', '2', '-1', '39', '3', '-2', '40', '42', '-2', '3', '', '', '', ''],
        ['Finance', '18', '1', '0', '19', '1', '0', '20', '20', '0', '1', '', '', '', ''],
        ['HR', '12', '1', '0', '13', '0', '-1', '12', '12', '0', '0', '', '', '', ''],
        ['IT', '22', '2', '0', '24', '1', '0', '25', '26', '-1', '2', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['TOTAL', '425', '36', '-13', '448', '28', '-13', '463', '482', '-19', '36', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Turnover Rate', '3.1%', '', '', '2.9%', '', '', '2.8%', '', '', '', '', '', '', ''],
        ['Time to Fill (days)', '42', '', '', '38', '', '', '35', '', '', '', '', '', '', ''],
    ]
};

function generateExcelGrid(sheetName) {
    const grid = document.getElementById('excel-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing cells
    const data = sheetData[sheetName] || sheetData['Budget'];

    for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 26; col++) {
            const cell = document.createElement('div');
            cell.className = 'excel-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (data[row] && data[row][col]) {
                cell.textContent = data[row][col];

                // Style header rows
                if (row === 0) {
                    cell.style.fontWeight = 'bold';
                    cell.style.fontSize = '13px';
                    cell.style.backgroundColor = '#e8f4f8';
                }
                // Style column headers (row 2 for most sheets)
                if (row === 2 && data[row][col]) {
                    cell.style.fontWeight = 'bold';
                    cell.style.backgroundColor = '#d9e9f0';
                    cell.style.borderBottom = '2px solid #217346';
                }
                // Style total rows
                if (cell.textContent.toUpperCase().includes('TOTAL')) {
                    cell.style.fontWeight = 'bold';
                    cell.style.backgroundColor = '#f0f0f0';
                    cell.style.borderTop = '2px solid #000';
                }
                // Style currency
                if (cell.textContent.includes('$')) {
                    cell.style.textAlign = 'right';
                }
                // Style percentages
                if (cell.textContent.includes('%')) {
                    cell.style.textAlign = 'right';
                }
                // Style formulas
                if (cell.textContent.startsWith('=')) {
                    cell.style.fontStyle = 'italic';
                    cell.style.color = '#0066cc';
                }
            }

            // Make cells clickable - use event delegation instead
            cell.addEventListener('click', function(e) {
                e.stopPropagation();
                selectCell(this);
            });

            grid.appendChild(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    cell.classList.add('selected');

    // Update formula bar
    const colLetter = String.fromCharCode(65 + parseInt(cell.dataset.col));
    const rowNumber = parseInt(cell.dataset.row) + 1;
    document.querySelector('.formula-cell-ref').textContent = colLetter + rowNumber;
    document.querySelector('.formula-input').textContent = cell.textContent || '';
}

function switchTab(tabName) {
    currentSheet = tabName;

    // Update tab styling
    document.querySelectorAll('.excel-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update sheet tabs
    document.querySelectorAll('.sheet-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === tabName) {
            tab.classList.add('active');
        }
    });

    // Regenerate grid
    generateExcelGrid(tabName);
}

// Initialize boss mode when document is ready
function initBossMode() {
    generateHeaders();
    generateExcelGrid('Budget');
}
function dialog() {
    const nextBtn = document.getElementById('next_btn');
    if (!nextBtn) return;

    nextBtn.addEventListener('click', function () {
      // Handle OK button click event
      document.getElementById('intro').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      initGame();

    });

    // To show the overlay
    const underlay = document.getElementById('underlay');
    if (underlay) {
      underlay.style.display = 'flex';
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    dialog();
  });

function blipEffect() {
    const overlay = document.getElementById('dialog_box');
    const originalBrightness = 'brightness(100%)'; // Original brightness
    const blipBrightness = 'brightness(80%)'; // Brightness during blip
    let isBlipping = false;

    function startBlip() {
        if (!isBlipping) {
            overlay.style.filter = blipBrightness; // Darken for the blip
            isBlipping = true;
            setTimeout(() => {
                overlay.style.filter = originalBrightness; // Return to original brightness
                isBlipping = false;
            }, 100); // Duration of the blip is less than 300ms
        }   
    }

    setInterval(() => {
      // Only start a new blip if not currently blipping
      if (!isBlipping) {
        startBlip();
      }
    }, Math.random() * (10000 - 5000) + 2000); // Random interval between 2 and 8 seconds
  }

  document.addEventListener('DOMContentLoaded', function () {
    //blipEffect(); // Start the blipping effect when the document is ready
  });