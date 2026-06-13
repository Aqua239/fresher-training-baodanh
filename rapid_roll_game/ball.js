const BALL_IMAGE = new Image();
BALL_IMAGE.src = "./img/ball.png";

class Ball extends GameObject {
    constructor(context, x, y, width, height, falling_speed, speed) {
        super(context, x, y, width, height, falling_speed, speed);
        this.img = BALL_IMAGE;
        this.falling_speed = falling_speed;
        this.speed = speed;
    }

    update(secondsPassed) {
        super.update(secondsPassed);
    }

    update(secondsPassed, boardWidth) {
        this.y += this.falling_speed *secondsPassed;
        if(this.moveLeft){
            this.x -= this.speed * secondsPassed;
        }
        else if (this.moveRight){
            this.x += this.speed * secondsPassed;
        }
        this.keepInside(boardWidth);
    }

    moveToCenter(centerX, boardWidth) {
        this.x = centerX - this.width / 2;
        this.keepInside(boardWidth);
    }

    keepInside(boardWidth) {
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > boardWidth) {
            this.x = boardWidth - this.width;
        }
    }

    draw() {
        if(this.img.complete) {
            this.context.imageSmoothingEnabled = false;
            this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    isOffScreenTop() {
        if(this.y < 0 + 45){
            return true;
        }
        return false;
    }

    isOffScreenBottom(boardHeight) {
        if(this.y > boardHeight){
            return true;
        }
        return false;
    }

}