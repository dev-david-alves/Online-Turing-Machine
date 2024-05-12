class TransitionBox {
  constructor(x, y, texMap = {}, scaleFactor = 1.0, parent = null, rules = []) {
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.scaleFactor = scaleFactor;
    this.w = 0;
    this.h = 0;
    this.rollover = false;
    this.selected = false;
    this.selectedRuleIndex = -1;
    this.hoveredRuleIndex = -1;
    this.texMap = texMap;

    this.visible = false;
    this.inputParent = parent;
    this.marginBox = 5 * this.scaleFactor;
    this.offsetBoxY = 18 * this.scaleFactor;
    this.ruleFontSize = 12 * this.scaleFactor;

    // Transition box

    this.directionButtonPressed = "left";

    this.mainDiv = null;
    this.boxDiv = null;
    this.inputDiv = null;
    this.buttonDiv = null;
    this.directionButtonDiv = null;
    this.leftButton = null;
    this.rightButton = null;
    this.confirmButton = null;
    this.labelDiv = null;
    this.labelSpan = null;

    this.createBox();

    if (this.leftButton && this.rightButton) {
      this.switchButtons("left");
      this.leftButton.mousePressed(() => {
        this.switchButtons("left");
      });

      this.rightButton.mousePressed(() => {
        this.switchButtons("right");
      });
    }

    if (this.readInput && this.writeInput) {
      this.readInput.input(() => {
        this.changeResultText();
      });

      this.writeInput.input(() => {
        this.changeResultText();
      });
    }

    // Create the first input
    this.rules = rules;
    this.rulesX = this.x;
    this.rulesY = this.y;
    this.rulesWidth = 0;
    this.rulesHeight = 0;

    for (let i = 0; i < this.rules.length; i++) {
      this.rules[i].width = calculateTextWidth(-1000, -1000, this.rules[i].label, this.ruleFontSize);
    }

    this.changeResultText();
  }

  switchButtons(direction) {
    if (direction === "left") {
      this.directionButtonPressed = "left";
      this.leftButton.style("background-color", "#1762a3");
      this.rightButton.style("background-color", "transparent");
    } else {
      this.directionButtonPressed = "right";
      this.rightButton.style("background-color", "#1762a3");
      this.leftButton.style("background-color", "transparent");
    }

    this.changeResultText();
  }

  createBox() {
    this.mainDiv = createDiv();
    this.mainDiv.parent(this.inputParent);
    this.mainDiv.position(this.x + windowOffset.x, this.y + windowOffset.y);
    this.mainDiv.class("flex flex-col gap-[2px] items-center justify-center absolute z-[100]");
    this.boxDiv = createDiv();
    this.boxDiv.parent(this.mainDiv);
    this.boxDiv.class("bg-[#222831] p-2 rounded-[5px] flex flex-col gap-1 drop-shadow-md");

    // Inputs
    this.inputDiv = createDiv();
    this.inputDiv.parent(this.boxDiv);
    this.inputDiv.class("flex items-center justify-center gap-1");
    this.readInput = createInput();
    this.readInput.parent(this.inputDiv);
    this.readInput.class("px-2 py-1 rounded-[3px] focus:outline-none w-[80px] bg-transparent border-2 border-[#1762a3] text-white");
    this.readInput.attribute("placeholder", "Lê");
    this.writeInput = createInput();
    this.writeInput.parent(this.inputDiv);
    this.writeInput.class("px-2 py-1 rounded-[3px] focus:outline-none w-[80px] bg-transparent border-2 border-[#1762a3] text-white"); //focus:ring focus:ring-1 focus:border-[rgb(23, 98, 163)]
    this.writeInput.attribute("placeholder", "Escreve");

    // Buttons
    this.buttonDiv = createDiv();
    this.buttonDiv.parent(this.boxDiv);
    this.buttonDiv.class("flex items-center justify-between");
    this.directionButtonDiv = createDiv();
    this.directionButtonDiv.parent(this.buttonDiv);
    this.directionButtonDiv.class("flex items-center gap-1");
    this.leftButton = createButton("E");
    this.leftButton.parent(this.directionButtonDiv);
    this.leftButton.class("transition-box-button");
    this.leftButton.id("leftButton");

    this.rightButton = createButton("D");
    this.rightButton.parent(this.directionButtonDiv);
    this.rightButton.class("transition-box-button");
    this.rightButton.id("rightButton");

    this.confirmButton = createButton("<i class='fa-solid fa-check'></i>");
    this.confirmButton.parent(this.buttonDiv);
    this.confirmButton.class("text-center w-[40px] h-[40px] outline-none text-white");
    this.confirmButton.mousePressed(() => this.confirmRule());

    // Label
    this.labelDiv = createDiv();
    this.labelDiv.parent(this.mainDiv);
    this.labelDiv.class("bg-[#222831] px-3 py-1 rounded-[5px] flex flex-col gap-1 drop-shadow-md");
    this.labelSpan = createSpan("aasad -> b, D");
    this.labelSpan.parent(this.labelDiv);
    this.labelSpan.class("font-semibold text-white");
  }

  containsPoint(x = mouseX, y = mouseY) {
    // this.rulesX - this.rulesWidth / 2, this.rulesY, this.rulesWidth, this.rulesHeight + this.offsetBoxY / 2
    return x > this.rulesX - this.rulesWidth / 2 && x < this.rulesX + this.rulesWidth / 2 && y > this.rulesY && y < this.rulesY + this.rulesHeight + this.offsetBoxY / 2;
  }

  ruleContainsPoint(x = mouseX, y = mouseY) {
    for (let i = 0; i < this.rules.length; i++) {
      let yy = this.rulesY + i * this.offsetBoxY + this.offsetBoxY * 0.8;
      let xx = this.rulesX;

      if (x > xx - this.rules[i].width / 2 && x < xx + this.rules[i].width / 2 && y > yy - this.offsetBoxY / 2 && y < yy + this.offsetBoxY / 2) {
        return i;
      }
    }

    return -1;
  }

  ruleAlreadyExists(labelA) {
    for (let i = 0; i < this.rules.length; i++) {
      let labelB = this.rules[i].label;

      if (JSON.stringify(labelA) === JSON.stringify(labelB)) return true;
    }

    return false;
  }

  confirmRule() {
    if (this.selectedRuleIndex !== -1) {
      let { allReadSubstrings, allWriteSubstrings, direction } = this.changeResultText();

      // concat all arrays
      let rule = allReadSubstrings.concat([" ", "→", " "], allWriteSubstrings, [", "], [direction]);

      if (!this.ruleAlreadyExists(rule)) {
        this.rules[this.selectedRuleIndex] = { label: rule, width: calculateTextWidth(-1000, -1000, rule, this.ruleFontSize) };
      }

      this.readInput.value("");
      this.writeInput.value("");
      this.switchButtons("left");

      this.selectedRuleIndex = -1;

      this.selected = false;
    } else {
      let { allReadSubstrings, allWriteSubstrings, direction } = this.changeResultText();

      // concat all arrays
      let rule = allReadSubstrings.concat([" ", "→", " "], allWriteSubstrings, [", "], [direction]);

      if (!this.ruleAlreadyExists(rule)) {
        this.rules.push({ label: rule, width: calculateTextWidth(-1000, -1000, rule, this.ruleFontSize) });
      }

      this.readInput.value("");
      this.writeInput.value("");
      this.switchButtons("left");

      this.selectedRuleIndex = -1;

      this.selected = false;
    }

    createHistory();
  }

  remove() {
    // remove all elements
    this.mainDiv.remove();
  }

  removeRule() {
    if (this.selectedRuleIndex !== -1) {
      this.rules.splice(this.selectedRuleIndex, 1);
      this.selectedRuleIndex = -1;

      createHistory();
    }
  }

  keyPressed() {
    if (keyCode === ENTER) {
      if (!this.visible) return;

      this.confirmRule();
    } else if (keyCode === BACKSPACE) {
      if (!this.visible) return;

      this.checkReadAndWriteInput();
    } else if (keyCode === DELETE) {
      this.removeRule();
    }
  }

  getRule() {
    if (this.selectedRuleIndex !== -1) {
      let allSubstrings = convertSubstringsToString(this.rules[this.selectedRuleIndex].label);
      let read = allSubstrings.split("→")[0].trim();
      let write = allSubstrings.split("→")[1].trim();
      // Remove the last character (direction)
      write = write.substring(0, write.length - 3);

      this.readInput.value(read);
      this.writeInput.value(write);

      if (allSubstrings.includes(", E")) {
        this.switchButtons("left");
      } else if (allSubstrings.includes(", D")) {
        this.switchButtons("right");
      }
    }
  }

  mousePressed() {
    this.selectedRuleIndex = this.ruleContainsPoint();

    if (this.selectedRuleIndex !== -1 && getIdOfSelectedButton() === "delete") {
      this.removeRule();
    }
  }

  doubleClick() {
    this.selectedRuleIndex = this.ruleContainsPoint();
    this.selected = this.selectedRuleIndex !== -1;
    this.getRule();
  }

  checkReadAndWriteInput() {
    // Regex that tests if the text has only one character (any character)
    let regex = /^.$/;

    // Check if match one of the texMap keys
    let readValue = this.readInput.value().trim();
    let writeValue = this.writeInput.value().trim();

    this.readInput.style("border-color", "red");
    this.writeInput.style("border-color", "red");

    let readIsValid = this.readInput.value().length === 0 || this.readInput.value().match(regex) || this.texMap[readValue];
    let writeIsValid = this.writeInput.value().length === 0 || this.writeInput.value().match(regex) || this.texMap[writeValue];

    if (readIsValid) {
      this.readInput.style("border-color", "#1762a3");
      if (this.texMap[readValue]) this.readInput.value(this.texMap[readValue]);
    }

    if (writeIsValid) {
      this.writeInput.style("border-color", "#1762a3");
      if (this.texMap[writeValue]) this.writeInput.value(this.texMap[writeValue]);
    }

    return { readIsValid, writeIsValid };
  }

  changeResultText() {
    let { readIsValid, writeIsValid } = this.checkReadAndWriteInput();

    let allReadSubstrings = [];
    if (readIsValid && this.readInput.value().trim().length > 0) {
      allReadSubstrings = transformInputText(this.readInput.value(), this.texMap);
    } else {
      allReadSubstrings = ["☐"];
    }

    let allWriteSubstrings = [];
    if (writeIsValid && this.writeInput.value().trim().length > 0) {
      allWriteSubstrings = transformInputText(this.writeInput.value(), this.texMap);
    } else {
      allWriteSubstrings = ["☐"];
    }

    let direction = this.directionButtonPressed === "left" ? "E" : "D";
    this.labelSpan.html(allReadSubstrings[0] + " → " + allWriteSubstrings[0] + ", " + direction);

    return { allReadSubstrings, allWriteSubstrings, direction };
  }

  update(scaleFactor = 1.0) {
    if (!this.mainDiv) return;

    if (this.scaleFactor != scaleFactor) {
      this.x = (this.x / this.scaleFactor) * scaleFactor;
      this.y = (this.y / this.scaleFactor) * scaleFactor;
      this.scaleFactor = scaleFactor;
    }

    this.marginBox = 5 * scaleFactor;
    this.offsetBoxY = 18 * scaleFactor;
    this.ruleFontSize = 12 * scaleFactor;

    for (let i = 0; i < this.rules.length; i++) {
      this.rules[i].width = calculateTextWidth(-1000, -1000, this.rules[i].label, this.ruleFontSize);
    }

    this.rulesHeight = this.rules.length * this.offsetBoxY;
    this.rulesWidth = this.getTheLargestWidth();

    this.rollover = this.containsPoint(mouseX, mouseY);
    this.visible = this.selected && !isMouseWithShiftPressed;

    if (this.visible) this.mainDiv.elt.style.visibility = "visible";
    else this.mainDiv.elt.style.visibility = "hidden";

    if (!this.selected) {
      this.readInput.value("");
      this.writeInput.value("");
      this.switchButtons("left");
    }

    this.mainDiv.position(this.x + windowOffset.x, this.y + windowOffset.y);
    this.w = this.mainDiv.elt.offsetWidth;
    this.h = this.mainDiv.elt.offsetHeight;
  }

  draw() {
    // Draw a rectangle around the rule
    // push();
    // noFill();
    // stroke(255, 0, 0);
    // strokeWeight(1);
    // rect(this.rulesX - this.rulesWidth / 2, this.rulesY, this.rulesWidth, this.rulesHeight + this.offsetBoxY / 2);
    // pop();

    // Draw the rules
    for (let i = 0; i < this.rules.length; i++) {
      let yy = this.rulesY + i * this.offsetBoxY + this.offsetBoxY * 0.8;
      let xx = this.rulesX - this.rules[i].width / 2;

      push();
      if (this.ruleContainsPoint(mouseX, mouseY) === i || this.selectedRuleIndex === i) fill(0, 0, 255);
      else fill(23, 42, 43);

      drawText(xx, yy, this.rules[i].label, this.ruleFontSize);
      pop();
    }
  }

  getTheLargestWidth() {
    let largestWidth = 0;

    for (let i = 0; i < this.rules.length; i++) {
      if (this.rules[i].width > largestWidth) {
        largestWidth = this.rules[i].width;
      }
    }

    return largestWidth;
  }
}
