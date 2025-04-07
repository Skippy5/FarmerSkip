// Board module
// Handles game board creation and manipulation
import { gameState, entitySizes, eggTypes } from './game.js';
import { createGameElement } from './dom.js';

// Create the game board with the current dimensions
function createBoard() {
    const { boardWidth, boardHeight, domElements } = gameState;
    const gameBoard = domElements.gameBoard;
    
    // Clear any existing content
    gameBoard.innerHTML = '';
    
    // Set board dimensions
    gameBoard.style.width = `${boardWidth}px`;
    gameBoard.style.height = `${boardHeight}px`;
    
    console.log(`Board created with dimensions: ${boardWidth}x${boardHeight}`);
    return gameBoard;
}

// Clear the board of all entities
function clearBoard() {
    const { domElements } = gameState;
    if (domElements.gameBoard) {
        domElements.gameBoard.innerHTML = '';
    }
}

// Get a random wait time between min and max
function getRandomWaitTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Check if two entities are overlapping
function isOverlapping(item1, item2) {
    return (
        item1.x < item2.x + item2.width &&
        item1.x + item1.width > item2.x &&
        item1.y < item2.y + item2.height &&
        item1.y + item1.height > item2.y
    );
}

// Check if a position is valid for placing an entity
function isPositionValid(x, y, size, checkEntities = true) {
    const { boardWidth, boardHeight, obstacles, chickens, farmerPos, snakePos } = gameState;
    
    // Check if position is within bounds
    if (
        x < 0 || 
        y < 0 || 
        x + size.width > boardWidth || 
        y + size.height > boardHeight
    ) {
        return false;
    }
    
    if (!checkEntities) return true;
    
    // Check for collision with obstacles
    const newEntity = { x, y, width: size.width, height: size.height };
    
    // Check collision with obstacles
    for (const obstacle of obstacles) {
        if (isOverlapping(newEntity, obstacle)) {
            return false;
        }
    }
    
    // Check collision with farmer
    const farmer = { 
        x: farmerPos.x, 
        y: farmerPos.y, 
        width: entitySizes.farmer.width, 
        height: entitySizes.farmer.height 
    };
    if (isOverlapping(newEntity, farmer)) {
        return false;
    }
    
    // Check collision with snake
    const snake = { 
        x: snakePos.x, 
        y: snakePos.y, 
        width: entitySizes.snake.width, 
        height: entitySizes.snake.height 
    };
    if (isOverlapping(newEntity, snake)) {
        return false;
    }
    
    // Check collision with chickens
    for (const chicken of chickens) {
        const chickenObj = { 
            x: chicken.x, 
            y: chicken.y, 
            width: entitySizes.chicken.width, 
            height: entitySizes.chicken.height 
        };
        if (isOverlapping(newEntity, chickenObj)) {
            return false;
        }
    }
    
    return true;
}

// Place obstacles on the board
function placeObstacles(count) {
    const { boardWidth, boardHeight } = gameState;
    
    for (let i = 0; i < count; i++) {
        let x, y;
        let attempts = 0;
        let validPosition = false;
        
        // Try to find a valid position
        while (!validPosition && attempts < 20) {
            x = Math.floor(Math.random() * (boardWidth - entitySizes.obstacle.width));
            y = Math.floor(Math.random() * (boardHeight - entitySizes.obstacle.height));
            
            validPosition = isPositionValid(x, y, entitySizes.obstacle);
            attempts++;
        }
        
        if (validPosition) {
            // Create the obstacle element
            const obstacleElement = createGameElement('obstacle', x, y, 'rock');
            
            // Add obstacle to the game state
            gameState.obstacles.push({
                x,
                y,
                element: obstacleElement,
                width: entitySizes.obstacle.width,
                height: entitySizes.obstacle.height
            });
        }
    }
}

// Place chickens on the board
function placeChickens(count) {
    console.log(`Attempting to place ${count} chickens on the board`);
    
    // First check if the game state is valid
    if (!gameState || !Array.isArray(gameState.chickens)) {
        console.error("Invalid game state for placing chickens:", gameState);
        return 0;
    }
    
    let successfulPlacements = 0;
    
    for (let i = 0; i < count; i++) {
        const cooldown = getRandomWaitTime(
            gameState.currentEggLayTimeMin, 
            gameState.currentEggLayTimeMax
        );
        
        if (placeSingleChicken(cooldown)) {
            successfulPlacements++;
        }
    }
    
    console.log(`Successfully placed ${successfulPlacements}/${count} chickens`);
    return successfulPlacements;
}

// Place a single chicken with the given egg cooldown
function placeSingleChicken(cooldown) {
    const { boardWidth, boardHeight } = gameState;
    
    console.log(`Attempting to place chicken with cooldown ${cooldown}`);
    console.log(`Board dimensions: ${boardWidth}x${boardHeight}`);
    
    // Validate board dimensions
    if (!boardWidth || !boardHeight || typeof boardWidth !== 'number' || typeof boardHeight !== 'number') {
        console.error("Invalid board dimensions:", boardWidth, boardHeight);
        return false;
    }
    
    // Validate chicken size
    if (!entitySizes.chicken || typeof entitySizes.chicken.width !== 'number') {
        console.error("Invalid chicken size:", entitySizes.chicken);
        return false;
    }
    
    let x, y;
    let attempts = 0;
    let validPosition = false;
    
    // Try to find a valid position
    while (!validPosition && attempts < 20) {
        x = Math.floor(Math.random() * (boardWidth - entitySizes.chicken.width));
        y = Math.floor(Math.random() * (boardHeight - entitySizes.chicken.height));
        
        validPosition = isPositionValid(x, y, entitySizes.chicken);
        attempts++;
        
        if (attempts % 5 === 0) {
            console.log(`Made ${attempts} attempts to place chicken, current try: (${x}, ${y}), valid: ${validPosition}`);
        }
    }
    
    if (validPosition) {
        // Create the chicken element
        const chickenElement = createGameElement('chicken', x, y);
        
        // Determine a random egg type based on probabilities
        const eggType = determineEggType();
        
        // Add the chicken to the game state
        const chicken = {
            x,
            y,
            element: chickenElement,
            eggCooldown: cooldown,
            eggType,
            // Add explicit direction values for movement
            dirX: Math.random() * 2 - 1,
            dirY: Math.random() * 2 - 1
        };
        
        // Normalize direction
        const length = Math.sqrt(chicken.dirX * chicken.dirX + chicken.dirY * chicken.dirY);
        if (length > 0) {
            chicken.dirX /= length;
            chicken.dirY /= length;
        }
        
        // Push to game state
        gameState.chickens.push(chicken);
        
        console.log(`Successfully placed chicken at (${x}, ${y}) with egg type ${eggType} and cooldown ${cooldown}`);
        console.log(`Total chickens: ${gameState.chickens.length}`);
        return true;
    } else {
        console.warn(`Failed to place chicken after ${attempts} attempts`);
        return false;
    }
}

// Determine an egg type based on probability
function determineEggType() {
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

// Draw all game entities on the board
function drawGame() {
    const { 
        farmerPos, snakePos, roosterPos, isRoosterActive,
        eggs, chickens, powerUps, weasels, bullets,
        domElements, playerHasPowerUp, powerUpType
    } = gameState;
    
    // Clear the board first
    clearBoard();
    
    // Draw obstacles
    for (const obstacle of gameState.obstacles) {
        createGameElement('obstacle', obstacle.x, obstacle.y, 'rock');
    }
    
    // Draw eggs
    for (const egg of eggs) {
        createGameElement('egg', egg.x, egg.y, egg.type);
    }
    
    // Draw power-ups
    for (const powerUp of powerUps) {
        createGameElement('power-up', powerUp.x, powerUp.y, powerUp.type);
    }
    
    // Draw chickens
    for (const chicken of chickens) {
        createGameElement('chicken', chicken.x, chicken.y);
    }
    
    // Draw weasels
    for (const weasel of weasels) {
        const className = weasel.isTrapped ? 'weasel trapped' : 'weasel';
        createGameElement(className, weasel.x, weasel.y);
    }
    
    // Draw bullets - simplified to avoid issues
    for (const bullet of bullets) {
        if (typeof bullet.x === 'number' && typeof bullet.y === 'number') {
            createGameElement('bullet', bullet.x, bullet.y);
        }
    }
    
    // Draw snake - always ensure snake is drawn
    if (typeof snakePos.x === 'number' && typeof snakePos.y === 'number') {
        createGameElement('snake', snakePos.x, snakePos.y);
    }
    
    // Draw rooster if active
    if (isRoosterActive && typeof roosterPos.x === 'number' && typeof roosterPos.y === 'number') {
        createGameElement('rooster', roosterPos.x, roosterPos.y);
    }
    
    // Draw farmer with power-up if applicable - always ensure farmer is drawn
    if (typeof farmerPos.x === 'number' && typeof farmerPos.y === 'number') {
        let farmerClass = 'farmer';
        if (playerHasPowerUp) {
            farmerClass += ` power-${powerUpType}`;
        }
        createGameElement(farmerClass, farmerPos.x, farmerPos.y);
    }
}

export { 
    createBoard, 
    clearBoard, 
    placeObstacles, 
    placeChickens, 
    placeSingleChicken,
    isPositionValid,
    isOverlapping,
    getRandomWaitTime,
    determineEggType,
    drawGame
}; 