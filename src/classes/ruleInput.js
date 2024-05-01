class RuleInput extends CustomInput {
  constructor(x, y, texMap = {}, scaleFactor = 1.0, parent = null, textColorSameAsInput = false) {
    super(x, y, texMap, scaleFactor, parent, textColorSameAsInput);

    // placeholder
    this.input.attribute("placeholder", "Ler -> Escreve, (E, D)");
    this.input.style("font-size", 12 * scaleFactor + "px");
  }

  containsPoint(x = mouseX, y = mouseY, thisY) {
    return x > this.x - this.w && x < this.x + this.w && y >= thisY - this.h / 2 && y <= thisY + this.h / 2;
  }
}
