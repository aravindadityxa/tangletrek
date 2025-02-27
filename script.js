const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timeDisplay');
const gameOverDisplay = document.getElementById('gameOver');
const homePage = document.getElementById('homePage');
const videoContainer = document.getElementById('videoContainer');
const introVideo = document.getElementById('introVideo');
const settingsButton = document.getElementById('settingsButton');
const settingsMenu = document.getElementById('settingsMenu');
const pauseButton = document.getElementById('pauseButton');
const addTimeButton = document.getElementById('addTimeButton');
const backButton = document.getElementById('backButton');
const confirmationModal = document.getElementById('confirmationModal');
const confirmBackButton = document.getElementById('confirmBackButton');
const cancelBackButton = document.getElementById('cancelBackButton');
const confettiContainer = document.getElementById('confettiContainer');
const staticModeButton = document.getElementById('staticModeButton');
const stepModeButton = document.getElementById('stepModeButton');
const continuousModeButton = document.getElementById('continuousModeButton');

// Constants
const WIDTH = 1500;
const HEIGHT = 700;
const BLOCK_SIZE = 40;
const DIRECTIONS = [
  [0, -1], [0, 1], [-1, 0], [1, 0]
];

// Game variables
let rows, cols, maze, playerPos, goalPos, mode, lastUpdateTime, startTime, gameTimer, timeLimit;
let gameWon = false;
let isPaused = false;
let wallMoveInterval;

function initializeGame() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  rows = Math.floor(HEIGHT / BLOCK_SIZE);
  cols = Math.floor(WIDTH / BLOCK_SIZE);
  maze = generateMaze(rows, cols);
  playerPos = [1, 1];
  goalPos = [cols - 2, rows - 2];
  gameWon = false;
  lastUpdateTime = Date.now();
  startTime = Date.now();
  gameOverDisplay.style.display = 'none';
  confettiContainer.innerHTML = '';
  confettiContainer.style.display = 'none';
  canvas.style.display = 'block';
  settingsButton.style.display = 'block';
  timerDisplay.parentElement.style.display = 'block';
  startTimer();

  // Clear any existing wall movement interval
  if (wallMoveInterval) {
    clearInterval(wallMoveInterval);
    wallMoveInterval = null;
  }

  // Start wall movement for Continuous Mode
  if (mode === 'continuous') {
    wallMoveInterval = setInterval(() => {
      if (!isPaused) {
        maze = moveWalls(maze, rows, cols, playerPos, goalPos);
      }
    }, 100); // Move walls every 100ms
  }
}

function generateMaze(rows, cols) {
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
  function carve(x, y) {
    maze[y][x] = 0;
    const dirs = [...DIRECTIONS];
    dirs.sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + 2 * dx;
      const ny = y + 2 * dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1) {
        maze[y + dy][x + dx] = 0;
        carve(nx, ny);
      }
    }
  }
  carve(1, 1);
  return maze;
}

function moveWalls(maze, rows, cols, playerPos, goalPos) {
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 2)) + 1;
    if (maze[y][x] === 1) {
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const newX = x + dx;
      const newY = y + dy;
      if (newX > 0 && newX < cols - 1 && newY > 0 && newY < rows - 1 &&
          !(newX === playerPos[0] && newY === playerPos[1]) &&
          !(newX === goalPos[0] && newY === goalPos[1]) &&
          maze[newY][newX] === 0) {
        maze[y][x] = 0;
        maze[newY][newX] = 1;
      }
    }
  }
  return maze;
}

function drawMaze() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = '#6a2fc1';
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
  ctx.fillStyle = '#f9dfb1';
  ctx.fillRect(goalPos[0] * BLOCK_SIZE, goalPos[1] * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(
    playerPos[0] * BLOCK_SIZE + BLOCK_SIZE / 2,
    playerPos[1] * BLOCK_SIZE + BLOCK_SIZE / 2,
    BLOCK_SIZE / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

function updateTimer() {
  if (isPaused) return;
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const remainingTime = timeLimit - elapsedTime;
  if (remainingTime <= 0) {
    gameOverDisplay.textContent = "Time's Up!";
    gameOverDisplay.style.display = 'block';
    gameWon = false;
    clearInterval(gameTimer);
    return;
  }
  timerDisplay.textContent = `${remainingTime}s`;
}

function startTimer() {
  gameTimer = setInterval(updateTimer, 1000);
}

function addTime() {
  timeLimit += 25;
  timerDisplay.textContent = `${timeLimit - Math.floor((Date.now() - startTime) / 1000)}s`;
}

function createConfetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = `${Math.random() * -10}vh`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confettiContainer.appendChild(confetti);
  }
}

function gameLoop() {
  if (isPaused) return;
  if (gameWon) {
    gameOverDisplay.style.display = 'block';
    confettiContainer.style.display = 'block';
    createConfetti();
    clearInterval(gameTimer);
    if (wallMoveInterval) clearInterval(wallMoveInterval);
    return;
  }

  drawMaze();
  updateTimer();

  if (playerPos[0] === goalPos[0] && playerPos[1] === goalPos[1]) {
    gameWon = true;
  }

  requestAnimationFrame(gameLoop);
}

// Event Listeners
introVideo.addEventListener('ended', () => {
  videoContainer.style.display = 'none';
  homePage.style.display = 'flex';
});

staticModeButton.addEventListener('click', () => {
  homePage.style.display = 'none';
  timeLimit = 30; // Static Maze: 30 seconds
  mode = 'static';
  initializeGame();
  gameLoop();
});

stepModeButton.addEventListener('click', () => {
  homePage.style.display = 'none';
  timeLimit = 100; // One-Step Maze: 100 seconds
  mode = 'step';
  initializeGame();
  gameLoop();
});

continuousModeButton.addEventListener('click', () => {
  homePage.style.display = 'none';
  timeLimit = 80; // Continuous Maze: 80 seconds
  mode = 'continuous';
  initializeGame();
  gameLoop();
});

settingsButton.addEventListener('click', () => {
  settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
});

pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
});

addTimeButton.addEventListener('click', addTime);

backButton.addEventListener('click', () => {
  confirmationModal.style.display = 'flex';
});

confirmBackButton.addEventListener('click', () => {
  confirmationModal.style.display = 'none';
  settingsMenu.style.display = 'none'; // Close settings menu
  clearInterval(gameTimer);
  if (wallMoveInterval) clearInterval(wallMoveInterval);
  homePage.style.display = 'flex';
  canvas.style.display = 'none';
  settingsButton.style.display = 'none';
  timerDisplay.parentElement.style.display = 'none';
  gameOverDisplay.style.display = 'none';
  confettiContainer.innerHTML = '';
  confettiContainer.style.display = 'none';
});

cancelBackButton.addEventListener('click', () => {
  confirmationModal.style.display = 'none';
});

window.addEventListener('keydown', (e) => {
  if (gameWon || isPaused) return;
  let dx = 0, dy = 0;
  if (e.key === 'ArrowLeft') dx = -1;
  else if (e.key === 'ArrowRight') dx = 1;
  else if (e.key === 'ArrowUp') dy = -1;
  else if (e.key === 'ArrowDown') dy = 1;
  const newX = playerPos[0] + dx;
  const newY = playerPos[1] + dy;
  if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && maze[newY][newX] === 0) {
    playerPos = [newX, newY];
    // Move walls after each step in Step Mode
    if (mode === 'step') {
      maze = moveWalls(maze, rows, cols, playerPos, goalPos);
    }
  }
});

// Initialize the game
initializeGame();