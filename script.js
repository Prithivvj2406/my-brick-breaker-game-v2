// Canvas and context setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load sounds
const paddleBounceSound = new Audio('assets/paddle_bounce.mp3');
const wallBounceSound = new Audio('assets/wall_bounce.mp3');
const brickBreakSound = new Audio('assets/brick_break.mp3');

// Log when audio is played
paddleBounceSound.addEventListener('play', () => console.log('Paddle bounce sound played'));
wallBounceSound.addEventListener('play', () => console.log('Wall bounce sound played'));
brickBreakSound.addEventListener('play', () => console.log('Brick break sound played'));

// Color variables
const colorRed = "#FF0000";
const colorOrange = "#FFA500";
const colorYellow = "#FFFF00";
const colorGreen = "#00FF00";
const colorCyan = "#00FFFF";

// Constants and configuration
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BALL_SPEED = 3;
const BALL_SIZE = 20;
const BRICK_HEIGHT = 20;
const BRICK_COLORS = [colorRed, colorOrange, colorYellow, colorGreen, colorCyan];
const BRICK_POINTS = [5, 4, 3, 2, 1];
const BUBBLE_RADIUS = 30;
const BUBBLE_DURATION = 1000; // Duration for score bubbles
const PADDLE_DELAY = 250; // Delay in milliseconds for paddle movement in DEV_MODE 2 and 3
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const DEV_MODE = 0; // Set the desired DEV_MODE here

// Brick configuration based on DEV_MODE
let BRICK_ROWS = 5;
let BRICK_COLS = 10;

if (DEV_MODE === 1 || DEV_MODE === 2) {
    BRICK_ROWS = 1;
    BRICK_COLS = 5;
} else if (DEV_MODE === 3) {
    BRICK_ROWS = 5;
    BRICK_COLS = 10;
}

const BRICK_WIDTH = WIDTH / BRICK_COLS;

// Paddle initialization
let paddle = {
    x: WIDTH / 2 - PADDLE_WIDTH / 2,
    y: HEIGHT - PADDLE_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

// Brick initialization
let bricks = [];
for (let i = 0; i < BRICK_ROWS; i++) {
    for (let j = 0; j < BRICK_COLS; j++) {
        let brickColorIndex = i % BRICK_COLORS.length; // Use row index for color
        let brick = {
            x: j * BRICK_WIDTH,
            y: i * BRICK_HEIGHT,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            color: BRICK_COLORS[brickColorIndex],
            points: BRICK_POINTS[brickColorIndex] // Assign points based on color index
        };
        bricks.push(brick);
    }
}

// Ball initialization
let ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    dx: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
    dy: BALL_SPEED,
    size: BALL_SIZE
};

// Game state variables
let score = 0;
let scoreBubbles = [];
let startScreen = true;
let gameOver = false;
let startTime = null;

// Load game icon
const gameIcon = new Image();
gameIcon.src = "assets/Game_Icon_Image.png";

// Draw start screen
function draw_start_screen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(gameIcon, (WIDTH - 250) / 
