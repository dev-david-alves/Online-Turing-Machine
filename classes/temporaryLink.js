class TemporaryLink {
  constructor(scaleFactor = 1.0) {
    this.from = null;
    this.to = null;
    this.scaleFactor = scaleFactor;
  }

  draw() {
    if (!this.from || !this.to) return;
    // draw the line
    push();
    strokeWeight(this.scaleFactor);
    line(this.from.x, this.from.y, this.to.x, this.to.y);

    // draw the head of the arrow
    drawArrow(this.to.x, this.to.y, atan2(this.to.y - this.from.y, this.to.x - this.from.x));
    pop();
  }
}
