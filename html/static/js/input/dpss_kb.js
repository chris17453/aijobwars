class key_states {
    constructor() {
        this.states = [];
        this.shift = false;
        this.ctrl_state = false;
    }

    up(key) {
        if (!this.states[key] || !this.states[key].justStopped) { // Ensure the justStopped logic
            this.states[key] = { pressed: false, up: true, down: false, justStopped: true };
        }
    }

    down(key) {
        if (!this.states[key] || !this.states[key].justPressed) { // Ensure the justPressed logic
            this.states[key] = { pressed: true, up: false, down: true, justPressed: true };
        }
    }

    get_state(key) {
        if (key in this.states) {
            return this.states[key];
        }
        this.states[key] = { pressed: false, up: false, down: false };
        return this.states[key];
    }

    is_pressed(key) {
        return key in this.states && this.states[key].pressed;
    }

    just_pressed(key) {
        if (key in this.states && this.states[key].justPressed) {
            this.states[key].justPressed = false; // Reset the justPressed state after checking
            return true;
        }
        return false;
    }

    just_stopped(key) {
        if (key in this.states && this.states[key].justStopped) {
            this.states[key].justStopped = false; // Reset the justStopped state after checking
            return true;
        }
        return false;
    }

    shift() {
        if (this.shift) return true;
        return false;
    }

    ctrl() {
        if (this.ctrl_state) return true;
        return false;
    }

    event(event) {
        this.shift = event.shiftKey;
        this.ctrl_state = event.ctrlKey;
    }
}
