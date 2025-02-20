const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Character settings
const characterSize = 75;
const characterSpeed = 13;
const jumpStrength = 25;
const gravity = 1;
let characterPos = { x: 0, y: 0 };
let velocityY = 0;
let isJumping = false;

// Enemy settings
const enemySize = 60;
const enemySpeed = 5;
let enemies = [];
const spawnInterval = 2000; // Spawn enemy every 2 seconds

// Adjust canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    characterPos.x = canvas.width / 3;
    characterPos.y = canvas.height - characterSize; // Removed the -20 offset
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Assets
const backgroundLayers = [
    { img: new Image(), src: 'assets/far-mountain.png', speed: 0.2 },
    { img: new Image(), src: 'assets/moremountains.png', speed: 0.4 },
    { img: new Image(), src: 'assets/moremountaintrees.png', speed: 0.6 },
    { img: new Image(), src: 'assets/mountain-trees.png', speed: 0.8 },
];

// To change character image, update this URL
const characterImg = new Image();
characterImg.src = 'assets/char.png';

// To change enemy image, update this URL
const enemyImg = new Image();
enemyImg.src = 'zombie.png';

let offsetX = 0;
let movementSpeed = 0;
let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Load background images
backgroundLayers.forEach(layer => {
    layer.img.src = layer.src;
});

function spawnEnemy() {
    enemies.push({
        x: canvas.width + enemySize,
        y: canvas.height - enemySize, // Removed the -20 offset
        active: true
    });
}

function updateEnemies() {
    enemies = enemies.filter(enemy => {
        if (!enemy.active) return false;
        // Adjust enemy movement based on character movement
        enemy.x -= enemySpeed + movementSpeed;
        return enemy.x > -enemySize;
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.active) {
            ctx.drawImage(enemyImg, enemy.x, enemy.y, enemySize, enemySize);
        }
    });
}

function checkCollisions() {
    const characterHitbox = {
        x: characterPos.x + 10,
        y: characterPos.y + 10,
        width: characterSize - 20,
        height: characterSize - 20
    };

    enemies.forEach(enemy => {
        if (!enemy.active) return;

        const enemyHitbox = {
            x: enemy.x + 5,
            y: enemy.y + 5,
            width: enemySize - 10,
            height: enemySize - 10
        };

        if (characterHitbox.x < enemyHitbox.x + enemyHitbox.width &&
            characterHitbox.x + characterHitbox.width > enemyHitbox.x &&
            characterHitbox.y < enemyHitbox.y + enemyHitbox.height &&
            characterHitbox.y + characterHitbox.height > enemyHitbox.y) {
            // Collision detected! You can add game over logic here
            console.log('Game Over!');
        }
    });
}

function drawParallaxBackground() {
    backgroundLayers.forEach(layer => {
        const bgWidth = canvas.width;
        const bgHeight = canvas.height;
        const x1 = -offsetX * layer.speed % bgWidth;
        const x2 = x1 + bgWidth;
        ctx.drawImage(layer.img, x1, 0, bgWidth, bgHeight);
        ctx.drawImage(layer.img, x2, 0, bgWidth, bgHeight);
    });
}

function updateBackground() {
    movementSpeed = 0; // Reset movement speed
    if (keys['ArrowLeft']) {
        offsetX -= characterSpeed;
        movementSpeed = -characterSpeed; // Moving left
    }
    if (keys['ArrowRight']) {
        offsetX += characterSpeed;
        movementSpeed = characterSpeed; // Moving right
    }
}

function updateCharacter() {
    if (keys['ArrowUp'] && !isJumping) {
        isJumping = true;
        velocityY = -jumpStrength;
    }

    if (isJumping) {
        velocityY += gravity;
        characterPos.y += velocityY;

        if (characterPos.y >= canvas.height - characterSize) { // Removed the -20 offset
            characterPos.y = canvas.height - characterSize; // Removed the -20 offset
            isJumping = false;
            velocityY = 0;
        }
    }
}

function drawCharacter() {
    ctx.drawImage(characterImg, characterPos.x, characterPos.y, characterSize, characterSize);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackground();
    drawParallaxBackground();

    updateCharacter();
    updateEnemies();
    
    drawCharacter();
    drawEnemies();
    
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Start enemy spawning
const spawnTimer = setInterval(spawnEnemy, spawnInterval);

// Start the game loop when assets are loaded
let assetsLoaded = 0;
function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === backgroundLayers.length + 2) { // +2 for character and enemy images
        gameLoop();
    }
}

characterImg.onload = checkAssetsLoaded;
enemyImg.onload = checkAssetsLoaded;

backgroundLayers.forEach(layer => {
    layer.img.onload = checkAssetsLoaded;
    layer.img.onerror = () => {
        console.error(`Failed to load image: ${layer.src}`);
    };
});