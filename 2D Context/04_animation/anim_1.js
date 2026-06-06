"use strict"
// Rectangle's current position
let rectX = 0;
let rectY = 0;

// Variables for calculating Delta Time
let secondsPassed = 0;
let oldTimeStamp = 0;

// Movement speed in pixels per second
let movingSpeed = 10; 

// Init
let canvas;
let context;
window.onload = init;

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    window.requestAnimationFrame(gameLoop);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#ff8080';
    context.fillRect(rectX, rectY, 150, 100);
}

function gameLoop(timeStamp) {
    // Calculate time between frames and convert it to seconds
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    
    secondsPassed =  Math.min(secondsPassed, 0.1); // normal: Hz / 1000 < 0.1

    update(secondsPassed);
    draw();

    window.requestAnimationFrame(gameLoop);
}

function update(secondsPassed) {
    // Move the rectangle based on speed and time
    rectX += (movingSpeed * secondsPassed);
    rectY += (movingSpeed * secondsPassed);
}