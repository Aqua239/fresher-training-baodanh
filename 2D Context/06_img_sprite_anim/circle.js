class Circle extends GameObject
{
    static numColumns = 5;
    static numRows = 2;
    static frameWidth = 0;
    static frameHeight = 0;
    static sprite;

    loadImage() {
        if(!Circle.sprite)
        {
            Circle.sprite = new Image();

            Circle.sprite.onload = () => {
                Circle.frameWidth = Circle.sprite.width / Circle.numColumns;
                Circle.frameHeight = Circle.sprite.height / Circle.numRows;
            }

            Circle.sprite.src = "./img/spritesheet.png";
        }
    }
    
    constructor (context, x, y, radius, vx, vy, density = 1)
    {
        // Calculate mass
        let area = Math.PI * radius * radius;
        let calMass = density * area;
        super(context, x, y, vx, vy, calMass);
        // Set default
        this.type = 'circle';
        this.radius = radius;
        this.currentFrame = 0;
        this.loadImage();
    }

    
    draw()
    {
        let maxFrame = Circle.numColumns * Circle.numRows - 1;
        if (this.currentFrame > maxFrame) {
            this.currentFrame = maxFrame;
        }

        // Update rows and columns
        let column = this.currentFrame % Circle.numColumns;
        let row = Math.floor(this.currentFrame / Circle.numColumns);

        this.context.drawImage(Circle.sprite, column * Circle.frameWidth, row * Circle.frameHeight, Circle.frameWidth, Circle.frameHeight, (this.x - this.radius), (this.y - this.radius) - this.radius * 0.4, this.radius * 2, this.radius * 2.42);
    
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.stroke();
    }

    handleCollision()
    {
        this.currentFrame++;
    }
    
    update(secondsPassed)
    {
        // Calculate the angle (vy before vx)
        let radians = Math.atan2(this.vy, this.vx);

        // Convert to degrees
        let degrees = 180 * radians / Math.PI;

        // Apply acceleration
        this.vy += GRAVITY * secondsPassed;

        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }        
}