class CustomInput {
  constructor(x, y, parentColor = { r: 0, g: 0, b: 0 }, texMap = {}) {
    this.x = x;
    this.y = y;
    this.selected = true;
    this.value = "";
    this.parentColor = parentColor;
    this.color = { r: 0, g: 0, b: 0 };
    
    this.h = 20;
    this.w = textWidth(this.value) + 20;
    this.cursorY = this.y - (this.h * 0.8) / 2;
    this.cursorX = this.x;

    this.texMap = texMap;
    this.modifiedText = "";
  }
  
  update() {
    this.w = textWidth(this.modifiedText) + 20;
    this.cursorX = this.x - this.w / 2 + textWidth(this.modifiedText) + 11;

    this.modifiedText = this.value;
    for(let key in this.texMap) {
      this.reg = new RegExp(`\\${key}`, 'g');
      this.modifiedText = this.modifiedText.replace(this.reg, this.texMap[key]);
    }

    if(this.selected) {
      this.color = this.parentColor;
    } else {
      this.color = { r: 0, g: 0, b: 0 };
    }
  }

  keyTyped() {
    if(!this.selected) return;

    if(keyCode === BACKSPACE) {
      return;
    } else {
      this.value += key;
    }
  }

  keyPressed() {
    if(!this.selected) return;

    if(keyCode === BACKSPACE) {
      this.value = this.value.slice(0, -1);
    }
  }

  draw() {
    push();
      fill(255);
      stroke(this.color.r, this.color.g, this.color.b);
      strokeWeight(1);
      rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
      fill(this.color.r, this.color.g, this.color.b);
      noStroke();
      textAlign(CENTER, CENTER);
      text(this.modifiedText, this.x, this.y);

      if(this.selected) {
        stroke(this.color.r, this.color.g, this.color.b);
        strokeWeight(1);
        line(this.cursorX, this.cursorY, this.cursorX, this.cursorY + this.h * 0.8);
      }
    pop();
  }
}