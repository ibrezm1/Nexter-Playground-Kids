/**
 * puppy.js
 * Puppy Balloon Bounce entities for Kids Motion Playground.
 */

export class Balloon {
  constructor(canvasWidth, level, globalSpeedMultiplier = 1.2) {
    this.canvasWidth = canvasWidth;
    this.radius = Math.random() * 30 + 45; // Bigger balloons (45px to 75px) for easier kid swats
    // Use a center-biased distribution so more balloons spawn in the center than near the edges
    const centerBiasedRand = (Math.random() + Math.random()) / 2;
    this.x = centerBiasedRand * (canvasWidth - this.radius * 2) + this.radius;
    this.y = -this.radius;
    
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    const baseSpeed = Math.random() * 0.4 + 0.7; // Very gentle floaty balloon falling speed (0.7 to 1.1)
    const speedMultiplier = 1.0 + (level - 1) * 0.15; // Moderated level speed scaling
    this.vy = baseSpeed * speedMultiplier * globalSpeedMultiplier;
    
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

export class PuppyPuppet {
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
    this.gravity = 0.95;
    this.isPuppyJumping = false;
    this.wasPlayerJumping = false;
  }

  update(targetX, frameCount, leftHandOffset = { x: 0, y: 0 }, rightHandOffset = { x: 0, y: 0 }, isPlayerJumping = false) {
    this.velocity = targetX - this.x;
    this.x = targetX;
    
    const wagSpeed = Math.abs(this.velocity) > 1 ? 0.35 : 0.08;
    this.tailWagAngle = Math.sin(frameCount * wagSpeed) * 0.5;
    this.earFlopOffset = Math.sin(frameCount * 0.15) * 4 + (Math.abs(this.velocity) * 0.15);
    this.bodyBounceOffset = Math.sin(frameCount * 0.07) * 3;

    this.leftHandTarget.x = -leftHandOffset.x * 60;
    this.leftHandTarget.y = leftHandOffset.y * 55;
    this.rightHandTarget.x = -rightHandOffset.x * 60;
    this.rightHandTarget.y = rightHandOffset.y * 55;

    const maxReach = 72;
    this.leftHandTarget.x = Math.max(-maxReach, Math.min(maxReach, this.leftHandTarget.x));
    this.leftHandTarget.y = Math.max(-maxReach, Math.min(maxReach, this.leftHandTarget.y));
    this.rightHandTarget.x = Math.max(-maxReach, Math.min(maxReach, this.rightHandTarget.x));
    this.rightHandTarget.y = Math.max(-maxReach, Math.min(maxReach, this.rightHandTarget.y));

    this.leftHandCurrent.x += (this.leftHandTarget.x - this.leftHandCurrent.x) * 0.40;
    this.leftHandCurrent.y += (this.leftHandTarget.y - this.leftHandCurrent.y) * 0.40;
    this.rightHandCurrent.x += (this.rightHandTarget.x - this.rightHandCurrent.x) * 0.40;
    this.rightHandCurrent.y += (this.rightHandTarget.y - this.rightHandCurrent.y) * 0.40;

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

    if (isPlayerJumping && !this.wasPlayerJumping && !this.isPuppyJumping) {
      this.isPuppyJumping = true;
      this.jumpVelocity = -17.5;
    }
    this.wasPlayerJumping = isPlayerJumping;

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
