function updateBoxPosition(tBox, x, y, angleOrNull, isSelfLink = false, parent = null) {
  if (!tBox) return;

  // Center the box
  let w = tBox.w;
  let h = tBox.h;

  // position the text intelligently if given an angle
  if (angleOrNull != null) {
    let cosCalc = cos(angleOrNull);
    let sinCalc = sin(angleOrNull);
    let cornerPointX = cosCalc > 0 ? 1 : -1;
    let cornerPointY = sinCalc > 0 ? 1 : -1;
    let slide = sinCalc * pow(abs(sinCalc), 40) * cornerPointX - cosCalc * pow(abs(cosCalc), 10) * cornerPointY;
    x += cornerPointX - sinCalc * slide;
    y += cornerPointY + cosCalc * slide;

    tBox.x = x + (cosCalc * w) / 1.88;
    tBox.y = y + (sinCalc * h) / 1.5;

    return;
  }

  tBox.x = x + (Math.sign(x - parent.x) * w) / 1.88;
  tBox.y = y + (Math.sign(y - parent.y) * h) / 1.5;
}
