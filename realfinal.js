const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Character settings
const characterSize = 75;
const characterSpeed = 10;
const jumpStrength = 20;
const gravity = 1;
let characterPos = { x: 0, y: 0 };
let velocityY = 0;
let isJumping = false;

// Enemy settings
const enemySize = 65;
const enemySpeed = 3;
let enemies = [];
const spawnInterval = 3000; // Spawn enemy every 2 seconds

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

// Replace characterImg with spritesheet
const spritesheet = new Image();
spritesheet.src = 'spritesheet.png'; // Path to your character sprite sheet

// Replace enemyImg with enemySpritesheet
const enemySpritesheet = new Image();
enemySpritesheet.src = 'zombiesheet.png'; // Updated to zombiesheet.png

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

// Character running animation settings
const runningFrames = {
    frameWidth: 328, // Width of one frame
    frameHeight: 458, // Height of one frame
    gap: 37, // Approximate gap between frames
    totalFrames: 11, // Total number of frames
    currentFrame: 0, // Current frame being displayed
    frameDelay: 3, // Delay between frames (controls animation speed)
    frameCounter: 1 // Counter to track when to switch frames
};

// Enemy walking animation settings
const enemyFrames = {
    frameWidth: 434, // Width of one frame
    frameHeight: 548, // Height of one frame
    gap: 110, 
    totalFrames: 9, // Total number of frames in the sprite sheet
    currentFrame: 0, // Current frame being displayed
    frameDelay: 3, // Delay between frames (controls animation speed)
    frameCounter: 0 // Counter to track when to switch frames
};

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

function updateEnemyAnimation() {
    enemyFrames.frameCounter++;
    if (enemyFrames.frameCounter >= enemyFrames.frameDelay) {
        enemyFrames.frameCounter = 0;
        enemyFrames.currentFrame = (enemyFrames.currentFrame + 1) % enemyFrames.totalFrames;
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.active) {
            // Calculate the X position of the current frame
            const frameX = enemyFrames.currentFrame * (enemyFrames.frameWidth + enemyFrames.gap);
            const frameY = 0; // Since all frames are in a single row, frameY is always 0

            // Draw the current frame
            ctx.drawImage(
                enemySpritesheet,
                frameX, frameY, enemyFrames.frameWidth, enemyFrames.frameHeight, // Source rectangle
                enemy.x, enemy.y, enemySize, enemySize // Destination rectangle (scaled down)
            );
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
    const frameX = runningFrames.currentFrame * (runningFrames.frameWidth + runningFrames.gap);
    const frameY = 0; // Adjust if your sprite sheet has multiple rows

    ctx.drawImage(
        spritesheet,
        frameX, frameY, runningFrames.frameWidth, runningFrames.frameHeight, // Source rectangle
        characterPos.x, characterPos.y, characterSize, characterSize // Destination rectangle (scaled down)
    );
}

function gameLoop() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackground();
    drawParallaxBackground();

    updateCharacter();
    updateEnemies();
    updateEnemyAnimation(); // Update enemy animation

    // Update running animation
    if (keys['ArrowLeft'] || keys['ArrowRight']) {
        runningFrames.frameCounter++;
        if (runningFrames.frameCounter >= runningFrames.frameDelay) {
            runningFrames.frameCounter = 0;
            runningFrames.currentFrame = (runningFrames.currentFrame + 1) % runningFrames.totalFrames;
        }
    } else {
        // Reset to the first frame when not moving
        runningFrames.currentFrame = 0;
    }

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
    if (assetsLoaded === backgroundLayers.length + 2) { // +2 for spritesheet and enemy images
        gameLoop();
    }
}

spritesheet.onload = checkAssetsLoaded;
enemySpritesheet.onload = checkAssetsLoaded;

backgroundLayers.forEach(layer => {
    layer.img.onload = checkAssetsLoaded;
    layer.img.onerror = () => {
        console.error(`Failed to load image: ${layer.src}`);
    };
});