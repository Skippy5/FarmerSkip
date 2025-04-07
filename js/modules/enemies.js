// Enemies module
// Handles enemy (snake, rooster, weasel) logic
import { gameState, entitySizes, speeds, intervals } from './game.js';
import { isPositionValid, isOverlapping } from './board.js';
import { moveEntityTowards, moveEntityRandomly, getDisplacement } from './entities.js';
import { showLifeLostScreen } from './ui.js';

// Move the snake towards the farmer or eggs
function moveSnake() {
    const { snakePos, farmerPos, eggs, playerHasPowerUp, powerUpType } = gameState;
    
    // Get base snake speed
    let snakeSpeed = speeds.snake;
    
    // Apply freeze effect if active
    if (playerHasPowerUp && powerUpType === 'freeze') {
        snakeSpeed *= 0.3; // Snake moves at 30% speed when frozen
    }
    
    // If there are no eggs, chase the farmer
    if (eggs.length === 0) {
        moveEntityTowards(
            snakePos, 
            entitySizes.snake, 
            farmerPos, 
            snakeSpeed, 
            intervals.enemyMove
        );
        return;
    }
    
    // Find the closest egg
    let closestEgg = null;
    let minDistance = Infinity;
    
    for (const egg of eggs) {
        const dx = egg.x - snakePos.x;
        const dy = egg.y - snakePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestEgg = egg;
        }
    }
    
    // 70% chance to move towards the closest egg, 30% chance to chase the farmer
    const targetPos = Math.random() < 0.7 ? closestEgg : farmerPos;
    
    // Move towards the target
    moveEntityTowards(
        snakePos, 
        entitySizes.snake, 
        targetPos, 
        snakeSpeed, 
        intervals.enemyMove
    );
}

// Spawn a rooster and set its properties
function spawnRooster() {
    const { boardWidth, boardHeight, isRoosterActive } = gameState;
    
    // Don't spawn if already active
    if (isRoosterActive) return;
    
    // Determine spawning position (one of the sides)
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    switch (side) {
        case 0: // Top
            x = Math.random() * (boardWidth - entitySizes.rooster.width);
            y = -entitySizes.rooster.height;
            break;
        case 1: // Right
            x = boardWidth;
            y = Math.random() * (boardHeight - entitySizes.rooster.height);
            break;
        case 2: // Bottom
            x = Math.random() * (boardWidth - entitySizes.rooster.width);
            y = boardHeight;
            break;
        case 3: // Left
            x = -entitySizes.rooster.width;
            y = Math.random() * (boardHeight - entitySizes.rooster.height);
            break;
    }
    
    // Activate the rooster
    gameState.roosterPos.x = x;
    gameState.roosterPos.y = y;
    gameState.isRoosterActive = true;
    
    // Set despawn timer
    setTimeout(despawnRooster, intervals.roosterActive);
}

// Despawn the rooster
function despawnRooster() {
    if (!gameState.isRoosterActive) return;
    
    // Move rooster off-screen
    gameState.roosterPos.x = -100;
    gameState.roosterPos.y = -100;
    gameState.isRoosterActive = false;
}

// Move the rooster towards the farmer
function moveRooster() {
    if (!gameState.isRoosterActive) return;
    
    const { roosterPos, farmerPos } = gameState;
    
    // Move towards the farmer
    moveEntityTowards(
        roosterPos, 
        entitySizes.rooster, 
        farmerPos, 
        speeds.rooster, 
        intervals.enemyMove,
        true // Avoid obstacles
    );
}

// Spawn a weasel
function spawnWeasel() {
    const { boardWidth, boardHeight, chickens, isWeaselActive, weasels } = gameState;
    
    // Don't spawn if already active or no chickens
    if (isWeaselActive || chickens.length === 0) return;
    
    // Determine spawning position (one of the sides)
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    switch (side) {
        case 0: // Top
            x = Math.random() * (boardWidth - entitySizes.weasel.width);
            y = -entitySizes.weasel.height;
            break;
        case 1: // Right
            x = boardWidth;
            y = Math.random() * (boardHeight - entitySizes.weasel.height);
            break;
        case 2: // Bottom
            x = Math.random() * (boardWidth - entitySizes.weasel.width);
            y = boardHeight;
            break;
        case 3: // Left
            x = -entitySizes.weasel.width;
            y = Math.random() * (boardHeight - entitySizes.weasel.height);
            break;
    }
    
    // Choose a random target chicken
    const targetChickenIndex = Math.floor(Math.random() * chickens.length);
    
    // Create weasel
    const weasel = {
        x, y,
        isTrapped: false,
        targetChicken: targetChickenIndex
    };
    
    // Add to weasels array
    weasels.push(weasel);
    
    // Set active flag
    gameState.isWeaselActive = true;
    
    // Set despawn timer
    setTimeout(() => {
        if (weasels.length > 0) {
            // Remove the weasel if it still exists
            weasels.shift();
            gameState.isWeaselActive = weasels.length > 0;
        }
    }, intervals.weaselActive);
}

// Move all weasels
function moveWeasels() {
    const { weasels, chickens } = gameState;
    
    for (let i = weasels.length - 1; i >= 0; i--) {
        const weasel = weasels[i];
        
        // Skip trapped weasels
        if (weasel.isTrapped) continue;
        
        // Check if target chicken still exists
        if (weasel.targetChicken >= chickens.length) {
            // Choose a new target or remove weasel if no chickens
            if (chickens.length === 0) {
                weasels.splice(i, 1);
                continue;
            }
            weasel.targetChicken = Math.floor(Math.random() * chickens.length);
        }
        
        // Get target chicken
        const targetChicken = chickens[weasel.targetChicken];
        
        // Move towards target chicken
        moveEntityTowards(
            weasel,
            entitySizes.weasel,
            { x: targetChicken.x, y: targetChicken.y },
            speeds.weasel,
            intervals.enemyMove,
            true // Avoid obstacles
        );
        
        // Check if weasel caught the chicken
        const weaselRect = {
            x: weasel.x,
            y: weasel.y,
            width: entitySizes.weasel.width,
            height: entitySizes.weasel.height
        };
        
        const chickenRect = {
            x: targetChicken.x,
            y: targetChicken.y,
            width: entitySizes.chicken.width,
            height: entitySizes.chicken.height
        };
        
        if (isOverlapping(weaselRect, chickenRect)) {
            // Remove chicken
            chickens.splice(weasel.targetChicken, 1);
            
            // Increment counter and check for limit
            gameState.chickensEatenByWeasel++;
            
            if (gameState.chickensEatenByWeasel >= gameState.weaselChickenLimit) {
                handleTooManyChickensEaten();
            }
            
            // Remove weasel
            weasels.splice(i, 1);
            
            if (chickens.length === 0) {
                handleAllChickensEaten();
            }
        }
    }
    
    // Update weasel active state
    gameState.isWeaselActive = weasels.length > 0;
}

// Handle too many chickens eaten by weasels
function handleTooManyChickensEaten() {
    // Lose a life
    gameState.lives--;
    
    // Reset counter
    gameState.chickensEatenByWeasel = 0;
    
    // Show life lost screen
    showLifeLostScreen('weasels');
    
    // Check for game over
    if (gameState.lives <= 0) {
        import('./ui.js').then(module => {
            module.showEndScreen(false, "All lives lost! The weasels were too hungry!");
        });
    }
}

// Handle all chickens eaten
function handleAllChickensEaten() {
    import('./ui.js').then(module => {
        module.showMessage("All chickens eaten! No more eggs can be laid!", "#ff5555");
    });
}

export {
    moveSnake,
    spawnRooster,
    despawnRooster,
    moveRooster,
    spawnWeasel,
    moveWeasels,
    handleTooManyChickensEaten,
    handleAllChickensEaten
}; 