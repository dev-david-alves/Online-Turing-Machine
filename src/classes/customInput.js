class CustomInput {
  constructor(x, y, texMap = {}, scaleFactor = 1.0, parent = null) {
    this.scaleFactor = scaleFactor;
    this.x = x * scaleFactor;
    this.y = y * scaleFactor;
    this.texMap = texMap;
    this.w = 100 * scaleFactor;
    this.h = 30 * scaleFactor;
    this.padding = 30;
    this.visible = false;
    this.fontSize = 15 * this.scaleFactor;
    this.textW = 0;

    this.input = createInput("");
    this.input.position(this.x + windowOffset.x, this.y + windowOffset.y);
    this.input.style("position", "absolute");
    if (parent) this.input.parent(parent);
    // this.input.addClass("canvas-input");
    this.input.input(() => this.textInput(this.input.value()));
    this.input.size(this.w, this.h);

    // placeholder
    // this.input.attribute("placeholder", "Ex: 0 -> x, D");
    this.input.style("outline", "none");
    this.input.style("border", "1px solid #000000");
    this.input.style("text-align", "center");

    this.allSubstrings = [];
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

  texMapMatch() {
    for (let key in this.texMap) {
      for (let i = 0; i < this.allSubstrings.length; i++) {
        let regex = new RegExp(`\\${key}`, "g");
        this.allSubstrings[i] = this.allSubstrings[i].replace(regex, this.texMap[key]);
      }
    }
  }

  update(scaleFactor = 1.0) {
    if (this.scaleFactor != scaleFactor) {
      this.x = (this.x / this.scaleFactor) * scaleFactor;
      this.y = (this.y / this.scaleFactor) * scaleFactor;
      this.w = (this.w / this.scaleFactor) * scaleFactor;
      this.scaleFactor = scaleFactor;
    }

    this.fontSize = 15 * scaleFactor;
    this.textW = calculateTextWidth(this.x, this.y, this.allSubstrings, this.fontSize);

    this.input.style("border-radius", 5 * this.scaleFactor + "px");

    // this.w = max(this.offsetX * 2 + this.padding * this.scaleFactor, 100 * this.scaleFactor);
    this.h = 30 * this.scaleFactor;
    this.input.size(this.w, this.h);
    this.input.position(this.x + windowOffset.x, this.y + windowOffset.y);
    this.input.style("font-size", 15 * this.scaleFactor + "px");

    if (!this.visible) this.input.hide(); //  || this.x < 0 || this.x + this.w > width || this.y < 0 || this.y + this.h > height
    else this.input.show();

    if (!this.visible) {
      this.input.elt.setSelectionRange(this.input.elt.selectionStart, this.input.elt.selectionStart);
      this.input.elt.blur();
    }
  }

  textInput(value) {
    this.subAndSupMatch(value);
    this.texMapMatch();
  }
}
