const SPIKED_PLATFORM_OBJ = new Image();
SPIKED_PLATFORM_OBJ.src = "./img/spiked_platform.png";

class SpikedPlatform extends GameObject {
    constructor(context, x, y, width, height, speed) {
        super(context, x, y, width, height, 0, speed);
        this.img = SPIKED_PLATFORM_OBJ;
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

    isOffScreen() {
        if(this.y < 0 + 45){
            return true;
        }
        return false;
    }
}