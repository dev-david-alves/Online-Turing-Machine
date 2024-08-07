function calculateTextWidth(xx = -1000, yy = -1000, substring = [], fontSize = 12 * globalScaleFactor) {
  push();
  textAlign(CENTER, CENTER);
  textFont("cmunbi");
  textSize(fontSize);

  let startX = xx;

  fill(255, 255, 255, 0);

  for (let i = 0; i < substring.length; i++) {
    let newString = substring[i];

    if (substring[i].startsWith("_{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/_{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 10 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/\^{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 2 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("_")) {
      newString = substring[i].replace(/_/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 10 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^")) {
      newString = substring[i].replace(/\^/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 2 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else {
      text(substring[i], xx, yy);
      xx += textWidth(newString);
    }
  }

  pop();
  return abs(xx - startX);
}

function drawText(xx = -1000, yy = -1000, substring = [], fontSize = 12 * globalScaleFactor) {
  push();
  textAlign(LEFT, CENTER);
  textFont("cmunbi");
  textSize(fontSize);

  for (let i = 0; i < substring.length; i++) {
    let newString = substring[i];

    if (substring[i].startsWith("_{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/_{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 6 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/\^{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 6 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("_")) {
      newString = substring[i].replace(/_/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 6 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^")) {
      newString = substring[i].replace(/\^/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 6 * globalScaleFactor);
      xx += textWidth(newString);
      pop();
    } else {
      text(substring[i], xx, yy);
      xx += textWidth(newString);
    }
  }

  pop();
}
