// Weapons module
// Handles shooting mechanics and bullet updates
import { gameState, entitySizes } from './game.js';
import { playSound } from './audio.js';
import { isOverlapping } from './board.js';
import { showFloatingText } from './dom.js';

// Shoot a bullet in the direction of the mouse click
function shootBullet() {
    const { farmerPos, mousePos, bullets } = gameState;
    
    // Get farmer's center position
    const farmerCenterX = farmerPos.x + entitySizes.farmer.width / 2;
    const farmerCenterY = farmerPos.y + entitySizes.farmer.height / 2;
    
    // Calculate direction vector
    const dirX = mousePos.x - farmerCenterX;
    const dirY = mousePos.y - farmerCenterY;
    
    // Normalize direction
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // If length is 0 (click on farmer), use a default direction
    const normalizedDirX = length === 0 ? 1 : dirX / length;
    const normalizedDirY = length === 0 ? 0 : dirY / length;
    
    // Create bullet with direction
    const bullet = {
        x: farmerCenterX - 6, // Center bullet (12px width)
        y: farmerCenterY - 6, // Center bullet (12px height)
        dirX: normalizedDirX,
        dirY: normalizedDirY,
        speed: 15 // Bullet speed in pixels per frame
    };
    
    // Add bullet to array
    bullets.push(bullet);
    
    // Play sound
    playSound('shoot');
}

// Update bullet positions and check for collisions
function updateBullets() {
    const { bullets, boardWidth, boardHeight, snakePos, roosterPos, isRoosterActive, weasels } = gameState;
    
    // Update each bullet
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.x += bullet.dirX * bullet.speed;
        bullet.y += bullet.dirY * bullet.speed;
        
        // Check if bullet is out of bounds
        if (
            bullet.x < 0 ||
            bullet.x > boardWidth ||
            bullet.y < 0 ||
            bullet.y > boardHeight
        ) {
            // Remove bullet if out of bounds
            bullets.splice(i, 1);
            continue;
        }
        
        // Set up bullet hitbox for collision detection
        const bulletRect = {
            x: bullet.x,
            y: bullet.y,
            width: 12, // Fixed width for hitbox
            height: 12 // Fixed height for hitbox
        };
        
        // Check for collision with snake
        const snakeRect = {
            x: snakePos.x,
            y: snakePos.y,
            width: entitySizes.snake.width,
            height: entitySizes.snake.height
        };
        
        if (isOverlapping(bulletRect, snakeRect)) {
            // Remove bullet first
            bullets.splice(i, 1);
            
            // Then handle the hit (to avoid synchronization issues)
            handleSnakeShot();
            continue;
        }
        
        // Check for collision with rooster if active
        if (isRoosterActive) {
            const roosterRect = {
                x: roosterPos.x,
                y: roosterPos.y,
                width: entitySizes.rooster.width,
                height: entitySizes.rooster.height
            };
            
            if (isOverlapping(bulletRect, roosterRect)) {
                // Remove bullet first
                bullets.splice(i, 1);
                
                // Then handle the hit
                handleRoosterShot();
                continue;
            }
        }
        
        // Check for collision with weasels
        for (let j = 0; j < weasels.length; j++) {
            const weasel = weasels[j];
            const weaselRect = {
                x: weasel.x,
                y: weasel.y,
                width: entitySizes.weasel.width,
                height: entitySizes.weasel.height
            };
            
            if (isOverlapping(bulletRect, weaselRect)) {
                // Remove bullet first
                bullets.splice(i, 1);
                
                // Get weasel position before removing
                const weaselPos = {
                    x: weasel.x,
                    y: weasel.y
                };
                
                // Then handle the hit
                handleWeaselShot(j, weaselPos);
                break;
            }
        }
    }
}

// Handle snake being shot
function handleSnakeShot() {
    // Add points for hitting the snake
    const basePoints = 5;
    gameState.levelScore += basePoints;
    gameState.totalScore += basePoints;
    
    // Show floating text
    showFloatingText(`+${basePoints}`, gameState.snakePos.x, gameState.snakePos.y, '#FF5555');
    
    // Play enemy hit sound
    playSound('enemyHit');
    
    // Move the snake to a random position (knockback effect) 
    // but ensure it doesn't trigger collision issues
    setTimeout(() => {
        const { boardWidth, boardHeight } = gameState;
        gameState.snakePos.x = Math.random() * (boardWidth - entitySizes.snake.width);
        gameState.snakePos.y = Math.random() * (boardHeight - entitySizes.snake.height);
    }, 50);
}

// Handle rooster being shot
function handleRoosterShot() {
    // Add points for hitting the rooster
    const basePoints = 8;
    gameState.levelScore += basePoints;
    gameState.totalScore += basePoints;
    
    // Show floating text
    showFloatingText(`+${basePoints}`, gameState.roosterPos.x, gameState.roosterPos.y, '#FF5555');
    
    // Play enemy hit sound
    playSound('enemyHit');
    
    // Remove the rooster
    gameState.roosterPos.x = -100;
    gameState.roosterPos.y = -100;
    gameState.isRoosterActive = false;
}

// Handle weasel being shot
function handleWeaselShot(weaselIndex, weaselPos) {
    // Add points for hitting the weasel
    const basePoints = 10;
    gameState.levelScore += basePoints;
    gameState.totalScore += basePoints;
    
    // Show floating text
    showFloatingText(`+${basePoints}`, weaselPos.x, weaselPos.y, '#FF5555');
    
    // Play enemy hit sound
    playSound('enemyHit');
    
    // Remove the weasel
    gameState.weasels.splice(weaselIndex, 1);
    
    // Update weasel active state
    gameState.isWeaselActive = gameState.weasels.length > 0;
}

export {
    shootBullet,
    updateBullets,
    handleSnakeShot,
    handleRoosterShot,
    handleWeaselShot
}; 