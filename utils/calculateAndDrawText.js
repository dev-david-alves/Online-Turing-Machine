function calculateTextWidth(xx = this.x, yy = this.y, substring = [], fontSize = 12 * scaleFactor) {
  push();
  textAlign(CENTER, CENTER);
  textFont("Arial");
  textSize(fontSize);
  textStyle(BOLD);

  let startX = xx;

  fill(0, 0, 0, 0);

  for (let i = 0; i < substring.length; i++) {
    let newString = substring[i];

    if (substring[i].startsWith("_{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/_{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 10 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/\^{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 2 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("_")) {
      newString = substring[i].replace(/_/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 10 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^")) {
      newString = substring[i].replace(/\^/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 2 * this.scaleFactor);
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

function drawText(xx = this.x, yy = this.y, substring = [], fontSize = 12 * scaleFactor) {
  push();
  textAlign(LEFT, CENTER);
  textFont("Arial");
  textSize(fontSize);
  textStyle(BOLD);

  for (let i = 0; i < substring.length; i++) {
    let newString = substring[i];

    if (substring[i].startsWith("_{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/_{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 10 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^{") && substring[i].endsWith("}")) {
      newString = substring[i].replace(/\^{/g, "");
      newString = newString.replace(/}/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 2 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("_")) {
      newString = substring[i].replace(/_/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy + 10 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else if (substring[i].startsWith("^")) {
      newString = substring[i].replace(/\^/g, "");
      push();
      textSize(fontSize * 0.73);
      text(newString, xx, yy - 2 * this.scaleFactor);
      xx += textWidth(newString);
      pop();
    } else {
      text(substring[i], xx, yy);
      xx += textWidth(newString);
    }
  }

  pop();
}
