// InputManager - Centralized input handling with event distribution
// Single source of truth for keyboard state, distributes to all listeners

class InputManager extends events {
    constructor() {
        super();
        this.keyboard = new key_states();
        this.listeners = [];
        this.debugMode = false;
    }

    // Register a listener for keyboard events
    // Listener receives (eventType, key) where eventType is 'down' or 'up'
    registerListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    // Unregister a listener
    unregisterListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Handle key down event
    handleKeyDown(key, event) {
        this.keyboard.down(key);
        this.keyboard.event(event);

        // Notify all listeners
        this.notifyListeners('down', key, event);

        if (this.debugMode) {
            console.log(`[InputManager] Key down: ${key}`);
        }
    }

    // Handle key up event
    handleKeyUp(key, event) {
        this.keyboard.up(key);
        this.keyboard.event(event);

        // Notify all listeners
        this.notifyListeners('up', key, event);

        if (this.debugMode) {
            console.log(`[InputManager] Key up: ${key}`);
        }
    }

    // Notify all registered listeners
    notifyListeners(eventType, key, event) {
        for (let listener of this.listeners) {
            try {
                listener(eventType, key, event);
            } catch (error) {
                console.error('[InputManager] Listener error:', error);
            }
        }
    }

    // Get current keyboard state
    getKeyboard() {
        return this.keyboard;
    }

    // Check if a key is currently pressed
    isPressed(key) {
        return this.keyboard.is_pressed(key);
    }

    // Check if a key was just pressed (one-time check)
    wasJustPressed(key) {
        return this.keyboard.just_pressed(key);
    }

    // Check if a key was just released (one-time check)
    wasJustReleased(key) {
        return this.keyboard.just_stopped(key);
    }

    // Enable/disable debug logging
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    // Get statistics about input
    getStats() {
        const pressedKeys = [];
        for (let key in this.keyboard.states) {
            if (this.keyboard.states[key].pressed) {
                pressedKeys.push(key);
            }
        }

        return {
            listenerCount: this.listeners.length,
            pressedKeys: pressedKeys,
            shiftPressed: this.keyboard.shift(),
            ctrlPressed: this.keyboard.ctrl()
        };
    }

    // Simple remapping storage using localStorage (non-destructive)
    getKeymap(defaults) {
        try {
            const stored = localStorage.getItem('aijobwars_keymap');
            if (stored) {
                return Object.assign({}, defaults, JSON.parse(stored));
            }
        } catch (e) {
            console.warn('[InputManager] Unable to read keymap', e);
        }
        return defaults;
    }

    saveKeymap(map) {
        try {
            localStorage.setItem('aijobwars_keymap', JSON.stringify(map));
        } catch (e) {
            console.warn('[InputManager] Unable to save keymap', e);
        }
    }
}
