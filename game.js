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

const attackSpritesheet = new Image();
attackSpritesheet.src = 'attacksprite.png';

// Enemy settings
const enemySize = 65;
const enemySpeed = 3;
let enemies = [];
const spawnInterval = 3000;

// Adjust canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    characterPos.x = canvas.width / 3;
    characterPos.y = canvas.height - characterSize;
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

// Character sprites
const runSpritesheet = new Image();
runSpritesheet.src = 'spritesheet.png';

const jumpSpritesheet = new Image();
jumpSpritesheet.src = 'jumpsheet.png';

// Enemy spritesheet
const enemySpritesheet = new Image();
enemySpritesheet.src = 'zombiesheet.png';

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

// Animation states
const STATES = {
    RUNNING: 'running',
    JUMPING: 'jumping'
};
let currentState = STATES.RUNNING;

// Character running animation settings
const runningFrames = {
    frameWidth: 328,
    frameHeight: 458,
    gap: 37,
    totalFrames: 11,
    currentFrame: 0,
    frameDelay: 3,
    frameCounter: 1
};

// Character jumping animation settings
const jumpingFrames = {
    frameWidth: 282, // Adjust based on your jumpsheet.png
    frameHeight: 483, // Adjust based on your jumpsheet.png
    gap: 80, // Adjust based on your jumpsheet.png
    totalFrames: 11, // Adjust based on number of jump animation frames
    currentFrame: 0,
    frameDelay: 3,
    frameCounter: 0
};

// Enemy walking animation settings
const enemyFrames = {
    frameWidth: 434,
    frameHeight: 548,
    gap: 110,
    totalFrames: 9,
    currentFrame: 0,
    frameDelay: 3,
    frameCounter: 0
};

function spawnEnemy() {
    enemies.push({
        x: canvas.width + enemySize,
        y: canvas.height - enemySize,
        active: true
    });
}

function updateEnemies() {
    enemies = enemies.filter(enemy => {
        if (!enemy.active) return false;
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
            const frameX = enemyFrames.currentFrame * (enemyFrames.frameWidth + enemyFrames.gap);
            const frameY = 0;
            ctx.drawImage(
                enemySpritesheet,
                frameX, frameY, enemyFrames.frameWidth, enemyFrames.frameHeight,
                enemy.x, enemy.y, enemySize, enemySize
            );
        }
    });
}


const startingPosition = { x: 450, y: 670 };


function resetCharacter() {
    characterPos.x = startingPosition.x; // Reset X position
    characterPos.y = startingPosition.y; // Reset Y position
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
            console.log('Game Over!');
            resetCharacter()
            
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
    movementSpeed = 0;
    if (keys['ArrowLeft']) {
        offsetX -= characterSpeed;
        movementSpeed = -characterSpeed;
    }
    if (keys['ArrowRight']) {
        offsetX += characterSpeed;
        movementSpeed = characterSpeed;
    }
}

function updateCharacter() {
    if (keys['ArrowUp'] && !isJumping) {
        isJumping = true;
        velocityY = -jumpStrength;
        currentState = STATES.JUMPING;
        jumpingFrames.currentFrame = 0; // Reset jump animation
    }

    if (isJumping) {
        velocityY += gravity;
        characterPos.y += velocityY;

        if (characterPos.y >= canvas.height - characterSize) {
            characterPos.y = canvas.height - characterSize;
            isJumping = false;
            velocityY = 0;
            currentState = STATES.RUNNING;
        }
    }
}


function updateCharacterAnimation() {
    if (currentState === STATES.RUNNING) {
        if (keys['ArrowLeft'] || keys['ArrowRight']) {
            runningFrames.frameCounter++;
            if (runningFrames.frameCounter >= runningFrames.frameDelay) {
                runningFrames.frameCounter = 0;
                runningFrames.currentFrame = (runningFrames.currentFrame + 1) % runningFrames.totalFrames;
            }
        } else {
            runningFrames.currentFrame = 0;
        }
    } else if (currentState === STATES.JUMPING) {
        // Update jump animation based on vertical velocity
        jumpingFrames.frameCounter++;
        if (jumpingFrames.frameCounter >= jumpingFrames.frameDelay) {
            jumpingFrames.frameCounter = 0;
            
            // Rising frames (0-5)
            if (velocityY < 0) {
                jumpingFrames.currentFrame = Math.min(5, jumpingFrames.currentFrame + 1);
            }
            // Falling frames (6-10)
            else {
                jumpingFrames.currentFrame = Math.min(10, Math.max(6, jumpingFrames.currentFrame + 1));
            }
        }
    }
}

// [Rest of the code remains the same]

function drawCharacter() {
    let currentFrames, currentSheet;
    
    if (currentState === STATES.RUNNING) {
        currentFrames = runningFrames;
        currentSheet = runSpritesheet;
    } else {
        currentFrames = jumpingFrames;
        currentSheet = jumpSpritesheet;
    }

    const frameX = currentFrames.currentFrame * (currentFrames.frameWidth + currentFrames.gap);
    const frameY = 0;

    ctx.drawImage(
        currentSheet,
        frameX, frameY, currentFrames.frameWidth, currentFrames.frameHeight,
        characterPos.x, characterPos.y, characterSize, characterSize
    );
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackground();
    drawParallaxBackground();

    updateCharacter();
    updateCharacterAnimation();
    updateEnemies();
    updateEnemyAnimation();

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
    if (assetsLoaded === backgroundLayers.length + 3) { // +3 for run spritesheet, jump spritesheet, and enemy images
        gameLoop();
    }
}

runSpritesheet.onload = checkAssetsLoaded;
jumpSpritesheet.onload = checkAssetsLoaded;
enemySpritesheet.onload = checkAssetsLoaded;

backgroundLayers.forEach(layer => {
    layer.img.onload = checkAssetsLoaded;
    layer.img.onerror = () => {
        console.error(`Failed to load image: ${layer.src}`);
    };
});