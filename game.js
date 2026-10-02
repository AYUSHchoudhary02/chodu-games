/* =========================================================
   CHODU GAMES
   AYUSH & SUJAL
   SWORD BATTLE
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;
}

/* =========================================================
   GAME VARIABLES
========================================================= */

let gameRunning = false;
let gameOver = false;

let wave = 1;

let enemies = [];
let particles = [];

let shake = 0;

let joystickX = 0;
let joystickY = 0;

let lastTime = 0;

const keys = {};

/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "j") {
        attackAyush();
    }

    if (e.key.toLowerCase() === "k") {
        specialAttack();
    }
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

/* =========================================================
   HERO CLASS
========================================================= */

class Hero {

    constructor(name, x, y, color, secondColor) {

        this.name = name;

        this.x = x;
        this.y = y;

        this.color = color;
        this.secondColor = secondColor;

        this.maxHealth = 100;
        this.health = 100;

        this.speed = 3.8;

        this.radius = 24;

        this.angle = 0;

        this.attackCooldown = 0;

        this.attackTimer = 0;

        this.specialCooldown = 0;

        this.healCooldown = 0;

        this.alive = true;
    }

    update() {

        if (!this.alive) return;

        this.attackCooldown -= 1;
        this.attackTimer -= 1;
        this.specialCooldown -= 1;
        this.healCooldown -= 1;

        let dx = 0;
        let dy = 0;

        /* -----------------------------------------------
           AYUSH MOVEMENT
        ------------------------------------------------ */

        if (this.name === "AYUSH") {

            if (keys["w"] || keys["arrowup"]) dy -= 1;
            if (keys["s"] || keys["arrowdown"]) dy += 1;
            if (keys["a"] || keys["arrowleft"]) dx -= 1;
            if (keys["d"] || keys["arrowright"]) dx += 1;

            dx += joystickX;
            dy += joystickY;

        } else {

            /*
                SUJAL follows Ayush.
            */

            let distance = Math.hypot(
                ayush.x - this.x,
                ayush.y - this.y
            );

            if (distance > 120) {

                dx =
                    (ayush.x - this.x) /
                    Math.max(distance, 1);

                dy =
                    (ayush.y - this.y) /
                    Math.max(distance, 1);
            }
        }

        const magnitude = Math.hypot(dx, dy);

        if (magnitude > 0) {

            dx /= magnitude;
            dy /= magnitude;

            this.x += dx * this.speed;
            this.y += dy * this.speed;

            this.angle = Math.atan2(dy, dx);
        }

        /* -----------------------------------------------
           WORLD BOUNDARIES
        ------------------------------------------------ */

        this.x = Math.max(50, Math.min(W - 50, this.x));
        this.y = Math.max(110, Math.min(H - 70, this.y));

        /* -----------------------------------------------
           AUTO HEAL SYSTEM
        ------------------------------------------------ */

        if (this.healCooldown <= 0) {

            if (this.health < 40) {

                const other =
                    this.name === "AYUSH"
                        ? sujal
                        : ayush;

                if (
                    other.alive &&
                    other.health > 60
                ) {

                    healHero(this, other);

                    this.healCooldown = 300;
                }
            }
        }
    }

    draw() {

        if (!this.alive) return;

        ctx.save();

        ctx.translate(this.x, this.y);

        /* shadow */

        ctx.fillStyle = "rgba(0,0,0,0.4)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            25,
            27,
            9,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* glow */

        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;

        /* body */

        const gradient =
            ctx.createLinearGradient(
                -20,
                -20,
                20,
                30
            );

        gradient.addColorStop(
            0,
            this.color
        );

        gradient.addColorStop(
            1,
            this.secondColor
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        /* head */

        ctx.fillStyle = "#f1b48c";

        ctx.beginPath();

        ctx.arc(
            0,
            -28,
            12,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* helmet */

        ctx.fillStyle = "#182536";

        ctx.beginPath();

        ctx.arc(
            0,
            -31,
            13,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        /* eyes */

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(-6, -29, 4, 3);
        ctx.fillRect(2, -29, 4, 3);

        /* sword */

        ctx.save();

        ctx.rotate(this.angle + 0.4);

        ctx.fillStyle = "#d9f7ff";

        ctx.shadowBlur = 15;
        ctx.shadowColor = "#8ce7ff";

        ctx.fillRect(
            18,
            -4,
            48,
            7
        );

        /* sword tip */

        ctx.beginPath();

        ctx.moveTo(66, -4);
        ctx.lineTo(78, 0);
        ctx.lineTo(66, 3);

        ctx.fill();

        ctx.shadowBlur = 0;

        /* handle */

        ctx.fillStyle = "#6e422b";

        ctx.fillRect(
            5,
            -3,
            18,
            6
        );

        ctx.restore();

        /* attack effect */

        if (this.attackTimer > 0) {

            ctx.strokeStyle = "#d8f8ff";

            ctx.lineWidth = 6;

            ctx.shadowBlur = 20;

            ctx.shadowColor = "#6edfff";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                70,
                -1,
                0.7
            );

            ctx.stroke();
        }

        ctx.restore();

        /* name */

        ctx.font = "bold 12px Arial";

        ctx.textAlign = "center";

        ctx.fillStyle = this.color;

        ctx.fillText(
            this.name,
            this.x,
            this.y - 50
        );
    }
}

/* =========================================================
   ENEMY CLASS
========================================================= */

class Enemy {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.maxHealth = 50;

        this.health = 50;

        this.radius = 20;

        this.speed = 1.1 + Math.random() * 0.7;

        this.attackCooldown =
            30 + Math.random() * 60;

        this.attackTimer = 0;

        this.alive = true;

        this.hitFlash = 0;
    }

    update() {

        if (!this.alive) return;

        this.attackCooldown--;
        this.attackTimer--;
        this.hitFlash--;

        const target =
            chooseNearestHero();

        if (!target) return;

        const dx =
            target.x - this.x;

        const dy =
            target.y - this.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance > 55) {

            this.x +=
                dx / distance *
                this.speed;

            this.y +=
                dy / distance *
                this.speed;
        }

        if (
            distance <= 60 &&
            this.attackCooldown <= 0
        ) {

            damageHero(
                target,
                8
            );

            this.attackCooldown =
                90 + Math.random() * 50;

            this.attackTimer = 12;

            shake = 5;
        }
    }

    draw() {

        if (!this.alive) return;

        ctx.save();

        ctx.translate(this.x, this.y);

        /* shadow */

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            20,
            24,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* body */

        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#ff183f";

        ctx.fillStyle =
            this.hitFlash > 0
                ? "#ffffff"
                : "#8e1028";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        /* helmet */

        ctx.fillStyle = "#242a34";

        ctx.beginPath();

        ctx.arc(
            0,
            -17,
            13,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        /* eyes */

        ctx.fillStyle = "#ffcc00";

        ctx.fillRect(-7, -17, 5, 3);
        ctx.fillRect(2, -17, 5, 3);

        /* sword */

        ctx.save();

        ctx.rotate(0.4);

        ctx.fillStyle = "#d8dce2";

        ctx.fillRect(
            15,
            -3,
            38,
            6
        );

        ctx.fillStyle = "#5a3b2c";

        ctx.fillRect(
            3,
            -3,
            15,
            6
        );

        ctx.restore();

        /* enemy attack */

        if (this.attackTimer > 0) {

            ctx.strokeStyle =
                "#ff445c";

            ctx.lineWidth = 5;

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                55,
                -1,
                0.5
            );

            ctx.stroke();
        }

        ctx.restore();

        /* health */

        const barWidth = 40;

        ctx.fillStyle = "#25040a";

        ctx.fillRect(
            this.x - barWidth / 2,
            this.y - 35,
            barWidth,
            5
        );

        ctx.fillStyle = "#ff304e";

        ctx.fillRect(
            this.x - barWidth / 2,
            this.y - 35,
            barWidth *
            Math.max(
                0,
                this.health /
                this.maxHealth
            ),
            5
        );
    }
}

/* =========================================================
   CREATE HEROES
========================================================= */

const ayush =
    new Hero(
        "AYUSH",
        W * 0.38,
        H * 0.55,
        "#32aaff",
        "#0757c9"
    );

const sujal =
    new Hero(
        "SUJAL",
        W * 0.48,
        H * 0.55,
        "#ff4665",
        "#a9002c"
    );

/* =========================================================
   ENEMIES
========================================================= */

function spawnWave() {

    enemies = [];

    const number =
        3 + wave * 2;

    for (let i = 0; i < number; i++) {

        let side =
            Math.floor(
                Math.random() * 4
            );

        let x;
        let y;

        if (side === 0) {
            x = 30;
            y = 120 + Math.random() * (H - 180);
        }

        if (side === 1) {
            x = W - 30;
            y = 120 + Math.random() * (H - 180);
        }

        if (side === 2) {
            x = Math.random() * W;
            y = 130;
        }

        if (side === 3) {
            x = Math.random() * W;
            y = H - 60;
        }

        enemies.push(
            new Enemy(x, y)
        );
    }

    showMessage(
        "WAVE " + wave
    );
}

/* =========================================================
   ATTACK
========================================================= */

function attackAyush() {

    if (!gameRunning || !ayush.alive) return;

    if (ayush.attackCooldown > 0) return;

    ayush.attackCooldown = 35;
    ayush.attackTimer = 15;

    swordAttack(
        ayush,
        28,
        85
    );
}

function attackSujal() {

    if (!gameRunning || !sujal.alive) return;

    if (sujal.attackCooldown > 0) return;

    sujal.attackCooldown = 45;
    sujal.attackTimer = 15;

    swordAttack(
        sujal,
        25,
        80
    );
}

function swordAttack(
    hero,
    damage,
    range
) {

    for (const enemy of enemies) {

        if (!enemy.alive) continue;

        const distance =
            Math.hypot(
                hero.x - enemy.x,
                hero.y - enemy.y
            );

        if (distance <= range) {

            enemy.health -= damage;

            enemy.hitFlash = 8;

            createParticles(
                enemy.x,
                enemy.y,
                "#ffffff",
                12
            );

            shake = 4;

            if (enemy.health <= 0) {

                enemy.alive = false;

                createParticles(
                    enemy.x,
                    enemy.y,
                    "#ff304f",
                    25
                );
            }
        }
    }
}

/* =========================================================
   SPECIAL ATTACK
========================================================= */

function specialAttack() {

    if (!gameRunning) return;

    if (ayush.specialCooldown > 0) return;

    ayush.specialCooldown = 360;

    showMessage(
        "⚡ AYUSH SPECIAL ATTACK!"
    );

    createParticles(
        ayush.x,
        ayush.y,
        "#00d9ff",
        50
    );

    for (const enemy of enemies) {

        if (!enemy.alive) continue;

        const distance =
            Math.hypot(
                ayush.x - enemy.x,
                ayush.y - enemy.y
            );

        if (distance < 170) {

            enemy.health -= 50;

            enemy.hitFlash = 15;

            if (enemy.health <= 0) {

                enemy.alive = false;

                createParticles(
                    enemy.x,
                    enemy.y,
                    "#ffd400",
                    30
                );
            }
        }
    }

    shake = 15;
}

/* =========================================================
   DAMAGE
========================================================= */

function damageHero(
    hero,
    damage
) {

    if (!hero.alive) return;

    hero.health -= damage;

    createParticles(
        hero.x,
        hero.y,
        "#ff304f",
        8
    );

    if (hero.health <= 0) {

        hero.health = 0;

        hero.alive = false;

        createParticles(
            hero.x,
            hero.y,
            hero.color,
            40
        );

        checkGameOver();
    }
}

/* =========================================================
   HEALING
========================================================= */

function healHero(
    weakHero,
    helper
) {

    if (!weakHero.alive) return;

    const amount = 30;

    weakHero.health =
        Math.min(
            weakHero.maxHealth,
            weakHero.health + amount
        );

    showMessage(
        helper.name +
        " HEALED " +
        weakHero.name +
        " 💚"
    );

    /* healing particles */

    for (let i = 0; i < 25; i++) {

        particles.push({
            x: weakHero.x,
            y: weakHero.y,

            vx:
                (Math.random() - 0.5) *
                2,

            vy:
                -Math.random() *
                3,

            life: 50,

            color: "#45ff9a"
        });
    }
}

/* =========================================================
   FIND NEAREST HERO
========================================================= */

function chooseNearestHero() {

    const aliveHeroes =
        [ayush, sujal]
        .filter(hero => hero.alive);

    if (aliveHeroes.length === 0)
        return null;

    let nearest = aliveHeroes[0];

    let nearestDistance =
        Infinity;

    for (const hero of aliveHeroes) {

        const d =
            Math.hypot(
                hero.x - this.x,
                hero.y - this.y
            );

        if (d < nearestDistance) {

            nearestDistance = d;

            nearest = hero;
        }
    }

    return nearest;
}

/* =========================================================
   PARTICLES
========================================================= */

function createParticles(
    x,
    y,
    color,
    amount
) {

    for (let i = 0; i < amount; i++) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - 0.5) *
                7,

            vy:
                (Math.random() - 0.5) *
                7,

            life:
                25 + Math.random() * 30,

            color
        });
    }
}

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vy += 0.08;

        p.life--;

        if (p.life <= 0) {

            particles.splice(i, 1);
        }
    }
}

function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / 50
            );

        ctx.fillStyle = p.color;

        ctx.shadowBlur = 10;

        ctx.shadowColor = p.color;

        ctx.fillRect(
            p.x,
            p.y,
            4,
            4
        );
    }

    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
}

/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#071426"
    );

    gradient.addColorStop(
        0.55,
        "#162b35"
    );

    gradient.addColorStop(
        1,
        "#06090d"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* moon */

    ctx.shadowBlur = 50;

    ctx.shadowColor =
        "#8ddcff";

    ctx.fillStyle =
        "rgba(180,230,255,0.7)";

    ctx.beginPath();

    ctx.arc(
        W * 0.8,
        H * 0.18,
        50,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* ground */

    ctx.fillStyle =
        "rgba(10,20,23,0.65)";

    ctx.fillRect(
        0,
        H * 0.65,
        W,
        H * 0.35
    );

    /* ground lines */

    ctx.strokeStyle =
        "rgba(70,150,160,0.12)";

    ctx.lineWidth = 1;

    const grid = 50;

    for (
        let x = 0;
        x < W;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            H * 0.65
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();
    }

    for (
        let y = H * 0.65;
        y < H;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            W,
            y
        );

        ctx.stroke();
    }
}

/* =========================================================
   GAME UPDATE
========================================================= */

function update() {

    if (!gameRunning) return;

    ayush.update();

    sujal.update();

    for (const enemy of enemies) {

        enemy.update();
    }

    updateParticles();

    const aliveEnemies =
        enemies.filter(
            enemy => enemy.alive
        );

    if (
        aliveEnemies.length === 0
    ) {

        wave++;

        setTimeout(() => {

            if (gameRunning) {

                spawnWave();

            }

        }, 1200);
    }

    updateHUD();
}

/* =========================================================
   DRAW
========================================================= */

function draw() {

    drawBackground();

    ctx.save();

    if (shake > 0) {

        ctx.translate(
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake
        );

        shake *= 0.88;

        if (shake < 0.3)
            shake = 0;
    }

    /*
        Draw enemies behind heroes
    */

    for (const enemy of enemies) {

        enemy.draw();
    }

    ayush.draw();

    sujal.draw();

    drawParticles();

    ctx.restore();
}

/* =========================================================
   MAIN LOOP
========================================================= */

function gameLoop(time) {

    const delta =
        time - lastTime;

    lastTime = time;

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

requestAnimationFrame(
    gameLoop
);

/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    document.getElementById(
        "ayushHealth"
    ).style.width =
        ayush.health + "%";

    document.getElementById(
        "sujalHealth"
    ).style.width =
        sujal.health + "%";

    document.getElementById(
        "waveNumber"
    ).textContent =
        wave;
}

/* =========================================================
   MESSAGE
========================================================= */

let messageTimer = null;

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.textContent = text;

    message.style.opacity = "1";

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            message.style.opacity = "0";

        }, 1500);
}

/* =========================================================
   GAME OVER
========================================================= */

function checkGameOver() {

    if (
        !ayush.alive &&
        !sujal.alive
    ) {

        gameRunning = false;

        document.getElementById(
            "resultText"
        ).textContent =
            "Ayush and Sujal were defeated.";

        document.getElementById(
            "gameOverScreen"
        ).classList.remove(
            "hidden"
        );

        document.getElementById(
            "hud"
        ).classList.add(
            "hidden"
        );

        document.getElementById(
            "mobileControls"
        ).classList.add(
            "hidden"
        );
    }
}

/* =========================================================
   START GAME
========================================================= */

function startGame() {

    gameRunning = true;

    gameOver = false;

    wave = 1;

    ayush.x = W * 0.38;
    ayush.y = H * 0.55;

    sujal.x = W * 0.48;
    sujal.y = H * 0.55;

    ayush.health = 100;
    sujal.health = 100;

    ayush.alive = true;
    sujal.alive = true;

    document.getElementById(
        "introScreen"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "instructionScreen"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "gameOverScreen"
    ).classList.add(
        "hidden"
    );

    canvas.style.display = "block";

    document.getElementById(
        "hud"
    ).classList.remove(
        "hidden"
    );

    document.getElementById(
        "mobileControls"
    ).classList.remove(
        "hidden"
    );

    spawnWave();

    updateHUD();
}

/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("startBtn")
    .addEventListener(
        "click",
        startGame
    );

document
    .getElementById("instructionBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "introScreen"
                )
                .classList.add(
                    "hidden"
                );

            document
                .getElementById(
                    "instructionScreen"
                )
                .classList.remove(
                    "hidden"
                );
        }
    );

document
    .getElementById("backBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "instructionScreen"
                )
                .classList.add(
                    "hidden"
                );

            document
                .getElementById(
                    "introScreen"
                )
                .classList.remove(
                    "hidden"
                );
        }
    );

document
    .getElementById("restartBtn")
    .addEventListener(
        "click",
        startGame
    );

document
    .getElementById("menuBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "gameOverScreen"
                )
                .classList.add(
                    "hidden"
                );

            canvas.style.display =
                "none";

            document
                .getElementById(
                    "introScreen"
                )
                .classList.remove(
                    "hidden"
                );
        }
    );

/* =========================================================
   MOBILE ATTACK
========================================================= */

document
    .getElementById(
        "attackButton"
    )
    .addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            attackAyush();
        }
    );

document
    .getElementById(
        "specialButton"
    )
    .addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            specialAttack();
        }
    );

/* =========================================================
   SUJAL AUTO ATTACK
========================================================= */

setInterval(() => {

    if (
        gameRunning &&
        sujal.alive
    ) {

        attackSujal();
    }

}, 700);

/* =========================================================
   MOBILE JOYSTICK
========================================================= */

const joystick =
    document.getElementById(
        "joystick"
    );

const knob =
    document.getElementById(
        "joystickKnob"
    );

let joystickActive = false;

function moveJoystick(e) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let dx =
        e.clientX - centerX;

    let dy =
        e.clientY - centerY;

    const max =
        rect.width / 2 - 25;

    const distance =
        Math.hypot(dx, dy);

    if (distance > max) {

        dx =
            dx / distance * max;

        dy =
            dy / distance * max;
    }

    knob.style.transform =
        `translate(calc(-50% + ${dx}px),
        calc(-50% + ${dy}px))`;

    joystickX =
        dx / max;

    joystickY =
        dy / max;
}

joystick.addEventListener(
    "pointerdown",
    e => {

        joystickActive = true;

        joystick.setPointerCapture(
            e.pointerId
        );

        moveJoystick(e);
    }
);

joystick.addEventListener(
    "pointermove",
    e => {

        if (joystickActive) {

            moveJoystick(e);
        }
    }
);

joystick.addEventListener(
    "pointerup",
    resetJoystick
);

joystick.addEventListener(
    "pointercancel",
    resetJoystick
);

function resetJoystick() {

    joystickActive = false;

    joystickX = 0;
    joystickY = 0;

    knob.style.transform =
        "translate(-50%, -50%)";
}

/* =========================================================
   TOUCH PREVENTION
========================================================= */

document.addEventListener(
    "touchmove",
    e => {

        if (gameRunning) {

            e.preventDefault();
        }

    },
    {
        passive: false
    }
);
