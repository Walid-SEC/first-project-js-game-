const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio setup
const backgroundMusic = new Audio('sounds/backroundmusic.wav');
const runningSound = new Audio('sounds/running.wav');
const jumpSound = new Audio('sounds/jump.wav');
const attackSound = new Audio('sounds/attack.wav');

// Configure audio settings
backgroundMusic.loop = true; // Loop background music
backgroundMusic.volume = 0.1; // Set volume to 50%
runningSound.volume = 0.4; // Adjust running sound volume
jumpSound.volume = 0.4;
attackSound.volume = 0.4;

// Character settings
const characterSize = 75;
const characterSpeed = 10;
const jumpStrength = 20;
const gravity = 1;
let characterPos = { x: 0, y: 0 };
let velocityY = 0;
let isJumping = false;

// Attack spritesheet
const attackSpritesheet = new Image();
attackSpritesheet.src = 'attacksprite.png'; // Path to your attack sprite sheet

// Enemy settings
const enemySize = 65;
const enemySpeed = 3;
let enemies = [];
const spawnInterval = 3000; // Spawn enemy every 3 seconds

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

    // Trigger attack when the attack key is pressed (e.g., Spacebar)
    if (e.key === ' ' && !attackFrames.isAttacking) { // Spacebar for attack
        attackFrames.isAttacking = true;
        attackFrames.currentFrame = 0; // Reset to the first frame
        
        // Play attack sound
        attackSound.currentTime = 0; // Reset sound to start
        attackSound.play();
    }
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
    JUMPING: 'jumping',
    ATTACKING: 'attacking'
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

// Character attack animation settings
const attackFrames = {
    frameWidth: 480, // Adjust based on your attacksprite.png
    frameHeight: 458, // Adjust based on your attacksprite.png
    gap:60 , // Adjust based on your attacksprite.png
    totalFrames: 10, // Adjust based on number of attack animation frames
    currentFrame: 0,
    frameDelay:2,
    frameCounter: 2,
    isAttacking: false // Flag to check if the player is attacking
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
            resetCharacter();
        }
    });
}

function checkAttackCollisions() {
    if (!attackFrames.isAttacking) return; // Only check collisions during an attack

    const attackHitbox = {
        x: characterPos.x + 50, // Adjust based on your character's attack range
        y: characterPos.y + 10,
        width: 100, // Adjust based on your character's attack range
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

        // Check if the attack hitbox overlaps with the enemy hitbox
        if (attackHitbox.x < enemyHitbox.x + enemyHitbox.width &&
            attackHitbox.x + attackHitbox.width > enemyHitbox.x &&
            attackHitbox.y < enemyHitbox.y + enemyHitbox.height &&
            attackHitbox.y + attackHitbox.height > enemyHitbox.y) {
            // Kill the zombie
            enemy.active = false;
            console.log('Zombie killed!');
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
    let isRunning = false;
    movementSpeed = 0;
    
    if (keys['ArrowLeft']) {
        offsetX -= characterSpeed;
        movementSpeed = -characterSpeed;
        isRunning = true;
    }
    if (keys['ArrowRight']) {
        offsetX += characterSpeed;
        movementSpeed = characterSpeed;
        isRunning = true;
    }

    // Modify running sound logic
    if (isRunning) {
        // If running sound is not already playing, play it
        if (runningSound.paused) {
            runningSound.currentTime = 0;
            runningSound.loop = true; // Make sound loop while running
            runningSound.play().catch(error => {
                console.error('Error playing running sound:', error);
            });
        }
    } else {
        // Stop running sound when not moving
        runningSound.pause();
        runningSound.currentTime = 0;
    }
}

function updateCharacter() {
    if (keys['ArrowUp'] && !isJumping) {
        isJumping = true;
        velocityY = -jumpStrength;
        currentState = STATES.JUMPING;
        jumpingFrames.currentFrame = 0; // Reset jump animation
        
        // Play jump sound
        jumpSound.currentTime = 0; // Reset sound to start
        jumpSound.play();
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
    if (attackFrames.isAttacking) {
        // Update attack animation
        attackFrames.frameCounter++;
        if (attackFrames.frameCounter >= attackFrames.frameDelay) {
            attackFrames.frameCounter = 0;
            attackFrames.currentFrame++;

            // End the attack animation after the last frame
            if (attackFrames.currentFrame >= attackFrames.totalFrames) {
                attackFrames.isAttacking = false;
                attackFrames.currentFrame = 0;
                currentState = STATES.RUNNING; // Return to running state after attack
            }
        }
    } else if (currentState === STATES.RUNNING) {
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

function drawCharacter() {
    let currentFrames, currentSheet;

    if (attackFrames.isAttacking) {
        currentFrames = attackFrames;
        currentSheet = attackSpritesheet;
    } else if (currentState === STATES.RUNNING) {
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
    checkAttackCollisions(); // Check for attack collisions

    requestAnimationFrame(gameLoop);
}

// Start enemy spawning
const spawnTimer = setInterval(spawnEnemy, spawnInterval);

// Start the game loop when assets are loaded
let assetsLoaded = 0;
function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === backgroundLayers.length + 8) { // +8 for run, jump, attack, enemy spritesheets, and 4 audio files
        // Start background music
        backgroundMusic.play();
        
        gameLoop();
    }
}

// Add onload and onerror handlers for spritesheets
runSpritesheet.onload = checkAssetsLoaded;
jumpSpritesheet.onload = checkAssetsLoaded;
attackSpritesheet.onload = checkAssetsLoaded;
enemySpritesheet.onload = checkAssetsLoaded;

// Add onload and onerror handlers for background images
backgroundLayers.forEach(layer => {
    layer.img.onload = checkAssetsLoaded;
    layer.img.onerror = () => {
        console.error(`Failed to load image: ${layer.src}`);
    };
});

// Add onload and onerror handlers for audio
backgroundMusic.onloadeddata = checkAssetsLoaded;
runningSound.onloadeddata = checkAssetsLoaded;
jumpSound.onloadeddata = checkAssetsLoaded;
attackSound.onloadeddata = checkAssetsLoaded;

backgroundMusic.onerror = () => console.error('Failed to load background music');
runningSound.onerror = () => console.error('Failed to load running sound');
jumpSound.onerror = () => console.error('Failed to load jump sound');
attackSound.onerror = () => console.error('Failed to load attack sound');