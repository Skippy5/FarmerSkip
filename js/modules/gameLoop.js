// Game Loop module
// Handles game loops and intervals
import { gameState, gameIntervals, intervals, eggTypes } from './game.js';
import { updateFarmerMovement } from './entities.js';
import { moveSnake, moveRooster, spawnRooster, moveWeasels, spawnWeasel } from './enemies.js';
import { updateBullets } from './weapons.js';
import { updatePowerUpTimer, spawnPowerUp } from './powerups.js';
import { checkCollisions } from './collision.js';
import { drawGame } from './board.js';
import { updatePowerUpUI } from './ui.js';

// Start all game loops
function startGameLoop() {
    // Stop any existing loops first
    stopGameLoop();
    
    // Set up all intervals for the game
    setupIntervals();
    
    console.log("Game loops started");
}

// Set up all game intervals
function setupIntervals() {
    // Farmer movement update loop
    gameIntervals.farmerMove = setInterval(() => {
        updateFarmerMovement();
    }, intervals.farmerMove);
    
    // Snake movement update loop
    gameIntervals.snakeLoop = setInterval(() => {
        moveSnake();
    }, intervals.enemyMove);
    
    // Chicken movement update loop (implemented in original code)
    gameIntervals.chickenLoop = setInterval(() => {
        updateChickens();
    }, intervals.enemyMove);
    
    // Bullet update loop
    gameIntervals.bulletUpdate = setInterval(() => {
        updateBullets();
    }, intervals.farmerMove); // Use the farmer interval for smooth bullet movement
    
    // Draw update loop
    gameIntervals.drawLoop = setInterval(() => {
        drawGame();
        checkCollisions();
    }, intervals.farmerMove); // Draw at the same rate as farmer movement for smoothness
    
    // Power-up spawn interval
    gameIntervals.powerUp = setInterval(() => {
        spawnPowerUp();
    }, intervals.powerUpSpawn);
    
    // Power-up timer update interval
    gameIntervals.powerUpTimer = setInterval(() => {
        updatePowerUpTimer(100); // Update power-up timer every 100ms
        updatePowerUpUI();
    }, 100);
    
    // Rooster spawn interval
    gameIntervals.roosterSpawn = setInterval(() => {
        if (!gameState.isRoosterActive && gameState.level >= 3) { // Only spawn roosters at level 3+
            spawnRooster();
        }
    }, intervals.roosterSpawn);
    
    // Rooster movement loop
    gameIntervals.roosterLoop = setInterval(() => {
        if (gameState.isRoosterActive) {
            moveRooster();
        }
    }, intervals.enemyMove);
    
    // Weasel spawn interval
    gameIntervals.weaselSpawn = setInterval(() => {
        if (!gameState.isWeaselActive && gameState.level >= 4) { // Only spawn weasels at level 4+
            spawnWeasel();
        }
    }, intervals.weaselSpawn);
    
    // Weasel movement loop
    gameIntervals.weaselLoop = setInterval(() => {
        moveWeasels();
    }, intervals.enemyMove);
}

// Update chickens movement and egg laying
function updateChickens() {
    const { chickens, eggs, currentEggLayTimeMin, currentEggLayTimeMax } = gameState;
    
    // Loop through each chicken
    for (let i = 0; i < chickens.length; i++) {
        const chicken = chickens[i];
        
        // Move chicken randomly
        moveChickenRandomly(chicken);
        
        // Update egg cooldown
        chicken.eggCooldown -= intervals.enemyMove;
        
        // Lay egg if cooldown expired
        if (chicken.eggCooldown <= 0) {
            // Check if max eggs limit reached (prevent too many eggs)
            if (eggs.length < 20) { // Arbitrary limit to prevent too many eggs
                layEgg(chicken);
            }
            
            // Reset cooldown
            chicken.eggCooldown = getRandomEggLayTime(currentEggLayTimeMin, currentEggLayTimeMax);
            
            // Determine new egg type
            chicken.eggType = determineEggType();
        }
    }
}

// Move a chicken randomly
function moveChickenRandomly(chicken) {
    // Add dirX and dirY if not present
    if (chicken.dirX === undefined) {
        chicken.dirX = Math.random() * 2 - 1;
        chicken.dirY = Math.random() * 2 - 1;
        
        // Normalize
        const length = Math.sqrt(chicken.dirX * chicken.dirX + chicken.dirY * chicken.dirY);
        if (length > 0) {
            chicken.dirX /= length;
            chicken.dirY /= length;
        }
    }
    
    // Calculate displacement
    const displacement = getDisplacement(50, intervals.enemyMove); // Chicken speed is slower
    
    // Calculate new position
    let newX = chicken.x + chicken.dirX * displacement;
    let newY = chicken.y + chicken.dirY * displacement;
    
    // Check if the new position is valid
    const { boardWidth, boardHeight } = gameState;
    const validX = newX >= 0 && newX + 30 <= boardWidth;
    const validY = newY >= 0 && newY + 30 <= boardHeight;
    
    // Change direction randomly or when hitting boundary
    const changeDirectionChance = 0.02; // 2% chance each update
    
    if (!validX || !validY || Math.random() < changeDirectionChance) {
        chicken.dirX = Math.random() * 2 - 1;
        chicken.dirY = Math.random() * 2 - 1;
        
        // Normalize
        const length = Math.sqrt(chicken.dirX * chicken.dirX + chicken.dirY * chicken.dirY);
        if (length > 0) {
            chicken.dirX /= length;
            chicken.dirY /= length;
        }
        
        // Adjust position if out of bounds
        if (!validX) {
            newX = Math.max(0, Math.min(boardWidth - 30, newX));
        }
        if (!validY) {
            newY = Math.max(0, Math.min(boardHeight - 30, newY));
        }
    }
    
    // Update position
    chicken.x = newX;
    chicken.y = newY;
}

// Lay an egg at the chicken's position
function layEgg(chicken) {
    const { eggs } = gameState;
    
    // Create egg object
    const egg = {
        x: chicken.x,
        y: chicken.y,
        type: chicken.eggType
    };
    
    // Add egg to array
    eggs.push(egg);
}

// Get a random egg lay time
function getRandomEggLayTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Determine egg type based on probabilities (imported from board.js)
function determineEggType() {
    // Use imported eggTypes instead of gameState.eggTypes
    const roll = Math.random() * 100;
    
    let cumulativeChance = 0;
    for (const [type, data] of Object.entries(eggTypes)) {
        cumulativeChance += data.chance;
        if (roll < cumulativeChance) {
            return type;
        }
    }
    
    return 'normal'; // Default to normal egg if something goes wrong
}

// Get the displacement based on speed and interval
function getDisplacement(speedPerSecond, intervalMs) {
    return (speedPerSecond * intervalMs) / 1000;
}

// Stop all game loops
function stopGameLoop() {
    // Clear all intervals
    for (const [key, interval] of Object.entries(gameIntervals)) {
        if (interval) {
            clearInterval(interval);
            gameIntervals[key] = null;
        }
    }
    
    console.log("Game loops stopped");
}

export { 
    startGameLoop, 
    stopGameLoop,
    setupIntervals,
    updateChickens
}; 