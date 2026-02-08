
const canvas = document.getElementById('gameCanvas');


const ctx = canvas.getContext('2d');



let username = "";
let isGameOver = false;

function startGame() {
  username = document.getElementById("usernameInput").value.trim();
  if (!username) {
    alert("Please enter your username.");
    return;
  }

  // Hide start page and show game
  document.getElementById("startPage").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";

  
  // Start the game loop
  requestAnimationFrame(gameLoop);
}



 


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

const archerEnemySize = 120;
const archerEnemySpeed = 2;
const arrowSpeed = 5;
let archerEnemies = [];
const archerSpawnInterval = 3000 ; 

const archerWalkSpritesheet = new Image();
archerWalkSpritesheet.src = 'Walk.png';

const archerShotSpritesheet = new Image();
archerShotSpritesheet.src = 'Shot.png';

const arrowImage = new Image();
arrowImage.src = 'Arrow.png';

const archerWalkFrames = {
    frameWidth: 110,
    frameHeight: 130,
    gap: 24,
    totalFrames: 8,
    currentFrame: 0,
    frameDelay: 3,
    frameCounter: 0
};

const archerShotFrames = {
    frameWidth:120,
    frameHeight: 130,
    gap: 5,
    totalFrames: 14,
    currentFrame: 0,
    frameDelay: 5,
    frameCounter: 0
};

// Arrows array to track multiple arrows
let arrows = [];


function spawnArcherEnemy() {
    archerEnemies.push({
        x: canvas.width + archerEnemySize,
        worldX: offsetX + canvas.width + archerEnemySize,
        y: canvas.height - archerEnemySize-10,
        state: 'walking', // walking, shooting, idle
        walkDistance: 200, // How far the archer will walk
        shootTimer: 0,
        active: true,
        currentFrame: 0,   // Initialize this archer's frame index
        frameCounter: 0 
    });
}

function updateArcherEnemies() {
    archerEnemies = archerEnemies.filter(archer => {
        if (!archer.active) return false;

        // Walking state
        if (archer.state === 'walking') {
            archer.worldX -= archerEnemySpeed; // Assuming archerEnemySpeed is defined

            // Stop walking when reached desired distance
            // Make sure offsetX and canvas.width are accessible here
            if (archer.worldX <= offsetX + canvas.width - archer.walkDistance) {
                archer.state = 'shooting';
                archer.shootTimer = 0;
                // --- Reset animation state for THIS archer ---
                archer.currentFrame = 0;
                archer.frameCounter = 0;
                // -------------------------------------------
            }
        }

        // Shooting state
        if (archer.state === 'shooting') {
            archer.shootTimer++;

            // Make sure arrows array is accessible
            if (archer.shootTimer % 60 === 0) {
                arrows.push({
                    y: archer.y + archerEnemySize / 2,
                    worldX: archer.worldX,
                    active: true
                });
            }
        }

        // Calculate screen position
        archer.x = archer.worldX - offsetX; // Make sure offsetX is accessible

        // Keep archer if it's within a reasonable range
        return archer.x > -archerEnemySize * 2 && archer.x < canvas.width + archerEnemySize * 2;
    });
}

function updateArrows() {
    arrows = arrows.filter(arrow => {
        if (!arrow.active) return false;
        
        // Move arrow in world coordinates
        arrow.worldX -= arrowSpeed;
        
        // Calculate screen position from world position
        arrow.x = arrow.worldX - offsetX;
        
        // Check if arrow is off screen with some buffer
        return arrow.x > -50 && arrow.x < canvas.width + 50;
    });
}

function updateArcherEnemyAnimation() {
    archerEnemies.forEach(archer => {
        if (!archer.active) return; // Skip inactive archers

        let currentAnimationData;

        // Determine which animation data to use based on state
        if (archer.state === 'walking') {
            currentAnimationData = archerWalkFrames;
        } else if (archer.state === 'shooting') {
            currentAnimationData = archerShotFrames;
        } else {
            return; // Skip if state is unknown or doesn't have animation
        }

        // Update this archer's frame counter
        archer.frameCounter++;

        // Check if it's time to advance to the next frame
        if (archer.frameCounter >= currentAnimationData.frameDelay) {
            archer.frameCounter = 0; // Reset counter
            // Advance frame, wrapping around using modulo
            archer.currentFrame = (archer.currentFrame + 1) % currentAnimationData.totalFrames;
        }
    });
}
function drawArcherEnemies() {
    // Make sure archerWalkSpritesheet and archerShotSpritesheet are loaded Image objects
    archerEnemies.forEach(archer => {
        if (archer.active) {
            let currentFramesData, currentSheet;

            if (archer.state === 'walking') {
                currentFramesData = archerWalkFrames;
                currentSheet = archerWalkSpritesheet; // Ensure this is loaded
            } else { // Assuming 'shooting' is the other main state
                currentFramesData = archerShotFrames;
                currentSheet = archerShotSpritesheet; // Ensure this is loaded
            }

            // --- Use the archer's individual currentFrame ---
            const frameX = archer.currentFrame * (currentFramesData.frameWidth + currentFramesData.gap);
            const frameY = 0; // Assuming frames are in a single row on the spritesheet

            if (currentSheet && currentSheet.complete) { // Check if sheet is loaded
                 ctx.drawImage(
                    currentSheet,
                    frameX, frameY,
                    currentFramesData.frameWidth, currentFramesData.frameHeight,
                    archer.x, archer.y,
                    archerEnemySize, archerEnemySize // Use the defined size
                );
            } else {
                 // Optionally draw a placeholder or log an error if sheet not ready
                 // console.log("Spritesheet not ready for archer");
            }
        }
    });
}

function drawArrows() {
    // if (!arrowImage.complete) return; // Keep this check if using it

    arrows.forEach(arrow => {
        if (arrow.active) {
            // --- TEMPORARY TEST ---
            ctx.fillStyle = 'red'; // Choose a visible color
            ctx.fillRect(arrow.x, arrow.y, 10, 3); // Draw a small rectangle
            // --- Replace drawImage ---
            // ctx.drawImage(arrowImage, arrow.x, arrow.y, 50, 10);
        }
    });
}

function checkArrowCollisions() {
    const characterHitbox = {
        x: characterPos.x + 10,
        y: characterPos.y + 10,
        width: characterSize - 20,
        height: characterSize - 20
    };

    arrows.forEach(arrow => {
        const arrowHitbox = {
            x: arrow.x,
            y: arrow.y,
            width: 50,
            height: 10
        };

        if (characterHitbox.x < arrowHitbox.x + arrowHitbox.width &&
            characterHitbox.x + characterHitbox.width > arrowHitbox.x &&
            characterHitbox.y < arrowHitbox.y + arrowHitbox.height &&
            characterHitbox.y + characterHitbox.height > arrowHitbox.y) {
            console.log('Hit by arrow!');
            endGame();
            arrow.active = false;
        }
    });
}


// Character settings
const characterSize = 75;
const characterSpeed = 15;
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
const spawnInterval = 2000; // Spawn enemy every 3 seconds

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
            endGame();
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

    // Check regular enemy collisions
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
    
    // Check archer enemy collisions - added this section
    archerEnemies.forEach(archer => {
        if (!archer.active) return;

        const archerHitbox = {
            x: archer.x + 5,
            y: archer.y + 5,
            width: archerEnemySize - 10,
            height: archerEnemySize - 10
        };

        // Check if the attack hitbox overlaps with the archer hitbox
        if (attackHitbox.x < archerHitbox.x + archerHitbox.width &&
            attackHitbox.x + attackHitbox.width > archerHitbox.x &&
            attackHitbox.y < archerHitbox.y + archerHitbox.height &&
            attackHitbox.y + attackHitbox.height > archerHitbox.y) {
            // Kill the archer
            archer.active = false;
            console.log('Archer killed!');
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

    updateArcherEnemies();
    updateArcherEnemyAnimation();
    updateArrows();

    drawCharacter();
    drawEnemies();
    drawArcherEnemies();
    drawArrows();

    checkCollisions();
    checkAttackCollisions(); 
    checkArrowCollisions();

    requestAnimationFrame(gameLoop);
    
}

// Start enemy spawning
const spawnTimer = setInterval(spawnEnemy, spawnInterval);

const archerSpawnTimer = setInterval(spawnArcherEnemy, archerSpawnInterval);



let assetsLoaded = 0;
let allAssetsReady = false;
let playerWantsToStart = false;

function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === backgroundLayers.length + 11) {
        allAssetsReady = true;
        backgroundMusic.play();

        if (playerWantsToStart) {
            requestAnimationFrame(gameLoop);
        }
    }
}




function startGame() {
  username = document.getElementById("usernameInput").value.trim();
  if (!username) {
    alert("Please enter your username.");
    return;
  }

  document.getElementById("startPage").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";

  isGameOver = false;
  score = 0;
  playerWantsToStart = true;

  if (allAssetsReady) {
    requestAnimationFrame(gameLoop);
  }
}


function endGame() {
    // Stop the game loop
    isGameOver = true;

    // Hide the canvas
    document.getElementById("gameCanvas").style.display = "none";

    // Show the game over screen
    document.getElementById("gameOverPage").style.display = "block";

   
    // Optionally: stop background music or play game over sound
    backgroundMusic.pause();
    
}


function restartGame() {
    // Hide game over screen and show the start page
    document.getElementById("gameOverPage").style.display = "none";
    document.getElementById("startPage").style.display = "flex";

    // Reset game state variables
   
    // Reset player position, enemies, etc.

    // Reset the game loop (assets loaded check again)
    playerWantsToStart = false;
    allAssetsReady = false;

    // Optionally, reset music if needed
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();

    // (Re-)check if assets are loaded
   
    location.reload();


    // assetsLoaded will be checked in checkAssetsLoaded
}








// Add onload and onerror handlers for spritesheets
runSpritesheet.onload = checkAssetsLoaded;
jumpSpritesheet.onload = checkAssetsLoaded;
attackSpritesheet.onload = checkAssetsLoaded;
enemySpritesheet.onload = checkAssetsLoaded;

//onload error for ranged ennemy
archerWalkSpritesheet.onload = checkAssetsLoaded;
archerShotSpritesheet.onload = checkAssetsLoaded;
arrowImage.onload = checkAssetsLoaded;

archerWalkSpritesheet.onerror = () => console.error('Failed to load archer walk spritesheet');
archerShotSpritesheet.onerror = () => console.error('Failed to load archer shot spritesheet');
arrowImage.onerror = () => console.error('Failed to load arrow image');

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

function hideGameOverPage() {
    document.getElementById("gameOverPage").style.display = "none"; // Hide the game over page
    console.log('grijgj')
}

function showGameOverPage() {
    document.getElementById("gameOverPage").style.display = "flex"; // Show the game over page
}

