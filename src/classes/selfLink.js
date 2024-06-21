class SelfLink {
  constructor(state, createTransitionBox = false, rules = [], anchorAngle = 0) {
    this.state = state;
    this.scaleFactor = globalScaleFactor;
    this.anchorAngle = anchorAngle;
    this.mouseOffsetAngle = 0;
    this.hitTargetPadding = 6;

    // Status
    this.hovering = false;
    this.selected = false;

    if (anchorAngle === 0) this.setAnchorPoint(mouseX, mouseY);

    // Transition box
    this.transitionBox = null;
    if (createTransitionBox) this.transitionBox = new TransitionBox(-1000, -1000, "#canvas-container", rules);
  }

  containsPoint(x, y) {
    let stuff = this.getEndPointsAndCircle();
    let dx = x - stuff.circleX;
    let dy = y - stuff.circleY;
    let distance = sqrt(dx * dx + dy * dy) - stuff.circleR;

    return abs(distance) < this.hitTargetPadding * this.scaleFactor;
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

  mouseDragged() {
    if (selectedLeftSidebarButton === "addLink") return;

    if (this.selected) {
      this.dragging = true;
      console.log("Dragging self link");
    }
  }

  mouseReleased() {
    if (this.dragging) {
      this.dragging = false;
      createHistory();
    }
  }

  doubleClick() {
    if (this.hovering) this.transitionBox.selected = true;
  }

  update(scaleFactor = 1.0) {
    this.scaleFactor = scaleFactor;

    if (this.selected && this.dragging) this.setAnchorPoint(mouseX, mouseY);

    // update the box
    let stuff = this.getEndPointsAndCircle();
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

    if (this.transitionBox.selected) {
      this.selected = false;
      selectedObject = null;
    }
  }

  draw() {
    let stuff = this.getEndPointsAndCircle();
    push();
    stroke("#ffffff");
    fill("#ffffff");
    strokeWeight(2 * this.scaleFactor);

    if (this.hovering) {
      stroke("#E4E4E4");
      fill("#E4E4E4");
    }

    if (this.selected) {
      stroke("#11528C");
      fill("#11528C");
    }

    // draw arc
    push();
    noFill();
    arc(stuff.circleX, stuff.circleY, stuff.circleR * 2, stuff.circleR * 2, stuff.startAngle, stuff.endAngle);
    pop();

    // draw the head of the arrow
    drawArrow(stuff.endX, stuff.endY, stuff.endAngle + PI * 0.4);
    pop();
  }
}
