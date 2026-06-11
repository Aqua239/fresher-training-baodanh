const HEART_IMAGE = new Image();
HEART_IMAGE.src = "./img/heart.png";
class HeartObject extends GameObject {
    constructor(context, x, y, size, speed) {
        super(context, x, y, size, size, 0, speed);
        this.caught= false;

        this.img = HEART_IMAGE;
    }

    update(secondsPassed) {
        super.update(secondsPassed);
    }

    draw() {
        if(this.img.complete) {
            this.context.imageSmoothingEnabled = true;
            this.context.imageSmoothingQuality = 'high';
            this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    isOffScreen(boardHeight) {
        if(this.y > boardHeight - 64){
            return true;
        }
        return false;
    }
}

