this.chatSend.addEventListener('click', () => {
    const message = this.chatInput.value.trim(); // Trim to remove leading/trailing whitespaces
    if (message !== '') { // Check if message is not empty
        this.gameClient.sendChatMessage(message);
        this.chatInput.value = ''; // Clear input field
        this.messageSendSound.play();
    }
});

// Event listener for Enter key press in input text box
this.chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const message = this.chatInput.value.trim(); // Trim to remove leading/trailing whitespaces
        if (message !== '') { // Check if message is not empty
            this.gameClient.sendChatMessage(message);
            this.chatInput.value = ''; // Clear input field
            this.messageSendSound.play();
        }
    }
});

this.zoomInButton.addEventListener('click', () => this.gameClient.viewportZoom('in'));
this.zoomOutButton.addEventListener('click', () => this.gameClient.viewportZoom('out'));
this.moveLeftButton.addEventListener('click', () => this.gameClient.viewportMove('left'));
this.moveRightButton.addEventListener('click', () => this.gameClient.viewportMove('right'));
this.moveUpButton.addEventListener('click', () => this.gameClient.viewportMove('up'));
this.moveDownButton.addEventListener('click', () => this.gameClient.viewportMove('down'));


balls() {
    const balls = this.gameClient.getBalls();


    balls.forEach(ball => {
        if (ball.fading) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - ball.fadeStartTime;
            const fadeProgress = Math.min(1, elapsedTime / this.FADE_OUT_DURATION);
            const opacity = 1 - fadeProgress;
            this.ctx.globalAlpha = opacity;
        }

        // Start drawing the asteroid-like ball
        this.ctx.beginPath();
        this.ctx.arc(ball.position[0], ball.position[1], ball.radius, 0, 2 * Math.PI);

        // Create a radial gradient for the asteroid effect
        let gradient = this.ctx.createRadialGradient(
            ball.position[0], ball.position[1], ball.radius * 0.1, // Inner circle
            ball.position[0], ball.position[1], ball.radius // Outer circle
        );

        // Gradient color stops: from lighter (or white) to the ball's color
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Lighter center
        gradient.addColorStop(1, `rgba(${ball.color.join(',')}, 1)`); // Outer color

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Reset the global alpha
        this.ctx.globalAlpha = 1;
    });

    this.ballCount.textContent = `Balls: ${balls.length}`;
}

