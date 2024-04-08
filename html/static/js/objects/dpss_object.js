class game_object {
    constructor(window_manager, x = 0, y = 0, width = 64, height = 64, mass = 100, rotation = 0, rotation_speed = 4) {
        
        this.window_manager=window_manager;
        this.audio_manager=window_manager.audio_manager;
        this.graphics = window_manager.graphics;
        this.type = "block";
        this.sounds = { };
        this.width = width;
        this.height = height;
        this.img = null;
        this.rotation = rotation;
        this.rotation_speed = rotation_speed;
        this.position = new rect(x, y,width,height);
        this.acceleration = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.mass = mass;
        this.damping_factor = .1; // acceleration slow down
        this.velocity_loss = .7; // momentum slow down
        this.image_frame = 0;
        this.image_frames = 1;
        this.image_rotation = 0;  //rotate the image seperate from the acceleration factor... for images made in diff directions
        this.anchor_points = []
        this.top_level = true;
        this.created = Date.now();
        this.expires = null;
        this.action_list = null;
        this.action_position = { frame: 0, row: 0 };
        this.health = 100;
        this.destroy_object = false;
        this.loop_done = false;
        this.loop = true;
        this.center = { x: 0, y: 0 };
        this.life = 100;
        this.max_life = 100;
        this.visible = true;
        this.explosions=[];
    }


    set_rotation_speed(speed){
        this.rotation_speed=speed;
    }
    set_rotation(rotation){
        this.rotation=rotation;
    }

    play(sound_name) {
        if( sound_name in this.sounds) {
            let s=this.audio_manager.get(sound_name);
            if(s) s.play();
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


    set_sound(position, sound_URL) {
        //cache this to save the some ChannelSplitterNode.apply. early  optimization bites you in the ass
        this.sounds[this.type+position]=sound_URL;
        this.audio_manager.add(this.type+position, sound_URL);

    }



    async move_player(direction, speed) {
        direction %= 360;

        var rotationInRadians = direction * Math.PI / 180;
        var ax = Math.sin(rotationInRadians) * this.mass * speed;
        var ay = -Math.cos(rotationInRadians) * this.mass * speed;

        this.acceleration.x += ax;
        this.acceleration.y += ay;
    }

    async bank_left() {
        this.rotation -= this.rotation_speed;
        if (this.rotation < 0)
            this.rotation += 360;
        this.play(this.type+"bank_left");
    }

    async bank_right() {
        this.rotation += this.rotation_speed;
        this.rotation %= 360;
        this.play(this.type+"bank_right");

    }

    async accelerate(speed = null) {
        this.play(this.type+"accel");
        if (speed == null) speed = 1;
        this.move_player(this.rotation, speed);
    }

    async decelerate(speed = null) {
        this.play(this.type+"decel");

        if (speed == null) speed = 1;
        this.move_player(this.rotation + 180, speed);
    }

    async strafe_left(speed = null) {
        if (speed == null) speed = 1;
        this.move_player(this.rotation + 270, speed);
        this.play(this.type+"bank_left");

    }

    async strafe_right(speed = null) {
        if (speed == null) speed = 1;
        this.play(this.type+"bank_right");
        this.move_player(this.rotation + 90, speed);

    }

    async rotate(rotation) {
        this.rotation = rotation;
    }

    update_frame(deltaTime) {
        if (this.visible == false) return;
        if (this.image_frames > 1) {

            if (this.loop == false && this.image_frame >= this.image_frames - 1) {
                this.loop_done = true;
            }

            this.image_frame++;
            this.image_frame %= this.image_frames;

        }

        if (deltaTime != 0) {

            this.acceleration.x -= this.acceleration.x * this.damping_factor;
            this.acceleration.y -= this.acceleration.y * this.damping_factor;
            // Update velocity based on acceleration
            this.velocity.x += this.acceleration.x * deltaTime;
            this.velocity.y += this.acceleration.y * deltaTime;

            // Update position based on velocity
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;

            if (this.velocity.x != 0) {
                this.velocity.x *= this.velocity_loss;
            }
            if (this.velocity.y != 0) {
                this.velocity.y *= this.velocity_loss;

            }

            

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

    check_collision(otherObject) {
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
            return true;
        }
        // No collision
        return false;
    }


    impact(otherObject) {
        // Calculate relative velocity
        let relativeVelocityX = this.velocity.x - otherObject.velocity.x;
        let relativeVelocityY = this.velocity.y - otherObject.velocity.y;

        // Calculate relative position
        let relativePositionX = otherObject.position.x - this.position.x;
        let relativePositionY = otherObject.position.y - this.position.y;

        // Calculate the angle of collision
        let collisionAngle = Math.atan2(relativePositionY, relativePositionX);

        // Calculate the component of velocities along the collision angle
        let a1 = relativeVelocityX * Math.cos(collisionAngle) + relativeVelocityY * Math.sin(collisionAngle);
        let a2 = -relativeVelocityX * Math.cos(collisionAngle) - relativeVelocityY * Math.sin(collisionAngle);


        // Calculate the optimized impulse
        let optimizedP = (2.0 * (a1 - a2)) / (1 / this.mass + 1 / otherObject.mass); // Adjusted for masses

        // Calculate the new velocities after collision
        let v1x, v1y, v2x, v2y;

        if (this.mass === 10000) {
            // Objects with mass 10000 maintain their velocities
            v1x = this.velocity.x;
            v1y = this.velocity.y;
        } else {
            v1x = this.velocity.x - optimizedP * Math.cos(collisionAngle) / this.mass;
            v1y = this.velocity.y - optimizedP * Math.sin(collisionAngle) / this.mass;
        }
        if (otherObject.mass === 10000) {
            v2x = otherObject.velocity.x;
            v2y = otherObject.velocity.y;
        } else {
            v2x = otherObject.velocity.x + optimizedP * Math.cos(collisionAngle) / otherObject.mass;
            v2y = otherObject.velocity.y + optimizedP * Math.sin(collisionAngle) / otherObject.mass;
        }

        let relativeVelocityMagnitude = Math.sqrt(Math.pow(relativeVelocityX, 2) + Math.pow(relativeVelocityY, 2));

        // Calculate damage based on relative velocity, mass, or any other relevant factors
        let damage = relativeVelocityMagnitude * (1 / this.mass + 1 / otherObject.mass);
        this.damage(damage);

        // Set the new movement vectors for the objects
        this.velocity.x = v1x;
        this.velocity.y = v1y;
        otherObject.velocity.x = v2x;
        otherObject.velocity.y = v2y;
        this.acceleration.x = 0;
        this.acceleration.y = 0;

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
                await this.accelerate(action.speed);
                //console.log("Accel");

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
