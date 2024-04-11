let states = [];
let stateColor = { r: 0, g: 0, b: 255 };
let stateRadius = 25;
let lastSelectedState = null;
let selectedObject = null;

let links = [];
let startLink = null;

let isShiftPressed = false;
let isMouseWithShiftPressed = false;

let texMap;

let currentLink = null;

let menuButtons = [];

// Button functions

let timeoutID = null;
let buttonActivateActions = false;
// Menu buttons
function menuButtonAction(btnIndex) {
  clearTimeout(timeoutID);
  buttonActivateActions = false;

  menuButtons.forEach((btn) => (btn.selected = false));
  menuButtons[btnIndex].selected = !menuButtons[btnIndex].selected;

  timeoutID = setTimeout(() => {
    buttonActivateActions = true;
  }, 200);
}

// Button functions

function preload() {
  texMap = loadJSON("./utils/texMap.json");
}

function setup() {
  let cnv = createCanvas(500, 500);
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.doubleClicked(doubleClick);

  states.push(new State(states.length, 150, 200, stateRadius, stateColor));
  states.push(new State(states.length, 350, 200, stateRadius, stateColor));

  // Menu buttons
  menuButtons.push(new Button(10, 10, "fa-solid fa-arrow-pointer", () => menuButtonAction(0))); // Default
  menuButtons.push(new Button(55, 10, "fa-solid fa-circle-plus", () => menuButtonAction(1))); // Add state
  menuButtons.push(new Button(100, 10, "fa-solid fa-arrow-right", () => menuButtonAction(2))); // Add transition
  menuButtons.push(new Button(145, 10, "fa-solid fa-trash", () => menuButtonAction(3), (selectedClass = "canvaMenuDeleteButton"))); // Delete
}

function draw() {
  background(255);
  let hoveredObject = checkFirstSelectedObject((x = mouseX), (y = mouseY), (uncheckAll = false));

  for (let i = 0; i < states.length; i++) {
    states[i].update();
    states[i].draw();
    states[i].input.update();
    states[i].input.draw();
  }

  if (isMouseWithShiftPressed) {
    if ((hoveredObject && hoveredObject.object instanceof State) || !hoveredObject) {
      if (hoveredObject && !(currentLink instanceof TemporaryLink && lastSelectedState !== states[hoveredObject.index])) {
        currentLink = new SelfLink(states[hoveredObject.index]);
        lastSelectedState = states[hoveredObject.index];
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
    }

    if (currentLink instanceof TemporaryLink) {
      currentLink.to = { x: mouseX, y: mouseY };

      if (hoveredObject && hoveredObject.object instanceof State && lastSelectedState && states[hoveredObject.index].id !== lastSelectedState.id) {
        currentLink.to = states[hoveredObject.index].getSnapLinkPoint(lastSelectedState.x, lastSelectedState.y);
      } else if (lastSelectedState) {
        currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
      } else if (hoveredObject && hoveredObject.object instanceof State && !lastSelectedState) {
        currentLink.to = states[hoveredObject.index].getSnapLinkPoint(currentLink.from.x, currentLink.from.y);
      }
    }
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

  if (currentLink) {
    currentLink.draw();
  }

  for (let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].update();
  }
}

function reCalculateStateIds() {
  for (let i = 0; i < states.length; i++) {
    states[i].id = i;
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

function deleteObject() {
  if (selectedObject) {
    if (selectedObject.object instanceof State) {
      // Need to continue later
      for (let i = 0; i < links.length; i++) {
        if (links[i] instanceof Link) {
          if (links[i].stateA.id === selectedObject.object.id || links[i].stateB.id === selectedObject.object.id) {
            links.splice(i, 1);
            i--;
          }
        } else {
          if (links[i].state.id === selectedObject.object.id) {
            links.splice(i, 1);
            i--;
          }
        }
      }

      states.splice(selectedObject.index, 1);
      reCalculateStateIds();
    } else if (selectedObject.object instanceof Link || selectedObject.object instanceof SelfLink) {
      links.splice(selectedObject.index, 1);
    } else if (selectedObject.object instanceof StartLink) {
      startLink = null;
    }

    selectedObject = null;
  }
}

function mousePressed() {
  // If add state menu button is selected
  if (menuButtons[1].selected && !checkFirstSelectedObject(mouseX, mouseY, false) && buttonActivateActions) {
    states.forEach((state) => (state.selected = false));
    states.push(new State(states.length, mouseX, mouseY, stateRadius, stateColor));
    states[states.length - 1].selected = true;
    return;
  }

  isMouseWithShiftPressed = mouseButton === LEFT && (isShiftPressed || (menuButtons[2].selected && buttonActivateActions));
  if (isShiftPressed || menuButtons[2].selected) return;

  selectedObject = checkFirstSelectedObject();

  if (selectedObject) {
    selectedObject.object.selected = true;

    if (selectedObject.object instanceof State) {
      selectedObject.object.mousePressed();
    } else if (selectedObject.object instanceof Link || selectedObject.object instanceof SelfLink) {
      selectedObject.object.mousePressed();
    } else if (selectedObject.object instanceof StartLink) {
      startLink.mousePressed();
    } else if (selectedObject.object instanceof TransitionBox) {
      selectedObject.object.mousePressed();
    }
  }

  // Delete button
  if (menuButtons[3].selected && buttonActivateActions) {
    deleteObject();
  }
}

function mouseReleased() {
  if (currentLink instanceof TemporaryLink) {
    if (currentLink.from && currentLink.to) {
      if (lastSelectedState) {
        // Check if already exists a link between the two states
        let hoveredObject = checkFirstSelectedObject();

        if (hoveredObject && !links.some((link) => link instanceof Link && link.stateA.id === lastSelectedState.id && link.stateB.id === states[hoveredObject.index].id)) {
          let from = lastSelectedState;
          let to = null;

          if (hoveredObject && states[hoveredObject.index].id !== lastSelectedState.id) {
            to = states[hoveredObject.index];
          }

          if (from && to) {
            links.push(new Link(from, to));
            links[links.length - 1].selected = true;
          }
        } else {
          console.log("Link already exists");
        }
      } else {
        let hoveredObject = checkFirstSelectedObject();
        if (hoveredObject) {
          stateOnIndex = states[hoveredObject.index];
          startLink = new StartLink(stateOnIndex, currentLink.from);
          startLink.selected = true;
        }
      }
    }
  } else if (currentLink instanceof SelfLink) {
    // Check if already exists a link to itself
    if (!links.some((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id)) {
      links.push(new SelfLink(currentLink.state));
      links[links.length - 1].selected = true;
    } else {
      console.log("Link already exists");
    }
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
  if (keyCode === DELETE) {
    deleteObject();
  }

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
    currentLink = null;
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
  let overState = checkFirstSelectedObject(mouseX, mouseY, false);
  if (!overState) {
    console.log("Double clicked on empty space");
    states.push(new State(states.length, mouseX, mouseY, stateRadius, stateColor));
    states[states.length - 1].selected = true;
  } else {
    if (overState.object instanceof State) {
      console.log("Double clicked on state");
      overState.object.isEndState = !overState.object.isEndState;
    }
  }
}
