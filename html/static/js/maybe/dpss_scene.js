class scene {
    constructor(graphics,audio_manager,scenes) {
        this.graphics=graphics;
        this.audio_manager=audio_manager;

      this.scenes = scenes; // Array of scenes, each with slide number, images, and audio files
    }
  
    // Stub for drawing an image - Replace with your actual implementation
    drawImage(imagePath, timestamp) {
      console.log(`Drawing image ${imagePath} at ${timestamp}`);
      // Implement image drawing logic here
    }
  
    // Stub for playing audio - Replace with your actual implementation
    playAudio(audioPath, timestamp) {
      console.log(`Playing audio ${audioPath} at ${timestamp}`);
      // Implement audio playing logic here
    }
  
    // Function to play a specific scene based on slide number
    playScene(slideNumber) {
      const scene = this.scenes.find(scene => scene.slideNumber === slideNumber);
      if (!scene) {
        console.error('Scene not found');
        return;
      }
  
      // Process images
      scene.images.forEach(image => {
        setTimeout(() => this.drawImage(image.path, image.timestamp), image.timestamp);
      });
  
      // Process audio files
      scene.audioFiles.forEach(audio => {
        setTimeout(() => this.playAudio(audio.path, audio.timestamp), audio.timestamp);
      });
    }
  }
  
  
  

  

  
  const scene = new scene();
  // load scenes scenes.load("static/storyboard/scenes.json")
  scene.playScene(1); 
  


