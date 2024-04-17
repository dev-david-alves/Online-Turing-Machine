class CustomInput {
  constructor(x, y, texMap = {}, scaleFactor = 1.0, parent = null) {
    this.scaleFactor = scaleFactor;
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.offsetX = 0;
    this.texMap = texMap;
    this.w = 100 * scaleFactor;
    this.h = 30 * scaleFactor;
    this.padding = 30;
    this.visible = false;

    this.input = createInput("");
    if (parent) this.input.parent(parent);
    this.input.addClass("canvas-input");
    this.input.input(() => this.textInput(this.input.value()));
    this.input.size(this.w, this.h);

    this.allSubstrings = [];

    this.subAndSupMatch(this.input.value());
  }

  // RegEx Functions
  subAndSupMatch(value) {
    let regexPattern = "(?<!\\\\)_\\{.+?\\}|(?<!\\\\)_\\w|\\\\sub\\(.+?\\)|\\\\sub\\{.+?\\}|(?<!\\\\)\\^\\{.+?\\}|(?<!\\\\)\\^\\w|\\\\sup\\(.+?\\)|\\\\sup\\{.+?\\}";
    let regex = new RegExp(regexPattern, "g");
    let matches = value.match(regex);

    // console.log(matches);

    this.allSubstrings = [];

    // For each match, get the index for substring
    if (matches) {
      let index = 0;
      let lastIndex = 0;
      for (let match of matches) {
        index = value.indexOf(match, index);
        this.allSubstrings.push(value.substring(lastIndex, index));
        this.allSubstrings.push(value.substring(index, index + match.length));
        index += match.length;
        lastIndex = index;
      }

      if (lastIndex < value.length) this.allSubstrings.push(value.substring(lastIndex));
    } else {
      this.allSubstrings.push(value);
    }

    // console.log(this.allSubstrings);
  }

  update(scaleFactor = 1.0) {
    if (this.scaleFactor != scaleFactor) {
      this.x = (this.x / this.scaleFactor) * scaleFactor;
      this.y = (this.y / this.scaleFactor) * scaleFactor;
      this.scaleFactor = scaleFactor;
    }

    this.w = max(this.offsetX * 2 + this.padding * this.scaleFactor, 100 * this.scaleFactor);
    this.h = 30 * this.scaleFactor;
    this.input.size(this.w, this.h);
    this.input.position(this.x + windowOffset.x, this.y + windowOffset.y);
    this.input.style("font-size", 15 * this.scaleFactor + "px");

    if (this.x < 0 || this.x + this.w > width || this.y < 0 || this.y + this.h > height) this.input.hide();
    else this.input.show();

    if (this.visible) this.input.show();
    else this.input.hide();
  }

  getFullTextSize() {
    return this.draw(-1000, -1000, 0);
  }

  textInput(value) {
    this.subAndSupMatch(value);
    this.offsetX = this.getFullTextSize() / 2;
  }

  draw(xx = this.x, yy = this.y + 40 * this.scaleFactor, alpha = 255) {
    push();
    textAlign(LEFT, TOP);
    textFont("Arial");
    textSize(15 * this.scaleFactor);
    fill(23, 42, 43, alpha);

    xx += this.w / 2 - this.offsetX;

    let startX = xx;

    for (let i = 0; i < this.allSubstrings.length; i++) {
      let newString = this.allSubstrings[i];

      if (this.allSubstrings[i].includes("_{")) {
        newString = this.allSubstrings[i].replace(/_{/g, "");
        newString = newString.replace(/}/g, "");
        push();
        textSize(11 * this.scaleFactor);
        text(newString, xx, yy + 10 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (this.allSubstrings[i].includes("^{")) {
        newString = this.allSubstrings[i].replace(/\^{/g, "");
        newString = newString.replace(/}/g, "");
        push();
        textSize(11 * this.scaleFactor);
        text(newString, xx, yy - 2 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (this.allSubstrings[i].includes("_") && this.allSubstrings[i].startsWith("_")) {
        newString = this.allSubstrings[i].replace(/_/g, "");
        push();
        textSize(11 * this.scaleFactor);
        text(newString, xx, yy + 10 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else if (this.allSubstrings[i].includes("^") && this.allSubstrings[i].startsWith("^")) {
        newString = this.allSubstrings[i].replace(/\^/g, "");
        push();
        textSize(11 * this.scaleFactor);
        text(newString, xx, yy - 2 * this.scaleFactor);
        xx += textWidth(newString);
        pop();
      } else {
        text(this.allSubstrings[i], xx, yy);
        xx += textWidth(newString);
      }
    }
    pop();

    return xx - startX;
  }
}
