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
      '\\Alpha': 'Α',
      '\\alpha': 'α',
      '\\Beta': 'Β',
      '\\beta': 'β',
      '\\Gamma': 'Γ',
      '\\gamma': 'γ',
      '\\Delta': 'Δ',
      '\\delta': 'δ',
      '\\Epsilon': 'Ε',
      '\\epsilon': 'ε',
      '\\Zeta': 'Ζ',
      '\\zeta': 'ζ',
      '\\Eta': 'Η',
      '\\eta': 'η',
      '\\Theta': 'Θ',
      '\\theta': 'θ',
      '\\Iota': 'Ι',
      '\\iota': 'ι',
      '\\Kappa': 'Κ',
      '\\kappa': 'κ',
      '\\Lambda': 'Λ',
      '\\lambda': 'λ',
      '\\Mu': 'Μ',
      '\\mu': 'μ',
      '\\Nu': 'Ν',
      '\\nu': 'ν',
      '\\Xi': 'Ξ',
      '\\xi': 'ξ',
      '\\Omicron': 'Ο',
      '\\omicron': 'ο',
      '\\Pi': 'Π',
      '\\pi': 'π',
      '\\Rho': 'Ρ',
      '\\rho': 'ρ',
      '\\Sigma': 'Σ',
      '\\sigma': 'σ',
      '\\fsigma': 'ς',
      '\\Tau': 'Τ',
      '\\tau': 'τ',
      '\\Upsilon': 'Υ',
      '\\upsilon': 'υ',
      '\\Phi': 'Φ',
      '\\phi': 'φ',
      '\\Chi': 'Χ',
      '\\chi': 'χ',
      '\\Psi': 'Ψ',
      '\\psi': 'ψ',
      '\\Omega': 'Ω',
      '\\omega': 'ω',

      // Especial symbols
      '\\Blank': '☐',
      '\\blank': '☐',
      '\\Branco': '☐',
      '\\branco': '☐',
    }

    this.input = new CustomInput(x, y, color, this.texMap);
  }

  update() {
    super.update();
    this.input.x = this.x;
    this.input.y = this.y;
    this.input.selected = this.selected;
  }

  draw() {
    stroke(0);
    // Different fill based on state
    if (this.rollover && !this.selected) {
      stroke(0, 100, 0);
    } else if (this.selected) {
      stroke(this.color.r, this.color.g, this.color.b);
    } else {
      stroke(0);
    }

    ellipseMode(CENTER);
    ellipse(this.x, this.y, Math.max(this.r * 2, this.input.w), this.r * 2);
  }
}