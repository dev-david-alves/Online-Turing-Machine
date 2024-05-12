class State {
  constructor(id, x, y, r, scaleFactor = 1.0) {
    this.id = id;
    this.isStartState = false;
    this.isEndState = false;
    this.isRejectState = false;

    this.scaleFactor = scaleFactor;

    // Dragging
    this.dragging = false;
    this.rollover = false;
    this.selected = false;

    // Position
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;

    // Dimensions
    this.r = r * scaleFactor;

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
    return x > this.x - this.r && x < this.x + this.r && y > this.y - this.r && y < this.y + this.r;
  }

  mouseDragged() {
    if (this.selected) {
      this.dragging = true;
      this.x = mouseX;
      this.y = mouseY;
      console.log("Dragging state");
    }
  }

  mouseReleased() {
    if (this.dragging) {
      this.dragging = false;
      createHistory();
    }
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

    if ((isMouseWithShiftPressed || isMouseLeftPressed || isMouseRightPressed) && this.input.visible) {
      this.input.visible = false;

      createHistory();
    }

    if (this.input.visible && document.activeElement !== this.input.input.elt) {
      this.input.input.elt.focus();
    }
  }

  keyPressed() {
    if (keyCode === ENTER && this.input.visible) {
      this.input.visible = false;

      createHistory();
    }
  }

  draw() {
    push();
    // Different fill based on status
    if (this.rollover) stroke(100, 100, 200);
    if (this.selected) stroke(0, 0, 255);

    fill(255);
    strokeWeight(1 * this.scaleFactor);
    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    if (this.isEndState) ellipse(this.x, this.y, this.r * 1.6, this.r * 1.6);

    pop();
  }
}
