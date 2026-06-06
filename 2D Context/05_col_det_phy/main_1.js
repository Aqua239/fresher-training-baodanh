let secondsPassed = 0;
let oldTimeStamp = 0;
let gameObjects = [];

// Init
let canvas;
let context;
window.onload = init; 

function init()
{
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    createWorld();
    window.requestAnimationFrame(gameLoop);
}

function clearCanvas()
{
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function createWorldSquare()
{
    gameObjects = [
    new Square(context, 250, 50, 0, 50),
    new Square(context, 250, 300, 0, -50),
    new Square(context, 150, 0, 50, 50),
    new Square(context, 250, 150, 50, 50),
    new Square(context, 350, 75, -50, 50),
    new Square(context, 300, 300, 50, -50)
    ];
}

function createWorldCircle()
{
    gameObjects = [
    new Circle(context, 250, 50, 0, 50),
    new Circle(context, 250, 300, 0, -50),
    new Circle(context, 150, 0, 50, 50),
    new Circle(context, 250, 150, 50, 50),
    new Circle(context, 350, 75, -50, 50),
    new Circle(context, 300, 300, 50, -50)
    ];
}

function createWorld()
{
    gameObjects = [
    new Circle(context, 250, 50, 0, 50),
    new Circle(context, 250, 300, 0, -50),
    new Circle(context, 150, 0, 50, 50),
    new Square(context, 250, 150, 50, 50),
    new Square(context, 350, 75, -50, 50),
    new Square(context, 300, 300, 50, -50)
    ];
}

function gameLoop(timeStamp)
{
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    for (let i = 0; i < gameObjects.length; i++) 
    {
        gameObjects[i].update(secondsPassed);
    }

    clearCanvas();
    detectCollisions(gameObjects);

    for (let i = 0; i < gameObjects.length; i++)
    {
        gameObjects[i].draw();
    }

    window.requestAnimationFrame(gameLoop);
}
