class State {
  constructor(id, x, y, r, color, scaleFactor = 1.0) {
    this.id = id;
    this.scaleFactor = scaleFactor;
    this.isEndState = false;
    this.color = color;

    this.texMap = {
      // Greek alphabet
      "\\Alpha": "Α",
      "\\alpha": "α",
      "\\Beta": "Β",
      "\\beta": "β",
      "\\Gamma": "Γ",
      "\\gamma": "γ",
      "\\Delta": "Δ",
      "\\delta": "δ",
      "\\Epsilon": "Ε",
      "\\epsilon": "ε",
      "\\Zeta": "Ζ",
      "\\zeta": "ζ",
      "\\Eta": "Η",
      "\\eta": "η",
      "\\Theta": "Θ",
      "\\theta": "θ",
      "\\Iota": "Ι",
      "\\iota": "ι",
      "\\Kappa": "Κ",
      "\\kappa": "κ",
      "\\Lambda": "Λ",
      "\\lambda": "λ",
      "\\Mu": "Μ",
      "\\mu": "μ",
      "\\Nu": "Ν",
      "\\nu": "ν",
      "\\Xi": "Ξ",
      "\\xi": "ξ",
      "\\Omicron": "Ο",
      "\\omicron": "ο",
      "\\Pi": "Π",
      "\\pi": "π",
      "\\Rho": "Ρ",
      "\\rho": "ρ",
      "\\Sigma": "Σ",
      "\\sigma": "σ",
      "\\fsigma": "ς",
      "\\Tau": "Τ",
      "\\tau": "τ",
      "\\Upsilon": "Υ",
      "\\upsilon": "υ",
      "\\Phi": "Φ",
      "\\phi": "φ",
      "\\Chi": "Χ",
      "\\chi": "χ",
      "\\Psi": "Ψ",
      "\\psi": "ψ",
      "\\Omega": "Ω",
      "\\omega": "ω",

      // Especial symbols
      "\\Blank": "☐",
      "\\blank": "☐",
      "\\Branco": "☐",
      "\\branco": "☐",
    };

    // Dragging
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.selected = false;

    // Position
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.offsetX = 0;
    this.offsetY = 0;

    // Dimensions
    this.r = r * scaleFactor;
    this.h = this.r * 2;
    this.w = this.r * 2;

    // Text input
    this.input = new CustomInput(this.x, this.y, this.texMap, scaleFactor, "#canvas-container");
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
    return x > this.x - this.w / 2 && x < this.x + this.w / 2 && y > this.y - this.r && y < this.y + this.r;
  }

  mousePressed() {
    // Did I click on the circle?
    if (this.rollover) {
      this.dragging = true;
      // If so, keep track of relative location of click to corner of circle
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }

  mouseReleased() {
    // Quit dragging
    this.dragging = false;
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
    this.input.visible = this.selected && !isMouseWithShiftPressed && !mouseIsPressed;
    if (this.selected && document.activeElement !== this.input.input.elt) {
      this.input.input.elt.focus();
    }

    // this.w = Math.max(this.r * 2, this.input.w + 20 * this.scaleFactor);
    this.w = this.r * 2;
    this.rollover = this.containsPoint(mouseX, mouseY);

    // Adjust location if being dragged
    if (this.dragging) {
      this.x = this.offsetX + mouseX;
      this.y = this.offsetY + mouseY;
    }
  }

  draw() {
    push();
    // Different fill based on state
    if (this.rollover) stroke(100, 100, 200);
    if (this.selected) stroke(0, 0, 255);

    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.w, this.r * 2);
    if (this.isEndState) ellipse(this.x, this.y, this.w * 0.8, this.r * 1.6);

    pop();
  }
}
