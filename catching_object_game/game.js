let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 520;

    gameWorld = new Game(canvas);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

const BACKGROUND_COLOR = "#0f172a";
const FLOOR_COLOR = "#1e293b";
const CATCHER_WIDTH = 110;
const CATCHER_HEIGHT = 28;
const START_LIVES = 3;
const FALL_SPEED = 180;
const OBSTACLE_SPEED = 180;
const CATCHER_SPEED = 520;
const MAX_CATCHER_SPEED = 1000;
const TIME_SPAWN = 1.1;
const SOFT_CAP = 3; //Soft cap speed game
const SPEED_UP_THRESHOLD = 8; // Number of Objects needed to increase speed/level
const HEART_THRESHOLD = 15; // Number of Objects needed to spawn 1 heart
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.ui = new GameUI(canvas);

        this.score = 0;
        this.level = 0;
        this.lives = START_LIVES;
        this.run = false;
        this.gameOver = false;
        this.oldTimeStamp = 0;
        this.spawnTimer = 0;
        this.spawnTime = TIME_SPAWN;
        this.lastSpawnColumn = 9;

        this.catchCount = 0;
        this.gameSpeed = 0;
        this.currentMul = 0.2;

        this.fallingObjects = [];
        this.obstacles = [];
        this.hearts = [];
        this.needHeart = false;
        
        this.createActors();
        this.listenForPlayerInput();
        this.draw();
        this.showStart();
    }

    createActors() {
        this.catcher = new Catcher(
            this.context,
            this.width / 2 - CATCHER_WIDTH / 2,
            this.height - 64,
            CATCHER_WIDTH,
            CATCHER_HEIGHT
        );
    }

    listenForPlayerInput() {
        window.addEventListener("keydown", (event) => {
            if (event.code === "ArrowLeft") {
                this.catcher.moveLeft = true;
            } else if (event.code === "ArrowRight") {
                this.catcher.moveRight = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.code === "ArrowLeft") {
                this.catcher.moveLeft = false;
            } else if (event.code === "ArrowRight") {
                this.catcher.moveRight = false;
            }
        });

        // this.canvas.addEventListener("mousemove", (event) => {
        //     if (!this.run || this.gameOver) {
        //         return;
        //     }

        //     this.catcher.moveToCenter(this.canvasX(event.clientX), this.width);
        // });

        this.canvas.addEventListener("touchmove", (event) => {
            if (!this.run || this.gameOver) {
                return;
            }

            let touch = event.targetTouches[0];
            this.catcher.moveToCenter(this.canvasX(touch.clientX), this.width);
        });
    }

    gameLoop(timeStamp) {
        let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000 || 0;
        secondsPassed = Math.min(secondsPassed, 0.05);
        this.oldTimeStamp = timeStamp;

        if (this.run) {
            this.update(secondsPassed);
        }

        this.draw();
        window.requestAnimationFrame((nextTimeStamp) => this.gameLoop(nextTimeStamp));
    }

    update(secondsPassed) {
        this.catcher.update(secondsPassed, this.width);

        //Speed Game
        this.level = Math.floor(this.catchCount / SPEED_UP_THRESHOLD)
        
        if(this.gameSpeed > SOFT_CAP){
            this.currentMul = 0.02;
            this.gameSpeed = SOFT_CAP + (this.currentMul * this.level);
        }
        else {
            this.gameSpeed = 1 + (this.currentMul * this.level);
        }


        // TODO: Spawn falling objects and obstacles.
        // Hint: call this.spawnItems(secondsPassed).
        this.catcher.speed = Math.min(MAX_CATCHER_SPEED, CATCHER_SPEED * this.gameSpeed);
        this.spawnItems(secondsPassed);

        // TODO: Update falling objects and obstacles.
        // Hint: loop over this.fallingObjects and this.obstacles.
        for(let i = 0; i < this.fallingObjects.length; i++){
            this.fallingObjects[i].update(secondsPassed);
        }

        for(let i = 0; i < this.obstacles.length; i++){
            this.obstacles[i].update(secondsPassed);
        }

        for(let i = 0; i < this.hearts.length; i++){
            this.hearts[i].update(secondsPassed);
        }

        // TODO: Check if catcher touches a falling object.
        // If yes, increase score and remove that object.
        for(let i = this.hearts.length - 1; i >= 0; i--){
            let obj = this.hearts[i];
            if(obj.isTouching(this.catcher)){
                this.lives++;
                this.hearts.splice(i, 1);
                this.catchCount++;
                this.score += 100;
            }
            if(obj.isOffScreen(this.height)){
                this.hearts.splice(i, 1);
            }
        }
        
        for(let i = this.fallingObjects.length - 1; i >= 0; i--){
            let obj =  this.fallingObjects[i];
            if(obj.isTouching(this.catcher)){
                this.catchCount++;
                if (this.catchCount % HEART_THRESHOLD === 0 && this.score != 0) {
                    this.needHeart = true;
                }
                this.score += 100;
                this.fallingObjects.splice(i, 1);
            }
            if(obj.isOffScreen(this.height)){
                this.lives--;
                this.fallingObjects.splice(i, 1);
            }
        }

        // TODO: Check if catcher touches an obstacle.
        // If yes, lose a life and remove that obstacle.
        for(let i = this.obstacles.length - 1; i >= 0; i--){
            let obj = this.obstacles[i];
            if(obj.isTouching(this.catcher)){
                this.lives--;
                this.obstacles.splice(i, 1);
            }
            if(obj.isOffScreen(this.height)){
                this.obstacles.splice(i, 1);
            }
        }
        // TODO: Remove items that leave the screen.
        // If a falling object reaches the bottom, lose a life.
        // TODO: If lives is 0, set gameOver and show restart UI.
        if (this.lives <= 0) {
            this.showGameOver();
        }
    }

    spawnItems(secondsPassed) {
        this.spawnTimer += secondsPassed; 
        if (this.spawnTimer < (this.spawnTime/this.gameSpeed)) {
            return;
        }

        this.spawnTimer = 0;
        // LOGIC SPAWN NEO
        let maxDistance = 9;
        let minCol = Math.max(0, this.lastSpawnColumn - maxDistance);
        let maxCol = Math.min(18, this.lastSpawnColumn + maxDistance);
        
        let columnIndex = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;
        
        // let columnIndex = Math.floor(Math.random() * 19)
        let columnWidth = this.width/19;
        let x = columnIndex * columnWidth;
        let shouldSpawnObstacle = Math.random() < 0.3;

        if(this.needHeart) {
            this.hearts.push(new HeartObject(this.context, x + ((columnWidth - 40)/2), -40, 40, FALL_SPEED * this.gameSpeed));
            this.needHeart = false;
            this.lastSpawnColumn = columnIndex;
        }
        else if(shouldSpawnObstacle){
            this.obstacles.push(new Obstacle(this.context, x - ((44 - columnWidth)/2), -36, 44, 28, OBSTACLE_SPEED * this.gameSpeed));
        }
        else{
            this.fallingObjects.push(new FallingObject(this.context, x + ((columnWidth - 32)/2), -32, 32, FALL_SPEED * this.gameSpeed));
            this.lastSpawnColumn = columnIndex;
        }

        // TODO: Randomly create either a FallingObject or an Obstacle.
        // Helpful values:
        //let x = Math.random() * (this.width - 40);
        //let shouldSpawnObstacle = Math.random() < 0.3;
        //
        // Falling object example:
        //this.fallingObjects.push(new FallingObject(this.context, x, -32, 32, FALL_SPEED));
        //
        // Obstacle example:
        //this.obstacles.push(new Obstacle(this.context, x, -36, 44, 28, OBSTACLE_SPEED));
    }

    start() {
        this.run = true;
        this.gameOver = false;
        this.oldTimeStamp = performance.now();
        this.ui.hideMessage();
    }

    restart() {
        this.score = 0;
        this.level = 0;
        this.lives = START_LIVES;
        this.run = true;
        this.gameOver = false;
        this.spawnTimer = 0;
        this.lastSpawnColumn = 9;
        this.catchCount = 0;
        this.gameSpeed = 1;
        this.currentMul = 0.2;
        this.hearts = [];
        this.needHeart = false;
        this.fallingObjects = [];
        this.obstacles = [];
        this.createActors();
        this.oldTimeStamp = performance.now();
        this.ui.hideMessage();
    }

    showStart() {
        this.ui.showMessage("Catch Objects", "Start", () => this.start());
    }

    showGameOver() {
        this.run = false;
        this.gameOver = true;
        this.ui.showMessage("Game Over", "Restart", () => this.restart());
    }

    draw() {
        this.clear();
        this.drawBackground();
        this.fallingObjects.forEach((fallingObject) => fallingObject.draw());
        this.obstacles.forEach((obstacle) => obstacle.draw());
        this.hearts.forEach((heart) => heart.draw());
        this.catcher.draw();
        this.ui.updateGameInfo(this.score, this.lives, this.level + 1);
    }

    drawBackground() {
        this.context.fillStyle = BACKGROUND_COLOR;
        this.context.fillRect(0, 0, this.width, this.height);

        this.context.fillStyle = "rgba(125, 211, 252, 0.08)";
        for (let x = 0; x < this.width; x += 42) {
            this.context.fillRect(x, 0, 1, this.height);
        }

        this.context.fillStyle = FLOOR_COLOR;
        this.context.fillRect(0, this.height - 36, this.width, 36);
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    canvasX(clientX) {
        let rect = this.canvas.getBoundingClientRect();
        let scaleX = this.canvas.width / rect.width;
        return (clientX - rect.left) * scaleX;
    }
}
