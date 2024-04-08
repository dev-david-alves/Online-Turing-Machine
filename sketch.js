let states = [];
let stateColor = { r: 0, g: 0, b: 255 };
let stateRadius = 25;
let lastSelectedState = null;
let selectedObject = null;

let links = [];
let startLink = null;

let isMouseWithShiftPressed = false;
let isShiftPressed = false;

let texMap;

let currentLink = null;

function preload() {
  texMap = loadJSON("./utils/texMap.json");
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
  selectedObject = checkFirstSelectedObject((x = mouseX), (y = mouseY), (uncheckAll = false));

  for (let i = 0; i < states.length; i++) {
    states[i].update();
    states[i].draw();
    states[i].input.update();
    states[i].input.draw();
  }

  if (isMouseWithShiftPressed && isShiftPressed) {
    if (selectedObject && !(currentLink instanceof TemporaryLink && lastSelectedState !== states[selectedObject.index])) {
      currentLink = new SelfLink(states[selectedObject.index]);
      lastSelectedState = states[selectedObject.index];
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

      if (selectedObject && lastSelectedState && states[selectedObject.index].id !== lastSelectedState.id) {
        currentLink.to = states[selectedObject.index].getSnapLinkPoint(lastSelectedState.x, lastSelectedState.y);
      } else if (lastSelectedState) {
        currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
      } else if (selectedObject && !lastSelectedState) {
        currentLink.to = states[selectedObject.index].getSnapLinkPoint(currentLink.from.x, currentLink.from.y);
      }
    }
  }

  if (currentLink) {
    currentLink.draw();
  }

  for (let i = 0; i < links.length; i++) {
    links[i].update();
    links[i].draw();
    links[i].transitionBox.containsPoint();
    links[i].transitionBox.update();
    links[i].transitionBox.draw();
  }

  if (startLink) {
    startLink.update();
    startLink.draw();
  }
}

function checkFirstSelectedObject(x = mouseX, y = mouseY, uncheckAll = true) {
  if (uncheckAll) {
    states.forEach((state) => (state.selected = false));
    links.forEach((link) => {
      link.selected = false;
      link.transitionBox.selected = false;
      link.transitionBox.inputs.forEach((input) => (input.selected = false));
    });
    if (startLink) startLink.selected = false;
  }

  if (startLink && startLink.containsPoint(x, y)) return { object: startLink, index: -1 };
  for (let i = links.length - 1; i >= 0; i--) {
    if (links[i].transitionBox.containsPoint(x, y)) return { object: links[i].transitionBox, index: i };
    if (links[i].containsPoint(x, y)) return { object: links[i], index: i };
  }

  for (let i = states.length - 1; i >= 0; i--) {
    if (states[i].containsPoint(x, y)) return { object: states[i], index: i };
  }

  return null;
}

function mousePressed() {
  isMouseWithShiftPressed = mouseButton === LEFT && isShiftPressed;
  if (isShiftPressed) return;
  selectedObject = checkFirstSelectedObject();
  if (selectedObject) {
    selectedObject.object.selected = true;

    if (selectedObject.object instanceof State) {
      selectedObject.object.mousePressed();
    } else if (selectedObject.object instanceof Link || selectedObject.object instanceof SelfLink) {
      selectedObject.object.mousePressed();
      selectedObject.object.transitionBox.selected = true;
    } else if (selectedObject.object instanceof StartLink) {
      startLink.mousePressed();
    } else if (selectedObject.object instanceof TransitionBox) {
      selectedObject.object.mousePressed();
    }
  }
}

function mouseReleased() {
  if (currentLink instanceof TemporaryLink) {
    if (currentLink.from && currentLink.to) {
      if (lastSelectedState) {
        let from = lastSelectedState;
        let to = null;

        selectedObject = checkFirstSelectedObject();
        if (selectedObject && states[selectedObject.index].id !== lastSelectedState.id) {
          to = states[selectedObject.index];
        }

        if (from && to) {
          links.push(new Link(from, to));
        }
      } else {
        selectedObject = checkFirstSelectedObject();
        if (selectedObject) {
          stateOnIndex = states[selectedObject.index];
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

  for (let i = 0; i < links.length; i++) {
    links[i].transitionBox.keyPressed();
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

  for (let i = 0; i < links.length; i++) {
    links[i].transitionBox.keyReleased();
  }
}

function keyTyped() {
  for (let i = 0; i < states.length; i++) {
    states[i].input.keyTyped();
  }

  for (let i = 0; i < links.length; i++) {
    links[i].transitionBox.keyTyped();
  }
}

function doubleClick() {
  console.log("Double clicked");
}
