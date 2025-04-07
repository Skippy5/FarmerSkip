// Collision module
// Handles collision detection and responses
import { gameState, entitySizes, eggTypes } from './game.js';
import { isOverlapping } from './board.js';
import { showFloatingText } from './dom.js';
import { playSound } from './audio.js';
import { applyPowerUp } from './powerups.js';
import { resetPositions } from './entities.js';

// Check all collisions in the game
function checkCollisions() {
    // Early return if game is not active
    if (!gameState.gameActive) return;
    
    const { 
        farmerPos, snakePos, roosterPos, isRoosterActive,
        eggs, powerUps, playerHasPowerUp, powerUpType
    } = gameState;
    
    // Create hitbox rectangles
    const farmerRect = {
        x: farmerPos.x,
        y: farmerPos.y,
        width: entitySizes.farmer.width,
        height: entitySizes.farmer.height
    };
    
    const snakeRect = {
        x: snakePos.x,
        y: snakePos.y,
        width: entitySizes.snake.width,
        height: entitySizes.snake.height
    };
    
    // Check farmer collision with snake
    if (isOverlapping(farmerRect, snakeRect)) {
        // If farmer has shield, don't get caught
        if (!(playerHasPowerUp && powerUpType === 'shield')) {
            handleFarmerCaught('snake');
        }
    }
    
    // Check farmer collision with rooster if active
    if (isRoosterActive) {
        const roosterRect = {
            x: roosterPos.x,
            y: roosterPos.y,
            width: entitySizes.rooster.width,
            height: entitySizes.rooster.height
        };
        
        if (isOverlapping(farmerRect, roosterRect)) {
            // If farmer has shield, don't get caught
            if (!(playerHasPowerUp && powerUpType === 'shield')) {
                handleFarmerCaught('rooster');
            }
        }
    }
    
    // Check farmer collision with eggs
    for (let i = eggs.length - 1; i >= 0; i--) {
        const egg = eggs[i];
        
        const eggRect = {
            x: egg.x,
            y: egg.y,
            width: entitySizes.egg.width,
            height: entitySizes.egg.height
        };
        
        // Determine collection radius based on magnet power-up
        let collectionRadius = 0;
        if (playerHasPowerUp && powerUpType === 'magnet') {
            collectionRadius = entitySizes.farmer.width * 2; // Increased collection radius with magnet
        }
        
        // Check if farmer is close enough to collect the egg
        if (
            isOverlapping(farmerRect, eggRect) || 
            (collectionRadius > 0 && isNearby(farmerRect, eggRect, collectionRadius))
        ) {
            // Collect the egg
            collectEgg(egg, i);
        }
    }
    
    // Check snake collision with eggs
    for (let i = eggs.length - 1; i >= 0; i--) {
        const egg = eggs[i];
        
        const eggRect = {
            x: egg.x,
            y: egg.y,
            width: entitySizes.egg.width,
            height: entitySizes.egg.height
        };
        
        if (isOverlapping(snakeRect, eggRect)) {
            // Snake eats the egg
            snakeEatEgg(i);
        }
    }
    
    // Check farmer collision with power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        const powerUpRect = {
            x: powerUp.x,
            y: powerUp.y,
            width: entitySizes.powerUp.width,
            height: entitySizes.powerUp.height
        };
        
        if (isOverlapping(farmerRect, powerUpRect)) {
            // Collect the power-up
            collectPowerUp(powerUp, i);
        }
    }
    
    // Check win and lose conditions
    checkWinCondition();
    checkLoseCondition();
}

// Check if two rectangles are nearby within a specified radius
function isNearby(rect1, rect2, radius) {
    // Calculate centers
    const center1X = rect1.x + rect1.width / 2;
    const center1Y = rect1.y + rect1.height / 2;
    const center2X = rect2.x + rect2.width / 2;
    const center2Y = rect2.y + rect2.height / 2;
    
    // Calculate distance between centers
    const dx = center1X - center2X;
    const dy = center1Y - center2Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Return true if within radius
    return distance <= radius;
}

// Handle farmer collecting an egg
function collectEgg(egg, eggIndex) {
    const { eggs, combo, lastEggCollectTime, eggsCollectedThisLevel, eggsNeeded } = gameState;
    const now = Date.now();
    
    // Remove the egg from the array
    eggs.splice(eggIndex, 1);
    
    // Calculate points based on egg type and combo
    const eggValue = eggTypes[egg.type].value;
    
    // Update combo counter
    let newCombo = 1;
    if (now - lastEggCollectTime < 2000) { // 2 seconds for combo
        newCombo = combo + 1;
    }
    gameState.combo = newCombo;
    gameState.lastEggCollectTime = now;
    
    // Calculate combo bonus
    const comboBonus = Math.min(newCombo - 1, 5); // Cap combo bonus at 5
    const totalPoints = eggValue + comboBonus;
    
    // Update scores
    gameState.levelScore += totalPoints;
    gameState.totalScore += totalPoints;
    gameState.eggsCollectedThisLevel++;
    
    // Update UI
    updateEggCountDisplay();
    
    // Show floating text
    let comboText = newCombo > 1 ? ` x${newCombo}` : '';
    showFloatingText(`+${totalPoints}${comboText}`, egg.x, egg.y, getEggColor(egg.type));
    
    // Play sound based on egg type
    if (egg.type === 'golden') {
        playSound('goldCollect');
    } else if (egg.type === 'special') {
        playSound('specialCollect');
    } else {
        playSound('collect');
    }
    
    // Check if level completed
    if (eggsCollectedThisLevel >= eggsNeeded) {
        // Level completed!
        levelCompleted();
    }
}

// Handle snake eating an egg
function snakeEatEgg(eggIndex) {
    const { eggs, snakeScore, snakeLimit } = gameState;
    
    // Remove the egg from the array
    eggs.splice(eggIndex, 1);
    
    // Increment snake score
    gameState.snakeScore++;
    
    // Update UI
    updateEggCountDisplay();
    
    // Check if snake has reached the limit
    if (snakeScore >= snakeLimit) {
        // Game over!
        showEndGameScreen(false, "The snake has eaten too many eggs!");
    }
}

// Handle power-up collection
function collectPowerUp(powerUp, powerUpIndex) {
    const { powerUps } = gameState;
    
    // Remove the power-up from the array
    powerUps.splice(powerUpIndex, 1);
    
    // Apply the power-up effect
    applyPowerUp(powerUp.type);
    
    // Show floating text
    showFloatingText(getPowerUpText(powerUp.type), powerUp.x, powerUp.y, getPowerUpColor(powerUp.type));
}

// Handle farmer being caught by an enemy
function handleFarmerCaught(enemyType) {
    // Lose a life
    gameState.lives--;
    
    // Show life lost screen
    showLifeLostMessage(enemyType);
    
    // Reset positions
    resetPositions(enemyType);
    
    // Check for game over
    if (gameState.lives <= 0) {
        showEndGameScreen(false, enemyType === 'snake' 
            ? "Caught by the snake! Game Over!" 
            : "Attacked by the rooster! Game Over!");
    }
}

// Check if the level win condition has been met
function checkWinCondition() {
    const { eggsCollectedThisLevel, eggsNeeded } = gameState;
    
    if (eggsCollectedThisLevel >= eggsNeeded) {
        levelCompleted();
    }
}

// Check if the game lose condition has been met
function checkLoseCondition() {
    const { snakeScore, snakeLimit, lives } = gameState;
    
    if (snakeScore >= snakeLimit) {
        // Snake has eaten too many eggs
        showEndGameScreen(false, "The snake has eaten too many eggs!");
    }
    
    if (lives <= 0) {
        // No more lives
        showEndGameScreen(false, "All lives lost!");
    }
}

// Handle level completion
function levelCompleted() {
    // Only process level completion once
    if (!gameState.gameActive) return;
    
    // Set game as inactive
    gameState.gameActive = false;
    
    // Stop all intervals and timers
    import('./gameLoop.js').then(module => {
        module.stopGameLoop();
        
        // Show level completion screen
        import('./ui.js').then(ui => {
            ui.showLevelScreen();
        });
    });
}

// Show end game screen
function showEndGameScreen(isVictory, message) {
    // Only process game over once
    if (!gameState.gameActive) return;
    
    // Set game as inactive
    gameState.gameActive = false;
    
    // Stop all intervals and timers
    import('./gameLoop.js').then(module => {
        module.stopGameLoop();
        
        // Show end screen
        import('./ui.js').then(ui => {
            ui.showEndScreen(isVictory, message);
        });
    });
}

// Show life lost message
function showLifeLostMessage(reason) {
    import('./ui.js').then(ui => {
        ui.showLifeLostScreen(reason);
    });
}

// Update the egg count display
function updateEggCountDisplay() {
    const { domElements, eggsCollectedThisLevel, eggsNeeded, snakeScore, snakeLimit } = gameState;
    
    domElements.eggsCollectedCountElement.textContent = eggsCollectedThisLevel;
    domElements.snakeScoreElement.textContent = snakeScore;
}

// Get the color for an egg type
function getEggColor(type) {
    const colors = {
        normal: '#FFFFFF',
        golden: '#FFD700',
        special: '#FF69B4'
    };
    
    return colors[type] || '#FFFFFF';
}

// Get display text for a power-up
function getPowerUpText(type) {
    const texts = {
        speed: '⚡ Speed!',
        shield: '🛡️ Shield!',
        magnet: '🧲 Magnet!',
        freeze: '❄️ Freeze!'
    };
    
    return texts[type] || 'Power-up!';
}

// Get color for a power-up
function getPowerUpColor(type) {
    const colors = {
        speed: '#FFFF00',
        shield: '#3366FF',
        magnet: '#FF5555',
        freeze: '#00FFFF'
    };
    
    return colors[type] || '#FFFFFF';
}

export {
    checkCollisions,
    collectEgg,
    snakeEatEgg,
    collectPowerUp,
    handleFarmerCaught,
    levelCompleted
}; 