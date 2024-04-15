class SelfLink {
  constructor(state, scaleFactor = 1.0, createText = false) {
    this.state = state;
    this.scaleFactor = scaleFactor;
    this.anchorAngle = 0;
    this.mouseOffsetAngle = 0;
    this.isMousePressed = false;
    this.selected = false;
    this.rollover = false;
    this.text = "";
    this.hitTargetPadding = 6 * this.scaleFactor;

    this.setAnchorPoint(mouseX, mouseY);

    // TextBox
    this.transitionBox = null;
    if(createText) this.transitionBox = new TransitionBox(-1000, -1000, { r: 0, g: 0, b: 0 }, texMap);
  }

  containsPoint(x, y) {
    let stuff = this.getEndPointsAndCircle();
    let dx = x - stuff.circleX;
    let dy = y - stuff.circleY;
    let distance = sqrt(dx * dx + dy * dy) - stuff.circleR;

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
    let circleR = 0.75 * this.state.r;
    let startAngle = this.anchorAngle - PI * 0.8;
    let endAngle = this.anchorAngle + PI * 0.8;
    let startX = circleX + circleR * cos(startAngle);
    let startY = circleY + circleR * sin(startAngle);
    let endX = circleX + circleR * cos(endAngle);
    let endY = circleY + circleR * sin(endAngle);

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
      circleR: circleR,
    };
  }

  mousePressed() {
    this.isMousePressed = true;
    this.transitionBox.mousePressed();
  }

  mouseReleased() {
    this.isMousePressed = false;
  }

  update(scaleFactor = 1.0) {
    this.scaleFactor = scaleFactor;
    this.hitTargetPadding = 6 * this.scaleFactor;
    
    if (this.isMousePressed && this.selected) {
      this.setAnchorPoint(mouseX, mouseY);
    }

    this.rollover = this.containsPoint(mouseX, mouseY);

    let stuff = this.getEndPointsAndCircle();

    // update the box
    if (stuff.hasCircle) {
      let startAngle = stuff.startAngle;
      let endAngle = stuff.endAngle;

      if (endAngle < startAngle) {
        endAngle += PI * 2;
      }
      let boxX = stuff.circleX + stuff.circleR * cos(this.anchorAngle);
      let boxY = stuff.circleY + stuff.circleR * sin(this.anchorAngle);

      updateBoxPosition(this.transitionBox, boxX, boxY, stuff.anchorAngle, true, this.state);
    }

    if (this.selected) {
      this.transitionBox.selected = true;
    } else if (this.transitionBox.selected) {
      this.selected = true;
    }
  }

  draw() {
    let stuff = this.getEndPointsAndCircle();
    push();
    // draw arc
    if (this.rollover) stroke(100, 100, 200);
    if (this.selected) stroke(0, 0, 255);

    noFill();
    arc(stuff.circleX, stuff.circleY, stuff.circleR * 2, stuff.circleR * 2, stuff.startAngle, stuff.endAngle);

    // draw the head of the arrow
    drawArrow(stuff.endX, stuff.endY, stuff.endAngle + PI * 0.4);
    pop();
  }
}
