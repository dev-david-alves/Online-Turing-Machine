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

let texMap = {};
let currentLink = null;

// Selecting objects
let selectedArea = {
  x1: null,
  y1: null,
  x2: null,
  y2: null,
};

// Scaling
let slider = null;
let lastScaleFactor = 1.0;
let scaleFactor = 1.0;

// Context menu
let contextMenuObj = null;

// Moving canvas view
let movingCanvasOffset = { x: 0, y: 0 };
let isMouseLeftPressed = false;
let isMouseRightPressed = false;

// Start of Button functions
let menuButtons = [];

function setSelectedMenuButton(index) {
  if (menuButtons[index].elt.id === "delete") {
    menuButtons.forEach((btn) => (btn.hasClass("canvasMenuButtonSelected") ? btn.removeClass("canvasMenuButtonSelected") : null));
    menuButtons[index].addClass("canvasMenuButtonDelete");
  } else {
    menuButtons[4].removeClass("canvasMenuButtonDelete");
    menuButtons.forEach((btn) => (btn.hasClass("canvasMenuButtonSelected") ? btn.removeClass("canvasMenuButtonSelected") : null));
    menuButtons[index].addClass("canvasMenuButtonSelected");
  }

  unCheckAll();

  closeExportMenu();
}

function getIdOfSelectedButton() {
  let selectedButton = menuButtons.find((btn) => btn.hasClass("canvasMenuButtonSelected") || btn.hasClass("canvasMenuButtonDelete"));
  if (selectedButton) return selectedButton.elt.id;
  return null;
}

function setMenuMousePressed(index) {
  if (mouseButton === LEFT) {
    setSelectedMenuButton(index);
  }
}

// Window offset
let windowOffset = { x: 0, y: 0 };

// Export functions
let exportButton = null;
let exportAsPNGButton = null;
let exportAsDMTButton = null;

function closeExportMenu() {
  let floatingMenu = select("#floating-export-menu");

  if (!floatingMenu.hasClass("hidden")) {
    floatingMenu.removeClass("flex");
    floatingMenu.addClass("hidden");
  }
}

function toggleExportMenu() {
  let floatingMenu = select("#floating-export-menu");
  // if hidden, show it
  if (floatingMenu.hasClass("hidden")) {
    floatingMenu.removeClass("hidden");
    floatingMenu.addClass("flex");
  } else {
    closeExportMenu();
  }
}

function exportAsPNG() {
  let img = get();
  img.save("state-machine.png");

  closeExportMenu();
}

function exportAsJSON() {
  let dmt = {
    scaleFactor: scaleFactor,
    states: [],
    links: [],
    initialStateLink: null,
  };

  for (let i = 0; i < states.length; i++) {
    dmt.states.push({
      id: states[i].id,
      x: states[i].x / scaleFactor,
      y: states[i].y / scaleFactor,
      isStartState: states[i].isStartState,
      isEndState: states[i].isEndState,
      isRejectState: states[i].isRejectState,
      label: states[i].input.input.value(),
    });
  }

  for (let i = 0; i < links.length; i++) {
    if (links[i] instanceof Link) {
      dmt.links.push({
        stateA: links[i].stateA.id,
        stateB: links[i].stateB.id,
        rules: links[i].transitionBox.rules,
        parallelPart: links[i].parallelPart,
        perpendicularPart: links[i].perpendicularPart,
        lineAngleAdjust: links[i].lineAngleAdjust,
      });
    } else if (links[i] instanceof SelfLink) {
      dmt.links.push({
        state: links[i].state.id,
        rules: links[i].transitionBox.rules,
        anchorAngle: links[i].anchorAngle,
      });
    }
  }

  if (startLink) {
    dmt.initialStateLink = {
      state: startLink.state.id,
      deltaX: startLink.deltaX,
      deltaY: startLink.deltaY,
    };
  }

  saveJSON(dmt, "state-machine.json");

  closeExportMenu();
}

// Import file
let inputFile = null;
let importButton = null;

function handleInputFile(file) {
  if (file.type === "application" && file.subtype === "json") {
    let reader = new FileReader();
    reader.onload = (event) => {
      let result = JSON.parse(event.target.result);

      scaleFactor = result.scaleFactor;
      states = [];
      links = [];
      startLink = null;

      for (let i = 0; i < result.states.length; i++) {
        let state = result.states[i];
        states.push(new State(state.id, state.x, state.y, stateRadius, scaleFactor));
        states[states.length - 1].isStartState = state.isStartState;
        states[states.length - 1].isEndState = state.isEndState;
        states[states.length - 1].isRejectState = state.isRejectState;
        states[states.length - 1].input.input.value(state.label);
      }

      for (let i = 0; i < result.links.length; i++) {
        let link = result.links[i];
        if (Number.isInteger(link.stateA) && Number.isInteger(link.stateB)) {
          let stateA = states.find((state) => state.id === link.stateA);
          let stateB = states.find((state) => state.id === link.stateB);
          links.push(new Link(stateA, stateB, scaleFactor, link.rules, link.parallelPart, link.perpendicularPart, link.lineAngleAdjust));
        } else if (Number.isInteger(link.state)) {
          let state = states.find((state) => state.id === link.state);
          links.push(new SelfLink(state, scaleFactor, true, link.rules, link.anchorAngle));
        }
      }

      if (result.initialStateLink) {
        setInitialState(result.initialStateLink.state, { deltaX: result.initialStateLink.deltaX, deltaY: result.initialStateLink.deltaY });
        startLink.selected = false;
      }
    };

    reader.readAsText(file.file);
  }
}

// Main functions

function setup() {
  cnv = createCanvas(700, 500);
  cnv.parent("canvas-container");
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.doubleClicked(doubleClick);
  cnv.mousePressed(mousePressedOnCanvas);
  cnv.mouseReleased(mouseReleasedOnCanvas);

  texMap = getTexMap();

  // Resize canvas
  let canvasContainer = select("#canvas-container");
  let canvasWidth = canvasContainer.width;
  let canvasHeight = canvasContainer.height;
  resizeCanvas(canvasWidth - 40, canvasHeight - 100);
  // End of resize canvas

  // Set window offset
  windowOffset = cnv.position();

  states.push(new State(states.length, 150 / scaleFactor, 200 / scaleFactor, stateRadius, scaleFactor));
  states.push(new State(states.length, 450 / scaleFactor, 200 / scaleFactor, stateRadius, scaleFactor));

  // Menu buttons
  menuButtons.push(select("#select"));
  menuButtons[0].mousePressed(() => setMenuMousePressed(0));
  menuButtons.push(select("#move"));
  menuButtons[1].mousePressed(() => setMenuMousePressed(1));
  menuButtons.push(select("#addState"));
  menuButtons[2].mousePressed(() => setMenuMousePressed(2));
  menuButtons.push(select("#addLink"));
  menuButtons[3].mousePressed(() => setMenuMousePressed(3));
  menuButtons.push(select("#delete"));
  menuButtons[4].mousePressed(() => setMenuMousePressed(4));

  // Activate default button
  setSelectedMenuButton(0);

  // Create slider
  slider = select("#scalingCanvas");

  // Export button
  exportButton = select("#export-button-toggle");
  exportButton.mousePressed(() => toggleExportMenu());
  exportAsPNGButton = select("#export-as-png");
  exportAsPNGButton.mousePressed(() => exportAsPNG());
  exportAsDMT = select("#export-as-dtm");
  exportAsDMT.mousePressed(() => exportAsJSON());

  // Import button
  importButton = select("#import-button");
  importButton.mousePressed(() => inputFile.elt.click());

  createContextMenu();

  if (contextMenuObj.mainDiv) {
    contextMenuObj.mainDiv.hide();
  }

  // Input type file
  inputFile = createFileInput(handleInputFile);
  inputFile.attribute("accept", ".json");
  inputFile.hide();
  inputFile.position(-1000, -1000);
}

function reCalculateDoomPositions() {
  windowOffset = cnv.position();
}

function draw() {
  // Check if mouse outside canvas
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    mouseReleasedOnCanvas();
  }

  reCalculateDoomPositions();
  background(255);

  if ((isMouseLeftPressed && keyIsPressed && keyCode === CONTROL) || mouseButton === CENTER || (getIdOfSelectedButton() === "move" && isMouseLeftPressed)) moveCanvas();

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

  // Remove links that has no rules
  for (let i = 0; i < links.length; i++) {
    if (!links[i].transitionBox.selected && links[i].transitionBox.rules.length === 0) {
      links[i].transitionBox.remove();
      links.splice(i, 1);
      i--;
    }
  }
  // ----------

  unHoverAll();
  if (hoveredObject) hoveredObject.object.rollover = hoveredObject.object.containsPoint(mouseX, mouseY);

  for (let i = 0; i < links.length; i++) {
    links[i].update(scaleFactor);
    links[i].draw();
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

  stateRepulse();
  for (let i = 0; i < states.length; i++) {
    states[i].update(scaleFactor);
    states[i].draw();
    states[i].input.update(scaleFactor);
    drawText(states[i].x - states[i].input.textW / 2, states[i].y, states[i].input.allSubstrings, states[i].input.fontSize);
  }

  // Selecting area

  // if (selectedArea.x1 && selectedArea.y1) {
  //   selectedArea.x2 = mouseX - selectedArea.x1;
  //   selectedArea.y2 = mouseY - selectedArea.y1;
  // }

  // if (selectedArea.x1 && selectedArea.y1 && selectedArea.x2 && selectedArea.y2) {
  //   push();
  //   fill(0, 0, 255, 25);
  //   stroke(0, 0, 255, 50);
  //   strokeWeight(2);
  //   rect(selectedArea.x1, selectedArea.y1, selectedArea.x2, selectedArea.y2);
  //   pop();
  // }
  // ---------------
}

// End of main functions

function setInitialState(index = null, props = null) {
  if (index === null) {
    if (selectedObject && selectedObject.object instanceof State) {
      let from = { x: selectedObject.object.x - 80 * scaleFactor, y: selectedObject.object.y };
      startLink = new StartLink(selectedObject.object, from, scaleFactor);
      startLink.selected = true;
      startLink.setAnchorPoint(from.x, from.y);

      for (let i = 0; i < states.length; i++) {
        selectedObject.object.isStartState = false;
      }

      selectedObject.object.isStartState = true;
    }
  } else {
    let from = { x: states[index].x - 80 * scaleFactor, y: states[index].y };
    if (props) {
      from = { x: states[index].x + props.deltaX, y: states[index].y + props.deltaY };
    }

    startLink = new StartLink(states[index], from, scaleFactor, props);
    startLink.selected = true;
    startLink.setAnchorPoint(from.x, from.y);

    for (let i = 0; i < states.length; i++) {
      states[i].isStartState = false;
    }

    states[index].isStartState = true;
  }

  contextMenuObj.mainDiv.hide();
}

function toggleFinalState() {
  if (selectedObject && selectedObject.object instanceof State) {
    selectedObject.object.isEndState = !selectedObject.object.isEndState;
  }

  contextMenuObj.mainDiv.hide();
}

function renameState() {
  if (selectedObject && selectedObject.object instanceof State) {
    selectedObject.object.input.visible = true;
  }

  contextMenuObj.mainDiv.hide();
}

function createContextMenu() {
  contextMenuObj = {
    mainDiv: createDiv(""),
    ul: createElement("ul"),
    li: [],
  };

  contextMenuObj.mainDiv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  contextMenuObj.mainDiv.class("absolute bg-[#222831] py-2 rounded-[5px] flex flex-col gap-1 drop-shadow-md");
  contextMenuObj.ul.class("w-full");
  contextMenuObj.ul.parent(contextMenuObj.mainDiv);

  let options = [
    {
      label: "Estado inicial",
      mousePressed: () => setInitialState(),
    },
    {
      label: "Definir como Final",
      mousePressed: () => toggleFinalState(),
    },
    {
      label: "Definir como Rejeição",
      mousePressed: () => console.log("Definir como Rejeição"),
    },
    {
      label: "Copiar",
      mousePressed: () => console.log("Copiar"),
    },
    {
      label: "Colar",
      mousePressed: () => console.log("Colar"),
    },
    {
      label: "Renomear Estado",
      mousePressed: () => renameState(),
    },
    {
      label: "Deletar",
      mousePressed: () => {
        deleteObject();
        contextMenuObj.mainDiv.hide();
      },
    },
  ];

  contextMenuObj.li.push(createElement("li"));
  contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);
  let button = createButton(options[0].label);
  button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm");
  button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  button.mousePressed(options[0].mousePressed);

  contextMenuObj.li.push(createElement("li"));
  contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);
  button = createButton(options[1].label);
  button.id("finalStateButton");
  button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm");
  button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  button.mousePressed(options[1].mousePressed);

  contextMenuObj.li.push(createElement("li"));
  contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);
  button = createButton(options[2].label);
  button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm");
  button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  button.mousePressed(options[2].mousePressed);

  // Separator
  // contextMenuObj.li.push(createElement("div"));
  // contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full pt-1 mt-1 border-t-[1px] border-t-[#36404e]");
  // contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);

  // contextMenuObj.li.push(createElement("li"));
  // contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  // contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.li[contextMenuObj.li.length - 2]);
  // button = createButton(options[3].label);
  // button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm flex items-center justify-between");
  // button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  // button.mousePressed(options[3].mousePressed);

  // let span = createElement("span");
  // span.class("text-[#676768] text-[12px]");
  // span.html("Ctrl+C");
  // span.parent(button);

  // contextMenuObj.li.push(createElement("li"));
  // contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  // contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.li[contextMenuObj.li.length - 3]);

  // button = createButton(options[4].label);
  // button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm flex items-center justify-between");
  // button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  // button.mousePressed(options[4].mousePressed);

  // span = createElement("span");
  // span.class("text-[#676768] text-[12px]");
  // span.html("Ctrl+V");
  // span.parent(button);

  // contextMenuObj.li.push(createElement("li"));
  // contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  // contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);
  // End Separator

  button = createButton(options[5].label);
  button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm flex items-center justify-between  pt-1 mt-1 border-t-[1px] border-t-[#36404e]");
  button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  button.mousePressed(options[5].mousePressed);

  contextMenuObj.li.push(createElement("li"));
  contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);

  button = createButton(options[6].label);
  button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm flex items-center justify-between  pt-1 mt-1 border-t-[1px] border-t-[#36404e]");
  button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  button.mousePressed(options[6].mousePressed);

  let iElement = createElement("i");
  iElement.class("fa-solid fa-trash text-[#676768] text-[12px]");
  iElement.parent(button);

  contextMenuObj.mainDiv.position(windowOffset.x + 100, windowOffset.y + 100);
}

function getNewStateId() {
  let maxId = 0;
  for (let i = 0; i < states.length; i++) {
    if (states[i].id > maxId) maxId = states[i].id;
  }

  return maxId + 1;
}

function stateRepulse(repulseFactor = 30.0) {
  repulseFactor *= scaleFactor;

  for (let i = 0; i < states.length; i++) {
    for (let j = 0; j < states.length - 1; j++) {
      if (i == j) continue;
      let distance = dist(states[i].x, states[i].y, states[j].x, states[j].y);
      if (distance < stateRadius * 2 * scaleFactor + repulseFactor) {
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

function unHoverAll() {
  states.forEach((state) => (state.rollover = false));
  links.forEach((link) => {
    link.rollover = false;
    link.transitionBox.rollover = false;
  });
  if (startLink) startLink.rollover = false;
}

function unCheckAll() {
  states.forEach((state) => (state.selected = false));
  links.forEach((link) => {
    link.selected = false;
    link.transitionBox.selected = false;
  });
  if (startLink) startLink.selected = false;
}

function checkFirstSelectedObject(x = mouseX, y = mouseY, uncheckObjects = true) {
  if (uncheckObjects) unCheckAll();

  for (let i = states.length - 1; i >= 0; i--) {
    if (states[i].containsPoint(x, y)) return { object: states[i], index: i };
  }

  if (startLink && startLink.containsPoint(x, y)) return { object: startLink, index: -1 };

  for (let i = links.length - 1; i >= 0; i--) {
    if (links[i].containsPoint(x, y)) return { object: links[i], index: i };
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

      if (startLink && startLink.state.id === selectedObject.object.id) startLink = null;

      selectedObject.object.remove();
      states.splice(selectedObject.index, 1);
    } else if (selectedObject.object instanceof Link || selectedObject.object instanceof SelfLink) {
      selectedObject.object.transitionBox.remove();
      links.splice(selectedObject.index, 1);
    } else if (selectedObject.object instanceof StartLink) {
      startLink = null;
    }

    selectedObject = null;
  }
}

function selectObjectsInsideArea() {
  for (let i = 0; i < states.length; i++) {
    if (states[i].x > selectedArea.x1 && states[i].x < selectedArea.x1 + selectedArea.x2 && states[i].y > selectedArea.y1 && states[i].y < selectedArea.y1 + selectedArea.y2) {
      states[i].selected = true;
    }
  }
}

function moveCanvas(x = mouseX, y = mouseY) {
  let ratioFactor = 3;
  movingCanvasOffset.x = (movingCanvasOffset.x - (x - pmouseX)) / ratioFactor;
  movingCanvasOffset.y = (movingCanvasOffset.y - (y - pmouseY)) / ratioFactor;
}

function mousePressedOnCanvas() {
  // Click outside context menu
  if (contextMenuObj.mainDiv) {
    if (
      mouseX < contextMenuObj.mainDiv.position().x ||
      mouseX > contextMenuObj.mainDiv.position().x + contextMenuObj.mainDiv.width ||
      mouseY < contextMenuObj.mainDiv.position().y ||
      mouseY > contextMenuObj.mainDiv.position().y + contextMenuObj.mainDiv.height
    ) {
      contextMenuObj.mainDiv.hide();
    }
  }

  closeExportMenu();
  isMouseLeftPressed = mouseButton === LEFT;
  isMouseRightPressed = mouseButton === RIGHT;

  if (isMouseLeftPressed) {
    selectedObject = checkFirstSelectedObject();
    if (!isShiftPressed && !selectedObject && getIdOfSelectedButton() === "select") {
      if (!selectedArea.x1 && !selectedArea.y1) {
        selectedArea.x1 = mouseX;
        selectedArea.y1 = mouseY;
      }
    }

    if ((isMouseLeftPressed && keyIsPressed && keyCode === CONTROL) || mouseButton === CENTER || (getIdOfSelectedButton() === "move" && isMouseLeftPressed)) return;

    if (!canDoCanvaActions) {
      isMouseWithShiftPressed = false;
      isShiftPressed = false;
      currentLink = null;
      return;
    }
    // If add state menu button is selected
    if (getIdOfSelectedButton() === "addState" && !checkFirstSelectedObject(mouseX, mouseY, false)) {
      unCheckAll();
      if (links.some((link) => link.transitionBox.containsPoint(mouseX, mouseY))) return;
      let stateID = getNewStateId();
      states.push(new State(stateID, mouseX / scaleFactor, mouseY / scaleFactor, stateRadius, scaleFactor));
      states[states.length - 1].selected = true;
      selectedObject = { object: states[states.length - 1], index: states.length - 1 };
      return;
    }

    isMouseWithShiftPressed = isMouseLeftPressed && (isShiftPressed || getIdOfSelectedButton() === "addLink");
    if (isShiftPressed || getIdOfSelectedButton() === "addLink") return;

    selectedObject = checkFirstSelectedObject();

    if (selectedObject) {
      selectedObject.object.selected = true;

      if (selectedObject.object instanceof State) {
        selectedObject.object.mousePressed();
      } else if (selectedObject.object instanceof Link || selectedObject.object instanceof SelfLink) {
        selectedObject.object.mousePressed();
      } else if (selectedObject.object instanceof StartLink) {
        startLink.mousePressed();
      }
    }

    // Delete button
    if (getIdOfSelectedButton() === "delete") deleteObject();

    for (let i = 0; i < links.length; i++) {
      links[i].transitionBox.mousePressed();
    }
  } else {
    selectedObject = checkFirstSelectedObject();
    if (selectedObject && selectedObject.object instanceof State) {
      contextMenuObj.mainDiv.position(windowOffset.x + mouseX, windowOffset.y + mouseY);

      if (selectedObject.object.isEndState) {
        select("#finalStateButton").html("Definir como Não Final");
      } else {
        select("#finalStateButton").html("Definir como Final");
      }

      contextMenuObj.mainDiv.show();
    }
  }
}

function mouseReleasedOnCanvas() {
  mouseButton = 0;
  isMouseLeftPressed = false;
  isMouseRightPressed = false;
  movingCanvasOffset.x = 0;
  movingCanvasOffset.y = 0;

  selectObjectsInsideArea();
  selectedArea.x1 = null;
  selectedArea.y1 = null;
  selectedArea.x2 = null;
  selectedArea.y2 = null;

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
            links[links.length - 1].transitionBox.selected = true;
          }
        } else {
          console.log("Link already exists");
          let link = links.find((link) => link.stateA.id === lastSelectedState.id && link.stateB.id === states[hoveredObject.index].id);
          if (link) {
            link.selected = true;
            link.transitionBox.selected = true;
          }
        }
      } else {
        let hoveredObject = checkFirstSelectedObject();
        if (hoveredObject) {
          stateOnIndex = states[hoveredObject.index];
          startLink = new StartLink(stateOnIndex, currentLink.from, scaleFactor);
          startLink.selected = true;

          for (let i = 0; i < states.length; i++) {
            states[i].isStartState = false;
          }

          stateOnIndex.isStartState = true;
        }
      }
    }
  } else if (currentLink instanceof SelfLink) {
    // Check if already exists a link to itself
    unCheckAll();
    if (!links.some((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id)) {
      links.push(new SelfLink(currentLink.state, scaleFactor, true));
      links[links.length - 1].selected = true;
      links[links.length - 1].transitionBox.selected = true;
    } else {
      console.log("Link already exists");
      let link = links.find((link) => link.state.id === lastSelectedState.id);
      if (link) {
        link.selected = true;
        link.transitionBox.selected = true;
      }
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

function mouseWheel(event) {
  if (event.delta > 0) {
    scaleFactor = max(scaleFactor - 0.25, 0.5);
    slider.value(scaleFactor);
  } else {
    scaleFactor = min(scaleFactor + 0.25, 2.0);
    slider.value(scaleFactor);
  }
}

function keyPressed() {
  if (
    (keyCode === 49 || keyCode === 50 || keyCode === 51 || keyCode === 52 || keyCode === 53) &&
    !isShiftPressed &&
    !(selectedObject && selectedObject.object instanceof State) &&
    !(selectedObject && selectedObject.object instanceof Link)
  ) {
    let index = keyCode - 49;
    setSelectedMenuButton(index);
    return;
  }

  if (keyCode === SHIFT) isShiftPressed = true;
  if (keyCode === DELETE) {
    deleteObject();
  }

  for (let i = 0; i < states.length; i++) {
    states[i].keyPressed();
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
  } else if (keyCode === CONTROL) {
    movingCanvasOffset.x = 0;
    movingCanvasOffset.y = 0;
  }
}

function doubleClick() {
  let overState = checkFirstSelectedObject(mouseX, mouseY, false);

  for (let i = 0; i < links.length; i++) {
    links[i].transitionBox.doubleClick();
    links[i].doubleClick();
  }

  if (links.some((link) => link.transitionBox.containsPoint(mouseX, mouseY))) return;

  if (!overState) {
    console.log("Double clicked on empty space");
    let stateID = getNewStateId();
    states.push(new State(stateID, mouseX / scaleFactor, mouseY / scaleFactor, stateRadius, scaleFactor));
    states[states.length - 1].selected = true;
    selectedObject = { object: states[states.length - 1], index: states.length - 1 };
  } else {
    if (overState.object instanceof State) {
      console.log("Double clicked on state");
      overState.object.isEndState = !overState.object.isEndState;
    }
  }
}
