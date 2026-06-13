const NORMAL_PLATFORM_OBJ = "#111827";

class NormalPlatform extends GameObject {
    constructor(context, x, y, width, height, speed) {
        super(context, x, y, width, height, 0, speed);
        this.speed = speed;
    }

    update(secondsPassed) {
        super.update(secondsPassed);
    }

    draw() {
        this.context.fillStyle = NORMAL_PLATFORM_OBJ;
        this.context.fillRect(this.x, this.y, this.width, this.height)
    }

    isOffScreen() {
        if(this.y < 0 + 45){
            return true;
        }
        return false;
    }
}