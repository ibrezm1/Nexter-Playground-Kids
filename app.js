/**
 * app.js
 * Kids Motion Playground - Unified Motion-Controlled Games Engine (Nex-Style)
 * Refactored using ES Modules. Imports submodules for different games, sound, and particles.
 */

import { PoseTracker } from './pose-tracker.js';
import { sfx } from './modules/sound.js';
import { Particle } from './modules/particles.js';
import { Balloon, PuppyPuppet } from './modules/games/puppy.js';
import { Fruit, FruitPiece } from './modules/games/fruits.js';
import { Pet } from './modules/games/pets.js';
import { Meteor } from './modules/games/cosmic.js';

// ==========================================
// Main Unified Game Engine Coordinator
// ==========================================
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Bind Screen DOM components
    this.screenWelcome = document.getElementById('screen-welcome');
    this.screenCalibration = document.getElementById('screen-calibration');
    this.screenCountdown = document.getElementById('screen-countdown');
    this.screenLevelUp = document.getElementById('screen-levelup');
    this.screenGameOver = document.getElementById('screen-gameover');
    
    // Stats elements
    this.scoreValEl = document.getElementById('score-val');
    this.levelValEl = document.getElementById('level-val');
    this.timerValEl = document.getElementById('timer-val');
    this.timerBar = document.getElementById('timer-bar');
    this.heartsValEl = document.getElementById('hearts-val');
    
    // Playground State Router
    this.gameMode = 'puppy'; // puppy, fruits, pets, cosmic
    this.gameState = 'welcome'; // welcome, playing, levelup, gameover
    this.score = 0;
    this.level = 1;
    this.timeLeft = 60;
    this.lives = 5; // 5 chances (hearts) instead of 3 for easier kid play
    this.speedMultiplier = 1.2;
    this.speedSlider = document.getElementById('speed-slider');
    this.speedMultiplierValEl = document.getElementById('speed-multiplier-val');
    
    this.tracker = new PoseTracker();
    this.puppy = null;
    this.balloons = [];
    
    // Fruits list
    this.fruits = [];
    this.fruitPieces = [];
    this.fruitSlicedCount = 0;
    
    // Pets List
    this.pets = [];
    this.burrowPositions = [];
    this.petSpawnCooldown = 0;

    // Cosmic meteor List
    this.meteors = [];
    this.cosmicCockpitX = 0;
    this.cosmicCockpitY = 0;
    this.shieldAngle = -Math.PI / 2; // Shield rotation angle

    this.particles = [];
    this.frameCount = 0;
    this.levelTimerInterval = null;
    
    // User hand and tracking variables
    this.puppetXTarget = 0.5;
    this.leftHandTargetOffset = { x: 0, y: 0 };
    this.rightHandTargetOffset = { x: 0, y: 0 };
    this.playerIsJumping = false;
    
    // Left/Right Hand previous tracking positions for slicing trails
    this.prevLeftHandPos = null;
    this.prevRightHandPos = null;

    this.registerEventListeners();
  }

  registerEventListeners() {
    // Select dynamic game cards from hub carousel
    const playButtons = document.querySelectorAll('.btn-play-game');
    playButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const chosenGame = btn.getAttribute('data-game');
        this.gameMode = chosenGame;
        sfx.playBounce();
        this.transitionToState('playing');
      });
    });

    // Level Up transition button
    document.getElementById('btn-next-level').addEventListener('click', () => {
      this.proceedToNextLevel();
    });

    // Restart Game button
    document.getElementById('btn-restart').addEventListener('click', () => {
      sfx.playBounce();
      this.score = 0;
      this.level = 1;
      this.lives = 5;
      this.timeLeft = 60;
      this.transitionToState('playing');
    });

    // Keyboard Fallback Controls (Arrow Left/Right for movement, Space for jump)
    window.addEventListener('keydown', (e) => {
      if (this.gameState === 'levelup' && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Spacebar')) {
        this.proceedToNextLevel();
        return;
      }

      if (e.key === 'ArrowLeft') {
        this.puppetXTarget = Math.max(0.05, this.puppetXTarget - 0.06);
      } else if (e.key === 'ArrowRight') {
        this.puppetXTarget = Math.min(0.95, this.puppetXTarget + 0.06);
      }
      
      if (e.key === ' ' || e.key === 'Spacebar') {
        this.playerIsJumping = true;
        setTimeout(() => {
          this.playerIsJumping = false;
        }, 120);
      }
    });

    // Dynamic Speed Slider adjustments
    if (this.speedSlider) {
      this.speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.speedMultiplier = val;
        this.speedMultiplierValEl.textContent = `${val.toFixed(1)}x`;
      });
    }

    // Mouse Fallback Controls (Mouse moves arms and swat paths)
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const px = this.puppetXTarget * this.canvas.width;
      const py = this.canvas.height - 120;
      
      // Mirror displacement offsets proportionately
      this.leftHandTargetOffset.x = (mouseX - (px - 32)) * 0.015;
      this.leftHandTargetOffset.y = (mouseY - (py + 38)) * 0.015;
      
      this.rightHandTargetOffset.x = (mouseX - (px + 32)) * 0.015;
      this.rightHandTargetOffset.y = (mouseY - (py + 38)) * 0.015;
    });

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  async start() {
    this.resizeCanvas();
    this.puppy = new PuppyPuppet(this.canvas.width, this.canvas.height);
    
    // Pre-calculate Pat-the-Pets burrows positions
    this.setupPetsBurrows();
    
    // Start the Animation loop immediately (prevents black canvas while camera loads)
    this.gameLoop();

    // Hook tracking callbacks
    this.tracker.onTrackingCallback = (data) => {
      this.puppetXTarget = (1.0 - data.x);
      this.leftHandTargetOffset = data.leftHand;
      this.rightHandTargetOffset = data.rightHand;
      this.playerIsJumping = data.isJumping;

      // Auto next level if hands are raised up high
      if (this.gameState === 'levelup') {
        const handsUp = data.leftHand.y < -0.3 && data.rightHand.y < -0.3;
        if (handsUp) {
          this.proceedToNextLevel();
        }
      }
    };

    // When calibration tracks a player, unlock all carousel play buttons!
    this.tracker.onCalibrationSuccess = () => {
      const calibrator = document.getElementById('hub-calibration-status');
      calibrator.textContent = "💻 Player Detected! Ready to play! 🚀";
      calibrator.className = 'status-ready';

      const playButtons = document.querySelectorAll('.btn-play-game');
      playButtons.forEach((btn) => {
        btn.removeAttribute('disabled');
        const gameName = btn.getAttribute('data-game');
        btn.textContent = `Play ${gameName.toUpperCase()} 🎮`;
      });
    };

    // Auto-unlock fallback after 2.2 seconds so players can use Keyboard & Mouse if camera hangs
    setTimeout(() => {
      const calibrator = document.getElementById('hub-calibration-status');
      if (calibrator.className !== 'status-ready') {
        calibrator.textContent = "💡 Keyboard (Left/Right & Space) + Mouse controls active!";
        calibrator.className = 'status-connecting';
        
        const playButtons = document.querySelectorAll('.btn-play-game');
        playButtons.forEach((btn) => {
          btn.removeAttribute('disabled');
          const gameName = btn.getAttribute('data-game');
          btn.textContent = `Play ${gameName.toUpperCase()} 🎮`;
        });
      }
    }, 2200);

    // Initialize pose tracking asynchronously in the background
    try {
      await this.tracker.initialize();
    } catch (e) {
      console.warn("Tracker initialization deferred/blocked:", e);
    }
  }

  setupPetsBurrows() {
    // 3 burrows spaced evenly horizontally
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.burrowPositions = [
      { x: w * 0.22, y: h * 0.72 }, // Left hole
      { x: w * 0.5, y: h * 0.78 },  // Center hole
      { x: w * 0.78, y: h * 0.72 }  // Right hole
    ];
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
    
    if (this.puppy) {
      this.puppy.canvasWidth = this.canvas.width;
      this.puppy.canvasHeight = this.canvas.height;
      this.puppy.y = this.canvas.height - 120;
    }
    
    this.setupPetsBurrows();
    
    // Cosmic cockpit base positions
    this.cosmicCockpitX = this.canvas.width / 2;
    this.cosmicCockpitY = this.canvas.height - 130;
  }

  proceedToNextLevel() {
    if (this.gameState !== 'levelup') return;
    sfx.playBounce();
    this.level++;
    this.timeLeft = 60;
    this.transitionToState('playing');
  }

  transitionToState(newState) {
    this.gameState = newState;
    
    this.screenWelcome.className = 'screen-overlay hidden';
    this.screenCalibration.className = 'screen-overlay hidden';
    this.screenLevelUp.className = 'screen-overlay hidden';
    this.screenGameOver.className = 'screen-overlay hidden';
    this.screenCountdown.className = 'screen-overlay hidden';

    if (newState === 'playing') {
      // Clear game elements
      this.balloons = [];
      this.fruits = [];
      this.fruitPieces = [];
      this.pets = [];
      this.meteors = [];
      this.particles = [];
      
      this.updateHUD();
      this.startLevelTimer();
    } else if (newState === 'levelup') {
      clearInterval(this.levelTimerInterval);
      sfx.playLevelUp();
      
      document.getElementById('next-level-num').textContent = this.level + 1;
      document.getElementById('btn-next-level-num').textContent = this.level + 1;
      
      const levelDescText = document.getElementById('level-desc-text');
      if (this.gameMode === 'puppy') {
        levelDescText.textContent = "Excellent bounce skills! Wind currents have picked up. Watch the sways!";
      } else if (this.gameMode === 'fruits') {
        levelDescText.textContent = "Fantastic slicing! Speeds are increasing, and spikes are spinning!";
      } else if (this.gameMode === 'pets') {
        levelDescText.textContent = "Cute petting job! Rabbits are faster, and hedgehogs are trickier!";
      } else {
        levelDescText.textContent = "Cockpit defended! Asteroid velocities are rising. Pivot the energy shields fast!";
      }
      
      this.screenLevelUp.className = 'screen-overlay active';
    } else if (newState === 'gameover') {
      clearInterval(this.levelTimerInterval);
      sfx.playGameOver();
      
      document.getElementById('final-score').textContent = this.score;
      document.getElementById('final-level').textContent = this.level;
      this.screenGameOver.className = 'screen-overlay active';
    }
  }

  startLevelTimer() {
    if (this.levelTimerInterval) clearInterval(this.levelTimerInterval);
    this.levelTimerInterval = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        sfx.playTick();
      }

      if (this.timeLeft <= 0) {
        this.transitionToState('levelup');
      }
      this.updateHUD();
    }, 1000);
  }

  updateHUD() {
    this.scoreValEl.textContent = this.score;
    this.levelValEl.textContent = this.level;
    this.timerValEl.textContent = `${this.timeLeft}s`;
    
    const percentage = (this.timeLeft / 60) * 100;
    this.timerBar.style.width = `${percentage}%`;
    
    if (this.timeLeft <= 10) {
      this.timerBar.style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
    } else if (this.timeLeft <= 25) {
      this.timerBar.style.background = 'linear-gradient(90deg, #f59e0b, #ec4899)';
    } else {
      this.timerBar.style.background = 'linear-gradient(90deg, #10b981, #3b82f6)';
    }

    let hearts = '';
    for (let i = 0; i < 5; i++) { // Render up to 5 hearts
      hearts += i < this.lives ? '❤️️' : '🖤';
    }
    this.heartsValEl.textContent = hearts;
  }

  gameLoop() {
    this.frameCount++;
    
    this.drawBackground();

    if (this.gameState === 'playing') {
      this.updateGameLogic();
    }

    // Render active particles
    this.particles.forEach((p, idx) => {
      p.update();
      p.draw(this.ctx);
      if (p.alpha <= 0) this.particles.splice(idx, 1);
    });

    // Game Mode Draw Branches
    if (this.gameMode === 'puppy') {
      this.balloons.forEach((b) => b.draw(this.ctx));
      
      const pixelTargetX = this.puppetXTarget * this.canvas.width;
      this.puppy.update(pixelTargetX, this.frameCount, this.leftHandTargetOffset, this.rightHandTargetOffset, this.playerIsJumping);
      this.puppy.draw(this.ctx);
      
    } else if (this.gameMode === 'fruits') {
      this.fruits.forEach((f) => f.draw(this.ctx));
      this.fruitPieces.forEach((fp, idx) => {
        fp.update();
        fp.draw(this.ctx);
        if (fp.alpha <= 0) this.fruitPieces.splice(idx, 1);
      });
      
      // Draw Laser blades on Hand Positions
      this.drawLaserBlades();

    } else if (this.gameMode === 'pets') {
      this.drawPetsBurrows();
      this.pets.forEach((pet) => pet.draw(this.ctx));
      this.drawToyHammers();

    } else if (this.gameMode === 'cosmic') {
      this.drawCosmicCockpit();
      this.meteors.forEach((m) => m.draw(this.ctx));
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  drawBackground() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (this.gameMode === 'cosmic') {
      // Space Nebula dark gradient
      const darkGrad = ctx.createLinearGradient(0, 0, 0, h);
      darkGrad.addColorStop(0, '#090514');
      darkGrad.addColorStop(0.5, '#0f0a1c');
      darkGrad.addColorStop(1, '#020005');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, w, h);

      // Star twinkles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const offset = Math.sin(this.frameCount * 0.05 + i) * 3;
        ctx.beginPath();
        ctx.arc((w * 0.05 * i) % w, (h * 0.08 * i + offset) % h, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // Sky Background for other games
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (this.gameMode === 'fruits') {
      skyGrad.addColorStop(0, '#020617'); // Retro futuristic arcade sunset
      skyGrad.addColorStop(0.6, '#1e1b4b');
      skyGrad.addColorStop(1, '#311042');
    } else {
      skyGrad.addColorStop(0, '#bae6fd'); 
      skyGrad.addColorStop(0.6, '#e0f2fe');
      skyGrad.addColorStop(1, '#ffedd5');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Fluffy cloud renders
    ctx.fillStyle = this.gameMode === 'fruits' ? 'rgba(236,72,153,0.1)' : 'rgba(255, 255, 255, 0.55)';
    this.drawCloud(w * 0.15, h * 0.25, 45);
    this.drawCloud(w * 0.8, h * 0.18, 55);
    this.drawCloud(w * 0.5, h * 0.35, 38);

    // Green grass fields
    ctx.fillStyle = this.gameMode === 'fruits' ? '#1e1b4b' : '#4ade80';
    ctx.beginPath();
    ctx.arc(w * 0.3, h + 300, 400, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.gameMode === 'fruits' ? '#0f0a1c' : '#22c55e';
    ctx.beginPath();
    ctx.arc(w * 0.8, h + 350, 480, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.gameMode === 'fruits' ? '#090514' : '#16a34a';
    ctx.fillRect(0, h - 35, w, 35);
  }

  drawCloud(cx, cy, scale) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.arc(cx + scale * 0.7, cy - scale * 0.3, scale * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + scale * 1.4, cy, scale * 0.7, 0, Math.PI * 2);
    ctx.arc(cx + scale * 0.7, cy + scale * 0.2, scale * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  updateGameLogic() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Puppy Game Mode Logic
    if (this.gameMode === 'puppy') {
      const spawnRate = Math.max(35, 80 - this.level * 15);
      if (this.frameCount % spawnRate === 0 && this.balloons.length < 7) {
        this.balloons.push(new Balloon(w, this.level, this.speedMultiplier));
      }

      for (let i = this.balloons.length - 1; i >= 0; i--) {
        const b = this.balloons[i];
        b.update(this.frameCount, this.level);

        if (b.y + b.radius >= h - 35) {
          this.burstBalloon(b, true);
          this.balloons.splice(i, 1);
          continue;
        }

        const headX = this.puppy.x;
        const headY = this.puppy.y - 20 + this.puppy.jumpY;
        const leftPawColX = this.puppy.x - 32 + this.puppy.leftHandCurrent.x;
        const leftPawColY = this.puppy.y + 38 + this.puppy.leftHandCurrent.y + this.puppy.jumpY;
        const rightPawColX = this.puppy.x + 32 + this.puppy.rightHandCurrent.x;
        const rightPawColY = this.puppy.y + 38 + this.puppy.rightHandCurrent.y + this.puppy.jumpY;

        const getDistance = (x1, y1, x2, y2) => {
          const dx = x2 - x1;
          const dy = y2 - y1;
          return Math.sqrt(dx * dx + dy * dy);
        };

        const distToHead = getDistance(b.x, b.y, headX, headY);
        const distToLeftPaw = getDistance(b.x, b.y, leftPawColX, leftPawColY);
        const distToRightPaw = getDistance(b.x, b.y, rightPawColX, rightPawColY);

        const headHitRadius = this.puppy.radius - 12 + b.radius;
        const pawHitRadius = 24 + b.radius;

        let hasCollision = false;
        let colCenterX = headX;
        let colCenterY = headY;
        let colRadius = headHitRadius;

        if (distToHead < headHitRadius) {
          hasCollision = true;
          colCenterX = headX;
          colCenterY = headY;
          colRadius = headHitRadius;
        } else if (distToLeftPaw < pawHitRadius) {
          hasCollision = true;
          colCenterX = leftPawColX;
          colCenterY = leftPawColY;
          colRadius = pawHitRadius;
        } else if (distToRightPaw < pawHitRadius) {
          hasCollision = true;
          colCenterX = rightPawColX;
          colCenterY = rightPawColY;
          colRadius = pawHitRadius;
        }

        if (hasCollision) {
          sfx.playBounce();
          this.score += 10;
          this.updateHUD();
          b.y = colCenterY - colRadius;
          const angleRatio = (b.x - colCenterX) / colRadius;
          b.vx = angleRatio * 6.5;
          b.vy = -(Math.abs(b.vy) * 0.95 + 4.8); 
        }
      }
    }

    // 2. Fruit Slasher Mode Logic
    else if (this.gameMode === 'fruits') {
      const spawnRate = Math.max(30, 75 - this.level * 12);
      if (this.frameCount % spawnRate === 0 && this.fruits.length < 5) {
        this.fruits.push(new Fruit(w, h, this.level, this.speedMultiplier));
      }

      // Track player hands pixel coordinates
      const px = this.puppetXTarget * w;
      const py = h - 120;
      const lhx = px - 32 - this.leftHandTargetOffset.x * 220;
      const lhy = py + 38 + this.leftHandTargetOffset.y * 220;
      
      const rhx = px + 32 - this.rightHandTargetOffset.x * 220;
      const rhy = py + 38 + this.rightHandTargetOffset.y * 220;

      for (let i = this.fruits.length - 1; i >= 0; i--) {
        const f = this.fruits[i];
        f.update();

        // Slice detection: check both hands (only sliceable when in the air, not at bottom spawn)
        const distL = Math.sqrt((f.x - lhx) ** 2 + (f.y - lhy) ** 2);
        const distR = Math.sqrt((f.x - rhx) ** 2 + (f.y - rhy) ** 2);
        const isSliceable = f.y < h - 100;

        if (isSliceable && (distL < f.radius + 24 || distR < f.radius + 24)) {
          if (f.isBomb) {
            sfx.playBombBlast();
            this.lives--;
            this.updateHUD();
            this.spawnExplosionParticles(f.x, f.y, '#f43f5e', 'juice', 25);
            this.fruits.splice(i, 1);
            
            if (this.lives <= 0) this.transitionToState('gameover');
          } else {
            sfx.playSlash();
            this.score += 15;
            this.updateHUD();

            // Split into physical flying pieces
            this.fruitPieces.push(new FruitPiece(f.x - 10, f.y, f.color, -1));
            this.fruitPieces.push(new FruitPiece(f.x + 10, f.y, f.color, 1));
            this.spawnExplosionParticles(f.x, f.y, f.color, 'juice', 20);

            this.fruits.splice(i, 1);
          }
          continue;
        }

        // Out of boundaries
        if (f.y - f.radius > h) {
          this.fruits.splice(i, 1);
        }
      }
    }

    // 3. Pat-the-Pets Mode Logic
    else if (this.gameMode === 'pets') {
      this.petSpawnCooldown--;
      const capRate = Math.max(45, 95 - this.level * 15);
      if (this.petSpawnCooldown <= 0 && this.pets.length < 2) {
        const randBurrowIdx = Math.floor(Math.random() * this.burrowPositions.length);
        
        // Ensure that burrow is currently empty
        const activeBurrows = this.pets.map(p => p.burrowIndex);
        if (!activeBurrows.includes(randBurrowIdx)) {
          const bp = this.burrowPositions[randBurrowIdx];
          this.pets.push(new Pet(randBurrowIdx, bp.x, bp.y));
          this.petSpawnCooldown = capRate;
        }
      }

      // Track hand coordinates (mapped to align perfectly with burrow holes when hands are raised)
      const px = this.puppetXTarget * w;
      const lhx = px - 32 - this.leftHandTargetOffset.x * 220;
      const lhy = h * 0.75 + 100 + this.leftHandTargetOffset.y * 180;
      const rhx = px + 32 - this.rightHandTargetOffset.x * 220;
      const rhy = h * 0.75 + 100 + this.rightHandTargetOffset.y * 180;

      for (let i = this.pets.length - 1; i >= 0; i--) {
        const pet = this.pets[i];
        pet.update();

        if (pet.state === 'active') {
          const distL = Math.sqrt((pet.x - lhx) ** 2 + ((pet.y - pet.animY) - lhy) ** 2);
          const distR = Math.sqrt((pet.x - rhx) ** 2 + ((pet.y - pet.animY) - rhy) ** 2);

          if (distL < pet.radius + 30 || distR < pet.radius + 30) {
            if (pet.isHedgehog) {
              sfx.playBombBlast();
              this.lives--;
              this.updateHUD();
              this.spawnExplosionParticles(pet.x, pet.y - pet.animY, '#f59e0b', 'star', 15);
              pet.state = 'retracting';
              if (this.lives <= 0) this.transitionToState('gameover');
            } else {
              sfx.playBounce();
              this.score += 10;
              this.updateHUD();
              pet.state = 'patted';
              this.spawnExplosionParticles(pet.x, pet.y - pet.animY, '#fef08a', 'star', 15);
            }
          }
        }

        if (pet.state === 'done') {
          this.pets.splice(i, 1);
        }
      }
    }

    // 4. Cosmic Defender Mode Logic
    else if (this.gameMode === 'cosmic') {
      const spawnRate = Math.max(50, 90 - this.level * 10); // Faster spawning (approx 1.3 seconds at level 1) to fill the screen with targets
      if (this.frameCount % spawnRate === 0 && this.meteors.length < 12) { // Increased maximum comets limit to 12
        this.meteors.push(new Meteor(w, h, this.level, this.speedMultiplier));
      }

      // Revolve shield orbit angle smoothly across the upper sky (-PI to 0) based on player horizontal position
      this.shieldAngle = -Math.PI + this.puppetXTarget * Math.PI;

      const baseCenterY = this.cosmicCockpitY;
      const baseCenterX = this.cosmicCockpitX;

      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.update();

        // 1. Deflect collision: check if meteor hits orbital shield track ring radius (120px)
        const distToCenter = Math.sqrt((m.x - baseCenterX) ** 2 + (m.y - baseCenterY) ** 2);
        
        if (Math.abs(distToCenter - 120) < m.radius + 15 && !m.isDeflected) {
          // Check if meteor angle aligns with shield revolve arc (shield spans shieldAngle +/- 0.6 rads)
          const angleToMeteor = Math.atan2(m.y - baseCenterY, m.x - baseCenterX);
          
          // Normalize angleToMeteor relative to shield arc
          let deltaAngle = Math.abs(angleToMeteor - this.shieldAngle);
          if (deltaAngle > Math.PI) deltaAngle = Math.PI * 2 - deltaAngle;

          if (deltaAngle < 0.65) {
            sfx.playBounce();
            this.score += 15;
            this.updateHUD();
            
            // Deflect away from spaceship center
            m.isDeflected = true;
            m.vx = Math.cos(angleToMeteor) * 8.5;
            m.vy = Math.sin(angleToMeteor) * 8.5;
            this.spawnExplosionParticles(m.x, m.y, '#38bdf8', 'star', 12);
          }
        }

        // 2. Spaceship impact: cockpit center collision
        if (distToCenter < m.radius + 40) {
          sfx.playPop();
          this.lives--;
          this.updateHUD();
          this.spawnExplosionParticles(m.x, m.y, '#ef4444', 'bubble', 20);
          this.meteors.splice(i, 1);

          if (this.lives <= 0) this.transitionToState('gameover');
          continue;
        }

        // Out of bounds deflections
        if (m.y > h || m.x < 0 || m.x > w || m.y < -50) {
          this.meteors.splice(i, 1);
        }
      }
    }
  }

  spawnExplosionParticles(x, y, color, type, amount) {
    for (let i = 0; i < amount; i++) {
      this.particles.push(new Particle(x, y, color, type));
    }
  }

  burstBalloon(b, hitGround) {
    sfx.playPop();
    this.spawnExplosionParticles(b.x, b.y, b.color, 'bubble', 20);

    if (hitGround) {
      this.lives--;
      this.updateHUD();
      if (this.lives <= 0) this.transitionToState('gameover');
    }
  }

  drawLaserBlades() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const px = this.puppetXTarget * w;
    const py = h - 120;
    
    // Smooth wrists trails
    const lhx = px - 32 - this.leftHandTargetOffset.x * 220;
    const lhy = py + 38 + this.leftHandTargetOffset.y * 220;
    
    const rhx = px + 32 - this.rightHandTargetOffset.x * 220;
    const rhy = py + 38 + this.rightHandTargetOffset.y * 220;

    this.drawGlowingSword(ctx, lhx, lhy, '#38bdf8');
    this.drawGlowingSword(ctx, rhx, rhy, '#ec4899');
  }

  drawGlowingSword(ctx, x, y, color) {
    ctx.save();
    
    // 1. Draw Blade (glowing outer laser casing)
    ctx.shadowBlur = 24;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x, y - 75); // 85px tall glowing blade
    ctx.stroke();
    
    // Core white-hot laser glow (blazing center)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y - 70);
    ctx.stroke();
    
    // 2. Draw Crossguard (hilt bar protecting the hands)
    ctx.fillStyle = '#64748b'; // Slate steel metal
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 3. Draw Handle (grip grip)
    ctx.fillStyle = '#1e293b'; // Dark grip
    ctx.beginPath();
    ctx.rect(x - 4, y + 10, 8, 26);
    ctx.fill();
    
    // 4. Draw Pommel gemstone
    ctx.fillStyle = '#f59e0b'; // Golden pommel gem
    ctx.beginPath();
    ctx.arc(x, y + 36, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  drawPetsBurrows() {
    const ctx = this.ctx;
    this.burrowPositions.forEach((pos) => {
      ctx.save();
      
      // Draw dark oval hole background
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 60, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Hole frame rind border
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 60, 20, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  drawToyHammers() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Track hand coordinates (mapped to align perfectly with burrow holes when hands are raised)
    const lhx = px - 32 - this.leftHandTargetOffset.x * 220;
    const lhy = h * 0.75 + 100 + this.leftHandTargetOffset.y * 180;
    
    const rhx = px + 32 - this.rightHandTargetOffset.x * 220;
    const rhy = h * 0.75 + 100 + this.rightHandTargetOffset.y * 180;

    // Draw left hammer (blue) and right hammer (pink/red)
    this.drawSingleHammer(ctx, lhx, lhy, '#38bdf8', '#0369a1');
    this.drawSingleHammer(ctx, rhx, rhy, '#ec4899', '#9d174d');
  }

  drawSingleHammer(ctx, x, y, color, strokeColor) {
    ctx.save();
    
    // 1. Handle (Yellow plastic grip shaft going downwards)
    ctx.fillStyle = '#fbbf24'; // Golden yellow
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x - 6, y + 8, 12, 48, 5);
    ctx.fill();
    ctx.stroke();
    
    // Red rubber grip bands on the handle
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 6, y + 32, 12, 4);
    ctx.fillRect(x - 6, y + 42, 12, 4);
    
    // 2. Hammer Head (Large, rounded whack-a-mole mallet head)
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(x - 38, y - 18, 76, 36, 8);
    ctx.fill();
    ctx.stroke();
    
    // Soft yellow rubber impact cushions on the left and right sides
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(x - 38, y, 6, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 38, y, 6, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // White star icon in the center of the mallet head
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Fredoka';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x, y);

    ctx.restore();
  }

  drawCosmicCockpit() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    const cx = this.cosmicCockpitX;
    const cy = this.cosmicCockpitY;

    ctx.save();

    // 1. Draw glowing dashboard dome cockpit sphere frame
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Draw active glowing revolving energy shield arc
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#38bdf8';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    let drawAngle = this.shieldAngle;
    if (drawAngle < 0) drawAngle += Math.PI * 2; // Force strictly positive angles to guarantee top-arc rendering on all browsers
    ctx.arc(cx, cy, 120, drawAngle - 0.6, drawAngle + 0.6);
    ctx.stroke();

    // 3. Draw player central spaceship core capsule cockpit
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw little details inside reactor cockpit
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();

    // Glowing core reactor pulsing
    ctx.fillStyle = '#f472b6';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f472b6';
    const corePulse = Math.sin(this.frameCount * 0.08) * 4 + 10;
    ctx.beginPath();
    ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  game.start();
});
