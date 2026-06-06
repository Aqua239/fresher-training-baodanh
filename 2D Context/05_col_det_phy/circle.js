class Circle extends GameObject
{
    constructor (context, x, y, radius, vx, vy, density = 1)
    {
        // Calculate mass
        let area = Math.PI * radius * radius;
        let calMass = density * area;
        super(context, x, y, vx, vy, calMass);
        // Set default
        this.type = 'circle';
        this.radius = radius;
    }

    draw()
    {
        //Draw a simple circle
        this.context.fillStyle = this.isColliding ?  '#ff8080' : '#0099b0';
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();

        // Draw heading vector
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x + this.vx, this.y + this.vy);
        this.context.stroke();
    }

    update(secondsPassed)
    {
        // Calculate the angle (vy before vx)
        let radians = Math.atan2(this.vy, this.vx);

        // Convert to degrees
        let degrees = 180 * radians / Math.PI;

        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }        
}