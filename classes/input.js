class CustomInput {
  constructor(x, y, parentColor = { r: 0, g: 0, b: 0 }, texMap = {}) {
    this.x = x;
    this.y = y;
    this.selected = true;
    this.color = { r: 0, g: 0, b: 0 };
    this.parentColor = parentColor;
    this.value = "";
    this.modifiedText = "";
    this.texMap = texMap;
    
    this.h = 20;
    this.w = textWidth(this.value) + 20;
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
    this.w = textWidth(this.modifiedText) + 20;
    this.cursorY = this.y - (this.h * 0.8) / 2;
    this.cursorX = this.x - this.w / 2 + textWidth(this.modifiedText) + 11;

    if(this.isTyping) {
      this.isVisible = true;
      this.lastBlinkTime = millis();
    } else if (millis() - this.lastBlinkTime >= this.blinkInterval) {
      this.isVisible = !this.isVisible;
      this.lastBlinkTime = millis();
    }

    this.modifiedText = this.value;
    for(let key in this.texMap) {
      let reg = new RegExp(`\\${key}`, 'g');
      this.modifiedText = this.modifiedText.replace(reg, this.texMap[key]);
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
  }

  draw() {
    push();
      noStroke();
      fill(this.color.r, this.color.g, this.color.b);
      textAlign(CENTER, CENTER);
      text(this.modifiedText, this.x, this.y);

      if(this.selected && this.isVisible) {
        stroke(this.color.r, this.color.g, this.color.b);
        strokeWeight(1);
        line(this.cursorX, this.cursorY, this.cursorX, this.cursorY + this.h * 0.8);
      }
    pop();
  }
}