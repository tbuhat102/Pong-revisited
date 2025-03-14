const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 10;
const INITIAL_BALL_SPEED_X = 4;
const INITIAL_BALL_SPEED_Y = 4;

// Game state
let gameState = {
  playerPaddleY: (canvas.height - PADDLE_HEIGHT) / 2,
  aiPaddleY: (canvas.height - PADDLE_HEIGHT) / 2,
  ballX: canvas.width / 2,
  ballY: canvas.height / 2,
  ballSpeedX: INITIAL_BALL_SPEED_X,
  ballSpeedY: INITIAL_BALL_SPEED_Y,
  playerScore: 0,
  aiScore: 0,
  aiSpeed: 0.08,
  isPlaying: false
};

function updateAIPaddle() {
  const difficulty = document.getElementById("difficulty").value;
  const predictionError = {
    easy: () => Math.random() * 80 - 40,
    medium: () => Math.random() * 40 - 20,
    hard: () => Math.random() * 20 - 10
  }[difficulty]();

  if (gameState.ballSpeedX > 0) {
    const timeToReach = (canvas.width - gameState.ballX - PADDLE_WIDTH) / gameState.ballSpeedX;
    const predictedY = gameState.ballY + (gameState.ballSpeedY * timeToReach) + predictionError;
    const aiCenter = gameState.aiPaddleY + (PADDLE_HEIGHT / 2);
    const direction = predictedY - aiCenter;
    gameState.aiPaddleY += direction * gameState.aiSpeed;
  }

  gameState.aiPaddleY = Math.max(0, 
    Math.min(gameState.aiPaddleY, canvas.height - PADDLE_HEIGHT));
}

function resetBall() {
  gameState.ballX = canvas.width / 2;
  gameState.ballY = canvas.height / 2;
  gameState.ballSpeedX = INITIAL_BALL_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
  gameState.ballSpeedY = INITIAL_BALL_SPEED_Y * (Math.random() > 0.5 ? 1 : -1);
}

function updateBall() {
  gameState.ballX += gameState.ballSpeedX;
  gameState.ballY += gameState.ballSpeedY;

  // Wall collisions
  if (gameState.ballY + BALL_RADIUS > canvas.height || gameState.ballY - BALL_RADIUS < 0) {
    gameState.ballSpeedY = -gameState.ballSpeedY;
  }

  // Paddle collisions
  if (gameState.ballX - BALL_RADIUS < PADDLE_WIDTH &&
      gameState.ballY > gameState.playerPaddleY &&
      gameState.ballY < gameState.playerPaddleY + PADDLE_HEIGHT) {
    gameState.ballSpeedX = Math.abs(gameState.ballSpeedX);
  }

  if (gameState.ballX + BALL_RADIUS > canvas.width - PADDLE_WIDTH &&
      gameState.ballY > gameState.aiPaddleY &&
      gameState.ballY < gameState.aiPaddleY + PADDLE_HEIGHT) {
    gameState.ballSpeedX = -Math.abs(gameState.ballSpeedX);
  }

  // Scoring
  if (gameState.ballX - BALL_RADIUS < 0) {
    gameState.aiScore++;
    resetBall();
  }
  if (gameState.ballX + BALL_RADIUS > canvas.width) {
    gameState.playerScore++;
    resetBall();
  }
}

function drawEverything() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  ctx.fillStyle = "black";
  ctx.fillRect(0, gameState.playerPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(canvas.width - PADDLE_WIDTH, gameState.aiPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.beginPath();
  ctx.arc(gameState.ballX, gameState.ballY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();

  // Draw scores
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Player: " + gameState.playerScore, 20, 30);
  ctx.fillText("AI: " + gameState.aiScore, canvas.width - 100, 30);
}

function gameLoop() {
  if (!gameState.isPlaying) return;
  
  updateBall();
  updateAIPaddle();
  drawEverything();
  requestAnimationFrame(gameLoop);
}

function playGame() {
  gameState.isPlaying = true;
  gameState.playerScore = 0;
  gameState.aiScore = 0;
  resetBall();
  gameLoop();
}

// Mouse control
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  gameState.playerPaddleY = e.clientY - rect.top - PADDLE_HEIGHT/2;
  gameState.playerPaddleY = Math.max(0, 
    Math.min(gameState.playerPaddleY, canvas.height - PADDLE_HEIGHT));
});