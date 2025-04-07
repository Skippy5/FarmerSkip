// Entities module
// Handles game entities like farmer, snake, chickens
import { gameState, entitySizes, speeds, intervals } from './game.js';
import { isPositionValid, isOverlapping, determineEggType } from './board.js';
import { showFloatingText } from './dom.js';
import { playSound } from './audio.js';

// Get the displacement based on speed and interval
function getDisplacement(speedPerSecond, intervalMs) {
    return (speedPerSecond * intervalMs) / 1000;
}

// Update farmer position based on keyboard input
function updateFarmerMovement() {
    const { keysPressed, playerHasPowerUp, powerUpType } = gameState;
    let dirX = 0;
    let dirY = 0;
    
    // Determine movement direction based on keys pressed
    if (keysPressed.up) dirY = -1;
    if (keysPressed.down) dirY = 1;
    if (keysPressed.left) dirX = -1;
    if (keysPressed.right) dirX = 1;
    
    // No movement if no keys pressed
    if (dirX === 0 && dirY === 0) return;
    
    // Normalize diagonal movement
    if (dirX !== 0 && dirY !== 0) {
        dirX *= 0.7071; // 1 / Math.sqrt(2)
        dirY *= 0.7071;
    }
    
    // Get the base displacement
    const farmerBaseDisplacement = getDisplacement(speeds.farmer, intervals.farmerMove);
    
    // Apply speed boost if farmer has speed power-up
    let currentFarmerSpeed = farmerBaseDisplacement;
    if (playerHasPowerUp && powerUpType === 'speed') {
        currentFarmerSpeed *= 1.5;
    }
    
    // Move the farmer
    moveFarmer(
        gameState.farmerPos.x + dirX * currentFarmerSpeed,
        gameState.farmerPos.y + dirY * currentFarmerSpeed
    );
}

// Move the farmer to the target position
function moveFarmer(targetX, targetY) {
    const { boardWidth, boardHeight, obstacles } = gameState;
    const { width, height } = entitySizes.farmer;
    
    // Constrain to board bounds
    targetX = Math.max(0, Math.min(boardWidth - width, targetX));
    targetY = Math.max(0, Math.min(boardHeight - height, targetY));
    
    // Check for obstacle collisions
    const farmerRect = {
        x: targetX,
        y: targetY,
        width,
        height
    };
    
    // Adjust position if hitting obstacles
    let canMoveX = true;
    let canMoveY = true;
    
    for (const obstacle of obstacles) {
        // Check if the farmer would collide with this obstacle
        if (isOverlapping(farmerRect, obstacle)) {
            // Determine which direction to block
            const overlapX = Math.min(
                Math.abs(obstacle.x + obstacle.width - gameState.farmerPos.x),
                Math.abs(obstacle.x - (gameState.farmerPos.x + width))
            );
            
            const overlapY = Math.min(
                Math.abs(obstacle.y + obstacle.height - gameState.farmerPos.y),
                Math.abs(obstacle.y - (gameState.farmerPos.y + height))
            );
            
            if (overlapX < overlapY) {
                canMoveX = false;
            } else {
                canMoveY = false;
            }
        }
    }
    
    // Apply movement based on collision checks
    if (canMoveX) {
        gameState.farmerPos.x = targetX;
    }
    
    if (canMoveY) {
        gameState.farmerPos.y = targetY;
    }
}

// Move an entity towards a target position, avoiding obstacles
function moveEntityTowards(entityPos, entitySize, targetPos, speedPerSecond, intervalMs, avoidObstacles = true, avoidEntities = []) {
    // Calculate direction vector to target
    const dirX = targetPos.x - entityPos.x;
    const dirY = targetPos.y - entityPos.y;
    
    // Get distance to target
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // If already at target (or very close), don't move
    if (distance < 1) return;
    
    // Normalize direction vector
    const normalizedDirX = dirX / distance;
    const normalizedDirY = dirY / distance;
    
    // Calculate displacement based on speed and interval
    const displacement = getDisplacement(speedPerSecond, intervalMs);
    
    // Calculate new position
    let newX = entityPos.x + normalizedDirX * displacement;
    let newY = entityPos.y + normalizedDirY * displacement;
    
    // Constrain to board bounds
    const { boardWidth, boardHeight } = gameState;
    newX = Math.max(0, Math.min(boardWidth - entitySize.width, newX));
    newY = Math.max(0, Math.min(boardHeight - entitySize.height, newY));
    
    // Check for collisions with obstacles if needed
    if (avoidObstacles) {
        const entityRect = {
            x: newX,
            y: newY,
            width: entitySize.width,
            height: entitySize.height
        };
        
        // Check for obstacle collisions
        for (const obstacle of gameState.obstacles) {
            if (isOverlapping(entityRect, obstacle)) {
                // Try different approach angles if hitting an obstacle
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                    const testX = entityPos.x + Math.cos(angle) * displacement;
                    const testY = entityPos.y + Math.sin(angle) * displacement;
                    
                    const testRect = {
                        x: testX,
                        y: testY,
                        width: entitySize.width,
                        height: entitySize.height
                    };
                    
                    if (!isOverlapping(testRect, obstacle)) {
                        newX = testX;
                        newY = testY;
                        break;
                    }
                }
            }
        }
    }
    
    // Update entity position
    entityPos.x = newX;
    entityPos.y = newY;
}

// Move an entity in a random direction
function moveEntityRandomly(entityPos, entitySize, speedPerSecond, intervalMs) {
    // Generate random direction if none exists
    if (!entityPos.dirX || !entityPos.dirY) {
        const angle = Math.random() * Math.PI * 2;
        entityPos.dirX = Math.cos(angle);
        entityPos.dirY = Math.sin(angle);
    }
    
    // Calculate displacement
    const displacement = getDisplacement(speedPerSecond, intervalMs);
    
    // Calculate new position
    let newX = entityPos.x + entityPos.dirX * displacement;
    let newY = entityPos.y + entityPos.dirY * displacement;
    
    // Check if the new position is valid
    const { boardWidth, boardHeight } = gameState;
    const validX = newX >= 0 && newX + entitySize.width <= boardWidth;
    const validY = newY >= 0 && newY + entitySize.height <= boardHeight;
    
    // If hitting a boundary, bounce off it
    if (!validX) {
        entityPos.dirX *= -1;
        newX = entityPos.x + entityPos.dirX * displacement;
    }
    
    if (!validY) {
        entityPos.dirY *= -1;
        newY = entityPos.y + entityPos.dirY * displacement;
    }
    
    // Occasionally change direction randomly
    if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        entityPos.dirX = Math.cos(angle);
        entityPos.dirY = Math.sin(angle);
    }
    
    // Update position
    entityPos.x = Math.max(0, Math.min(boardWidth - entitySize.width, newX));
    entityPos.y = Math.max(0, Math.min(boardHeight - entitySize.height, newY));
}

// Reset entity positions
function resetPositions(reason) {
    const { boardWidth, boardHeight } = gameState;
    
    // Reset farmer position to top left quadrant
    gameState.farmerPos.x = Math.floor(boardWidth * 0.25);
    gameState.farmerPos.y = Math.floor(boardHeight * 0.25);
    
    // Reset snake position to bottom right quadrant
    gameState.snakePos.x = Math.floor(boardWidth * 0.75);
    gameState.snakePos.y = Math.floor(boardHeight * 0.75);
    
    // Reset rooster position off-screen
    gameState.roosterPos.x = -100;
    gameState.roosterPos.y = -100;
    gameState.isRoosterActive = false;
    
    // If we're resetting for a new level, clear eggs and other level-specific entities
    if (reason === 'newLevel') {
        // Eggs are cleared in the setupLevel function
        // Also ensure weasels and bullets are cleared
        gameState.weasels = [];
        gameState.bullets = [];
        gameState.isWeaselActive = false;
        console.log("All entities reset for new level");
    }
}

export {
    updateFarmerMovement,
    moveFarmer,
    moveEntityTowards,
    moveEntityRandomly,
    getDisplacement,
    resetPositions
}; 