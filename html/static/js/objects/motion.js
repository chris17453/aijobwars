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
        var ax = Math.sin(rotationInRadians) * this.mass * speed;
        var ay = -Math.cos(rotationInRadians) * this.mass * speed;

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

        // Use smaller radii (50% of average dimension) for tighter collisions with masks
        let thisRadius = Math.min(this.width, this.height) * 0.5;
        let otherRadius = Math.min(otherObject.width, otherObject.height) * 0.5;
        let combinedRadius = thisRadius + otherRadius;

        return distance < combinedRadius;
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

        // Sample pixels in overlap region (every 4 pixels for performance)
        const step = 4;
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
    

}