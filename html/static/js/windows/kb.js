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
  