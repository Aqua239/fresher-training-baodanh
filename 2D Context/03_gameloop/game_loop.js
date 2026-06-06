"use strict"
// FPS Counter
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();

// Init
let canvas;
let context;
window.onload = init;

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    window.requestAnimationFrame(gameLoop); // Init loop (Request the next frame to draw)
}

function gameLoop(timeStamp) {
    context.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
    frameCount++; // Count the current frame

    // Update FPS text only once every second
    if(timeStamp - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = timeStamp;
    }    
    
    context.fillStyle = 'black';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = '25px Arial';
    context.fillText(`fps: ${fps}`, 10, 10);

    drawRect();
    
    // Keep the loop going
    window.requestAnimationFrame(gameLoop);
}

function drawRect() {
    let randomColor = Math.random() > 0.5? '#ff8080' : '#0099b0'
    context.fillStyle = randomColor;
    context.fillRect(200, 100, 200, 175);
}
