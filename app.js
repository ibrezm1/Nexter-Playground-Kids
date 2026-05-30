/**
 * app.js
 * Kids Motion Playground - Unified Motion-Controlled Games Engine (Nex-Style)
 * Includes: Puppy Bounce, Fruit Slasher, Pat-the-Pets, and Cosmic Defender.
 */

// ==========================================
// 1. Synthesized Audio Engine (Web Audio)
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("AudioContext not supported or blocked:", e);
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {
        console.warn("AudioContext resume failed:", e);
      }
    }
  }

  playBounce() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn("playBounce failed:", e);
    }
  }

  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("playPop failed:", e);
    }
  }

  playSlash() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {
      console.warn("playSlash failed:", e);
    }
  }

  playBombBlast() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.35);
      
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn("playBombBlast failed:", e);
    }
  }

  playLevelUp() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        
        gain.gain.setValueAtTime(0.15, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } catch (e) {
      console.warn("playLevelUp failed:", e);
    }
  }

  playGameOver() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392.00, 349.23, 311.13, 246.94];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.15);
        
        gain.gain.setValueAtTime(0.2, now + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.4);
      });
    } catch (e) {
      console.warn("playGameOver failed:", e);
    }
  }

  playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn("playTick failed:", e);
    }
  }
}

const sfx = new SoundSynth();

// ==========================================
// 2. Particle Effect System (Pop stars & splatters)
// ==========================================
class Particle {
  constructor(x, y, color, type = 'bubble') {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 6 + 4;
    this.color = color;
    this.type = type; // bubble, juice, star
    
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7 + (type === 'juice' ? 5 : 3);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.gravity = type === 'juice' ? 0.3 : 0.18;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.02 + 0.02;
  }

  update() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    
    ctx.beginPath();
    if (this.type === 'star') {
      // Draw a visual star shape
      const rot = Math.PI / 2 * 3;
      let cx = this.x, cy = this.y;
      let spikes = 5, outerRadius = this.radius, innerRadius = this.radius / 2;
      let x = cx, y = cy, step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot + i * step * 2) * outerRadius;
        y = cy + Math.sin(rot + i * step * 2) * outerRadius;
        ctx.lineTo(x, y);
        x = cx + Math.cos(rot + (i * 2 + 1) * step) * innerRadius;
        y = cy + Math.sin(rot + (i * 2 + 1) * step) * innerRadius;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      // Simple circle bubble/juice
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
}

// ==========================================
// 3. Puppy Balloon Bounce Entities
// ==========================================
class Balloon {
  constructor(canvasWidth, level) {
    this.canvasWidth = canvasWidth;
    this.radius = Math.random() * 25 + 30;
    this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
    this.y = -this.radius;
    
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    const baseSpeed = Math.random() * 1.5 + 1.2;
    const speedMultiplier = 1.0 + (level - 1) * 0.25;
    this.vy = baseSpeed * speedMultiplier;
    
    this.vx = 0;
    this.windFrequency = Math.random() * 0.02 + 0.01;
    this.windAmplitude = level > 1 ? Math.random() * 1.2 + 0.8 : 0;
    this.oscillationOffset = Math.random() * 100;
  }

  update(tickCount, level) {
    this.y += this.vy;
    
    if (level > 1) {
      this.vx = Math.sin(tickCount * this.windFrequency + this.oscillationOffset) * this.windAmplitude;
      this.x += this.vx;
      
      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.vx *= -1;
      } else if (this.x + this.radius > this.canvasWidth) {
        this.x = this.canvasWidth - this.radius;
        this.vx *= -1;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.radius);
    ctx.bezierCurveTo(
      this.x - 8, this.y + this.radius + 15,
      this.x + 8, this.y + this.radius + 30,
      this.x, this.y + this.radius + 45
    );
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.radius - 2);
    ctx.lineTo(this.x - 7, this.y + this.radius + 8);
    ctx.lineTo(this.x + 7, this.y + this.radius + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(
      this.x - this.radius * 0.35, 
      this.y - this.radius * 0.35, 
      this.radius * 0.25, 
      this.radius * 0.15, 
      Math.PI / 4, 
      0, 
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
}

class PuppyPuppet {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 120;
    this.radius = 65;
    
    this.tailWagAngle = 0;
    this.earFlopOffset = 0;
    this.bodyBounceOffset = 0;
    this.velocity = 0;
    this.lastX = this.x;

    this.leftHandTarget = { x: 0, y: 0 };
    this.rightHandTarget = { x: 0, y: 0 };
    this.leftHandCurrent = { x: 0, y: 0 };
    this.rightHandCurrent = { x: 0, y: 0 };

    this.leftLegCurrent = { x: -38, y: 44 };
    this.rightLegCurrent = { x: 38, y: 44 };

    this.jumpY = 0;
    this.jumpVelocity = 0;
    this.gravity = 0.52;
    this.isPuppyJumping = false;
  }

  update(targetX, frameCount, leftHandOffset = { x: 0, y: 0 }, rightHandOffset = { x: 0, y: 0 }, isPlayerJumping = false) {
    this.velocity = targetX - this.x;
    this.x = targetX;
    
    const wagSpeed = Math.abs(this.velocity) > 1 ? 0.35 : 0.08;
    this.tailWagAngle = Math.sin(frameCount * wagSpeed) * 0.5;
    this.earFlopOffset = Math.sin(frameCount * 0.15) * 4 + (Math.abs(this.velocity) * 0.15);
    this.bodyBounceOffset = Math.sin(frameCount * 0.07) * 3;

    this.leftHandTarget.x = -leftHandOffset.x * 42;
    this.leftHandTarget.y = leftHandOffset.y * 38;
    this.rightHandTarget.x = -rightHandOffset.x * 42;
    this.rightHandTarget.y = rightHandOffset.y * 38;

    const maxReach = 50;
    this.leftHandTarget.x = Math.max(-maxReach, Math.min(maxReach, this.leftHandTarget.x));
    this.leftHandTarget.y = Math.max(-maxReach, Math.min(maxReach, this.leftHandTarget.y));
    this.rightHandTarget.x = Math.max(-maxReach, Math.min(maxReach, this.rightHandTarget.x));
    this.rightHandTarget.y = Math.max(-maxReach, Math.min(maxReach, this.rightHandTarget.y));

    this.leftHandCurrent.x += (this.leftHandTarget.x - this.leftHandCurrent.x) * 0.22;
    this.leftHandCurrent.y += (this.leftHandTarget.y - this.leftHandCurrent.y) * 0.22;
    this.rightHandCurrent.x += (this.rightHandTarget.x - this.rightHandCurrent.x) * 0.22;
    this.rightHandCurrent.y += (this.rightHandTarget.y - this.rightHandCurrent.y) * 0.22;

    if (this.isPuppyJumping) {
      this.leftLegCurrent.x += (-28 - this.leftLegCurrent.x) * 0.2;
      this.leftLegCurrent.y += (24 - this.leftLegCurrent.y) * 0.2;
      this.rightLegCurrent.x += (28 - this.rightLegCurrent.x) * 0.2;
      this.rightLegCurrent.y += (24 - this.rightLegCurrent.y) * 0.2;
    } else if (Math.abs(this.velocity) > 0.4) {
      const cycle = Math.sin(frameCount * 0.2);
      this.leftLegCurrent.x += ((-38 + cycle * 14) - this.leftLegCurrent.x) * 0.35;
      this.leftLegCurrent.y += ((44 + Math.abs(cycle) * 7) - this.leftLegCurrent.y) * 0.35;
      this.rightLegCurrent.x += ((38 - cycle * 14) - this.rightLegCurrent.x) * 0.35;
      this.rightLegCurrent.y += ((44 + Math.abs(cycle) * 7) - this.rightLegCurrent.y) * 0.35;
    } else {
      this.leftLegCurrent.x += (-38 - this.leftLegCurrent.x) * 0.15;
      this.leftLegCurrent.y += (44 - this.leftLegCurrent.y) * 0.15;
      this.rightLegCurrent.x += (38 - this.rightLegCurrent.x) * 0.15;
      this.rightLegCurrent.y += (44 - this.rightLegCurrent.y) * 0.15;
    }

    if (isPlayerJumping && !this.isPuppyJumping) {
      this.isPuppyJumping = true;
      this.jumpVelocity = -12.5;
    }

    if (this.isPuppyJumping) {
      this.jumpY += this.jumpVelocity;
      this.jumpVelocity += this.gravity;
      if (this.jumpY >= 0) {
        this.jumpY = 0;
        this.jumpVelocity = 0;
        this.isPuppyJumping = false;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    const py = this.y + this.bodyBounceOffset + this.jumpY;
    const px = this.x;

    // 1. Draw Tail
    ctx.save();
    ctx.translate(px - 45, py + 25);
    ctx.rotate(-Math.PI / 4 + this.tailWagAngle);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(30, -5, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(50, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Legs
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(px - 34, py + 26, 20, 0, Math.PI * 2);
    ctx.arc(px + 34, py + 26, 20, 0, Math.PI * 2);
    ctx.fill();

    const llx = px + this.leftLegCurrent.x;
    const lly = py + this.leftLegCurrent.y;
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(llx, lly, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(llx, lly + 3, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(llx - 8, lly - 5, 4, 0, Math.PI * 2);
    ctx.arc(llx, lly - 8, 4, 0, Math.PI * 2);
    ctx.arc(llx + 8, lly - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    const rlx = px + this.rightLegCurrent.x;
    const rly = py + this.rightLegCurrent.y;
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(rlx, rly, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(rlx, rly + 3, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rlx - 8, rly - 5, 4, 0, Math.PI * 2);
    ctx.arc(rlx, rly - 8, 4, 0, Math.PI * 2);
    ctx.arc(rlx + 8, rly - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Body
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(px, py + 20, 60, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(px, py + 25, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Arms
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const leftPawX = px - 32 + this.leftHandCurrent.x;
    const leftPawY = py + 38 + this.leftHandCurrent.y;
    ctx.beginPath();
    ctx.moveTo(px - 30, py + 22);
    ctx.lineTo(leftPawX, leftPawY);
    ctx.stroke();

    const rightPawX = px + 32 + this.rightHandCurrent.x;
    const rightPawY = py + 38 + this.rightHandCurrent.y;
    ctx.beginPath();
    ctx.moveTo(px + 30, py + 22);
    ctx.lineTo(rightPawX, rightPawY);
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(leftPawX, leftPawY, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(leftPawX, leftPawY + 3, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(leftPawX - 8, leftPawY - 5, 4, 0, Math.PI * 2);
    ctx.arc(leftPawX, leftPawY - 8, 4, 0, Math.PI * 2);
    ctx.arc(leftPawX + 8, leftPawY - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(rightPawX, rightPawY, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(rightPawX, rightPawY + 3, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightPawX - 8, rightPawY - 5, 4, 0, Math.PI * 2);
    ctx.arc(rightPawX, rightPawY - 8, 4, 0, Math.PI * 2);
    ctx.arc(rightPawX + 8, rightPawY - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Head
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(px, py - 20, 48, 0, Math.PI * 2);
    ctx.fill();

    // 7. Ears
    ctx.save();
    ctx.translate(px - 42, py - 35);
    ctx.rotate(0.2 + this.earFlopOffset * 0.02);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 30, 14, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(px + 42, py - 35);
    ctx.rotate(-0.2 - this.earFlopOffset * 0.02);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 30, 14, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Muzzle & Nose
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(px - 14, py - 12, 18, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(px + 14, py - 12, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(px, py - 2, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py - 2);
    ctx.lineTo(px, py + 8);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(px, py - 18, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 9. Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px - 20, py - 30, 10, 0, Math.PI * 2);
    ctx.arc(px + 20, py - 30, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px - 23, py - 33, 4, 0, Math.PI * 2);
    ctx.arc(px + 17, py - 33, 4, 0, Math.PI * 2);
    ctx.arc(px - 17, py - 27, 2, 0, Math.PI * 2);
    ctx.arc(px + 23, py - 27, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ==========================================
// 4. Magic Fruit Slasher Entities
// ==========================================
class FruitPiece {
  constructor(x, y, color, side) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.color = color;
    this.side = side; // -1 = left piece, 1 = right piece
    
    this.vx = side * (Math.random() * 3 + 2);
    this.vy = -Math.random() * 4 - 2;
    this.gravity = 0.3;
    this.rotation = 0;
    this.rotSpeed = side * 0.15;
    this.alpha = 1.0;
  }

  update() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.alpha -= 0.02;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw sliced half moon shape
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Rind
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.restore();
  }
}

class Fruit {
  constructor(canvasWidth, level) {
    this.canvasWidth = canvasWidth;
    this.radius = Math.random() * 12 + 28;
    this.x = Math.random() * (canvasWidth - 100) + 50;
    this.y = canvasWidth * 0.7; // Start low on the screen
    
    this.isBomb = Math.random() < 0.22; // 22% are bombs
    
    // Propel fruit UP
    const force = Math.random() * 3 + 9;
    this.vx = (canvasWidth / 2 - this.x) * 0.015 + (Math.random() * 2 - 1);
    this.vy = -force;
    this.gravity = 0.22;
    this.isSliced = false;

    const fruitColors = ['#ef4444', '#ec4899', '#f59e0b', '#eab308', '#a855f7'];
    this.color = fruitColors[Math.floor(Math.random() * fruitColors.length)];
    this.icon = this.isBomb ? '💣' : ['🍉', '🍓', '🍊', '🍍', '🍌'][Math.floor(Math.random() * 5)];
  }

  update() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
  }

  draw(ctx) {
    if (this.isSliced) return;
    
    ctx.save();
    
    // Draw outer body glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.isBomb ? '#ef4444' : this.color;
    
    // Draw sphere background
    ctx.fillStyle = this.isBomb ? '#1e293b' : this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Draw Emoji icon
    ctx.save();
    ctx.font = `${this.radius * 1.25}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, this.x, this.y);
    ctx.restore();
  }
}

// ==========================================
// 5. Pat-the-Pets Entities
// ==========================================
class Pet {
  constructor(burrowIndex, bx, by) {
    this.burrowIndex = burrowIndex;
    this.x = bx;
    this.y = by; // Center base of burrow hole
    
    this.radius = 45;
    this.state = 'spawning'; // spawning, active, retracting, patted
    this.animY = 0; // offset upwards
    this.maxHeight = 65;
    this.visibleTimer = 110; // Pop duration frames

    this.isHedgehog = Math.random() < 0.25; // 25% decoy spikes
    this.icon = this.isHedgehog ? '🦔' : ['🐰', '🐹', '🐦', '🐶'][Math.floor(Math.random() * 4)];
  }

  update() {
    if (this.state === 'spawning') {
      this.animY += 4.5;
      if (this.animY >= this.maxHeight) {
        this.animY = this.maxHeight;
        this.state = 'active';
      }
    } else if (this.state === 'active') {
      this.visibleTimer--;
      if (this.visibleTimer <= 0) {
        this.state = 'retracting';
      }
    } else if (this.state === 'retracting') {
      this.animY -= 4.5;
      if (this.animY <= 0) {
        this.animY = 0;
        this.state = 'done';
      }
    } else if (this.state === 'patted') {
      // Swirl spin away when patted
      this.animY -= 6;
      if (this.animY <= 0) {
        this.state = 'done';
      }
    }
  }

  draw(ctx) {
    const py = this.y - this.animY;
    
    ctx.save();
    
    // Clip pet rendering below the burrow line
    ctx.beginPath();
    ctx.rect(this.x - 70, this.y - 120, 140, 120);
    ctx.clip();

    // Draw Pet Emoji
    ctx.font = '65px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, this.x, py);

    ctx.restore();
  }
}

// ==========================================
// 6. Cosmic Shield Defender Entities
// ==========================================
class Meteor {
  constructor(canvasWidth, level) {
    this.canvasWidth = canvasWidth;
    this.radius = Math.random() * 10 + 20;
    this.x = Math.random() * (canvasWidth - 60) + 30;
    this.y = -this.radius;
    
    // Aim directly towards the center cockpit base (w/2, h - 130)
    this.targetX = canvasWidth / 2;
    this.targetY = canvasWidth * 0.75; // Approx cockpit height
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const baseSpeed = Math.random() * 2 + 2;
    const multiplier = 1.0 + (level - 1) * 0.3;
    const speed = baseSpeed * multiplier;
    
    this.vx = (dx / distance) * speed;
    this.vy = (dy / distance) * speed;
    this.isDeflected = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.save();
    
    // Meteor design
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.isDeflected ? '#4ade80' : '#f59e0b';
    ctx.fillStyle = '#475569';
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Star spots details
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.2, this.radius * 0.35, 0, Math.PI * 2);
    ctx.arc(this.x + this.radius * 0.4, this.y + this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ==========================================
// 7. Main Unified Game Engine Coordinator
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
    this.lives = 3;
    
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
    this.shieldAngle = Math.PI / 2; // Shield rotation angle

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
      sfx.playBounce();
      this.level++;
      this.timeLeft = 60;
      this.transitionToState('playing');
    });

    // Restart Game button
    document.getElementById('btn-restart').addEventListener('click', () => {
      sfx.playBounce();
      this.score = 0;
      this.level = 1;
      this.lives = 3;
      this.timeLeft = 60;
      this.transitionToState('playing');
    });

    // Keyboard Fallback Controls (Arrow Left/Right for movement, Space for jump)
    window.addEventListener('keydown', (e) => {
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
    for (let i = 0; i < 3; i++) {
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
      this.drawTrackingHandCrosshair();

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
        this.balloons.push(new Balloon(w, this.level));
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
        this.fruits.push(new Fruit(w, this.level));
      }

      // Track player hands pixel coordinates
      const px = this.puppetXTarget * w;
      const py = h - 120;
      const lhx = px - 32 - this.leftHandTargetOffset.x * 42;
      const lhy = py + 38 + this.leftHandTargetOffset.y * 38;
      
      const rhx = px + 32 - this.rightHandTargetOffset.x * 42;
      const rhy = py + 38 + this.rightHandTargetOffset.y * 38;

      for (let i = this.fruits.length - 1; i >= 0; i--) {
        const f = this.fruits[i];
        f.update();

        // Slice detection: check both hands
        const distL = Math.sqrt((f.x - lhx) ** 2 + (f.y - lhy) ** 2);
        const distR = Math.sqrt((f.x - rhx) ** 2 + (f.y - rhy) ** 2);

        if (distL < f.radius + 24 || distR < f.radius + 24) {
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

      // Track hand coordinates
      const px = this.puppetXTarget * w;
      const py = h - 120;
      const lhx = px - 32 - this.leftHandTargetOffset.x * 42;
      const lhy = py + 38 + this.leftHandTargetOffset.y * 38;
      const rhx = px + 32 - this.rightHandTargetOffset.x * 42;
      const rhy = py + 38 + this.rightHandTargetOffset.y * 38;

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
      const spawnRate = Math.max(30, 80 - this.level * 15);
      if (this.frameCount % spawnRate === 0 && this.meteors.length < 6) {
        this.meteors.push(new Meteor(w, this.level));
      }

      // Revolve shield orbit angle smoothly based on horizontal shoulder lean degrees
      this.shieldAngle = this.puppetXTarget * Math.PI;

      const baseCenterY = this.cosmicCockpitY;
      const baseCenterX = this.cosmicCockpitX;

      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.update();

        // 1. Deflect collision: check if meteor hits orbital shield track ring radius (120px)
        const distToCenter = Math.sqrt((m.x - baseCenterX) ** 2 + (m.y - baseCenterY) ** 2);
        
        if (Math.abs(distToCenter - 120) < m.radius + 15 && !m.isDeflected) {
          // Check if meteor angle aligns with shield revolve arc (shield spans shieldAngle +/- 0.5 rads)
          const angleToMeteor = Math.atan2(m.y - baseCenterY, m.x - baseCenterX);
          
          // Normalize angleToMeteor relative to shield arc (0.5 bounds)
          let deltaAngle = Math.abs(angleToMeteor - this.shieldAngle);
          if (deltaAngle > Math.PI) deltaAngle = Math.PI * 2 - deltaAngle;

          if (deltaAngle < 0.55) {
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
    const lhx = px - 32 - this.leftHandTargetOffset.x * 42;
    const lhy = py + 38 + this.leftHandTargetOffset.y * 38;
    
    const rhx = px + 32 - this.rightHandTargetOffset.x * 42;
    const rhy = py + 38 + this.rightHandTargetOffset.y * 38;

    ctx.save();
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 18;

    // Draw Left laser saber blade
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(lhx - 10, lhy + 20);
    ctx.lineTo(lhx + 10, lhy - 45);
    ctx.stroke();

    // Draw Right laser saber blade
    ctx.strokeStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(rhx + 10, rhy + 20);
    ctx.lineTo(rhx - 10, rhy - 45);
    ctx.stroke();

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

  drawTrackingHandCrosshair() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const px = this.puppetXTarget * w;
    const py = h - 120;
    
    const lhx = px - 32 - this.leftHandTargetOffset.x * 42;
    const lhy = py + 38 + this.leftHandTargetOffset.y * 38;
    
    const rhx = px + 32 - this.rightHandTargetOffset.x * 42;
    const rhy = py + 38 + this.rightHandTargetOffset.y * 38;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';

    // Left hand target ring crosshair
    ctx.beginPath();
    ctx.arc(lhx, lhy, 22, 0, Math.PI * 2);
    ctx.stroke();
    // Center glow dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(lhx, lhy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Right hand target ring crosshair
    ctx.beginPath();
    ctx.arc(rhx, rhy, 22, 0, Math.PI * 2);
    ctx.stroke();
    // Center glow dot
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(rhx, rhy, 6, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.arc(cx, cy, 120, this.shieldAngle - 0.5, this.shieldAngle + 0.5);
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
