// Core game module with game state and initialization functions
import { verifyDOMElements } from './dom.js';
import { createBoard, clearBoard, placeObstacles, placeChickens } from './board.js';
import { startGameLoop, stopGameLoop } from './gameLoop.js';
import { resetPositions } from './entities.js';
import { showStartScreen } from './ui.js';

// Game state variables
const gameState = {
    farmerPos: { x: 0, y: 0 },
    snakePos: { x: 0, y: 0 },
    roosterPos: { x: -100, y: -100 },
    isRoosterActive: false,
    eggs: [], // Array to hold egg positions {x, y, type}
    chickens: [], // Array to hold chicken positions {x, y, eggCooldown, eggType}
    obstacles: [], // Array to hold obstacle positions {x, y, width, height}
    powerUps: [], // Array to hold power-up positions {x, y, type}
    weasels: [], // Array to hold weasel positions {x, y, isTrapped, targetChicken}
    bullets: [], // Array to hold bullets {x, y, dirX, dirY}
    isWeaselActive: false,
    levelScore: 0,
    eggsCollectedThisLevel: 0,
    snakeScore: 0,
    level: 1,
    eggsNeeded: 5,
    snakeLimit: 5,
    boardWidth: 18 * 30,
    boardHeight: 18 * 30,
    maxBoardWidth: 24 * 30,
    maxBoardHeight: 24 * 30,
    numChickens: 2,
    maxChickens: 8,
    cellSize: 30,
    playerHasPowerUp: false,
    powerUpType: null,
    powerUpTimeLeft: 0,
    combo: 0,
    lastEggCollectTime: 0,
    lives: 3,
    totalScore: 0,
    currentEggLayTimeMin: 1000,
    currentEggLayTimeMax: 3000,
    keysPressed: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    mousePos: { x: 0, y: 0 },
    chickensEatenByWeasel: 0,
    weaselChickenLimit: 3,
    domElements: {},
    gameActive: false
};

// Entity dimensions
const entitySizes = {
    farmer: { width: gameState.cellSize * 0.9, height: gameState.cellSize * 0.9 },
    snake: { width: gameState.cellSize * 0.9, height: gameState.cellSize * 0.9 },
    rooster: { width: gameState.cellSize * 0.95, height: gameState.cellSize * 0.95 },
    chicken: { width: gameState.cellSize * 0.85, height: gameState.cellSize * 0.85 },
    egg: { width: gameState.cellSize * 0.7, height: gameState.cellSize * 0.7 },
    powerUp: { width: gameState.cellSize * 0.75, height: gameState.cellSize * 0.75 },
    obstacle: { width: gameState.cellSize * 0.9, height: gameState.cellSize * 0.9 },
    weasel: { width: gameState.cellSize * 0.85, height: gameState.cellSize * 0.85 },
    bullet: { width: gameState.cellSize * 0.4, height: gameState.cellSize * 0.4 }
};

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

// Game speed constants
const speeds = {
    farmer: 120, // Farmer speed in pixels/second
    snake: 80,   // Snake speed
    rooster: 105, // Rooster speed
    chicken: 60, // Chicken speed
    weasel: 95, // Slightly slower than farmer
};

// Intervals and timers (in milliseconds)
const intervals = {
    farmerMove: 50, // Update farmer position every 50ms (20 FPS)
    enemyMove: 75, // Update snake/rooster/chicken every 75ms (~13 FPS)
    powerUpSpawn: 10000, // Power-up spawn interval (10s)
    roosterSpawn: 20000,    // Time between rooster spawns
    roosterActive: 15000,    // How long rooster stays on screen
    eggLayTimeMin: 1000,         // Min time between chicken laying eggs
    eggLayTimeMax: 3000,         // Max time between chicken laying eggs
    comboTimeout: 2000,          // Time window for combo in ms
    weaselSpawn: 15000,        // Time between weasel spawns
    weaselActive: 20000        // How long weasel stays on screen if not trapped
};

// Interval references
const gameIntervals = {
    snakeLoop: null,
    chickenLoop: null,
    farmerMove: null,
    powerUp: null,
    powerUpTimer: null,
    roosterSpawn: null,
    roosterLoop: null,
    roosterDespawn: null,
    weaselSpawn: null,
    weaselLoop: null,
    bulletUpdate: null,
    drawLoop: null
};

// Initialize the game
function initGame() {
    // Verify required DOM elements exist
    gameState.domElements = verifyDOMElements();
    
    // Set up initial game state
    initializeGame();
    
    // Show the start screen
    showStartScreen();
    
    // Return the game state and functions to the main module
    return {
        state: gameState,
        entities: {
            sizes: entitySizes,
            eggTypes,
            powerUpTypes
        },
        speeds,
        intervals,
        gameIntervals,
        startGame,
        setupLevel,
        restartGame
    };
}

// Initialize game state
function initializeGame() {
    // Reset the game state
    gameState.level = 1;
    gameState.eggsNeeded = 5;
    gameState.snakeLimit = 5;
    gameState.levelScore = 0;
    gameState.totalScore = 0;
    gameState.lives = 3;
    gameState.eggsCollectedThisLevel = 0;
    gameState.snakeScore = 0;
    gameState.combo = 0;
    gameState.powerUpType = null;
    gameState.playerHasPowerUp = false;
    gameState.powerUpTimeLeft = 0;
    gameState.numChickens = 2;
    gameState.boardWidth = 18 * gameState.cellSize;
    gameState.boardHeight = 18 * gameState.cellSize;
    gameState.gameActive = false;
    
    // Clear arrays
    gameState.eggs = [];
    gameState.chickens = [];
    gameState.obstacles = [];
    gameState.powerUps = [];
    gameState.weasels = [];
    gameState.bullets = [];
    
    // Reset board
    createBoard();
    
    // Update UI elements
    updateUI();
}

// Set up a level
function setupLevel() {
    console.log("====== SETTING UP LEVEL ======");
    console.log(`Setting up level ${gameState.level} with board size ${gameState.boardWidth}x${gameState.boardHeight}`);
    
    // Log current state before clearing
    console.log(`Current state: ${gameState.chickens.length} chickens, ${gameState.eggs.length} eggs, ${gameState.obstacles.length} obstacles`);
    
    // Clear the board first
    clearBoard();
    
    // Reset positions and state for the level
    resetPositions('newLevel');
    
    // Clear all eggs
    gameState.eggs = [];
    console.log("Cleared all eggs for new level");
    
    // Resize board based on level (will grow until max size)
    const maxLevelIncrease = 6; // Increase board size for 6 levels
    if (gameState.level <= maxLevelIncrease) {
        const newWidth = Math.min(gameState.maxBoardWidth, 18 * gameState.cellSize + (gameState.level - 1) * gameState.cellSize);
        const newHeight = Math.min(gameState.maxBoardHeight, 18 * gameState.cellSize + (gameState.level - 1) * gameState.cellSize);
        gameState.boardWidth = newWidth;
        gameState.boardHeight = newHeight;
        console.log(`Resized board to ${newWidth}x${newHeight}`);
    }
    
    // Create the board with the new size
    createBoard();
    
    // Calculate obstacles based on level
    const baseObstacles = 3;
    const obstaclesPerLevel = 2;
    const maxObstacles = 15;
    const numObstacles = Math.min(baseObstacles + (gameState.level - 1) * obstaclesPerLevel, maxObstacles);
    console.log(`Placing ${numObstacles} obstacles for level ${gameState.level}`);
    
    // Place obstacles
    placeObstacles(numObstacles);
    
    // Calculate chickens based on level
    const baseChickens = 2;
    const chickensPerLevel = 1;
    gameState.numChickens = Math.min(baseChickens + (gameState.level - 1) * chickensPerLevel, gameState.maxChickens);
    console.log(`Should place ${gameState.numChickens} chickens for level ${gameState.level}`);
    
    // Place chickens
    const placedChickens = placeChickens(gameState.numChickens);
    console.log(`Actually placed ${placedChickens} chickens`);
    
    // Check if chickens have been placed correctly
    if (gameState.chickens.length === 0) {
        console.error("CRITICAL ERROR: No chickens were placed! Trying emergency placement...");
        // Try emergency placement with simple values
        for (let i = 0; i < gameState.numChickens; i++) {
            const x = 100 + i * 50;
            const y = 100 + i * 50;
            
            gameState.chickens.push({
                x,
                y,
                element: createGameElement('chicken', x, y),
                eggCooldown: 2000,
                eggType: 'normal',
                dirX: Math.random() * 2 - 1,
                dirY: Math.random() * 2 - 1
            });
        }
        console.log(`Emergency placement added ${gameState.chickens.length} chickens`);
    }
    
    // Adjust eggs needed based on level
    const baseEggsNeeded = 5;
    const eggsPerLevel = 3;
    const maxEggsNeeded = 20;
    gameState.eggsNeeded = Math.min(baseEggsNeeded + (gameState.level - 1) * eggsPerLevel, maxEggsNeeded);
    
    // Adjust snake limit based on level
    const baseSnakeLimit = 5;
    const snakeLimitPerLevel = 2;
    const maxSnakeLimit = 15;
    gameState.snakeLimit = Math.min(baseSnakeLimit + (gameState.level - 1) * snakeLimitPerLevel, maxSnakeLimit);
    
    // Adjust egg laying time based on level (chickens lay eggs faster in higher levels)
    gameState.currentEggLayTimeMin = Math.max(intervals.eggLayTimeMin - (gameState.level - 1) * 100, 500);
    gameState.currentEggLayTimeMax = Math.max(intervals.eggLayTimeMax - (gameState.level - 1) * 200, 1500);
    
    // Ensure egg lay times are valid numbers
    if (typeof gameState.currentEggLayTimeMin !== 'number' || isNaN(gameState.currentEggLayTimeMin)) {
        gameState.currentEggLayTimeMin = 1000;
    }
    if (typeof gameState.currentEggLayTimeMax !== 'number' || isNaN(gameState.currentEggLayTimeMax)) {
        gameState.currentEggLayTimeMax = 3000;
    }
    
    console.log(`Egg laying times: min=${gameState.currentEggLayTimeMin}ms, max=${gameState.currentEggLayTimeMax}ms`);
    
    // Reset level values
    gameState.eggsCollectedThisLevel = 0;
    gameState.snakeScore = 0;
    gameState.levelScore = 0;
    
    // Reset power-up
    gameState.playerHasPowerUp = false;
    gameState.powerUpType = null;
    gameState.powerUpTimeLeft = 0;
    
    // Update UI
    updateUI();
    
    // Set game as active
    gameState.gameActive = true;
    console.log("Game active state set to:", gameState.gameActive);
    
    // Start the game loops
    startGameLoop();
}

// Start a new game
function startGame() {
    console.log("Starting new game");
    
    // Ensure any existing game loops are stopped
    stopGameLoop();
    
    // Initialize game state
    initializeGame();
    
    // Set up the first level
    setupLevel();
    
    // Log game state for debugging
    console.log("Game initialized with state:", {
        level: gameState.level,
        eggsNeeded: gameState.eggsNeeded,
        snakeLimit: gameState.snakeLimit,
        gameActive: gameState.gameActive
    });
}

// Restart the game
function restartGame() {
    console.log("Restarting game");
    
    // Stop all game intervals
    stopGameLoop();
    
    // Reset game state
    gameState.level = 1;
    gameState.eggsNeeded = 5;
    gameState.snakeLimit = 5;
    gameState.levelScore = 0;
    gameState.totalScore = 0;
    gameState.lives = 3;
    gameState.eggsCollectedThisLevel = 0;
    gameState.snakeScore = 0;
    gameState.combo = 0;
    gameState.powerUpType = null;
    gameState.playerHasPowerUp = false;
    gameState.powerUpTimeLeft = 0;
    gameState.numChickens = 2;
    gameState.boardWidth = 18 * gameState.cellSize;
    gameState.boardHeight = 18 * gameState.cellSize;
    
    // Clear all entity arrays
    gameState.eggs = [];
    gameState.chickens = [];
    gameState.obstacles = [];
    gameState.powerUps = [];
    gameState.weasels = [];
    gameState.bullets = [];
    gameState.isRoosterActive = false;
    gameState.isWeaselActive = false;
    
    // Create board with initial size
    createBoard();
    
    // Update UI with initial values
    updateUI();
    
    // Set up the first level
    setupLevel();
    
    console.log("Game restarted successfully");
}

// Update UI elements with current game state
function updateUI() {
    const { domElements } = gameState;
    
    // Update UI elements
    domElements.eggsCollectedCountElement.textContent = gameState.eggsCollectedThisLevel;
    domElements.neededElement.textContent = gameState.eggsNeeded;
    domElements.snakeScoreElement.textContent = gameState.snakeScore;
    domElements.snakeLimitElement.textContent = gameState.snakeLimit;
    domElements.levelElement.textContent = gameState.level;
    domElements.totalScoreElement.textContent = gameState.totalScore;
    domElements.livesElement.textContent = gameState.lives;
}

export { 
    initGame, 
    gameState, 
    entitySizes, 
    eggTypes, 
    powerUpTypes, 
    speeds, 
    intervals, 
    gameIntervals,
    updateUI,
    setupLevel
}; 