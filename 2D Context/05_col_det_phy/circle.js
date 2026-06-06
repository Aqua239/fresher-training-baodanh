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
    }

    update(secondsPassed)
    {
        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }        
}