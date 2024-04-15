let cnv = null;
let canDoCanvaActions = true;
let states = [];
let stateColor = { r: 0, g: 0, b: 255 };
let stateRadius = 25;
let lastSelectedState = null;
let selectedObject = null;

let links = [];
let startLink = null;

let isShiftPressed = false;
let isMouseWithShiftPressed = false;

let texMap = null;
let currentLink = null;

// Scaling
let slider = null;
let lastScaleFactor = 0.75;
let scaleFactor = 0.75;

// Moving canvas view
let movingCanvasOffset = { x: 0, y: 0 };
let mouseIsPressed = false;

// Start of Menu Button functions
let menuButtons = [];

// Window offset
let windowOffset = { x: 0, y: 0 };
let offBoxes = [];

function menuButtonAction(btnIndex) {
  menuButtons.forEach((btn) => (btn.selected = false));
  menuButtons[btnIndex].selected = !menuButtons[btnIndex].selected;
}
// End of Menu Button functions

function preload() {
  texMap = loadJSON("./utils/texMap.json");
}

function setup() {
  cnv = createCanvas(700, 500);
  cnv.parent("canvas-container");
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.doubleClicked(doubleClick);
  // Resize canvas
  let canvasContainer = select("#canvas-container");
  let canvasWidth = canvasContainer.width;
  let canvasHeight = canvasContainer.height;
  resizeCanvas(canvasWidth - 40, canvasHeight - 100);
  // End of resize canvas

  // Set window offset
  windowOffset = cnv.position();

  states.push(new State(states.length, 100 / scaleFactor, 200 / scaleFactor, stateRadius, stateColor, scaleFactor));
  states.push(new State(states.length, 230 / scaleFactor, 200 / scaleFactor, stateRadius, stateColor, scaleFactor));

  // Menu buttons
  menuButtons.push(new Button(0, -45, { x: 0, y: 0 }, "fa-solid fa-arrow-pointer", () => menuButtonAction(0))); // Default
  menuButtons.push(new Button(40, -45, { x: 5, y: 0 }, "fa-solid fa-arrows-up-down-left-right", () => menuButtonAction(1))); // Move canvas view
  menuButtons.push(new Button(80, -45, { x: 10, y: 0 }, "fa-solid fa-circle-plus", () => menuButtonAction(2))); // Add state
  menuButtons.push(new Button(120, -45, { x: 15, y: 0 }, "fa-solid fa-arrow-right", () => menuButtonAction(3))); // Add transition
  menuButtons.push(new Button(160, -45, { x: 20, y: 0 }, "fa-solid fa-trash", () => menuButtonAction(4), (selectedClass = "canvaMenuDeleteButton"))); // Delete

  // Activate default button
  menuButtonAction(0);

  // Create slider
  slider = createSlider(0.5, 2, scaleFactor, 0.25);
  slider.size(100);

  // Create a boxDom for the slider
  offBoxes.push(new BoxDom(0, 0, [slider]));
  offBoxes.push(new BoxDom(0, 0, menuButtons));
}

function reCalculateDoomPositions() {
  windowOffset = cnv.position();

  let sliderPos = slider.position(windowOffset.x + width - slider.width, windowOffset.y + height + 5);
  if (sliderPos && offBoxes && offBoxes[0]) {
    offBoxes[0].x = sliderPos.x - windowOffset.x;
    offBoxes[0].y = sliderPos.y - windowOffset.y;
    offBoxes[0].update();
  }

  if (offBoxes && offBoxes[1] && offBoxes[1].items) {
    offBoxes[1].items.forEach((item) => {
      item.update();
    });

    offBoxes[1].x = offBoxes[1].items[0].x;
    offBoxes[1].y = offBoxes[1].items[0].y;
    offBoxes[1].update();
  }
}

function draw() {
  if((mouseIsPressed && keyIsPressed && keyCode === CONTROL) || mouseButton === CENTER || (menuButtons[1].selected && mouseIsPressed)) moveCanvas();

  canDoCanvaActions = !offBoxes.some((box) => box.containsPoint());
  reCalculateDoomPositions();
  background(255);

  // Slider -------
  scaleFactor = slider.value();
  // --------------

  let hoveredObject = checkFirstSelectedObject((x = mouseX), (y = mouseY), (uncheckObjects = false));

  if (isMouseWithShiftPressed) {
    if ((hoveredObject && hoveredObject.object instanceof State) || !hoveredObject) {
      if (hoveredObject && !(currentLink instanceof TemporaryLink && lastSelectedState !== states[hoveredObject.index])) {
        currentLink = new SelfLink(states[hoveredObject.index], scaleFactor);
        lastSelectedState = states[hoveredObject.index];
      } else {
        if (lastSelectedState) {
          if (currentLink instanceof SelfLink && !currentLink.from) {
            currentLink = new TemporaryLink(scaleFactor);
            currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
          }
        } else {
          if (!currentLink || !currentLink.from) {
            currentLink = new TemporaryLink(scaleFactor);
            currentLink.from = { x: mouseX, y: mouseY };
          }
        }
      }
    }

    if (currentLink instanceof TemporaryLink) {
      currentLink.to = { x: mouseX, y: mouseY };

      if (hoveredObject && hoveredObject.object instanceof State && lastSelectedState && states[hoveredObject.index].id !== lastSelectedState.id) {
        currentLink.to = states[hoveredObject.index].closestPointOnCircle(lastSelectedState.x, lastSelectedState.y);
      } else if (lastSelectedState) {
        currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
      } else if (hoveredObject && hoveredObject.object instanceof State && !lastSelectedState) {
        currentLink.to = states[hoveredObject.index].closestPointOnCircle(currentLink.from.x, currentLink.from.y);
      }
    }
  }

  stateRepulse();
  for (let i = 0; i < states.length; i++) {
    states[i].update(scaleFactor);
    states[i].draw();
    states[i].input.update(scaleFactor);
    states[i].input.draw();
  }

  for (let i = 0; i < links.length; i++) {
    links[i].update(scaleFactor);
    links[i].draw();
    links[i].transitionBox.containsPoint();
    links[i].transitionBox.update(scaleFactor);
    links[i].transitionBox.draw();
  }

  if (startLink) {
    startLink.update(scaleFactor);
    startLink.draw();
  }

  if (currentLink) {
    currentLink.scaleFactor = scaleFactor;
    currentLink.draw();
  }

  for (let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].update();
  }

  // Slider box
  for (let i = 0; i < offBoxes.length; i++) {
    offBoxes[i].draw();
  }
}

function stateRepulse(repulseFactor = 30.0) {
  repulseFactor *= scaleFactor;

  for(let i = 0; i < states.length; i++) {
    for(let j = 0; j < states.length - 1; j++) {
      if(i == j) continue;
      let distance = dist(states[i].x, states[i].y, states[j].x, states[j].y);
      if(distance < stateRadius * 2 * scaleFactor + repulseFactor) {
        let angle = atan2(states[j].y - states[i].y, states[j].x - states[i].x);
        let pushX = cos(angle) * repulseFactor;
        let pushY = sin(angle) * repulseFactor;
        states[i].x -= pushX;
        states[i].y -= pushY;
        states[j].x += pushX;
        states[j].y += pushY;
      }
    }
  }
}

function reCalculateStateIds() {
  for (let i = 0; i < states.length; i++) {
    states[i].id = i;
  }
}

function unCheckAll() {
  states.forEach((state) => (state.selected = false));
  links.forEach((link) => {
    link.selected = false;
    link.transitionBox.selected = false;
    link.transitionBox.inputs.forEach((input) => (input.selected = false));
  });
  if (startLink) startLink.selected = false;
}

function checkFirstSelectedObject(x = mouseX, y = mouseY, uncheckObjects = true) {
  if (uncheckObjects) unCheckAll();

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
            links[i].transitionBox.remove();
            links.splice(i, 1);
            i--;
          }
        } else {
          if (links[i].state.id === selectedObject.object.id) {
            links[i].transitionBox.remove();
            links.splice(i, 1);
            i--;
          }
        }
      }

      if(startLink && startLink.state.id === selectedObject.object.id) startLink = null;
      
      selectedObject.object.remove();
      states.splice(selectedObject.index, 1);
      reCalculateStateIds();
    } else if (selectedObject.object instanceof Link || selectedObject.object instanceof SelfLink) {
      selectedObject.object.transitionBox.remove();
      links.splice(selectedObject.index, 1);
    } else if (selectedObject.object instanceof StartLink) {
      startLink = null;
    }

    selectedObject = null;
  }
}

function moveCanvas(x = mouseX, y = mouseY) {
  let ratioFactor = 3;
  movingCanvasOffset.x = (movingCanvasOffset.x - (x - pmouseX)) / ratioFactor;
  movingCanvasOffset.y = (movingCanvasOffset.y - (y - pmouseY)) / ratioFactor;
}

function mousePressed() {
  mouseIsPressed = true;
  if((mouseIsPressed && keyIsPressed && keyCode === CONTROL) || mouseButton === CENTER || (menuButtons[1].selected && mouseIsPressed)) return;

  if (!canDoCanvaActions) {
    isMouseWithShiftPressed = false;
    isShiftPressed = false;
    currentLink = null;
    return;
  }
  // If add state menu button is selected
  if (menuButtons[2].selected && !checkFirstSelectedObject(mouseX, mouseY, false)) {
    unCheckAll();
    states.push(new State(states.length, mouseX / scaleFactor, mouseY / scaleFactor, stateRadius, stateColor, scaleFactor));
    states[states.length - 1].selected = true;
    return;
  }

  isMouseWithShiftPressed = mouseButton === LEFT && (isShiftPressed || menuButtons[3].selected);
  if (isShiftPressed || menuButtons[3].selected) return;

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
  if (menuButtons[4].selected) {
    deleteObject();
  }
}

function mouseReleased() {
  mouseButton = 0;
  mouseIsPressed = false;
  movingCanvasOffset.x = 0;
  movingCanvasOffset.y = 0;

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
            links.push(new Link(from, to, scaleFactor));
            links[links.length - 1].selected = true;
          }
        } else {
          console.log("Link already exists");
        }
      } else {
        let hoveredObject = checkFirstSelectedObject();
        if (hoveredObject) {
          stateOnIndex = states[hoveredObject.index];
          startLink = new StartLink(stateOnIndex, currentLink.from, scaleFactor);
          startLink.selected = true;
        }
      }
    }
  } else if (currentLink instanceof SelfLink) {
    // Check if already exists a link to itself
    unCheckAll();
    if (!links.some((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id)) {
      links.push(new SelfLink(currentLink.state, scaleFactor, true));
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
    states[i].mouseReleased();
  }
}

function keyPressed() {
  if(keyCode === 49 || keyCode === 50 || keyCode === 51 || keyCode === 52 || keyCode === 53) {
    let index = keyCode - 49;
    menuButtonAction(index);
    return;
  }

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
  } else if(keyCode === CONTROL) {
    movingCanvasOffset.x = 0;
    movingCanvasOffset.y = 0;
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
    states.push(new State(states.length, mouseX / scaleFactor, mouseY / scaleFactor, stateRadius, stateColor, scaleFactor));
    states[states.length - 1].selected = true;
  } else {
    if (overState.object instanceof State) {
      console.log("Double clicked on state");
      overState.object.isEndState = !overState.object.isEndState;
    }
  }
}