class Circle extends GameObject
{
    constructor (context, x, y, vx, vy)
    {
        super(context, x, y, vx, vy);
        // Set default radius, start angle, end angle
        this.type = 'circle';
        this.radius = 25;
        this.startAngle = 0;
        this.endAngle = 2 * Math.PI;
    }

    draw()
    {
        //Draw a simple circle
        this.context.fillStyle = this.isColliding ?  '#ff8080' : '#0099b0';
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
        this.context.fill();
    }

    update(secondsPassed)
    {
        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }        
}