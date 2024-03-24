class SelfLink {
  constructor(state) {
    this.state = state;
    this.anchorAngle = 0;
    this.mouseOffsetAngle = 0;
    this.isMousePressed = false;
    this.selected = false;
    this.rollover = false;
    this.text = "";
    this.hitTargetPadding = 6;

    this.setAnchorPoint(mouseX, mouseY);
  }

  containsPoint(x, y) {
    let stuff = this.getEndPointsAndCircle();
    let dx = x - stuff.circleX;
    let dy = y - stuff.circleY;
    let distance = sqrt(dx * dx + dy * dy) - stuff.circleRadius;

    return abs(distance) < this.hitTargetPadding;
  }

  setAnchorPoint(x, y) {
    this.anchorAngle = atan2(y - this.state.y, x - this.state.x) + this.mouseOffsetAngle;
    // snap to 90 degrees
    let snap = round(this.anchorAngle / (PI / 2)) * (PI / 2);
    if (abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
    // keep in the range -pi to pi so our containsPoint() function always works
    if (this.anchorAngle < -PI) this.anchorAngle += 2 * PI;
    if (this.anchorAngle > PI) this.anchorAngle -= 2 * PI;
  }

  getEndPointsAndCircle() {
    let circleX = this.state.x + 1.5 * this.state.r * cos(this.anchorAngle);
    let circleY = this.state.y + 1.5 * this.state.r * sin(this.anchorAngle);
    let circleRadius = 0.75 * this.state.r;
    let startAngle = this.anchorAngle - PI * 0.8;
    let endAngle = this.anchorAngle + PI * 0.8;
    let startX = circleX + circleRadius * cos(startAngle);
    let startY = circleY + circleRadius * sin(startAngle);
    let endX = circleX + circleRadius * cos(endAngle);
    let endY = circleY + circleRadius * sin(endAngle);

    return {
      hasCircle: true,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      startAngle: startAngle,
      endAngle: endAngle,
      circleX: circleX,
      circleY: circleY,
      circleRadius: circleRadius,
    };
  }

  mousePressed() {
    this.isMousePressed = true;
    this.selected = this.containsPoint(mouseX, mouseY);
  }

  mouseReleased() {
    this.isMousePressed = false;
  }

  update() {
    if (this.isMousePressed && this.selected) {
      this.setAnchorPoint(mouseX, mouseY);
    }

    this.rollover = this.containsPoint(mouseX, mouseY);
  }

  draw() {
    let stuff = this.getEndPointsAndCircle();
    push();
    // draw arc
    if (this.rollover) stroke(100, 100, 200);
    if (this.selected) stroke(0, 0, 255);

    noFill();
    arc(stuff.circleX, stuff.circleY, stuff.circleRadius * 2, stuff.circleRadius * 2, stuff.startAngle, stuff.endAngle);

    // draw the head of the arrow
    drawArrow(stuff.endX, stuff.endY, stuff.endAngle + PI * 0.4);
    pop();
  }
}
