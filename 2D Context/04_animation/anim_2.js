"use strict"
// Rectangle's current position
let rectX = 0;
let rectY = 0;

// Variables for calculating Delta Time    
let timePassed = 0;
let secondsPassed = 0;
let oldTimeStamp = 0;

// Init
let canvas
let context
window.onload = init;

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    
    secondsPassed =  Math.min(secondsPassed, 0.1);

    update(secondsPassed);
    draw();

    window.requestAnimationFrame(gameLoop);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#ff8080';
    context.fillRect(rectX, rectY, 150, 100);
}

function update(secondsPassed) {
    timePassed += secondsPassed;
    
    rectX = easeInOutQuint(timePassed, 0, 500, 1.5);
    rectY = easeLinear(timePassed, 50, 250, 1.5);
}

// t = current time, b = beginning value, c = change in value, d = duration 
function easeInOutQuint(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
}

function easeInOutCubic(t, b, c, d)  {
    let x = t / d;
    if (x > 1) x = 1;
    let y = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    return b + (c * y);
}

function easeLinear (t, b, c, d) {
    return c * t / d + b;
}