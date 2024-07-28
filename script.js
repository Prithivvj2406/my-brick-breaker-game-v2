// Sound effects
const sounds = {
    wallBounce: new Audio('Sounds/wall_bounce.wav'),
    paddleBounce: new Audio('Sounds/paddle_bounce.wav'),
    brickBreak: new Audio('Sounds/brick_break.wav'),
    backgroundMusic: new Audio('Sounds/background_music.mp3'),
    startupMusic: new Audio('Sounds/startup_music.mp3'),
    gameOver: new Audio('Sounds/game_over.mp3'),
    winGame: new Audio('Sounds/win_game.mp3')
};

// Set volumes
sounds.startupMusic.volume = 0.4;
sounds.backgroundMusic.volume = 0.2;

// Play sound
function playSound(sound, loop = false) {
    if (loop) {
        sound.loop = true;
    }
    sound.play();
}

// Stop sound
function stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
}
