class State extends Draggable {
  constructor(id, x, y, radius) {
    super(x, y);
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}