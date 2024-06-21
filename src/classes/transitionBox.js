class TransitionBox {
  constructor(x, y, parent = null, rules = []) {
    this.parent = parent;
    this.scaleFactor = globalScaleFactor;

    // Position
    this.x = x * this.scaleFactor;
    this.y = y * this.scaleFactor;

    // Dimensions
    this.w = 0;
    this.h = 0;

    // Status variables
    this.hovering = false;
    this.selected = false;
    this.hoveredRuleIndex = -1;
    this.selectedRuleIndex = -1;

    // Constants
    this.offsetBoxYConstant = 18;
    this.offsetBoxY = this.offsetBoxYConstant * this.scaleFactor;
    this.ruleFontSizeConstant = 12;
    this.ruleFontSize = this.ruleFontSizeConstant * this.scaleFactor;

    // Transition box elements
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
    if (this.leftButton && this.rightButton) this.switchButtons("left");

    if (this.readInput && this.writeInput) {
      this.readInput.input(() => this.changeResultText());
      this.writeInput.input(() => this.changeResultText());
    }

    // Rules information
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
    this.mainDiv.parent(this.parent);
    this.mainDiv.position(this.x + globalWindowOffset.x, this.y + globalWindowOffset.y);
    this.mainDiv.class("flex flex-col gap-[.2rem] items-center justify-center absolute z-[100]");
    this.boxDiv = createDiv();
    this.boxDiv.parent(this.mainDiv);
    this.boxDiv.class("bg-[#222831] p-[1rem] rounded-[.5rem] flex flex-col gap-[.5rem] drop-shadow-md");

    // Inputs
    this.inputDiv = createDiv();
    this.inputDiv.parent(this.boxDiv);
    this.inputDiv.class("flex items-center justify-center gap-[.5rem]");
    this.readInput = createInput();
    this.readInput.parent(this.inputDiv);
    this.readInput.class("px-[1rem] py-1 rounded-[.4rem] focus:outline-none w-[8rem] bg-transparent border-2 border-[--color-primary] text-white");
    this.readInput.attribute("placeholder", "Lê");
    this.writeInput = createInput();
    this.writeInput.parent(this.inputDiv);
    this.writeInput.class("px-[1rem] py-1 rounded-[.4rem] focus:outline-none w-[8rem] bg-transparent border-2 border-[--color-primary] text-white");
    this.writeInput.attribute("placeholder", "Escreve");

    // Buttons
    this.buttonDiv = createDiv();
    this.buttonDiv.parent(this.boxDiv);
    this.buttonDiv.class("flex items-center justify-between");
    this.directionButtonDiv = createDiv();
    this.directionButtonDiv.parent(this.buttonDiv);
    this.directionButtonDiv.class("flex items-center gap-[.4rem]");
    this.leftButton = createButton("E");
    this.leftButton.parent(this.directionButtonDiv);
    this.leftButton.class("w-[3rem] h-[3rem] text-[1.2rem] text-white font-semibold border-[.1rem] border-[--color-primary] rounded-[.4rem] bg-transparent transition-colors");
    this.leftButton.id("leftButton");
    this.leftButton.mousePressed(() => this.switchButtons("left"));

    this.rightButton = createButton("D");
    this.rightButton.parent(this.directionButtonDiv);

    this.rightButton.class("w-[3rem] h-[3rem] text-[1.2rem] text-white font-semibold border-[.1rem] border-[--color-primary] rounded-[5px] bg-transparent transition-colors");
    this.rightButton.id("rightButton");
    this.rightButton.mousePressed(() => this.switchButtons("right"));

    this.confirmButton = createButton("<i class='fa-solid fa-check'></i>");
    this.confirmButton.parent(this.buttonDiv);
    this.confirmButton.class("text-center w-[40px] h-[40px] outline-none text-white");
    this.confirmButton.mousePressed(() => this.confirmRule());

    // Label
    this.labelDiv = createDiv();
    this.labelDiv.parent(this.mainDiv);
    this.labelDiv.class("bg-[#222831] px-[1rem] py-[.2rem] rounded-[5px] flex flex-col gap-1 drop-shadow-md");
    this.labelSpan = createSpan("aasad -> b, D");
    this.labelSpan.parent(this.labelDiv);
    this.labelSpan.class("font-semibold text-white");
  }

  containsPoint(x = mouseX, y = mouseY) {
    if (!this.mainDiv) return false;

    return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
  }

  ruleContainsPoint(x = mouseX, y = mouseY) {
    for (let i = 0; i < this.rules.length; i++) {
      let yy = this.rulesY + i * this.offsetBoxY + this.offsetBoxY * 0.8;
      let xx = this.rulesX;

      if (x > xx - this.rules[i].width / 2 && x < xx + this.rules[i].width / 2 && y > yy - this.offsetBoxY / 2 && y < yy + this.offsetBoxY / 2) return i;
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

      // Concat all arrays
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

      // Concat all arrays
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

  // Remove all elements
  remove() {
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
      this.confirmRule();
    } else if (keyCode === BACKSPACE) {
      this.checkReadAndWriteInput();
    } else if (keyCode === DELETE) {
      if (this.selected) return;
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

    if (this.selectedRuleIndex !== -1 && selectedLeftSidebarButton === "delete") {
      this.removeRule();
    }
  }

  doubleClick() {
    if (selectedLeftSidebarButton !== "select" && selectedLeftSidebarButton !== "addLink") return;
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

    let readIsValid = this.readInput.value().length === 0 || this.readInput.value().match(regex) || texMap[readValue];
    let writeIsValid = this.writeInput.value().length === 0 || this.writeInput.value().match(regex) || texMap[writeValue];

    if (readIsValid) {
      this.readInput.style("border-color", "#1762a3");
      if (texMap[readValue]) this.readInput.value(texMap[readValue]);
    }

    if (writeIsValid) {
      this.writeInput.style("border-color", "#1762a3");
      if (texMap[writeValue]) this.writeInput.value(texMap[writeValue]);
    }

    return { readIsValid, writeIsValid };
  }

  changeResultText() {
    let { readIsValid, writeIsValid } = this.checkReadAndWriteInput();

    let allReadSubstrings = [];
    if (readIsValid && this.readInput.value().trim().length > 0) {
      allReadSubstrings = transformInputText(this.readInput.value(), texMap);
    } else {
      allReadSubstrings = [texMap["\\blank"]];
    }

    let allWriteSubstrings = [];
    if (writeIsValid && this.writeInput.value().trim().length > 0) {
      allWriteSubstrings = transformInputText(this.writeInput.value(), texMap);
    } else {
      allWriteSubstrings = [texMap["\\blank"]];
    }

    let direction = this.directionButtonPressed === "left" ? "E" : "D";
    this.labelSpan.html(allReadSubstrings[0] + " → " + allWriteSubstrings[0] + ", " + direction);
    this.labelSpan.style("font-family", "cmunbi");

    return { allReadSubstrings, allWriteSubstrings, direction };
  }

  update() {
    if (!this.mainDiv) return;

    if (this.scaleFactor != globalScaleFactor) {
      this.x = (this.x / this.scaleFactor) * globalScaleFactor;
      this.y = (this.y / this.scaleFactor) * globalScaleFactor;
      this.offsetBoxY = this.offsetBoxYConstant * globalScaleFactor;
      this.ruleFontSize = this.ruleFontSizeConstant * globalScaleFactor;
      this.scaleFactor = globalScaleFactor;
    }

    for (let i = 0; i < this.rules.length; i++) {
      this.rules[i].width = calculateTextWidth(-1000, -1000, this.rules[i].label, this.ruleFontSize);
    }

    this.rulesHeight = this.rules.length * this.offsetBoxY;
    this.rulesWidth = this.getTheLargestWidth();

    this.hovering = this.containsPoint(mouseX, mouseY);

    if (this.selected) this.mainDiv.elt.style.visibility = "visible";
    else this.mainDiv.elt.style.visibility = "hidden";

    if (!this.selected) {
      this.readInput.value("");
      this.writeInput.value("");
      this.switchButtons("left");
    }

    this.mainDiv.position(this.x + globalWindowOffset.x, this.y + globalWindowOffset.y);
    this.w = this.mainDiv.elt.offsetWidth;
    this.h = this.mainDiv.elt.offsetHeight;
  }

  draw() {
    // Draw the rules
    for (let i = 0; i < this.rules.length; i++) {
      let yy = this.rulesY + i * this.offsetBoxY + this.offsetBoxY * 0.8;
      let xx = this.rulesX - this.rules[i].width / 2;

      push();
      fill("#ffffff");
      if (this.ruleContainsPoint(mouseX, mouseY) === i) fill("#E4E4E4");
      if (this.selectedRuleIndex === i) fill("#E4E4E4");

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
