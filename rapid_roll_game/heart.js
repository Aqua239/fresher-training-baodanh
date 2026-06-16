const HEART_IMG = new Image();
HEART_IMG.src = "./img/heart.png";

class Heart extends GameObject {
    constructor(context, x, y, width, height, speed) {
        super(context, x, y, width, height, 0, speed);
        this.img = HEART_IMG;
        this.speed = speed;
    }

    update(secondsPassed) {
        super.update(secondsPassed);
    }

    draw() {
        if(this.img.complete) {
            this.context.imageSmoothingEnabled = false;
            this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    isOffScreen() {
        if(this.y < 0 + 45){
            return true;
        }
        return false;
    }
}