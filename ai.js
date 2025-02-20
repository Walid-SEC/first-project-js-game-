const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Character settings
const characterSize = 75;
const characterSpeed = 13;
const jumpStrength = 25; // Jump velocity
const gravity = 1; // Gravity force
let characterPos = { x: 0, y: 0 }; // Initialized here with placeholder values
let velocityY = 0; // Vertical velocity
let isJumping = false;

// Adjust canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    characterPos.x = canvas.width / 3; // Position character at 1/3 of the canvas width
    characterPos.y = canvas.height - characterSize - 20; // Position at the bottom
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

const characterImg = new Image();
characterImg.src = 'assets/char.png'; // Replace with your character image path

// Map settings
let offsetX = 0;

// Keyboard inputs
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

// Draw parallax background
function drawParallaxBackground() {
    backgroundLayers.forEach(layer => {
        const bgWidth = canvas.width; // Match background width to canvas
        const bgHeight = canvas.height; // Match background height to canvas

        // Calculate x position for seamless looping
        const x1 = -offsetX * layer.speed % bgWidth;
        const x2 = x1 + bgWidth;

        // Draw the background layer twice for seamless looping
        ctx.drawImage(layer.img, x1, 0, bgWidth, bgHeight);
        ctx.drawImage(layer.img, x2, 0, bgWidth, bgHeight);
    });
}

// Update background movement
function updateBackground() {
    // Move background left or right based on keyboard input
    if (keys['ArrowLeft']) {
        offsetX -= characterSpeed; // Move background to the right (character appears to move left)
    }
    if (keys['ArrowRight']) {
        offsetX += characterSpeed; // Move background to the left (character appears to move right)
    }
}

// Update character movement (only vertical/jumping)
function updateCharacter() {
    // Jumping logic
    if (keys['ArrowUp'] && !isJumping) {
        isJumping = true;
        velocityY = -jumpStrength;
    }

    // Apply gravity
    if (isJumping) {
        velocityY += gravity; // Increase downward velocity
        characterPos.y += velocityY;

        // Stop the jump when character lands
        if (characterPos.y >= canvas.height - characterSize - 20) {
            characterPos.y = canvas.height - characterSize - 20;
            isJumping = false;
            velocityY = 0;
        }
    }
}

// Draw character
function drawCharacter() {
    ctx.drawImage(characterImg, characterPos.x, characterPos.y, characterSize, characterSize);
}

// Enemy class
class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = 50;
        this.height = 50;
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

// Initialize enemy variables
const enemies = [];
const enemySpawnInterval = 2000; // Spawn an enemy every 2 seconds
let lastEnemySpawnTime = 0;

// Spawn enemy function
function spawnEnemy() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - 50);
    const speed = Math.random() * 2 + 1;
    const enemy = new Enemy(x, y, speed);
    enemies.push(enemy);
}

// Update enemies
function updateEnemies(deltaTime) {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        // Remove enemies that go off-screen
        if (enemies[i].x + enemies[i].width < 0) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

// Draw enemies
function drawEnemies() {
    for (let enemy of enemies) {
        enemy.draw(ctx);
    }
}

// Game loop
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw the background
    updateBackground();
    drawParallaxBackground();

    // Update and draw the character
    updateCharacter();
    drawCharacter();

    // Spawn enemies at regular intervals
    if (timestamp - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawnTime = timestamp;
    }

    // Update and draw the enemies
    updateEnemies();
    drawEnemies();

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop when all assets are loaded
let assetsLoaded = 0;
function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === backgroundLayers.length + 1) {
        gameLoop();
    }
}

characterImg.onload = checkAssetsLoaded;

backgroundLayers.forEach(layer => {
    layer.img.onload = checkAssetsLoaded;
    layer.img.onerror = () => {
        console.error(`Failed to load image: ${layer.src}`);
    };
});