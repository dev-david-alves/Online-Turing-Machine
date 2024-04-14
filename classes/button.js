class Button {
  constructor(x = 0, y = 0, offset, label = "My Custom Button", onClick = () => {}, selectedClass = "canvaMenuButtonSelected") {
    this.x = x + offset.x;
    this.y = y + offset.y;
    this.w = 40;
    this.h = 40;
    this.selected = false;
    this.selectedClass = selectedClass;

    this.button = createButton(`<i class="${label}"></i>`);
    this.button.mousePressed(onClick);

    // add class to button
    this.button.addClass("canvaMenuButton");
    this.button.size(this.w, this.h);
  }

  update() {
    this.button.position(this.x + windowOffset.x, this.y + windowOffset.y);

    if (this.selected) {
      this.button.addClass(this.selectedClass);
    } else {
      this.button.removeClass(this.selectedClass);
    }
  }
}
