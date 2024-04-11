class Button {
  constructor(x = -1000, y = -1000, label = "My Custom Button", onClick = () => {}, selectedClass = "canvaMenuButtonSelected") {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.selectedClass = selectedClass;

    this.button = createButton(`<i class="${label}"></i>`);
    this.button.mousePressed(onClick);

    // add class to button
    this.button.addClass("canvaMenuButton");
  }

  update() {
    let offsetX = windowWidth / 2 - width / 2;
    let offsetY = windowHeight / 2 - height / 2;
    this.button.position(this.x + offsetX, this.y + offsetY);

    if (this.selected) {
      this.button.addClass(this.selectedClass);
    } else {
      this.button.removeClass(this.selectedClass);
    }
  }
}
