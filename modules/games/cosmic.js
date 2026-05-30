/**
 * cosmic.js
 * Cosmic Shield Defender entities for Kids Motion Playground.
 */

export class Meteor {
  constructor(canvasWidth, level, globalSpeedMultiplier = 1.2) {
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
    
    const baseSpeed = Math.random() * 0.12 + 0.12; // Extreme slow-motion comet falling speed (0.12 to 0.24)
    const multiplier = 1.0 + (level - 1) * 0.08; // Super gentle level speed scaling
    const speed = baseSpeed * multiplier * globalSpeedMultiplier;
    
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
