# Farmer Skip's Eggcellent Adventure

A fun browser-based game where you help Farmer Skip collect eggs while avoiding obstacles and enemies.

## Project Structure

The code is organized using ES6 modules to separate concerns:

```
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── js/                 # JavaScript files
│   ├── main.js         # Entry point
│   └── modules/        # Game modules
│       ├── audio.js    # Sound handling
│       ├── board.js    # Game board creation and management
│       ├── collision.js # Collision detection and handling
│       ├── dom.js      # DOM manipulation
│       ├── enemies.js  # Enemy behavior (snake, rooster, weasel)
│       ├── entities.js # Entity movement and positioning
│       ├── game.js     # Core game state and setup
│       ├── gameLoop.js # Game loops and intervals
│       ├── input.js    # Input handling (keyboard, mouse)
│       ├── powerups.js # Power-up handling
│       ├── ui.js       # UI screens and messages
│       ├── utils.js    # Utility functions
│       └── weapons.js  # Shooting and bullet handling
```

## How to Play

Because this game uses ES6 modules, it needs to be served from a web server rather than opened directly from the filesystem.

### Quick Start Options

1. **Using Python's built-in HTTP server** (recommended):
   ```
   python -m http.server
   ```
   Then open your browser to: http://localhost:8000

2. **Using VS Code Live Server**:
   - Install the Live Server extension
   - Right-click on index.html
   - Select "Open with Live Server"

3. **Using Node.js** (if installed):
   ```
   npm install
   npm start
   ```
   Then open your browser to: http://localhost:8080

## Game Controls

- **Movement**: Arrow keys or WASD
- **Shoot**: Click where you want to shoot
- **Start Game**: Click the "Start Game" button
- **Continue to Next Level**: Click the "Continue" button
- **Play Again**: Click the "Play Again" button after game over

## Game Objectives

- Collect the required number of eggs to advance to the next level
- Prevent the snake from collecting too many eggs
- Avoid obstacles and enemies
- Collect power-ups to gain advantages

## Egg Types

- 🥚 **Normal Egg**: 1 point
- 🥚 **Golden Egg**: 3 points (gold colored)
- 🥚 **Special Egg**: 5 points (pink colored)

## Power-up Types

- ⚡ **Speed**: Temporarily increases Farmer Skip's movement speed
- 🛡️ **Shield**: Temporary protection from the snake
- 🧲 **Magnet**: Attracts nearby eggs to Farmer Skip
- ❄️ **Freeze**: Temporarily freezes the snake

## Tips

- Collect eggs quickly for combo points
- Shoot at enemies to disable them temporarily
- Watch out for the rooster in later levels
- Weasels can steal chickens, protect them with bullets

## Troubleshooting

If you see errors related to modules not loading, make sure you're accessing the game through a web server and not directly from your filesystem.

For more detailed instructions, see [how-to-run.html](how-to-run.html).

## Features

- Multiple levels with increasing difficulty
- Different egg types with varying point values
- Power-ups to enhance gameplay
- Various enemies (snake, rooster, weasel)
- Combo system for consecutive egg collection
- Shooting mechanics to defend against enemies

## Credits

- Game developed by [Your Name]
- Emoji-based graphics
- Sound effects from mixkit.co 

## Deploying to GitHub Pages

To deploy this game to GitHub Pages:

1. Push your code to a GitHub repository
2. Go to the repository Settings
3. Navigate to Pages section in the left sidebar
4. Under "Source", select "GitHub Actions"
5. GitHub will use the workflow file in `.github/workflows/deploy.yml` to deploy your site
6. The site will be available at `https://yourusername.github.io/repository-name/`

Note: If you encounter any issues with the game running on GitHub Pages:
- Make sure all file paths are correct (case-sensitive)
- Ensure all resources are loaded over HTTPS
- Check browser console for any errors 