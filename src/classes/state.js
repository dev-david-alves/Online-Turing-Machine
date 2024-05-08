class State {
  constructor(id, x, y, r, scaleFactor = 1.0) {
    this.id = id;
    this.isStartState = false;
    this.isEndState = false;
    this.isRejectState = false;

    this.scaleFactor = scaleFactor;

    // Dragging
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.selected = false;

    // Position
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.offsetX = 0;
    this.offsetY = 0;

    // Dimensions
    this.r = r * scaleFactor;
    this.h = this.r * 2;
    this.w = this.r * 2;

    // Text input
    this.input = new CustomInput(-1000, -1000, texMap, scaleFactor, "#canvas-container");
    this.input.input.value("Q_{" + id + "}");
    this.input.textInput("Q_{" + id + "}");
  }

  closestPointOnCircle(x, y) {
    let dx = x - this.x;
    let dy = y - this.y;
    let scale = Math.sqrt(dx * dx + dy * dy);

    return {
      x: this.x + (dx * this.r) / scale,
      y: this.y + (dy * this.r) / scale,
    };
  }

  containsPoint(x, y) {
    return x > this.x - this.w / 2 && x < this.x + this.w / 2 && y > this.y - this.r && y < this.y + this.r;
  }

  mousePressed() {
    // Did I click on the circle?
    if (this.rollover) {
      this.dragging = true;
      // If so, keep track of relative location of click to corner of circle
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }

  mouseReleased() {
    // Quit dragging
    this.dragging = false;
  }

  remove() {
    this.input.input.remove();
  }

  update(scaleFactor = 1.0) {
    if (this.scaleFactor != scaleFactor) {
      this.r = (this.r / this.scaleFactor) * scaleFactor;
      this.x = (this.x / this.scaleFactor) * scaleFactor;
      this.y = (this.y / this.scaleFactor) * scaleFactor;
      this.scaleFactor = scaleFactor;
    }

    this.x -= movingCanvasOffset.x;
    this.y -= movingCanvasOffset.y;

    this.input.x = this.x - this.input.w / 2;
    this.input.y = this.y - (this.r + this.input.h + 5 * this.scaleFactor);

    if (isMouseWithShiftPressed || isMouseLeftPressed || isMouseRightPressed) {
      this.input.visible = false;
    }

    if (this.input.visible && document.activeElement !== this.input.input.elt) {
      this.input.input.elt.focus();
    }

    // this.w = Math.max(this.r * 2, this.input.w + 20 * this.scaleFactor);
    this.w = this.r * 2;

    // Adjust location if being dragged
    if (this.dragging) {
      this.x = this.offsetX + mouseX;
      this.y = this.offsetY + mouseY;
    }
  }

  keyPressed() {
    if (keyCode === ENTER) {
      this.input.visible = false;
    }
  }

  draw() {
    push();
    // Different fill based on state
    if (this.rollover) stroke(100, 100, 200);
    if (this.selected) stroke(0, 0, 255);

    fill(255);
    strokeWeight(1 * this.scaleFactor);
    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.w, this.r * 2);
    if (this.isEndState) ellipse(this.x, this.y, this.w * 0.8, this.r * 1.6);

    pop();
  }
}
