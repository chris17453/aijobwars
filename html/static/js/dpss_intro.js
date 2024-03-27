function dialog() {
    document.getElementById('next_btn').addEventListener('click', function () {
      // Handle OK button click event
      document.getElementById('intro').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      initGame();

    });

    // To show the overlay
    document.getElementById('underlay').style.display = 'flex';
  }
  document.addEventListener('DOMContentLoaded', function () {
    dialog();
  });

function blipEffect() {
    const overlay = document.getElementById('dialog_box');
    const originalBrightness = 'brightness(100%)'; // Original brightness
    const blipBrightness = 'brightness(80%)'; // Brightness during blip
    let isBlipping = false;

    function startBlip() {
        if (!isBlipping) {
            overlay.style.filter = blipBrightness; // Darken for the blip
            isBlipping = true;
            setTimeout(() => {
                overlay.style.filter = originalBrightness; // Return to original brightness
                isBlipping = false;
            }, 100); // Duration of the blip is less than 300ms
        }   
    }

    setInterval(() => {
      // Only start a new blip if not currently blipping
      if (!isBlipping) {
        startBlip();
      }
    }, Math.random() * (10000 - 5000) + 2000); // Random interval between 2 and 8 seconds
  }

  document.addEventListener('DOMContentLoaded', function () {
    blipEffect(); // Start the blipping effect when the document is ready
  });