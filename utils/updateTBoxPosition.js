function updateBoxPosition(tBox, x, y, angleOrNull, isSelfLink = false, parent = null) {
  if (!tBox) return;
  let ruleX = x;
  let ruleY = y;

  // position the text intelligently if given an angle
  if (angleOrNull != null) {
    let cosCalc = cos(angleOrNull);
    let sinCalc = sin(angleOrNull);
    let cornerPointX = cosCalc > 0 ? 1 : -1;
    let cornerPointY = sinCalc > 0 ? 1 : -1;
    x += cornerPointX - sinCalc;
    y += cornerPointY + cosCalc;

    // Rules
    ruleX = x + (tBox.rulesWidth / 2 + 5 * tBox.scaleFactor) * cosCalc;
    if (round(abs(sinCalc)) == 0 && round(abs(cosCalc)) == 1) ruleY = y - (tBox.rulesHeight / 2 + tBox.offsetBoxY / 2);
    else if (sinCalc < 0) ruleY = y + (tBox.rulesHeight + tBox.offsetBoxY / 2) * sinCalc;
    else if (round(abs(sinCalc)) == 1 && round(abs(cosCalc)) == 1) {
      ruleX = x + (tBox.rulesWidth / 2 + tBox.offsetBoxY / 2) * cosCalc;
    }
  }

  // Box
  tBox.x = x - tBox.w / 2;
  tBox.y = y - tBox.h / 2;

  // Rules
  if (!isSelfLink) {
    tBox.rulesX = ruleX;
    tBox.rulesY = ruleY;
  } else {
    let angle = atan2(y - parent.y, x - parent.x);
    tBox.rulesX = x + (tBox.rulesWidth / 2 + 5 * tBox.scaleFactor) * cos(angle);
    map;
    if (angle < 0) {
      let sinn = map(sin(angle), 0, -1, -0.5, -1);
      tBox.rulesY = y + (tBox.rulesHeight + tBox.offsetBoxY / 2) * sinn;
    } else {
      let sinn = map(sin(angle), 0, 1, -0.5, 0);
      tBox.rulesY = y + (tBox.rulesHeight + tBox.offsetBoxY / 2) * sinn;
    }
  }
}
