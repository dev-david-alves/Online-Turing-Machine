function updateBoxPosition(tBox, x, y, angleOrNull, isSelfLink = false, parent = null) {
  if (!tBox) return;

  // position the text intelligently if given an angle
  if (angleOrNull != null) {
    let cosCalc = cos(angleOrNull);
    let sinCalc = sin(angleOrNull);
    let cornerPointX = cosCalc > 0 ? 1 : -1;
    let cornerPointY = sinCalc > 0 ? 1 : -1;
    let slide = sinCalc * pow(abs(sinCalc), 40) * cornerPointX - cosCalc * pow(abs(cosCalc), 10) * cornerPointY;
    x += cornerPointX - sinCalc * slide;
    y += cornerPointY + cosCalc * slide;

    let offsetY = 0;
    if (!tBox.selected) {
      tBox.x = x + (cosCalc * (tBox.w + 2 * tBox.marginBox) - (cosCalc * tBox.w) / 2) / 2;
      if (sinCalc < 0) offsetY = -sinCalc * (-tBox.h / 2 - 2 * tBox.marginBox);
      offsetY += -abs(cosCalc) * (tBox.h / 4);
      tBox.y = y + offsetY;
    } else {
      tBox.x = x + (tBox.w / 2 + tBox.marginBox) * cosCalc;
      tBox.y = y;
      if (sinCalc < 0 && abs(round(cosCalc)) !== 1) tBox.y = tBox.y - tBox.h - tBox.editingInput.h - 3 * tBox.marginBox;
      else if (abs(round(cosCalc)) === 1) tBox.y = tBox.y - tBox.h + (tBox.h + tBox.editingInput.h) / 2 - tBox.editingInput.h - 3 * tBox.marginBox;
    }

    return;
  }

  let angle = atan2(y - parent.y, x - parent.x);
  if (!tBox.selected) {
    tBox.x = x + (tBox.w / 4) * cos(angle);
    tBox.y = y + (tBox.h / 4) * sin(angle) - tBox.h / 4;

    if (sin(angle) < 0) tBox.y += -2 * tBox.marginBox;
  } else {
    tBox.x = x + (tBox.w / 2 + tBox.marginBox) * cos(angle);
    let sinn = map(sin(angle), -1, 1, -1, 0);
    tBox.y = y + (tBox.h + tBox.marginBox) * sinn + 0.75 * parent.r * 2 * sinn;
  }
}
