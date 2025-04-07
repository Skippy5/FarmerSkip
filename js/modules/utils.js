// Utils module
// General utility functions that can be used across modules

// Get a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get a random position within bounds
function getRandomPosition(width, height, entityWidth, entityHeight) {
    return {
        x: Math.floor(Math.random() * (width - entityWidth)),
        y: Math.floor(Math.random() * (height - entityHeight))
    };
}

// Normalize a vector
function normalizeVector(x, y) {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) return { x: 0, y: 0 };
    
    return {
        x: x / length,
        y: y / length
    };
}

// Calculate distance between two points
function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Handle loading dynamic modules to avoid circular dependencies
async function loadModule(modulePath) {
    try {
        return await import(modulePath);
    } catch (error) {
        console.error(`Error loading module ${modulePath}:`, error);
        throw error;
    }
}

export {
    getRandomNumber,
    getRandomPosition,
    normalizeVector,
    getDistance,
    clamp,
    loadModule
}; 