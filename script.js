const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const sounds = {
    wallBounce: document.getElementById('wallBounceSound'),
    paddleBounce: document.getElementById('paddleBounceSound'),
    brickBreak: document.getElementById('brickBreakSound'),
    backgroundMusic: document.getElementById('backgroundMusic'),
    startupMusic: document.getElementById('startupMusic'),
    gameOver: document.getElementById('gameOverSound'),
    winGame: document.getElementById('winGameSound')
};
let paddle, ball, bricks = [];
let changeX = 4, changeY = 4;
let score = 0;
let numBricks = 5;

// Constants
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDLE_Y_OFFSET = 30;
const BRICK_ROWS = 1;
const BRICK_COLS = 5;
const BRICK_WIDTH = canvas.width / BRICK_COLS;
const BRICK_HEIGHT = 20;
const BRICK_COLORS = ["red", "orange", "yellow", "green", "cyan"];
const BALL_SIZE = 20;
const BRICK_POINTS = [5, 4, 3, 2, 1];

function playSound(soundName) {
    sounds[soundName].play();
}

function stopSound(soundName) {
    sounds[soundName].pause();
    sounds[soundName].currentTime = 0;
}

function createPaddle() {
    paddle = {
        x: canvas.width / 2 - PADDLE_WIDTH / 2,
        y: canvas.height - PADDLE_HEIGHT - PADDLE_Y_OFFSET,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    };
}

function createBricks() {
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            let brick = {
                x: j * BRICK_WIDTH,
                y: i * BRICK_HEIGHT,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: BRICK_COLORS[i % BRICK_COLORS.length],
                points: BRICK_POINTS[i % BRICK_POINTS.length]
            };
            bricks.push(brick);
        }
    }
}

function spawnBall() {
    ball = {
        x: canvas.width / 2 - BALL_SIZE / 2,
        y: canvas.height / 2 - BALL_SIZE / 2,
        radius: BALL_SIZE / 2,
        dx: changeX,
        dy: changeY
    };
}

function drawPaddle() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBricks() {
    bricks.forEach(brick => {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    });
}

function drawBall() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function updateScore(scoreIncrement, color) {
    score += scoreIncrement;
    console.log(`Score: +${scoreIncrement} (Total: ${score})`);
}

function detectCollisions() {
    // Ball collision with walls
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.dx = -ball.dx;
        playSound("wallBounce");
    }
    if (ball.y - ball.radius <= 0) {
        ball.dy = -ball.dy;
        playSound("wallBounce");
    }
    if (ball.y + ball.radius >= canvas.height) {
        stopSound("backgroundMusic");
        playSound("gameOver");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '30px Helvetica';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Helvetica';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
        return true;
    }

    // Ball collision with paddle
    if (
        ball.x + ball.radius >= paddle.x &&
        ball.x - ball.radius <= paddle.x + paddle.width &&
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height
    ) {
        ball.dy = -ball.dy;
        playSound("paddleBounce");
    }

    // Ball collision with bricks
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        if (
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height
        ) {
            ball.dy = -ball.dy;
            playSound("brickBreak");
            updateScore(brick.points, brick.color);
            bricks.splice(i, 1);
            numBricks--;
            break;
        }
    }

    // Check win
    if (numBricks === 0) {
        stopSound("backgroundMusic");
        playSound("winGame");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'green';
        ctx.font = '30px Helvetica';
        ctx.textAlign = 'center';
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Helvetica';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
        return true;
    }

    return false;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBricks();
    drawBall();
    moveBall();
    if (!detectCollisions()) {
        requestAnimationFrame(gameLoop);
    }
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    let paddleX = event.clientX - rect.left - paddle.width / 2;
    paddleX = Math.max(0, Math.min(paddleX, canvas.width - paddle.width));
    paddle.x = paddleX;
});

startScreen.addEventListener('click', () => {
    startScreen.style.display = 'none';
    playSound("startupMusic");
    setTimeout(() => {
        stopSound("startupMusic");
        playSound("backgroundMusic");
        createPaddle();
        createBricks();
        spawnBall();
        gameLoop();
    }, 1000);
});
