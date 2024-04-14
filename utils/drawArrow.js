function drawArrow(x, y, angle) {
  let dx = Math.cos(angle);
  let dy = Math.sin(angle);

  push();
  fill(0);
  strokeWeight(scaleFactor);

  beginShape();
  vertex(x, y);
  vertex(x - 8 * scaleFactor * dx + 5 * scaleFactor * dy, y - 8 * scaleFactor * dy - 5 * scaleFactor * dx);
  vertex(x - 8 * scaleFactor * dx - 5 * scaleFactor * dy, y - 8 * scaleFactor * dy + 5 * scaleFactor * dx);
  endShape(CLOSE);
  pop();
}
