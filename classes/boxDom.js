class BoxDom {
  constructor(x, y, items = []) {
    this.x = x - windowOffset.x;
    this.y = y - windowOffset.y;
    this.w = 0;
    this.h = 0;
    this.items = items;
    this.visible = false;
    this.offset = { x: 10, y: 10 };
  }

  containsPoint(x = mouseX, y = mouseY) {
    return x > this.x - this.offset.x && x < this.x + this.w + this.offset.x && y > this.y - this.offset.y && y < this.y + this.h + this.offset.y;
  }

  update() {
    this.w = 0;
    this.h = 0;
    if (this.items.length > 0) this.h = this.items[0].h || this.items[0].height;

    this.items.forEach((item) => {
      this.w += item.w || item.width;
    });

    if (this.items && this.items.length > 1 && this.items[0] instanceof Button) {
      this.w += 15;
    }
  }

  draw() {
    if (!this.visible) return;
    push();
    stroke(0);
    strokeWeight(1);
    fill(255, 0, 0);
    rect((this.x - this.offset.x), (this.y - this.offset.y), (this.w + this.offset.x * 2), (this.h + this.offset.y * 2));
    pop();
  }
}
