const FRICTION = 0.98;
const PIXELS_PER_METER = 10;
const GRAVITY = 9.81 * PIXELS_PER_METER;

function detectCollisions(objects) {
    let obj1;
    let obj2;
    let isCollision;
    // Reset collision state of all objects
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].isColliding = false;
    }

    // Start checking for collisions
    for (let i = 0; i < gameObjects.length; i++) {
        obj1 = gameObjects[i];
        for (let j = i + 1; j < gameObjects.length; j++) {
            obj2 = gameObjects[j];
            
            // Compare object1 with object2
            // Check collision for Squares
            // if (obj1.type === 'square' && obj2.type === 'square') {
            //     isCollision = rectIntersect(obj1.x, obj1.y, obj1.width, obj1.height, obj2.x, obj2.y, obj2.width, obj2.height);
            // }
            // Check collision for Circles
            if (obj1.type === 'circle' && obj2.type === 'circle') {
                isCollision = circleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius);
            }
            // else if (obj1.type === 'circle' && obj2.type === 'square') {
            //     isCollision = rectCircleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.width, obj2.height);
            // }
            // else if (obj1.type === 'square' && obj2.type === 'circle') {
            //     isCollision = rectCircleIntersect(obj2.x, obj2.y, obj2.radius, obj1.x, obj1.y, obj1.width, obj1.height);
            // }

            if(isCollision) {
                obj1.isColliding = true;
                obj2.isColliding = true;
                calculateColPhysics(obj1, obj2);
                obj1.handleCollision();
                obj2.handleCollision();
            }
        }
    }
}

// function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
//     // Check x and y for overlap
//     if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
//         return false;
//     }
//     return true;
// }

function circleIntersect(x1, y1, r1, x2, y2, r2) {
    // Calculate the distance between the two circles
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);

    // When the distance is smaller or equal to the sum
    // of the two radius, the circles touch or overlap
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}

// function rectCircleIntersect(x1,y1,r1,x2,y2,w2,h2) {
//     // Calculate distance between circle's center and the closest point on the square
//     let closestX = Math.max(x2, Math.min(x1, x2+w2));
//     let closestY = Math.max(y2, Math.min(y1, y2+h2));

//     let squareDistance = (x1-closestX)*(x1-closestX) + (y1-closestY)*(y1-closestY);
    
//     return squareDistance <= r1 * r1;
// }

function calculateColPhysics(obj1, obj2) {
    // Calculate the collision vector
    let vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y};

    // Calculate the distance between the two centers
    let distance = Math.sqrt((obj2.x-obj1.x)*(obj2.x-obj1.x) + (obj2.y-obj1.y)*(obj2.y-obj1.y));
    
    // Calculate the normalized collision vector (unit vector)
    let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
    
    // Calculate the relative velocity
    let vRelativeVelocity = {x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy};
    
    // Calculate the collision speed using dot product
    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
    
    speed *= Math.min(obj1.restitution, obj2.restitution);

    // Guard Clause: If objects are moving apart, ignore the collision
    if (speed < 0) {
        return;
    }
    
    let impulse = 2 * speed / (obj1.mass + obj2.mass)
    // Apply the calculated velocity to bounce objects apart
    obj1.vx -= (impulse * obj2.mass * vCollisionNorm.x);
    obj1.vy -= (impulse * obj2.mass * vCollisionNorm.y);
    obj2.vx += (impulse * obj1.mass * vCollisionNorm.x);
    obj2.vy += (impulse * obj1.mass * vCollisionNorm.y);
}

function detectEdgeCollisions(objects, canvasWidth, canvasHeight) {
    let obj;

    for(let i = 0; i < objects.length; i++) {
        obj = objects[i];
        if(obj.type === "circle") {
            if(obj.x < obj.radius) {
            obj.vx = Math.abs(obj.vx) * obj.restitution;
            obj.x = obj.radius;
            }
            else if (obj.x > canvasWidth - obj.radius) {
                obj.vx = -Math.abs(obj.vx) * obj.restitution;
                obj.x = canvasWidth - obj.radius;
            }

            if(obj.y < obj.radius) {
                obj.vy = Math.abs(obj.vy) * obj.restitution;
                obj.y = obj.radius;
            }
            else if (obj.y > canvasHeight - obj.radius) {
                obj.vy = -Math.abs(obj.vy) * obj.restitution;
                obj.y = canvasHeight - obj.radius;
                obj.vx = obj.vx * FRICTION;
            }
        }
        // else if (obj.type === 'square') {
        //     let centerX = obj.x + obj.width/2;
        //     let centerY = obj.y + obj.height/2;

        //     if(centerX < (obj.width/2)) {
        //         obj.vx = Math.abs(obj.vx) * obj.restitution;
        //         obj.x = 0;
        //     }
        //     else if (centerX > canvasWidth - (obj.width/2)) {
        //         obj.vx = -Math.abs(obj.vx) * obj.restitution;
        //         obj.x = canvasWidth - obj.width;
        //     }

        //     if(centerY < (obj.height/2)) {
        //         obj.vy = Math.abs(obj.vy) * obj.restitution;
        //         obj.y = 0;
        //     }
        //     else if (centerY > canvasHeight - (obj.height/2)) {
        //         obj.vy = -Math.abs(obj.vy) * obj.restitution;
        //         obj.y = canvasHeight - obj.height;
        //     }
        // }
    }
}