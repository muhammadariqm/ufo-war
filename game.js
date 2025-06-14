const isMobile = window.innerWidth < 768;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-game',
        width: isMobile ? 480 : 720,
        height: isMobile ? 800 : 960
    },
    backgroundColor: "#222",
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};


let player, bullets, cursors, shootKey, enemies;
let score = 0, lives = 3;
let scoreText, livesText, gameOverText;
let emitter;
let leftButton, rightButton, fireButton;


const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/player.png');
    this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullet.png');
    this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/ufo.png');
    this.load.image('explosion', 'https://labs.phaser.io/assets/particles/yellow.png');
}

function create() {
    const w = this.scale.width;
    const h = this.scale.height;

    player = this.physics.add.sprite(w / 2, h - 80, 'player').setCollideWorldBounds(true);
    bullets = this.physics.add.group();
    enemies = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();
    shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            const x = Phaser.Math.Between(50, w - 50);
            const enemy = enemies.create(x, -20, 'enemy');
            enemy.setVelocityY(100);
        }
    });

    emitter = this.add.particles(0, 0, 'explosion', {
        speed: 100,
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        emitting: false
    });

    this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
        bullet.destroy();
        enemy.destroy();
        emitter.emitParticleAt(enemy.x, enemy.y);
        score += 10;
        scoreText.setText(`Score: ${score}`);
    });

    this.physics.add.overlap(enemies, player, (enemy) => {
        enemy.destroy();
        lives--;
        livesText.setText(`Lives: ${lives}`);
        if (lives <= 0) {
            this.scene.pause();
            gameOverText.setVisible(true);
        }
    });

    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });
    livesText = this.add.text(10, 35, 'Lives: 3', { fontSize: '20px', fill: '#fff' });
    gameOverText = this.add.text(w / 2, h / 2, 'GAME OVER', { fontSize: '40px', fill: '#f00' }).setOrigin(0.5).setVisible(false);

    // Tampilkan tombol hanya jika mobile
    if (isMobile) {
        leftButton = this.add.text(w * 0.1, h - 60, '⬅️', { fontSize: '36px', fill: '#fff' }).setInteractive();
        rightButton = this.add.text(w * 0.3, h - 60, '➡️', { fontSize: '36px', fill: '#fff' }).setInteractive();
        fireButton = this.add.text(w * 0.8, h - 60, '🔥', { fontSize: '36px', fill: '#fff' }).setInteractive();

        leftButton.on('pointerdown', () => player.setVelocityX(-300));
        rightButton.on('pointerdown', () => player.setVelocityX(300));
        leftButton.on('pointerup', () => player.setVelocityX(0));
        rightButton.on('pointerup', () => player.setVelocityX(0));
        fireButton.on('pointerdown', shootBullet);
    }
}

function update() {
    if (!isMobile) {
        if (cursors.left.isDown) {
            player.setVelocityX(-300);
        } else if (cursors.right.isDown) {
            player.setVelocityX(300);
        } else {
            player.setVelocityX(0);
        }

        if (Phaser.Input.Keyboard.JustDown(shootKey)) {
            shootBullet();
        }
    }
}

function shootBullet() {
    if (lives <= 0) return;
    const bullet = bullets.create(player.x, player.y - 20, 'bullet');
    bullet.setVelocityY(-400);
}
