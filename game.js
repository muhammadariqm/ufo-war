const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

let player;
let bullets;
let cursors;
let shootKey;
let enemies;
let score = 0;
let lives = 3;
let scoreText;
let livesText;
let gameOverText;
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
    player = this.physics.add.sprite(400, 500, 'player').setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();
    shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    bullets = this.physics.add.group();
    enemies = this.physics.add.group();

    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            const x = Phaser.Math.Between(50, 750);
            const enemy = enemies.create(x, 0, 'enemy');
            enemy.setVelocityY(100);
        }
    });

    // Efek ledakan (versi baru Phaser 3.90)
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

    this.physics.add.overlap(enemies, player, (enemy, player) => {
        enemy.destroy();
        lives--;
        livesText.setText(`Lives: ${lives}`);
        if (lives <= 0) {
            this.scene.pause();
            gameOverText.setVisible(true);
        }
    });

    // Skor & nyawa
    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });
    livesText = this.add.text(10, 40, 'Lives: 3', { fontSize: '20px', fill: '#fff' });
    gameOverText = this.add.text(300, 250, 'GAME OVER', { fontSize: '40px', fill: '#f00' });
    gameOverText.setVisible(false);

    // Tombol virtual untuk mobile
    leftButton = this.add.text(50, 550, '⬅️', { fontSize: '32px' }).setInteractive();
    rightButton = this.add.text(150, 550, '➡️', { fontSize: '32px' }).setInteractive();
    fireButton = this.add.text(700, 550, '🔥', { fontSize: '32px' }).setInteractive();

    leftButton.on('pointerdown', () => player.setVelocityX(-300));
    rightButton.on('pointerdown', () => player.setVelocityX(300));
    leftButton.on('pointerup', () => player.setVelocityX(0));
    rightButton.on('pointerup', () => player.setVelocityX(0));
    fireButton.on('pointerdown', () => shootBullet());
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else if (!leftButton.input?.isDown && !rightButton.input?.isDown) {
        player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(shootKey)) {
        shootBullet();
    }
}

function shootBullet() {
    if (lives <= 0) return; // game over, jangan nembak lagi
    const bullet = bullets.create(player.x, player.y - 20, 'bullet');
    bullet.setVelocityY(-400);
}
