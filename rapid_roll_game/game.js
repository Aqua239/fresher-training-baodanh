let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 800;

    gameWorld = new Game(canvas);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
}

const BALL_EDGE = 40;
const BALL_SPEED = 700;
const BALL_FALLING_SPEED = 300;
const START_LIVES = 2;
const PLATFORM_SPEED = 120;
const TIME_SPAWN = 1;
const PLATFORM_WIDTH = 189;
const PLATFORM_HEIGHT = 27;
const SPIKED_REDUCTION_RATE = 0.1; 
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

        this.gameSpeed = 1;
        this.currentMul = 0.2;

        this.normalObjects = [];
        this.spikedObjects = [];

        this.createActors();
        this.listenForPlayerInput();
        this.draw();
        this.showStart();
    }

    createActors(){
        this.ball = new Ball(
            this.context,
            this.width / 3,
            this.height / 3,
            BALL_EDGE,
            BALL_EDGE,
            BALL_FALLING_SPEED,
            BALL_SPEED
        )
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
        this.ball.update(secondsPassed, this.width);

        if(this.ball.isOffScreenBottom(this.height)) {
            this.checkGameOver();
        }
        else if (this.ball.isOffScreenTop()) {
            this.checkGameOver();
        }

        this.spawnPlatform(secondsPassed);

        for(let i = 0; i < this.normalObjects.length; i++) {
            this.normalObjects[i].update(secondsPassed * this.gameSpeed);
        }

        for(let i = 0; i < this.spikedObjects.length; i++) {
            this.spikedObjects[i].update(secondsPassed * this.gameSpeed);
        }

        for(let i = this.normalObjects.length - 1; i >= 0; i--) {
            let obj = this.normalObjects[i];
            if(obj.isTouching(this.ball)) {
                if(this.ball.y + (BALL_EDGE / 4) < obj.y) {
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
            }
            else if (obj.isOffScreen()) {
                this.spikedObjects.splice(i, 1);
            }
        }
    }

    checkGameOver() {
        if(this.lives > 1) {
            this.lives--;
            this.createActors();
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
        let temp = Math.random() * 800;
        let x = temp > (800 - PLATFORM_WIDTH) ? (800-PLATFORM_WIDTH) : temp;
        let shouldSpawnSpiked = Math.random() < (0.3 - this.currentSpike * SPIKED_REDUCTION_RATE);

        if(shouldSpawnSpiked) {
            this.spikedObjects.push(new SpikedPlatform(this.context, x, this.height + PLATFORM_HEIGHT, PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
            this.currentSpike++;
        }
        else {
            this.normalObjects.push(new NormalPlatform(this.context, x, this.height + PLATFORM_HEIGHT, PLATFORM_WIDTH, PLATFORM_HEIGHT, -PLATFORM_SPEED));
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
        this.normalObjects = [];
        this.spikedObjects = [];
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
        this.ball.draw();
        this.ui.updateGameInfo(this.score, this.lives);
    }

    drawSpikedTop() {
        if(this.img.complete) {
            this.context.imageSmoothingEnabled = false;
            this.context.drawImage(this.img, 0, 0, 800, 45);
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
