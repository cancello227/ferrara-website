// game.js - VERSIONE DEFINITIVA FUNZIONANTE
const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");

// Configurazione
const config = {
    playerSize: 20,
    wallSpeed: 3,
    wallWidth: 25,
    minGap: 120,
    maxGap: 180,
    spawnRate: 0.01,
    colors: {
        player: "#FF6B6B",
        walls: "#4ECDC4",
        background: "#292F36",
        text: "#F7FFF7",
        accent: "#FFE66D"
    }
};

let gameRunning = false;
let score = 0;
let playerPos = { x: 50, y: 150 };
let walls = [];
let gameLoopId;

// Inizializza il gioco
function init() {
    gameArea.style.backgroundColor = config.colors.background;
    player.style.backgroundColor = config.colors.player;
    player.style.width = config.playerSize + "px";
    player.style.height = config.playerSize + "px";
    startButton.style.backgroundColor = config.colors.accent;
}

// Movimento WASD
document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    
    const key = e.key.toLowerCase();
    const speed = 5;
    
    if (key === 'w') playerPos.y -= speed;
    if (key === 's') playerPos.y += speed;
    if (key === 'a') playerPos.x -= speed;
    if (key === 'd') playerPos.x += speed;
    
    // Limiti dell'area di gioco
    playerPos.x = Math.max(0, Math.min(gameArea.offsetWidth - config.playerSize, playerPos.x));
    playerPos.y = Math.max(0, Math.min(gameArea.offsetHeight - config.playerSize, playerPos.y));
    
    player.style.left = playerPos.x + "px";
    player.style.top = playerPos.y + "px";
});

startButton.addEventListener("click", startGame);

function startGame() {
    if (gameRunning) return;
    
    // Reset
    clearWalls();
    gameRunning = true;
    score = 0;
    playerPos = { 
        x: 50, 
        y: gameArea.offsetHeight/2 - config.playerSize/2 
    };
    updatePlayerPosition();
    startButton.style.display = "none";
    scoreDisplay.textContent = "Punteggio: 0";
    
    // Avvia game loop
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    
    spawnWalls();
    updateWalls();
    checkCollisions();
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

function spawnWalls() {
    if (Math.random() < config.spawnRate && 
       (walls.length === 0 || 
        gameArea.offsetWidth - walls[walls.length-1].x > 300)) {
        
        const gap = Math.floor(Math.random() * (config.maxGap - config.minGap)) + config.minGap;
        const wallHeight = Math.floor(Math.random() * (gameArea.offsetHeight - gap - 20));
        
        // Crea coppia di muri (superiore + inferiore)
        createWall(0, wallHeight); // Muro superiore
        createWall(wallHeight + gap, gameArea.offsetHeight - wallHeight - gap); // Muro inferiore
    }
}

function createWall(top, height) {
    const wall = document.createElement("div");
    wall.className = "wall";
    wall.style.cssText = `
        position: absolute;
        left: ${gameArea.offsetWidth}px;
        top: ${top}px;
        width: ${config.wallWidth}px;
        height: ${height}px;
        background: ${config.colors.walls};
        border-radius: 8px;
        box-shadow: 0 0 10px ${config.colors.walls};
    `;
    gameArea.appendChild(wall);
    walls.push({
        element: wall,
        x: gameArea.offsetWidth,
        passed: false
    });
}

function updateWalls() {
    for (let i = walls.length - 1; i >= 0; i--) {
        walls[i].x -= config.wallSpeed;
        walls[i].element.style.left = walls[i].x + "px";
        
        // Controlla se il muro è stato superato
        if (!walls[i].passed && walls[i].x + config.wallWidth < playerPos.x) {
            walls[i].passed = true;
            score++;
            scoreDisplay.textContent = `Punteggio: ${score}`;
        }
        
        // Rimuovi muri usciti dallo schermo
        if (walls[i].x < -config.wallWidth) {
            gameArea.removeChild(walls[i].element);
            walls.splice(i, 1);
        }
    }
}

function checkCollisions() {
    const playerRect = player.getBoundingClientRect();
    
    for (const wall of walls) {
        const wallRect = wall.element.getBoundingClientRect();
        
        if (playerRect.right > wallRect.left &&
            playerRect.left < wallRect.right &&
            playerRect.bottom > wallRect.top &&
            playerRect.top < wallRect.bottom) {
            endGame();
            return;
        }
    }
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
    startButton.style.display = "block";
    alert(`💥 Game Over! Punteggio: ${score}`);
}

function clearWalls() {
    walls.forEach(wall => {
        if (wall.element.parentNode === gameArea) {
            gameArea.removeChild(wall.element);
        }
    });
    walls = [];
}

function updatePlayerPosition() {
    player.style.left = playerPos.x + "px";
    player.style.top = playerPos.y + "px";
}

// Inizializza il gioco
init();