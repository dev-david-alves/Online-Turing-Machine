let states = [];
let stateColor = { r: 0, g: 0, b: 255 };
let stateRadius = 25;
let lastSelectedState = null;
let rolloverStateIndex = -1;

let links = [];
let startLink = null;

let isMouseWithShiftPressed = false;
let isShiftPressed = false;

let texMap;

let currentLink;

function preload() {
  texMap = loadJSON("./utils/texMap.json");
}

function indexOfHoveredState() {
  return states.findIndex((state) => state.rollover);
}

function setup() {
  let cnv = createCanvas(500, 500);
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.doubleClicked(doubleClick);

  states.push(new State(states.length, 150, 200, stateRadius, stateColor));
  states.push(new State(states.length, 350, 200, stateRadius, stateColor));
}

function draw() {
  background(255);
  rolloverStateIndex = indexOfHoveredState();

  for (let i = 0; i < states.length; i++) {
    states[i].over();
    states[i].update();
    states[i].draw();
    states[i].input.update();
    states[i].input.draw();
  }

  if (isMouseWithShiftPressed && isShiftPressed) {
    if (rolloverStateIndex !== -1 && !(currentLink instanceof TemporaryLink && lastSelectedState !== states[rolloverStateIndex])) {
      currentLink = new SelfLink(states[rolloverStateIndex]);
      lastSelectedState = states[rolloverStateIndex];
    } else {
      if (lastSelectedState) {
        if (currentLink instanceof SelfLink && !currentLink.from) {
          currentLink = new TemporaryLink();
          currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
        }
      } else {
        if (!currentLink || !currentLink.from) {
          currentLink = new TemporaryLink();
          currentLink.from = { x: mouseX, y: mouseY };
        }
      }
    }

    if (currentLink instanceof TemporaryLink) {
      currentLink.to = { x: mouseX, y: mouseY };

      if (rolloverStateIndex !== -1 && lastSelectedState && states[rolloverStateIndex].id !== lastSelectedState.id) {
        currentLink.to = states[rolloverStateIndex].getSnapLinkPoint(lastSelectedState.x, lastSelectedState.y);
      } else if (lastSelectedState) {
        currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
      } else if (rolloverStateIndex !== -1 && !lastSelectedState) {
        currentLink.to = states[rolloverStateIndex].getSnapLinkPoint(currentLink.from.x, currentLink.from.y);
      }
    }
  }

  if (currentLink) {
    currentLink.draw();
  }

  for (let i = 0; i < links.length; i++) {
    links[i].update();
    links[i].draw();
  }

  if (startLink) {
    startLink.update();
    startLink.draw();
  }
}

function mouseClicked() {
  if (isShiftPressed) return;

  rolloverStateIndex = indexOfHoveredState();

  if (rolloverStateIndex !== -1) {
    states.map((state) => (state.selected = false));
    states[rolloverStateIndex].clicked();
  } else {
    for (let i = 0; i < states.length; i++) {
      states[i].selected = false;
    }
  }
}

function mousePressed() {
  isMouseWithShiftPressed = mouseButton === LEFT && isShiftPressed;
  if (isShiftPressed) return;

  if (startLink) startLink.mousePressed();

  for (let i = 0; i < links.length; i++) {
    links[i].mousePressed();
  }

  for (let i = 0; i < states.length; i++) {
    states[i].pressed();
  }
}

function mouseReleased() {
  if (currentLink instanceof TemporaryLink) {
    if (currentLink.from && currentLink.to) {
      if (lastSelectedState) {
        let from = lastSelectedState;
        let to = null;

        rolloverStateIndex = indexOfHoveredState();
        if (rolloverStateIndex !== -1 && states[rolloverStateIndex].id !== lastSelectedState.id) {
          to = states[rolloverStateIndex];
        }

        if (from && to) {
          links.push(new Link(from, to));
        }
      } else {
        rolloverStateIndex = indexOfHoveredState();
        if (rolloverStateIndex !== -1) {
          stateOnIndex = states[rolloverStateIndex];
          startLink = new StartLink(stateOnIndex, currentLink.from);
        }
      }
    }
  } else if (currentLink instanceof SelfLink) {
    links.push(new SelfLink(currentLink.state));
  }

  isMouseWithShiftPressed = false;
  isShiftPressed = false;

  currentLink = null;
  lastSelectedState = null;

  if (startLink) startLink.mouseReleased();

  for (let i = 0; i < links.length; i++) {
    links[i].mouseReleased();
  }

  for (let i = 0; i < states.length; i++) {
    states[i].released();
  }
}

function keyPressed() {
  if (keyCode === SHIFT) isShiftPressed = true;

  for (let i = 0; i < states.length; i++) {
    states[i].input.keyPressed();
  }
}

function keyReleased() {
  if (keyCode === SHIFT) {
    isShiftPressed = false;
    isMouseWithShiftPressed = false;
  }

  for (let i = 0; i < states.length; i++) {
    states[i].input.keyReleased();
  }
}

function keyTyped() {
  for (let i = 0; i < states.length; i++) {
    states[i].input.keyTyped();
  }
}

function doubleClick() {
  console.log("Double clicked");
}
