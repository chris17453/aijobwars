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
