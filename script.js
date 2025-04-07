// Game state variables
let farmerPos = { x: 0, y: 0 };
let snakePos = { x: 0, y: 0 };
let roosterPos = { x: -100, y: -100 }; // Rooster position, initially off-screen
let isRoosterActive = false; // Is the rooster currently on the board?
let eggs = []; // Array to hold egg positions {x, y, type}
let chickens = []; // Array to hold chicken positions {x, y, eggCooldown, eggType}
let obstacles = []; // Array to hold obstacle positions {x, y, width, height}
let powerUps = []; // Array to hold power-up positions {x, y, type}
let weasels = []; // Array to hold weasel positions {x, y, isTrapped, targetChicken}
let bullets = []; // Array to hold bullets {x, y, dirX, dirY}
let isWeaselActive = false; // Is a weasel currently active?
let levelScore = 0; // Score within the current level (was 'score')
let eggsCollectedThisLevel = 0; // Number of eggs collected towards level goal
let snakeScore = 0;
let level = 1;
let eggsNeeded = 5; // Starting with fewer eggs needed (was 10)
let snakeLimit = 5; // Starting with a lower snake limit (was 10)
let boardWidth = 18 * 30; // Base pixel width (540px) - increased from 360px (12*30)
let boardHeight = 18 * 30; // Base pixel height (540px) - increased from 360px (12*30)
let maxBoardWidth = 24 * 30; // Max pixel width (720px) - increased from 480px (16*30)
let maxBoardHeight = 24 * 30; // Max pixel height (720px) - increased from 480px (16*30)
let numChickens = 2; // Start with fewer chickens (was 5)
let maxChickens = 8; // Maximum number of chickens
const cellSize = 30; // Base size for scaling, not for grid anymore

// Entity dimensions (approximate based on emoji/styling)
const entitySizes = {
    farmer: { width: cellSize * 0.9, height: cellSize * 0.9 },
    snake: { width: cellSize * 0.9, height: cellSize * 0.9 },
    rooster: { width: cellSize * 0.95, height: cellSize * 0.95 },
    chicken: { width: cellSize * 0.85, height: cellSize * 0.85 },
    egg: { width: cellSize * 0.7, height: cellSize * 0.7 },
    powerUp: { width: cellSize * 0.75, height: cellSize * 0.75 },
    obstacle: { width: cellSize * 0.9, height: cellSize * 0.9 },
    weasel: { width: cellSize * 0.85, height: cellSize * 0.85 },
    bullet: { width: cellSize * 0.4, height: cellSize * 0.4 }
};

let playerHasPowerUp = false;
let powerUpType = null;
let powerUpTimeLeft = 0;
let combo = 0; // Combo counter for consecutive egg collection
let lastEggCollectTime = 0;
let lives = 3; // Player lives
let totalScore = 0; // Total score across all levels

// Defined earlier now
// const eggLayTimeMin = 1000;
// const eggLayTimeMax = 3000;

let currentEggLayTimeMin = 1000; // Initialize with default value
let currentEggLayTimeMax = 3000; // Initialize with default value


// Egg types and their point values
const eggTypes = {
    normal: { value: 1, color: '#FFFFFF', chance: 70, emoji: '🥚' },
    golden: { value: 3, color: '#FFD700', chance: 20, emoji: '🥚' },
    special: { value: 5, color: '#FF69B4', chance: 10, emoji: '🥚' }
};

// Power-up types
const powerUpTypes = {
    speed: { duration: 5000, emoji: '⚡', color: '#FFFF00', chance: 30 },
    shield: { duration: 7000, emoji: '🛡️', color: '#3366FF', chance: 25 },
    magnet: { duration: 6000, emoji: '🧲', color: '#FF5555', chance: 25 },
    freeze: { duration: 4000, emoji: '❄️', color: '#00FFFF', chance: 20 }
};

// Intervals & Timers
let snakeLoopInterval = null;
let chickenLoopInterval = null;
let farmerMoveInterval = null; // New interval for continuous farmer movement
let powerUpInterval = null; // Interval for spawning power-ups
let powerUpTimerInterval = null; // Interval for power-up duration
let roosterSpawnInterval = null; // Interval for triggering rooster spawn
let roosterLoopInterval = null; // Interval for rooster movement
let roosterDespawnTimer = null; // Timer to remove rooster
let weaselSpawnInterval = null;
let weaselLoopInterval = null;
let chickensEatenByWeasel = 0;
let weaselChickenLimit = 3; // Lose a life after 3 chickens eaten by weasel
let bulletUpdateInterval = null; // Interval for updating bullets

const farmerSpeedPixelsPerSecond = 120; // Farmer speed in pixels/second
const snakeSpeedPixelsPerSecond = 80;   // Snake speed
const roosterSpeedPixelsPerSecond = 105; // Rooster speed - reduced from 150
const chickenSpeedPixelsPerSecond = 60; // Chicken speed
const weaselSpeedPixelsPerSecond = 95; // Slightly slower than farmer
const weaselSpawnDelayMs = 15000;    // Reduced from 25000 - Time between weasel spawns
const weaselActiveTimeMs = 20000;    // How long weasel stays on screen if not trapped

// Intervals (kept for fixed time steps)
const farmerMoveIntervalMs = 50; // Update farmer position every 50ms (20 FPS)
const enemyMoveIntervalMs = 75; // Update snake/rooster/chicken every 75ms (~13 FPS)
const powerUpSpawnIntervalMs = 10000; // Power-up spawn interval (10s)
const roosterSpawnDelayMs = 20000;    // Time between rooster spawns
const roosterActiveTimeMs = 15000;    // How long rooster stays on screen
const eggLayTimeMinMs = 1000;         // Min time between chicken laying eggs
const eggLayTimeMaxMs = 3000;         // Max time between chicken laying eggs
const comboTimeoutMs = 2000;          // Time window for combo in ms

// Key states for continuous movement
let keysPressed = {
    up: false,
    down: false,
    left: false,
    right: false
};

// DOM Elements
let gameBoard, eggsCollectedCountElement, neededElement, snakeScoreElement, snakeLimitElement, levelElement, messageElement, restartButton, totalScoreElement, livesElement;

// Additional DOM elements for game screens
let startScreen, levelScreen, endScreen;
let startButton, continueButton, playAgainButton;
let completedLevelSpan, nextLevelSpan, levelChallengeText;
let levelEggsCollectedSpan, levelScoreSpan;
let finalScoreSpan, finalLevelSpan, endTitleSpan, endMessageSpan;

// Function to verify all required DOM elements exist
function verifyDOMElements() {
    console.log("Verifying DOM elements...");
    const elements = {
        'game-board': element => gameBoard = element,
        'eggs-collected-count': element => eggsCollectedCountElement = element, // Updated ID
        'eggs-needed': element => neededElement = element,
        'snake-eggs': element => snakeScoreElement = element,
        'snake-limit': element => snakeLimitElement = element,
        'level': element => levelElement = element,
        'message': element => messageElement = element,
        'restart-button': element => restartButton = element,
        'total-score': element => totalScoreElement = element, // Add total score element
        'lives': element => livesElement = element, // Add lives element
        
        // Game screens
        'start-screen': element => startScreen = element,
        'level-screen': element => levelScreen = element,
        'end-screen': element => endScreen = element,
        
        // Screen buttons
        'start-button': element => startButton = element,
        'continue-button': element => continueButton = element,
        'play-again-button': element => playAgainButton = element,
        
        // Level screen elements
        'completed-level': element => completedLevelSpan = element,
        'next-level': element => nextLevelSpan = element,
        'level-challenge': element => levelChallengeText = element,
        'level-eggs-collected': element => levelEggsCollectedSpan = element,
        'level-score': element => levelScoreSpan = element,
        
        // End screen elements
        'final-score': element => finalScoreSpan = element,
        'final-level': element => finalLevelSpan = element,
        'end-title': element => endTitleSpan = element,
        'end-message': element => endMessageSpan = element
    };
    
    let missingElements = [];
    
    for (const [id, setter] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            setter(element);
            console.log(`Found element: #${id}`);
        } else {
            missingElements.push(id);
            console.error(`Missing element: #${id}`);
        }
    }
    
    if (missingElements.length > 0) {
        throw new Error(`Missing DOM elements: ${missingElements.join(', ')}`);
    }
    
    console.log("All DOM elements verified successfully");
    return true;
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Initializing game...");
    try {
        verifyDOMElements();
        setupSounds();
        
        // *** FIX: Set up event listeners here once ***
        document.removeEventListener('keydown', handleKeyDown); // Remove first to prevent duplicates
        document.removeEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        // Add mousedown handler for shooting (more responsive than click)
        gameBoard.removeEventListener('mousedown', shootBullet);
        gameBoard.addEventListener('mousedown', shootBullet, { passive: false });
        
        // Add mousemove listener to track mouse position
        gameBoard.removeEventListener('mousemove', trackMousePosition);
        gameBoard.addEventListener('mousemove', trackMousePosition, { passive: false });
        
        // Set up screen buttons
        startButton.addEventListener('click', startGame);
        continueButton.addEventListener('click', continueToNextLevel);
        playAgainButton.addEventListener('click', restartGame);
        restartButton.addEventListener('click', restartGame);
        
        // Initialize the game but don't start it yet
        initializeGame();
        
        // Show start screen
        showStartScreen();
        
        console.log("Game initialization completed successfully");
    } catch (error) {
        console.error("Error during game initialization:", error);
        // Create a visible error message
        const errorMsg = document.createElement('div');
        errorMsg.style.color = 'red';
        errorMsg.style.padding = '20px';
        errorMsg.style.backgroundColor = '#ffe6e6';
        errorMsg.style.border = '1px solid red';
        errorMsg.style.borderRadius = '5px';
        errorMsg.style.margin = '20px';
        errorMsg.innerHTML = `<strong>Error starting game:</strong><br>${error.message}`;
        
        // Try to append to game container or body if we can't find the message element
        const container = document.getElementById('game-container') || document.body;
        container.prepend(errorMsg);
    }
});

// Track mouse position for aiming
let mousePos = { x: 0, y: 0 };
function trackMousePosition(event) {
    // Prevent default browser behavior
    event.preventDefault();
    
    const rect = gameBoard.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;
}

// Shoot a bullet in the direction of the mouse click
function shootBullet(event) {
    console.log("mousedown detected - shooting"); // Debug log
    // Prevent default browser behavior
    event.preventDefault();
    
    const rect = gameBoard.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Calculate direction vector from farmer to click position
    const dx = clickX - farmerPos.x;
    const dy = clickY - farmerPos.y;
    
    // Normalize the direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) return; // Don't shoot if clicked on farmer
    
    const dirX = dx / magnitude;
    const dirY = dy / magnitude;
    
    // Create bullet slightly offset from farmer in the shooting direction
    const bulletOffsetDistance = entitySizes.farmer.width * 0.6;
    const bullet = {
        x: farmerPos.x + dirX * bulletOffsetDistance,
        y: farmerPos.y + dirY * bulletOffsetDistance,
        dirX: dirX,
        dirY: dirY,
        speed: 500, // Increased speed from 300 to 500
        age: 0 // how long the bullet has existed
    };
    
    bullets.push(bullet);
    
    // Play sound effect
    playSound('powerUp'); // Reusing existing sound
    
    // Show feedback
    showFloatingText("💥", farmerPos.x, farmerPos.y, "#FF9900");
}

// Update bullet positions and check for collisions
function updateBullets(deltaTime) {
    // Move bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.x += bullet.dirX * bullet.speed * (deltaTime / 1000);
        bullet.y += bullet.dirY * bullet.speed * (deltaTime / 1000);
        
        // Increase age
        bullet.age += deltaTime;
        
        // Remove bullet if it goes off-screen or is too old
        if (bullet.x < 0 || bullet.x > boardWidth || 
            bullet.y < 0 || bullet.y > boardHeight ||
            bullet.age > 1000) { // Reduced from 2 seconds to 1 second lifetime
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for hits against enemies
        const bulletRect = { ...bullet, ...entitySizes.bullet };
        
        // Check snake hit
        const snakeRect = { ...snakePos, ...entitySizes.snake };
        if (isOverlapping(bulletRect, snakeRect)) {
            // Hit the snake
            bullets.splice(i, 1);
            handleSnakeShot();
            continue;
        }
        
        // Check rooster hit
        if (isRoosterActive) {
            const roosterRect = { ...roosterPos, ...entitySizes.rooster };
            if (isOverlapping(bulletRect, roosterRect)) {
                // Hit the rooster
                bullets.splice(i, 1);
                handleRoosterShot();
                continue;
            }
        }
        
        // Check weasel hits
        for (let j = weasels.length - 1; j >= 0; j--) {
            const weasel = weasels[j];
            const weaselRect = { ...weasel, ...entitySizes.weasel };
            
            if (isOverlapping(bulletRect, weaselRect)) {
                // Hit a weasel
                bullets.splice(i, 1);
                handleWeaselShot(j);
                break;
            }
        }
    }
}

// Handle snake being shot
function handleSnakeShot() {
    // Show effect
    showFloatingText("Snake Shot! +10", snakePos.x, snakePos.y, "#FF0000", 24);
    
    // Award points
    levelScore += 10;
    totalScore += 10;
    totalScoreElement.textContent = totalScore;
    
    // Temporarily move snake off-screen
    snakePos.x = -100;
    snakePos.y = -100;
    
    // Respawn snake after delay
    setTimeout(() => {
        // Place snake in a random position
        const size = entitySizes.snake;
        let validPos = false;
        let attempts = 0;
        
        while (!validPos && attempts < 50) {
            attempts++;
            snakePos.x = size.width / 2 + Math.random() * (boardWidth - size.width);
            snakePos.y = size.height / 2 + Math.random() * (boardHeight - size.height);
            
            // Make sure snake doesn't spawn too close to farmer
            const distToFarmer = Math.hypot(snakePos.x - farmerPos.x, snakePos.y - farmerPos.y);
            validPos = distToFarmer > 5 * cellSize && isPositionValid(snakePos.x, snakePos.y, size, false);
        }
        
        if (!validPos) {
            // If can't find valid position, put snake in corner
            snakePos.x = boardWidth - size.width / 2 - 5;
            snakePos.y = boardHeight - size.height / 2 - 5;
        }
        
        // Make sure snake interval is running
        if (!snakeLoopInterval) {
            const currentSnakeSpeed = snakeSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
            snakeLoopInterval = setInterval(() => moveSnake(currentSnakeSpeed), enemyMoveIntervalMs);
        }
        
        // Show feedback
        showFloatingText("Snake respawned!", snakePos.x, snakePos.y, "#FFA500");
        
        drawGame();
    }, 1000); // 1 second delay
}

// Handle rooster being shot
function handleRoosterShot() {
    // Show effect
    showFloatingText("Rooster Shot! +15", roosterPos.x, roosterPos.y, "#FF0000", 24);
    
    // Award points
    levelScore += 15;
    totalScore += 15;
    totalScoreElement.textContent = totalScore;
    
    // Remove rooster
    despawnRooster();
}

// Handle weasel being shot
function handleWeaselShot(weaselIndex) {
    const weasel = weasels[weaselIndex];
    
    // Show effect
    showFloatingText("Weasel Shot! +20", weasel.x, weasel.y, "#FF0000", 24);
    
    // Award points
    levelScore += 20;
    totalScore += 20;
    totalScoreElement.textContent = totalScore;
    
    // Remove weasel
    weasels.splice(weaselIndex, 1);
    
    // If all weasels are gone, update status
    if (weasels.length === 0) {
        isWeaselActive = false;
    }
}

// Sound effects
let sounds = {};
function setupSounds() {
    console.log("Sounds are disabled");
    
    // Set up dummy sound functions that do nothing
    sounds = {
        eggCollect: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        powerUp: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        levelUp: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        snakeEat: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        gameOver: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        shoot: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        enemyHit: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        hit: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        collect: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        goldCollect: { play: () => {}, cloneNode: () => ({ play: () => {} }) },
        specialCollect: { play: () => {}, cloneNode: () => ({ play: () => {} }) }
    };
}

function playSound(soundName) {
    // Sound playing is disabled
    return;
}

function setupLevel() {
    console.log(`Setting up Level ${level}`);
    
    // Clear existing game loops
    if (snakeLoopInterval) clearInterval(snakeLoopInterval);
    if (chickenLoopInterval) clearInterval(chickenLoopInterval);
    if (farmerMoveInterval) clearInterval(farmerMoveInterval);
    if (powerUpInterval) clearInterval(powerUpInterval);
    if (powerUpTimerInterval) clearInterval(powerUpTimerInterval);
    if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval);
    if (roosterLoopInterval) clearInterval(roosterLoopInterval);
    if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
    if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
    if (weaselLoopInterval) clearInterval(weaselLoopInterval);
    if (bulletUpdateInterval) clearInterval(bulletUpdateInterval);

    // Reset all intervals to null
    snakeLoopInterval = null;
    chickenLoopInterval = null;
    farmerMoveInterval = null;
    powerUpInterval = null;
    powerUpTimerInterval = null;
    roosterSpawnInterval = null;
    roosterLoopInterval = null;
    roosterDespawnTimer = null;
    weaselSpawnInterval = null;
    weaselLoopInterval = null;
    bulletUpdateInterval = null;

    // Reset rooster and weasel states
    isRoosterActive = false;
    roosterPos = { x: -100, y: -100 }; // Off-screen
    isWeaselActive = false;
    weasels = []; // Clear weasels array
    bullets = []; // Clear bullets array
    
    // Reset key states
    keysPressed = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    // Reset power-up state
    playerHasPowerUp = false;
    powerUpType = null;
    powerUpTimeLeft = 0;
    
    // Reset combo
    combo = 0;
    lastEggCollectTime = 0;

    // Reset current level score and egg count
    levelScore = 0;
    eggsCollectedThisLevel = 0; // Reset egg count for the level
    snakeScore = 0;
    
    // Only reset lives and total score for a brand new game
    if (level === 1) {
        lives = 3;
        totalScore = 0;
        
        // Set initial board size on first level only - increased to 1.5x
        boardWidth = 18 * cellSize; // 540px - fixed size
        boardHeight = 18 * cellSize; // 540px - fixed size
    }

    // Clear previous game elements
    clearBoard();
    eggs = [];
    chickens = []; // Clear chickens for the new level
    obstacles = []; // Clear obstacles
    powerUps = []; // Clear power-ups
    messageElement.textContent = '';

    // REMOVED: No longer scaling board size with level
    // Instead, use a fixed size for all levels
    
    // Increase difficulty in other ways:
    // 1. More eggs needed with each level
    eggsNeeded = 5 + Math.floor((level - 1) * 1.5);
    
    // 2. Higher snake limit (more eggs snake can collect before losing)
    snakeLimit = 5 + Math.floor((level - 1) * 1.0);
    
    // 3. More chickens with higher levels (up to max)
    numChickens = Math.min(2 + Math.floor((level - 1) * 0.4), maxChickens); 

    // 4. More obstacles with higher levels
    const numObstacles = Math.min(Math.max(2, level), 10); // Limit to 10 max
    
    // 5. Faster enemies with higher levels
    const speedMultiplier = 1 + (level - 1) * 0.05;
    const currentSnakeSpeed = snakeSpeedPixelsPerSecond * speedMultiplier;
    const currentRoosterSpeed = roosterSpeedPixelsPerSecond * speedMultiplier;
    const currentChickenSpeed = chickenSpeedPixelsPerSecond * speedMultiplier;
    
    // 6. Faster egg laying
    const eggLayMinReduction = Math.min((level - 1) * 50, 400); 
    const eggLayMaxReduction = Math.min((level - 1) * 100, 1000); 
    currentEggLayTimeMin = Math.max(600, eggLayTimeMinMs - eggLayMinReduction);
    currentEggLayTimeMax = Math.max(1200, eggLayTimeMaxMs - eggLayMaxReduction);
    
    // 7. Faster power-up spawning in higher levels
    const powerUpSpawnTime = powerUpSpawnIntervalMs - Math.min((level - 1) * 500, 5000);
    
    // 8. Faster and more frequent rooster spawn in higher levels
    const roosterSpawnTime = Math.max(roosterSpawnDelayMs - (level - 1) * 1000, 10000);
 
    // Adjust weasel spawn frequency based on level - more frequent at higher levels
    const weaselSpawnTime = Math.max(weaselSpawnDelayMs - (level - 1) * 2000, 8000);

    // Update UI
    eggsCollectedCountElement.textContent = eggsCollectedThisLevel; // Update egg count display
    neededElement.textContent = eggsNeeded;
    snakeScoreElement.textContent = snakeScore;
    snakeLimitElement.textContent = snakeLimit;
    levelElement.textContent = level;
    totalScoreElement.textContent = totalScore;
    livesElement.textContent = lives;
    
    // Add total score display if it doesn't exist
    if (!document.getElementById('total-score')) {
        const totalScoreElement = document.createElement('p');
        totalScoreElement.innerHTML = '🏅 Total Score: <span id="total-score">0</span>';
        document.querySelector('#game-info div:first-child').appendChild(totalScoreElement);
    } else {
        document.getElementById('total-score').textContent = totalScore;
    }
    
    // Add lives display if it doesn't exist
    if (!document.getElementById('lives')) {
        const livesElement = document.createElement('p');
        livesElement.innerHTML = '❤️ Lives: <span id="lives">3</span>';
        document.querySelector('#game-info div:first-child').appendChild(livesElement);
    } else {
        document.getElementById('lives').textContent = lives;
    }

    // Create the game board (set pixel dimensions)
    createBoard(); 

    // Place Farmer (top-left corner, offset by half size)
    farmerPos = { 
        x: cellSize / 2 + 5, // Small padding 
        y: cellSize / 2 + 5 
    }; 

    // Place Snake (bottom-right corner, offset by half size)
    snakePos = { 
        x: boardWidth - cellSize / 2 - 5, 
        y: boardHeight - cellSize / 2 - 5 
    };
    
    // Place obstacles (Random pixel positions)
    placeObstacles(numObstacles);

    // Place initial chickens (Random pixel positions)
    placeChickens(numChickens);
    
    // Add a helper chicken (random pixel pos) only for early levels
    if (level <= 3) { 
        placeSingleChicken(1500); // Place one with 1.5s cooldown
    }

    // Draw initial game state
    drawGame();

    // Set up bullet update loop with timestamp tracking for deltaTime calculation
    let lastUpdateTime = Date.now();
    bulletUpdateInterval = setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastUpdateTime;
        lastUpdateTime = now;
        updateBullets(deltaTime);
    }, 16); // ~60fps update

    console.log("Starting game loops...");
    // Start loops using constants
    chickenLoopInterval = setInterval(updateChickens, enemyMoveIntervalMs);
    farmerMoveInterval = setInterval(updateFarmerMovement, farmerMoveIntervalMs);
    powerUpInterval = setInterval(spawnPowerUp, powerUpSpawnTime);
    roosterSpawnInterval = setTimeout(spawnRooster, roosterSpawnTime / 2);
    
    // Start weasel spawn timer
    console.log("Setting weasel spawn timer for " + weaselSpawnTime + "ms from now");
    weaselSpawnInterval = setTimeout(spawnWeasel, weaselSpawnTime);
    
    // Add welcome message about shooting
    messageElement.textContent = "Click to shoot at enemies! Protect your chickens!";
    setTimeout(() => {
        if (messageElement.textContent === "Click to shoot at enemies! Protect your chickens!") {
            messageElement.textContent = "";
        }
    }, 3000);
    
    // Snake starts when first egg is laid (in updateChickens)
    console.log("Game started! Snake will move when first egg appears.");
}

function createBoard() { // Renamed from createGrid
    console.log("Creating game board with size: ", boardWidth, boardHeight);
    
    // Set explicit pixel dimensions for the game board
    gameBoard.style.width = `${boardWidth}px`;
    gameBoard.style.height = `${boardHeight}px`;
    gameBoard.style.gridTemplateColumns = '';
    gameBoard.style.gridTemplateRows = '';
    gameBoard.style.backgroundImage = ''; // Optional: remove grid background image
    gameBoard.style.backgroundColor = '#e8f5e0'; // Keep light green bg
    gameBoard.style.border = '3px solid #3a7d44';
    gameBoard.style.position = 'relative'; // Ensure absolute positioning works
    gameBoard.style.overflow = 'hidden'; // Keep elements inside
    
    // Add styles to prevent text selection and other browser behaviors
    gameBoard.style.userSelect = 'none';
    gameBoard.style.webkitUserSelect = 'none';
    gameBoard.style.msUserSelect = 'none';
    gameBoard.style.MozUserSelect = 'none';
    gameBoard.style.cursor = 'crosshair'; // Use crosshair cursor for aiming
}

function clearBoard() {
    const elements = gameBoard.querySelectorAll('.farmer, .snake, .egg, .chicken, .obstacle, .power-up, .rooster, .weasel, .bullet');
    elements.forEach(el => el.remove());
}

function getRandomWaitTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Placement using Pixel Coordinates & Overlap Checks --- 

// Helper function for overlap check
function isOverlapping(item1, item2) {
    // Simple AABB (Axis-Aligned Bounding Box) overlap check
    // Assumes item has x, y (center) and width, height
    const item1Left = item1.x - item1.width / 2;
    const item1Right = item1.x + item1.width / 2;
    const item1Top = item1.y - item1.height / 2;
    const item1Bottom = item1.y + item1.height / 2;

    const item2Left = item2.x - item2.width / 2;
    const item2Right = item2.x + item2.width / 2;
    const item2Top = item2.y - item2.height / 2;
    const item2Bottom = item2.y + item2.height / 2;

    return item1Left < item2Right && item1Right > item2Left &&
           item1Top < item2Bottom && item1Bottom > item2Top;
}

// Helper function to check if a potential position is valid
function isPositionValid(x, y, size, checkEntities = true) {
    const newItem = { x, y, width: size.width, height: size.height };

    // 1. Check board boundaries (account for item size)
    if (x - size.width / 2 < 0 || x + size.width / 2 > boardWidth ||
        y - size.height / 2 < 0 || y + size.height / 2 > boardHeight) {
        return false;
    }

    // 2. Check overlap with obstacles
    if (obstacles.some(obs => isOverlapping(newItem, obs))) {
        return false;
    }

    // 3. Check overlap with other entities (optional, based on caller)
    if (checkEntities) {
        const farmerRect = { ...farmerPos, ...entitySizes.farmer };
        const snakeRect = { ...snakePos, ...entitySizes.snake };
        const roosterRect = isRoosterActive ? { ...roosterPos, ...entitySizes.rooster } : null;
        
        if (isOverlapping(newItem, farmerRect)) return false;
        if (isOverlapping(newItem, snakeRect)) return false;
        if (roosterRect && isOverlapping(newItem, roosterRect)) return false;
        if (chickens.some(ch => isOverlapping(newItem, { ...ch, ...entitySizes.chicken }))) return false;
        if (eggs.some(eg => isOverlapping(newItem, { ...eg, ...entitySizes.egg }))) return false;
        if (powerUps.some(pu => isOverlapping(newItem, { ...pu, ...entitySizes.powerUp }))) return false;
    }
    
    return true; // Position is valid
}

function placeObstacles(count) {
    console.log(`Placing ${count} obstacles.`);
    obstacles = []; // Clear previous
    let placed = 0;
    let attempts = 0;
    const maxAttempts = 200;

    while (placed < count && attempts < maxAttempts) {
        attempts++;
        const size = { width: cellSize * 0.9, height: cellSize * 0.9 };
        // Random position within board, considering size
        const x = size.width / 2 + Math.random() * (boardWidth - size.width);
        const y = size.height / 2 + Math.random() * (boardHeight - size.height);

        // Check if it overlaps farmer/snake start zones or other obstacles
        const farmerStartZone = { x: 50, y: 50, width: 100, height: 100 }; // Approx zone
        const snakeStartZone = { x: boardWidth - 50, y: boardHeight - 50, width: 100, height: 100 };
        const newItem = { x, y, width: size.width, height: size.height };

        if (!isOverlapping(newItem, farmerStartZone) && 
            !isOverlapping(newItem, snakeStartZone) &&
            isPositionValid(x, y, size, false)) { // Don't check other entities yet
            
            obstacles.push({ x, y, width: size.width, height: size.height });
            placed++;
        }
    }
    if (placed < count) console.warn(`Could only place ${placed}/${count} obstacles.`);
    console.log('Obstacles placed:', obstacles);
}

function placeChickens(count) {
    console.log(`Placing ${count} chickens.`);
    let placed = 0;
    let attempts = 0;
    const maxAttempts = 200; 
    
    while (placed < count && attempts < maxAttempts) {
        attempts++;
        const size = { width: cellSize * 0.85, height: cellSize * 0.85 };
        const x = size.width / 2 + Math.random() * (boardWidth - size.width);
        const y = size.height / 2 + Math.random() * (boardHeight - size.height);

        if (isPositionValid(x, y, size, true)) { 
            chickens.push({
                x,
                y,
                eggCooldown: getRandomWaitTime(currentEggLayTimeMin, currentEggLayTimeMax),
                eggType: 'normal'
            });
            placed++;
        }
    }
    if (placed < count) console.warn(`Could only place ${placed}/${count} chickens.`);
    console.log(`Placed ${count} chickens.`);
}

function placeSingleChicken(cooldown) {
    console.log(`Placing single helper chicken.`);
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    while (!placed && attempts < maxAttempts) {
        attempts++;
        const size = { width: cellSize * 0.85, height: cellSize * 0.85 };
        const x = size.width / 2 + Math.random() * (boardWidth - size.width);
        const y = size.height / 2 + Math.random() * (boardHeight - size.height);
        if (isPositionValid(x, y, size, true)) {
            chickens.push({ x, y, eggCooldown: cooldown, eggType: 'normal' });
            placed = true;
        }
    }
    if (!placed) console.warn("Could not place helper chicken.");
}

function drawGame() {
    clearBoard(); // Clear previous positions

    // Draw Obstacles (using their stored x, y, width, height)
    obstacles.forEach(obstacle => {
        const obstacleElement = document.createElement('div');
        obstacleElement.classList.add('obstacle');
        obstacleElement.style.position = 'absolute';
        // Position based on center x,y and dimensions
        obstacleElement.style.width = `${obstacle.width}px`;
        obstacleElement.style.height = `${obstacle.height}px`;
        obstacleElement.style.left = `${obstacle.x - obstacle.width / 2}px`;
        obstacleElement.style.top = `${obstacle.y - obstacle.height / 2}px`;
        obstacleElement.textContent = '🪨'; // Keep emoji for now
        obstacleElement.style.display = 'flex';
        obstacleElement.style.alignItems = 'center';
        obstacleElement.style.justifyContent = 'center';
        obstacleElement.style.fontSize = '1.4em'; // Adjust if needed
        gameBoard.appendChild(obstacleElement);
    });

    // Draw bullets
    bullets.forEach(bullet => {
        gameBoard.appendChild(createGameElement('bullet', bullet.x, bullet.y));
    });

    // Draw Power-ups, Eggs, Chickens, Snake, Farmer, Rooster, Weasels using createGameElement
    powerUps.forEach(p => gameBoard.appendChild(createGameElement('power-up', p.x, p.y, p.type)));
    eggs.forEach(e => gameBoard.appendChild(createGameElement('egg', e.x, e.y, e.type)));
    chickens.forEach(c => gameBoard.appendChild(createGameElement('chicken', c.x, c.y)));
    
    // Draw weasels
    weasels.forEach(w => gameBoard.appendChild(createGameElement('weasel', w.x, w.y)));
    
    gameBoard.appendChild(createGameElement('snake', snakePos.x, snakePos.y));
    gameBoard.appendChild(createGameElement('farmer', farmerPos.x, farmerPos.y));
    if (isRoosterActive) {
        gameBoard.appendChild(createGameElement('rooster', roosterPos.x, roosterPos.y));
    }
    
    updatePowerUpUI(); // Ensure power-up indicator is redrawn if needed
}

function createGameElement(className, x, y, type = null) {
    const element = document.createElement('div');
    element.classList.add(className);
    
    // Get size based on class name
    const size = entitySizes[className] || { width: cellSize - 2, height: cellSize - 2 }; 
    element.style.width = `${size.width}px`;
    element.style.height = `${size.height}px`;
    
    // Calculate top-left position to center the element at (x, y)
    element.style.left = `${x - size.width / 2}px`;
    element.style.top = `${y - size.height / 2}px`;
    
    // --- Apply specific styles/content --- 
    element.style.position = 'absolute'; // Essential
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.backgroundColor = 'transparent'; // Default

    // Set content (emoji) and specific styles
    switch(className) {
        case 'farmer':
            element.style.zIndex = '10';
            element.style.animation = 'bounce 0.5s infinite alternate';
            element.style.fontSize = '1.5em';
            if (playerHasPowerUp) element.classList.add(`power-${powerUpType}`);
            break;
        case 'snake':
            element.style.zIndex = '9';
            element.style.animation = 'slither 1s infinite alternate';
            element.style.fontSize = '1.5em';
            if (playerHasPowerUp && powerUpType === 'freeze') element.classList.add('frozen'); // Apply frozen class
            break;
        case 'chicken':
            element.style.zIndex = '9';
            element.style.animation = 'wobble 1.5s infinite alternate';
            element.style.fontSize = '1.4em';
            break;
        case 'rooster':
            element.style.zIndex = '9';
            element.style.animation = 'wobble 0.8s infinite alternate';
            element.style.fontSize = '1.6em';
            break;
        case 'weasel':
            element.style.zIndex = '9';
            element.style.animation = 'slither 0.7s infinite alternate';
            element.style.fontSize = '1.6em'; // Increased from 1.4em
            element.textContent = '🦡'; // Using badger emoji for weasel
            element.style.filter = 'drop-shadow(0 0 5px #FF5500)'; // Add glow effect
            break;
        case 'bullet':
            element.style.zIndex = '8';
            element.style.backgroundColor = '#FF5500';
            element.style.borderRadius = '50%';
            element.style.boxShadow = 'none'; // Remove glow effect
            element.style.width = '8px'; // Make bullets smaller and more precise
            element.style.height = '8px';
            break;
        case 'egg':
            element.style.zIndex = '8';
            element.style.animation = 'pulse 2s infinite';
            element.style.fontSize = '1.2em';
            if (type) {
                element.classList.add(`egg-${type}`);
            }
            break;
        case 'power-up':
            element.style.zIndex = '8';
            element.style.animation = 'pulse 1s infinite alternate';
            element.style.fontSize = '1.3em';
            element.style.filter = 'drop-shadow(0 0 5px currentColor)';
            if (type) {
                element.classList.add(`power-${type}`);
                element.dataset.type = type;
                element.style.color = powerUpTypes[type].color;
                element.textContent = powerUpTypes[type].emoji; // Direct emoji content
            }
            break;
    }
    
    return element;
}

function handleKeyDown(event) {
    // Update key states based on key pressed
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            keysPressed.up = true;
            event.preventDefault(); // Prevent scrolling
            break;
        case 'ArrowDown':
        case 's':
            keysPressed.down = true;
            event.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
            keysPressed.left = true;
            event.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
            keysPressed.right = true;
            event.preventDefault();
            break;
    }
}

function handleKeyUp(event) {
    // Update key states when keys are released
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            keysPressed.up = false;
            break;
        case 'ArrowDown':
        case 's':
            keysPressed.down = false;
            break;
        case 'ArrowLeft':
        case 'a':
            keysPressed.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keysPressed.right = false;
            break;
    }
}

// --- Movement --- 

// Calculate displacement based on speed and interval time
function getDisplacement(speedPerSecond, intervalMs) {
    return speedPerSecond * (intervalMs / 1000);
}

function updateFarmerMovement() {
    let dx = 0;
    let dy = 0;
    
    // Determine direction from keys
    if (keysPressed.right) dx = 1;
    if (keysPressed.left) dx = -1; 
    if (keysPressed.down) dy = 1;
    if (keysPressed.up) dy = -1;   
    
    // Normalize diagonal movement
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
        dx /= magnitude;
        dy /= magnitude;
    }

    // Calculate displacement
    const currentSpeed = (playerHasPowerUp && powerUpType === 'speed') 
                       ? farmerSpeedPixelsPerSecond * 1.5 
                       : farmerSpeedPixelsPerSecond;
    const displacement = getDisplacement(currentSpeed, farmerMoveIntervalMs);
    
    // Calculate new potential position
    const newX = farmerPos.x + dx * displacement;
    const newY = farmerPos.y + dy * displacement;
    
    // Check collisions and update position
    if (dx !== 0 || dy !== 0) {
        moveFarmer(newX, newY);
    }
}

function moveFarmer(targetX, targetY) {
    const size = entitySizes.farmer;
    let finalX = targetX;
    let finalY = targetY;

    // 1. Clamp to board boundaries
    finalX = Math.max(size.width / 2, Math.min(boardWidth - size.width / 2, finalX));
    finalY = Math.max(size.height / 2, Math.min(boardHeight - size.height / 2, finalY));

    // 2. Check collision with obstacles (Simple slide response)
    const potentialRect = { x: finalX, y: finalY, width: size.width, height: size.height };
    let collidedX = false;
    let collidedY = false;
    
    obstacles.forEach(obs => {
        if (isOverlapping(potentialRect, obs)) {
            // Try moving only horizontally first
            const potentialXRect = { x: finalX, y: farmerPos.y, width: size.width, height: size.height };
            if (!isOverlapping(potentialXRect, obs)) {
                finalY = farmerPos.y; // Allow X movement, block Y
                collidedY = true;
            } else {
                // Try moving only vertically
                const potentialYRect = { x: farmerPos.x, y: finalY, width: size.width, height: size.height };
                if (!isOverlapping(potentialYRect, obs)) {
                    finalX = farmerPos.x; // Allow Y movement, block X
                    collidedX = true;
                } else {
                    // Block both
                    finalX = farmerPos.x;
                    finalY = farmerPos.y;
                    collidedX = true;
                    collidedY = true;
                }
            }
        }
    });

    // Update position if changed
    if (finalX !== farmerPos.x || finalY !== farmerPos.y) {
        farmerPos.x = finalX;
        farmerPos.y = finalY;
        checkCollision(); // Check for item/enemy collisions at new spot
        drawGame();
    }
}

// Generic function to move an entity towards a target
function moveEntityTowards(entityPos, entitySize, targetPos, speedPerSecond, intervalMs, avoidObstacles = true, avoidEntities = []) {
    const dx = targetPos.x - entityPos.x;
    const dy = targetPos.y - entityPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 1) return; // Already at target

    const displacement = getDisplacement(speedPerSecond, intervalMs);
    
    // Calculate normalized direction
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // Calculate new potential position
    let targetX = entityPos.x + dirX * displacement;
    let targetY = entityPos.y + dirY * displacement;

    // Check if position would go beyond board boundaries and handle smoothly
    // Instead of just clamping, check if we're about to hit the edge
    const leftEdge = entitySize.width / 2;
    const rightEdge = boardWidth - entitySize.width / 2;
    const topEdge = entitySize.height / 2;
    const bottomEdge = boardHeight - entitySize.height / 2;
    
    // Handle X-axis boundary - prevent jumping
    if (targetX < leftEdge) {
        // If we would go past the left edge, stop at the edge
        targetX = leftEdge;
    } else if (targetX > rightEdge) {
        // If we would go past the right edge, stop at the edge
        targetX = rightEdge;
    }
    
    // Handle Y-axis boundary - prevent jumping
    if (targetY < topEdge) {
        // If we would go past the top edge, stop at the edge
        targetY = topEdge;
    } else if (targetY > bottomEdge) {
        // If we would go past the bottom edge, stop at the edge
        targetY = bottomEdge;
    }
    
    // Obstacle and Entity Avoidance (Simplified: Check target position)
    let finalX = targetX;
    let finalY = targetY;
    const potentialRect = { x: finalX, y: finalY, width: entitySize.width, height: entitySize.height };

    // Only proceed with the move if we wouldn't hit an obstacle
    if (avoidObstacles && obstacles.some(obs => isOverlapping(potentialRect, obs))) {
        // Simple stop - A better AI would navigate around
        finalX = entityPos.x;
        finalY = entityPos.y;
        console.log("Entity stopped by obstacle");
    }
    
    // Check against other entities to avoid
    avoidEntities.forEach(other => {
        const otherRect = { ...other.pos, ...other.size };
        if (isOverlapping(potentialRect, otherRect)) {
            // Simple stop
            finalX = entityPos.x;
            finalY = entityPos.y;
            console.log("Entity stopped by other entity");
        }
    });
    
    // Update position with limited movement per frame to prevent teleportation
    // Only allow movement up to the calculated displacement
    const actualDx = finalX - entityPos.x;
    const actualDy = finalY - entityPos.y;
    const actualDistance = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
    
    if (actualDistance > displacement) {
        // Scale movement to maximum allowed displacement
        entityPos.x += (actualDx / actualDistance) * displacement;
        entityPos.y += (actualDy / actualDistance) * displacement;
    } else {
        // Move the full amount if within allowed displacement
        entityPos.x = finalX;
        entityPos.y = finalY;
    }
}

// Random Movement for Entities
function moveEntityRandomly(entityPos, entitySize, speedPerSecond, intervalMs) {
    // Change direction occasionally
    if (!entityPos.dirX || Math.random() < 0.1) { // 10% chance to change direction
        const angle = Math.random() * 2 * Math.PI;
        entityPos.dirX = Math.cos(angle);
        entityPos.dirY = Math.sin(angle);
    }

    const displacement = getDisplacement(speedPerSecond, intervalMs);
    let targetX = entityPos.x + entityPos.dirX * displacement;
    let targetY = entityPos.y + entityPos.dirY * displacement;

    // Bounce off walls
    if (targetX - entitySize.width / 2 < 0 || targetX + entitySize.width / 2 > boardWidth) {
        entityPos.dirX *= -1;
        targetX = entityPos.x + entityPos.dirX * displacement; // Recalculate
    }
    if (targetY - entitySize.height / 2 < 0 || targetY + entitySize.height / 2 > boardHeight) {
        entityPos.dirY *= -1;
        targetY = entityPos.y + entityPos.dirY * displacement; // Recalculate
    }

    // Basic Obstacle Avoidance: If target hits obstacle, try reversing direction
    const potentialRect = { x: targetX, y: targetY, width: entitySize.width, height: entitySize.height };
    if (obstacles.some(obs => isOverlapping(potentialRect, obs))) {
        entityPos.dirX *= -1;
        entityPos.dirY *= -1;
        targetX = entityPos.x + entityPos.dirX * displacement;
        targetY = entityPos.y + entityPos.dirY * displacement;
        // Re-clamp after potential bounce
        targetX = Math.max(entitySize.width / 2, Math.min(boardWidth - entitySize.width / 2, targetX));
        targetY = Math.max(entitySize.height / 2, Math.min(boardHeight - entitySize.height / 2, targetY));
    }

    entityPos.x = targetX;
    entityPos.y = targetY;
}

function updateChickens() {
    const intervalMs = enemyMoveIntervalMs; // Use the correct interval
    const speed = chickenSpeedPixelsPerSecond; // Use defined speed
    let eggLaid = false;
    
    chickens.forEach((chicken, index) => {
        // Handle Egg Laying
        chicken.eggCooldown -= intervalMs;
        // console.log(`Chicken ${index} cooldown: ${chicken.eggCooldown}`);

        if (chicken.eggCooldown <= 0) {
            const eggSize = entitySizes.egg;
            
            // Create a special check that excludes the current chicken
            // We'll check all the same things as isPositionValid, but skip this chicken
            const eggPos = { x: chicken.x, y: chicken.y };
            const newEgg = { ...eggPos, ...eggSize };
            
            // Check board boundaries
            let eggPosValid = true;
            if (eggPos.x - eggSize.width / 2 < 0 || eggPos.x + eggSize.width / 2 > boardWidth ||
                eggPos.y - eggSize.height / 2 < 0 || eggPos.y + eggSize.height / 2 > boardHeight) {
                eggPosValid = false;
            }
            
            // Check obstacles
            if (obstacles.some(obs => isOverlapping(newEgg, obs))) {
                eggPosValid = false;
            }
            
            // Check other entities, EXCEPT the current chicken
            const farmerRect = { ...farmerPos, ...entitySizes.farmer };
            const snakeRect = { ...snakePos, ...entitySizes.snake };
            const roosterRect = isRoosterActive ? { ...roosterPos, ...entitySizes.rooster } : null;
            
            if (isOverlapping(newEgg, farmerRect)) eggPosValid = false;
            if (isOverlapping(newEgg, snakeRect)) eggPosValid = false;
            if (roosterRect && isOverlapping(newEgg, roosterRect)) eggPosValid = false;
            
            // Check OTHER chickens (not this one)
            if (chickens.some((ch, idx) => idx !== index && isOverlapping(newEgg, { ...ch, ...entitySizes.chicken }))) {
                eggPosValid = false;
            }
            
            // Check eggs and power-ups
            if (eggs.some(eg => isOverlapping(newEgg, { ...eg, ...entitySizes.egg }))) eggPosValid = false;
            if (powerUps.some(pu => isOverlapping(newEgg, { ...pu, ...entitySizes.powerUp }))) eggPosValid = false;
            
            // If valid, lay the egg
            if (eggPosValid) {
                let eggType = determineEggType();
                eggs.push({ x: chicken.x, y: chicken.y, type: eggType });
                console.log(`Chicken ${index} laid a ${eggType} egg at (${chicken.x.toFixed(1)}, ${chicken.y.toFixed(1)})!`);
                eggLaid = true;
            }
            
            // Reset timer regardless of successful lay
            chicken.eggCooldown = getRandomWaitTime(currentEggLayTimeMin, currentEggLayTimeMax);
        }

        // Handle Movement (randomly)
        moveEntityRandomly(chicken, entitySizes.chicken, speed, intervalMs);
    });

    // If an egg was laid and snake is not moving yet, start the snake
    if (eggLaid && !snakeLoopInterval && eggs.length > 0) {
        console.log("First egg laid! Starting snake movement.");
        const currentSnakeSpeed = snakeSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
        snakeLoopInterval = setInterval(() => moveSnake(currentSnakeSpeed), enemyMoveIntervalMs);
    }
    
    // Redraw needed after movement
    drawGame(); 
}


function moveSnake(currentSnakeSpeed) {
    if (playerHasPowerUp && powerUpType === 'freeze') return; // Don't move if frozen
    
    const intervalMs = enemyMoveIntervalMs;
    const size = entitySizes.snake;
    let target = null;
    let chaseFarmer = false;

    // Decide target: egg or farmer
    if (eggs.length === 0) {
        const distToFarmer = Math.hypot(farmerPos.x - snakePos.x, farmerPos.y - snakePos.y);
        if (distToFarmer < 150) { // Chase if farmer is within 150 pixels
            target = farmerPos;
            chaseFarmer = true;
        }
    } else {
        if (Math.random() < 0.8) {
            // Find closest egg by pixel distance
            let closestEgg = null;
            let minDistance = Infinity;
            eggs.forEach(egg => {
                const distance = Math.hypot(egg.x - snakePos.x, egg.y - snakePos.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestEgg = egg;
                }
            });
            target = closestEgg;
        } else {
            target = farmerPos; // 20% chance to chase farmer
            chaseFarmer = true;
        }
    }

    // Move towards target or randomly
    if (target) {
        // Avoid hitting the farmer directly if chasing farmer (adds some challenge)
        // Also avoid other enemies
        const entitiesToAvoid = [];
        if (isRoosterActive) entitiesToAvoid.push({ pos: roosterPos, size: entitySizes.rooster });
        
        moveEntityTowards(snakePos, size, target, currentSnakeSpeed, intervalMs, true, entitiesToAvoid);
    } else {
        moveEntityRandomly(snakePos, size, currentSnakeSpeed, intervalMs);
    }
    
    checkCollision(); // Check collisions after moving
    // drawGame() is called by the interval loop or other updates
}

function updateRooster() {
    if (!isRoosterActive) return;
    moveRooster();
}

function moveRooster() {
    if (!isRoosterActive) return;
    
    const intervalMs = enemyMoveIntervalMs;
    const speed = roosterSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
    const size = entitySizes.rooster;
    
    // Add resting behavior - if no rest state exists, initialize it
    if (roosterPos.restTimer === undefined) {
        roosterPos.restTimer = 0;
        roosterPos.isResting = false;
    }
    
    // Handle resting state
    if (roosterPos.isResting) {
        roosterPos.restTimer -= intervalMs;
        if (roosterPos.restTimer <= 0) {
            roosterPos.isResting = false;
        } else {
            return; // Skip movement while resting
        }
    } else {
        // 5% chance to start resting on each movement frame (pause for 0.5-1.5 seconds)
        if (Math.random() < 0.05) {
            roosterPos.isResting = true;
            roosterPos.restTimer = 500 + Math.random() * 1000;
            return; // Skip this movement frame
        }
    }
    
    // Basic target is farmer position
    const target = {
        x: farmerPos.x,
        y: farmerPos.y
    };
    
    // Add some randomness to make it less precise (20% variation)
    if (Math.random() < 0.7) { // 70% of the time, add some randomness
        const randomOffset = 80; // pixels of offset
        target.x += (Math.random() * 2 - 1) * randomOffset;
        target.y += (Math.random() * 2 - 1) * randomOffset;
    }
    
    const entitiesToAvoid = [{ pos: snakePos, size: entitySizes.snake }];

    moveEntityTowards(roosterPos, size, target, speed, intervalMs, true, entitiesToAvoid);
    
    checkCollision(); 
    // drawGame is called by the main interval calling updateRooster
}

// --- End Movement ---

// --- Collision Detection --- 

function checkCollision() {
    const farmerRect = { ...farmerPos, ...entitySizes.farmer };

    // 1. Farmer vs Eggs
    for (let i = eggs.length - 1; i >= 0; i--) {
        const egg = eggs[i];
        const eggRect = { ...egg, ...entitySizes.egg };
        
        // Apply magnet effect (move egg towards farmer)
        if (playerHasPowerUp && powerUpType === 'magnet') {
            const dist = Math.hypot(egg.x - farmerPos.x, egg.y - farmerPos.y);
            const magnetRadius = 3 * cellSize; // Magnet range of ~3 original cells
            if (dist < magnetRadius && dist > 1) { // Check distance and avoid division by zero
                const moveDist = getDisplacement(100, farmerMoveIntervalMs); // Speed at which eggs move to farmer
                egg.x += (farmerPos.x - egg.x) / dist * moveDist;
                egg.y += (farmerPos.y - egg.y) / dist * moveDist;
                // Update rect for collision check this frame
                eggRect.x = egg.x;
                eggRect.y = egg.y;
            }
        }

        // Check overlap for collection
        if (isOverlapping(farmerRect, eggRect)) {
            const collectedEgg = eggs.splice(i, 1)[0]; // Remove egg and get its data
            eggsCollectedThisLevel++;

            const now = Date.now();
            combo = (now - lastEggCollectTime < comboTimeoutMs) ? combo + 1 : 1;
            lastEggCollectTime = now;
            
            const eggType = collectedEgg.type || 'normal';
            const points = eggTypes[eggType].value * combo;
            levelScore += points;
            totalScore += points;
            
            showFloatingText(`+${points}`, farmerRect.x, farmerRect.y - farmerRect.height/2, eggTypes[eggType].color);
            if (combo > 1) {
                showFloatingText(`Combo x${combo}!`, farmerRect.x, farmerRect.y - farmerRect.height/2 - 15, '#FF9900');
            }
            
            eggsCollectedCountElement.textContent = eggsCollectedThisLevel;
            totalScoreElement.textContent = totalScore;
            
            console.log(`Collected ${eggType} egg! +${points}. Level Eggs: ${eggsCollectedThisLevel}/${eggsNeeded}`);
            playSound('eggCollect');
            checkWinCondition(); // Check if level is complete
            // No need to break, farmer might overlap multiple eggs in one frame
        }
    }

    // 2. Farmer vs Power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        const puRect = { ...pu, ...entitySizes.powerUp };
        if (isOverlapping(farmerRect, puRect)) {
            const collectedPowerUp = powerUps.splice(i, 1)[0];
            applyPowerUp(collectedPowerUp.type);
            showFloatingText(`${powerUpTypes[collectedPowerUp.type].emoji}`, farmerRect.x, farmerRect.y, powerUpTypes[collectedPowerUp.type].color);
            break; // Only collect one power-up per frame
        }
    }

    // 3. Snake vs Eggs
    const snakeRect = { ...snakePos, ...entitySizes.snake };
    for (let i = eggs.length - 1; i >= 0; i--) {
        const egg = eggs[i];
        const eggRect = { ...egg, ...entitySizes.egg };
        if (isOverlapping(snakeRect, eggRect)) {
            eggs.splice(i, 1);
            snakeScore++;
            snakeScoreElement.textContent = snakeScore;
            console.log('Snake ate an egg!');
            playSound('snakeEat');
            checkLoseCondition(); // Check if snake limit reached
            break; // Only eat one egg per frame
        }
    }

    // 4. Farmer vs Snake
    if (isOverlapping(farmerRect, snakeRect)) {
        handleFarmerCaught('snake');
    }
    
    // 5. Farmer vs Rooster
    if (isRoosterActive) {
        const roosterRect = { ...roosterPos, ...entitySizes.rooster };
        if (isOverlapping(farmerRect, roosterRect)) {
            handleFarmerCaught('rooster');
        }
    }
    
    // 6. Weasel vs Chickens
    for (let i = weasels.length - 1; i >= 0; i--) {
        const weasel = weasels[i];
        const weaselRect = { ...weasel, ...entitySizes.weasel };
        
        // Check if weasel caught a chicken
        for (let j = chickens.length - 1; j >= 0; j--) {
            const chicken = chickens[j];
            const chickenRect = { ...chicken, ...entitySizes.chicken };
            
            if (isOverlapping(weaselRect, chickenRect)) {
                // Weasel eats chicken
                chickens.splice(j, 1);
                chickensEatenByWeasel++;
                console.log(`Weasel ate a chicken! ${chickensEatenByWeasel}/${weaselChickenLimit}`);
                showFloatingText("🦡 Chicken eaten!", weaselRect.x, weaselRect.y, "#FF4500");
                
                // Check if too many chickens eaten
                if (chickensEatenByWeasel >= weaselChickenLimit) {
                    handleTooManyChickensEaten();
                }
                
                // If no chickens left, game over
                if (chickens.length === 0) {
                    handleAllChickensEaten();
                }
                
                break; // Weasel can only eat one chicken at a time
            }
        }
    }
    
    // Entity vs Obstacle collision is handled within their movement functions
}

// Consolidated function for when farmer gets caught
function handleFarmerCaught(enemyType) {
    console.log(`Farmer caught by ${enemyType}!`);
    if (playerHasPowerUp && powerUpType === 'shield') {
        // Shield protects - lose the shield
        showFloatingText('Shield Activated!', farmerPos.x, farmerPos.y, powerUpTypes['shield'].color);
        removePowerUp();
        
        // Optionally push the enemy away slightly or despawn rooster
        if (enemyType === 'rooster') {
            despawnRooster(); // Rooster gets scared and flies away after shield hit
        }

    } else {
        // No shield - Lose a life
        lives--;
        livesElement.textContent = lives; // Update lives display
        
        if (lives <= 0) {
            let message = enemyType === 'snake' ? 'Game Over! The snake caught you!' : 'Game Over! The rooster got you!';
            endGame(message);
            playSound('gameOver');
        } else {
            // Reset positions but keep the game going
            const reason = enemyType === 'snake' ? 'You were caught by the snake!' : 'You were caught by the rooster!';
            resetPositions(reason);
            showFloatingText('Lost a life!', farmerPos.x, farmerPos.y, '#FF0000');
            // If caught by rooster, make it despawn
            if (enemyType === 'rooster') {
                despawnRooster(); 
            }
        }
    }
}

// Reset positions after losing a life - with reason message
function resetPositions(reason) {
    // Add debug log
    console.log("Life lost: " + reason);
    
    // Show life lost screen with reason
    showLifeLostScreen(reason);
}

// Function to show life lost screen
function showLifeLostScreen(reason) {
    // Stop all game loops temporarily
    const allIntervals = [snakeLoopInterval, chickenLoopInterval, farmerMoveInterval, 
                        powerUpInterval, powerUpTimerInterval, roosterLoopInterval, 
                        weaselLoopInterval, bulletUpdateInterval];
    const pausedIntervals = [];
    
    // Store which intervals were running
    allIntervals.forEach(interval => {
        if (interval) {
            clearInterval(interval);
            pausedIntervals.push(interval);
        }
    });
    
    // Store which timeouts were running
    const allTimeouts = [roosterSpawnInterval, roosterDespawnTimer, weaselSpawnInterval];
    const pausedTimeouts = [];
    allTimeouts.forEach(timeout => {
        if (timeout) {
            clearTimeout(timeout);
            pausedTimeouts.push(timeout);
        }
    });
    
    // Create life lost overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.fontFamily = 'Open Sans, sans-serif';
    
    const lifeText = document.createElement('h2');
    lifeText.textContent = 'Life Lost!';
    lifeText.style.color = 'white';
    lifeText.style.textShadow = '2px 2px 4px #000';
    lifeText.style.marginBottom = '10px';
    
    const reasonText = document.createElement('p');
    reasonText.textContent = reason;
    reasonText.style.color = 'white';
    reasonText.style.textShadow = '1px 1px 2px #000';
    reasonText.style.marginBottom = '20px';
    reasonText.style.fontSize = '20px';
    
    const livesText = document.createElement('p');
    livesText.textContent = `Lives remaining: ${lives}`;
    livesText.style.color = 'white';
    livesText.style.textShadow = '1px 1px 2px #000';
    livesText.style.marginBottom = '30px';
    
    const continueButton = document.createElement('button');
    continueButton.textContent = 'Continue';
    continueButton.style.padding = '10px 20px';
    continueButton.style.fontSize = '16px';
    continueButton.style.backgroundColor = '#3a7d44';
    continueButton.style.color = 'white';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '5px';
    continueButton.style.cursor = 'pointer';
    
    overlay.appendChild(lifeText);
    overlay.appendChild(reasonText);
    overlay.appendChild(livesText);
    overlay.appendChild(continueButton);
    
    gameBoard.appendChild(overlay);
    
    // Continue button restarts the level
    continueButton.addEventListener('click', () => {
        // Remove overlay
        overlay.remove();
        
        // Restart current level from beginning
        restartLevel();
    });
    
    // Play sound
    playSound('gameOver');
}

// Function to restart current level
function restartLevel() {
    console.log("Restarting level " + level);
    
    // Clear existing game elements
    clearBoard();
    eggs = [];
    chickens = []; 
    obstacles = [];
    powerUps = [];
    weasels = [];
    bullets = [];
    
    // Reset level state but keep lives and score
    eggsCollectedThisLevel = 0;
    snakeScore = 0;
    levelScore = 0;
    
    // Stop all existing loops & timers
    if (snakeLoopInterval) clearInterval(snakeLoopInterval);
    if (chickenLoopInterval) clearInterval(chickenLoopInterval);
    if (farmerMoveInterval) clearInterval(farmerMoveInterval);
    if (powerUpInterval) clearInterval(powerUpInterval);
    if (powerUpTimerInterval) clearInterval(powerUpTimerInterval);
    if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval); 
    if (roosterLoopInterval) clearInterval(roosterLoopInterval);
    if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
    if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
    if (weaselLoopInterval) clearInterval(weaselLoopInterval);
    if (bulletUpdateInterval) clearInterval(bulletUpdateInterval);
    
    // Reset all intervals to null
    snakeLoopInterval = null;
    chickenLoopInterval = null;
    farmerMoveInterval = null;
    powerUpInterval = null;
    powerUpTimerInterval = null;
    roosterSpawnInterval = null;
    roosterLoopInterval = null;
    roosterDespawnTimer = null;
    weaselSpawnInterval = null;
    weaselLoopInterval = null;
    bulletUpdateInterval = null;
    
    // Setup level again
    setupLevel();
    
    // Display restart message
    messageElement.textContent = "Level restarted!";
    setTimeout(() => {
        if (messageElement.textContent === "Level restarted!") {
            messageElement.textContent = "";
        }
    }, 2000);
}

// Create floating text effect
function showFloatingText(text, x, y, color = '#FFFFFF', fontSize = 24) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.position = 'absolute';
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    floatingText.style.color = color;
    floatingText.style.fontWeight = 'bold';
    floatingText.style.textShadow = '1px 1px 2px #000';
    floatingText.style.pointerEvents = 'none';
    floatingText.style.fontSize = `${fontSize}px`;
    floatingText.style.zIndex = '100';
    floatingText.style.transition = 'transform 1s, opacity 1s';
    floatingText.style.opacity = '1';
    
    gameBoard.appendChild(floatingText);
    
    // Float upward and fade out
    setTimeout(() => {
        floatingText.style.transform = 'translateY(-30px)';
        floatingText.style.opacity = '0';
    }, 10);
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (floatingText.parentNode) {
            floatingText.parentNode.removeChild(floatingText);
        }
    }, 1010);
}

function checkWinCondition() {
    if (eggsCollectedThisLevel >= eggsNeeded) {
        console.log("Level complete!");
        
        // Stop all game loops before showing level screen
        if (snakeLoopInterval) clearInterval(snakeLoopInterval);
        if (chickenLoopInterval) clearInterval(chickenLoopInterval);
        if (farmerMoveInterval) clearInterval(farmerMoveInterval);
        if (powerUpInterval) clearInterval(powerUpInterval);
        if (powerUpTimerInterval) clearInterval(powerUpTimerInterval);
        if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval); 
        if (roosterLoopInterval) clearInterval(roosterLoopInterval);
        if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
        if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
        if (weaselLoopInterval) clearInterval(weaselLoopInterval);
        if (bulletUpdateInterval) clearInterval(bulletUpdateInterval);
        
        // Check if we've reached a maximum level (for victory screen)
        const maxLevel = 10; // Define a maximum level for winning the game
        
        if (level >= maxLevel) {
            // Player has completed all levels - show victory screen
            showEndScreen(true);
        } else {
            // Show level completion screen
            showLevelScreen();
        }
        
        playSound('levelUp');
    }
}

function checkLoseCondition() {
    if (snakeScore >= snakeLimit) {
        if (lives > 1) {
            // Lose a life instead of ending the game
            lives--;
            livesElement.textContent = lives; // Update lives display
            
            // Reset snake score
            snakeScore = 0;
            snakeScoreElement.textContent = snakeScore;
            
            messageElement.textContent = `Snake ate too many eggs! Lost a life! ${lives} remaining.`;
            setTimeout(() => {
                messageElement.textContent = '';
            }, 2000);
            
            resetPositions("The snake ate too many eggs!");
        } else {
            // No more lives, game over
            endGame('Game Over! The snake ate too many eggs!');
            playSound('gameOver');
        }
    }
}

function endGame(msg) {
    console.log("Game over: " + msg);
    
    // Stop all game loops
    if (snakeLoopInterval) clearInterval(snakeLoopInterval);
    if (chickenLoopInterval) clearInterval(chickenLoopInterval);
    if (farmerMoveInterval) clearInterval(farmerMoveInterval);
    if (powerUpInterval) clearInterval(powerUpInterval);
    if (powerUpTimerInterval) clearInterval(powerUpTimerInterval);
    if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval);
    if (roosterLoopInterval) clearInterval(roosterLoopInterval);
    if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
    if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
    if (weaselLoopInterval) clearInterval(weaselLoopInterval);
    if (bulletUpdateInterval) clearInterval(bulletUpdateInterval);
    
    // Show end screen with the actual reason
    showEndScreen(false, msg);
}

function showEndScreen(isVictory = false, gameOverMessage = null) {
    // Update end screen content
    if (isVictory) {
        endTitleSpan.textContent = "Victory!";
        endMessageSpan.textContent = "You've completed all levels and saved the farm!";
    } else {
        endTitleSpan.textContent = "Game Over!";
        if (gameOverMessage) {
            // Use the specific game over message if provided
            endMessageSpan.textContent = gameOverMessage;
        } else {
            // Fallback to default message
            endMessageSpan.textContent = "Game Over!";
        }
    }
    
    finalScoreSpan.textContent = totalScore;
    finalLevelSpan.textContent = level;
    
    // Show the screen
    hideAllScreens();
    endScreen.classList.remove('hidden');
}

// Determine egg type based on probabilities, with level influence
function determineEggType() {
    // Higher chance of special eggs in later levels
    const levelBonus = Math.min((level - 1) * 2, 20); // Up to 20% bonus for special eggs
    
    const adjustedEggTypes = {
        normal: { chance: Math.max(eggTypes.normal.chance - levelBonus, 40) }, // Min 40% chance
        golden: { chance: eggTypes.golden.chance },
        special: { chance: eggTypes.special.chance + levelBonus } // Higher chance in later levels
    };
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const [type, data] of Object.entries(adjustedEggTypes)) {
        cumulative += data.chance;
        if (roll < cumulative) {
            return type;
        }
    }
    
    return 'normal'; // Default fallback
}

// Function to spawn a specific power-up (used for trap before weasel appears)
function spawnSpecificPowerUp(powerUpType) {
    // Don't exceed max number of power-ups
    if (powerUps.length >= 3) return false;
    
    console.log(`Attempting to spawn ${powerUpType} power-up...`);
    let validPos = false;
    let attempts = 0;
    let x, y;
    const size = entitySizes.powerUp;

    while (!validPos && attempts < 50) {
        attempts++;
        x = size.width / 2 + Math.random() * (boardWidth - size.width);
        y = size.height / 2 + Math.random() * (boardHeight - size.height);
        validPos = isPositionValid(x, y, size, true);
    }

    if (validPos) {
        const newPowerUp = { x, y, type: powerUpType };
        powerUps.push(newPowerUp);
        console.log(`${powerUpType} power-up spawned at (${x.toFixed(1)}, ${y.toFixed(1)})!`);
        drawGame(); // Update display
        return true;
    } else {
        console.log(`Failed to find suitable location for ${powerUpType} power-up.`);
        return false;
    }
}

// Updated spawnPowerUp without trap prioritization
function spawnPowerUp() {
    // Don't exceed max number of power-ups
    if (powerUps.length >= 3) return;
    
    // Determine type based on probabilities
    let selectedType = null;
    const roll = Math.random() * 100;
    let cumulativeProbability = 0;
    
    // Normal probabilities
    for (const type in powerUpTypes) {
        cumulativeProbability += powerUpTypes[type].chance;
        if (roll < cumulativeProbability) {
            selectedType = type;
            break;
        }
    }
    
    if (!selectedType) selectedType = Object.keys(powerUpTypes)[0]; // Fallback to first type
    
    // Find a valid position for the power-up
    console.log(`Attempting to spawn ${selectedType} power-up...`);
    let validPos = false;
    let attempts = 0;
    let x, y;
    const size = entitySizes.powerUp;

    while (!validPos && attempts < 50) {
        attempts++;
        x = size.width / 2 + Math.random() * (boardWidth - size.width);
        y = size.height / 2 + Math.random() * (boardHeight - size.height);
        validPos = isPositionValid(x, y, size, true);
    }

    if (validPos) {
        const newPowerUp = { x, y, type: selectedType };
        powerUps.push(newPowerUp);
        console.log(`${selectedType} power-up spawned at (${x.toFixed(1)}, ${y.toFixed(1)})!`);
        drawGame(); // Update display
    } else {
        console.log(`Failed to find suitable location for ${selectedType} power-up.`);
    }
}

// Apply power-up effect (removed trap case)
function applyPowerUp(type) {
    playerHasPowerUp = true;
    powerUpType = type;
    powerUpTimeLeft = powerUpTypes[type].duration;
    
    if (powerUpTimerInterval) clearInterval(powerUpTimerInterval);
    
    // Apply power-up effect
    switch (type) {
        case 'speed':
            console.log("Speed power-up activated!");
            break;
        case 'freeze':
            if (snakeLoopInterval) {
                 clearInterval(snakeLoopInterval);
                 snakeLoopInterval = null;
                 console.log("Snake frozen!");
                 const snakeEl = gameBoard.querySelector('.snake');
                 if(snakeEl) snakeEl.classList.add('frozen');
            }
            break;
        case 'shield':
            console.log("Shield activated!");
            break;
        case 'magnet':
            console.log("Magnet activated!");
            break;
    }
    
    updatePowerUpUI();
    
    // Start power-up timer
    powerUpTimerInterval = setInterval(() => {
        powerUpTimeLeft -= 100;
        updatePowerUpUI();
        if (powerUpTimeLeft <= 0) {
            removePowerUp();
        }
    }, 100);
    
    playSound('powerUp');
}

// Remove power-up effect (removed trap case)
function removePowerUp() {
    const wasSpeed = powerUpType === 'speed';
    const wasFreeze = powerUpType === 'freeze';

    playerHasPowerUp = false;
    powerUpType = null;
    powerUpTimeLeft = 0;
    
    if (powerUpTimerInterval) {
        clearInterval(powerUpTimerInterval);
        powerUpTimerInterval = null;
    }
    
    // Remove effects
    if (wasSpeed) {
        console.log("Speed power-up deactivated.");
    } 
    if (wasFreeze && !snakeLoopInterval) {
        console.log("Unfreezing snake.");
        const currentSnakeSpeed = snakeSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
        snakeLoopInterval = setInterval(() => moveSnake(currentSnakeSpeed), enemyMoveIntervalMs);
        const snakeEl = gameBoard.querySelector('.snake');
        if(snakeEl) snakeEl.classList.remove('frozen');
    }
    
    updatePowerUpUI();
}

// Update power-up UI
function updatePowerUpUI() {
    // Remove existing power-up indicator
    const existingIndicator = document.getElementById('power-up-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    // Add new indicator if there's an active power-up
    if (playerHasPowerUp) {
        const indicator = document.createElement('div');
        indicator.id = 'power-up-indicator';
        indicator.innerHTML = `${powerUpTypes[powerUpType].emoji} ${(powerUpTimeLeft / 1000).toFixed(1)}s`;
        indicator.style.position = 'absolute';
        indicator.style.top = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = powerUpTypes[powerUpType].color;
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '5px';
        indicator.style.fontWeight = 'bold';
        indicator.style.color = '#000';
        indicator.style.zIndex = '100';
        document.getElementById('game-container').appendChild(indicator);
    }
}

// New function to restart the game
function restartGame() {
    console.log("Restarting game...");
    
    // Reset level and scores
    level = 1;
    levelScore = 0;
    eggsCollectedThisLevel = 0;
    snakeScore = 0;
    totalScore = 0;
    lives = 3;
    chickensEatenByWeasel = 0; // Reset weasel counter
    
    // Reset board to fixed size - increased to 1.5x
    boardWidth = 18 * cellSize; // 540px
    boardHeight = 18 * cellSize; // 540px
    
    // Clear bullets
    bullets = [];
    
    // Stop all existing loops & timers
    if (snakeLoopInterval) clearInterval(snakeLoopInterval);
    if (chickenLoopInterval) clearInterval(chickenLoopInterval);
    if (farmerMoveInterval) clearInterval(farmerMoveInterval);
    if (powerUpInterval) clearInterval(powerUpInterval);
    if (powerUpTimerInterval) clearInterval(powerUpTimerInterval);
    if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval); 
    if (roosterLoopInterval) clearInterval(roosterLoopInterval);
    if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
    if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
    if (weaselLoopInterval) clearInterval(weaselLoopInterval);
    if (bulletUpdateInterval) clearInterval(bulletUpdateInterval);
    
    // Re-add event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Reset mousedown handlers
    gameBoard.removeEventListener('mousedown', shootBullet);
    gameBoard.addEventListener('mousedown', shootBullet, { passive: false });
    
    // Reset mouse tracking
    gameBoard.removeEventListener('mousemove', trackMousePosition);
    gameBoard.addEventListener('mousemove', trackMousePosition, { passive: false });
    
    // Hide all screens
    hideAllScreens();
    
    // Set up level 1
    setupLevel();
    
    // Display restart message
    messageElement.textContent = "Game restarted! Good luck!";
    setTimeout(() => {
        if (messageElement.textContent === "Game restarted! Good luck!") {
            messageElement.textContent = "";
        }
    }, 2000);
}

// --- Rooster Logic --- 

function spawnRooster() {
    if (isRoosterActive) return; 
    console.log("Attempting to spawn rooster...");

    let validPos = false;
    let attempts = 0;
    let x, y;
    const size = entitySizes.rooster; // Get rooster size

    while (!validPos && attempts < 50) {
        attempts++;
        // Generate position ensuring center is within bounds
        x = size.width / 2 + Math.random() * (boardWidth - size.width);
        y = size.height / 2 + Math.random() * (boardHeight - size.height);

        // Use isPositionValid to check for overlaps
        validPos = isPositionValid(x, y, size, true);
        
        // Also avoid spawning too close to the farmer initially
        if (validPos) {
            const distToFarmer = Math.hypot(x - farmerPos.x, y - farmerPos.y);
            if (distToFarmer < 4 * cellSize) { // Check distance if position is otherwise valid
                 validPos = false;
            }
        }
    }

    if (validPos) {
        roosterPos = { x, y };
        isRoosterActive = true;
        console.log(`Rooster spawned at (${x.toFixed(1)}, ${y.toFixed(1)})!`);
        messageElement.textContent = "Watch out! Angry Rooster! 🐓";
        
        if (roosterLoopInterval) clearInterval(roosterLoopInterval);
        const currentRoosterSpeed = roosterSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
        // The interval calls updateRooster, which calculates speed and calls moveRooster
        roosterLoopInterval = setInterval(updateRooster, enemyMoveIntervalMs); 
        
        if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
        roosterDespawnTimer = setTimeout(despawnRooster, roosterActiveTimeMs); 

        drawGame(); 
    } else {
        console.log("Failed to find suitable spawn location for rooster, trying again later.");
        if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval);
        roosterSpawnInterval = setTimeout(spawnRooster, 5000); 
    }
}

function despawnRooster() {
    if (!isRoosterActive) return;
    console.log("Rooster despawning...");
    isRoosterActive = false;
    if (roosterLoopInterval) clearInterval(roosterLoopInterval);
    if (roosterDespawnTimer) clearTimeout(roosterDespawnTimer);
    roosterLoopInterval = null;
    roosterDespawnTimer = null;
    roosterPos = { x: -100, y: -100 }; 
    messageElement.textContent = "Rooster flew away...";
    setTimeout(() => { if (messageElement.textContent === "Rooster flew away...") messageElement.textContent = ""; }, 2000);

    if (roosterSpawnInterval) clearTimeout(roosterSpawnInterval);
    roosterSpawnInterval = setTimeout(spawnRooster, roosterSpawnDelayMs); 

    drawGame(); 
}

function updateRooster() { 
    if (!isRoosterActive) return;
    const currentRoosterSpeed = roosterSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
    moveRooster(currentRoosterSpeed); 
}

function moveRooster(currentRoosterSpeed) { 
    if (!isRoosterActive) return;
    
    const intervalMs = enemyMoveIntervalMs;
    const size = entitySizes.rooster;
    
    // Add resting behavior - if no rest state exists, initialize it
    if (roosterPos.restTimer === undefined) {
        roosterPos.restTimer = 0;
        roosterPos.isResting = false;
    }
    
    // Handle resting state
    if (roosterPos.isResting) {
        roosterPos.restTimer -= intervalMs;
        if (roosterPos.restTimer <= 0) {
            roosterPos.isResting = false;
        } else {
            return; // Skip movement while resting
        }
    } else {
        // 5% chance to start resting on each movement frame (pause for 0.5-1.5 seconds)
        if (Math.random() < 0.05) {
            roosterPos.isResting = true;
            roosterPos.restTimer = 500 + Math.random() * 1000;
            return; // Skip this movement frame
        }
    }
    
    // Basic target is farmer position
    const target = {
        x: farmerPos.x,
        y: farmerPos.y
    };
    
    // Add some randomness to make it less precise (20% variation)
    if (Math.random() < 0.7) { // 70% of the time, add some randomness
        const randomOffset = 80; // pixels of offset
        target.x += (Math.random() * 2 - 1) * randomOffset;
        target.y += (Math.random() * 2 - 1) * randomOffset;
    }
    
    const entitiesToAvoid = [{ pos: snakePos, size: entitySizes.snake }];

    moveEntityTowards(roosterPos, size, target, currentRoosterSpeed, intervalMs, true, entitiesToAvoid);
    
    checkCollision(); 
    // drawGame is called by the main interval calling updateRooster
}

// Spawn a weasel on the board
function spawnWeasel() {
    // Don't spawn if there are already 2 active weasels
    if (weasels.length >= 2) {
        // Schedule next spawn
        if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
        weaselSpawnInterval = setTimeout(spawnWeasel, weaselSpawnDelayMs / 2);
        return;
    }
    
    console.log("Attempting to spawn weasel...");
    let validPos = false;
    let attempts = 0;
    let x, y;
    const size = entitySizes.weasel;

    while (!validPos && attempts < 50) {
        attempts++;
        x = size.width / 2 + Math.random() * (boardWidth - size.width);
        y = size.height / 2 + Math.random() * (boardHeight - size.height);

        validPos = isPositionValid(x, y, size, true);
        
        // Also avoid spawning too close to chickens initially
        if (validPos) {
            let tooClose = false;
            for (const chicken of chickens) {
                const distToChicken = Math.hypot(x - chicken.x, y - chicken.y);
                if (distToChicken < 5 * cellSize) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) validPos = false;
        }
    }

    if (validPos) {
        const newWeasel = { 
            x, 
            y, 
            targetChicken: null // Will be set during movement
        };
        weasels.push(newWeasel);
        isWeaselActive = true; // Set the flag that weasels are active
        console.log(`Weasel spawned at (${x.toFixed(1)}, ${y.toFixed(1)})!`);
        messageElement.textContent = "Watch out! Weasel on the prowl! 🦡 Click to shoot it!";
        setTimeout(() => {
            if (messageElement.textContent.includes("Watch out! Weasel on the prowl!")) {
                messageElement.textContent = "";
            }
        }, 3000);
        
        // Start weasel movement if not already started
        if (!weaselLoopInterval) {
            weaselLoopInterval = setInterval(updateWeasels, enemyMoveIntervalMs);
        }
        
        // Schedule next weasel spawn
        if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
        weaselSpawnInterval = setTimeout(spawnWeasel, weaselSpawnDelayMs);
        
        drawGame();
    } else {
        console.log("Failed to find suitable spawn location for weasel, trying again later.");
        if (weaselSpawnInterval) clearTimeout(weaselSpawnInterval);
        weaselSpawnInterval = setTimeout(spawnWeasel, 5000);
    }
}

// Update all weasels
function updateWeasels() {
    if (weasels.length === 0) return;
    
    for (const weasel of weasels) {
        moveWeasel(weasel);
    }
    
    // Check for collisions with chickens
    checkCollision();
    
    // Redraw
    drawGame();
}

// Move a weasel towards the nearest chicken
function moveWeasel(weasel) {
    const intervalMs = enemyMoveIntervalMs;
    const currentWeaselSpeed = weaselSpeedPixelsPerSecond * (1 + (level - 1) * 0.05);
    const size = entitySizes.weasel;
    
    // Add occasional pausing behavior (less frequent than rooster)
    if (weasel.restTimer === undefined) {
        weasel.restTimer = 0;
        weasel.isResting = false;
    }
    
    if (weasel.isResting) {
        weasel.restTimer -= intervalMs;
        if (weasel.restTimer <= 0) {
            weasel.isResting = false;
        } else {
            return; // Skip movement while resting
        }
    } else {
        // 3% chance to rest on each frame
        if (Math.random() < 0.03) {
            weasel.isResting = true;
            weasel.restTimer = 300 + Math.random() * 700; // Rest 0.3-1s
            return;
        }
    }
    
    // Find the nearest chicken
    let closestChicken = null;
    let minDistance = Infinity;
    
    for (const chicken of chickens) {
        const distance = Math.hypot(chicken.x - weasel.x, chicken.y - weasel.y);
        if (distance < minDistance) {
            minDistance = distance;
            closestChicken = chicken;
        }
    }
    
    // If no chickens left, move randomly
    if (!closestChicken) {
        moveEntityRandomly(weasel, size, currentWeaselSpeed * 0.5, intervalMs);
        return;
    }
    
    // Target the closest chicken with some randomness
    const target = {
        x: closestChicken.x,
        y: closestChicken.y
    };
    
    // Add some randomness (less than rooster) to make it less precise
    if (Math.random() < 0.3) {
        const randomOffset = 40; // pixels of offset (smaller than rooster)
        target.x += (Math.random() * 2 - 1) * randomOffset;
        target.y += (Math.random() * 2 - 1) * randomOffset;
    }
    
    // Avoid obstacles and other entities
    const entitiesToAvoid = [
        { pos: farmerPos, size: entitySizes.farmer }, // Avoid farmer
        { pos: snakePos, size: entitySizes.snake } // Avoid snake
    ];
    
    // Also avoid rooster if active
    if (isRoosterActive) {
        entitiesToAvoid.push({ pos: roosterPos, size: entitySizes.rooster });
    }
    
    moveEntityTowards(weasel, size, target, currentWeaselSpeed, intervalMs, true, entitiesToAvoid);
}

// Function to place a trap on click
function placeTrap(event) {
    // Get click position relative to game board
    const rect = gameBoard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if already has max traps (3)
    if (window.traps && window.traps.length >= 3) {
        showFloatingText("Max traps placed!", x, y, "#8B4513");
        return;
    }
    
    // Check if position is valid
    const trapSize = entitySizes.trap;
    if (isPositionValid(x, y, trapSize, true)) {
        // Create and add trap
        const trap = { x, y };
        if (!window.traps) window.traps = [];
        window.traps.push(trap);
        
        // Show feedback
        showFloatingText("Trap placed!", x, y, "#8B4513");
        
        // Redraw to show trap
        drawGame();
    } else {
        showFloatingText("Can't place trap here!", x, y, "#FF0000");
    }
}

// Handle losing too many chickens to weasels
function handleTooManyChickensEaten() {
    lives--;
    livesElement.textContent = lives;
    chickensEatenByWeasel = 0; // Reset counter
    
    // Clear weasels
    weasels = [];
    
    if (lives <= 0) {
        endGame('Game Over! Too many chickens eaten by weasels!');
        playSound('gameOver');
    } else {
        const reason = "Too many chickens were eaten by weasels!";
        resetPositions(reason);
        
        // Add a new chicken to help the player recover
        placeSingleChicken(1000);
    }
}

// Handle all chickens eaten (instant game over)
function handleAllChickensEaten() {
    if (lives > 1) {
        lives--;
        livesElement.textContent = lives;
        
        const reason = "All your chickens were eaten!";
        resetPositions(reason);
        
        // Add some chickens back for the player
        placeChickens(Math.max(2, numChickens - 1));
    } else {
        endGame('Game Over! All chickens have been eaten!');
        playSound('gameOver');
    }
}

// Function to initialize the game but not start it yet
function initializeGame() {
    // Reset level and scores
    level = 1;
    levelScore = 0;
    eggsCollectedThisLevel = 0;
    snakeScore = 0;
    totalScore = 0;
    lives = 3;
    
    // Initialize needed values
    eggsNeeded = 5 + Math.floor((level - 1) * 1.5);
    snakeLimit = 5 + Math.floor((level - 1) * 1.0);
    
    // Reset board to fixed size
    boardWidth = 18 * cellSize; // 540px
    boardHeight = 18 * cellSize; // 540px
    
    // Initialize the board
    createBoard();
    
    // Update UI
    eggsCollectedCountElement.textContent = eggsCollectedThisLevel; 
    neededElement.textContent = eggsNeeded;
    snakeScoreElement.textContent = snakeScore;
    snakeLimitElement.textContent = snakeLimit;
    levelElement.textContent = level;
    totalScoreElement.textContent = totalScore;
    livesElement.textContent = lives;
    
    console.log("Game initialized and ready to start");
}

// Function to start the game
function startGame() {
    console.log("Starting game...");
    
    // Hide start screen
    hideAllScreens();
    
    // Set up the first level
    setupLevel();
    
    console.log("Game started!");
}

// Screen utility functions
function showStartScreen() {
    hideAllScreens();
    startScreen.classList.remove('hidden');
}

function showLevelScreen() {
    // Update level transition screen content
    completedLevelSpan.textContent = level;
    nextLevelSpan.textContent = level + 1;
    levelEggsCollectedSpan.textContent = eggsCollectedThisLevel;
    levelScoreSpan.textContent = levelScore;
    
    // Set challenge text based on next level
    const nextLevel = level + 1;
    if (nextLevel <= 3) {
        levelChallengeText.textContent = "More chickens and obstacles to navigate!";
    } else if (nextLevel <= 5) {
        levelChallengeText.textContent = "Watch out for roosters and faster enemies!";
    } else if (nextLevel <= 7) {
        levelChallengeText.textContent = "Weasels will try to eat your chickens!";
    } else {
        levelChallengeText.textContent = "Ultimate challenge! Good luck, Farmer Skip!";
    }
    
    // Show the screen
    hideAllScreens();
    levelScreen.classList.remove('hidden');
}

function hideAllScreens() {
    startScreen.classList.add('hidden');
    levelScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
}

function continueToNextLevel() {
    hideAllScreens();
    level++; // Increment level before setting up
    setupLevel();
}