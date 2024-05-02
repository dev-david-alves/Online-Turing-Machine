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

    // Create the first input
    this.rules = [];

    this.rules.push(
      {
        label: ["a->b,c"],
        width: 0,
      },
      {
        label: ["b->c,d"],
        width: 0,
      },
      {
        label: ["c->d,e"],
        width: 0,
      },
      {
        label: ["david -> bonito, demais"],
        width: 0,
      }
    );

    // Calculate the width of all rules
    for (let i = 0; i < this.rules.length; i++) {
      this.rules[i].width = this.calculateRuleWidth(-1000, -1000, this.rules[i].label, this.ruleFontSize);
    }

    this.rulesX = this.x;
    this.rulesY = this.y;
    this.rulesWidth = 0;
    this.rulesHeight = 0;
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
  }

  createBox() {
    this.mainDiv = createDiv();
    this.mainDiv.parent(this.inputParent);
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
    this.readInput.class("px-2 py-1 rounded-[3px] focus:outline-none focus:ring focus:ring-1 focus:border-[rgb(23, 98, 163)] w-[80px] bg-transparent border-2 border-[#1762a3] text-white");
    this.readInput.attribute("placeholder", "Lê");
    this.writeInput = createInput();
    this.writeInput.parent(this.inputDiv);
    this.writeInput.class("px-2 py-1 rounded-[3px] focus:outline-none focus:ring focus:ring-1 focus:border-[rgb(23, 98, 163)] w-[80px] bg-transparent border-2 border-[#1762a3] text-white");
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
    return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
  }

  confirmRule() {
    console.log("Confirming rule");
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
    if (!this.visible) return;

    if (keyCode === ENTER) {
      this.confirmRule();
    }
  }

  mousePressed() {}

  update(scaleFactor = 1.0) {
    if (!this.mainDiv) return;

    if (this.scaleFactor != scaleFactor) {
      this.x = (this.x / this.scaleFactor) * scaleFactor;
      this.y = (this.y / this.scaleFactor) * scaleFactor;
      this.marginBox = 5 * scaleFactor;
      this.scaleFactor = scaleFactor;
    }

    this.rulesHeight = this.rules.length * this.offsetBoxY;
    this.rulesWidth = this.getTheLargestWidth();

    this.rollover = this.containsPoint(mouseX, mouseY);
    this.visible = this.selected && !isMouseWithShiftPressed;

    if (this.visible) this.mainDiv.elt.style.visibility = "visible";
    else this.mainDiv.elt.style.visibility = "hidden";

    this.mainDiv.position(this.x + windowOffset.x, this.y + windowOffset.y);
    this.w = this.mainDiv.elt.offsetWidth;
    this.h = this.mainDiv.elt.offsetHeight;
  }

  draw() {
    // Draw a rectangle around the rule
    push();
    noFill();
    stroke(255, 0, 0);
    strokeWeight(1);
    rect(this.rulesX - this.rulesWidth / 2, this.rulesY, this.rulesWidth, this.rulesHeight + this.offsetBoxY / 2);
    pop();

    // Draw the rules
    for (let i = 0; i < this.rules.length; i++) {
      let yy = this.rulesY + i * this.offsetBoxY + this.offsetBoxY * 0.8;
      let xx = this.rulesX;

      this.drawText(xx, yy, this.rules[i].label, this.ruleFontSize);
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

  calculateRuleWidth(xx = this.x, yy = this.y, substring = [], fontSize = 15 * this.scaleFactor) {
    push();
    textAlign(CENTER, CENTER);
    textFont("Arial");
    textSize(fontSize);

    let startX = xx;

    fill(0, 0, 0, 0);

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

    return abs(xx - startX);
  }

  drawText(xx = this.x, yy = this.y, substring = [], fontSize = 15 * this.scaleFactor) {
    push();
    textAlign(CENTER, CENTER);
    textFont("Arial");
    textSize(fontSize);
    fill(23, 42, 43);

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
