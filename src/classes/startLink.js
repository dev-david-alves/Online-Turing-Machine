class StartLink {
  constructor(state, start) {
    this.state = state;
    this.scaleFactor = globalScaleFactor;
    this.deltaX = 0;
    this.deltaY = 0;
    this.snapToPadding = 6;
    this.hitTargetPadding = 6;

    // Status variables
    this.dragging = false;
    this.hovering = false;
    this.selected = false;

    if (start) this.setAnchorPoint(start.x, start.y);
  }

  containsPoint(x, y) {
    let stuff = this.getEndPoints();
    let dx = stuff.endX - stuff.startX;
    let dy = stuff.endY - stuff.startY;
    let length = sqrt(dx * dx + dy * dy);
    let percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
    let distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;

    return percent > 0 && percent < 1 && abs(distance) < this.hitTargetPadding * this.scaleFactor;
  }

  setAnchorPoint(x, y) {
    this.deltaX = x - this.state.x;
    this.deltaY = y - this.state.y;

    if (abs(this.deltaX) < this.snapToPadding * this.scaleFactor) this.deltaX = 0;
    if (abs(this.deltaY) < this.snapToPadding * this.scaleFactor) this.deltaY = 0;
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

  mouseDragged() {
    if (this.hovering && selectedTopMenuButton === "select") {
      this.dragging = true;
      console.log("Dragging start link");
    }
  }

  mouseReleased() {
    if (this.dragging) {
      this.dragging = false;
      createHistory();
    }
  }

  update(scaleFactor = 1.0) {
    this.deltaX = (this.deltaX / this.scaleFactor) * scaleFactor;
    this.deltaY = (this.deltaY / this.scaleFactor) * scaleFactor;
    this.scaleFactor = scaleFactor;

    if (this.selected && this.dragging) {
      this.setAnchorPoint(mouseX, mouseY);
    }
  }

  draw() {
    let stuff = this.getEndPoints();

    push();
    stroke(0, 0, 0);
    fill(0, 0, 0);
    strokeWeight(1 * this.scaleFactor);

    // draw the line
    if (this.hovering) {
      stroke(17, 82, 140);
      fill(17, 82, 140);
    }

    if (this.selected) {
      strokeWeight(2 * this.scaleFactor);
      stroke(23, 98, 163);
      fill(23, 98, 163);
    }

    line(stuff.startX, stuff.startY, stuff.endX, stuff.endY);

    // draw the head of the arrow
    drawArrow(stuff.endX, stuff.endY, atan2(-this.deltaY, -this.deltaX));
    pop();
  }
}
