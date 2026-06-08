let secondsPassed = 0;
let oldTimeStamp = 0;
let gameObjects = [];
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

// Init
let canvas;
let context;
window.onload = init; 

function init()
{
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    createWorldCircle();
    window.requestAnimationFrame(gameLoop);
}

function clearCanvas()
{
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function createWorldSquare()
{
    gameObjects = [
    new Square(context, 250, 50, 50, 50, 0, 50, 1),
    new Square(context, 250, 300, 50, 50, 0, -50, 1),
    new Square(context, 150, 0, 50, 50, 50, 50, 1),
    new Square(context, 250, 150, 50, 50, 50, 50, 1),
    new Square(context, 350, 75, 50, 50, -50, 50, 1),
    new Square(context, 300, 300, 50, 50, 50, -50, 1)
    ];
}

function createWorldCircle(){
    gameObjects = [    
    new Circle(context, 100, 75, 10, 10, 30, 1),
    new Circle(context, 400, 50, 10, 0, 50, 1),
    new Circle(context, 700, 75, 10, -40, 30, 1),
    new Circle(context, 50, 300, 10, 50, 0, 1),
    new Circle(context, 750, 300, 10, -50, 0, 1),
    new Circle(context, 100, 525, 10, 40, -30, 1),
    new Circle(context, 400, 550, 10, 0, -50, 1),
    new Circle(context, 700, 525, 10, -40, -30, 1),
    new Circle(context, 250, 150, 10, 35, 35, 1),
    new Circle(context, 550, 450, 10, -35, -35, 1),
    ];
}

function createWorldSC()
{
    gameObjects = [    
    new Circle(context, 100, 75, 10, 40, 30, 1),
    new Circle(context, 400, 50, 25, 0, 50, 1),
    new Circle(context, 700, 75, 10, -40, 30, 1),
    new Circle(context, 50, 300, 25, 50, 0, 1),
    new Circle(context, 750, 300, 25, -50, 0, 1),
    new Circle(context, 100, 525, 40, 40, -30, 1),
    new Circle(context, 400, 550, 25, 0, -50, 1),
    new Circle(context, 700, 525, 10, -40, -30, 1),
    new Circle(context, 250, 150, 10, 35, 35, 1),
    new Circle(context, 550, 450, 25, -35, -35, 1),
    new Square(context, 250, 300, 50, 50, 0, -50, 1),
    new Square(context, 150, 0, 50, 50, 50, 50, 1),
    new Square(context, 250, 150, 50, 50, 50, 50, 1),
    new Square(context, 350, 75, 50, 50, -50, 50, 1),
    new Square(context, 300, 300, 50, 50, 50, -50, 1)
    ];
}

function gameLoop(timeStamp)
{
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    secondsPassed =  Math.min(secondsPassed, 0.1);

    for (let i = 0; i < gameObjects.length; i++) 
    {
        gameObjects[i].update(secondsPassed);
    }

    clearCanvas();
    detectCollisions(gameObjects);
    detectEdgeCollisions(gameObjects, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < gameObjects.length; i++)
    {
        gameObjects[i].draw();
    }

    window.requestAnimationFrame(gameLoop);
}
