class TransitionBox {
  constructor(x, y, color = { r: 0, g: 0, b: 0 }, texMap = {}) {
    this.x = x;
    this.y = y;
    this.w = 0;
    this.h = 0;
    this.inputs = [];
    this.selectedInputIndex = -1;
    this.rollover = false;

    // Create the first input
    this.inputs.push(new RuleInput(this.x, this.y, color, texMap));
  }

  over() {
    // Is mouse over object
    this.rollover = mouseX >= this.x - this.w / 2 && mouseX <= this.x + this.w / 2 && mouseY >= this.y - this.h / 2 && mouseY <= this.y + this.h / 2;
  }

  checkRule(index = undefined) {
    let newIndex = index !== undefined ? index : this.selectedInputIndex;

    if (newIndex < 0 || newIndex >= this.inputs.length) return false;

    let regex = /(\s*[^ ]+\s*→\s*[^ ]+\s*,\s*[^ ]+\s*)/g;
    let rule = this.inputs[newIndex].value.html().trim();
    let result = rule.match(regex);

    if (result) {
      if (result.toString().trim() !== rule) return false;

      let filteredResult = result.toString().replace(/ /g, " ");
      // console.log(filteredResult);

      return true;
    }

    return false;
  }

  keyPressed() {
    if (keyCode === ENTER) {
      let isValidRule = this.checkRule();
      if (isValidRule) {
        this.inputs[this.selectedInputIndex].selected = false;
        this.selectedInputIndex = 0;

        // Create a new input only if theres is no invalid rule, if it has, set the focus to the invalid rule
        for (let i = 0; i < this.inputs.length; i++) {
          if (!this.checkRule(i)) {
            this.inputs[i].selected = true;
            this.selectedInputIndex = i;
            return;
          }
        }

        this.inputs.unshift(new RuleInput(this.x, this.y, { r: 0, g: 0, b: 0 }, texMap));
        this.inputs[0].selected = true;
      }
    }

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].keyPressed();
    }

    if (keyCode === DOWN_ARROW) {
      if (this.selectedInputIndex < this.inputs.length - 1) {
        this.inputs[this.selectedInputIndex].selected = false;
        this.selectedInputIndex++;
        this.inputs[this.selectedInputIndex].selected = true;
      }
    } else if (keyCode === UP_ARROW) {
      if (this.selectedInputIndex > 0) {
        this.inputs[this.selectedInputIndex].selected = false;
        this.selectedInputIndex--;
        this.inputs[this.selectedInputIndex].selected = true;
      }
    }
  }

  keyTyped() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].keyTyped();
    }
  }

  keyReleased() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].keyReleased();
    }
  }

  update() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].update();
    }
  }

  mousePressed() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].mousePressed();
      if (this.inputs[i].selected) {
        if (this.selectedInputIndex !== i) {
          if (this.selectedInputIndex !== -1) this.inputs[this.selectedInputIndex].selected = false;

          this.selectedInputIndex = i;
        }
      }
    }

    this.isSelected = this.rollover;
    if (!this.isSelected) {
      this.selectedInputIndex = -1;

      for (let i = 0; i < this.inputs.length; i++) {
        if (!this.checkRule(i)) {
          if (this.inputs.length > 1) {
            this.inputs[i].value.remove();
            this.inputs.splice(i, 1);
            i--;
          } else {
            this.inputs[i].value.html("");
          }
        }
      }
    }
  }

  getTheWidestInput() {
    // Find the widest input
    let maxW = 0;
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.inputs[i].w > maxW) maxW = this.inputs[i].w;
    }

    // Return the widest input
    return maxW;
  }

  draw() {
    let padding = 20;
    let maxW = this.getTheWidestInput();
    this.w = max(maxW + padding, 100);
    this.h = this.inputs.length * this.inputs[0].h;

    push();
    if (this.isSelected || (this.inputs.length === 1 && this.inputs[0].value.html() == "")) {
      stroke(129, 133, 137);
      strokeWeight(2);
      rectMode(CENTER);
      rect(this.x, this.y, this.w, this.h, 5);
    }

    pop();

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].w = maxW;
      this.inputs[i].y = this.y + this.inputs[0].h * i - (this.inputs[0].h * (this.inputs.length - 1)) / 2;
      this.inputs[i].draw();

      if (i === this.inputs.length - 1 || !this.isSelected) continue;

      push();
      stroke(129, 133, 137);
      strokeWeight(1);
      line(this.inputs[i].x - this.inputs[i].w / 2, this.inputs[i].y + this.inputs[i].h / 2, this.inputs[i].x + this.inputs[i].w / 2, this.inputs[i].y + this.inputs[i].h / 2);
      pop();
    }

    // Set rule color based on the checkRule() result
    for (let i = 0; i < this.inputs.length; i++) {
      let isValidRule = this.checkRule(i);
      if (isValidRule) {
        this.inputs[i].value.style("color", "green");
      } else {
        this.inputs[i].value.style("color", "red");
      }
    }
  }
}
