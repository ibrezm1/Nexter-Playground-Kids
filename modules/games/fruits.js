/**
 * fruits.js
 * Fruit Slasher entities for Kids Motion Playground.
 */

export class FruitPiece {
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

export class Fruit {
  constructor(canvasWidth, canvasHeight, level, globalSpeedMultiplier = 1.2) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.radius = Math.random() * 12 + 28;
    this.x = Math.random() * (canvasWidth - 100) + 50;
    this.y = canvasHeight - 20; // Start at the bottom of the canvas instead of offscreen
    
    this.isBomb = Math.random() < 0.22; // 22% are bombs
    
    this.gravity = 0.11; // Float-style gravity
    
    // Calculate a peak height that is always within the top 60% to 75% of the canvas height to prevent going off-screen
    const targetPeakHeight = canvasHeight * (Math.random() * 0.15 + 0.60); 
    
    // vy = -sqrt(2 * gravity * targetPeakHeight)
    this.vy = -Math.sqrt(2 * this.gravity * targetPeakHeight);
    
    // Dampen high speeds slightly based on global multiplier
    this.vy *= (globalSpeedMultiplier * 0.35 + 0.65);
    
    // Calculate the frames it takes to reach the peak height (t = -vy / gravity)
    const tPeak = -this.vy / this.gravity;
    
    // Target a spot near the horizontal center of the screen
    const targetX = canvasWidth / 2 + (Math.random() * 120 - 60);
    const dx = targetX - this.x;
    
    // Calculate required horizontal velocity to peak near the center
    this.vx = (dx / tPeak) * (Math.random() * 0.2 + 0.9);
    
    this.isSliced = false;

    const fruitColors = ['#ef4444', '#ec4899', '#f59e0b', '#eab308', '#a855f7', '#10b981', '#fb7185', '#84cc16'];
    this.color = fruitColors[Math.floor(Math.random() * fruitColors.length)];
    
    // Rich variety of fruits
    const fruitIcons = ['🍉', '🍓', '🍊', '🍍', '🍌', '🍒', '🍇', '🥝', '🍎', '🍐', '🍑', '🍋', '🥭', '🍈'];
    this.icon = this.isBomb ? '💣' : fruitIcons[Math.floor(Math.random() * fruitIcons.length)];
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
    
    // Draw white glossy reflection highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
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

    // Draw Emoji icon
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${this.radius * 1.25}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, this.x, this.y);
    ctx.restore();
  }
}
