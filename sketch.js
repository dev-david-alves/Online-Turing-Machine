let states = [];
let stateColor = { r: 0, g: 0, b: 255 };
let stateRadius = 25;

let texMap;
let tBox;

function preload() {
  texMap = loadJSON("./utils/texMap.json");
  tBox = new TransitionBox(250, 250, { r: 0, g: 0, b: 0 }, texMap);
}

function indexOfHoveredState() {
  return states.findIndex((state) => state.rollover);
}

function setup() {
  let cnv = createCanvas(500, 500);
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.doubleClicked(doubleClick);

  states.push(new State(states.length, 100, 100, stateRadius, stateColor));
}

function draw() {
  background(255);
  for (let i = 0; i < states.length; i++) {
    states[i].over();
    states[i].update();
    states[i].draw();
    states[i].input.update();
    states[i].input.draw();
  }

  if (tBox) {
    tBox.selected = true;
    tBox.over();
    tBox.update();
    tBox.draw();
  }
}

function mouseClicked() {
  let indexOfStateHovered = indexOfHoveredState();

  if (indexOfStateHovered !== -1) {
    states[indexOfStateHovered].clicked();
  } else {
    for (let i = 0; i < states.length; i++) {
      states[i].selected = false;
    }
  }
}

function mousePressed() {
  tBox.mousePressed();
  for (let i = 0; i < states.length; i++) {
    states[i].pressed();
  }
}

function mouseReleased() {
  for (let i = 0; i < states.length; i++) {
    states[i].released();
  }
}

function keyPressed() {
  tBox.keyPressed();
  for (let i = 0; i < states.length; i++) {
    states[i].input.keyPressed();
  }
}

function keyReleased() {
  // tBox.keyReleased();
  for (let i = 0; i < states.length; i++) {
    states[i].input.keyReleased();
  }
}

function keyTyped() {
  tBox.keyTyped();
  for (let i = 0; i < states.length; i++) {
    states[i].input.keyTyped();
  }
}

function doubleClick() {
  console.log("Double clicked");
}
