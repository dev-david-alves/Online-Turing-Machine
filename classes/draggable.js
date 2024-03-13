// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>

class DraggableCircle {
  constructor(x, y, r, color = { r: 0, g: 0, b: 255 }) {
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.selected = false;
    this.color = color;

    // Position
    this.x = x;
    this.y = y;
    // Dimensions
    this.r = r;
    this.w = r;
  }

  over() {
    // Is mouse over object
    if (mouseX > this.x - this.r && mouseX < this.x + this.r && mouseY > this.y - this.r && mouseY < this.y + this.r) {
      this.rollover = true;
    } else {
      this.rollover = false;
    }

  }

  update() {
    // Adjust location if being dragged
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }
  }

  draw() {
    stroke(0);
    // Different fill based on state
    if (this.rollover && !this.selected) {
      stroke(0, 100, 0);
    } else if (this.selected) {
      stroke(this.color.r, this.color.g, this.color.b);
    } else {
      stroke(0);
    }

    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }

  clicked() {
    // Did I click on the circle?
    if (this.rollover) {
      this.selected = true;
    }
  }

  pressed() {
    // Did I click on the circle?
    if (this.rollover) {
      this.dragging = true;
      // If so, keep track of relative location of click to corner of circle
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }

  released() {
    // Quit dragging
    this.dragging = false;
  }
}