// Audio module
// Handles game audio and sound effects (currently disabled)

// Sound variables
let sounds = {};
let soundsLoaded = false;

// Set up game sounds (disabled)
function setupSounds() {
    // Sound loading is disabled
    console.log("Sounds are currently disabled");
    
    // Mark as loaded to prevent repeated loading attempts
    soundsLoaded = true;
}

// Play a sound by name (disabled)
function playSound(soundName) {
    // Sound playing is disabled
    // console.log(`Sound "${soundName}" would play here (currently disabled)`);
    return;
}

export { setupSounds, playSound }; 