// Main entry point for Farmer Skip game
import { initGame } from './modules/game.js';
import { setupEventListeners } from './modules/input.js';
import { setupGameScreens } from './modules/ui.js';
import { setupSounds } from './modules/audio.js';

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Initializing game...");
    
    try {
        // Verify DOM elements and set up the game
        const game = initGame();
        
        // Log game object for debugging
        console.log("Game initialized:", game);
        
        // Set up sounds, event listeners, and screens with the game object
        setupSounds();
        setupEventListeners(game);
        setupGameScreens(game);
        
        // Store game in global scope for debugging (remove in production)
        window.FarmerSkipGame = game;
        
        console.log("Game initialization completed successfully");
        console.log("Click the 'Start Game' button to begin playing");
    } catch (error) {
        console.error("Error during game initialization:", error);
        // Create a visible error message
        const errorMsg = document.createElement('div');
        errorMsg.style.color = 'red';
        errorMsg.style.padding = '20px';
        errorMsg.style.backgroundColor = '#ffe6e6';
        errorMsg.style.border = '1px solid red';
        errorMsg.style.borderRadius = '5px';
        errorMsg.style.margin = '20px';
        errorMsg.innerHTML = `
            <strong>Error starting game:</strong><br>
            ${error.message}<br><br>
            <strong>Troubleshooting:</strong><br>
            - Make sure you're running the game through a web server<br>
            - Try using Python's built-in server: <code>python -m http.server</code><br>
            - Or use <code>npx http-server</code> if you have Node.js installed<br>
            - Check the browser console (F12) for more details
        `;
        
        // Try to append to game container or body if we can't find the message element
        const container = document.getElementById('game-container') || document.body;
        container.prepend(errorMsg);
    }
}); 