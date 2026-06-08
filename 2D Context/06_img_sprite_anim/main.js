let secondsPassed = 0;
let oldTimeStamp = 0;
let gameObjects = [];
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

window.onload = init;

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
   
    createWorldCircle();
    window.requestAnimationFrame(gameLoop);
}

function draw_ex1() {
    let img = new Image();
    img.onload = function() {
        context.drawImage(img, 10, 30) // img, x, y, width, height
        context.drawImage(img, 250, 30, img.width / 2, img.height / 2);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(img, 450, 30, img.width / 3, img.height / 3);

        context.drawImage(img, 100, 0, 200, 50, 10, 400, 200, 50); //img, sx, sy, swidth, sheight, x, y, width, height
    }
    img.src = "./img/bottle.png";
}

function draw_ex2() {
    let sprite = new Image();
    let numColumns = 5;
    let numRows = 2;

    sprite.onload = function() {
        let frameWidth = sprite.width / numColumns; 
        let frameHeight = sprite.height / numRows;
        
        let currentFrame = 0;
        setInterval(function() {
            currentFrame++;

            let maxFrame = numColumns * numRows -1;
            if(currentFrame > maxFrame) {
                currentFrame = 0;
            }

            let column = currentFrame % numColumns;
            let row = Math.floor(currentFrame / numColumns);

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(sprite, column * frameWidth, row * frameHeight, frameWidth, frameHeight, 10, 30, frameWidth, frameHeight);
        }, 100);
    }
    sprite.src = "./img/spritesheet.png";
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

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(timeStamp) {
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