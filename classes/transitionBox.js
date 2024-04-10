class TransitionBox {
  constructor(x, y, color = { r: 0, g: 0, b: 0 }, texMap = {}) {
    this.x = x;
    this.y = y;
    this.w = 0;
    this.h = 0;
    this.inputs = [];
    this.selectedInputIndex = -1;
    this.rollover = false;
    this.selected = false;
    this.seletedCondition = false;

    // Create the first input
    this.inputs.push(new RuleInput(this.x, this.y, color, texMap));
  }

  containsPoint(x = mouseX, y = mouseY) {
    return x > this.x - this.w / 2 && x < this.x + this.w / 2 && y >= this.y - this.h / 2 && y <= this.y + this.h / 2;
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

  mousePressed() {
    this.selected = this.containsPoint(mouseX, mouseY);

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].mousePressed();
      if (this.inputs[i].selected) {
        if (this.selectedInputIndex !== i) {
          if (this.selectedInputIndex !== -1) this.inputs[this.selectedInputIndex].selected = false;

          this.selectedInputIndex = i;
        }
      }
    }
  }

  update() {
    this.rollover = this.containsPoint(mouseX, mouseY);

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].update();
      this.inputs[i].x = this.x;
      this.inputs[i].y = this.y + this.inputs[0].h * i - (this.inputs[0].h * (this.inputs.length - 1)) / 2;

      if (this.inputs[i].selected) this.selected = true;
    }

    if (!this.selected) {
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
    } else {
      // if theres is no selected input, select the first one
      if (this.selectedInputIndex === -1) {
        this.selectedInputIndex = 0;
        this.inputs[0].selected = true;
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
    this.w = maxW;
    this.h = this.inputs.length * this.inputs[0].h * 0.7;

    push();
    if (this.selected || (this.inputs.length === 1 && this.inputs[0].value.html().trim() === "")) {
      this.w = max(maxW + padding, 100);
      this.h = this.inputs.length * this.inputs[0].h + 5;

      if (this.rollover) stroke(100, 100, 200);
      if (this.selected) stroke(0, 0, 255);
      strokeWeight(1);
      rectMode(CENTER);
      rect(this.x, this.y, this.w, this.h, 5);
    }

    pop();

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].w = maxW;
      this.inputs[i].y = this.y + this.inputs[0].h * i * (!this.selected ? 0.7 : 1) - (this.inputs[0].h * (this.inputs.length - 1)) / 2;
      this.inputs[i].draw();

      if (i === this.inputs.length - 1 || !this.selected) continue;

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
