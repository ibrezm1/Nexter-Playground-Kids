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
    
    const baseSpeed = Math.random() * 0.6 + 10.2; // Faster balloon falling speed (1.2 to 1.8)
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

// Helper 2-bone Inverse Kinematics solver
function solve2BoneIK(rootX, rootY, targetX, targetY, L1, L2, bendOutward) {
  const dx = targetX - rootX;
  const dy = targetY - rootY;
  const dist = Math.hypot(dx, dy);
  // Strictly prevent limb stretch: clamp distance to physically possible reach
  const d = Math.max(1, Math.min(L1 + L2 - 0.05, dist));
  const baseAngle = Math.atan2(dy, dx);

  // Law of Cosines
  let cosAngle = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  cosAngle = Math.max(-1, Math.min(1, cosAngle));
  const angleAlpha = Math.acos(cosAngle);

  const jointAngle = bendOutward ? (baseAngle - angleAlpha) : (baseAngle + angleAlpha);
  const jointX = rootX + Math.cos(jointAngle) * L1;
  const jointY = rootY + Math.sin(jointAngle) * L1;

  // Actual clamped end position
  const endAngle = Math.atan2(targetY - rootY, targetX - rootX);
  const endX = rootX + Math.cos(endAngle) * d;
  const endY = rootY + Math.sin(endAngle) * d;

  return {
    joint: { x: jointX, y: jointY },
    end: { x: endX, y: endY }
  };
}

export class PuppyPuppet {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 120;
    this.radius = 65;

    // Limb bone lengths strictly in proportion to dog size (torso height ~88px, width ~116px)
    // Arms: upper arm 22px, forearm 20px -> max reach ~41.5px (never stretches beyond this!)
    this.L1_arm = 22;
    this.L2_arm = 20;
    this.maxArmReach = 41.5;
    this.minArmReach = 14;

    // Legs: thigh 20px, shin 19px -> max reach ~38.5px (never stretches beyond this!)
    this.L1_leg = 20;
    this.L2_leg = 19;
    this.maxLegReach = 38.5;
    this.minLegReach = 14;

    // Animation & physics states
    this.tailWagAngle = 0;
    this.earFlopOffset = 0;
    this.bodyBounceOffset = 0;
    this.velocity = 0;
    this.lastX = this.x;

    // Target and current local limb offsets (relative to shoulders/hips)
    this.leftPawOffset = { x: -6, y: 34 };
    this.rightPawOffset = { x: 6, y: 34 };
    this.leftPawCurrent = { x: -6, y: 34 };
    this.rightPawCurrent = { x: 6, y: 34 };

    this.leftFootOffset = { x: -6, y: 32 };
    this.rightFootOffset = { x: 6, y: 32 };
    this.leftFootCurrent = { x: -6, y: 32 };
    this.rightFootCurrent = { x: 6, y: 32 };

    // World-space positions of limbs (used for rendering & balloon collisions)
    this.leftPawWorld = { x: this.x - 34, y: this.y + 52 };
    this.rightPawWorld = { x: this.x + 34, y: this.y + 52 };
    this.leftFootWorld = { x: this.x - 32, y: this.y + 66 };
    this.rightFootWorld = { x: this.x + 32, y: this.y + 66 };

    // Jumping physics
    this.jumpY = 0;
    this.jumpVelocity = 0;
    this.gravity = 0.95;
    this.isPuppyJumping = false;
    this.wasPlayerJumping = false;
  }

  // Getters for precise collision detection with balloons
  get leftPaw() {
    return { x: this.leftPawWorld.x, y: this.leftPawWorld.y };
  }
  get rightPaw() {
    return { x: this.rightPawWorld.x, y: this.rightPawWorld.y };
  }
  get leftFoot() {
    return { x: this.leftFootWorld.x, y: this.leftFootWorld.y };
  }
  get rightFoot() {
    return { x: this.rightFootWorld.x, y: this.rightFootWorld.y };
  }

  // Backwards compatibility getters
  get leftHandCurrent() {
    return {
      x: this.leftPawWorld.x - (this.x - 28),
      y: this.leftPawWorld.y - (this.y + 18 + this.jumpY)
    };
  }
  get rightHandCurrent() {
    return {
      x: this.rightPawWorld.x - (this.x + 28),
      y: this.rightPawWorld.y - (this.y + 18 + this.jumpY)
    };
  }
  get leftLegCurrent() {
    return {
      x: this.leftFootWorld.x - (this.x - 26),
      y: this.leftFootWorld.y - (this.y + 34 + this.jumpY)
    };
  }
  get rightLegCurrent() {
    return {
      x: this.rightFootWorld.x - (this.x + 26),
      y: this.rightFootWorld.y - (this.y + 34 + this.jumpY)
    };
  }

  update(
    targetX,
    frameCount,
    leftHandOffset = { x: 0, y: 0 },
    rightHandOffset = { x: 0, y: 0 },
    leftLegOffset = { x: 0, y: 0 },
    rightLegOffset = { x: 0, y: 0 },
    hasLegTracking = false,
    isPlayerJumping = false
  ) {
    this.velocity = targetX - this.x;
    this.x = targetX;

    // Subtle natural puppy secondary motions
    const wagSpeed = Math.abs(this.velocity) > 1 ? 0.35 : 0.09;
    this.tailWagAngle = Math.sin(frameCount * wagSpeed) * 0.52;
    this.earFlopOffset = Math.sin(frameCount * 0.15) * 4 + (Math.abs(this.velocity) * 0.18);
    this.bodyBounceOffset = Math.sin(frameCount * 0.08) * 2.8;

    // Handle jumping
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

    // --- 1. ARM KINEMATICS (In relation to puppy size, never stretchy) ---
    // Natural resting arm target: hands hang down slightly outward
    const baseArmRestLeft = { x: -6, y: 34 };
    const baseArmRestRight = { x: 6, y: 34 };

    // Move in relation with user's hands
    const rawLeftPawTargetX = baseArmRestLeft.x - leftHandOffset.x * 32;
    const rawLeftPawTargetY = baseArmRestLeft.y + leftHandOffset.y * 30;

    const rawRightPawTargetX = baseArmRestRight.x - rightHandOffset.x * 32;
    const rawRightPawTargetY = baseArmRestRight.y + rightHandOffset.y * 30;

    // Strict distance clamp from shoulder joint so the arm NEVER stretches beyond maxArmReach
    const clampArmLimb = (tx, ty) => {
      const dist = Math.hypot(tx, ty);
      const angle = Math.atan2(ty, tx);
      const clampedDist = Math.max(this.minArmReach, Math.min(this.maxArmReach, dist));
      return {
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist
      };
    };

    const targetLeftArm = clampArmLimb(rawLeftPawTargetX, rawLeftPawTargetY);
    const targetRightArm = clampArmLimb(rawRightPawTargetX, rawRightPawTargetY);

    // Smooth lerp to current paw positions
    this.leftPawCurrent.x += (targetLeftArm.x - this.leftPawCurrent.x) * 0.38;
    this.leftPawCurrent.y += (targetLeftArm.y - this.leftPawCurrent.y) * 0.38;
    this.rightPawCurrent.x += (targetRightArm.x - this.rightPawCurrent.x) * 0.38;
    this.rightPawCurrent.y += (targetRightArm.y - this.rightPawCurrent.y) * 0.38;

    // Safety enforce hard physical limit
    const enforceArmLimit = (cur) => {
      const d = Math.hypot(cur.x, cur.y);
      if (d > this.maxArmReach) {
        const s = this.maxArmReach / d;
        cur.x *= s;
        cur.y *= s;
      }
    };
    enforceArmLimit(this.leftPawCurrent);
    enforceArmLimit(this.rightPawCurrent);

    // --- 2. LEG KINEMATICS (In relation to puppy size, never stretchy) ---
    // Ground level relative to hip joint
    const baseLegRestLeft = { x: -6, y: 32 };
    const baseLegRestRight = { x: 6, y: 32 };

    let targetLeftLeg = { ...baseLegRestLeft };
    let targetRightLeg = { ...baseLegRestRight };

    if (this.isPuppyJumping) {
      // Puppy tucks legs up during jumps
      targetLeftLeg = { x: -3, y: 18 };
      targetRightLeg = { x: 3, y: 18 };
    } else if (hasLegTracking) {
      // Move in direct relation with the user's legs!
      // When user lifts foot/knee (offset.y is negative), puppy lifts paw up
      const rawLegLX = baseLegRestLeft.x - leftLegOffset.x * 24;
      const rawLegLY = baseLegRestLeft.y + leftLegOffset.y * 26;

      const rawLegRX = baseLegRestRight.x - rightLegOffset.x * 24;
      const rawLegRY = baseLegRestRight.y + rightLegOffset.y * 26;

      targetLeftLeg = { x: rawLegLX, y: rawLegLY };
      targetRightLeg = { x: rawLegRX, y: rawLegRY };
    } else if (Math.abs(this.velocity) > 0.4) {
      // Procedural trot walk cycle when player leans/moves horizontally
      const walkCycle = frameCount * 0.24;
      const stepX = Math.sin(walkCycle) * 10;
      const stepY = -Math.max(0, Math.cos(walkCycle)) * 9;

      const stepRX = Math.sin(walkCycle + Math.PI) * 10;
      const stepRY = -Math.max(0, Math.cos(walkCycle + Math.PI)) * 9;

      targetLeftLeg = { x: baseLegRestLeft.x + stepX, y: baseLegRestLeft.y + stepY };
      targetRightLeg = { x: baseLegRestRight.x + stepRX, y: baseLegRestRight.y + stepRY };
    }

    // Strict distance clamp from hip joint so leg NEVER stretches beyond maxLegReach
    const clampLegLimb = (tx, ty) => {
      const dist = Math.hypot(tx, ty);
      const angle = Math.atan2(ty, tx);
      const clampedDist = Math.max(this.minLegReach, Math.min(this.maxLegReach, dist));
      return {
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist
      };
    };

    const clampedTargetLeftLeg = clampLegLimb(targetLeftLeg.x, targetLeftLeg.y);
    const clampedTargetRightLeg = clampLegLimb(targetRightLeg.x, targetRightLeg.y);

    this.leftFootCurrent.x += (clampedTargetLeftLeg.x - this.leftFootCurrent.x) * 0.35;
    this.leftFootCurrent.y += (clampedTargetLeftLeg.y - this.leftFootCurrent.y) * 0.35;
    this.rightFootCurrent.x += (clampedTargetRightLeg.x - this.rightFootCurrent.x) * 0.35;
    this.rightFootCurrent.y += (clampedTargetRightLeg.y - this.rightFootCurrent.y) * 0.35;

    // Safety enforce hard physical leg limit
    const enforceLegLimit = (cur) => {
      const d = Math.hypot(cur.x, cur.y);
      if (d > this.maxLegReach) {
        const s = this.maxLegReach / d;
        cur.x *= s;
        cur.y *= s;
      }
    };
    enforceLegLimit(this.leftFootCurrent);
    enforceLegLimit(this.rightFootCurrent);

    // Update world-space positions
    const py = this.y + this.bodyBounceOffset + this.jumpY;
    const px = this.x;

    const shoulderLeft = { x: px - 28, y: py + 18 };
    const shoulderRight = { x: px + 28, y: py + 18 };
    const hipLeft = { x: px - 26, y: py + 34 };
    const hipRight = { x: px + 26, y: py + 34 };

    this.leftPawWorld = {
      x: shoulderLeft.x + this.leftPawCurrent.x,
      y: shoulderLeft.y + this.leftPawCurrent.y
    };
    this.rightPawWorld = {
      x: shoulderRight.x + this.rightPawCurrent.x,
      y: shoulderRight.y + this.rightPawCurrent.y
    };
    this.leftFootWorld = {
      x: hipLeft.x + this.leftFootCurrent.x,
      y: hipLeft.y + this.leftFootCurrent.y
    };
    this.rightFootWorld = {
      x: hipRight.x + this.rightFootCurrent.x,
      y: hipRight.y + this.rightFootCurrent.y
    };
  }

  // Draw cute rounded paws with pink center pad and toe beans
  drawPawPad(ctx, x, y, radius = 15) {
    ctx.save();
    // Chubby golden brown paw base
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle darker rim for depth
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Soft pink heart/oval center pad
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, radius * 0.52, radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3 adorable pink toe beans
    const beanRadius = radius * 0.22;
    const beanOffset = radius * 0.62;
    const angles = [-Math.PI * 0.75, -Math.PI * 0.5, -Math.PI * 0.25];
    angles.forEach((ang) => {
      const bx = x + Math.cos(ang) * beanOffset;
      const by = y + Math.sin(ang) * beanOffset;
      ctx.beginPath();
      ctx.arc(bx, by, beanRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Render a 2-bone articulated limb with rounded joints
  drawArticulatedLimb(ctx, rootX, rootY, jointX, jointY, endX, endY, lineWidth = 20) {
    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    ctx.lineTo(jointX, jointY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    const py = this.y + this.bodyBounceOffset + this.jumpY;
    const px = this.x;

    // Joint anchor coordinates on the puppy body
    const shoulderLeft = { x: px - 28, y: py + 18 };
    const shoulderRight = { x: px + 28, y: py + 18 };
    const hipLeft = { x: px - 26, y: py + 34 };
    const hipRight = { x: px + 26, y: py + 34 };

    // --- 1. TAIL (Wags behind body) ---
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

    // --- 2. LEGS (Articulated 2-bone IK hind limbs) ---
    // Solve IK for legs: thigh 20px, shin 19px
    // Knees bend outward (left bends outward to screen-left, right to screen-right)
    const ikLeftLeg = solve2BoneIK(
      hipLeft.x,
      hipLeft.y,
      this.leftFootWorld.x,
      this.leftFootWorld.y,
      this.L1_leg,
      this.L2_leg,
      true // outward bend
    );
    const ikRightLeg = solve2BoneIK(
      hipRight.x,
      hipRight.y,
      this.rightFootWorld.x,
      this.rightFootWorld.y,
      this.L1_leg,
      this.L2_leg,
      false // outward bend
    );

    // Hip socket shadow circles for natural anatomical depth
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(hipLeft.x, hipLeft.y, 16, 0, Math.PI * 2);
    ctx.arc(hipRight.x, hipRight.y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Draw left and right legs
    this.drawArticulatedLimb(
      ctx,
      hipLeft.x,
      hipLeft.y,
      ikLeftLeg.joint.x,
      ikLeftLeg.joint.y,
      ikLeftLeg.end.x,
      ikLeftLeg.end.y,
      20
    );
    this.drawArticulatedLimb(
      ctx,
      hipRight.x,
      hipRight.y,
      ikRightLeg.joint.x,
      ikRightLeg.joint.y,
      ikRightLeg.end.x,
      ikRightLeg.end.y,
      20
    );

    // Draw feet paws
    this.drawPawPad(ctx, ikLeftLeg.end.x, ikLeftLeg.end.y, 15);
    this.drawPawPad(ctx, ikRightLeg.end.x, ikRightLeg.end.y, 15);

    // --- 3. BODY (Golden brown with cream belly patch) ---
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(px, py + 20, 58, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cream chest/belly patch
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(px, py + 24, 28, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 4. ARMS / HANDS (Articulated 2-bone IK forelimbs) ---
    // Solve IK for arms: upper arm 22px, forearm 20px
    // Elbows bend outward (left bends outward to screen-left, right to screen-right)
    const ikLeftArm = solve2BoneIK(
      shoulderLeft.x,
      shoulderLeft.y,
      this.leftPawWorld.x,
      this.leftPawWorld.y,
      this.L1_arm,
      this.L2_arm,
      true // outward bend
    );
    const ikRightArm = solve2BoneIK(
      shoulderRight.x,
      shoulderRight.y,
      this.rightPawWorld.x,
      this.rightPawWorld.y,
      this.L1_arm,
      this.L2_arm,
      false // outward bend
    );

    // Shoulder anchor joints
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(shoulderLeft.x, shoulderLeft.y, 12, 0, Math.PI * 2);
    ctx.arc(shoulderRight.x, shoulderRight.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw left and right arms
    this.drawArticulatedLimb(
      ctx,
      shoulderLeft.x,
      shoulderLeft.y,
      ikLeftArm.joint.x,
      ikLeftArm.joint.y,
      ikLeftArm.end.x,
      ikLeftArm.end.y,
      19
    );
    this.drawArticulatedLimb(
      ctx,
      shoulderRight.x,
      shoulderRight.y,
      ikRightArm.joint.x,
      ikRightArm.joint.y,
      ikRightArm.end.x,
      ikRightArm.end.y,
      19
    );

    // Draw front paws
    this.drawPawPad(ctx, ikLeftArm.end.x, ikLeftArm.end.y, 15);
    this.drawPawPad(ctx, ikRightArm.end.x, ikRightArm.end.y, 15);

    // --- 5. HEAD ---
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(px, py - 20, 48, 0, Math.PI * 2);
    ctx.fill();

    // --- 6. FLOPPY EARS ---
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

    // --- 7. MUZZLE & NOSE ---
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(px - 14, py - 12, 18, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(px + 14, py - 12, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink tongue & mouth line
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

    // Shiny black puppy nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(px, py - 18, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px - 4, py - 20, 4, 2, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // --- 8. EYES ---
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px - 20, py - 30, 10, 0, Math.PI * 2);
    ctx.arc(px + 20, py - 30, 10, 0, Math.PI * 2);
    ctx.fill();

    // Multi-layer sparkling catchlights
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
