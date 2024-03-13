class CustomInput {
  constructor(x, y, parentColor = { r: 0, g: 0, b: 0 }, texMap = {}) {
    this.x = x;
    this.y = y;
    this.selected = true;
    this.color = { r: 0, g: 0, b: 0 };
    this.parentColor = parentColor;
    this.value = "";
    this.modifiedText = createDiv(this.value);
    this.modifiedText.style('white-space', 'pre');
    this.fontSize = 15;

    this.modifiedText.style("text-align", "center");
    this.modifiedText.style("font-size", `${this.fontSize}px`);

    this.texMap = texMap;
    
    this.h = 20;
    this.w = this.modifiedText.elt.offsetWidth + 20;
    this.cursorY = this.y - (this.h * 0.8) / 2;
    this.cursorX = this.x;

    // Blinking cursor
    this.blinkInterval = 500;
    this.lastBlinkTime = 0;
    this.textToShow = "Blinking Text";
    this.isVisible = true;
    this.isTyping = false;
  }
  
  update() {
    this.w = this.modifiedText.elt.offsetWidth;
    this.cursorY = this.y - (this.h * 0.8) / 2;
    this.cursorX = this.x - this.w / 2 + this.modifiedText.elt.offsetWidth + 1;

    if(this.isTyping) {
      this.isVisible = true;
      this.lastBlinkTime = millis();
    } else if (millis() - this.lastBlinkTime >= this.blinkInterval) {
      this.isVisible = !this.isVisible;
      this.lastBlinkTime = millis();
    }

    if(this.selected) {
      this.modifiedText.style("color", `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`);
    }

    this.modifiedText.html(this.value);
    let regexPattern = "\\\\sub\\(.+?\\)";
    let regex = new RegExp(regexPattern, "g");
    let matches = this.modifiedText.html().match(regex);
      
    if(matches) {
      for(let i = 0; i < matches.length; i++) {
        let sub = matches[i].slice(5, -1);
        this.modifiedText.html(this.modifiedText.html().replace(matches[i], `<sub>${sub}</sub>`));
      }
    }

    regexPattern = "\\\\sup\\(.+?\\)";
    regex = new RegExp(regexPattern, "g");
    matches = this.modifiedText.html().match(regex);
      
    if(matches) {
      for(let i = 0; i < matches.length; i++) {
        let sup = matches[i].slice(5, -1);
        this.modifiedText.html(this.modifiedText.html().replace(matches[i], `<sup>${sup}</sup>`));
      }
    }

    for(let key in this.texMap) {
      let reg = new RegExp(`\\${key}`, 'g');
      this.modifiedText.html(this.modifiedText.html().replace(reg, this.texMap[key]));
    }

    if(this.selected) {
      this.color = this.parentColor;
    } else {
      this.color = { r: 0, g: 0, b: 0 };
    }
  }

  keyTyped() {
    if(!this.selected) return;

    if(keyCode === BACKSPACE || keyCode === DELETE || keyCode === ENTER) {
      return;
    } else {
      this.value += key;
      this.isTyping = true;
    }
  }

  keyReleased() {
    if(!this.selected) return;

    if(this.isTyping) {
      this.isTyping = false;
    }
  }

  keyPressed() {
    if(!this.selected) return;

    if(keyCode === BACKSPACE) {
      this.value = this.value.slice(0, -1);
      this.isTyping = true;
    }

    // handle ctrl + v
    if(keyCode === 86 && keyIsDown(CONTROL)) {
      navigator.clipboard.readText().then((text) => {
        this.value += text;
      });
    }
  }

  draw() {
    push();
      let windowOffsetX = windowWidth - width;
      let windowOffsetY = windowHeight - height;

      this.modifiedText.style("position", "absolute");
      this.modifiedText.style("left", `${this.x + windowOffsetX / 2}px`);
      this.modifiedText.style("top", `${this.y + windowOffsetY / 2 - 2}px`);
      this.modifiedText.style("transform", `translate(-50%, -50%)`);

      if(this.selected && this.isVisible) {
        stroke(this.color.r, this.color.g, this.color.b);
        strokeWeight(1);
        line(this.cursorX, this.cursorY, this.cursorX, this.cursorY + this.h * 0.8);
      }
    pop();
  }
}