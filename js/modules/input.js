// Input handling module
// Handles keyboard and mouse input
import { gameState } from './game.js';
import { shootBullet } from './weapons.js';

// Set up event listeners for keyboard and mouse input
function setupEventListeners(game) {
    const { domElements } = gameState;
    const gameBoard = domElements.gameBoard;
    
    // Remove existing event listeners to prevent duplicates
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    gameBoard.removeEventListener('mousedown', handleMouseDown);
    gameBoard.removeEventListener('mousemove', trackMousePosition);
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Add mouse event listeners
    gameBoard.addEventListener('mousedown', handleMouseDown, { passive: false });
    gameBoard.addEventListener('mousemove', trackMousePosition, { passive: false });
    
    // Set up button event listeners (note: main button event handlers are set up in ui.js)
    domElements.restartButton.addEventListener('click', game.restartGame);
    
    console.log("Event listeners set up successfully");
}

// Handle mousedown events for shooting
function handleMouseDown(event) {
    // Prevent default browser behavior
    event.preventDefault();
    
    // Update mouse position for accuracy
    trackMousePosition(event);
    
    // Shoot a bullet
    shootBullet();
}

// Track mouse position for aiming
function trackMousePosition(event) {
    // Prevent default browser behavior
    event.preventDefault();
    
    const rect = gameState.domElements.gameBoard.getBoundingClientRect();
    const newX = event.clientX - rect.left;
    const newY = event.clientY - rect.top;
    
    // Store the mouse position in game coordinates
    gameState.mousePos.x = newX;
    gameState.mousePos.y = newY;
    
    // Verify the mouse position is within the board
    if (newX < 0 || newX > gameState.boardWidth || newY < 0 || newY > gameState.boardHeight) {
        console.warn("Mouse position outside game board:", newX, newY);
    }
}

// Handle keydown events
function handleKeyDown(event) {
    // Prevent default browser behavior for arrow keys to avoid scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
        event.preventDefault();
    }
    
    // Update key states
    switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            gameState.keysPressed.up = true;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            gameState.keysPressed.down = true;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            gameState.keysPressed.left = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            gameState.keysPressed.right = true;
            break;
    }
}

// Handle keyup events
function handleKeyUp(event) {
    // Update key states
    switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            gameState.keysPressed.up = false;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            gameState.keysPressed.down = false;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            gameState.keysPressed.left = false;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            gameState.keysPressed.right = false;
            break;
    }
}

// Update level text on level screen
function updateLevelText() {
    const { domElements, level, eggsCollectedThisLevel, levelScore } = gameState;
    
    // Update level screen elements
    domElements.completedLevelSpan.textContent = level;
    domElements.nextLevelSpan.textContent = level + 1;
    domElements.levelEggsCollectedSpan.textContent = eggsCollectedThisLevel;
    domElements.levelScoreSpan.textContent = levelScore;
    
    // Update level challenge text based on level
    if (level <= 3) {
        domElements.levelChallengeText.textContent = `More chickens and obstacles ahead!`;
    } else if (level <= 5) {
        domElements.levelChallengeText.textContent = `Watch out for the rooster and weasel!`;
    } else {
        domElements.levelChallengeText.textContent = `This is getting tough! Stay focused!`;
    }
}

export { 
    setupEventListeners,
    handleKeyDown,
    handleKeyUp,
    trackMousePosition,
    handleMouseDown,
    updateLevelText
}; 