class State extends DraggableCircle {
  constructor(id, x, y, r, color) {
    super(x, y, r, color);
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
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

    this.input = new CustomInput(x, y, color, this.texMap);
  }

  getSnapLinkPoint(x, y) {
    let dx = x - this.x;
    let dy = y - this.y;
    let scale = Math.sqrt(dx * dx + dy * dy);

    return {
      x: this.x + (dx * this.r) / scale,
      y: this.y + (dy * this.r) / scale,
    };
  }

  closestPointOnCircle(x, y) {
    var dx = x - this.x;
    var dy = y - this.y;
    var scale = Math.sqrt(dx * dx + dy * dy);

    return {
      x: this.x + (dx * this.r) / scale,
      y: this.y + (dy * this.r) / scale,
    };
  }

  containsPoint(x, y) {
    return x > this.x - this.w / 2 && x < this.x + this.w / 2 && y > this.y - this.r && y < this.y + this.r;
  }

  update() {
    super.update();
    this.input.x = this.x;
    this.input.y = this.y;
    this.input.selected = this.selected;
    this.w = Math.max(this.r * 2, this.input.w + 20);
    this.rollover = this.containsPoint(mouseX, mouseY);
  }

  draw() {
    push();
    // Different fill based on state
    if (this.rollover) stroke(100, 100, 200);
    if (this.selected) stroke(0, 0, 255);

    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.w, this.r * 2);
    pop();
  }
}
