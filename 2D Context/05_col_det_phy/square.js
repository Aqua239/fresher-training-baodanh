class Square extends GameObject
{
    constructor (context, x, y, width, height, vx, vy, density = 1)
    {
        // Calculate mass
        let area = width * height
        let calMass = density * area;
        super(context, x, y, vx, vy, calMass);
        // Set default
        this.type = 'square';
        this.width = width;
        this.height = height;
    }

    draw()
    {
        let centerX = this.x + this.width/2;
        let centerY = this.y + this.height/2;
        
        // Draw a simple square
        this.context.fillStyle = this.isColliding? '#ff8080' : '#0099b0';
        this.context.fillRect(this.x, this.y, this.width, this.height);

        // Draw heading vector
        this.context.beginPath();
        this.context.moveTo(centerX, centerY);
        this.context.lineTo(centerX + this.vx, centerY + this.vy);
        this.context.stroke();
    }

    update(secondsPassed)
    {
        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }
}