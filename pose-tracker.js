/**
 * pose-tracker.js
 * Wrapper around MediaPipe Pose for tracking the player's horizontal position.
 */

class PoseTracker {
  constructor() {
    this.videoElement = document.getElementById('webcam');
    this.overlayCanvas = document.getElementById('camera-overlay');
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.statusElement = document.getElementById('camera-status');
    
    this.pose = null;
    this.camera = null;
    
    // Smooth tracked X position using linear interpolation (lerp)
    this.rawTrackedX = 0.5; // range [0, 1]
    this.smoothedTrackedX = 0.5;
    this.lerpFactor = 0.45; // How fast the puppet responds (0.1 = smooth, 1.0 = instant)
    
    this.isTrackingActive = false;
    this.onTrackingCallback = null;
    this.onCalibrationSuccess = null;
    this.calibrationPassed = false;
    this.frameCounter = 0;

    // Head height baseline for jump detection
    this.yBaseline = null;
    this.isJumping = false;
  }

  async initialize() {
    this.updateStatus('Initializing MediaPipe Pose...', 'connecting');

    try {
      // 1. Create MediaPipe Pose Instance
      // Locate WASM binaries from jsdelivr CDN
      this.pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => this.handlePoseResults(results));

      // 2. Start Web Camera
      this.updateStatus('Starting Camera Feed...', 'connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      
      this.videoElement.srcObject = stream;
      
      // Wait for video metadata to load so dimensions are correct
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.overlayCanvas.width = this.videoElement.videoWidth;
          this.overlayCanvas.height = this.videoElement.videoHeight;
          resolve();
        };
      });

      // 3. Initialize MediaPipe Camera helper
      this.camera = new Camera(this.videoElement, {
        onFrame: async () => {
          if (this.pose) {
            await this.pose.send({ image: this.videoElement });
          }
        },
        width: 640,
        height: 480
      });
      
      await this.camera.start();
      this.updateStatus('Camera Connected!', 'ready');
      
    } catch (error) {
      console.error('PoseTracker Initialization failed:', error);
      this.updateStatus('Camera Error! Check Permissions.', 'error');
    }
  }

  updateStatus(message, stateClass) {
    this.statusElement.textContent = message;
    this.statusElement.className = '';
    this.statusElement.classList.add(`status-${stateClass}`);
  }

  handlePoseResults(results) {
    // Clear overlay canvas
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    if (!results.poseLandmarks) {
      this.isTrackingActive = false;
      return;
    }

    this.isTrackingActive = true;
    this.frameCounter++;

    // Draw skeletal landmarks for beautiful kid visual feedback
    this.drawSkeleton(results.poseLandmarks);

    // Track the mid-point of the shoulders (index 11 = left shoulder, 12 = right shoulder)
    // Left shoulder is index 11, Right shoulder is index 12.
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];
    const nose = results.poseLandmarks[0];

    if (leftShoulder && rightShoulder) {
      // Midpoint between shoulders
      const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
      this.rawTrackedX = shoulderMidX;
    } else if (nose) {
      // Fallback to nose tracking
      this.rawTrackedX = nose.x;
    }

    // Clip to range [0.0, 1.0]
    this.rawTrackedX = Math.max(0, Math.min(1, this.rawTrackedX));

    // Smooth position
    this.smoothedTrackedX += (this.rawTrackedX - this.smoothedTrackedX) * this.lerpFactor;

    // Detect jump: measure if head goes significantly above the baseline (lower Y means higher in coordinate space)
    if (nose) {
      const currentY = nose.y;
      if (this.yBaseline === null) {
        this.yBaseline = currentY;
      } else {
        const heightDiff = this.yBaseline - currentY;
        
        // Only adjust the standing baseline height when player is standing relatively still/grounded
        if (heightDiff < 0.038 && heightDiff > -0.038) {
          this.yBaseline += (currentY - this.yBaseline) * 0.02;
        }
        
        // Lowered threshold from 0.075 to 0.038 to make jumping much more sensitive and easy to trigger for kids
        const jumpThreshold = 0.038;
        this.isJumping = heightDiff > jumpThreshold;
      }
    }

    // Trigger update callback for the main game engine
    if (this.onTrackingCallback) {
      const leftWrist = results.poseLandmarks[15];
      const rightWrist = results.poseLandmarks[16];
      
      let leftHandOffset = { x: 0, y: 0 };
      let rightHandOffset = { x: 0, y: 0 };
      
      if (leftShoulder && leftWrist) {
        // Compute displacement relative to shoulder and amplify slightly for dynamic puppet reach
        leftHandOffset.x = (leftWrist.x - leftShoulder.x) * 2.2;
        leftHandOffset.y = (leftWrist.y - leftShoulder.y) * 2.2;
      }
      
      if (rightShoulder && rightWrist) {
        rightHandOffset.x = (rightWrist.x - rightShoulder.x) * 2.2;
        rightHandOffset.y = (rightWrist.y - rightShoulder.y) * 2.2;
      }

      this.onTrackingCallback({
        x: this.smoothedTrackedX,
        leftHand: leftHandOffset,
        rightHand: rightHandOffset,
        isJumping: this.isJumping
      });
    }

    // Trigger one-time calibration success when camera starts sending valid frames
    if (!this.calibrationPassed && this.frameCounter > 15) {
      this.calibrationPassed = true;
      this.updateStatus('Active Player Tracked 🐶', 'ready');
      if (this.onCalibrationSuccess) {
        this.onCalibrationSuccess();
      }
    }
  }

  drawSkeleton(landmarks) {
    const ctx = this.overlayCtx;
    const width = this.overlayCanvas.width;
    const height = this.overlayCanvas.height;

    // Custom stylings for cute skeleton overlay
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#f472b6';

    // 1. Draw connections (shoulders, torso, arms)
    const connections = [
      [11, 12], // Left shoulder to Right shoulder
      [11, 23], // Left shoulder to Left hip
      [12, 24], // Right shoulder to Right hip
      [23, 24], // Left hip to Right hip
      [11, 13], [13, 15], // Left arm (Shoulder-Elbow-Wrist)
      [12, 14], [14, 16]  // Right arm (Shoulder-Elbow-Wrist)
    ];

    ctx.beginPath();
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
      }
    });
    ctx.stroke();

    // 2. Draw key points (only shoulders, elbows, wrists, nose)
    const trackedJoints = [0, 11, 12, 13, 14, 15, 16];
    trackedJoints.forEach((index) => {
      const landmark = landmarks[index];
      if (landmark && landmark.visibility > 0.5) {
        ctx.beginPath();
        // Nose glows red/pink like a puppy nose!
        if (index === 0) {
          ctx.arc(landmark.x * width, landmark.y * height, 10, 0, 2 * Math.PI);
          ctx.fillStyle = '#ff4b82';
        } else {
          ctx.arc(landmark.x * width, landmark.y * height, 7, 0, 2 * Math.PI);
          ctx.fillStyle = '#38bdf8';
        }
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }
}
