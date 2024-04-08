class GamePage {
    constructor(elementIds, initialWidth, initialHeight) {
        this.login = document.getElementById(elementIds.loginId);
        this.game = document.getElementById(elementIds.game_id);
        this.boss_mode = document.getElementById(elementIds.boss_mode_id);
        this.canvasContainer = document.getElementById(elementIds.canvasContainerId);


        this.level_start = false;
        this.lastFrameTime = Date.now(); //keeping game loop frame time
        this.FADE_OUT_DURATION = 5;
        this.outro = "Congratulations, you've emerged victorious from the AI Job Wars! Your resilience and strategic prowess have paid off, leading you to triumph over the relentless AI competition. With your job secured, you stand as a testament to human ingenuity and determination in the face of technological advancement. But the journey doesn't end here - continue honing your skills and facing new challenges as you navigate the ever-evolving landscape of the job market. Keep pushing forward, and may success always be within your grasp!";
        this.boss_mode_activated = false;
        this.pause_game = false;
        // control plane
        
        
        this.window_manager = new window_manager(canvas,ctx);

  
        


    }




}
