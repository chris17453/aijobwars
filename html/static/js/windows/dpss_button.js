
class button extends events{
  constructor(parent,graphics, label,position,anchor_position, callback, up_image, down_image) {
    super();
    this.parent=parent;
    this.graphics = graphics;
    this.ctx = graphics.ctx;
    this.sprites = graphics.sprites;
    this.up_image = up_image;
    this.down_image = down_image;
    this.label = label;
    this.is_down = false;
    this.is_hover = false;
    this.monospaced=false;
    this.centered = false;
    this.active=true;
    
    
    let x_pad=20;
    let y_pad=20;
    let bounds=this.graphics.font.get_bounds(label,this.monospaced);
    if (position.width==null) position.width=bounds.width+x_pad*2;
    if (position.height==null) position.height=bounds.height+y_pad*2;
    this.inner=new rect((position.width-bounds.width)/2,(position.height-bounds.height)/2,bounds.width,bounds.height);
        this.position = position;  
    this.anchor_position=anchor_position;
    if(this.anchor_position==null) console.log("OMG!");


    graphics.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this));
    graphics.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this));
    graphics.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this));
    this.callback=callback;
   // this.resize();
  }

  resize(anchor_position){
    this.anchor_position=anchor_position;
  }


  render() {
    if(this.active!=true) return;
    let relative_position = this.position.clone();
    let relative_inner = this.inner.clone();
    relative_position.add(this.anchor_position)
    relative_inner.add(relative_position)
    //relative_position._x_mode="left";
    //relative_position._y_mode="top";
    let img=this.up_image;
    if (this.is_down) {
      img=this.down_image;
    } else if (this.is_hover) {
      relative_position.x+=2;
      relative_position.y+=2;
      relative_inner.x+=2;  
      relative_inner.y+=2;
    }

    this.sprites.slice_9(img,relative_position ,10,10);
    
    //this.sprites.draw_colored_rectangle(relative_position,"red");
    //this.sprites.draw_colored_rectangle(relative_inner,"blue");
    this.graphics.font.draw_text(relative_inner, this.label,this.centered, this.monospaced);

}

  handle_mouse_down(event) {
    if(this.active!=true) return;

    if(this.is_down) return;
    if (this.is_inside(event.offsetX, event.offsetY)) {
      this.is_down = true;

    }
  }

  handle_mouse_up(event) {

    if(this.active!=true) return;
    //console.log("Button: IN Clicked");
    if (this.is_down && this.is_inside(event.offsetX, event.offsetY)) {
      if(this.is_down == true) {
        console.log("Button: Clicked");
        this.callback({parent:this.parent,event:event,instance:this});
        //this.emit('click', event); // Emit 'click' event
      }
    }
    this.is_down=false;
    //console.log("Button: OUT  Clicked");
    
  }

  handle_mouse_move(event) {
    if(this.active!=true) return;

    let previously_hover = this.is_hover;
    this.is_hover = this.is_inside(event.offsetX, event.offsetY);

    if (this.is_hover && !previously_hover) {
      this.emit('mouseover', event); // Emit 'mouseover' event
    } else if (!this.is_hover && previously_hover) {
      this.emit('mouseout', event); // Emit 'mouseout' event
    }
  }

  is_inside(mouse_x, mouse_y) {
    let relative_position = this.position.clone();
    relative_position.add(this.anchor_position)

    return mouse_x >= relative_position.x && mouse_x <= relative_position.x + relative_position.width &&
      mouse_y >= relative_position.y && mouse_y <= relative_position.y + relative_position.height;
  }
  set_active(active){
    this.active=active;
  }
  delete(){
      // Remove all event listeners
      this.graphics.canvas.removeEventListener('mousedown', this.handle_mouse_down.bind(this));
      this.graphics.canvas.removeEventListener('mouseup', this.handle_mouse_up.bind(this));
      this.graphics.canvas.removeEventListener('mousemove', this.handle_mouse_move.bind(this));

      // Clear other properties
      delete this.parent;
      delete this.graphics;
      delete this.ctx;
      delete this.sprites;
      delete this.up_image;
      delete this.down_image;
      delete this.label;
      delete this.is_down;
      delete this.is_hover;
      delete this.monospaced;
      delete this.centered;
      delete this.active;
      delete this.inner;
      delete this.position;
      delete this.anchor_position;
      delete this.callback;
  }

}
