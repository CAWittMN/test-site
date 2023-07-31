class Circle {
  constructor(x, y, z, radius, color, speed) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
  }

  // Calculate effective radius after scaling based on depth
  getScaledRadius(roomDepth) {
    const scale = roomDepth / (roomDepth + this.z);
    return this.radius * scale;
  }

  isHidden() {
    return this.radius <= 0;
  }

  updateRadius() {
    setInterval(() => {
      // this.radius -= 2 // Adjust the value to control how fast the circles disappear
      this.radius -= 1; // Adjust the value to control how fast the circles disappear
      if (this.radius < 0) {
        this.radius = 0;
      }
    }, 1000 / 60);
  }
}

class Canvas {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawCircle(circleX, circleY, circleRadius, circleColor, blurAmount) {
    this.ctx.save();

    // Create a clipping path to avoid blurring outside the circle
    this.ctx.beginPath();
    this.ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    this.ctx.clip();

    // Apply the blur effect
    this.ctx.filter = `blur(${blurAmount}px)`;
    this.ctx.fillStyle = circleColor;
    this.ctx.fillRect(
      circleX - circleRadius,
      circleY - circleRadius,
      circleRadius * 2,
      circleRadius * 2
    );

    this.ctx.restore();
  }
}

class ParallaxCircles {
  constructor() {
    this.canvas = new Canvas();
    this.roomDepth = 200;
    this.circleCount = 70;
    this.minCircleRadius = 5;
    this.maxCircleRadius = 120;
    this.circleColors = ["#D3D3D3", "#B0C4DE", "#A9A9A9", "#778899"];
    this.circleSpeedMultiplier = 10; // Adjust this value to control the overall speed of circles

    this.circles = [];

    for (let i = 0; i < this.circleCount; i++) {
      const radius =
        Math.random() * (this.maxCircleRadius - this.minCircleRadius) +
        this.minCircleRadius;
      const color =
        this.circleColors[Math.floor(Math.random() * this.circleColors.length)];
      const x =
        Math.random() * (this.canvas.canvas.width + 2 * this.maxCircleRadius) -
        this.maxCircleRadius;
      const y =
        Math.random() * (this.canvas.canvas.height + 2 * this.maxCircleRadius) -
        this.maxCircleRadius;
      const z = Math.random() * this.roomDepth;
      const speed = (1 - z / this.roomDepth) * this.circleSpeedMultiplier;

      this.circles.push(new Circle(x, y, z, radius, color, speed));
    }

    this.prevMouseX = this.canvas.canvas.width / 2;
    this.prevMouseY = this.canvas.canvas.height / 2;
    this.canvas.canvas.addEventListener("mousemove", (event) =>
      this.updateCircles(event)
    );
    this.animate();
  }

  updateCircles(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const dx = mouseX - this.prevMouseX;
    const dy = mouseY - this.prevMouseY;

    for (const circle of this.circles) {
      circle.x += dx * circle.speed * 0.02;
      circle.y += dy * circle.speed * 0.02;
    }

    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;
  }

  animate() {
    this.canvas.clearCanvas();

    this.circles.sort((a, b) => {
      if (a.z !== b.z) {
        return b.z - a.z;
      } else {
        return a.speed - b.speed;
      }
    });

    for (const circle of this.circles) {
      const scale = this.roomDepth / (this.roomDepth + circle.z);
      const circleX =
        this.canvas.canvas.width / 2 +
        (circle.x - this.canvas.canvas.width / 2) * scale;
      const circleY =
        this.canvas.canvas.height / 2 +
        (circle.y - this.canvas.canvas.height / 2) * scale;
      const circleRadius = circle.radius * scale;

      // Calculate blur amount based on the circle's z-depth
      const maxBlurAmount = 70; // Adjust this value to control the maximum blur
      const blurAmount = maxBlurAmount * (1 - scale);

      this.canvas.drawCircle(
        circleX,
        circleY,
        circleRadius,
        circle.color,
        blurAmount
      );
    }

    requestAnimationFrame(() => this.animate());
  }

  hideCircles() {
    for (const circle of this.circles) {
      circle.updateRadius();
    }
  }
}

const parallaxCircles = new ParallaxCircles();

// Add event listener for the "Hide Circles" button
const hideCirclesButton = document.getElementById("hide-circles-button");
hideCirclesButton.addEventListener("click", () =>
  parallaxCircles.hideCircles()
);
