// Game constants
const PLAYER_SIZE = 32;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_SPEED = 5;

const BULLET_SIZE = 8;
const BULLET_SPEED = 10;
const BULLET_DAMAGE = 10;
const BULLET_COOLDOWN = 250; // ms

const WEINER_SIZE = 72;
const WEINER_SPEED = 3;
const SPERMIDIN_PER_WEINER = 10;
const WEINER_SPAWN_INTERVAL = 2000; // ms

const BRAIN_SIZE = 48;
const BRAIN_SPEED = 2;
const BRAIN_DAMAGE = 15;
const BRAIN_SPAWN_INTERVAL = 3000; // ms
const BRAIN_HEALTH = 30; // Basic brain health
const BRAIN_TOUGH_HEALTH = 60; // Tough brain health (can take 2 shots)
const BRAIN_TOUGH_CHANCE = 0.35; // 35% chance for a tough brain
const BRAIN_PROJECTILE_SIZE = 20; // Increased from 16
const BRAIN_PROJECTILE_SPEED = 6;
const BRAIN_PROJECTILE_DAMAGE = 15; // Increased from 10
const BRAIN_ATTACK_INTERVAL = 2000; // ms

const BOSS_MAX_HEALTH = 200;
const BOSS_SPEED = 3;
const BOSS_COLLISION_DAMAGE = 20;
const BOSS_PROJECTILE_SIZE = 16;
const BOSS_PROJECTILE_SPEED = 5;
const BOSS_PROJECTILE_DAMAGE = 15;
const BOSS_ATTACK_INTERVAL = 1000; // ms

const BOSS_SPAWN_THRESHOLD = 100; // Spermidin needed to spawn boss
const JOYSTICK_RADIUS = 50;

// Add new constants for boss exploding bombs
const BOSS_BOMB_SIZE = 24;
const BOSS_BOMB_SPEED = 4;
const BOSS_BOMB_DAMAGE = 25;
const BOSS_BOMB_EXPLOSION_RADIUS = 100;
const BOSS_BOMB_INTERVAL = 5000; // ms - Time between bomb attacks

// Game variables
let gameCanvas = null;
let ctx = null;
let gameState = null;
let lastFrameTime = 0;
let frameCount = 0; // Add frameCount variable for animations

// Make gameState globally accessible for Safari compatibility
window.gameState = gameState;

// Screen elements
let gameScreen, victoryScreen, gameOverScreen;

// Sprite assets
let playerSprite, weinerSprite, brainSprite, bulletSprite;
let brainProjectileSprite, bossSprite, bossProjectileSprite;

// UI elements
let healthBar, spermidinBar, bossHealthBar;
let healthBarContainer, spermidinBarContainer, bossHealthContainer;
let startButton, retryButton, playAgainButton;

// Game assets
let assets = {
    player: null,
    weiner: null,
    brain: null,
    boss: null,
    background: null,
    sleepAnimation: null,
    bullet: null,
    brainProjectile: null,
    bossProjectile: null,
    spermidin: null
};

// Global game objects

let sprites = {
    player: null,
    weiner: null,
    brain: null,
    projectile: null,
    brainProjectile: null,
    boss: null,
    bossProjectile: null,
    spermidin: null
};

// Global function to start the game that can be called from HTML
window.startGame = function(event) {
    // Always prevent default to avoid double-firing on mobile
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Start game triggered by event type:", event.type);
    }
    
    console.log("startGame global function called");
    
    // Hide intro screen, show game screen
    const introScreen = document.getElementById('intro-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (introScreen) {
        console.log("Hiding intro screen");
        introScreen.style.display = 'none';
    } else {
        console.error("Intro screen element not found!");
    }
    
    if (gameScreen) {
        console.log("Showing game screen");
        gameScreen.style.display = 'block';
    } else {
        console.error("Game screen element not found!");
    }
    
    // Make sure health bar and spermidin containers are visible
    const healthBarContainer = document.getElementById('health-bar-container');
    const spermidinContainer = document.getElementById('spermidin-container');
    
    if (healthBarContainer) {
        console.log("Showing health bar container");
        healthBarContainer.style.display = 'block';
    } else {
        console.warn("Health bar container not found");
    }
    
    if (spermidinContainer) {
        console.log("Showing spermidin container");
        spermidinContainer.style.display = 'block';
    } else {
        console.warn("Spermidin container not found");
    }
    
    // Start the game (this ensures gameState.gameActive is set to true)
    console.log("Calling startGameFixed");
    startGameFixed();
    
    // Extra safety check - make sure game is active
    if (gameState && !gameState.gameActive) {
        console.log("Game not active after startGameFixed, forcing activation");
        gameState.gameActive = true;
        
        // Force spawn of weiners and brains if needed
        if (gameState.weiners && gameState.weiners.length === 0) {
            console.log("No weiners, spawning...");
            spawnWeiners(5);
        }
        
        if (gameState.brains && gameState.brains.length === 0) {
            console.log("No brains, spawning...");
            spawnBrains(3);
        }
    }
    
    // Debug info
    console.log("Game active state:", gameState ? gameState.gameActive : "gameState undefined");
    console.log("Sprites loaded:", gameState && gameState.sprites ? "Yes" : "No");
    console.log("Mobile device:", gameState && gameState.isMobile ? "Yes" : "No");
};

// Function to verify and debug loaded assets
function displayAssetsDebug() {
    // Create a debug asset display area
    const debugAssetDisplay = document.getElementById('asset-debug-display');
    if (!debugAssetDisplay) {
        const display = document.createElement('div');
        display.id = 'asset-debug-display';
        display.style.position = 'fixed';
        display.style.top = '10px';
        display.style.left = '10px';
        display.style.backgroundColor = 'rgba(0,0,0,0.8)';
        display.style.padding = '10px';
        display.style.color = 'white';
        display.style.fontFamily = 'monospace';
        display.style.fontSize = '12px';
        display.style.zIndex = '1000';
        display.style.borderRadius = '5px';
        display.style.maxWidth = '300px';
        display.style.maxHeight = '80vh';
        display.style.overflow = 'auto';
        
        document.body.appendChild(display);
    }
    
    // Update the display with current asset information
    const updateAssetDisplay = () => {
        const display = document.getElementById('asset-debug-display');
        if (!display) return;
        
        let html = '<h3>🖼️ Asset Debug Info</h3>';
        html += '<p>Make sure to check browser console for additional information.</p>';
        
        // Add toggle button
        html += '<button id="toggle-asset-display" style="margin-bottom:10px;padding:5px;">Toggle Images</button>';
        
        // Asset status section
        html += '<div style="margin-bottom:10px;"><strong>Asset Status:</strong></div>';
        
        // Check if we have sprites
        const hasSprites = gameState && gameState.sprites;
        html += `<div>Sprites Object: ${hasSprites ? '✅' : '❌'}</div>`;
        
        if (hasSprites) {
            const sprites = gameState.sprites;
            
            // Check each sprite
            const spriteInfo = [
                { name: 'Player', sprite: sprites.player },
                { name: 'Weiner', sprite: sprites.weiner },
                { name: 'Brain', sprite: sprites.brain },
                { name: 'Projectile', sprite: sprites.projectile },
                { name: 'Brain Projectile', sprite: sprites.brainProjectile },
                { name: 'Boss', sprite: sprites.boss },
                { name: 'Boss Projectile', sprite: sprites.bossProjectile }
            ];
            
            spriteInfo.forEach(info => {
                const hasSprite = !!info.sprite;
                html += `<div>${info.name} Sprite: ${hasSprite ? '✅' : '❌'}`;
                
                if (hasSprite) {
                    const sprite = info.sprite;
                    html += ` (${sprite.width}x${sprite.height})`;
                    html += `<div class="sprite-preview" style="display:none;margin:5px;padding:5px;background-color:white;">`;
                    html += `<img src="${sprite.toDataURL()}" style="border:1px solid #333;"/>`;
                    html += `</div>`;
                }
                
                html += `</div>`;
            });
        }
        
        // PNG loading attempts
        html += '<div style="margin-top:10px;"><strong>PNG Loading Attempts:</strong></div>';
        html += '<div>(Check browser console for more details)</div>';
        
        // Add instructions for loading PNGs
        html += '<div style="margin-top:10px;"><strong>PNG Troubleshooting:</strong></div>';
        html += '<ol>';
        html += '<li>Make sure assets/sprites/ directory exists</li>';
        html += '<li>Check hotdog.png and brain.png are in that directory</li>';
        html += '<li>Images should be non-zero size and valid PNG format</li>';
        html += '<li>Try reloading the page with browser cache disabled</li>';
        html += '<li>Firefox/Chrome: Press Ctrl+Shift+R to force reload</li>';
        html += '<li>Open browser dev tools to check for loading errors</li>';
        html += '</ol>';
        
        display.innerHTML = html;
        
        // Add event listener to toggle button
        const toggleButton = document.getElementById('toggle-asset-display');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const previews = document.querySelectorAll('.sprite-preview');
                previews.forEach(p => {
                    p.style.display = p.style.display === 'none' ? 'block' : 'none';
                });
            });
        }
    };
    
    // Update asset display immediately and periodically
    updateAssetDisplay();
    setInterval(updateAssetDisplay, 2000);
}

// Initialize the game
function init() {
    try {
        console.log("Game initialization started");
        
        // Get canvas
        gameCanvas = document.getElementById('game-canvas');
        
        if (!gameCanvas) {
            console.error("Game canvas not found");
            return;
        }
        
        // Set up canvas context
        ctx = gameCanvas.getContext('2d');
        
        if (!ctx) {
            console.error("Could not get 2D context");
            return;
        }
        
        // Initial canvas size
        resizeCanvas();
        
        // Initialize game state
        gameState = {
            gameActive: false,
            isPaused: false,
            initialized: false,
            score: 0,
            level: 1,
            lastSpawnTime: 0,
            lastBossSpawnTime: 0,
            bossSpawned: false,
            keyboardControls: true,
            keys: {
                up: false,
                down: false,
                left: false,
                right: false,
                shoot: false
            },
            shootButton: {
                active: false
            },
            player: {
                x: gameCanvas.width / 2 - PLAYER_SIZE / 2,
                y: gameCanvas.height * 0.75 - PLAYER_SIZE,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                health: PLAYER_MAX_HEALTH,
                spermidin: 0,
                shootCooldown: 0,
                lastShot: 0,
                direction: { x: 0, y: -1 }
            },
            bullets: [],
            weiners: [],
            brains: [],
            brainProjectiles: [],
            bossProjectiles: [],
            boss: null,
            bossActive: false,
            lastWeinerSpawn: 0,
            lastBrainSpawn: 0,
            lastBossAttack: 0,
            sprites: null,
            joystick: {
                active: false,
                baseX: 0,
                baseY: 0,
                deltaX: 0,
                deltaY: 0
            },
            isMobile: isMobileDevice()
        };
        
        // Make gameState globally accessible for Safari compatibility
        window.gameState = gameState;
        
        // Remove debug displays if they exist
        const debugAssetDisplay = document.getElementById('asset-debug-display');
        if (debugAssetDisplay) {
            debugAssetDisplay.remove();
        }
        
        // Ensure game story element exists
        ensureGameStoryElementExists();
        
        // Reset game state
        resetGame();
        
        // Set up shoot button
        setupShootButton();
        
        // Set up start button
        setupStartButton();
        
        // Set up restart button
        setupRestartButton();
        
        // Set up intro text immediately
        typeIntroText("Tim has insomnia. By swallowing weiners he gets spermidin helping him sleep.");
        
        // Load all game assets
        console.log("Starting to load game assets...");
        Promise.all([
            createPlayerSprite(),
            createWeinerSprite(),
            createBrainSprite(),
            createProjectileSprite(),
            createBrainProjectileSprite(),
            createBossSprite(),
            createBossProjectileSprite(),
            createSpermidinSprite()
        ]).then(([playerSprite, weinerSprite, brainSprite, projectileSprite, brainProjectileSprite, bossSprite, bossProjectileSprite, spermidinSprite]) => {
            console.log("All sprites loaded successfully");
            
            // Store sprites
            gameState.sprites = {
                player: playerSprite,
                weiner: weinerSprite,
                brain: brainSprite,
                projectile: projectileSprite,
                brainProjectile: brainProjectileSprite,
                boss: bossSprite,
                bossProjectile: bossProjectileSprite,
                spermidin: spermidinSprite
            };
            
            console.log("Sprites stored in gameState", gameState.sprites);
            
            // Resize canvas to fit window
            resizeCanvas();
            console.log("Canvas resized", gameCanvas.width, gameCanvas.height);
            
            // Always set up mobile controls if device has touch capability
            if (gameState.isMobile) {
                console.log("Mobile device detected, setting up mobile controls");
                
                // Show touch controls
                const keyboardControls = document.getElementById('keyboard-controls');
                if (keyboardControls) {
                    keyboardControls.style.display = 'none';
                }
                
                // Show controls container
                const controls = document.getElementById('controls');
                if (controls) {
                    controls.style.display = 'flex';
                    controls.style.visibility = 'visible';
                    controls.style.opacity = '1';
                }
                
                // Setup mobile controls (now includes overlay joystick)
                setupMobileControls();
                setupShootButton();
            } else {
                // Just for testing on desktop, also set up button
                console.log("Desktop device detected, setting up keyboard controls and buttons for testing");
                setupShootButton();
                // Initialize overlay joystick for desktop testing too
                setupOverlayJoystick();
            }
            
            // Set up event listeners for keyboard controls
            setupKeyboardControls();
            
            // Set up start button
            setupStartButton();
            
            // Set up restart button
            setupRestartButton();
            
            console.log("Controls and buttons set up");
            
            // Set player position
            console.log("Player position before game loop:", gameState.player.x, gameState.player.y);
            gameState.player.x = gameCanvas.width / 2 - gameState.player.width / 2;
            // Position Tim about a quarter of the way up from the bottom for better visibility in Safari
            gameState.player.y = gameCanvas.height * 0.75 - gameState.player.height;
            console.log("Player position after adjustment:", gameState.player.x, gameState.player.y);
            
            // Add event listener for window resize
            window.addEventListener('resize', function() {
                resizeCanvas();
                
                // Adjust player position after resize
                gameState.player.x = Math.min(gameState.player.x, gameCanvas.width - gameState.player.width);
                gameState.player.y = Math.min(gameState.player.y, gameCanvas.height - gameState.player.height);
                
                console.log("Canvas resized, new dimensions:", gameCanvas.width, "x", gameCanvas.height);
            });
            
            console.log("Game initialized successfully");
            gameState.initialized = true;
            
            // Set global flag that game is initialized (for Safari compatibility)
            window.gameInitialized = true;
            
            // Start the game loop
            requestAnimationFrame(gameLoop);
        }).catch(error => {
            console.error("Error loading game assets:", error);
        });
    } catch (e) {
        console.error("Error initializing game:", e);
    }
}

// Make init function globally accessible
window.init = init;

// New helper function to ensure game story element exists
function ensureGameStoryElementExists() {
    if (!document.getElementById('game-story')) {
        console.log("Creating game story element during initialization");
        const gameScreen = document.getElementById('game-screen');
        
        if (!gameScreen) {
            console.error("Game screen not found, can't create game story element");
            return;
        }
        
        // Create a new game story element
        const newGameStory = document.createElement('div');
        newGameStory.id = 'game-story';
        newGameStory.style.position = 'absolute';
        newGameStory.style.top = '50%';
        newGameStory.style.left = '50%';
        newGameStory.style.transform = 'translate(-50%, -50%)';
        newGameStory.style.zIndex = '10';
        newGameStory.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        newGameStory.style.padding = '20px';
        newGameStory.style.borderRadius = '8px';
        newGameStory.style.border = '3px solid #ffcc00';
        newGameStory.style.maxWidth = '80%';
        newGameStory.style.fontSize = '1.2rem';
        newGameStory.style.color = '#ffffff';
        newGameStory.style.textAlign = 'center';
        newGameStory.style.display = 'none'; // Initially hidden
        newGameStory.style.lineHeight = '1.5';
        newGameStory.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.6)';
        
        // Add it to the game screen
        gameScreen.appendChild(newGameStory);
        console.log("Game story element created");
    }
}

// Setup start button
function setupStartButton() {
    const startButton = document.getElementById('start-button');
    
    if (startButton) {
        startButton.addEventListener('click', startGame);
        startButton.disabled = false;
        startButton.textContent = "START";
        
        startButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startGame();
        }, false);
    }
}

// Setup keyboard controls for desktop
function setupKeyboardControls() {
    // Don't set keyboardControls to true, allow both types of controls simultaneously
    // Initialize key state if needed
    if (!gameState.keys) {
        gameState.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false
        };
    }
    
    // Key down event
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                gameState.keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                gameState.keys.down = true;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                gameState.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                gameState.keys.right = true;
                break;
            case ' ':
                gameState.keys.shoot = true;
                break;
        }
    });
    
    // Key up event
    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                gameState.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                gameState.keys.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                gameState.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                gameState.keys.right = false;
                break;
            case ' ':
                gameState.keys.shoot = false;
                break;
        }
    });
    
    console.log("Keyboard controls initialized - can be used alongside joystick");
}

// Setup mobile controls
function setupMobileControls() {
    console.log("Setting up mobile controls using overlay joystick");
    // Don't set keyboardControls to false, allow both types of controls
    
    // Get shoot button element
    const shootButton = document.getElementById('shoot-button');
    
    if (!shootButton) {
        console.error('Shoot button element not found');
        return;
    }
    
    // Initialize the overlay joystick immediately
    setupOverlayJoystick();
    
    // Initialize shoot button state if needed
    if (!gameState.shootButton) {
        gameState.shootButton = {
            active: false
        };
    }
    
    // Shoot button touch events
    shootButton.addEventListener('touchstart', function(event) {
        event.preventDefault();
        gameState.keys.shoot = true;
        gameState.shootButton.active = true;
        shootButton.classList.add('active');
        // Force immediate shot when button is pressed
        if (Date.now() - gameState.player.lastShot > BULLET_COOLDOWN) {
            shootBullet();
            gameState.player.lastShot = Date.now();
        }
    }, {passive: false});
    
    shootButton.addEventListener('touchend', function(event) {
        event.preventDefault();
        gameState.keys.shoot = false;
        gameState.shootButton.active = false;
        shootButton.classList.remove('active');
    }, {passive: false});
    
    console.log("Mobile controls setup complete - can be used alongside keyboard");
}

// Create Tim (player) sprite with improved pixel art style
function createPlayerSprite() {
    try {
        console.log("Creating player sprite");
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            console.error("Could not get canvas context for player sprite");
            // Return a simple colored rectangle as fallback
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = 32;
            fallbackCanvas.height = 32;
            const fbCtx = fallbackCanvas.getContext('2d');
            fbCtx.fillStyle = 'blue';
            fbCtx.fillRect(0, 0, 32, 32);
            return fallbackCanvas;
        }
        
        // Make pixel style explicit
        ctx.imageSmoothingEnabled = false;
        
        // Enhanced Tim with Nintendo DS-style pixel art
        
        // Base body outline (dark)
        ctx.fillStyle = '#000000';
        ctx.fillRect(12, 10, 24, 40);
        ctx.fillRect(16, 50, 16, 10);
        
        // Head 
        ctx.fillStyle = '#ffccaa'; // Skin tone
        ctx.fillRect(14, 12, 20, 16); // Head shape
        
        // Hair (brown)
        ctx.fillStyle = '#553311';
        ctx.fillRect(14, 12, 20, 5); // Hair top
        ctx.fillRect(12, 14, 4, 10); // Left side hair
        ctx.fillRect(32, 14, 4, 10); // Right side hair
        
        // Eyebrows
        ctx.fillStyle = '#442200';
        ctx.fillRect(16, 20, 6, 2); // Left eyebrow
        ctx.fillRect(26, 20, 6, 2); // Right eyebrow
        
        // Eyes (tired/sleepy)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(18, 22, 4, 4); // Left eye
        ctx.fillRect(26, 22, 4, 4); // Right eye
        
        // Eye bags (indicating insomnia)
        ctx.fillStyle = '#ccaa99';
        ctx.fillRect(17, 26, 6, 2); // Left eye bag
        ctx.fillRect(25, 26, 6, 2); // Right eye bag
        
        // Pupils
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(19, 23, 2, 2); // Left pupil
        ctx.fillRect(27, 23, 2, 2); // Right pupil
        
        // Mouth (sleepy/tired expression)
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 30, 4, 1);
        
        // Torso with pajamas
        ctx.fillStyle = '#2244aa'; // Blue pajamas
        ctx.fillRect(14, 28, 20, 22); // Torso
        
        // Pajama pattern (stripes)
        ctx.fillStyle = '#3366cc';
        for (let i = 30; i < 50; i += 4) {
            ctx.fillRect(14, i, 20, 2); // Horizontal stripes
        }
        
        // Arms
        ctx.fillStyle = '#2244aa'; // Same as pajamas
        ctx.fillRect(10, 28, 4, 16); // Left arm
        ctx.fillRect(34, 28, 4, 16); // Right arm
        
        // Hands
        ctx.fillStyle = '#ffccaa'; // Skin tone
        ctx.fillRect(10, 44, 4, 4); // Left hand
        ctx.fillRect(34, 44, 4, 4); // Right hand
        
        // Legs
        ctx.fillStyle = '#2244aa'; // Same as pajamas
        ctx.fillRect(16, 50, 6, 10); // Left leg
        ctx.fillRect(26, 50, 6, 10); // Right leg
        
        // Feet (slippers)
        ctx.fillStyle = '#aa4422'; // Brown slippers
        ctx.fillRect(14, 60, 8, 4); // Left slipper
        ctx.fillRect(26, 60, 8, 4); // Right slipper
        
        // Shine detail on slippers
        ctx.fillStyle = '#cc6633';
        ctx.fillRect(16, 60, 4, 2); // Left shine
        ctx.fillRect(28, 60, 4, 2); // Right shine
        
        console.log("Player sprite created successfully");
        return canvas;
    } catch (e) {
        console.error("Error creating player sprite:", e);
        // Return a simple colored rectangle as fallback
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 32;
        fallbackCanvas.height = 32;
        const fbCtx = fallbackCanvas.getContext('2d');
        fbCtx.fillStyle = 'red';
        fbCtx.fillRect(0, 0, 32, 32);
        return fallbackCanvas;
    }
}

// Debug image loading function to determine what's happening with the PNG files
function debugLoadImage(url, fallbackDrawFn) {
    return new Promise((resolve) => {
        console.log(`Attempting to load image from ${url}`);
        
        const startTime = Date.now();
        const img = new Image();
        
        // Set crossOrigin to anonymous to avoid CORS issues
        img.crossOrigin = "anonymous";
        
        // Create a canvas for the result
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = function() {
            console.log(`Image ${url} loaded successfully after ${Date.now() - startTime}ms`);
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            resolve(canvas);
        };
        
        img.onerror = function() {
            console.warn(`Failed to load image from ${url} after ${Date.now() - startTime}ms. Using fallback.`);
            
            // Use fallback drawing function if provided
            if (typeof fallbackDrawFn === 'function') {
                console.log("Using fallback drawing function");
                resolve(fallbackDrawFn());
            } else {
                console.error("No fallback provided for failed image load!");
                
                // Create an empty canvas as fallback
                canvas.width = 32;
                canvas.height = 32;
                ctx.fillStyle = '#FF00FF'; // Magenta error indicator
                ctx.fillRect(0, 0, 32, 32);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, 32, 32);
                ctx.fillStyle = '#000000';
                ctx.font = '24px Arial';
                ctx.fillText('?', 10, 24);
                
                resolve(canvas);
            }
        };
        
        // Set the source to trigger loading
        img.src = url;
    });
}

// Create a weiner/hotdog sprite with optimized drawing
function createWeinerSprite() {
    console.log("Creating simple hotdog sprite");
    
    const canvas = document.createElement('canvas');
    canvas.width = 72;
    canvas.height = 77;
    const ctx = canvas.getContext('2d');
    
    // Disable anti-aliasing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple hotdog
    
    // Sausage body (draw first as it's larger and buns will overlap)
    ctx.fillStyle = '#C65E37'; // Sausage color
    ctx.fillRect(5, 25, 62, 27); // Sausage in the middle
    
    // Sausage highlights
    ctx.fillStyle = '#E27242'; // Lighter sausage color
    ctx.fillRect(10, 30, 52, 17); // Sausage highlight
    
    // Bun (bottom) - smaller and with rounded corners
    ctx.fillStyle = '#D4A048'; // Bread color
    if (typeof ctx.roundRect === 'function') {
        // Use roundRect if supported
        ctx.beginPath();
        ctx.roundRect(15, 45, 42, 20, [0, 0, 10, 10]); // Bottom bun with rounded corners
        ctx.fill();
    } else {
        // Fallback to regular rect if roundRect not supported
        ctx.fillRect(15, 45, 42, 20);
    }
    
    // Bun (top) - smaller and with rounded corners
    ctx.fillStyle = '#D4A048'; // Bread color
    if (typeof ctx.roundRect === 'function') {
        // Use roundRect if supported
        ctx.beginPath();
        ctx.roundRect(15, 12, 42, 20, [10, 10, 0, 0]); // Top bun with rounded corners
        ctx.fill();
    } else {
        // Fallback to regular rect if roundRect not supported
        ctx.fillRect(15, 12, 42, 20);
    }
    
    // Bun highlights
    ctx.fillStyle = '#E8B152'; // Lighter bread highlight
    if (typeof ctx.roundRect === 'function') {
        // Use roundRect if supported
        ctx.beginPath();
        ctx.roundRect(18, 15, 36, 14, [8, 8, 0, 0]); // Top bun highlight
        ctx.fill();
        
        ctx.beginPath();
        ctx.roundRect(18, 48, 36, 14, [0, 0, 8, 8]); // Bottom bun highlight
        ctx.fill();
    } else {
        // Fallback to regular rect if roundRect not supported
        ctx.fillRect(18, 15, 36, 14);
        ctx.fillRect(18, 48, 36, 14);
    }
    
    // Ketchup on top
    ctx.fillStyle = '#C92F15'; // Ketchup color
    ctx.fillRect(15, 25, 20, 8); // Ketchup blob
    
    // Mustard on top
    ctx.fillStyle = '#E6C223'; // Mustard color
    ctx.fillRect(40, 25, 20, 8); // Mustard blob
    
    // Add eyes for character
    ctx.fillStyle = '#FFFFFF'; // White
    ctx.fillRect(25, 35, 8, 8); // Left eye
    ctx.fillRect(40, 35, 8, 8); // Right eye
    
    // Pupils
    ctx.fillStyle = '#000000'; // Black
    ctx.fillRect(28, 38, 3, 3); // Left pupil
    ctx.fillRect(43, 38, 3, 3); // Right pupil
    
    // Smile
    ctx.fillStyle = '#000000'; // Black
    ctx.beginPath();
    ctx.arc(36, 45, 10, 0.1, Math.PI - 0.1, false);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    console.log("Simple hotdog sprite created with width=" + canvas.width + ", height=" + canvas.height);
    return Promise.resolve(canvas);
}

// Create a brain sprite with optimized region-based drawing
function createBrainSprite() {
    console.log("Creating optimized brain sprite");
    
    // Set brain dimensions - increased size
    const width = 48;
    const height = 48;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Disable anti-aliasing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Draw enhanced brain with region-based drawing
    
    // Main outline
    ctx.fillStyle = '#C6467B'; // Dark pink outline
    ctx.fillRect(12, 9, 24, 3);   // Top outline
    ctx.fillRect(9, 12, 3, 24);   // Left outline
    ctx.fillRect(36, 12, 3, 24);  // Right outline
    ctx.fillRect(12, 36, 24, 3);  // Bottom outline
    
    // Main brain mass (light pink)
    ctx.fillStyle = '#FFA7C4'; // Light pink
    ctx.fillRect(12, 12, 24, 24); // Brain body
    
    // Brain lobes (medium pink)
    ctx.fillStyle = '#FF69B4'; // Medium pink
    ctx.fillRect(12, 12, 12, 12);  // Top left lobe
    ctx.fillRect(24, 12, 12, 12);  // Top right lobe
    ctx.fillRect(12, 24, 12, 12);  // Bottom left lobe
    ctx.fillRect(24, 24, 12, 12);  // Bottom right lobe
    
    // Brain folds (darker pink details)
    ctx.fillStyle = '#E34C88'; // Darker pink for the folds
    ctx.fillRect(18, 12, 3, 24);  // Vertical fold down middle
    ctx.fillRect(12, 21, 24, 3);  // Horizontal fold across middle
    
    // Highlights (lighter pink)
    ctx.fillStyle = '#FFB7D4'; // Lighter pink highlights
    ctx.fillRect(15, 15, 4, 4);   // Top left highlight
    ctx.fillRect(29, 15, 4, 4);   // Top right highlight
    ctx.fillRect(15, 29, 4, 4);   // Bottom left highlight
    ctx.fillRect(29, 29, 4, 4);   // Bottom right highlight
    
    // Add evil eyes
    // Left eye
    ctx.fillStyle = '#FFFFFF'; // White eye background
    ctx.fillRect(15, 18, 6, 6);   // Left eye white
    ctx.fillStyle = '#000000'; // Black pupil
    ctx.fillRect(17, 20, 3, 3);   // Left pupil
    
    // Right eye
    ctx.fillStyle = '#FFFFFF'; // White eye background
    ctx.fillRect(27, 18, 6, 6);   // Right eye white
    ctx.fillStyle = '#000000'; // Black pupil
    ctx.fillRect(29, 20, 3, 3);   // Right pupil
    
    // Angry eyebrows
    ctx.fillStyle = '#C6467B'; // Dark pink eyebrows
    ctx.fillRect(14, 15, 9, 2);    // Left eyebrow
    ctx.fillRect(26, 15, 9, 2);    // Right eyebrow
    
    console.log("Enhanced brain sprite created with width=" + width + ", height=" + height);
    return Promise.resolve(canvas);
}

// Create a projectile sprite with optimized drawing
function createProjectileSprite() {
    console.log("Creating optimized projectile sprite");
    
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    
    // Disable anti-aliasing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Create a shiny, glowing bullet
    
    // Outer glow
    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(4, 4, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Main bullet body
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    ctx.fillStyle = '#FFFFFF'; // White
    ctx.beginPath();
    ctx.arc(4, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    console.log("Projectile sprite created");
    return Promise.resolve(canvas);
}

// Create a brain projectile with optimized drawing
function createBrainProjectileSprite() {
    console.log("Creating optimized brain projectile sprite");
    
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    // Disable anti-aliasing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Create a brain matter projectile
    
    // Outer glow effect
    ctx.fillStyle = 'rgba(255, 105, 180, 0.4)';
    ctx.beginPath();
    ctx.arc(8, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Brain matter - main body
    ctx.fillStyle = '#FF69B4'; // Hot pink
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Brain matter - inner structure
    ctx.fillStyle = '#FF1493'; // Deep pink
    ctx.fillRect(5, 5, 6, 6);
    
    // Brain fold lines - vertical and horizontal
    ctx.fillStyle = '#C71585'; // Medium violet red
    ctx.fillRect(8, 4, 1, 8); // Vertical fold
    ctx.fillRect(4, 8, 8, 1); // Horizontal fold
    
    // Highlights
    ctx.fillStyle = '#FFB7D4'; // Light pink highlight
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(10, 10, 2, 2);
    
    console.log("Brain projectile sprite created");
    return Promise.resolve(canvas);
}

// Typing animation for intro text
function typeIntroText(text) {
    // First, try to get intro text element (for the start screen)
    let textElement = document.getElementById('intro-text');
    
    // If we're in the game screen, try to get the game story element
    if (!textElement || textElement.style.display === 'none') {
        textElement = document.getElementById('game-story');
    }
    
    if (!textElement) {
        console.error("Text element not found for typing animation!");
        // Since we auto-create the game-story element now, this shouldn't happen
        // But just in case, let's try one more time after a short delay
        setTimeout(() => {
            textElement = document.getElementById('game-story');
            if (textElement) {
                console.log("Found game-story element after delay");
                animateText(textElement, text);
            }
        }, 100);
        return;
    }
    
    console.log("Setting up text animation for:", text, "on element:", textElement.id);
    animateText(textElement, text);
}

// Helper function to animate text with typing effect
function animateText(element, text) {
    element.style.display = 'block';
    element.innerHTML = ''; // Use innerHTML instead of textContent
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 30); // Typing speed
}

// Setup joystick controls for mobile - using the proven approach from the test page
function setupJoystick() {
    console.log("Setting up joystick with EXTREMELY basic implementation");
    
    // Get the DOM elements
    const joystickBase = document.getElementById('joystick-base');
    const joystickHandle = document.getElementById('joystick-handle');
    
    if (!joystickBase || !joystickHandle) {
        console.error("Joystick elements not found!");
        return;
    }
    
    console.log("Joystick elements found, setting up event listeners");
    
    // Force the joystick to be visible
    const container = document.getElementById('joystick-container');
    if (container) {
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.visibility = 'visible';
    }
    
    // Variables to track the joystick state
    let isDragging = false;
    
    // Remove any existing event listeners by replacing the elements
    const newBase = joystickBase.cloneNode(true);
    joystickBase.parentNode.replaceChild(newBase, joystickBase);
    
    const newHandle = joystickHandle.cloneNode(true);
    joystickHandle.parentNode.replaceChild(newHandle, joystickHandle);
    
    // Very simple touch start handler
    newBase.addEventListener('touchstart', function(e) {
        console.log("TOUCH START DETECTED");
        e.preventDefault();
        isDragging = true;
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }, false);
    
    // Global touch move handler
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        console.log("TOUCH MOVE", e.touches[0].clientX, e.touches[0].clientY);
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }, false);
    
    // Global touch end handler
    document.addEventListener('touchend', function() {
        console.log("TOUCH END");
        isDragging = false;
        resetJoystick();
    }, false);
    
    // Mouse handlers for testing on desktop
    newBase.addEventListener('mousedown', function(e) {
        console.log("MOUSE DOWN DETECTED");
        e.preventDefault();
        isDragging = true;
        updatePosition(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        console.log("MOUSE MOVE", e.clientX, e.clientY);
        updatePosition(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', function() {
        console.log("MOUSE UP");
        isDragging = false;
        resetJoystick();
    });
    
    // Update joystick position based on pointer coordinates
    function updatePosition(clientX, clientY) {
        // Get the joystick's base position and dimensions
        const rect = newBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;
        
        // Calculate distance from center
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        
        // Calculate the distance from center using Pythagorean theorem
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If the distance is greater than the joystick radius, limit it
        if (distance > radius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * radius;
            dy = Math.sin(angle) * radius;
        }
        
        // Move the joystick handle
        newHandle.style.transform = `translate(calc(${dx}px - 50%), calc(${dy}px - 50%))`;
        
        // Update game state with normalized values (between -1 and 1)
        gameState.joystick.deltaX = dx / radius;
        gameState.joystick.deltaY = dy / radius;
        gameState.joystick.active = true;
        
        console.log(`Joystick values: ${gameState.joystick.deltaX.toFixed(2)}, ${gameState.joystick.deltaY.toFixed(2)}`);
    }
    
    // Reset the joystick to the center position
    function resetJoystick() {
        newHandle.style.transform = 'translate(-50%, -50%)';
        gameState.joystick.deltaX = 0;
        gameState.joystick.deltaY = 0;
        gameState.joystick.active = false;
    }
    
    // Initial reset
    resetJoystick();
    
    console.log("Basic joystick setup complete");
}

// Setup shoot button for mobile
function setupShootButton() {
    console.log("Setting up shoot button with simplified implementation");
    const shootButton = document.getElementById('shoot-button');
    
    if (!shootButton) {
        console.error("Shoot button not found");
        return;
    }
    
    // Clean up any existing event listeners
    shootButton.replaceWith(shootButton.cloneNode(true));
    const newShootButton = document.getElementById('shoot-button');
    
    // Force button to be visible
    newShootButton.style.display = 'flex';
    newShootButton.style.pointerEvents = 'auto';
    
    // Direct bullet shooting function
    function fireBullet(e) {
        // Prevent default browser behaviors
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Set active visual state
        newShootButton.classList.add('active');
        
        // Update game state
        gameState.keys.shoot = true;
        gameState.shootButton.active = true;
        
        // Fire bullet immediately
        console.log("Shoot button pressed, firing bullet");
        shootBullet();
        
        return false;
    }
    
    // Reset function for when button is released
    function resetButton(e) {
        // Prevent default browser behaviors
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Reset visual state
        newShootButton.classList.remove('active');
        
        // Update game state
        gameState.keys.shoot = false;
        gameState.shootButton.active = false;
        
        return false;
    }
    
    // Add multiple event listeners to catch all possible events
    newShootButton.addEventListener('mousedown', fireBullet);
    newShootButton.addEventListener('touchstart', fireBullet, {passive: false});
    
    // Add release events to document to ensure they're caught
    document.addEventListener('mouseup', resetButton);
    document.addEventListener('touchend', function(e) {
        // Check if the touch ended on the shoot button
        const touch = e.changedTouches[0];
        const rect = newShootButton.getBoundingClientRect();
        
        if (gameState.shootButton.active) {
            resetButton(e);
        }
    }, {passive: false});
    
    console.log("Shoot button setup complete");
}

// Start the game (fixed version with better error handling)
function startGameFixed() {
    try {
        console.log("startGameFixed called");
        if (!gameState) {
            console.error("gameState is not initialized!");
            
            // Try to initialize game if it hasn't been yet
            if (typeof init === 'function') {
                console.log("Attempting to initialize game...");
                init();
            }
            
            return;
        }
        
        // Reset game if needed
        if (!gameState.player || !gameState.weiners || !gameState.brains) {
            console.log("Game state not properly initialized, resetting...");
            resetGame();
        }
        
        // Display the proper HUD elements
        const healthBarContainer = document.getElementById('health-bar-container');
        const spermidinContainer = document.getElementById('spermidin-container');
        
        if (healthBarContainer) {
            healthBarContainer.style.display = 'block';
        }
        
        if (spermidinContainer) {
            spermidinContainer.style.display = 'block';
        }
        
        // Clear any boss health bar
        const bossHealthContainer = document.getElementById('boss-health-container');
        if (bossHealthContainer) {
            bossHealthContainer.style.display = 'none';
        }
        
        // Set game active
        gameState.gameActive = true;
        window.gameState = gameState; // Update global reference
        console.log("Game is now active");
        
        // Initial spawn of weiners if none exist
        if (gameState.weiners.length === 0) {
            console.log("No weiners at game start, spawning initial batch");
            spawnWeiners(5);
        }
        
        // Initial spawn of brains if none exist
        if (gameState.brains.length === 0) {
            console.log("No brains at game start, spawning initial batch");
            spawnBrains(3);
        }
    } catch (e) {
        console.error("Error in startGameFixed:", e);
    }
}

// Make startGameFixed globally accessible for Safari compatibility
window.startGameFixed = startGameFixed;

// Reset the game
function resetGame() {
    try {
        console.log("resetGame called");
        
        // Clear any game story messages that might be showing
        const gameStory = document.getElementById('game-story');
        if (gameStory) {
            gameStory.innerHTML = '';
            gameStory.style.display = 'none';
        }
        
        // Make sure the canvas has dimensions
        if (!gameCanvas.width || !gameCanvas.height) {
            gameCanvas.width = window.innerWidth;
            gameCanvas.height = window.innerHeight;
            console.log("Set canvas dimensions:", gameCanvas.width, gameCanvas.height);
        }
        
        // Initialize game state
        gameState = {
            gameActive: false,
            isPaused: false,
            initialized: false,
            score: 0,
            level: 1,
            lastSpawnTime: 0,
            lastBossSpawnTime: 0,
            bossSpawned: false,
            keyboardControls: true,
            keys: {
                up: false,
                down: false,
                left: false,
                right: false,
                shoot: false
            },
            shootButton: {
                active: false
            },
            player: {
                x: gameCanvas.width / 2 - PLAYER_SIZE / 2,
                y: gameCanvas.height * 0.75 - PLAYER_SIZE,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                health: PLAYER_MAX_HEALTH,
                spermidin: 0,
                shootCooldown: 0,
                lastShot: 0,
                direction: { x: 0, y: -1 }
            },
            bullets: [],
            weiners: [],
            brains: [],
            brainProjectiles: [],
            bossProjectiles: [],
            boss: null,
            bossActive: false,
            lastWeinerSpawn: 0,
            lastBrainSpawn: 0,
            lastBossAttack: 0,
            sprites: gameState ? gameState.sprites : null
        };
        console.log("Game state initialized");
        console.log("Player position:", gameState.player.x, gameState.player.y);
        console.log("Canvas size:", gameCanvas.width, gameCanvas.height);
        
        // Update UI
        updateHealthBar();
        updateSpermidinBar();
        
        // Show intro screen, hide other screens
        const introScreen = document.getElementById('intro-screen');
        const gameScreen = document.getElementById('game-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const victoryScreen = document.getElementById('victory-screen');
        
        if (introScreen) introScreen.style.display = 'flex';
        if (gameScreen) gameScreen.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';
        if (victoryScreen) victoryScreen.style.display = 'none';
        
        // Hide boss health bar if it exists
        if (bossHealthContainer) {
            bossHealthContainer.style.display = 'none';
        }
        
        console.log("Screen visibility updated");
        
    } catch (error) {
        console.error("Error resetting game:", error);
        console.error("Error stack:", error.stack);
    }
}

// Shooting function for the player
function shootBullet() {
    console.log("shootBullet called, cooldown check:", Date.now() - gameState.player.lastShot, "vs", BULLET_COOLDOWN);
    
    // Check if cooldown has passed - apply the same cooldown to both button and keyboard
    if (Date.now() - gameState.player.lastShot < BULLET_COOLDOWN) {
        console.log("Cooldown not passed, skipping bullet");
        return;
    }
    
    // Create bullet at player position
    const bullet = {
        x: gameState.player.x + gameState.player.width / 2 - BULLET_SIZE / 2,
        y: gameState.player.y,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        speed: BULLET_SPEED
    };
    
    // Add to bullets array
    gameState.bullets.push(bullet);
    
    // Reset cooldown timer
    gameState.player.lastShot = Date.now();
    
    console.log("Bullet created at:", bullet.x.toFixed(1), bullet.y.toFixed(1), "Total bullets:", gameState.bullets.length);
}

// Spawn a flying hot dog (weiner)
function spawnWeiner() {
    const weiner = {
        x: Math.random() * (gameCanvas.width - 72),
        y: -77,
        width: 72,
        height: 77,
        speed: 2 + Math.random() * 2
    };
    gameState.weiners.push(weiner);
}

// Spawn brains at intervals
function spawnBrains() {
    if (!gameState.gameActive || gameState.bossActive) return;
    
    spawnBrain();
    
    // Schedule next spawn
    setTimeout(spawnBrains, BRAIN_SPAWN_INTERVAL);
}

// Activate boss phase
function activateBoss() {
    gameState.bossActive = true;
    gameState.weiners = []; // Clear regular weiners
    gameState.brains = []; // Clear brains
    
    // Create boss
    gameState.boss = {
        x: gameCanvas.width / 2 - 100,
        y: 100,
        width: 200,
        height: 100,
        speed: BOSS_SPEED,
        direction: 1,
        cooldown: 0,
        health: BOSS_MAX_HEALTH
    };
    
    // Hide spermidin bar and show boss health bar
    const spermidinContainer = document.getElementById('spermidin-container');
    const bossHealthContainer = document.getElementById('boss-health-container');
    
    if (spermidinContainer) {
        spermidinContainer.style.display = 'none';
    }
    
    if (bossHealthContainer) {
        bossHealthContainer.style.display = 'block';
    }
    
    // Set boss health bar
    const bossHealthBar = document.getElementById('boss-health-bar');
    if (bossHealthBar) {
        bossHealthBar.style.width = "100%";
    }
    
    // Start boss attack pattern
    bossAttack();
}

// Boss attack pattern - shoot projectiles
function bossAttack() {
    if (!gameState.gameActive || !gameState.bossActive || !gameState.boss) return;
    
    // Decide if this should be a bomb attack (1 in 5 chance)
    const isBombAttack = Math.random() < 0.2;
    
    if (isBombAttack) {
        // Create explosive bomb
        console.log("Boss launching bomb attack!");
        const bomb = {
            x: gameState.boss.x + gameState.boss.width / 2 - BOSS_BOMB_SIZE / 2,
            y: gameState.boss.y + gameState.boss.height,
            width: BOSS_BOMB_SIZE,
            height: BOSS_BOMB_SIZE,
            speedX: (Math.random() - 0.5) * 3, // Random horizontal movement
            speedY: BOSS_BOMB_SPEED,
            isBomb: true,
            explosionRadius: BOSS_BOMB_EXPLOSION_RADIUS,
            explosionTime: 0,
            isExploding: false
        };
        
        // Add to projectiles array
        gameState.bossProjectiles.push(bomb);
    } else {
        // Standard projectile spread attack
        // Create multiple projectiles in a spread pattern
        for (let i = -2; i <= 2; i++) {
            // Create projectile
            const projectile = {
                x: gameState.boss.x + gameState.boss.width / 2 - BOSS_PROJECTILE_SIZE / 2 + (i * 15),
                y: gameState.boss.y + gameState.boss.height,
                width: BOSS_PROJECTILE_SIZE,
                height: BOSS_PROJECTILE_SIZE,
                speedX: i * 1.5,  // Spread effect
                speedY: BOSS_PROJECTILE_SPEED,
                isBomb: false
            };
            
            // Add to projectiles array
            gameState.bossProjectiles.push(projectile);
        }
    }
    
    // Schedule next attack
    setTimeout(bossAttack, BOSS_ATTACK_INTERVAL);
}

// Game victory
function victory() {
    gameState.gameActive = false;
    gameScreen.classList.add('hidden');
    victoryScreen.classList.remove('hidden');
    
    // Show sleep animation
    const sleepAnimation = document.getElementById('sleep-animation');
    if (sleepAnimation) {
        sleepAnimation.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <div style="position: relative;">
                    <!-- Draw sleeping character -->
                    <div style="width: 64px; height: 64px; background-color: #2244AA; border-radius: 50%; margin: 0 auto;"></div>
                    
                    <!-- Eyes closed -->
                    <div style="position: absolute; top: 30%; left: 30%; width: 10px; height: 2px; background-color: black; border-radius: 2px;"></div>
                    <div style="position: absolute; top: 30%; right: 30%; width: 10px; height: 2px; background-color: black; border-radius: 2px;"></div>
                    
                    <!-- Sleeping mouth -->
                    <div style="position: absolute; bottom: 25%; left: 50%; transform: translateX(-50%); width: 10px; height: 5px; background-color: black; border-radius: 50%;"></div>
                </div>
                
                <!-- ZZZ animation -->
                <div class="zzz" style="top: 20%; left: 70%;">ZZZ</div>
            </div>
        `;
    }
}

// Game over
function gameOver() {
    // Stop the game
    gameState.gameActive = false;
    
    // Hide game screen and show game over screen
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';
    
    console.log("Game over! Try Again button should be clickable.");
}

// Main game loop
function gameLoop(timestamp) {
    try {
        // Ensure frameCount is initialized
        if (typeof frameCount === 'undefined') {
            window.frameCount = 0;
            frameCount = 0;
            console.log("Initialized frameCount");
        }
        
        // Calculate delta time
        const now = timestamp || Date.now();
        const deltaTime = now - (lastFrameTime || now);
        lastFrameTime = now;
        
        // Increment frame counter (used for animations)
        frameCount++;
        
        // Only update and render if game is active
        if (gameState && gameState.gameActive && !gameState.isPaused) {
            update(deltaTime);
            render();
        }
        
        // Request next frame
        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("Error in game loop:", e);
        // Still request next frame to keep the game running despite errors
        requestAnimationFrame(gameLoop);
    }
}

// Update player position based on controls
function updatePlayerPosition() {
    let dx = 0;
    let dy = 0;
    
    // Handle keyboard controls - always check these regardless of joystick
    if (gameState.keys.left) dx -= PLAYER_SPEED;
    if (gameState.keys.right) dx += PLAYER_SPEED;
    if (gameState.keys.up) dy -= PLAYER_SPEED;
    if (gameState.keys.down) dy += PLAYER_SPEED;
    
    // Handle joystick controls - these will be added to keyboard inputs if both are used
    if (gameState.joystick && gameState.joystick.active) {
        const joystickDx = gameState.joystick.deltaX * PLAYER_SPEED;
        const joystickDy = gameState.joystick.deltaY * PLAYER_SPEED;
        
        // Add joystick movement to keyboard movement
        dx += joystickDx;
        dy += joystickDy;
        
        // Log for debugging when significant movement
        if (Math.abs(joystickDx) > 0.1 || Math.abs(joystickDy) > 0.1) {
            console.log(`Joystick moving: dx=${joystickDx.toFixed(2)}, dy=${joystickDy.toFixed(2)}`);
        }
    }
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx = dx / magnitude * PLAYER_SPEED;
        dy = dy / magnitude * PLAYER_SPEED;
    }
    
    // Update player position only if there's movement
    if (dx !== 0 || dy !== 0) {
        // Update player position
        gameState.player.x += dx;
        gameState.player.y += dy;
        
        // Update player direction
        gameState.player.direction = {
            x: dx / PLAYER_SPEED,
            y: dy / PLAYER_SPEED
        };
    }
    
    // Check if shoot key is pressed and handle shooting
    if ((gameState.keys.shoot || gameState.shootButton.active) && 
        Date.now() - gameState.player.lastShot > BULLET_COOLDOWN) {
        shootBullet();
    }
    
    // Keep player within canvas boundaries
    gameState.player.x = Math.max(0, Math.min(gameCanvas.width - gameState.player.width, gameState.player.x));
    gameState.player.y = Math.max(0, Math.min(gameCanvas.height - gameState.player.height, gameState.player.y));
}

// Update weiners position and remove out-of-bounds ones
function updateWeiners() {
    try {
        if (!gameState || !gameState.weiners) {
            console.error("Cannot update weiners - gameState.weiners not initialized");
            return;
        }

        // Get canvas dimensions with fallbacks
        const canvasWidth = gameCanvas ? gameCanvas.width : window.innerWidth;
        const canvasHeight = gameCanvas ? gameCanvas.height : window.innerHeight;
        
        // Update each weiner's position and handle bouncing off screen edges
        for (let i = 0; i < gameState.weiners.length; i++) {
            const weiner = gameState.weiners[i];
            
            // Update position
            weiner.x += weiner.speedX;
            weiner.y += weiner.speedY;
            
            // Bounce off screen edges
            if (weiner.x <= 0 || weiner.x + weiner.width >= canvasWidth) {
                weiner.speedX *= -1;
                // Keep within bounds
                weiner.x = Math.max(0, Math.min(weiner.x, canvasWidth - weiner.width));
            }
            
            if (weiner.y <= 0 || weiner.y + weiner.height >= canvasHeight) {
                weiner.speedY *= -1;
                // Keep within bounds
                weiner.y = Math.max(0, Math.min(weiner.y, canvasHeight - weiner.height));
            }
        }
        
        if (gameState.weiners.length === 0 && frameCount % 180 === 0) {
            console.log("No weiners to update, spawning some");
            spawnWeiners(3);
        }
    } catch (e) {
        console.error("Error updating weiners:", e);
    }
}

// Update brains position and behavior
function updateBrains(deltaTime) {
    try {
        if (!gameState || !gameState.brains) {
            console.error("Cannot update brains - gameState.brains not initialized");
            return;
        }

        // Get canvas dimensions with fallbacks
        const canvasWidth = gameCanvas ? gameCanvas.width : window.innerWidth;
        const canvasHeight = gameCanvas ? gameCanvas.height : window.innerHeight;
        
        // Update each brain's position and handle bouncing off screen edges
        for (let i = 0; i < gameState.brains.length; i++) {
            const brain = gameState.brains[i];
            
            // Update position
            brain.x += brain.speedX;
            brain.y += brain.speedY;
            
            // Bounce off screen edges
            if (brain.x <= 0 || brain.x + brain.width >= canvasWidth) {
                brain.speedX *= -1;
                // Keep within bounds
                brain.x = Math.max(0, Math.min(brain.x, canvasWidth - brain.width));
            }
            
            if (brain.y <= 0 || brain.y + brain.height >= canvasHeight) {
                brain.speedY *= -1;
                // Keep within bounds
                brain.y = Math.max(0, Math.min(brain.y, canvasHeight - brain.height));
            }
            
            // Randomly change direction occasionally
            if (Math.random() < 0.01) {
                brain.speedX *= -1;
            }
            if (Math.random() < 0.01) {
                brain.speedY *= -1;
            }
            
            // Make brain shoot occasionally
            const currentTime = Date.now();
            const BRAIN_ATTACK_INTERVAL = 2000; // ms
            
            if (currentTime - brain.lastShotTime > BRAIN_ATTACK_INTERVAL) {
                if (Math.random() < 0.1) { // 10% chance to shoot
                    brainShoot(brain);
                    brain.lastShotTime = currentTime;
                }
            }
        }
        
        if (gameState.brains.length === 0 && frameCount % 180 === 0) {
            console.log("No brains to update, spawning some");
            spawnBrains(3);
        }
    } catch (e) {
        console.error("Error updating brains:", e);
    }
}

// Brain shooting function
function brainShoot(brain) {
    const projectile = {
        x: brain.x + brain.width / 2 - BRAIN_PROJECTILE_SIZE / 2,
        y: brain.y + brain.height,
        width: BRAIN_PROJECTILE_SIZE,
        height: BRAIN_PROJECTILE_SIZE,
        speed: BRAIN_PROJECTILE_SPEED,
        damage: BRAIN_PROJECTILE_DAMAGE
    };
    gameState.brainProjectiles.push(projectile);
}

// Update brain's projectiles
function updateBrainProjectiles() {
    for (let i = 0; i < gameState.brainProjectiles.length; i++) {
        const projectile = gameState.brainProjectiles[i];
        
        // Move projectile down with fixed speed
        projectile.y += BRAIN_PROJECTILE_SPEED;
        
        // Check if projectile is out of bounds
        if (projectile.y > gameCanvas.height) {
            gameState.brainProjectiles.splice(i, 1);
            i--;
        }
    }
}

// Draw brain projectiles
function drawBrainProjectiles() {
    try {
        if (!gameState.sprites || !gameState.sprites.brainProjectile) {
            console.warn("Missing brain projectile sprite");
            return;
        }
        
        for (const projectile of gameState.brainProjectiles) {
            try {
                ctx.drawImage(
                    gameState.sprites.brainProjectile,
                    projectile.x,
                    projectile.y,
                    projectile.width,
                    projectile.height
                );
            } catch (e) {
                console.error("Error drawing individual brain projectile:", e);
            }
        }
    } catch (e) {
        console.error("Error in drawBrainProjectiles:", e);
    }
}

// Draw weiners
function drawWeiners() {
    try {
        console.log("drawWeiners called, gameState.weiners.length:", gameState.weiners.length);
        if (!gameState.sprites || !gameState.sprites.weiner) {
            console.error("Missing weiner sprite");
            return;
        }
        
        console.log("Weiner sprite dimensions:", gameState.sprites.weiner.width, "x", gameState.sprites.weiner.height);
        
        for (const weiner of gameState.weiners) {
            try {
                console.log("Drawing weiner at:", weiner.x, weiner.y, "with size:", weiner.width, "x", weiner.height);
                ctx.save();
                
                // Draw weiner with game sprite
                ctx.drawImage(
                    gameState.sprites.weiner,
                    weiner.x,
                    weiner.y,
                    weiner.width,
                    weiner.height
                );
                
                ctx.restore();
            } catch (e) {
                console.error("Error drawing individual weiner:", e);
            }
        }
    } catch (e) {
        console.error("Error in drawWeiners:", e);
    }
}

// Draw brains
function drawBrains() {
    try {
        if (!gameState.sprites || !gameState.sprites.brain) {
            console.error("Missing brain sprite");
            return;
        }
        
        const currentTime = Date.now();
        const blinkDuration = 300; // milliseconds to blink
        
        for (const brain of gameState.brains) {
            try {
                ctx.save();
                
                // Skip drawing every other frame during blink period
                const isBlinking = brain.isHit && (currentTime - brain.hitTime < blinkDuration);
                const shouldDraw = !isBlinking || Math.floor((currentTime - brain.hitTime) / 100) % 2 === 0;
                
                // Reset hit status after blink duration
                if (brain.isHit && (currentTime - brain.hitTime > blinkDuration)) {
                    brain.isHit = false;
                }
                
                if (shouldDraw) {
                    // Visual indicator for tough brains
                    if (brain.isTough) {
                        // Draw a red glow around tough brains
                        ctx.shadowColor = 'red';
                        ctx.shadowBlur = 10;
                    }
                    
                    ctx.drawImage(
                        gameState.sprites.brain,
                        brain.x,
                        brain.y,
                        brain.width,
                        brain.height
                    );
                }
                
                ctx.restore();
            } catch (e) {
                console.error("Error drawing individual brain:", e);
            }
        }
    } catch (e) {
        console.error("Error in drawBrains:", e);
    }
}

// Draw bullets
function drawBullets() {
    try {
        if (!gameState.sprites || !gameState.sprites.projectile) {
            console.error("Missing projectile sprite");
            return;
        }
        
        for (const bullet of gameState.bullets) {
            try {
                ctx.drawImage(
                    gameState.sprites.projectile,
                    bullet.x,
                    bullet.y,
                    bullet.width,
                    bullet.height
                );
            } catch (e) {
                console.error("Error drawing individual bullet:", e);
            }
        }
    } catch (e) {
        console.error("Error in drawBullets:", e);
    }
}

// Update boss movement
function updateBoss() {
    if (!gameState.boss) return;
    
    // Move boss side to side
    gameState.boss.x += BOSS_SPEED * gameState.boss.direction;
    
    // Reverse direction at edges
    if (gameState.boss.x <= 0 || gameState.boss.x + gameState.boss.width >= gameCanvas.width) {
        gameState.boss.direction *= -1;
    }
}

// Draw boss
function drawBoss() {
    try {
        if (!gameState.boss || !gameState.sprites || !gameState.sprites.boss) {
            if (gameState.bossActive) {
                console.warn("Boss is active but sprite or boss object is missing");
            }
            return;
        }
        
        ctx.drawImage(
            gameState.sprites.boss,
            gameState.boss.x,
            gameState.boss.y,
            gameState.boss.width,
            gameState.boss.height
        );
    } catch (e) {
        console.error("Error in drawBoss:", e);
    }
}

// Update boss projectiles
function updateBossProjectiles() {
    for (let i = 0; i < gameState.bossProjectiles.length; i++) {
        const projectile = gameState.bossProjectiles[i];
        
        // Skip projectiles that are already exploding
        if (projectile.isExploding) {
            // Check if explosion is finished
            if (Date.now() - projectile.explosionTime > 500) {
                // Remove explosion
                gameState.bossProjectiles.splice(i, 1);
                i--;
            }
            continue;
        }
        
        // Apply both vertical and horizontal movement
        projectile.y += projectile.speedY;
        projectile.x += projectile.speedX;
        
        // Check if bomb has hit the ground or bottom of screen
        if (projectile.isBomb && projectile.y > gameCanvas.height - projectile.height * 2) {
            // Trigger explosion
            projectile.isExploding = true;
            projectile.explosionTime = Date.now();
            
            // Check if player is within explosion radius
            const dx = gameState.player.x + gameState.player.width/2 - (projectile.x + projectile.width/2);
            const dy = gameState.player.y + gameState.player.height/2 - (projectile.y + projectile.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < BOSS_BOMB_EXPLOSION_RADIUS) {
                // Calculate damage based on distance (more damage closer to the center)
                const damageFactor = 1 - (distance / BOSS_BOMB_EXPLOSION_RADIUS);
                const damage = Math.round(BOSS_BOMB_DAMAGE * damageFactor);
                
                // Apply damage to player
                gameState.player.health -= damage;
                updateHealthBar();
                
                // Check if player is dead
                if (gameState.player.health <= 0) {
                    gameOver();
                    return;
                }
            }
            
            continue;
        }
        
        // Check if projectile is out of bounds (for non-bombs)
        if (!projectile.isBomb && (projectile.y > gameCanvas.height || 
            projectile.x < -projectile.width || 
            projectile.x > gameCanvas.width)) {
            gameState.bossProjectiles.splice(i, 1);
            i--;
        }
    }
}

// Draw projectiles
function drawProjectiles() {
    ctx.fillStyle = '#ff0000';
    
    for (const projectile of gameState.bossProjectiles) {
        ctx.save();
        
        // Rotate canvas to match projectile angle
        ctx.translate(projectile.x, projectile.y);
        ctx.rotate(projectile.angle);
        
        // Draw projectile
        ctx.fillRect(0, -projectile.height / 2, projectile.width, projectile.height);
        
        // Add veins to projectile (like mini boss)
        ctx.strokeStyle = '#3333ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(5, -projectile.height / 4);
        ctx.lineTo(projectile.width - 5, -projectile.height / 4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(5, projectile.height / 4);
        ctx.lineTo(projectile.width - 5, projectile.height / 4);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Check collision between two objects
function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Check game conditions
function checkGameConditions() {
    // Check if player is dead
    if (gameState.player.health <= 0) {
        console.log("Player health reached zero, calling gameOver()");
        gameOver();
        return;
    }
    
    // Check if boss is dead during boss fight
    if (gameState.bossActive && gameState.boss && gameState.boss.health <= 0) {
        console.log("Boss health reached zero in checkGameConditions, calling bossDeath()");
        bossDeath();
        return;
    }
    
    // Check if player has collected enough spermidin to spawn the boss
    if (!gameState.bossActive && gameState.player.spermidin >= BOSS_SPAWN_THRESHOLD) {
        console.log("Player has collected enough spermidin, spawning boss!");
        spawnBoss();
        return;
    }
    
    // Update UI elements
    if (gameState.player) {
        updateHealthBar();
        updateSpermidinBar();
    }
    
    if (gameState.bossActive && gameState.boss) {
        updateBossHealthBar();
        // Log boss health for debugging
        if (frameCount % 60 === 0) { // Log once per second
            console.log(`Boss health: ${gameState.boss.health}/${BOSS_MAX_HEALTH}`);
        }
    }
}

// Create a boss sprite with optimized drawing
function createBossSprite() {
    console.log("Creating optimized boss sprite");
    
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    // Disable anti-aliasing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Draw the MEGA GIANT EVIL WEINER BOSS with optimized region-based drawing
    
    // Background outline (black border for better visibility)
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 15, 100, 50);
    
    // Gigantic Tip/head (more pronounced pink-red with rounded shape)
    ctx.fillStyle = '#FF3355';
    ctx.fillRect(10, 20, 25, 40); // Large head
    ctx.fillRect(8, 25, 30, 30);  // Extra width at middle
    
    // Glans detailing with evil coloration
    ctx.fillStyle = '#FF6688';
    ctx.fillRect(15, 22, 15, 36); // Tip highlight (center)
    
    // Evil eyes on the tip (white background with red pupils)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(20, 28, 10, 10); // Left eye socket
    ctx.fillRect(20, 42, 10, 10); // Right eye socket
    
    // Evil red pupils
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(22, 30, 6, 6);   // Left pupil
    ctx.fillRect(22, 44, 6, 6);   // Right pupil
    
    // Evil eyebrows
    ctx.fillStyle = '#000000';
    ctx.fillRect(18, 25, 14, 3);  // Left eyebrow
    ctx.fillRect(18, 39, 14, 3);  // Right eyebrow
    
    // Evil mouth (menacing)
    ctx.fillStyle = '#AA0000';
    ctx.fillRect(30, 33, 10, 14); // Evil grinning mouth
    
    // Evil teeth
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(32, 35, 3, 3);   // Upper left tooth
    ctx.fillRect(37, 35, 3, 3);   // Upper right tooth
    ctx.fillRect(32, 42, 3, 3);   // Lower left tooth
    ctx.fillRect(37, 42, 3, 3);   // Lower right tooth
    
    // Shaft (sausage body with better defined color and more cylindrical appearance)
    ctx.fillStyle = '#FF4422';    // Brighter orange-red
    ctx.fillRect(35, 18, 50, 44);
    
    // Base/scrotum (larger bun)
    ctx.fillStyle = '#B25900';    // Chocolate color for bun
    ctx.fillRect(85, 15, 25, 50);
    
    // Shaft details (visible veins with more organic pattern - made more evil looking)
    ctx.fillStyle = '#AA0000';
    
    // Main veins - using fewer, larger rectangles instead of many small ones
    ctx.fillRect(40, 18, 4, 44);  // Main vertical vein
    
    // Vein 2 - curved pattern using fewer rectangles
    ctx.fillRect(50, 18, 3, 15);  // Upper part
    ctx.fillRect(53, 25, 3, 20);  // Middle part
    ctx.fillRect(50, 43, 3, 15);  // Lower part
    
    // Vein 3 - simplified zigzag pattern
    ctx.fillRect(65, 18, 3, 16);  // Top part
    ctx.fillRect(68, 25, 3, 16);  // Middle part
    ctx.fillRect(65, 40, 3, 16);  // Bottom part
    
    // Base details (evil texture) - merge into fewer rectangles
    ctx.fillStyle = '#D2691E';    // Chocolate highlights
    ctx.fillRect(90, 20, 15, 5);  // Top highlight
    ctx.fillRect(90, 30, 15, 5);  // Middle highlight
    ctx.fillRect(90, 40, 15, 5);  // Bottom highlight
    ctx.fillRect(90, 50, 15, 5);  // Lower highlight
    
    // Base shadow (darker)
    ctx.fillStyle = '#8B4513';    // Saddle brown
    ctx.fillRect(90, 55, 15, 5);  // Bottom shadow
    
    // Evil glow aura (demon essence) - optimize to fewer, larger rectangles
    ctx.fillStyle = '#FF0000';
    
    // Top aura - merge into 1 rectangle
    ctx.fillRect(20, 5, 70, 5);
    
    // Side aura - merge into 2 rectangles
    ctx.fillRect(5, 25, 5, 30);   // Left aura
    ctx.fillRect(110, 25, 5, 30); // Right aura
    
    // Bottom aura - merge into 1 rectangle
    ctx.fillRect(20, 70, 70, 5);
    
    console.log("Boss sprite created with optimized drawing");
    return Promise.resolve(canvas);
}

// Create a boss projectile with improved pixel art style
function createBossProjectileSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    
    // Make pixel style explicit
    ctx.imageSmoothingEnabled = false;
    
    // Enhanced evil boss projectile (evil sperm/weiner projectile)
    
    // Dark outline
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 2, 8, 16);
    ctx.fillRect(7, 3, 10, 14);
    ctx.fillRect(6, 5, 12, 10);
    
    // Head/body (whitish with evil tint)
    ctx.fillStyle = '#ffccdd';
    ctx.fillRect(9, 3, 6, 6);
    ctx.fillRect(8, 4, 8, 4);
    
    // Evil eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 5, 2, 2); // Left eye
    ctx.fillRect(14, 5, 2, 2); // Right eye
    
    // Evil frown
    ctx.fillStyle = '#550000';
    ctx.fillRect(12, 8, 2, 1);
    ctx.fillRect(10, 7, 2, 1);
    ctx.fillRect(14, 7, 2, 1);
    
    // Tail (reddish with white core)
    ctx.fillStyle = '#ff6666';
    ctx.fillRect(10, 9, 4, 8);
    
    // Tail inner detail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 10, 2, 6);
    
    // Wiggling tail end
    ctx.fillStyle = '#ff6666';
    ctx.fillRect(9, 17, 6, 2);
    ctx.fillRect(8, 19, 4, 2);
    ctx.fillRect(12, 19, 2, 3);
    
    // Evil aura
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(4, 8, 2, 2); // Left aura
    ctx.fillRect(18, 8, 2, 2); // Right aura
    ctx.fillRect(11, 1, 2, 2); // Top aura
    
    // Motion streaks
    ctx.fillStyle = 'rgba(255, 102, 102, 0.5)';
    ctx.fillRect(11, 21, 2, 1);
    ctx.fillRect(11, 22, 2, 1);
    ctx.fillRect(7, 21, 2, 1);
    
    return Promise.resolve(canvas);
}

// Create a spermidin sprite with pixel art style
function createSpermidinSprite() {
    const size = 16;
    const sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const ctx = sprite.getContext('2d');
    
    // Draw a simple blue spermidin molecule
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    return Promise.resolve(sprite);
}

// Check if user is on a mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Update health bar
function updateHealthBar() {
    const healthBar = document.getElementById('health-bar');
    const healthValue = document.getElementById('health-value');
    if (healthBar) {
        const healthPercent = (gameState.player.health / PLAYER_MAX_HEALTH) * 100;
        healthBar.style.width = healthPercent + '%';
    }
    if (healthValue) {
        healthValue.textContent = `${Math.round(gameState.player.health)}/${PLAYER_MAX_HEALTH}`;
    }
}

// Update spermidin bar
function updateSpermidinBar() {
    const spermidinBar = document.getElementById('spermidin-bar');
    const spermidinValue = document.getElementById('spermidin-value');
    const spermidinContainer = document.getElementById('spermidin-container');
    
    // Hide spermidin bar during boss fight
    if (spermidinContainer) {
        if (gameState.bossActive) {
            spermidinContainer.style.display = 'none';
            return; // Exit early - no need to update hidden bar
        } else {
            spermidinContainer.style.display = 'block';
        }
    }
    
    if (spermidinBar) {
        const spermidinPercent = (gameState.player.spermidin / BOSS_SPAWN_THRESHOLD) * 100;
        spermidinBar.style.width = spermidinPercent + '%';
    }
    
    if (spermidinValue) {
        spermidinValue.textContent = `${Math.round(gameState.player.spermidin)}/${BOSS_SPAWN_THRESHOLD}`;
    }
}

// Update boss health bar
function updateBossHealthBar() {
    const bossHealthBar = document.getElementById('boss-health-bar');
    const bossHealthValue = document.getElementById('boss-health-value');
    const bossHealthContainer = document.getElementById('boss-health-container');
    
    // Make sure boss health container is visible during boss fight
    if (bossHealthContainer) {
        if (gameState.bossActive && gameState.boss) {
            // Make sure to add boss health container to the HUD
            const hud = document.getElementById('hud');
            if (hud && bossHealthContainer.parentElement !== hud) {
                hud.appendChild(bossHealthContainer);
            }
            bossHealthContainer.style.display = 'block';
        } else {
            bossHealthContainer.style.display = 'none';
        }
    }
    
    if (bossHealthBar && gameState.boss) {
        const healthPercent = (gameState.boss.health / BOSS_MAX_HEALTH) * 100;
        bossHealthBar.style.width = healthPercent + '%';
    }
    
    if (bossHealthValue && gameState.boss) {
        bossHealthValue.textContent = `${Math.round(gameState.boss.health)}/${BOSS_MAX_HEALTH}`;
    }
}

// Update game state
function update(deltaTime) {
    try {
        // Log game state occasionally
        if (frameCount % 300 === 0) {
            console.log("Update called, game active: " + gameState.gameActive);
            console.log("Game state summary:", {
                player: gameState.player ? `at (${gameState.player.x.toFixed(0)}, ${gameState.player.y.toFixed(0)})` : 'missing',
                weiners: gameState.weiners ? gameState.weiners.length : 'undefined',
                brains: gameState.brains ? gameState.brains.length : 'undefined',
                bullets: gameState.bullets ? gameState.bullets.length : 'undefined',
                shootActive: gameState.keys.shoot || gameState.shootButton.active
            });
        }
        
        if (!gameState.gameActive) {
            return; // Don't update if game is not active
        }
        
        // Update player position based on controls
        updatePlayerPosition();
        
        // Process shooting - check both keyboard and shoot button
        if (gameState.keys.shoot || gameState.shootButton.active) {
            // Log the shooting attempt for debugging
            if (frameCount % 30 === 0) {
                console.log("Shooting attempt from:", 
                    gameState.keys.shoot ? "keyboard" : "", 
                    gameState.shootButton.active ? "button" : "");
            }
            
            // Attempt to shoot
            shootBullet();
        }
        
        // Update shoot cooldown
        if (gameState.player.shootCooldown > 0) {
            gameState.player.shootCooldown -= 1;
        }
        
        // Update bullets
        if (gameState.bullets && gameState.bullets.length > 0) {
            updateBullets();
        }
        
        // Update game elements with current time
        const currentTime = Date.now();
        
        // More natural spawn system for weiners and brains when boss is not active
        if (!gameState.bossActive) {
            // Weiner spawning - more natural with random chance
            if (gameState.weiners.length < 8) {
                // Random chance to spawn a weiner proportional to how few weiners there are
                const spawnChance = 0.01 + (0.03 * (8 - gameState.weiners.length));
                
                if (Math.random() < spawnChance) {
                    console.log("Natural weiner spawn");
                    spawnWeiner();
                    gameState.lastWeinerSpawn = currentTime;
                }
            }
            
            // Brain spawning - more natural with random chance
            if (gameState.brains.length < 5) {
                // Random chance to spawn a brain proportional to how few brains there are
                const spawnChance = 0.005 + (0.02 * (5 - gameState.brains.length));
                
                if (Math.random() < spawnChance) {
                    console.log("Natural brain spawn");
                    spawnBrain();
                    gameState.lastBrainSpawn = currentTime;
                }
            }
        }
        
        // Update existing weiners
        updateWeiners();
        
        // Update existing brains
        updateBrains(deltaTime);
        
        // Update brain projectiles
        if (gameState.brainProjectiles && gameState.brainProjectiles.length > 0) {
            updateBrainProjectiles();
        }
        
        // Update boss if active
        if (gameState.bossActive && gameState.boss) {
            updateBoss();
            
            if (gameState.bossProjectiles && gameState.bossProjectiles.length > 0) {
                updateBossProjectiles();
            }
        }
        
        // Check for collisions
        checkCollisions();
        
        // Check game conditions (victory, game over, etc.)
        checkGameConditions();
        
        // Force respawn if no enemies for too long (only when not in boss mode)
        if (!gameState.bossActive) {
            // Only respawn if no weiners at all for a long time
            if (gameState.weiners.length === 0 && frameCount % 180 === 0) {
                console.log("Emergency respawning weiners - none left");
                spawnWeiners(3);
            }
            
            // Only respawn if no brains at all for a long time
            if (gameState.brains.length === 0 && frameCount % 240 === 0) {
                console.log("Emergency respawning brains - none left");
                spawnBrains(2);
            }
        }
    } catch (e) {
        console.error("Error in update function:", e);
    }
}

// Render game graphics
function render() {
    if (!ctx || !gameCanvas) {
        console.error("Cannot render - missing ctx or canvas");
        return;
    }
    
    try {
        // Clear the canvas
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Draw background
        ctx.fillStyle = '#000033'; // Dark blue background
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // If game is not active, show a message
        if (!gameState.gameActive) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "20px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText("Press START to play", gameCanvas.width / 2, gameCanvas.height / 2);
            return; // Don't draw game elements if not active
        }
        
        // Don't show debug info
        // drawDebugInfo();
        
        // Draw the player
        if (gameState.player && gameState.sprites && gameState.sprites.player) {
            try {
                ctx.drawImage(
                    gameState.sprites.player,
                    gameState.player.x,
                    gameState.player.y,
                    gameState.player.width,
                    gameState.player.height
                );
            } catch (e) {
                console.error("Error drawing player:", e);
            }
        }
        
        // Draw game elements with better debugging
        try {
            // Draw weiners
            if (gameState.weiners && gameState.weiners.length > 0) {
                drawWeiners();
            } else if (frameCount % 60 === 0) {
                console.warn("No weiners to draw");
            }
            
            // Draw brains
            if (gameState.brains && gameState.brains.length > 0) {
                drawBrains();
            } else if (frameCount % 60 === 0) {
                console.warn("No brains to draw");
            }
            
            // Draw bullets
            if (gameState.bullets && gameState.bullets.length > 0) {
                drawBullets();
            }
            
            // Draw boss and projectiles if active
            if (gameState.bossActive && gameState.boss) {
                drawBoss();
                if (gameState.bossProjectiles && gameState.bossProjectiles.length > 0) {
                    drawBossProjectiles();
                }
            }
            
            // Draw brain projectiles
            if (gameState.brainProjectiles && gameState.brainProjectiles.length > 0) {
                drawBrainProjectiles();
            }
        } catch (e) {
            console.error("Error drawing game elements:", e);
        }
    } catch (e) {
        console.error("Error in render function:", e);
    }
}

// Draw debug information on screen
function drawDebugInfo() {
    try {
        // Draw semi-transparent background for debug info
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(5, 5, 220, 200);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        
        // Title
        ctx.font = "14px Arial";
        ctx.fillText("DEBUG INFO", 10, 20);
        ctx.font = "12px Arial";
        
        // Show game state
        ctx.fillText(`Game Active: ${gameState.gameActive ? 'Yes' : 'No'}`, 10, 40);
        
        // Show counts
        ctx.fillText(`Weiners: ${gameState.weiners ? gameState.weiners.length : 0}`, 10, 60);
        ctx.fillText(`Brains: ${gameState.brains ? gameState.brains.length : 0}`, 10, 75);
        ctx.fillText(`Bullets: ${gameState.bullets ? gameState.bullets.length : 0}`, 10, 90);
        
        // Show player position if exists
        if (gameState.player) {
            ctx.fillText(`Player: (${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})`, 10, 105);
        }
        
        // Show sprite info
        ctx.fillText(`Sprites loaded: ${gameState.sprites ? 'Yes' : 'No'}`, 10, 120);
        
        // Draw sprite samples with white background to make them visible
        if (gameState.sprites && gameState.sprites.weiner) {
            ctx.fillText("Weiner sprite:", 10, 140);
            // Draw white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(100, 125, 40, 50);
            // Draw sprite (enlarged)
            ctx.drawImage(gameState.sprites.weiner, 100, 125, 36, 48);
            // Reset text color
            ctx.fillStyle = "#ffffff";
        }
        
        if (gameState.sprites && gameState.sprites.brain) {
            ctx.fillText("Brain sprite:", 10, 175);
            // Draw white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(100, 160, 40, 40);
            // Draw sprite (enlarged)
            ctx.drawImage(gameState.sprites.brain, 100, 160, 36, 36);
            // Reset text color
            ctx.fillStyle = "#ffffff";
        }
        
        // Show frame count in bottom corner
        ctx.fillText(`Frame: ${frameCount}`, gameCanvas.width - 100, gameCanvas.height - 10);
    } catch (e) {
        console.error("Error in drawDebugInfo:", e);
    }
}

// Initialize the game when page loads
window.addEventListener('load', function() {
    console.log("Window load event fired");
    init();
});

// Spawn a brain
function spawnBrain() {
    // Don't spawn during boss fight
    if (gameState.bossActive) return;

    // Create a brain with random position at the top of the screen
    const x = Math.random() * (gameCanvas.width - BRAIN_SIZE);
    
    // Determine if this will be a tough brain (takes 2 shots to kill)
    const isTough = Math.random() < BRAIN_TOUGH_CHANCE;
    const health = isTough ? BRAIN_TOUGH_HEALTH : BRAIN_HEALTH;
    
    const brain = {
        x: x,
        y: -BRAIN_SIZE,
        width: BRAIN_SIZE,
        height: BRAIN_SIZE,
        speed: 2 + Math.random() * 2,
        lastShot: 0,
        health: health,
        isTough: isTough,
        isHit: false,
        hitTime: 0
    };
    gameState.brains.push(brain);
}

// Spawn a single weiner (hot dog)
function spawnWeiner() {
    // Don't spawn during boss fight
    if (gameState.bossActive) return;
    
    // Create a weiner with random position at the top of the screen
    const x = Math.random() * (gameCanvas.width - WEINER_SIZE);
    
    const weiner = {
        x: x,
        y: -WEINER_SIZE,
        width: WEINER_SIZE,
        height: WEINER_SIZE,
        speed: WEINER_SPEED + Math.random() * 2 // Add some randomness to speed
    };
    
    gameState.weiners.push(weiner);
}

// Boss shooting function
function bossShooting() {
    if (!gameState.gameActive || !gameState.bossActive || !gameState.boss) return;
    
    // Show boss health container when boss is active
    const bossHealthContainer = document.getElementById('boss-health-container');
    if (bossHealthContainer) {
        bossHealthContainer.style.display = 'block';
    }
    
    // Create projectile
    const projectile = {
        x: gameState.boss.x + gameState.boss.width / 2 - 10,
        y: gameState.boss.y + gameState.boss.height,
        width: 20,
        height: 20,
        speed: BOSS_PROJECTILE_SPEED,
        sprite: assets.bossProjectile
    };
    
    gameState.bossProjectiles.push(projectile);
}

// Load game assets
function loadGameAssets() {
    // Create all game sprites using our improved pixel art style
    playerSprite = assets.player;
    weinerSprite = assets.weiner;
    brainSprite = assets.brain;
    bulletSprite = assets.bullet;
    brainProjectileSprite = assets.brainProjectile;
    bossSprite = assets.boss;
    bossProjectileSprite = assets.bossProjectile;
}

// Resize canvas to fit window
function resizeCanvas() {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    
    // If player exists, keep them in bounds after resize
    if (gameState && gameState.player) {
        gameState.player.x = Math.min(gameState.player.x, gameCanvas.width - gameState.player.width);
        gameState.player.y = Math.min(gameState.player.y, gameCanvas.height - gameState.player.height);
    }
}

// Restart the game
function restartGame() {
    // Hide end screens
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';
    
    // Show game screen
    document.getElementById('game-screen').style.display = 'block';
    
    // Reset game state
    resetGame();
    
    // Start game directly (using the fixed version)
    startGameFixed();
    
    console.log("Game restarted!");
}

// Check for collisions between game elements
function checkCollisions() {
    const player = gameState.player;
    
    // Check player-weiner collisions (collect weiners)
    for (let i = 0; i < gameState.weiners.length; i++) {
        const weiner = gameState.weiners[i];
        if (checkRectCollision(player, weiner)) {
            // Collect weiner (increase spermidin)
            gameState.player.spermidin += SPERMIDIN_PER_WEINER;
            updateSpermidinBar();
            
            // Remove collected weiner
            gameState.weiners.splice(i, 1);
            i--;
            
            // Play collect sound (would be implemented here)
        }
    }
    
    // Check player-brain collisions (damage player)
    for (let i = 0; i < gameState.brains.length; i++) {
        const brain = gameState.brains[i];
        if (checkRectCollision(player, brain)) {
            // Take damage
            gameState.player.health -= BRAIN_DAMAGE;
            updateHealthBar();
            
            // Remove brain
            gameState.brains.splice(i, 1);
            
            // Check if player is dead
            if (gameState.player.health <= 0) {
                gameOver();
            }
            
            continue;
        }
    }
    
    // Check player-brainProjectile collisions (damage player)
    for (let i = 0; i < gameState.brainProjectiles.length; i++) {
        const projectile = gameState.brainProjectiles[i];
        if (checkRectCollision(player, projectile)) {
            // Take damage
            gameState.player.health -= BRAIN_PROJECTILE_DAMAGE;
            updateHealthBar();
            
            // Remove projectile
            gameState.brainProjectiles.splice(i, 1);
            i--;
            
            // Check if player is dead
            if (gameState.player.health <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // Check bullet-brain collisions (destroy brains)
    for (let i = 0; i < gameState.bullets.length; i++) {
        const bullet = gameState.bullets[i];
        
        // Check against all brains
        for (let j = 0; j < gameState.brains.length; j++) {
            const brain = gameState.brains[j];
            
            if (checkRectCollision(bullet, brain)) {
                // Remove bullet
                gameState.bullets.splice(i, 1);
                i--;
                
                // Reduce brain health and set hit effect
                brain.health -= BULLET_DAMAGE;
                brain.isHit = true;
                brain.hitTime = Date.now();
                
                // Remove brain if health depleted
                if (brain.health <= 0) {
                    gameState.brains.splice(j, 1);
                    j--;
                }
                
                // Play hit sound (would be implemented here)
                break;
            }
        }
    }
    
    // Check boss collisions if active
    if (gameState.bossActive && gameState.boss) {
        // Check bullet-boss collisions (damage boss)
        for (let i = 0; i < gameState.bullets.length; i++) {
            const bullet = gameState.bullets[i];
            
            if (checkRectCollision(bullet, gameState.boss)) {
                // Damage boss
                gameState.boss.health -= BULLET_DAMAGE;
                console.log("Boss hit! Health remaining: " + gameState.boss.health);
                updateBossHealthBar();
                
                // Remove bullet
                gameState.bullets.splice(i, 1);
                i--;
                
                // Check if boss is dead
                if (gameState.boss.health <= 0) {
                    console.log("Boss health reached zero, calling bossDeath()");
                    bossDeath();
                    return;
                }
            }
        }
        
        // Check player-boss collision (damage player)
        if (checkRectCollision(player, gameState.boss)) {
            // Take damage
            gameState.player.health -= BOSS_COLLISION_DAMAGE;
            updateHealthBar();
            
            // Check if player is dead
            if (gameState.player.health <= 0) {
                gameOver();
                return;
            }
        }
        
        // Check player-bossProjectile collisions (damage player)
        for (let i = 0; i < gameState.bossProjectiles.length; i++) {
            const projectile = gameState.bossProjectiles[i];
            
            if (checkRectCollision(player, projectile)) {
                // Take damage
                gameState.player.health -= BOSS_PROJECTILE_DAMAGE;
                updateHealthBar();
                
                // Remove projectile
                gameState.bossProjectiles.splice(i, 1);
                i--;
                
                // Check if player is dead
                if (gameState.player.health <= 0) {
                    gameOver();
                    return;
                }
            }
        }
    }
}

// Helper function to check collision between two rectangles
function checkRectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Spawn the boss for the final battle
function spawnBoss() {
    // Clear regular enemies
    gameState.brains = [];
    gameState.weiners = [];
    gameState.brainProjectiles = [];
    
    // Activate boss mode
    gameState.bossActive = true;
    
    // Create boss object
    gameState.boss = {
        x: gameCanvas.width / 2 - 60,
        y: 50,
        width: 120,
        height: 80,
        health: BOSS_MAX_HEALTH,
        direction: 1
    };
    
    // Hide spermidin bar during boss fight (not needed anymore)
    const spermidinContainer = document.getElementById('spermidin-container');
    if (spermidinContainer) {
        spermidinContainer.style.display = 'none';
    }
    
    // Show boss health bar
    showBossHealthBar();
    
    // Reset boss health bar to full
    updateBossHealthBar();
    
    // Start boss attack pattern
    bossAttack();
    
    // Create a message to announce the boss
    const gameStory = document.getElementById('game-story');
    if (gameStory) {
        gameStory.innerHTML = "A GIANT WEINER APPEARS - CAN TIM SWALLOW IT";
        gameStory.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            gameStory.style.display = 'none';
        }, 3000);
    }
}

// Hide boss health bar
function hideBossHealthBar() {
    if (bossHealthContainer) {
        bossHealthContainer.style.display = 'none';
    }
}

// Show boss health bar
function showBossHealthBar() {
    if (bossHealthContainer) {
        bossHealthContainer.style.display = 'flex';
    }
}

// Game over when player dies
function gameOver() {
    // Stop the game
    gameState.gameActive = false;
    
    // Hide game screen and show game over screen
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';
    
    console.log("Game over! Try Again button should be clickable.");
}

// Boss death and victory
function bossDeath() {
    // Stop the game
    gameState.gameActive = false;
    
    // Show victory screen
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'flex';
    
    // Log for debugging
    console.log("Boss defeated! Victory screen should now be visible");
    
    // Show sleep animation with character snoozing
    const sleepAnimation = document.getElementById('sleep-animation');
    if (sleepAnimation) {
        // Create canvas for the sleeping character
        const canvas = document.createElement('canvas');
        canvas.width = 350;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Make pixel style explicit
        ctx.imageSmoothingEnabled = false;
        
        // Draw the player character (Tim) sleeping
        // Tim is now laying down horizontally
        
        // Calculate character position
        const centerX = canvas.width / 2 - 30;
        const centerY = canvas.height / 2;
        
        // Draw bed/pillow
        ctx.fillStyle = '#AACCDD';
        ctx.fillRect(centerX - 20, centerY - 10, 90, 20); // Bed
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(centerX - 15, centerY - 15, 25, 25); // Pillow
        
        // Draw sleeping character (horizontal)
        
        // Base body outline (dark)
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX, centerY - 15, 40, 24); // Horizontal body
        ctx.fillRect(centerX + 40, centerY - 11, 10, 16); // Feet
        
        // Head 
        ctx.fillStyle = '#ffccaa'; // Skin tone
        ctx.fillRect(centerX + 2, centerY - 13, 16, 20); // Head shape
        
        // Hair (brown)
        ctx.fillStyle = '#553311';
        ctx.fillRect(centerX + 2, centerY - 13, 16, 5); // Hair top
        ctx.fillRect(centerX, centerY - 11, 4, 10); // Side hair
        
        // Eyebrows
        ctx.fillStyle = '#442200';
        ctx.fillRect(centerX + 4, centerY - 7, 4, 2); // Eyebrow
        
        // Closed Eyes (sleeping)
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX + 6, centerY - 5, 6, 2); // Closed eyes
        
        // Mouth (sleeping expression with small snore bubble)
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX + 10, centerY, 4, 2); // Sleeping mouth
        
        // Draw snore "Z" symbols
        ctx.font = '24px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFDD00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Add ZZZ at different positions and sizes for animation effect
        const zPositions = [
            { x: centerX - 10, y: centerY - 30, size: 18, opacity: 0.9, angle: -0.1 },
            { x: centerX - 25, y: centerY - 45, size: 24, opacity: 0.7, angle: -0.2 },
            { x: centerX - 45, y: centerY - 65, size: 30, opacity: 0.5, angle: -0.3 }
        ];
        
        zPositions.forEach(z => {
            // Animate position based on frame count
            const floatY = Math.sin(frameCount / 20) * 3;
            
            ctx.save();
            ctx.translate(z.x, z.y + floatY);
            ctx.rotate(z.angle);
            ctx.font = `${z.size}px 'Press Start 2P', Arial`;
            ctx.globalAlpha = z.opacity;
            ctx.strokeText('Z', 0, 0);
            ctx.fillText('Z', 0, 0);
            ctx.restore();
        });
        
        // Torso with pajamas
        ctx.fillStyle = '#2244aa'; // Blue pajamas
        ctx.fillRect(centerX + 18, centerY - 13, 22, 20); // Torso
        
        // Pajama pattern (stripes)
        ctx.fillStyle = '#3366cc';
        for (let i = 0; i < 20; i += 4) {
            ctx.fillRect(centerX + 18, centerY - 13 + i, 22, 2); // Horizontal stripes
        }
        
        // Add the sleeping animation to the container
        sleepAnimation.innerHTML = '';
        sleepAnimation.appendChild(canvas);
        
        // Set up animation loop
        const animateSleeping = () => {
            if (!document.getElementById('victory-screen').style.display === 'flex') {
                return; // Stop animation if victory screen is not visible
            }
            
            // Redraw for animation
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw bed/pillow
            ctx.fillStyle = '#AACCDD';
            ctx.fillRect(centerX - 20, centerY - 10, 90, 20); // Bed
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(centerX - 15, centerY - 15, 25, 25); // Pillow
            
            // Draw sleeping character (horizontal)
            
            // Base body outline (dark)
            ctx.fillStyle = '#000000';
            ctx.fillRect(centerX, centerY - 15, 40, 24); // Horizontal body
            ctx.fillRect(centerX + 40, centerY - 11, 10, 16); // Feet
            
            // Head 
            ctx.fillStyle = '#ffccaa'; // Skin tone
            ctx.fillRect(centerX + 2, centerY - 13, 16, 20); // Head shape
            
            // Hair (brown)
            ctx.fillStyle = '#553311';
            ctx.fillRect(centerX + 2, centerY - 13, 16, 5); // Hair top
            ctx.fillRect(centerX, centerY - 11, 4, 10); // Side hair
            
            // Eyebrows
            ctx.fillStyle = '#442200';
            ctx.fillRect(centerX + 4, centerY - 7, 4, 2); // Eyebrow
            
            // Closed Eyes (sleeping)
            ctx.fillStyle = '#000000';
            ctx.fillRect(centerX + 6, centerY - 5, 6, 2); // Closed eyes
            
            // Mouth (sleeping expression with small snore bubble)
            ctx.fillStyle = '#000000';
            ctx.fillRect(centerX + 10, centerY, 4, 2); // Sleeping mouth
            
            // Chest movement for breathing
            const breatheOffset = Math.sin(Date.now() / 1000) * 2;
            
            // Torso with pajamas
            ctx.fillStyle = '#2244aa'; // Blue pajamas
            ctx.fillRect(centerX + 18, centerY - 13 + breatheOffset/2, 22, 20); // Torso with breathing motion
            
            // Pajama pattern (stripes)
            ctx.fillStyle = '#3366cc';
            for (let i = 0; i < 20; i += 4) {
                ctx.fillRect(centerX + 18, centerY - 13 + breatheOffset/2 + i, 22, 2); // Horizontal stripes
            }
            
            // Draw snore "Z" symbols with animation
            zPositions.forEach((z, index) => {
                // Animate position based on time
                const floatY = Math.sin((Date.now() + index * 500) / 1000) * 3;
                const floatX = Math.cos((Date.now() + index * 500) / 1500) * 2;
                
                ctx.save();
                ctx.translate(z.x + floatX, z.y + floatY - (Date.now() % 3000) / 100); // Floating upward over time
                ctx.rotate(z.angle);
                ctx.font = `${z.size}px 'Press Start 2P', Arial`;
                ctx.globalAlpha = z.opacity;
                ctx.strokeText('Z', 0, 0);
                ctx.fillText('Z', 0, 0);
                ctx.restore();
            });
            
            requestAnimationFrame(animateSleeping);
        };
        
        // Start the animation
        animateSleeping();
    }
    
    // Final cleanup
    gameState.boss = null;
    gameState.bossActive = false;
    gameState.bossProjectiles = [];
    
    // Update score or any final rewards
    gameState.score += 1000; // Bonus points for defeating boss
}

// Check game conditions for victory/defeat
function checkGameConditions() {
    // Check if player is dead
    if (gameState.player.health <= 0) {
        console.log("Player health reached zero, calling gameOver()");
        gameOver();
        return;
    }
    
    // Check if boss is dead during boss fight
    if (gameState.bossActive && gameState.boss && gameState.boss.health <= 0) {
        console.log("Boss health reached zero in checkGameConditions, calling bossDeath()");
        bossDeath();
        return;
    }
    
    // Check if player has collected enough spermidin to spawn the boss
    if (!gameState.bossActive && gameState.player.spermidin >= BOSS_SPAWN_THRESHOLD) {
        console.log("Player has collected enough spermidin, spawning boss!");
        spawnBoss();
        return;
    }
    
    // Update UI elements
    if (gameState.player) {
        updateHealthBar();
        updateSpermidinBar();
    }
    
    if (gameState.bossActive && gameState.boss) {
        updateBossHealthBar();
        // Log boss health for debugging
        if (frameCount % 60 === 0) { // Log once per second
            console.log(`Boss health: ${gameState.boss.health}/${BOSS_MAX_HEALTH}`);
        }
    }
}

// Create background pattern
function createBackgroundPattern() {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Fill background with gradient for better depth effect
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 100);
    bgGradient.addColorStop(0, '#000033');
    bgGradient.addColorStop(1, '#000022');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 100, 100);
    
    // Create stars with varying sizes and brightness
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.7 + 0.3;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add a few distant galaxies/nebulae
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 10 + 5;
        
        const nebulaGradient = ctx.createRadialGradient(x, y, 1, x, y, size);
        nebulaGradient.addColorStop(0, 'rgba(100, 100, 255, 0.2)');
        nebulaGradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
        
        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return canvas;
}

// Update bullets position and remove out-of-bounds ones
function updateBullets() {
    for (let i = 0; i < gameState.bullets.length; i++) {
        const bullet = gameState.bullets[i];
        
        // Move bullet upward
        bullet.y -= BULLET_SPEED;
        
        // Remove bullet if it goes off-screen
        if (bullet.y + bullet.height < 0) {
            gameState.bullets.splice(i, 1);
            i--;
        }
    }
}

// Handle brains shooting at player
function handleBrainShooting() {
    if (gameState.bossActive) return; // Don't shoot during boss phase
    
    const currentTime = Date.now();
    
    // Check each brain
    for (let i = 0; i < gameState.brains.length; i++) {
        const brain = gameState.brains[i];
        
        // Check if it's time to shoot based on random intervals
        if (!brain.lastShot || currentTime - brain.lastShot > BRAIN_ATTACK_INTERVAL * (0.8 + Math.random() * 0.4)) {
            // Create a new projectile
            const projectile = {
                x: brain.x + brain.width / 2 - BRAIN_PROJECTILE_SIZE / 2,
                y: brain.y + brain.height,
                width: BRAIN_PROJECTILE_SIZE,
                height: BRAIN_PROJECTILE_SIZE,
                speed: BRAIN_PROJECTILE_SPEED
            };
            
            gameState.brainProjectiles.push(projectile);
            brain.lastShot = currentTime;
        }
    }
}

// Set up the restart button click events
function setupRestartButton() {
    // Get the retry button from game over screen
    const retryButton = document.getElementById('retry-button');
    
    // Get the play again button from victory screen
    const playAgainButton = document.getElementById('play-again-button');
    
    if (!retryButton) {
        console.error("Retry button not found! Make sure you have an element with id 'retry-button' in your HTML.");
    } else {
        console.log("Setting up retry button click event");
        retryButton.onclick = function() {
            console.log("Retry button clicked!");
            restartGame();
        };
    }
    
    if (!playAgainButton) {
        console.error("Play again button not found! Make sure you have an element with id 'play-again-button' in your HTML.");
    } else {
        console.log("Setting up play again button click event");
        playAgainButton.onclick = function() {
            console.log("Play again button clicked!");
            restartGame();
        };
    }
    
    console.log("Restart buttons set up successfully");
}

// Spawn a single weiner at a random position with debug info
function spawnWeiner() {
    try {
        // Don't spawn during boss fight
        if (gameState.bossActive) return null;
        
        // Make sure canvas dimensions are valid
        const canvasWidth = gameCanvas ? gameCanvas.width : window.innerWidth;
        const canvasHeight = gameCanvas ? gameCanvas.height : window.innerHeight;
        
        if (!canvasWidth || !canvasHeight) {
            console.error("Cannot spawn weiner - invalid canvas dimensions");
            return null;
        }
        
        // Make sure WEINER_SIZE is defined
        const weinerSize = (typeof WEINER_SIZE !== 'undefined') ? WEINER_SIZE : 24;
        
        // Create a new weiner object with safe values
        const weiner = {
            x: Math.random() * (canvasWidth - weinerSize),
            y: Math.random() * (canvasHeight / 2 - weinerSize) + 50,
            width: weinerSize,
            height: 77,
            speedX: (Math.random() * 2 - 1) || 0.5, // Ensure non-zero with fallback
            speedY: (Math.random() * 2 - 1) || 0.5  // Ensure non-zero with fallback
        };
        
        // Ensure position is valid (not outside canvas)
        weiner.x = Math.max(0, Math.min(weiner.x, canvasWidth - weinerSize));
        weiner.y = Math.max(0, Math.min(weiner.y, canvasHeight - weiner.height));
        
        // Add the weiner to the game state
        if (gameState && gameState.weiners) {
            gameState.weiners.push(weiner);
            console.log(`Weiner spawned at (${weiner.x.toFixed(0)}, ${weiner.y.toFixed(0)})`);
            return weiner;
        } else {
            console.error("Cannot spawn weiner - gameState.weiners not initialized");
            return null;
        }
    } catch (e) {
        console.error("Error spawning weiner:", e);
        return null;
    }
}

// Spawn multiple weiners at once
function spawnWeiners(count) {
    // Don't spawn during boss fight
    if (gameState.bossActive) return;
    
    console.log(`Attempting to spawn ${count} weiners`);
    let spawned = 0;
    
    for (let i = 0; i < count; i++) {
        if (spawnWeiner()) {
            spawned++;
        }
    }
    
    console.log(`Weiners spawned successfully: ${spawned}/${count}. Total count: ${gameState.weiners.length}`);
}

// Spawn a single brain enemy at a random position
function spawnBrain() {
    try {
        // Make sure canvas dimensions are valid
        const canvasWidth = gameCanvas ? gameCanvas.width : window.innerWidth;
        const canvasHeight = gameCanvas ? gameCanvas.height : window.innerHeight;
        
        if (!canvasWidth || !canvasHeight) {
            console.error("Cannot spawn brain - invalid canvas dimensions");
            return null;
        }
        
        // Make sure constants are defined
        const brainSize = (typeof BRAIN_SIZE !== 'undefined') ? BRAIN_SIZE : 32;
        const brainSpeed = (typeof BRAIN_SPEED !== 'undefined') ? BRAIN_SPEED : 2;
        const brainHealth = (typeof BRAIN_HEALTH !== 'undefined') ? BRAIN_HEALTH : 30;
        const brainToughHealth = (typeof BRAIN_TOUGH_HEALTH !== 'undefined') ? BRAIN_TOUGH_HEALTH : 60;
        const brainToughChance = (typeof BRAIN_TOUGH_CHANCE !== 'undefined') ? BRAIN_TOUGH_CHANCE : 0.35;
        
        // Determine if this brain is tough (more health)
        const isTough = Math.random() < brainToughChance;
        const health = isTough ? brainToughHealth : brainHealth;
        
        // Create a new brain object with safe values
        const brain = {
            x: Math.random() * (canvasWidth - brainSize),
            y: Math.random() * (canvasHeight / 2 - brainSize) + 50,
            width: brainSize,
            height: brainSize,
            speedX: brainSpeed * (Math.random() > 0.5 ? 1 : -1) || 1, // Ensure non-zero
            speedY: brainSpeed * (Math.random() > 0.5 ? 1 : -1) || 1, // Ensure non-zero
            health: health,
            isTough: isTough,
            isHit: false,
            hitTime: 0,
            lastShotTime: Date.now()
        };
        
        // Ensure position is valid (not outside canvas)
        brain.x = Math.max(0, Math.min(brain.x, canvasWidth - brainSize));
        brain.y = Math.max(0, Math.min(brain.y, canvasHeight - brainSize));
        
        // Add the brain to the game state
        if (gameState && gameState.brains) {
            gameState.brains.push(brain);
            console.log(`Brain spawned at (${brain.x.toFixed(0)}, ${brain.y.toFixed(0)}) with health: ${brain.health}`);
            return brain;
        } else {
            console.error("Cannot spawn brain - gameState.brains not initialized");
            return null;
        }
    } catch (e) {
        console.error("Error spawning brain:", e);
        return null;
    }
}

// Spawn multiple brains at once
function spawnBrains(count) {
    console.log(`Attempting to spawn ${count} brains`);
    let spawned = 0;
    
    for (let i = 0; i < count; i++) {
        if (spawnBrain()) {
            spawned++;
        }
    }
    
    console.log(`Brains spawned successfully: ${spawned}/${count}. Total count: ${gameState.brains.length}`);
}

// Add after drawBoss function
// Draw boss projectiles
function drawBossProjectiles() {
    try {
        if (!gameState.bossProjectiles || !gameState.sprites) return;
        
        for (const projectile of gameState.bossProjectiles) {
            if (projectile.isExploding) {
                // Draw explosion
                ctx.beginPath();
                const radius = BOSS_BOMB_EXPLOSION_RADIUS;
                const gradient = ctx.createRadialGradient(
                    projectile.x + projectile.width/2, projectile.y + projectile.height/2, 0,
                    projectile.x + projectile.width/2, projectile.y + projectile.height/2, radius
                );
                
                // Create explosion effect
                const progress = (Date.now() - projectile.explosionTime) / 500; // 0 to 1 over 500ms
                gradient.addColorStop(0, 'rgba(255, 100, 0, ' + (1 - progress) + ')');
                gradient.addColorStop(0.5, 'rgba(255, 200, 0, ' + (0.8 - progress * 0.8) + ')');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.arc(projectile.x + projectile.width/2, projectile.y + projectile.height/2, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (projectile.isBomb) {
                // Draw bomb
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(projectile.x + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw bomb fuse
                ctx.strokeStyle = '#FFFF00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(projectile.x + projectile.width/2, projectile.y);
                ctx.lineTo(projectile.x + projectile.width/2, projectile.y - 10);
                ctx.stroke();
                
                // Draw sizzling effect at end of fuse
                if (frameCount % 6 < 3) {
                    ctx.fillStyle = '#FFFFFF';
                } else {
                    ctx.fillStyle = '#FFFF00';
                }
                ctx.beginPath();
                ctx.arc(projectile.x + projectile.width/2, projectile.y - 12, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw normal projectile
                if (gameState.sprites.bossProjectile) {
                    ctx.drawImage(gameState.sprites.bossProjectile, projectile.x, projectile.y, projectile.width, projectile.height);
                } else {
                    // Fallback if sprite not loaded
                    ctx.fillStyle = '#FF3300';
                    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
                }
            }
        }
    } catch (e) {
        console.error("Error in drawBossProjectiles:", e);
    }
} 

// Initialize the overlay joystick - completely separate from the game's joystick
function setupOverlayJoystick() {
    console.log("Setting up overlay joystick - completely separate implementation");
    
    // Get the overlay joystick elements
    const joystickBase = document.getElementById('overlay-joystick-base');
    const joystickHandle = document.getElementById('overlay-joystick-handle');
    
    if (!joystickBase || !joystickHandle) {
        console.error("Overlay joystick elements not found!");
        return;
    }
    
    // Ensure joystick state exists in gameState
    if (!gameState.joystick) {
        gameState.joystick = {
            active: false,
            deltaX: 0,
            deltaY: 0
        };
    }
    
    // Joystick state
    let active = false;
    
    // The joystick interface function that updates game state
    function updateJoystickState(deltaX, deltaY) {
        // Make sure gameState and joystick exist
        if (!gameState) {
            console.error("Cannot update joystick state - gameState is undefined");
            return;
        }
        
        // Make sure joystick object exists
        if (!gameState.joystick) {
            console.log("Creating joystick state in gameState");
            gameState.joystick = {
                active: false,
                deltaX: 0, 
                deltaY: 0
            };
        }
        
        // Now it's safe to update
        gameState.joystick.deltaX = deltaX;
        gameState.joystick.deltaY = deltaY;
        gameState.joystick.active = (deltaX !== 0 || deltaY !== 0);
        
        // Log the joystick values
        if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
            console.log(`Overlay joystick: ${deltaX.toFixed(2)}, ${deltaY.toFixed(2)}`);
        }
    }
    
    // Handle touch/mouse start
    function handleStart(clientX, clientY) {
        active = true;
        updatePosition(clientX, clientY);
    }
    
    // Handle touch/mouse move
    function handleMove(clientX, clientY) {
        if (!active) return;
        updatePosition(clientX, clientY);
    }
    
    // Handle touch/mouse end
    function handleEnd() {
        active = false;
        joystickHandle.style.transform = 'translate(-50%, -50%)';
        updateJoystickState(0, 0); // Reset joystick state
    }
    
    // Update the joystick position
    function updatePosition(clientX, clientY) {
        // Get the joystick base position and dimensions
        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;
        
        // Calculate delta from center
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        // Calculate distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Limit to joystick radius
        if (distance > radius) {
            const ratio = radius / distance;
            deltaX *= ratio;
            deltaY *= ratio;
        }
        
        // Move the joystick handle
        joystickHandle.style.transform = `translate(calc(${deltaX}px - 50%), calc(${deltaY}px - 50%))`;
        
        // Update the game state (normalize to -1 to 1)
        updateJoystickState(deltaX / radius, deltaY / radius);
    }
    
    // Add touch event listeners
    joystickBase.addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        if (!active) return;
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    
    document.addEventListener('touchend', function() {
        handleEnd();
    });
    
    // Add mouse event listeners for testing
    joystickBase.addEventListener('mousedown', function(e) {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', function(e) {
        handleMove(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', function() {
        handleEnd();
    });
    
    // Hide the original joystick container to avoid conflicts
    const originalJoystick = document.getElementById('joystick-container');
    if (originalJoystick) {
        originalJoystick.style.display = 'none';
    }
    
    console.log("Overlay joystick setup complete");
}

// Ensure the overlay joystick is initialized at the right time
window.addEventListener('load', function() {
    // Only initialize if gameState exists
    if (window.gameState) {
        console.log("Window loaded, initializing overlay joystick");
        setupOverlayJoystick();
    } else {
        console.log("Window loaded but gameState not ready, will wait for game init");
    }
});
