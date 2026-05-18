const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const loveMessage = document.getElementById("loveMessage");

const keys = {};

let gameStarted = false;
let gameOver = false;
let currentLevel = 1;
let heartsCollected = 0;

const player = {
  x: 50,
  y: 330,
  width: 35,
  height: 45,
  speed: 5,
  velocityY: 0,
  jumping: false,
  color: "#4b7bec"
};

const gravity = 0.7;
const groundY = 375;

let hearts = [];
let obstacles = [];
let goal = {};

const messages = {
  1: "Level 1: Vancouver is waiting for us 💖",
  2: "Level 2: Distance cannot stop us ✈️",
  3: "Level 3: Almost home, my love 🏡"
};

function setupLevel(level) {
  player.x = 50;
  player.y = 330;
  player.velocityY = 0;
  player.jumping = false;

  if (level === 1) {
    hearts = [
      { x: 200, y: 300, collected: false },
      { x: 420, y: 260, collected: false },
      { x: 650, y: 300, collected: false }
    ];

    obstacles = [
      { x: 320, y: 345, width: 35, height: 30, label: "stress" },
      { x: 560, y: 345, width: 35, height: 30, label: "bills" }
    ];

    goal = { x: 820, y: 315, width: 45, height: 60, label: "Nali" };
  }

  if (level === 2) {
    hearts = [
      { x: 180, y: 290, collected: false },
      { x: 370, y: 240, collected: false },
      { x: 580, y: 290, collected: false },
      { x: 720, y: 250, collected: false }
    ];

    obstacles = [
      { x: 260, y: 340, width: 45, height: 35, label: "distance" },
      { x: 480, y: 330, width: 55, height: 45, label: "papers" },
      { x: 680, y: 340, width: 45, height: 35, label: "wait" }
    ];

    goal = { x: 820, y: 315, width: 45, height: 60, label: "Nali" };
  }

  if (level === 3) {
    hearts = [
      { x: 160, y: 280, collected: false },
      { x: 320, y: 240, collected: false },
      { x: 500, y: 280, collected: false },
      { x: 690, y: 230, collected: false }
    ];

    obstacles = [
      { x: 250, y: 335, width: 50, height: 40, label: "fear" },
      { x: 430, y: 325, width: 60, height: 50, label: "distance" },
      { x: 620, y: 335, width: 50, height: 40, label: "delay" }
    ];

    goal = { x: 820, y: 300, width: 55, height: 75, label: "Future Home" };
  }
}

function drawBackground() {
  ctx.fillStyle = "#bdeaff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "22px Arial";
  ctx.fillText(messages[currentLevel], 25, 40);

  // Vancouver skyline
  ctx.fillStyle = "#7ec8e3";
  ctx.fillRect(80, 210, 50, 165);
  ctx.fillRect(150, 170, 70, 205);
  ctx.fillRect(250, 230, 60, 145);
  ctx.fillRect(340, 190, 80, 185);
  ctx.fillRect(460, 220, 60, 155);

  // mountains
  ctx.fillStyle = "#8fd3a8";
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.lineTo(150, 110);
  ctx.lineTo(300, 250);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(220, 250);
  ctx.lineTo(430, 90);
  ctx.lineTo(650, 250);
  ctx.fill();

  // ground
  ctx.fillStyle = "#91d18b";
  ctx.fillRect(0, groundY, canvas.width, 75);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText("M", player.x + 10, player.y + 28);
}

function drawHearts() {
  hearts.forEach(heart => {
    if (!heart.collected) {
      ctx.font = "28px Arial";
      ctx.fillText("💖", heart.x, heart.y);
    }
  });
}

function drawObstacles() {
  obstacles.forEach(ob => {
    ctx.fillStyle = "#8b3a62";
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText(ob.label, ob.x - 4, ob.y - 5);
  });
}

function drawGoal() {
  ctx.fillStyle = "#ff8fab";
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(goal.label, goal.x - 10, goal.y - 8);

  ctx.font = "24px Arial";
  ctx.fillText("💖", goal.x + 10, goal.y + 40);
}

function drawScore() {
  ctx.fillStyle = "#5c2b3a";
  ctx.font = "18px Arial";
  ctx.fillText(`Level: ${currentLevel}`, 720, 35);
  ctx.fillText(`Hearts: ${heartsCollected}`, 720, 60);
}

function updatePlayer() {
  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  player.velocityY += gravity;
  player.y += player.velocityY;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumping = false;
  }
}

function jump() {
  if (!player.jumping) {
    player.velocityY = -14;
    player.jumping = true;
  }
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function checkHeartCollection() {
  hearts.forEach(heart => {
    const heartBox = {
      x: heart.x,
      y: heart.y - 25,
      width: 25,
      height: 25
    };

    if (!heart.collected && isColliding(player, heartBox)) {
      heart.collected = true;
      heartsCollected++;
    }
  });
}

function checkObstacleCollision() {
  obstacles.forEach(ob => {
    if (isColliding(player, ob)) {
      restartLevel();
    }
  });
}

function checkGoal() {
  if (isColliding(player, goal)) {
    if (currentLevel < 3) {
      currentLevel++;
      setupLevel(currentLevel);
    } else {
      winGame();
    }
  }
}

function restartLevel() {
  setupLevel(currentLevel);
}

function winGame() {
  gameOver = true;

  loveMessage.style.display = "block";

  loveMessage.innerHTML = `
    <h2>You saved Nali 💖</h2>

    <p>
      Thank you for always being there for me and for loving me.
    </p>

    <h3>Forever yours, Nali 💕</h3>
  `;
}

function gameLoop() {
  if (!gameStarted) {
    drawBackground();

    ctx.fillStyle = "#5c2b3a";
    ctx.font = "28px Arial";
    ctx.fillText("Click Start Game to begin", 280, 220);

    requestAnimationFrame(gameLoop);
    return;
  }

  if (gameOver) return;

  drawBackground();
  updatePlayer();
  drawPlayer();
  drawHearts();
  drawObstacles();
  drawGoal();
  drawScore();

  checkHeartCollection();
  checkObstacleCollision();
  checkGoal();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  currentLevel = 1;
  heartsCollected = 0;

  loveMessage.style.display = "none";

  setupLevel(currentLevel);
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.code === "Space") {
    jump();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

document.getElementById("leftBtn").addEventListener("touchstart", () => {
  keys["ArrowLeft"] = true;
});

document.getElementById("leftBtn").addEventListener("touchend", () => {
  keys["ArrowLeft"] = false;
});

document.getElementById("rightBtn").addEventListener("touchstart", () => {
  keys["ArrowRight"] = true;
});

document.getElementById("rightBtn").addEventListener("touchend", () => {
  keys["ArrowRight"] = false;
});

document.getElementById("jumpBtn").addEventListener("touchstart", jump);

setupLevel(currentLevel);
gameLoop();
