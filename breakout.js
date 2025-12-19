// ====================
// Board
// ====================
let board;
let boardWidth = 620;
let boardHeight = 500;
let context;

// ====================
// Spielstatus
// ====================
let gamePaused = false;
let gameOver = false;
let score = 0;
const maxScore = 50000;

// ====================
// Highscore
// ====================
let highscore = { name: "—", score: 0 };

// ====================
// Input
// ====================
let leftPressed = false;
let rightPressed = false;

// ====================
// Paddle
// ====================
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 8;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight
};

// ====================
// Ball
// ====================
let ballSize = 10;
let ballSpeed = 4;

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballSize,
    height: ballSize,
    velocityX: 0,
    velocityY: -ballSpeed
};

// ====================
// Blocks
// ====================
let blockArray = [];
let blockWidth = 50;
let blockHeight = 20;
let blockColumns = 10;
let blockRows = 3;
let blockX = 15;
let blockY = 45;
let blockColors = [
    "blue", "red", "gold", "purple", "pink", "lime", "green", "orange"
];

// ====================
// Hintergrundmusik
// ====================
let bgMusic = new Audio("sound&img/melody.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

// ====================
// INIT
// ====================
window.onload = () => {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    loadHighscore();
    createScoreUI();

    document.getElementById("startButton").addEventListener("click", () => {
        bgMusic.play().catch(() => {});
        startGame();
    });
    document.getElementById("pauseButton").addEventListener("click", togglePause);

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") leftPressed = true;
        if (e.key === "ArrowRight") rightPressed = true;
    });

    document.addEventListener("keyup", e => {
        if (e.key === "ArrowLeft") leftPressed = false;
        if (e.key === "ArrowRight") rightPressed = false;
    });

    drawStartScreen();
};

// ====================
// SCORE UI
// ====================
function createScoreUI() {
    const title = document.querySelector("h1");

    const hud = document.createElement("div");
    hud.style.width = boardWidth + "px";
    hud.style.margin = "10px auto";
    hud.style.display = "flex";
    hud.style.justifyContent = "space-between";
    hud.style.color = "white";
    hud.style.fontFamily = "Arial";
    hud.style.fontSize = "18px";

    hud.innerHTML = `
        <div>
            Score: <span id="scoreDisplay">0</span>
        </div>
        <div>
            Highscore: <span id="highscoreDisplay">${highscore.score}</span>
            <small id="highscoreName">(${highscore.name})</small>
        </div>
    `;

    title.insertAdjacentElement("afterend", hud);
}

// ====================
// Highscore Storage
// ====================
function loadHighscore() {
    const saved = localStorage.getItem("breakoutHighscore");
    if (saved) highscore = JSON.parse(saved);
}

function saveHighscore() {
    localStorage.setItem("breakoutHighscore", JSON.stringify(highscore));
}

// ====================
// START GAME
// ====================
function startGame() {
    gamePaused = false;
    gameOver = false;
    score = 0;
    updateScoreUI();

    createBlocks();
    resetBallAndPaddle();

    document.getElementById("startButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "inline";

    requestAnimationFrame(update);
}

// ====================
// PAUSE (mit Musikpause)
// ====================
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        bgMusic.pause();
    } else {
        bgMusic.play();
        requestAnimationFrame(update);
    }
}

// ====================
// GAME LOOP
// ====================
function update() {
    if (gamePaused || gameOver) return;

    if (leftPressed && player.x > 0) player.x -= playerVelocityX;
    if (rightPressed && player.x + player.width < boardWidth) player.x += playerVelocityX;

    moveBall();
    detectCollisions();
    drawEverything();

    if (blockArray.every(b => b.destroyed) && score < maxScore) {
        createBlocks();
        resetBallAndPaddle();
    }

    requestAnimationFrame(update);
}

// ====================
// BALL
// ====================
function moveBall() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (ball.x <= 0 || ball.x + ball.width >= boardWidth) ball.velocityX *= -1;
    if (ball.y <= 0) ball.velocityY *= -1;

    if (ball.y + ball.height >= boardHeight) endGame();
}

// ====================
// COLLISIONS
// ====================
function detectCollisions() {
    // Paddle
    if (
        ball.x < player.x + player.width &&
        ball.x + ball.width > player.x &&
        ball.y + ball.height > player.y
    ) {
        let hit = (ball.x + ball.width / 2) - (player.x + player.width / 2);
        let norm = hit / (player.width / 2);
        let angle = norm * Math.PI / 3;

        ball.velocityX = ballSpeed * Math.sin(angle);
        ball.velocityY = -Math.abs(ballSpeed * Math.cos(angle));
        ball.y = player.y - ball.height;
    }

    // Blocks
    blockArray.forEach(block => {
        if (!block.destroyed &&
            ball.x < block.x + block.width &&
            ball.x + ball.width > block.x &&
            ball.y < block.y + block.height &&
            ball.y + ball.height > block.y
        ) {
            block.destroyed = true;
            ball.velocityY *= -1;
            score += 10;
            updateScoreUI();
        }
    });
}

// ====================
// GAME END (Musik stoppen)
// ====================
function endGame() {
    gameOver = true;
    bgMusic.pause();

    if (score > highscore.score) {
        const name = prompt("Neuer Highscore! Dein Name:");
        highscore = { name: name || "Unbekannt", score };
        saveHighscore();
    }

    updateScoreUI();

    document.getElementById("startButton").style.display = "inline";
    document.getElementById("pauseButton").style.display = "none";
}

// ====================
// DRAW
// ====================
function drawEverything() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    // Paddle
    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Ball
    context.fillStyle = "yellow";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Blocks mit vertikalem Gradient & abgerundeten Ecken
    blockArray.forEach(b => {
        if (!b.destroyed) {
            let grad = context.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
            grad.addColorStop(0, b.color);
            grad.addColorStop(1, "white");
            drawRoundedRect(b.x, b.y, b.width, b.height, 5, grad); // radius=5
        }
    });
}

// ====================
// Hilfsfunktion für abgerundete Rechtecke
// ====================
function drawRoundedRect(x, y, width, height, radius, fillStyle) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
}

// ====================
// UTILS
// ====================
function updateScoreUI() {
    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("highscoreDisplay").textContent = highscore.score;
    document.getElementById("highscoreName").textContent = `(${highscore.name})`;
}

function resetBallAndPaddle() {
    player.x = boardWidth / 2 - player.width / 2;
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;
    ball.velocityX = 0;
    ball.velocityY = -ballSpeed;
}

function createBlocks() {
    blockArray = [];
    for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockColumns; c++) {
            blockArray.push({
                x: c * (blockWidth + 10) + blockX,
                y: r * (blockHeight + 10) + blockY,
                width: blockWidth,
                height: blockHeight,
                color: blockColors[r % blockColors.length],
                destroyed: false
            });
        }
    }
}

function drawStartScreen() {
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Start Game", boardWidth / 2 - 50, boardHeight / 2);
}

