// Power-ups module
// Handles power-up spawning, collection, and effects
import { gameState, powerUpTypes, entitySizes } from './game.js';
import { isPositionValid } from './board.js';
import { showFloatingText } from './dom.js';
import { playSound } from './audio.js';
import { updatePowerUpUI } from './ui.js';

// Spawn a power-up with specific type
function spawnSpecificPowerUp(powerUpType) {
    const { boardWidth, boardHeight, powerUps } = gameState;
    
    // Find a valid position for the power-up
    let x, y;
    let attempts = 0;
    let validPosition = false;
    
    // Try to find a valid position
    while (!validPosition && attempts < 20) {
        x = Math.floor(Math.random() * (boardWidth - entitySizes.powerUp.width));
        y = Math.floor(Math.random() * (boardHeight - entitySizes.powerUp.height));
        
        validPosition = isPositionValid(x, y, entitySizes.powerUp);
        attempts++;
    }
    
    if (validPosition) {
        // Add the power-up to the game state
        powerUps.push({
            x,
            y,
            type: powerUpType
        });
    }
}

// Spawn a random power-up based on probabilities
function spawnPowerUp() {
    // Determine which power-up to spawn based on probabilities
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    
    for (const [type, data] of Object.entries(powerUpTypes)) {
        cumulativeChance += data.chance;
        if (roll < cumulativeChance) {
            spawnSpecificPowerUp(type);
            return;
        }
    }
    
    // Default to speed power-up if something goes wrong
    spawnSpecificPowerUp('speed');
}

// Apply a power-up effect
function applyPowerUp(type) {
    const { playerHasPowerUp, powerUpType } = gameState;
    
    // Remove existing power-up if active
    if (playerHasPowerUp) {
        removePowerUp();
    }
    
    // Apply the new power-up
    gameState.playerHasPowerUp = true;
    gameState.powerUpType = type;
    gameState.powerUpTimeLeft = powerUpTypes[type].duration;
    
    // Apply power-up specific effects
    switch (type) {
        case 'freeze':
            // Snake is frozen - nothing to do here, movement is affected in the snake update logic
            break;
            
        case 'magnet':
            // Magnet power-up - nothing to do here, egg collection is affected in the check collision logic
            break;
            
        case 'shield':
            // Shield power-up - nothing to do here, collision is affected in the check collision logic
            break;
            
        case 'speed':
            // Speed power-up - nothing to do here, movement is affected in the farmer movement logic
            break;
    }
    
    // Play power-up sound
    playSound('powerUp');
    
    // Update UI
    updatePowerUpUI();
}

// Remove active power-up
function removePowerUp() {
    if (!gameState.playerHasPowerUp) return;
    
    // Remove power-up effects
    gameState.playerHasPowerUp = false;
    gameState.powerUpType = null;
    gameState.powerUpTimeLeft = 0;
}

// Update power-up timer
function updatePowerUpTimer(deltaTime) {
    if (!gameState.playerHasPowerUp) return;
    
    // Decrease time left
    gameState.powerUpTimeLeft -= deltaTime;
    
    // Check if power-up has expired
    if (gameState.powerUpTimeLeft <= 0) {
        removePowerUp();
    }
    
    // Update UI every second
    if (Math.floor(gameState.powerUpTimeLeft / 1000) !== Math.floor((gameState.powerUpTimeLeft + deltaTime) / 1000)) {
        updatePowerUpUI();
    }
}

export {
    spawnPowerUp,
    spawnSpecificPowerUp,
    applyPowerUp,
    removePowerUp,
    updatePowerUpTimer
}; 