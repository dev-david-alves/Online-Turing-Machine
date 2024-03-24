function drawArrow(x, y, angle) {
  push();
  let dx = Math.cos(angle);
  let dy = Math.sin(angle);

  line(x, y, x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
  line(x, y, x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
  pop();
}
