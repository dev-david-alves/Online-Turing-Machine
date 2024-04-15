class CustomInput {
  constructor(x, y, color = { r: 0, g: 0, b: 0 }, texMap = {}, scaleFactor = 1.0) {
    this.scaleFactor = scaleFactor;
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.color = color;
    this.texMap = texMap;

    this.value = this.createSpan("");
    this.value.style("position", "absolute");
    this.value.style("transform", `translate(-50%, -50%)`);
    this.selected = false;
    this.isTyping = false;

    this.h = 20 * scaleFactor;
    this.w = this.value.elt.offsetWidth * scaleFactor;

    this.cursor = {
      index: 0,
      position: {
        y: this.y - (this.h * 0.8) / 2,
        x: this.x * scaleFactor,
      },
      properties: {
        blinkInterval: 500,
        lastBlinkTime: 0,
        isVisible: true,
        thickness: scaleFactor,
        height: this.h * 0.8,
      },
    };
  }

  createSpan(value) {
    let span = createSpan(value);
    span.style("white-space", "pre");
    span.style("text-align", "center");
    span.style("font-size", `${15 * this.scaleFactor}px`);
    span.style("pointer-events", "none");
    span.style("user-select", "none");
    // span.style("font-style", "italic");

    return span;
  }

  // RegEx Functions
  subMatch() {
    let regexPattern = "(?<!\\\\)_\\{.+?\\}|(?<!\\\\)_\\w|\\\\sub\\(.+?\\)|\\\\sub\\{.+?\\}";
    let regex = new RegExp(regexPattern, "g");
    let matches = this.value.html().match(regex);

    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        let sub = undefined;
        if (matches[i].includes("\\sub")) {
          sub = matches[i].slice(5, -1);
          this.cursor.index -= 6 - sub.length;
        } else if (matches[i].includes("_{")) {
          sub = matches[i].slice(2, -1);
          this.cursor.index -= 3;
          this.cursor.index += 5;
        } else {
          sub = matches[i].slice(1);
          this.cursor.index += 4;
        }

        this.value.html(this.value.html().replace(matches[i], `<sub>${sub}</sub>`));
      }
    }
  }

  supMatch() {
    let regexPattern = "(?<!\\\\)\\^\\{.+?\\}|(?<!\\\\)\\^\\w|\\\\sup\\(.+?\\)|\\\\sup\\{.+?\\}";
    let regex = new RegExp(regexPattern, "g");
    let matches = this.value.html().match(regex);

    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        let sup = undefined;
        if (matches[i].includes("\\sup")) {
          sup = matches[i].slice(5, -1);
          this.cursor.index -= 6 - sup.length;
        } else if (matches[i].includes("^{")) {
          sup = matches[i].slice(2, -1);
          this.cursor.index -= 3;
          this.cursor.index += 5;
        } else {
          sup = matches[i].slice(1);
          this.cursor.index += 4;
        }

        this.value.html(this.value.html().replace(matches[i], `<sup>${sup}</sup>`));
      }
    }
  }

  mapMatch() {
    for (let key in this.texMap) {
      let reg = new RegExp(`\\${key}`, "g");
      let lastLength = this.value.html().length;
      this.value.html(this.value.html().replace(reg, this.texMap[key]));
      this.cursor.index += this.value.html().length - lastLength;
    }
  }
  // End of RegEx Functions

  update(scaleFactor = 1.0) {
    this.scaleFactor = scaleFactor;
    this.h = 20 * this.scaleFactor;
    this.w = this.value.elt.offsetWidth;
    let span = this.createSpan(this.value.html().slice(0, this.cursor.index));
    this.cursor.position.x = this.x - this.w / 2 + span.elt.offsetWidth + 1;
    span.remove();

    this.cursor.properties.thickness = this.scaleFactor;

    if (this.isTyping) {
      this.cursor.properties.isVisible = true;
      this.cursor.properties.lastBlinkTime = millis();
    } else if (millis() - this.cursor.properties.lastBlinkTime >= this.cursor.properties.blinkInterval) {
      this.cursor.properties.isVisible = !this.cursor.properties.isVisible;
      this.cursor.properties.lastBlinkTime = millis();
    }

    if (this.selected) {
      this.value.style("color", `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`);
    } else {
      this.value.style("color", `rgb(0, 0, 0)`);
    }

    this.subMatch();
    this.supMatch();
    this.mapMatch();

    // check if there is a empty sub or sup tag
    let regexPattern = "<sub></sub>|<sup></sup>";
    let regex = new RegExp(regexPattern, "g");
    let matches = this.value.html().match(regex);

    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        this.value.html(this.value.html().replace(matches[i], ""));
        this.cursor.index -= 5;
      }
    }

    // check if the cursor.index is between a <sub></sub> or <sup></sup> tag
    let regexPattern01 = "<sub>.+?</sub>";
    let regexPattern02 = "<sup>.+?</sup>";
    let regex01 = new RegExp(regexPattern01, "g");
    let regex02 = new RegExp(regexPattern02, "g");
    let matches01 = this.value.html().match(regex01);
    let matches02 = this.value.html().match(regex02);

    let isBetweenSubOrSup = false;
    if (matches01) {
      for (let i = 0; i < matches01.length; i++) {
        if (this.cursor.index > this.value.html().indexOf(matches01[i]) && this.cursor.index < this.value.html().indexOf(matches01[i]) + matches01[i].length) {
          this.cursor.position.y = this.y - 2 * this.scaleFactor;
          this.cursor.properties.height = this.h * 0.5;
          isBetweenSubOrSup = true;
          break;
        }
      }
    }

    if (matches02) {
      for (let i = 0; i < matches02.length; i++) {
        if (this.cursor.index > this.value.html().indexOf(matches02[i]) && this.cursor.index < this.value.html().indexOf(matches02[i]) + matches02[i].length) {
          this.cursor.position.y = this.y - 10 * this.scaleFactor;
          this.cursor.properties.height = this.h * 0.5;
          isBetweenSubOrSup = true;
          break;
        }
      }
    }

    if (!isBetweenSubOrSup) {
      this.cursor.position.y = this.y - (this.h * 0.8) / 2;
      this.cursor.properties.height = this.h * 0.8;
    }

    this.value.style("left", `${this.x + windowOffset.x}px`);
    this.value.style("top", `${this.y + windowOffset.y - 2 * this.scaleFactor}px`);
    this.value.style("font-size", `${15 * this.scaleFactor}px`);
  }

  keyTyped() {
    if (!this.selected) return;

    if (!(keyCode === BACKSPACE || keyCode === DELETE || keyCode === ENTER || key === "<" || key === ">")) {
      this.isTyping = true;
      this.value.html(this.value.html().slice(0, this.cursor.index) + key + this.value.html().slice(this.cursor.index));
      this.cursor.index++;
    }
  }

  keyPressed() {
    if (!this.selected) return;

    // if (keyCode === ENTER) {
    //   console.log(this.value.html());
    //   console.log(this.cursor.index);
    // }

    if (keyCode === BACKSPACE) {
      this.isTyping = true;

      do {
        let didMatch = false;
        // check if the cursor is at the end of a sub or sup tag
        let match01 = this.value.html().slice(this.cursor.index - 5, this.cursor.index); // open tag
        let match02 = this.value.html().slice(this.cursor.index - 6, this.cursor.index); // close tag

        if (match01 === "<sub>" || match01 === "<sup>") {
          this.cursor.index = max(0, this.cursor.index - 5);
          didMatch = true;
        } else if (match02 === "</sub>" || match02 === "</sup>") {
          this.cursor.index = max(0, this.cursor.index - 6);
          didMatch = true;
        }

        if (!didMatch) break;
      } while (true);

      if (this.value.html().length === 0) return;
      if (this.cursor.index === 0) return;
      this.cursor.index = max(0, this.cursor.index - 1);
      this.value.html(this.value.html().slice(0, this.cursor.index) + this.value.html().slice(this.cursor.index + 1));
    } else if (keyCode === DELETE) {
      this.isTyping = true;

      do {
        let didMatch = false;
        // check if the cursor is at the start of a sub or sup tag
        let match01 = this.value.html().slice(this.cursor.index, this.cursor.index + 5); // open tag
        let match02 = this.value.html().slice(this.cursor.index, this.cursor.index + 6); // close tag

        if (match01 === "<sub>" || match01 === "<sup>") {
          this.cursor.index = min(this.value.html().length, this.cursor.index + 5);
          didMatch = true;
        } else if (match02 === "</sub>" || match02 === "</sup>") {
          this.cursor.index = min(this.value.html().length, this.cursor.index + 6);
          didMatch = true;
        }

        if (!didMatch) break;
      } while (true);

      if (this.value.html().length === 0) return;
      if (this.cursor.index === this.value.html().length) return;
      this.value.html(this.value.html().slice(0, this.cursor.index) + this.value.html().slice(this.cursor.index + 1));
    } else if (keyCode === LEFT_ARROW) {
      let isThereAnyTag = false;

      do {
        let didMatch = false;
        // check if the cursor is at the end of a sub or sup tag
        let match01 = this.value.html().slice(this.cursor.index - 5, this.cursor.index); // open tag
        let match02 = this.value.html().slice(this.cursor.index - 6, this.cursor.index); // close tag

        if (match01 === "<sub>" || match01 === "<sup>") {
          this.cursor.index = max(0, this.cursor.index - 5);
          didMatch = true;
          isThereAnyTag = true;
        } else if (match02 === "</sub>" || match02 === "</sup>") {
          this.cursor.index = max(0, this.cursor.index - 6);
          didMatch = true;
          isThereAnyTag = true;
        }

        if (!didMatch) break;
      } while (true);

      if (!isThereAnyTag) {
        this.isTyping = true;
        this.cursor.index = max(0, this.cursor.index - 1);
      }
    } else if (keyCode === RIGHT_ARROW) {
      let isThereAnyTag = false;

      do {
        let didMatch = false;
        // check if the cursor is at the start of a sub or sup tag
        let match01 = this.value.html().slice(this.cursor.index, this.cursor.index + 5); // open tag
        let match02 = this.value.html().slice(this.cursor.index, this.cursor.index + 6); // close tag

        if (match01 === "<sub>" || match01 === "<sup>") {
          this.cursor.index = min(this.value.html().length, this.cursor.index + 5);
          didMatch = true;
          isThereAnyTag = true;
        } else if (match02 === "</sub>" || match02 === "</sup>") {
          this.cursor.index = min(this.value.html().length, this.cursor.index + 6);
          didMatch = true;
          isThereAnyTag = true;
        }

        if (!didMatch) break;
      } while (true);

      if (!isThereAnyTag) {
        this.isTyping = true;
        this.cursor.index = min(this.value.html().length, this.cursor.index + 1);
      }
    }

    // handle ctrl + v
    if (keyCode === 86 && keyIsDown(CONTROL)) {
      navigator.clipboard.readText().then((text) => {
        this.value.html(this.value.html().slice(0, this.cursor.index) + text + this.value.html().slice(this.cursor.index));
        this.cursor.index = min(this.value.html().length, this.cursor.index + text.length);
      });
    }
  }

  keyReleased() {
    if (!this.selected) return;

    if (this.isTyping) {
      this.isTyping = false;
    }
  }

  draw() {
    push();
    if (this.selected && this.cursor.properties.isVisible) {
      stroke(this.color.r, this.color.g, this.color.b);
      strokeWeight(this.cursor.properties.thickness);
      line(this.cursor.position.x, this.cursor.position.y, this.cursor.position.x, this.cursor.position.y + this.cursor.properties.height);
    }
    pop();
  }
}