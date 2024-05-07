class StartLink {
  constructor(state, start, scaleFactor = 1.0) {
    this.state = state;
    this.scaleFactor = scaleFactor;
    this.deltaX = 0;
    this.deltaY = 0;
    this.snapToPadding = 6 * this.scaleFactor;
    this.hitTargetPadding = 6 * this.scaleFactor;
    this.isMousePressed = false;
    this.selected = false;
    this.rollover = false;
    this.text = "";

    if (start) this.setAnchorPoint(start.x, start.y);
  }

  containsPoint(x, y) {
    let stuff = this.getEndPoints();
    let dx = stuff.endX - stuff.startX;
    let dy = stuff.endY - stuff.startY;
    let length = sqrt(dx * dx + dy * dy);
    let percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
    let distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;

    return percent > 0 && percent < 1 && abs(distance) < this.hitTargetPadding;
  }

  setAnchorPoint(x, y) {
    this.deltaX = x - this.state.x;
    this.deltaY = y - this.state.y;

    if (abs(this.deltaX) < this.snapToPadding) this.deltaX = 0;
    if (abs(this.deltaY) < this.snapToPadding) this.deltaY = 0;
  }

  getEndPoints() {
    let startX = this.state.x + this.deltaX;
    let startY = this.state.y + this.deltaY;
    let end = this.state.closestPointOnCircle(startX, startY);

    return {
      startX: startX,
      startY: startY,
      endX: end.x,
      endY: end.y,
    };
  }

  mousePressed() {
    this.isMousePressed = true;
    this.selected = this.containsPoint(mouseX, mouseY);
  }

  mouseReleased() {
    this.isMousePressed = false;
  }

  update(scaleFactor = 1.0) {
    this.scaleFactor = scaleFactor;
    this.snapToPadding = 6 * this.scaleFactor;
    this.hitTargetPadding = 6 * this.scaleFactor;

    if (this.isMousePressed && this.selected) {
      this.setAnchorPoint(mouseX, mouseY);
    }
  }

  draw() {
    let stuff = this.getEndPoints();
    push();
    stroke(0, 0, 0);
    fill(0, 0, 0);

    // draw the line
    if (this.rollover) {
      stroke(100, 100, 200);
      fill(100, 100, 200);
    }

    if (this.selected) {
      stroke(0, 0, 255);
      fill(0, 0, 255);
    }

    line(stuff.startX, stuff.startY, stuff.endX, stuff.endY);

    // draw the head of the arrow
    drawArrow(stuff.endX, stuff.endY, atan2(-this.deltaY, -this.deltaX));
    pop();
  }
}
