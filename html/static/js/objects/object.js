class game_object extends motion {

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
        this.life -= damage;
        if (this.life < 0) this.destroy();

    }
    set_max_life(max_life) {
        this.max_life = max_life;
        this.life = max_life;
    }
    get_life_percentage() {
        return parseInt((this.life / this.max_life) * 100);
    }

    destroy() {
        this.destroy_object = true;
        console.log("DEstory THIS!");

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
    }

    image_rotate(rotation) {
        this.image_rotation = rotation
    }


    set_sound(action, sound_URL) {
        //cache this to save the some ChannelSplitterNode.apply. early  optimization bites you in the ass
        this.sounds[this.type+action]=sound_URL;
        this.audio_manager.add(this.type+action, sound_URL);

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

        
        for (let b = 0; b < this.explosions.length; b++) {
            this.explosions[b].update_frame(deltaTime)
            if (this.explosions[b].loop_complete()) {
                this.explosions.splice(b, 1); // Remove the projectile from the array
            }
        }

        this.playActions();
    }//end update frame

    orient(window = null) {

        this.graphics.ctx.save();
        let scale = this.graphics.viewport.scale.x;

        let x = this.position.x;
        let y = this.position.y;
        if (window != null) {
            x -= window.x;
            y -= window.y;
            x += this.graphics.viewport.given.x;
            y += this.graphics.viewport.given.y;
        }
        //x-=this.center.x ;
        //y-=this.center.y ;

        x *= scale;
        y *= scale;

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
        // Define the source rectangle

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = this.width; //*this.graphics.viewport.scale.x
        let sourceHeight = this.height; //*this.graphics.viewport.scale.x
        if (this.image_frames > 1) {
            sourceX = this.image_frame * this.frame_width;
            sourceWidth = this.frame_width;
        }
        let dest_height = sourceHeight * this.graphics.viewport.scale.x;
        let dest_width = sourceWidth * this.graphics.viewport.scale.x;
        let scale = this.graphics.viewport.scale.x;
        
        let src= new rect(sourceX, sourceY, sourceWidth, sourceHeight);
        let dest=new rect(-this.center.x * scale, -this.center.y * scale, dest_width, dest_height);
        this.graphics.sprites.render(this.img,src,dest,1,'none'); 
        

        //      } else {
        //            this.graphics.ctx.drawImage(this.img,  -this.center.x, -this.center.y, sourceWidth, sourceHeight,
        //                                        -this.center.x, -this.center.y, sourceWidth, sourceHeight);

        //this.graphics.ctx.drawImage(this.img, -this.center.x, -this.center.y);
        //    }
        for(let i=0;i<this.explosions.length;i++){
            this.explosions[i].render(); 
        }
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

    explosion(){
        let exp = new Explosion(this.window_manager, 0,0,this.play_sounds,this.volume);
        this.explosions.push(exp);
    }

}
