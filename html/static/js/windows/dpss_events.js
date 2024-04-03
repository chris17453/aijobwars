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

  emit(event_name, data=null) {
    if (data==null) {
      data={};
    }
    if(this.hasOwnProperty('parent')){
      data.parent=this.parent;
    }
    data.instance=this;
    data.event=event_name;
    

    if (this.events[event_name]) {
      this.events[event_name].forEach(callback => callback(data));
    }
  }

}