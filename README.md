# Tim Loves Wieners

A game where Tim collects wieners to help him sleep.

## How to Play

- Use the joystick (mobile) or arrow keys (desktop) to move Tim around
- Collect wieners to gain spermidin which helps Tim sleep
- Avoid brains that try to keep Tim awake
- Once you've collected enough spermidin, defeat the giant wiener boss!

## Heroku Deployment

To deploy this game on Heroku:

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Push the code to Heroku: `git push heroku main`
5. Open the deployed app: `heroku open`

## Local Development

To run the game locally:

1. Make sure Node.js is installed
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open your browser and navigate to `http://localhost:3000`

## Controls

- **Desktop:** Arrow keys or WASD to move, Space to shoot
- **Mobile:** On-screen joystick to move, Shoot button to shoot

## Game Features

- Responsive mobile-first design with touch controls
- Retro N64-style pixel graphics
- Two-phase gameplay: collection phase and boss battle
- Virtual joystick that works on both touch and mouse input
- Character-by-character text animation in the intro

## Technical Details

The game is built with pure HTML5, CSS3, and JavaScript without any external libraries. It uses:

- Canvas API for drawing game elements
- Touch events API for mobile compatibility
- CSS animations for visual effects
- Collision detection and game physics

## Installation

No installation required! Simply open the index.html file in a web browser.

## Credits

Created by miniminkus 