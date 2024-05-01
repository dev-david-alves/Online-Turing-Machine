class TransitionBox {
  constructor(x, y, texMap = {}, scaleFactor = 1.0, parent = null) {
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.scaleFactor = scaleFactor;
    this.w = 0;
    this.h = 0;
    this.rollover = false;
    this.selected = false;
    this.selectedInputIndex = -1;
    this.visible = false;
    this.inputParent = parent;
    this.marginBox = 5 * this.scaleFactor;
    this.offsetBoxY = 0;
    this.yBoxScale = 0.7;
    this.inputMinWidth = 150;

    // Create the first input
    this.labels = [];
    this.editingInput = new RuleInput(x, y, texMap, scaleFactor, parent, true);

    this.labels.push(["a->b,c"]);
    this.labels.push(["b->c,d"]);
    this.labels.push(["c->d,e"]);
    this.labels.push(["d->e,f"]);
  }

  containsPoint(x = mouseX, y = mouseY) {
    return x > this.x - this.w / 2 && x < this.x + this.w / 2 && y >= this.y + this.offsetBoxY && y <= this.y + this.offsetBoxY + this.h;
  }

  labelContainsPoint(x = mouseX, y = mouseY) {
    for (let i = 0; i < this.labels.length; i++) {
      let yy = this.y + this.offsetBoxY + this.editingInput.h * i * this.yBoxScale + this.editingInput.h / 4 - 4 * this.scaleFactor;
      let xx = this.x - this.w / 2;
      let ww = this.w;
      let hh = this.editingInput.h * this.yBoxScale;

      if (x > xx && x < xx + ww && y > yy && y < yy + hh) return i;
    }

    return -1;
  }

  checkRule() {
    let regex = /(\s*[^ ]+\s*(→|->|\\arrow)\s*[^ ]+\s*,\s*[^ ]+\s*)/g;
    let rule = this.editingInput.input.value().trim();
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
        this.labels.push(this.editingInput.allSubstrings);
        this.editingInput.input.value("");
      }
    }
  }

  mousePressed() {
    if (!this.selected || !this.visible) {
      this.editingInput.input.value("");
      this.editingInput.input.elt.blur();
      return;
    }

    this.selectedInputIndex = this.labelContainsPoint(mouseX, mouseY);

    if (this.selectedInputIndex !== -1 && this.checkRule()) {
      this.labels.push(this.editingInput.allSubstrings);
      this.editingInput.input.value("");
    }

    // Get label and remove it from array
    let label = this.labels.splice(this.selectedInputIndex, 1);
    // Replace the → with used arrow type
    let rule = label[0].join("").replace(/(→|->|\\arrow)/g, "->");
    // Set the input value to the rule
    this.editingInput.input.value(rule);
    this.editingInput.textInput(rule);
  }

  // getLabelWidth(label, fontSize = 15) {
  //   let span = createSpan(label.join(""));
  //   span.style("font-size", fontSize * this.scaleFactor + "px");
  //   span.style("font-family", "Arial");
  //   span.style("visibility", "hidden");
  //   span.style("position", "absolute");
  //   span.style("top", "-1000px");
  //   span.style("left", "-1000px");

  //   let maxW = span.elt.offsetWidth;

  //   if (span) span.remove();

  //   return maxW;
  // }

  getTheWidestInput() {
    let span = createSpan(this.editingInput.input.value());
    span.style("font-size", 12 * this.scaleFactor + "px");
    span.style("font-family", "Arial");
    span.style("visibility", "hidden");
    span.style("position", "absolute");
    span.style("top", "-1000px");
    span.style("left", "-1000px");

    let maxW = span.elt.offsetWidth + 20 * this.scaleFactor;

    for (let i = 0; i < this.labels.length; i++) {
      span.html(this.labels[i].join(""));

      maxW = max(maxW, span.elt.offsetWidth + 20 * this.scaleFactor);
    }

    this.editingInput.w = max(maxW, this.inputMinWidth * this.scaleFactor);
    if (span) span.remove();

    return maxW;
  }

  update(scaleFactor = 1.0) {
    if (this.scaleFactor != scaleFactor) {
      this.x = (this.x / this.scaleFactor) * scaleFactor;
      this.y = (this.y / this.scaleFactor) * scaleFactor;
      this.marginBox = 5 * scaleFactor;
      this.scaleFactor = scaleFactor;
    }

    this.rollover = this.containsPoint(mouseX, mouseY);
    this.visible = this.selected && !isMouseWithShiftPressed;

    this.offsetBoxY = 0;
    if (!this.selected || !this.visible) {
      this.editingInput.selected = false;
      this.editingInput.visible = false;
      this.editingInput.input.elt.blur();
    } else {
      this.editingInput.selected = true;
      this.editingInput.visible = true;
      this.editingInput.input.elt.focus();
      this.offsetBoxY = this.editingInput.h + 2 * this.marginBox;
    }

    this.editingInput.x = this.x - this.w / 2;
    this.editingInput.y = this.y + this.marginBox;
    this.editingInput.update(scaleFactor);
  }

  draw() {
    if (isMouseWithShiftPressed) return;

    let maxW = this.getTheWidestInput();
    this.w = max(maxW, this.inputMinWidth * this.scaleFactor);
    this.h = this.labels.length * this.editingInput.h * this.yBoxScale + 2 * this.scaleFactor;

    push();
    noFill();
    if (this.selected && this.visible && this.labels.length > 0) rect(this.x - this.w / 2, this.y + this.offsetBoxY, this.w, this.h, this.marginBox * this.scaleFactor);
    pop();

    if (this.selected && this.visible) {
      for (let i = 0; i < this.labels.length; i++) {
        let yy = this.y + this.offsetBoxY + this.editingInput.h * i * this.yBoxScale + this.editingInput.h / 4 - 4 * this.scaleFactor;
        this.drawText(this.x, yy + 2 * this.scaleFactor, this.labels[i]);

        if (i < this.labels.length - 1 && this.labels.length > 1) {
          push();
          stroke(23, 42, 43);
          strokeWeight(1);
          line(this.x - this.w / 2, yy + this.editingInput.h * this.yBoxScale - 2 * this.scaleFactor, this.x + this.w / 2, yy + this.editingInput.h * this.yBoxScale - 2 * this.scaleFactor);
          pop();
        }
      }
    } else {
      for (let i = 0; i < this.labels.length; i++) {
        let yy = this.y + this.offsetBoxY + this.editingInput.h * i * this.yBoxScale * 0.5 + this.editingInput.h / 4 - 4 * this.scaleFactor;
        this.drawText(this.x, yy + 2 * this.scaleFactor, this.labels[i], 255, 12 * this.scaleFactor);
      }
    }

    if (this.editingInput.input.value().trim() !== "") {
      if (this.checkRule()) {
        this.editingInput.input.style("color", "green");
        this.editingInput.input.style("border-color", "green");
      } else {
        this.editingInput.input.style("color", "red");
        this.editingInput.input.style("border-color", "red");
      }
    } else {
      this.editingInput.input.style("color", "black");
      this.editingInput.input.style("border-color", "black");
    }
  }

  drawText(xx = this.x, yy = this.y + 40 * this.scaleFactor, substring = [], alpha = 255, fontSize = 15 * this.scaleFactor) {
    push();
    textAlign(LEFT, TOP);
    textFont("Arial");
    textSize(fontSize);

    xx += this.editingInput.w / 2;

    let startX = xx;

    fill(23, 42, 43, 0);
    for (let i = 0; i < substring.length; i++) {
      let newString = substring[i];

      if (substring[i].startsWith("_{") && substring[i].endsWith("}")) {
        newString = substring[i].replace(/_{/g, "");
        newString = newString.replace(/}/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy + 10 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (substring[i].startsWith("^{") && substring[i].endsWith("}")) {
        newString = substring[i].replace(/\^{/g, "");
        newString = newString.replace(/}/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy - 2 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (substring[i].startsWith("_")) {
        newString = substring[i].replace(/_/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy + 10 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (substring[i].startsWith("^")) {
        newString = substring[i].replace(/\^/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy - 2 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else {
        text(substring[i], xx, yy);
        xx += textWidth(newString);
      }
    }
    xx = startX - (xx - startX) / 2 - this.editingInput.w / 2;
    fill(23, 42, 43, alpha);
    for (let i = 0; i < substring.length; i++) {
      let newString = substring[i];

      if (substring[i].startsWith("_{") && substring[i].endsWith("}")) {
        newString = substring[i].replace(/_{/g, "");
        newString = newString.replace(/}/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy + 10 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (substring[i].startsWith("^{") && substring[i].endsWith("}")) {
        newString = substring[i].replace(/\^{/g, "");
        newString = newString.replace(/}/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy - 2 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (substring[i].startsWith("_")) {
        newString = substring[i].replace(/_/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy + 10 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (substring[i].startsWith("^")) {
        newString = substring[i].replace(/\^/g, "");
        push();
        textSize(fontSize * 0.73);
        text(newString, xx, yy - 2 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else {
        text(substring[i], xx, yy);
        xx += textWidth(newString);
      }
    }

    pop();
  }
}
