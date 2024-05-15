function drawArrow(x, y, angle) {
  let dx = Math.cos(angle);
  let dy = Math.sin(angle);

  push();
  strokeWeight(globalScaleFactor);

  beginShape();
  vertex(x, y);
  vertex(x - 8 * globalScaleFactor * dx + 5 * globalScaleFactor * dy, y - 8 * globalScaleFactor * dy - 5 * globalScaleFactor * dx);
  vertex(x - 8 * globalScaleFactor * dx - 5 * globalScaleFactor * dy, y - 8 * globalScaleFactor * dy + 5 * globalScaleFactor * dx);
  endShape(CLOSE);
  pop();
}
