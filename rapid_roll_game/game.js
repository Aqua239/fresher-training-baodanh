let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 700;

    gameWorld = new Game(canvas);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
}

const BALL_EDGE = 40;
const BALL_SPEED = 1000;
const BALL_FALLING_SPEED = 400;

const PLATFORM_WIDTH = 189;
const PLATFORM_HEIGHT = 27;
const PLATFORM_SPEED = 120;

const HEART_WIDTH = 36;
const HEART_HEIGHT = 42;
const HEART_SPEED = PLATFORM_SPEED; 

const HEART_RATE = 750;
const SPIKED_RATE = 0.3;
const SPIKED_REDUCTION_RATE = 0.15;

const START_LIVES = 2;
const TIME_SPAWN = 1.2;
const START_SPAWN_X = 400;
const START_SPAWN_Y = 400;
const SPIKED_TOP = new Image();
SPIKED_TOP.src = "./img/spiked_top.png"
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.ui = new GameUI(canvas);
        this.img = SPIKED_TOP;

        this.score = 0;
        this.lives = START_LIVES;
        this.run = false;
        this.gameOver = false;
        this.oldTimeStamp = 0;
        this.spawnTimer = 0;
        this.spawnTime = TIME_SPAWN;
        this.currentSpike = 0;
        this.lastHeartScore = 0;
        this.isHeartPending = false;
        this.isWaitingToSpawnBall = true;

        this.gameSpeed = 1;
        this.multiplier = 0.02;

        this.normalObjects = [];
        this.spikedObjects = [];
        this.heartObjects = [];

        this.initStartingPlatform();
        this.createActors();
        this.listenForPlayerInput();
        this.draw();
        this.showStart();
    }

    saveSpawnPoint(widthObject) {
        for(let i = 0; i < this.normalObjects.length; i++) {
            if(this.normalObjects[i].y > 300 && this.normalObjects[i].y < this.height) {
                let x = this.normalObjects[i].x + (PLATFORM_WIDTH / 2);
                let y = this.normalObjects[i].y - widthObject;
                return {saveSpawnX: x, saveSpawnY: y};
            }
        }
        return null;
    }

    createActors() {
        let spawnBall = this.saveSpawnPoint(BALL_EDGE);
        if(spawnBall) {
            this.ball = new Ball(
                this.context,
                spawnBall.saveSpawnX - (BALL_EDGE/2),
                spawnBall.saveSpawnY,
                BALL_EDGE,
                BALL_EDGE,
                BALL_FALLING_SPEED,
                BALL_SPEED
            )
            this.isWaitingToSpawnBall = false;
        }
    }

    initStartingPlatform() {
        this.normalObjects.push(new NormalPlatform(this.context, START_SPAWN_X - (PLATFORM_WIDTH / 2), START_SPAWN_Y, PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
        for(let i = 1; i < 4; i++) {
            let verticalSpacing = 130;
            let temp = Math.random() * this.width;
            let x = temp > (this.width - PLATFORM_WIDTH) ? (this.width - PLATFORM_WIDTH) : temp;
            let shouldSpawnSpiked = Math.random() < 0.1;
            if(shouldSpawnSpiked) {
                this.spikedObjects.push(new SpikedPlatform(this.context, x, START_SPAWN_Y + (verticalSpacing * i), PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
            }
            else {
                this.normalObjects.push(new NormalPlatform(this.context, x, START_SPAWN_Y + (verticalSpacing * i), PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
            }
        }  
    }

    listenForPlayerInput() {
        window.addEventListener("keydown", (event) => {
            if (event.code === "ArrowLeft") {
                this.ball.moveLeft = true;
            } else if (event.code === "ArrowRight") {
                this.ball.moveRight = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.code === "ArrowLeft") {
                this.ball.moveLeft = false;
            } else if (event.code === "ArrowRight") {
                this.ball.moveRight = false;
            }
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
        if (this.gameSpeed < 3.0) {
            this.gameSpeed += this.multiplier * secondsPassed;
        }
        else {
            this.gameSpeed += (this.multiplier * secondsPassed) / 10;
        }
        this.spawnPlatform(secondsPassed);

        for(let i = 0; i < this.normalObjects.length; i++) {
            this.normalObjects[i].update(secondsPassed * this.gameSpeed);
        }

        for(let i = 0; i < this.spikedObjects.length; i++) {
            this.spikedObjects[i].update(secondsPassed * this.gameSpeed);
        }

        for(let i = 0; i < this.heartObjects.length; i++) {
            this.heartObjects[i].update(secondsPassed * this.gameSpeed);
        }

        let currentIntScore = Math.floor(this.score);
        if(currentIntScore >= this.lastHeartScore + HEART_RATE) {
            this.lastHeartScore += HEART_RATE;
            this.isHeartPending = true;
        }

        if (this.isWaitingToSpawnBall){
            this.createActors();
        }

        if (this.ball) {
            let oldY = this.ball.y;
            this.ball.update(secondsPassed, this.width);
            if(this.ball.isOffScreenBottom(this.height)) {
                this.checkGameOver();
                return;
            }
            else if (this.ball.isOffScreenTop()) {
                this.checkGameOver();
                return;
            }

            let currentlyStandingOn = null;
            for(let i = this.normalObjects.length - 1; i >= 0; i--) {
                let obj = this.normalObjects[i];
                if(obj.isTouching(this.ball)) {
                    if(this.ball.y + (BALL_EDGE / 2) < obj.y) {
                        this.ball.y = obj.y - BALL_EDGE;
                    }
                }
                else if (obj.isOffScreen()) {
                    this.normalObjects.splice(i, 1);
                }
            }
            
            for(let i = this.spikedObjects.length - 1; i >= 0; i--) {
                let obj = this.spikedObjects[i];
                if(obj.isTouching(this.ball)) {
                    this.checkGameOver();
                    return;
                }
                else if (obj.isOffScreen()) {
                    this.spikedObjects.splice(i, 1);
                }
            }

            for(let i = this.heartObjects.length - 1; i >= 0; i--) {
                let obj = this.heartObjects[i];
                if(obj.isTouching(this.ball)) {
                    this.lives++;
                    this.heartObjects.splice(i, 1);
                }
                else if (obj.isOffScreen()) {
                    this.heartObjects.splice(i, 1);
                }
            }

            let ballMoveY = this.ball.y - oldY;
            let platformMoveY = PLATFORM_SPEED * secondsPassed * this.gameSpeed;
            let depthChange = platformMoveY + ballMoveY;
            if (depthChange > 0) {
                this.score += depthChange / 10;
            }
        }
    }

    checkGameOver() {
        if(this.lives > 1) {
            this.lives--;
            this.ball = null;
            setTimeout(() => {
                this.isWaitingToSpawnBall = true;       
            }, 1000);
        }
        else {
            this.lives--;
            this.showGameOver();
        }
    }

    spawnPlatform(secondsPassed) {
        this.spawnTimer += secondsPassed;
        if (this.spawnTimer < (this.spawnTime/ this.gameSpeed)) {
            return;
        }
        this.spawnTimer = 0;
        let temp = Math.random() * this.width;
        let x = temp > (this.width - PLATFORM_WIDTH) ? (this.width - PLATFORM_WIDTH) : temp;
        let y = this.height + 70;
        let shouldSpawnSpiked = Math.random() < (SPIKED_RATE - this.currentSpike * SPIKED_REDUCTION_RATE);

        if(shouldSpawnSpiked) {
            this.spikedObjects.push(new SpikedPlatform(this.context, x, y, PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
            this.currentSpike++;
        }
        else {
            if(this.isHeartPending){
                this.heartObjects.push(new Heart(this.context, x + (PLATFORM_WIDTH/2) - (HEART_WIDTH/2), y  - HEART_HEIGHT, HEART_WIDTH, HEART_HEIGHT, -HEART_SPEED));
                this.normalObjects.push(new NormalPlatform(this.context, x, y, PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
                this.isHeartPending = false;
            }
            else{
                this.normalObjects.push(new NormalPlatform(this.context, x, y, PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
            }
            this.currentSpike = 0;
        }
    }

    start() {
        this.run = true;
        this.gameOver = false;
        this.oldTimeStamp = performance.now();
        this.ui.hideMessage();
    }

    restart() {
        this.score = 0;
        this.lives = START_LIVES;
        this.run = true;
        this.gameOver = false;
        this.spawnTimer = 0;
        this.lastHeartScore = 0;
        this.isHeartPending = false;
        this.isWaitingToSpawnBall = true;
        this.gameSpeed = 1;
        this.normalObjects = [];
        this.spikedObjects = [];
        this.heartObjects = [];
        this.initStartingPlatform();
        this.createActors();
        this.oldTimeStamp = performance.now();
        this.ui.hideMessage();
    }

    showStart() {
        this.ui.showMessage("Rapid Roll", "Start", () => this.start());
    }

    showGameOver() {
        this.run = false;
        this.gameOver = true;
        this.ui.showMessage("Game Over", "Restart", () => this.restart());
    }

    draw() {
        this.clear();
        this.drawSpikedTop();
        this.normalObjects.forEach((normalObject) => normalObject.draw());
        this.spikedObjects.forEach((spikedObject) => spikedObject.draw());
        this.heartObjects.forEach((heart) => heart.draw());
        if(this.ball) {
            this.ball.draw();
        }
        this.ui.updateGameInfo(Math.floor(this.score), this.lives);
    }

    drawSpikedTop() {
        if(this.img.complete) {
            this.context.imageSmoothingEnabled = false;
            this.context.drawImage(this.img, 0, 0, this.width, 45);
        }
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
