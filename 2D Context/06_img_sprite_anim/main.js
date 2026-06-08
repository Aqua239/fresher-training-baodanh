let canvas
let context
let img = new Image();

window.onload = init;

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
   
    draw_ex2();
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