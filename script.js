const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");


/* =========================
   CONFIGURAÇÃO
========================= */

const WIDTH = 900;
const HEIGHT = 600;

canvas.width = WIDTH;
canvas.height = HEIGHT;


/* =========================
   ESTADO DO JOGO
========================= */

let gameRunning = false;

let score = 0;
let lives = 3;
let level = 1;

let enemyTimer = 0;
let enemyInterval = 70;

let animationId;


/* =========================
   TECLAS
========================= */

const keys = {};

document.addEventListener("keydown", (event) => {

    keys[event.code] = true;

    if (
        ["ArrowLeft", "ArrowRight", "Space"].includes(event.code)
    ) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});


/* =========================
   ESTRELAS
========================= */

const stars = [];

for (let i = 0; i < 120; i++) {

    stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5
    });
}


/* =========================
   NAVE DO JOGADOR
========================= */

const player = {

    x: WIDTH / 2 - 25,
    y: HEIGHT - 80,

    width: 50,
    height: 45,

    speed: 7,

    cooldown: 0
};


/* =========================
   ARRAYS
========================= */

let bullets = [];
let enemies = [];
let explosions = [];


/* =========================
   RESET
========================= */

function resetGame() {

    score = 0;
    lives = 3;
    level = 1;

    enemyTimer = 0;
    enemyInterval = 70;

    bullets = [];
    enemies = [];
    explosions = [];

    player.x = WIDTH / 2 - player.width / 2;
    player.y = HEIGHT - 80;

    updateHUD();
}


/* =========================
   HUD
========================= */

function updateHUD() {

    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
}


/* =========================
   DESENHAR ESTRELAS
========================= */

function drawStars() {

    for (const star of stars) {

        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.5})`;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );

        star.y += star.speed;

        if (star.y > HEIGHT) {
            star.y = 0;
            star.x = Math.random() * WIDTH;
        }
    }
}


/* =========================
   DESENHAR NAVE
========================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );

    // Fogo do motor
    ctx.fillStyle = "#f97316";

    ctx.beginPath();

    ctx.moveTo(-10, 18);
    ctx.lineTo(0, 35 + Math.random() * 8);
    ctx.lineTo(10, 18);

    ctx.closePath();
    ctx.fill();

    // Corpo
    ctx.fillStyle = "#38bdf8";

    ctx.beginPath();

    ctx.moveTo(0, -25);
    ctx.lineTo(-25, 20);
    ctx.lineTo(-10, 15);
    ctx.lineTo(0, 25);
    ctx.lineTo(10, 15);
    ctx.lineTo(25, 20);

    ctx.closePath();

    ctx.fill();

    // Cabine
    ctx.fillStyle = "#e0f2fe";

    ctx.beginPath();

    ctx.arc(0, -7, 7, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();
}


/* =========================
   ATIRAR
========================= */

function shoot() {

    if (player.cooldown > 0) {
        return;
    }

    bullets.push({

        x: player.x + player.width / 2 - 3,

        y: player.y - 10,

        width: 6,
        height: 18,

        speed: 11
    });

    player.cooldown = 15;
}


/* =========================
   DESENHAR TIROS
========================= */

function drawBullets() {

    ctx.fillStyle = "#22d3ee";

    for (const bullet of bullets) {

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#22d3ee";

        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );
    }

    ctx.shadowBlur = 0;
}


/* =========================
   CRIAR INIMIGO
========================= */

function createEnemy() {

    const size = 35 + Math.random() * 15;

    enemies.push({

        x: Math.random() * (WIDTH - size),

        y: -size,

        width: size,
        height: size,

        speed: 1.5 + Math.random() * 1.5 + level * 0.2,

        color: Math.random() > 0.5
            ? "#ef4444"
            : "#a855f7"
    });
}


/* =========================
   DESENHAR INIMIGOS
========================= */

function drawEnemies() {

    for (const enemy of enemies) {

        ctx.save();

        ctx.translate(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
        );

        ctx.fillStyle = enemy.color;

        ctx.shadowBlur = 12;
        ctx.shadowColor = enemy.color;

        ctx.beginPath();

        ctx.moveTo(0, enemy.height / 2);
        ctx.lineTo(-enemy.width / 2, -enemy.height / 3);
        ctx.lineTo(-enemy.width / 4, -enemy.height / 2);
        ctx.lineTo(0, -enemy.height / 4);
        ctx.lineTo(enemy.width / 4, -enemy.height / 2);
        ctx.lineTo(enemy.width / 2, -enemy.height / 3);

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }

    ctx.shadowBlur = 0;
}


/* =========================
   EXPLOSÕES
========================= */

function createExplosion(x, y) {

    explosions.push({

        x,
        y,

        radius: 5,

        alpha: 1
    });
}


function drawExplosions() {

    for (const explosion of explosions) {

        ctx.beginPath();

        ctx.arc(
            explosion.x,
            explosion.y,
            explosion.radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(255, ${100 + Math.random() * 155}, 0, ${explosion.alpha})`;

        ctx.lineWidth = 5;

        ctx.stroke();

        explosion.radius += 3;
        explosion.alpha -= 0.04;
    }

    explosions = explosions.filter(
        explosion => explosion.alpha > 0
    );
}


/* =========================
   COLISÃO
========================= */

function collision(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}


/* =========================
   ATUALIZAR JOGADOR
========================= */

function updatePlayer() {

    if (keys["ArrowLeft"] || keys["KeyA"]) {

        player.x -= player.speed;
    }

    if (keys["ArrowRight"] || keys["KeyD"]) {

        player.x += player.speed;
    }

    if (keys["Space"]) {

        shoot();
    }

    if (player.x < 0) {

        player.x = 0;
    }

    if (player.x + player.width > WIDTH) {

        player.x = WIDTH - player.width;
    }

    if (player.cooldown > 0) {

        player.cooldown--;
    }
}


/* =========================
   ATUALIZAR TIROS
========================= */

function updateBullets() {

    for (const bullet of bullets) {

        bullet.y -= bullet.speed;
    }

    bullets = bullets.filter(
        bullet => bullet.y > -30
    );
}


/* =========================
   ATUALIZAR INIMIGOS
========================= */

function updateEnemies() {

    enemyTimer++;

    if (enemyTimer >= enemyInterval) {

        createEnemy();

        enemyTimer = 0;
    }

    for (const enemy of enemies) {

        enemy.y += enemy.speed;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        // Inimigo chegou ao final
        if (enemy.y > HEIGHT) {

            enemies.splice(i, 1);

            lives--;

            updateHUD();

            if (lives <= 0) {

                endGame();
            }

            continue;
        }

        // Inimigo bateu na nave
        if (collision(enemy, player)) {

            createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2
            );

            enemies.splice(i, 1);

            lives--;

            updateHUD();

            if (lives <= 0) {

                endGame();
            }
        }
    }
}


/* =========================
   COLISÃO TIRO + INIMIGO
========================= */

function checkBulletCollisions() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        for (let j = enemies.length - 1; j >= 0; j--) {

            if (collision(bullets[i], enemies[j])) {

                const enemy = enemies[j];

                createExplosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2
                );

                bullets.splice(i, 1);

                enemies.splice(j, 1);

                score += 100;

                // A cada 1000 pontos sobe de nível
                const newLevel =
                    Math.floor(score / 1000) + 1;

                if (newLevel > level) {

                    level = newLevel;

                    enemyInterval =
                        Math.max(25, 70 - level * 5);
                }

                updateHUD();

                break;
            }
        }
    }
}


/* =========================
   DESENHAR
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    drawStars();

    drawPlayer();

    drawBullets();

    drawEnemies();

    drawExplosions();
}


/* =========================
   LOOP PRINCIPAL
========================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    updatePlayer();

    updateBullets();

    updateEnemies();

    checkBulletCollisions();

    draw();

    animationId =
        requestAnimationFrame(gameLoop);
}


/* =========================
   INICIAR
========================= */

function startGame() {

    resetGame();

    gameRunning = true;

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    gameLoop();
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    cancelAnimationFrame(animationId);

    finalScore.textContent = score;
    finalLevel.textContent = level;

    gameOverScreen.classList.remove("hidden");
}


/* =========================
   BOTÕES
========================= */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);
