/**
 * particles.js
 * Particle Effect System (Pop stars & splatters) for Kids Motion Playground.
 */

export class Particle {
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
