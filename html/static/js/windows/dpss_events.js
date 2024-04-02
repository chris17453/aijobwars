class events{
    constructor(){
        this.events = {}; // Object to hold events

    }

on(event_name, callback) {
    if (!this.events[event_name]) {
      this.events[event_name] = [];
    }
    this.events[event_name].push(callback);
  }

  emit(event_name, data) {
    if (this.events[event_name]) {
      this.events[event_name].forEach(callback => callback(data));
    }
  }

}