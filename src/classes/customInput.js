class CustomInput {
  constructor(x, y, texMap = {}, parent = null) {
    // Start values
    this.scaleFactor = globalScaleFactor;
    this.x = x * this.scaleFactor;
    this.y = y * this.scaleFactor;
    this.texMap = texMap;

    // Dimensions
    this.fontSize = 15;
    this.width = 120;
    this.height = 30;
    this.textWidth = 0;

    // Status
    this.visible = false;

    // Input information
    this.input = createInput("");
    if (parent) this.input.parent(parent);
    this.input.size(this.width, this.height);
    this.input.class(`absolute px-[5px] outline-none border-solid border-[1px] border-black rounded-1 rounded text-center`);
    this.input.position(this.x + globalWindowOffset.x, this.y + globalWindowOffset.y);

    this.input.input(() => this.textInput(this.input.value()));

    // Break string for better drawing suberscripts and superscripts
    this.allSubstrings = [];
  }

  textInput(value) {
    this.allSubstrings = transformInputText(value, this.texMap);
  }

  update() {
    if (this.scaleFactor !== globalScaleFactor) {
      this.x = (this.x / this.scaleFactor) * globalScaleFactor;
      this.y = (this.y / this.scaleFactor) * globalScaleFactor;
      this.scaleFactor = globalScaleFactor;
    }

    this.textWidth = calculateTextWidth(this.x, this.y, this.allSubstrings, this.fontSize);
    this.input.class(`absolute px-[5px] outline-none border-solid border-2 border-[var(--selected-color)] rounded-1 rounded text-center`);
    this.input.position(this.x + globalWindowOffset.x, this.y + globalWindowOffset.y);

    if (!this.visible) {
      this.input.elt.setSelectionRange(this.input.elt.selectionStart, this.input.elt.selectionStart);
      this.input.elt.blur();
      this.input.hide();
    } else this.input.show();
  }
}
