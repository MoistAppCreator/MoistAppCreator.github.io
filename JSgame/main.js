import { uiController } from "./uiController.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const gameMenu = document.getElementById('gameMenu');
const gameMenuText = document.getElementById('gameMenuText');
canvas.width = 800;
canvas.height = 600;

//controls
let playerLeft, playerRight, playerShoot = false;
let lastShotTime = 0;
const shotCooldown = 500;

//game objects
let player, bullets, enemies;
let gameOver, win;
let gameRunning = false;
let enemiesDirection = 1;
let enemiesSpeed = 1;

//ui
const ui = new uiController(canvas, "uiConfig.json");


function initializeGame() {
    player = {
        x: canvas.width / 2 - 20,
        y: canvas.height - 60,
        width: 40,
        height: 20,
        color: 'white',
        speed: 5,
        dx: 0
    };

    bullets = [];
    const bulletPoolCount = 20;
    for (let bCount = 0; bCount < bulletPoolCount; bCount++) {
        bullets.push({
            x: 0,
            y: 0,
            width: 5,
            height: 10,
            color: 'yellow',
            speed: 7,
            active: false
        });
    }

    enemies = [];
    const enemyRows = 4;
    const enemyCols = 8;
    const enemyWidth = 40;
    const enemyHeight = 20;
    const enemyPadding = 10;
    const enemyOffset = { x: 60, y: 50 };

    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: enemyOffset.x + col * (enemyWidth + enemyPadding),
                y: enemyOffset.y + row * (enemyHeight + enemyPadding),
                width: enemyWidth,
                height: enemyHeight,
                color: 'red',
                active: true
            });
        }
    }

    gameOver = false;
    win = false;
    gameMenu.style.display = 'none';
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function movePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function drawBullet() {
    bullets.forEach(bullet =>{
        if (bullet.active) {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
}

function moveBullet() {
    bullets.forEach(bullet =>{
        if (bullet.active) {
            bullet.y -= bullet.speed;
            if (bullet.y + bullet.height < 0) bullet.active = false;
        }
    });
}

function pickPooledBullet(bArray){
    const bullet = bArray.find(b => !b.active);
    return bullet || null;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.active) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
}

function moveEnemies() {
    enemies.forEach(enemy => {
        if (enemy.active) {
            enemy.x += enemiesSpeed * enemiesDirection;
        }
    });

    const atEdge = enemies.some(enemy => {
        return enemy.active && (enemy.x + enemy.width >= canvas.width || enemy.x <= 0);
    });

    if (atEdge) {
        enemiesDirection = enemiesDirection * -1;
        enemies.forEach(enemy => {
            enemy.x += 1 * enemiesDirection;
            enemy.y += 20;

        });
    }
}


function checkCollisions() {
    bullets.forEach(bullet => {
        if (!bullet.active){
            return;
        };
        enemies.forEach(enemy => {
            if (
                enemy.active &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullet.active = false;
                enemy.active = false;
            }
        });
    });

    enemies.forEach(enemy => {
        if (!enemy.active){
            return;
        };

        if (enemy.active && enemy.y + enemy.height >= player.y) {
            gameOver = true;
        }
    });

    if (enemies.every(enemy => !enemy.active)) {
        win = true;
    }
}

function drawText() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    if (gameOver) {
        gameMenuText.textContent = 'Game Over';
        gameMenu.style.display = 'flex'; // Show restart button
    } else if (win) {
        gameMenuText.textContent = 'You Win';
        gameMenu.style.display = 'flex'; // Show restart button
    }
}

function applyPlayerActions(){
    player.dx = 0;
    if (playerLeft) {
        player.dx = -player.speed;
    } else if (playerRight) {
        player.dx = player.speed;
    }
    if (playerShoot) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime <= shotCooldown) {
            return;
        }
        lastShotTime = currentTime;
        const shot = pickPooledBullet(bullets);
        if (shot) {
            shot.active = true;
            shot.x = player.x + player.width / 2 - shot.width / 2;
            shot.y = player.y;
        } else {
            console.log('No available bullets in the pool.');
            return;
        }
    }
}

function update() {
    if (gameOver || win || !gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyPlayerActions();
    movePlayer();
    moveBullet();
    moveEnemies();
    checkCollisions();

    drawPlayer();
    drawBullet();
    drawEnemies();
    drawText();

    ui.draw();

    requestAnimationFrame(update);
}

// Restart game logic
function restartGame() {
    if (!gameRunning) {
        restartButton.textContent = 'Restart Game';
    }
    gameRunning = true;
    initializeGame();
    update();
}

// Input handling
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        playerLeft = true;
    } else if (e.key === 'ArrowRight') {
        playerRight = true;
    } else if (e.key === ' ') {
        playerShoot = true;
    }
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft') {
        playerLeft = false;
    } else if (e.key === 'ArrowRight') {
        playerRight = false;
    } else if (e.key === ' ') {
        playerShoot = false;
    }
});
restartButton.addEventListener('click', restartGame);

update();

// // Load the shooting sound
// const shootSound = new Audio('assets/shoot.mp3');

// // Input handling with shooting sound
// document.addEventListener('keydown', e => {
//     if (e.key === 'ArrowLeft') {
//         player.dx = -player.speed;
//     } else if (e.key === 'ArrowRight') {
//         player.dx = player.speed;
//     } else if (e.key === ' ') {
//         if (!bullet.active) {
//             // Play the shooting sound
//             shootSound.currentTime = 0; // Reset sound to the beginning
//             shootSound.play();

//             // Activate the bullet
//             bullet.active = true;
//             bullet.x = player.x + player.width / 2 - bullet.width / 2;
//             bullet.y = player.y;
//         }
//     }
// });

// document.addEventListener('keyup', e => {
//     if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
//         player.dx = 0;
//     }
// });

