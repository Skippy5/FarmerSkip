// DOM utilities module
// Handles DOM element verification and manipulation

// Function to verify all required DOM elements exist
function verifyDOMElements() {
    console.log("Verifying DOM elements...");
    
    // DOM Elements container
    const domElements = {};
    
    const elements = {
        'game-board': element => domElements.gameBoard = element,
        'eggs-collected-count': element => domElements.eggsCollectedCountElement = element,
        'eggs-needed': element => domElements.neededElement = element,
        'snake-eggs': element => domElements.snakeScoreElement = element,
        'snake-limit': element => domElements.snakeLimitElement = element,
        'level': element => domElements.levelElement = element,
        'message': element => domElements.messageElement = element,
        'restart-button': element => domElements.restartButton = element,
        'total-score': element => domElements.totalScoreElement = element,
        'lives': element => domElements.livesElement = element,
        
        // Game screens
        'start-screen': element => domElements.startScreen = element,
        'level-screen': element => domElements.levelScreen = element,
        'end-screen': element => domElements.endScreen = element,
        
        // Screen buttons
        'start-button': element => domElements.startButton = element,
        'continue-button': element => domElements.continueButton = element,
        'play-again-button': element => domElements.playAgainButton = element,
        
        // Level screen elements
        'completed-level': element => domElements.completedLevelSpan = element,
        'next-level': element => domElements.nextLevelSpan = element,
        'level-challenge': element => domElements.levelChallengeText = element,
        'level-eggs-collected': element => domElements.levelEggsCollectedSpan = element,
        'level-score': element => domElements.levelScoreSpan = element,
        
        // End screen elements
        'final-score': element => domElements.finalScoreSpan = element,
        'final-level': element => domElements.finalLevelSpan = element,
        'end-title': element => domElements.endTitleSpan = element,
        'end-message': element => domElements.endMessageSpan = element
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
    return domElements;
}

// Create a game element with the specified properties
function createGameElement(className, x, y, type = null) {
    const element = document.createElement('div');
    element.className = className;
    
    // Set position
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    // Add type-specific styling based on the type parameter
    if (type) {
        switch (className) {
            case 'egg':
                if (type === 'golden') {
                    element.classList.add('egg-golden');
                } else if (type === 'special') {
                    element.classList.add('egg-special');
                }
                break;
                
            case 'power-up':
                element.textContent = getPowerUpEmoji(type);
                element.style.color = getPowerUpColor(type);
                break;
                
            case 'obstacle':
                element.textContent = '🪨';
                break;
        }
    }
    
    // Special handling for bullets to ensure they're visible
    if (className === 'bullet') {
        // Make bullet more visible with a bright color and size
        element.style.backgroundColor = '#ff5555';
        element.style.width = '12px';
        element.style.height = '12px';
        element.style.borderRadius = '50%';
        element.style.boxShadow = '0 0 8px #ffcccc, 0 0 15px #ffcccc';
        
        // Calculate a default direction (right) if position data isn't available
        const rotation = '0deg';
        element.style.setProperty('--rotation', rotation);
    }
    
    // Get the game board
    const gameBoard = document.getElementById('game-board');
    
    // Add the element to the game board
    if (gameBoard) {
        gameBoard.appendChild(element);
    } else {
        console.error('Game board not found');
    }
    
    return element;
}

// Show floating text animation
function showFloatingText(text, x, y, color = '#FFFFFF', fontSize = 24) {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;
    
    const textElement = document.createElement('div');
    textElement.className = 'floating-text';
    textElement.textContent = text;
    textElement.style.left = `${x}px`;
    textElement.style.top = `${y}px`;
    textElement.style.color = color;
    textElement.style.fontSize = `${fontSize}px`;
    textElement.style.animation = 'float-up 1s forwards';
    
    gameBoard.appendChild(textElement);
    
    // Remove the element after animation completes
    setTimeout(() => {
        if (textElement.parentNode === gameBoard) {
            gameBoard.removeChild(textElement);
        }
    }, 1000);
}

// Get the emoji for a power-up type
function getPowerUpEmoji(type) {
    const powerUpEmojis = {
        speed: '⚡',
        shield: '🛡️',
        magnet: '🧲',
        freeze: '❄️'
    };
    
    return powerUpEmojis[type] || '❓';
}

// Get the color for a power-up type
function getPowerUpColor(type) {
    const powerUpColors = {
        speed: '#FFFF00',
        shield: '#3366FF',
        magnet: '#FF5555',
        freeze: '#00FFFF'
    };
    
    return powerUpColors[type] || '#FFFFFF';
}

export { 
    verifyDOMElements,
    createGameElement,
    showFloatingText
}; 