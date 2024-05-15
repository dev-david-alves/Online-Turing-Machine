class State {
  constructor(id, x, y, r) {
    this.id = id;
    this.isStartState = false;
    this.isEndState = false;

    this.scaleFactor = globalScaleFactor;

    // Dragging
    this.dragging = false;
    this.hovering = false;
    this.selected = false;

    // Position
    this.x = x * this.scaleFactor;
    this.y = y * this.scaleFactor;
    this.offsetX = 0;
    this.offsetY = 0;

    // Dimensions
    this.r = r * this.scaleFactor;

    // Text input
    this.input = new CustomInput(-1000, -1000, texMap, "#canvas-container");
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
    let distance = dist(x, y, this.x, this.y);
    return distance < this.r;
  }

  mousePressed() {
    if (this.input.visible) {
      this.input.visible = false;
      createHistory();
    }

    if (this.selected && selectedTopMenuButton === "select") {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
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

  update() {
    if (this.scaleFactor != globalScaleFactor) {
      this.r = (this.r / this.scaleFactor) * globalScaleFactor;
      this.x = (this.x / this.scaleFactor) * globalScaleFactor;
      this.y = (this.y / this.scaleFactor) * globalScaleFactor;
      this.scaleFactor = globalScaleFactor;
    }

    this.x -= movingCanvasOffset.x;
    this.y -= movingCanvasOffset.y;

    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }

    this.input.x = this.x - this.input.width / 2;
    this.input.y = this.y - (this.r + this.input.height + 5 * this.scaleFactor);

    if (this.input.visible && document.activeElement !== this.input.input.elt) {
      this.input.input.elt.focus();
    }

    this.input.update(this.scaleFactor);
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
    strokeWeight(1 * this.scaleFactor);
    if (this.hovering) stroke(17, 82, 140);
    if (this.selected) {
      stroke(23, 98, 163);
      strokeWeight(2 * this.scaleFactor);
    }

    fill(255);
    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    if (this.isEndState) ellipse(this.x, this.y, this.r * 1.6, this.r * 1.6);

    pop();

    push();
    // Different fill based on status
    if (this.hovering) fill(17, 82, 140);
    if (this.selected) fill(23, 98, 163);

    drawText(this.x - (this.input.textWidth / 2) * globalScaleFactor, this.y, this.input.allSubstrings, this.input.fontSize * globalScaleFactor);
    pop();
  }
}
