class GameObject
{
    constructor (context, x, y, vx, vy, mass)
    {
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.mass = mass;

        this.restitution = 0.8;
        this.isColliding = false;
    }
}