class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.player = new Player(this.canvas);
        this.enemies = [];
        this.score = 0;
        this.gameOver = false;
        this.enemySpawnInterval = 2000; // ms
        this.lastSpawnTime = 0;

        this.characterSize = 75;
        this.characterSpeed = 13;
        this.jumpStrength = 25;
        this.gravity = 1;
        this.characterPos = { x: this.canvas.width / 3, y: this.canvas.height - this.characterSize - 20 };
        this.velocityY = 0;
        this.isJumping = false;
        this.offsetX = 0;
        this.keys = {};


        this.backgroundLayers = [
            { img: new Image(), src: 'assets/far-mountain.png', speed: 0.2 },
            { img: new Image(), src: 'assets/moremountains.png', speed: 0.4 },
            { img: new Image(), src: 'assets/moremountaintrees.png', speed: 0.6 },
            { img: new Image(), src: 'assets/mountain-trees.png', speed: 0.8 },
        ];

        this.characterImg = new Image();
        this.characterImg.src = 'assets/char.png';
        this.loadAssets();

        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 400;
    }

    loadAssets() {
        let assetsLoaded = 0;
        const checkAssetsLoaded = () => {
            assetsLoaded++;
            if (assetsLoaded === this.backgroundLayers.length + 1) {
                this.animate();
            }
        };

        this.characterImg.onload = checkAssetsLoaded;
        this.backgroundLayers.forEach(layer => {
            layer.img.onload = checkAssetsLoaded;
            layer.img.onerror = () => {
                console.error(`Failed to load image: ${layer.src}`);
            };
            layer.img.src = layer.src;
        });
    }


    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.reset();
        });
    }

    reset() {
        this.enemies = [];
        this.score = 0;
        this.gameOver = false;
        this.lastSpawnTime = 0;
        this.characterPos = { x: this.canvas.width / 3, y: this.canvas.height - this.characterSize - 20 };
        this.velocityY = 0;
        this.isJumping = false;
        this.offsetX = 0;
        this.player = new Player(this.canvas);
        document.getElementById('score').textContent = this.score;
        this.animate();
    }

    spawnEnemy() {
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.enemySpawnInterval) {
            this.enemies.push(new Enemy(this.canvas));
            this.lastSpawnTime = currentTime;
        }
    }

    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update();

            if (this.enemies[i].isOffScreen()) {
                this.enemies.splice(i, 1);
                this.score += 10;
                document.getElementById('score').textContent = this.score;
            } else if (this.enemies[i].checkCollision(this.characterPos, this.characterSize)) {
                this.gameOver = true;
            }
        }
    }

    drawParallaxBackground() {
        this.backgroundLayers.forEach(layer => {
            const bgWidth = this.canvas.width;
            const bgHeight = this.canvas.height;
            const x1 = -this.offsetX * layer.speed % bgWidth;
            const x2 = x1 + bgWidth;
            this.ctx.drawImage(layer.img, x1, 0, bgWidth, bgHeight);
            this.ctx.drawImage(layer.img, x2, 0, bgWidth, bgHeight);
        });
    }

    updateBackground() {
        if (this.keys['ArrowLeft']) {
            this.offsetX -= this.characterSpeed;
        }
        if (this.keys['ArrowRight']) {
            this.offsetX += this.characterSpeed;
        }
    }

    updateCharacter() {
        if (this.keys['ArrowUp'] && !this.isJumping) {
            this.isJumping = true;
            this.velocityY = -this.jumpStrength;
        }

        if (this.isJumping) {
            this.velocityY += this.gravity;
            this.characterPos.y += this.velocityY;

            if (this.characterPos.y >= this.canvas.height - this.characterSize - 20) {
                this.characterPos.y = this.canvas.height - this.characterSize - 20;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }
    }

    drawCharacter() {
        this.ctx.drawImage(this.characterImg, this.characterPos.x, this.characterPos.y, this.characterSize, this.characterSize);
    }

    drawEnemies() {
        this.enemies.forEach(enemy => enemy.draw());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawParallaxBackground();
        this.drawCharacter();
        this.drawEnemies();


        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }


    update() {
        if (!this.gameOver) {
            this.updateCharacter();
            this.updateBackground();
            this.spawnEnemy();
            this.updateEnemies();
        }
    }

    animate() {
        if (this.gameOver) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => {
    new Game();
};