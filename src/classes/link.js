class Link {
  constructor(stateA, stateB, rules = [], parallelPart = 0.5, perpendicularPart = 0, lineAngleAdjust = 0) {
    this.stateA = stateA;
    this.stateB = stateB;
    this.scaleFactor = globalScaleFactor;
    this.snapToPadding = 6;
    this.hitTargetPadding = 6;

    // Status
    this.hovering = false;
    this.selected = false;
    this.dragging = false;

    // Make anchor point relative to the locations of stateA and stateB
    this.parallelPart = parallelPart;
    this.perpendicularPart = perpendicularPart;
    this.lineAngleAdjust = lineAngleAdjust;

    // Transition box
    this.transitionBox = new TransitionBox(-1000, -1000, "#canvas-container", rules);
  }

  det(a, b, c, d, e, f, g, h, i) {
    return a * e * i + b * f * g + c * d * h - a * f * h - b * d * i - c * e * g;
  }

  circleFromThreePoints(x1, y1, x2, y2, x3, y3) {
    let a = this.det(x1, y1, 1, x2, y2, 1, x3, y3, 1);
    let bx = -this.det(x1 * x1 + y1 * y1, y1, 1, x2 * x2 + y2 * y2, y2, 1, x3 * x3 + y3 * y3, y3, 1);
    let by = this.det(x1 * x1 + y1 * y1, x1, 1, x2 * x2 + y2 * y2, x2, 1, x3 * x3 + y3 * y3, x3, 1);
    let c = -this.det(x1 * x1 + y1 * y1, x1, y1, x2 * x2 + y2 * y2, x2, y2, x3 * x3 + y3 * y3, x3, y3);

    return {
      x: -bx / (2 * a),
      y: -by / (2 * a),
      r: sqrt(bx * bx + by * by - 4 * a * c) / (2 * abs(a)),
    };
  }

  getAnchorPoint() {
    let dx = this.stateB.x - this.stateA.x;
    let dy = this.stateB.y - this.stateA.y;
    let scale = sqrt(dx * dx + dy * dy);

    return {
      x: this.stateA.x + dx * this.parallelPart - (dy * this.perpendicularPart) / scale,
      y: this.stateA.y + dy * this.parallelPart + (dx * this.perpendicularPart) / scale,
    };
  }

  setAnchorPoint(x, y) {
    let dx = this.stateB.x - this.stateA.x;
    let dy = this.stateB.y - this.stateA.y;
    let scale = sqrt(dx * dx + dy * dy);

    this.parallelPart = (dx * (x - this.stateA.x) + dy * (y - this.stateA.y)) / (scale * scale);
    this.perpendicularPart = (dx * (y - this.stateA.y) - dy * (x - this.stateA.x)) / scale;

    // Snap to a straight line
    if (this.parallelPart > 0 && this.parallelPart < 1 && abs(this.perpendicularPart) < this.snapToPadding * this.scaleFactor) {
      this.lineAngleAdjust = (this.perpendicularPart < 0) * PI;
      this.perpendicularPart = 0;
    }
  }

  getEndPointsAndCircle() {
    if (this.perpendicularPart == 0) {
      let midX = (this.stateA.x + this.stateB.x) / 2;
      let midY = (this.stateA.y + this.stateB.y) / 2;
      let start = this.stateA.closestPointOnCircle(midX, midY);
      let end = this.stateB.closestPointOnCircle(midX, midY);

      return {
        hasCircle: false,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
      };
    }

    let anchor = this.getAnchorPoint();
    let circle = this.circleFromThreePoints(this.stateA.x, this.stateA.y, this.stateB.x, this.stateB.y, anchor.x, anchor.y);
    let isReversed = this.perpendicularPart > 0;
    let reverseScale = isReversed ? 1 : -1;
    let startAngle = atan2(this.stateA.y - circle.y, this.stateA.x - circle.x) - (reverseScale * this.stateA.r) / circle.r;
    let endAngle = atan2(this.stateB.y - circle.y, this.stateB.x - circle.x) + (reverseScale * this.stateA.r) / circle.r;

    let startX = circle.x + circle.r * cos(startAngle);
    let startY = circle.y + circle.r * sin(startAngle);
    let endX = circle.x + circle.r * cos(endAngle);
    let endY = circle.y + circle.r * sin(endAngle);

    return {
      hasCircle: true,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      startAngle: startAngle,
      endAngle: endAngle,
      circleX: circle.x,
      circleY: circle.y,
      circleR: circle.r,
      reverseScale: reverseScale,
      isReversed: isReversed,
    };
  }

  containsPoint(x, y) {
    let stuff = this.getEndPointsAndCircle();

    if (stuff.hasCircle) {
      let dx = x - stuff.circleX;
      let dy = y - stuff.circleY;
      let distance = sqrt(dx * dx + dy * dy) - stuff.circleR;

      if (abs(distance) < this.hitTargetPadding * this.scaleFactor) {
        let angle = atan2(dy, dx);
        let startAngle = stuff.startAngle;
        let endAngle = stuff.endAngle;

        if (stuff.isReversed) {
          let temp = startAngle;
          startAngle = endAngle;
          endAngle = temp;
        }

        if (endAngle < startAngle) {
          endAngle += PI * 2;
        }

        if (angle < startAngle) {
          angle += PI * 2;
        } else if (angle > endAngle) {
          angle -= PI * 2;
        }

        return angle > startAngle && angle < endAngle;
      }
    } else {
      let dx = stuff.endX - stuff.startX;
      let dy = stuff.endY - stuff.startY;
      let length = sqrt(dx * dx + dy * dy);
      let percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
      let distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;

      return percent > 0 && percent < 1 && abs(distance) < this.hitTargetPadding * this.scaleFactor;
    }

    return false;
  }

  mouseDragged() {
    if (selectedLeftSidebarButton === "addLink") return;

    if (this.selected) {
      this.dragging = true;
      console.log("Dragging link");
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

  update() {
    if (this.scaleFactor !== globalScaleFactor) {
      this.parallelPart = (this.parallelPart / this.scaleFactor) * globalScaleFactor;
      this.perpendicularPart = (this.perpendicularPart / this.scaleFactor) * globalScaleFactor;
      this.lineAngleAdjust = (this.lineAngleAdjust / this.scaleFactor) * globalScaleFactor;
      this.scaleFactor = globalScaleFactor;
    }

    if (this.selected && this.dragging) this.setAnchorPoint(mouseX, mouseY);

    // update the box
    let stuff = this.getEndPointsAndCircle();
    if (stuff.hasCircle) {
      let startAngle = stuff.startAngle;
      let endAngle = stuff.endAngle;

      if (endAngle < startAngle) {
        endAngle += PI * 2;
      }
      let boxAngle = (startAngle + endAngle) / 2 + stuff.isReversed * PI;
      let boxX = stuff.circleX + stuff.circleR * cos(boxAngle);
      let boxY = stuff.circleY + stuff.circleR * sin(boxAngle);
      updateBoxPosition(this.transitionBox, boxX, boxY, boxAngle);
    } else {
      let boxX = (stuff.startX + stuff.endX) / 2;
      let boxY = (stuff.startY + stuff.endY) / 2;
      let boxAngle = atan2(stuff.endX - stuff.startX, stuff.startY - stuff.endY);
      updateBoxPosition(this.transitionBox, boxX, boxY, boxAngle);
    }

    if (this.transitionBox.selected) {
      this.selected = false;
      selectedObject = null;
    }
  }

  draw() {
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

    let stuff = this.getEndPointsAndCircle();

    if (stuff.hasCircle) {
      let circleW = max(dist(this.stateA.x, this.stateA.y, this.stateB.x, this.stateB.y), stuff.circleR * 2);
      push();
      noFill();
      // Draw arc
      if (stuff.isReversed) {
        arc(stuff.circleX, stuff.circleY, circleW, stuff.circleR * 2, stuff.endAngle, stuff.startAngle);
      } else {
        arc(stuff.circleX, stuff.circleY, circleW, stuff.circleR * 2, stuff.startAngle, stuff.endAngle);
      }
      pop();
    } else {
      // Draw line
      line(stuff.startX, stuff.startY, stuff.endX, stuff.endY);
    }

    // Draw the head of the arrow
    if (stuff.hasCircle) {
      drawArrow(stuff.endX, stuff.endY, stuff.endAngle - stuff.reverseScale * (PI / 2));
    } else {
      drawArrow(stuff.endX, stuff.endY, atan2(stuff.endY - stuff.startY, stuff.endX - stuff.startX));
    }
    pop();
  }
}
