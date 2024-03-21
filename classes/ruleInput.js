class RuleInput extends CustomInput {
  constructor(x, y, color = { r: 0, g: 0, b: 0 }, texMap = {}) {
    super(x, y, color, texMap);
  }

  keyTyped() {
    if (!this.selected) return;

    if (!(keyCode === BACKSPACE || keyCode === DELETE || keyCode === ENTER || key === "<" || key === ">")) {
      this.isTyping = true;

      // Do not allow user type more than one space sequentially
      if (key === " " && this.value.html().slice(this.cursor.index - 1, this.cursor.index) === " ") return;
      if (key === " " && this.value.html().slice(this.cursor.index, this.cursor.index + 1) === " ") return;
      this.value.html(this.value.html().slice(0, this.cursor.index) + key + this.value.html().slice(this.cursor.index));
      this.cursor.index++;
    }
  }

  mousePressed() {
    this.selected = mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 && mouseY > this.y - this.h / 2 && mouseY < this.y + this.h / 2;
  }

  draw() {
    push();
    let windowOffsetX = windowWidth - width;
    let windowOffsetY = windowHeight - height;

    this.value.style("position", "absolute");
    this.value.style("left", `${this.x + windowOffsetX / 2}px`);
    this.value.style("top", `${this.y + windowOffsetY / 2 - 2}px`);
    this.value.style("transform", `translate(-50%, -50%)`);

    let padding = 20;
    this.w = max(this.w + padding, 100);

    if (this.selected && this.cursor.properties.isVisible) {
      stroke(this.color.r, this.color.g, this.color.b);
      strokeWeight(this.cursor.properties.thickness);
      line(this.cursor.position.x, this.cursor.position.y, this.cursor.position.x, this.cursor.position.y + this.cursor.properties.height);
    }
    pop();
  }
}
