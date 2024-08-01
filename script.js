// Constants
const WIDTH = 800;
const HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDLE_Y_OFFSET = 30;
const BRICK_ROWS = 1;
const BRICK_COLS = 5;
const BRICK_WIDTH = WIDTH / BRICK_COLS;
const BRICK_HEIGHT = 20;
const BRICK_COLORS = ["red", "orange", "yellow", "green", "cyan"];
const BALL_SPEED = 4;
const BALL_SIZE = 20;
const BRICK_POINTS = [5, 4, 3, 2, 1];
let SCORE = 0;
let numBricks = BRICK_ROWS * BRICK_COLS;
let ball, paddle, bricks, changeX, changeY;
let gameCanvas, gameContext;

document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const startCanvas = document.getElementById("start-canvas");
    const startContext = startCanvas.getContext("2d");

    const startupMusic = document.getElementById("startup-music");
    const backgroundMusic = document.getElementById("background-music");

    // Play startup music
    startupMusic.volume = 0.4;
    startupMusic.play();

    // Draw the Game Icon with Border on the Start Screen
    insertImageWithBorder(startContext, WIDTH, HEIGHT);

    startCanvas.addEventListener("click", () => {
        startupMusic.pause();
        startupMusic.currentTime = 0;
        startScreen.style.display = "none";
        gameScreen.style.display = "flex";
        backgroundMusic.volume = 0.2;
        backgroundMusic.play();
        createGameWindow();
    });
});

function insertImageWithBorder(context, canvasWidth, canvasHeight, imageSize = 250, borderThickness = 5) {
    const image = new Image();
    image.src = "Game_Icon_Image.PNG";
    image.onload = () => {
        const xCenter = (canvasWidth - imageSize) / 2;
        const yCenter = (canvasHeight - imageSize - 200) / 2;
        context.fillStyle = "#add8e6";
        context.fillRect(xCenter - borderThickness, yCenter - borderThickness, imageSize + borderThickness * 2, imageSize + borderThickness * 2);
        context.drawImage(image, xCenter, yCenter, imageSize, imageSize);
    };
}

function createGameWindow() {
    gameCanvas = document.getElementById("game-canvas");
    gameContext = gameCanvas.getContext("2d");

    createPaddle();
    createBricks();
    spawnBall();
    movePaddle();
    ballDynamics();
}

function createPaddle() {
    paddle = {
        x: WIDTH / 2 - PADDLE_WIDTH / 2,
        y: HEIGHT - PADDLE_HEIGHT - PADDLE_Y_OFFSET,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    };
}

function createBricks() {
    bricks = [];
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            const x = j * BRICK_WIDTH;
            const y = i * BRICK_HEIGHT;
            const color = BRICK_COLORS[i % BRICK_COLORS.length];
            bricks.push({ x, y, width: BRICK_WIDTH, height: BRICK_HEIGHT, color });
        }
    }
}

function spawnBall() {
    changeX = Math.random() < 0.5 ? -BALL_SPEED : BALL_SPEED;
    changeY = BALL_SPEED;
    ball = { x: WIDTH / 2 - BALL_SIZE / 2, y: HEIGHT / 2 - BALL_SIZE / 2, size: BALL_SIZE };
}

function movePaddle() {
    gameCanvas.addEventListener("mousemove", event => {
        let paddleX = event.clientX - gameCanvas.getBoundingClientRect().left;
        if (paddleX < PADDLE_WIDTH / 2) paddleX = PADDLE_WIDTH / 2;
        if (paddleX > WIDTH - PADDLE_WIDTH / 2) paddleX = WIDTH - PADDLE_WIDTH / 2;
        paddle.x = paddleX - PADDLE_WIDTH / 2;
    });
}

function ballDynamics() {
    gameContext.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw paddle
    gameContext.fillStyle = "blue";
    gameContext.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw bricks
    bricks.forEach(brick => {
        gameContext.fillStyle = brick.color;
        gameContext.fillRect(brick.x, brick.y, brick.width, brick.height);
        gameContext.strokeRect(brick.x, brick.y, brick.width, brick.height);
    });

    // Draw ball
    gameContext.beginPath();
    gameContext.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    gameContext.fillStyle = "red";
    gameContext.fill();
    gameContext.closePath();

    // Move ball
    ball.x += changeX;
    ball.y += changeY;

    // Collision detection
    if (ball.x - BALL_SIZE / 2 <= 0 || ball.x + BALL_SIZE / 2 >= WIDTH) {
        changeX = -changeX;
        playSound("wall-bounce");
    }
    if (ball.y - BALL_SIZE / 2 <= 0) {
        changeY = -changeY;
        playSound("wall-bounce");
    }
    if (ball.y + BALL_SIZE / 2 >= HEIGHT) {
        endGame("Game Over");
        return;
    }

    detectPaddleCollision();
    detectBrickCollision();

    if (numBricks === 0) {
        endGame("You Win!");
        return;
    }

    requestAnimationFrame(ballDynamics);
}

function detectPaddleCollision() {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + BALL_SIZE / 2 >= paddle.y) {
        changeY = -changeY;
        playSound("paddle-bounce");
    }
}

function detectBrickCollision() {
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (ball.x > brick.x && ball.x < brick.x + brick.width && ball.y - BALL_SIZE / 2 <= brick.y + brick.height) {
            bricks.splice(i, 1);
            changeY = -changeY;
            playSound("brick-break");
            updateScore(BRICK_POINTS[0], brick.color);
            numBricks--;
            break;
        }
    }
}

function playSound(id) {
    const sound = document.getElementById(id);
    sound.currentTime = 0;
    sound.play();
}

function endGame(message) {
    gameContext.clearRect(0, 0, WIDTH, HEIGHT);
    gameContext.font = "40px Helvetica";
    gameContext.fillStyle = "red";
    gameContext.fillText(message, WIDTH / 2 - gameContext.measureText(message).width / 2, HEIGHT / 2);
    gameContext.font = "20px Helvetica";
    gameContext.fillStyle = "green";
    gameContext.fillText(`Score: ${SCORE}`, WIDTH / 2 - gameContext.measureText(`Score: ${SCORE}`).width / 2, HEIGHT / 2 + 50);
    playSound(message === "Game Over" ? "game-over" : "win-game");
    document.getElementById("background-music").pause();
}

function updateScore(scoreIncrement, color) {
    SCORE += scoreIncrement;
    const bubble = document.createElement("div");
    bubble.classList.add("score-bubble");
    bubble.style.backgroundColor = color;
    bubble.innerText = `+${scoreIncrement}`;
    document.body.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, 1000);
}
