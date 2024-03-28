class fire_control {
    constructor(    temp_cycle=10,
                    over_heat = 2000, 
                    overheating_timeout = 2000,
                    ) {


        this.over_heat = over_heat;
        this.overheating_timeout = overheating_timeout;
        this.last_fired_time = 0;
        // flag
        this.overheated = false;
        this.overheated_cooldown_start=0;
   
        //internal
        this.max_rps=10;
        this.rps_min=1;
        this.rps=10;
        this.temprature=0;
        
        this.temp_cycle=temp_cycle;
        this.max_tempreture=100;
        this.is_firing=false;
        
    }

    can_fire() {
        if(this.overheated) return;
        const current_time = Date.now();
        const elapsed_time = current_time - this.last_fired_time;
        if (elapsed_time >= 1000/this.rps) {
            this.temprature+=this.temp_cycle;
            //if(this.temprature>this.)
            this.rps=this.max_rps*(1-(this.temprature/this.max_tempreture));
            if(this.rps<this.rps_min) this.rps=this.rps_min;
            if(this.temprature>this.max_tempreture) {
                this.temprature=this.max_tempreture;
                this.overheated=true;
                this.overheated_cooldown_start=0;
            }
            this.last_fired_time = current_time;
            this.is_firing=true;
            return true;
        } else {
            return false;
        }
    }

    update_frame(){
        
        const current_time = Date.now();
        if(this.overheated){
            if(this.overheated_cooldown_start!=0){
                if(current_time-this.overheated_cooldown_start>this.overheating_timeout){
                    this.overheated=false;
                    //this.overheated_cooldown_start=null;
                    this.rps=this.max_rps;
                } else {
                    
                    this.temprature-=5;
                    if(this.temprature<0) this.temprature=0;
                }
            } 
            return false;
        }
        if(this.is_firing==false) {
            this.temprature-=1;
            this.rps=(this.max_rps*this.get_cooldown_percentage())/100;
            if(this.temprature<0) this.temprature=0;
        }
    }

    get_cooldown_percentage(){
        return 100-(this.temprature/this.max_tempreture)*100;
    }

    timeout_percentage(){
        const current_time = Date.now();
        if(this.overheated){
            if(this.overheated_cooldown_start==0) return 100;
            return 100-((current_time-this.overheated_cooldown_start)/this.overheating_timeout)*100;
        }
        return 0;
    }

    stop_firing() {
        this.stopped_firing=Date.now();
        this.is_firing=false;

        
        if (this.overheated) {
            this.overheated_cooldown_start=Date.now();
        }
    }
}
