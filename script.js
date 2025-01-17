const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const colorRed = "#FF0000";
const colorOrange = "#FFA500";
const colorYellow = "#FFFF00";
const colorGreen = "#00FF00";
const colorCyan = "#00FFFF";

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BALL_SPEED = 5;
const BALL_SIZE = 20;
const BRICK_HEIGHT = 20;
const BRICK_COLORS = [colorRed, colorOrange, colorYellow, colorGreen, colorCyan];
const BRICK_POINTS = [5, 4, 3, 2, 1];
const BUBBLE_RADIUS = 30;
const BUBBLE_DURATION = 1000;
const PADDLE_DELAY = 250;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const DEV_MODE = 2; // Change to 0, 2, or 3 for different modes

let BRICK_ROWS = 5;
let BRICK_COLS = 10;

if (DEV_MODE === 1) {
    BRICK_ROWS = 1;
    BRICK_COLS = 5;
} else if (DEV_MODE === 2 || DEV_MODE === 3) {
    BRICK_ROWS = 5;
    BRICK_COLS = 10;
}

const BRICK_WIDTH = WIDTH / BRICK_COLS;

let paddle = {
    x: WIDTH / 2 - PADDLE_WIDTH / 2,
    y: HEIGHT - PADDLE_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let bricks = [];
for (let i = 0; i < BRICK_ROWS; i++) {
    for (let j = 0; j < BRICK_COLS; j++) {
        let brickColorIndex = i % BRICK_COLORS.length;
        let brick = {
            x: j * BRICK_WIDTH,
            y: i * BRICK_HEIGHT,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            color: BRICK_COLORS[brickColorIndex],
            points: BRICK_POINTS[brickColorIndex]
        };
        bricks.push(brick);
    }
}

let ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    dx: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
    dy: BALL_SPEED,
    size: BALL_SIZE
};

let score = 0;
let scoreBubbles = [];
let startScreen = true;
let gameOver = false;
let startTime = null;

const gameIcon = new Image();
gameIcon.src = "assets/Game_Icon_Image.png";

const paddleHitSound = new Audio("assets/paddle_bounce.mp3");
const wallHitSound = new Audio("assets/wall_bounce.mp3");
const brickBreakSound = new Audio("assets/brick_break.mp3");

function draw_start_screen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(gameIcon, (WIDTH - 250) / 2, (HEIGHT - 250) / 2 - 100, 250, 250);
    ctx.strokeStyle = "#ADD8E6";
    ctx.lineWidth = 5;
    ctx.strokeRect((WIDTH - 250) / 2 - 5, (HEIGHT - 250) / 2 - 105, 260, 260);
    ctx.font = "30px Helvetica";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("CLICK ANYWHERE TO START", WIDTH / 2, HEIGHT / 2 + 100);
}

function draw_game_screen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    let paddleWidth = PADDLE_WIDTH;
    let paddleHeight = PADDLE_HEIGHT;

    if (DEV_MODE === 2 || DEV_MODE === 3) {
        paddleWidth *= 1.25;
        paddleHeight *= 1;
    }

    ctx.fillStyle = "blue";
    ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);

    bricks.forEach(brick => {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    });

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();

    draw_score_bubbles();
}

function draw_end_screen(message) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = message === "You Win!" ? colorGreen : colorRed;
    ctx.font = "50px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText(message, WIDTH / 2, HEIGHT / 2 - 25);
    ctx.font = "30px Helvetica";
    ctx.fillText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 25);
}

function move_paddle(event) {
    if (DEV_MODE !== 2 && DEV_MODE !== 3) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        paddle.x = mouseX - PADDLE_WIDTH / 2;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + PADDLE_WIDTH > WIDTH) paddle.x = WIDTH - PADDLE_WIDTH;
    }
}

function ball_dynamics() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x <= 0 || ball.x >= WIDTH) {
        ball.dx = -ball.dx;
        wallHitSound.play();
    }
    if (ball.y <= 0) {
        ball.dy = -ball.dy;
        wallHitSound.play();
    }
    if (ball.y >= HEIGHT) {
        gameOver = true;
        draw_end_screen("Game Over!");
        return;
    }

    if (DEV_MODE === 2 || DEV_MODE === 3) {
        setTimeout(() => {
            paddle.x += ball.dx;
            if (paddle.x < 0) paddle.x = 0;
            if (paddle.x + PADDLE_WIDTH > WIDTH) paddle.x = WIDTH - PADDLE_WIDTH;
        }, PADDLE_DELAY);
    }

    detect_paddle_collision();
    detect_brick_collision();
}

function detect_paddle_collision() {
    const paddleWidth = DEV_MODE === 2 || DEV_MODE === 3 ? PADDLE_WIDTH * 1.25 : PADDLE_WIDTH;
    const paddleHeight = DEV_MODE === 2 || DEV_MODE === 3 ? PADDLE_HEIGHT * 1.25 : PADDLE_HEIGHT;

    if (
        ball.y + ball.size / 2 > paddle.y &&
        ball.y - ball.size / 2 < paddle.y + paddleHeight &&
        ball.x + ball.size / 2 > paddle.x &&
        ball.x - ball.size / 2 < paddle.x + paddleWidth
    ) {
        ball.dy = -ball.dy;
        ball.y = paddle.y - ball.size / 2;
        paddleHitSound.play();
    }
}

function detect_brick_collision() {
    bricks = bricks.filter(brick => {
        if (
            ball.y + ball.size / 2 > brick.y &&
            ball.y - ball.size / 2 < brick.y + brick.height &&
            ball.x + ball.size / 2 > brick.x &&
            ball.x - ball.size / 2 < brick.x + brick.width
        ) {
            if (ball.x > brick.x && ball.x < brick.x + brick.width) {
                ball.dy = -ball.dy;
            } else {
                ball.dx = -ball.dx;
            }
            score += brick.points;
            brickBreakSound.play();
            return false;
        }
        return true;
    });
}

function draw_score_bubbles() {
    scoreBubbles = scoreBubbles.filter(bubble => {
        bubble.duration -= 16;
        if (bubble.duration <= 0) return false;

        const x = bubble.x;
        const y = HEIGHT - BUBBLE_RADIUS - 10;
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(bubble.scoreText, x, y + 5);
        return true;
    });
}

function update_dev_mode_display() {
    const devModeDiv = document.getElementById('devModeDiv');
    if ((DEV_MODE === 1 || DEV_MODE === 2 || DEV_MODE === 3) && !startScreen) {
        devModeDiv.textContent = `DEV_MODE: ${DEV_MODE}`;
        devModeDiv.style.display = 'block';
    } else {
        devModeDiv.style.display = 'none';
    }
}

function update_bricks_remaining_display() {
    const bricksRemainingDiv = document.getElementById('bricksRemainingDiv');
    if ((DEV_MODE === 1 || DEV_MODE === 2 || DEV_MODE === 3) && !startScreen) {
        bricksRemainingDiv.textContent = `Bricks Remaining: ${bricks.length}`;
        bricksRemainingDiv.style.display = 'block';
    } else {
        bricksRemainingDiv.style.display = 'none';
    }
}

function update_elapsed_time_display() {
    const elapsedTimeDiv = document.getElementById('elapsedTimeDiv');
    if (DEV_MODE === 3 && !startScreen) {
        const currentTime = Date.now();
        const elapsedSeconds = ((currentTime - startTime) / 1000).toFixed(3);
        elapsedTimeDiv.textContent = `Time Elapsed: ${elapsedSeconds}s`;
        elapsedTimeDiv.style.display = 'block';
    } else {
        elapsedTimeDiv.style.display = 'none';
    }
}

function gameLoop() {
    if (!startScreen && !gameOver) {
        if (!startTime) startTime = Date.now();
        ball_dynamics();
        draw_game_screen();
        update_bricks_remaining_display();
        update_elapsed_time_display();
        
        if (bricks.length === 0) {
            gameOver = true;
            draw_end_screen("You Win!");
        }
    } else if (gameOver) {
        if (!scoreBubbles.length) {
            draw_end_screen(gameOver ? "Game Over!" : "You Win!");
        }
    }
    update_dev_mode_display();
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 16);
}

canvas.addEventListener("mousemove", move_paddle);
canvas.addEventListener("click", () => {
    if (startScreen) {
        startScreen = false;
        canvas.removeEventListener("click", draw_start_screen);
    }
});

gameIcon.onload = () => {
    draw_start_screen();
    gameLoop();
};

gameIcon.onerror = () => {
    console.error('Failed to load game icon image.');
};
