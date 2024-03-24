class TemporaryLink {
  constructor() {
    this.from = null;
    this.to = null;
  }

  draw() {
    if (!this.from || !this.to) return;
    // draw the line
    line(this.from.x, this.from.y, this.to.x, this.to.y);

    // draw the head of the arrow
    drawArrow(this.to.x, this.to.y, atan2(this.to.y - this.from.y, this.to.x - this.from.x));
  }
}
