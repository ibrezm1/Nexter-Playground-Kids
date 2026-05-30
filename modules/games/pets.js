/**
 * pets.js
 * Pat-the-Pets entities for Kids Motion Playground.
 */

export class Pet {
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
