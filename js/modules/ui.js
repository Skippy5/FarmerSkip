// UI module
// Handles game UI, screens, and messages
import { gameState } from './game.js';
import { playSound } from './audio.js';

// Set up game screens and UI
function setupGameScreens(game) {
    const { domElements } = gameState;
    
    console.log("Setting up game screens with game object:", game);
    
    // Set up button event listeners
    domElements.startButton.addEventListener('click', () => {
        console.log("Start button clicked");
        hideAllScreens();
        game.startGame();
    });
    
    domElements.continueButton.addEventListener('click', continueToNextLevel);
    
    // Fix: Use an arrow function to maintain proper scope for the restart function
    domElements.playAgainButton.addEventListener('click', () => {
        console.log("Play Again button clicked");
        hideAllScreens();
        game.restartGame();
    });
    
    // Also update the restart button to use the same pattern
    domElements.restartButton.addEventListener('click', () => {
        console.log("Restart button clicked");
        hideAllScreens();
        game.restartGame();
    });
    
    // Show start screen
    showStartScreen();
    
    console.log("Game screens set up successfully");
}

// Show the start screen
function showStartScreen() {
    const { domElements } = gameState;
    
    // Hide all screens first
    hideAllScreens();
    
    // Show the start screen
    domElements.startScreen.classList.remove('hidden');
    console.log("Start screen shown");
}

// Show the level completion screen
function showLevelScreen() {
    const { domElements, level, eggsCollectedThisLevel, levelScore } = gameState;
    
    // Hide all screens first
    hideAllScreens();
    
    // Update level screen elements
    domElements.completedLevelSpan.textContent = level;
    domElements.nextLevelSpan.textContent = level + 1;
    domElements.levelEggsCollectedSpan.textContent = eggsCollectedThisLevel;
    domElements.levelScoreSpan.textContent = levelScore;
    
    // Set level challenge text based on level
    if (level <= 3) {
        domElements.levelChallengeText.textContent = `More chickens and obstacles ahead!`;
    } else if (level <= 5) {
        domElements.levelChallengeText.textContent = `Watch out for the rooster and weasel!`;
    } else {
        domElements.levelChallengeText.textContent = `This is getting tough! Stay focused!`;
    }
    
    // Show the level screen
    domElements.levelScreen.classList.remove('hidden');
    console.log("Level screen shown");
    
    // Play level up sound
    playSound('levelUp');
}

// Show the end screen
function showEndScreen(isVictory = false, gameOverMessage = null) {
    const { domElements, totalScore, level } = gameState;
    
    // Hide all screens first
    hideAllScreens();
    
    // Update end screen content based on win or loss
    if (isVictory) {
        domElements.endTitleSpan.textContent = "Victory!";
        domElements.endMessageSpan.textContent = "You've become a master farmer!";
    } else {
        domElements.endTitleSpan.textContent = "Game Over!";
        domElements.endMessageSpan.textContent = gameOverMessage || "The snake has eaten too many eggs!";
    }
    
    // Update score and level
    domElements.finalScoreSpan.textContent = totalScore;
    domElements.finalLevelSpan.textContent = level;
    
    // Show the end screen
    domElements.endScreen.classList.remove('hidden');
    console.log("End screen shown");
    
    // Play game over sound
    playSound('gameOver');
}

// Show life lost screen with the specified reason
function showLifeLostScreen(reason) {
    const { domElements, lives } = gameState;
    
    // Update message based on reason
    let message;
    let color;
    
    switch (reason) {
        case 'snake':
            message = 'Caught by the snake! -1 life';
            color = '#ff5555';
            break;
        case 'rooster':
            message = 'Attacked by the rooster! -1 life';
            color = '#ff5555';
            break;
        case 'weasels':
            message = 'Too many chickens eaten by weasels! -1 life';
            color = '#ff5555';
            break;
        default:
            message = 'You lost a life!';
            color = '#ff5555';
    }
    
    // Display the message
    domElements.messageElement.textContent = message;
    domElements.messageElement.style.color = color;
    
    // Update lives display
    domElements.livesElement.textContent = lives;
    
    // Clear message after a delay
    setTimeout(() => {
        domElements.messageElement.textContent = '';
        domElements.messageElement.style.color = ''; // Reset color
    }, 2000);
    
    // Play hit sound
    playSound('hit');
}

// Display a message with optional color and duration
function showMessage(text, color = '#3a7d44', duration = 2000) {
    const { domElements } = gameState;
    
    domElements.messageElement.textContent = text;
    domElements.messageElement.style.color = color;
    
    // Clear message after the specified duration
    setTimeout(() => {
        domElements.messageElement.textContent = '';
        domElements.messageElement.style.color = ''; // Reset color
    }, duration);
}

// Update power-up UI display
function updatePowerUpUI() {
    const { powerUpType, powerUpTimeLeft, domElements } = gameState;
    
    if (powerUpType && powerUpTimeLeft > 0) {
        const seconds = Math.ceil(powerUpTimeLeft / 1000);
        showMessage(`${getPowerUpEmoji(powerUpType)} Active! (${seconds}s)`, getPowerUpColor(powerUpType));
    }
}

// Get emoji for a power-up type
function getPowerUpEmoji(type) {
    const emojis = {
        speed: '⚡',
        shield: '🛡️',
        magnet: '🧲',
        freeze: '❄️'
    };
    
    return emojis[type] || '❓';
}

// Get color for a power-up type
function getPowerUpColor(type) {
    const colors = {
        speed: '#FFFF00',
        shield: '#3366FF',
        magnet: '#FF5555',
        freeze: '#00FFFF'
    };
    
    return colors[type] || '#FFFFFF';
}

// Continue to the next level
function continueToNextLevel() {
    console.log("Continue to next level button clicked");
    
    // Increment level
    gameState.level++;
    
    // Hide level screen
    hideAllScreens();
    
    // Clear eggs before proceeding to next level
    gameState.eggs = [];
    
    // Dynamically import setupLevel from game.js to avoid circular dependencies
    import('./game.js').then(module => {
        console.log("Imported game.js for setupLevel");
        module.setupLevel();
    }).catch(error => {
        console.error("Error importing game.js:", error);
    });
}

// Hide all game screens
function hideAllScreens() {
    const { domElements } = gameState;
    
    domElements.startScreen.classList.add('hidden');
    domElements.levelScreen.classList.add('hidden');
    domElements.endScreen.classList.add('hidden');
    console.log("All screens hidden");
}

export {
    setupGameScreens,
    showStartScreen,
    showLevelScreen,
    showEndScreen,
    showLifeLostScreen,
    showMessage,
    updatePowerUpUI,
    getPowerUpEmoji,
    getPowerUpColor,
    continueToNextLevel,
    hideAllScreens
}; 