"use strict" // Strict mode

// Init
let canvas;
let context;
window.onload = init; // Run init() only after the page is fully loaded

function init() {
    canvas = document.getElementById('canvas'); // Get canvas element reference
    context = canvas.getContext('2d'); // Get 2D rendering context

    draw();
}

function draw() {
    let randomColor = Math.random() > 0.5? '#ff8080' : '#0099b0' // Random between '#ff8080' : '#0099b0'

    context.fillStyle = randomColor; // Set fill color
    context.fillRect(300, 150, 400, 350); // draw rectangle (x, y, width, height)
}