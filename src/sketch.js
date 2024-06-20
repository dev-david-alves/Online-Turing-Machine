// General Properties
let cnv = null;
let cnvIsFocused = "outside";
let globalWindowOffset = { x: 0, y: 0 };
let texMap = {};

// Current status
let isCanvasMoving = false;

// States
let states = [];
let stateRadius = 25;
let lastSelectedState = null;
let selectedObject = null;

// Links
let links = [];
let startLink = null;
let currentLink = null;

// Scaling
let scalingCanvasSlider = null;
let globalScaleFactor = 1.0;

// Moving canvas view
let movingCanvasOffset = { x: 0, y: 0 };

// Context menu
let contextMenu = null;

// Creating HTML Elements
function createTopMenu() {
  let topMenu = createDiv("");
  topMenu.id("top-menu");
  topMenu.class("w-full flex justify-between items-end");

  let leftMenu = createDiv("");
  leftMenu.id("left-menu");
  leftMenu.class("flex items-center gap-1");
  leftMenu.parent(topMenu);

  let rightMenu = createDiv("");
  rightMenu.id("right-menu");
  rightMenu.class("flex items-center gap-1");
  rightMenu.parent(topMenu);

  // Left menu buttons
  const leftMenuButtons = [
    { id: "select", icon: "fa-solid fa-arrow-pointer", mousePressed: () => setMenuMousePressed("select") },
    { id: "move", icon: "fa-solid fa-arrows-up-down-left-right", mousePressed: () => setMenuMousePressed("move") },
    { id: "addState", icon: "fa-solid fa-circle-plus", mousePressed: () => setMenuMousePressed("addState") },
    { id: "addLink", icon: "fa-solid fa-arrow-right", mousePressed: () => setMenuMousePressed("addLink") },
    { id: "delete", icon: "fa-solid fa-trash", mousePressed: () => setMenuMousePressed("delete") },
  ];

  leftMenuButtons.forEach((btn) => {
    let button = createButton("");
    button.id(btn.id);
    button.class("w-[40px] h-[40px] rounded-[5px] text-white bg-[#4e5f6f] hover:bg-[#526a7c] transition-colors");
    button.mousePressed(btn.mousePressed);
    button.parent(leftMenu);

    let icon = createElement("i");
    icon.class(btn.icon);
    icon.parent(button);
  });

  // Right imput file hidden
  inputFile = createFileInput(handleInputFile);
  inputFile.attribute("accept", ".json");
  inputFile.position(-1000, -1000);
  inputFile.hide();

  // Right menu buttons
  let importButton = createButton("Importar");
  importButton.class("w-[100px] py-1 rounded-[5px] text-white bg-[#4e5f6f] hover:bg-[#526a7c] transition-colors");
  importButton.id("import-button");
  importButton.mousePressed(() => {
    cnvIsFocused = "menu";
    closeFloatingCanvasMenus();
    inputFile.elt.click();
  });
  importButton.parent(rightMenu);

  let exportMenuWrapper = createDiv("");
  exportMenuWrapper.class("relative");
  exportMenuWrapper.parent(rightMenu);

  let exportButton = createButton("Exportar");
  exportButton.class("w-[100px] py-1 rounded-[5px] text-white bg-[#4e5f6f] hover:bg-[#526a7c] transition-colors");
  exportButton.id("export-button-toggle");
  exportButton.mousePressed(() => toggleExportMenu());
  exportButton.parent(exportMenuWrapper);

  let floatingExportMenu = createDiv("");
  floatingExportMenu.class("menu-export absolute top-[45px] -left-[21px] bg-[#9caab7] p-[8px] rounded-lg flex-col gap-1 drop-shadow-lg z-[4] hidden");
  floatingExportMenu.id("floating-export-menu");
  floatingExportMenu.parent(exportMenuWrapper);

  let exportAsPNGButton = createButton(".PNG");
  exportAsPNGButton.class("w-[100px] py-1 rounded-[5px] text-white bg-[#4e5f6f] hover:bg-[#526a7c] transition-colors z-[5]");
  exportAsPNGButton.id("export-as-png");
  exportAsPNGButton.mousePressed(() => exportAsPNG());
  exportAsPNGButton.parent(floatingExportMenu);

  let exportAsJSONButton = createButton(".JSON");
  exportAsJSONButton.class("w-[100px] py-1 rounded-[5px] text-white bg-[#4e5f6f] hover:bg-[#526a7c] transition-colors z-[5]");
  exportAsJSONButton.id("export-as-dtm");
  exportAsJSONButton.mousePressed(() => exportAsJSON());
  exportAsJSONButton.parent(floatingExportMenu);

  return topMenu;
}

function createBottomMenu() {
  let bottomMenu = createDiv("");
  bottomMenu.id("bottom-menu");
  bottomMenu.class("w-full flex items-center justify-end gap-1");

  let span1 = createElement("span");
  span1.class("text-white");
  span1.html("0.5");
  span1.parent(bottomMenu);

  let input = createInput("1");
  input.id("scalingCanvasSlider");
  input.attribute("type", "range");
  input.attribute("min", "0.5");
  input.attribute("max", "2");
  input.attribute("step", "0.25");
  input.attribute("value", "1");
  input.class("w-[15%] min-w-[75px]");
  input.parent(bottomMenu);
  input.input(() => {
    cnvIsFocused = "canvas";
    globalScaleFactor = input.value();
    if (!selectedTopMenuButton) setSelectedMenuButton("select");
  });

  let span2 = createElement("span");
  span2.class("text-white");
  span2.html("2.0");
  span2.parent(bottomMenu);

  return bottomMenu;
}

function createContextMenu() {
  let mainDiv = createDiv("");
  mainDiv.id("context-menu");
  mainDiv.hide();
  mainDiv.parent("playground-container");
  mainDiv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  mainDiv.class("absolute bg-[#222831] py-2 rounded-[5px] flex flex-col gap-1 drop-shadow-md");
  mainDiv.position(globalWindowOffset.x + 100, globalWindowOffset.y + 100);

  let options = [
    {
      label: "Estado inicial",
      id: "set-initial-state",
      class: "w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm",
      mousePressed: () => {
        if (selectedObject) {
          let index = states.findIndex((state) => state.id === selectedObject.object.id);
          setInitialState(index);
          createHistory();
        }
      },
    },
    {
      label: "Definir como Final",
      id: "set-final-state",
      class: "w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm",
      mousePressed: () => {
        toggleFinalState();
        createHistory();
      },
    },
    {
      label: "Renomear Estado",
      id: "rename-state",
      class: "w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm flex items-center justify-between  pt-1 mt-1 border-t-[1px] border-t-[#36404e]",
      mousePressed: () => renameState(),
    },
    {
      label: "Deletar",
      id: "delete-state",
      class: "w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm flex items-center justify-between  pt-1 mt-1 border-t-[1px] border-t-[#36404e]",
      mousePressed: () => {
        cnvIsFocused = "export-menu";
        deleteObject();
        contextMenu.hide();
      },
    },
  ];

  options.forEach((option) => {
    let button = createButton(option.label);
    button.id(option.id);
    button.class(option.class);
    button.mousePressed(option.mousePressed);
    button.parent(mainDiv);
  });

  let deleteButton = select("#delete-state");
  let iElement = createElement("i");
  iElement.class("fa-solid fa-trash text-[#676768] text-[12px]");
  iElement.parent(deleteButton);

  return mainDiv;
}

// Top (Left) Menu Button functions
let topMenu = null;
let selectedTopMenuButton = null;

function setSelectedMenuButton(buttonId = null) {
  selectedTopMenuButton = buttonId;
  let leftMenuButtons = selectAll("#left-menu button");

  if (leftMenuButtons) {
    if (buttonId) {
      let selectedButton = select(`#${buttonId}`);
      if (buttonId === "delete") {
        selectedButton.class("w-[40px] h-[40px] rounded-[5px] text-white bg-red-600 hover:bg-red-700 transition-colors");
      } else {
        selectedButton.class("w-[40px] h-[40px] rounded-[5px] text-white bg-[var(--selected-color)] hover:bg-[--selected-hover-color] transition-colors");
      }
    }

    leftMenuButtons.forEach((btn) => {
      if (btn.elt.id !== buttonId) btn.class("w-[40px] h-[40px] rounded-[5px] text-white bg-[#4e5f6f] hover:bg-[#526a7c] transition-colors");
    });
  }

  unSelectAllObjects();
  closeExportMenu();
  closeFloatingCanvasMenus();
}

function setMenuMousePressed(buttonId = null) {
  if (mouseButton === LEFT) {
    cnvIsFocused = "menu";
    setSelectedMenuButton(buttonId);
  }
}

// Extra Menu functions
function closeFloatingCanvasMenus() {
  if (contextMenu) contextMenu.hide();

  if (states.some((state) => state.input.visible)) {
    createHistory();
    states.forEach((state) => (state.input.visible = false));
  }
}

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
  cnvIsFocused = "export-menu";
  if (!selectedTopMenuButton) setSelectedMenuButton("select");

  closeFloatingCanvasMenus();

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

  cnvIsFocused = "menu";
}

function exportAsJSON() {
  let dmt = createJSONExportObj();

  saveJSON(dmt, "state-machine.json");
  closeExportMenu();

  cnvIsFocused = "menu";
}

// JSON functions
function compareJSONObjects(obj1, obj2) {
  if (obj1.globalScaleFactor !== obj2.globalScaleFactor) return false;
  if (obj1.states.length !== obj2.states.length || obj1.links.length !== obj2.links.length) return false;

  for (let i = 0; i < obj1.states.length; i++) {
    if (
      obj1.states[i].id !== obj2.states[i].id ||
      obj1.states[i].x !== obj2.states[i].x ||
      obj1.states[i].y !== obj2.states[i].y ||
      obj1.states[i].isStartState !== obj2.states[i].isStartState ||
      obj1.states[i].isEndState !== obj2.states[i].isEndState ||
      obj1.states[i].isRejectState !== obj2.states[i].isRejectState ||
      obj1.states[i].label !== obj2.states[i].label
    )
      return false;
  }

  for (let i = 0; i < obj1.links.length; i++) {
    if (obj1.links[i].isSelfLink !== obj2.links[i].isSelfLink) return false;

    if (!obj1.links[i].isSelfLink) {
      if (obj1.links[i].rules.length !== obj2.links[i].rules.length) return false;

      let comparedRules = obj1.links[i].rules.every((rule, index) => JSON.stringify(rule.label) === JSON.stringify(obj2.links[i].rules[index].label));

      if (obj1.links[i].stateA !== obj2.links[i].stateA || obj1.links[i].stateB !== obj2.links[i].stateB || !comparedRules) return false;

      if (obj1.links[i].hasCircle !== obj2.links[i].hasCircle) return false;

      if (obj1.links[i].hasCircle) {
        if (
          obj1.links[i].startX !== obj2.links[i].startX ||
          obj1.links[i].startY !== obj2.links[i].startY ||
          obj1.links[i].endX !== obj2.links[i].endX ||
          obj1.links[i].endY !== obj2.links[i].endY ||
          obj1.links[i].circleX !== obj2.links[i].circleX ||
          obj1.links[i].circleY !== obj2.links[i].circleY ||
          obj1.links[i].circleR !== obj2.links[i].circleR ||
          obj1.links[i].startAngle !== obj2.links[i].startAngle ||
          obj1.links[i].endAngle !== obj2.links[i].endAngle
        )
          return false;
      } else {
        if (obj1.links[i].startX !== obj2.links[i].startX || obj1.links[i].startY !== obj2.links[i].startY || obj1.links[i].endX !== obj2.links[i].endX || obj1.links[i].endY !== obj2.links[i].endY)
          return false;
      }
    } else {
      if (obj1.links[i].rules.length !== obj2.links[i].rules.length) return false;

      let comparedRules = obj1.links[i].rules.every((rule, index) => JSON.stringify(rule.label) === JSON.stringify(obj2.links[i].rules[index].label));

      if (obj1.links[i].state !== obj2.links[i].state || !comparedRules || obj1.links[i].anchorAngle !== obj2.links[i].anchorAngle) return false;
    }
  }

  if ((obj1.initialStateLink && !obj2.initialStateLink) || (!obj1.initialStateLink && obj2.initialStateLink)) return false;

  if (obj1.initialStateLink) {
    if (obj1.initialStateLink.state !== obj2.initialStateLink.state || obj1.initialStateLink.deltaX !== obj2.initialStateLink.deltaX || obj1.initialStateLink.deltaY !== obj2.initialStateLink.deltaY)
      return false;
  }

  return true;
}

function createJSONExportObj() {
  let dmt = {
    globalScaleFactor: globalScaleFactor,
    states: [],
    links: [],
    initialStateLink: null,
  };

  for (let i = 0; i < states.length; i++) {
    dmt.states.push({
      id: states[i].id,
      x: states[i].x / globalScaleFactor,
      y: states[i].y / globalScaleFactor,
      isStartState: states[i].isStartState,
      isEndState: states[i].isEndState,
      isRejectState: states[i].isRejectState,
      label: states[i].input.input.value(),
    });
  }

  for (let i = 0; i < links.length; i++) {
    if (links[i] instanceof Link) {
      let stuff = links[i].getEndPointsAndCircle();

      dmt.links.push({
        isSelfLink: false,
        stateA: links[i].stateA.id,
        stateB: links[i].stateB.id,
        rules: links[i].transitionBox.rules,
        parallelPart: links[i].parallelPart,
        perpendicularPart: links[i].perpendicularPart,
        lineAngleAdjust: links[i].lineAngleAdjust,
        hasCircle: stuff.hasCircle,
        startX: stuff.startX / globalScaleFactor,
        startY: stuff.startY / globalScaleFactor,
        endX: stuff.endX / globalScaleFactor,
        endY: stuff.endY / globalScaleFactor,
        circleX: stuff.circleX / globalScaleFactor,
        circleY: stuff.circleY / globalScaleFactor,
        circleR: stuff.circleR / globalScaleFactor,
        startAngle: stuff.startAngle,
        endAngle: stuff.endAngle,
      });
    } else if (links[i] instanceof SelfLink) {
      dmt.links.push({
        isSelfLink: true,
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

  return dmt;
}

// Import file
let inputFile = null;
let importButton = null;

function createCanvasStatesFromOBJ(obj) {
  globalScaleFactor = obj.globalScaleFactor;
  if (scalingCanvasSlider) scalingCanvasSlider.value(globalScaleFactor);

  states = [];
  links = [];
  startLink = null;

  for (let i = 0; i < obj.states.length; i++) {
    let state = obj.states[i];
    states.push(new State(state.id, state.x, state.y, stateRadius));
    states[states.length - 1].isStartState = state.isStartState;
    states[states.length - 1].isEndState = state.isEndState;
    states[states.length - 1].isRejectState = state.isRejectState;
    states[states.length - 1].input.input.value(state.label);
    states[states.length - 1].input.textInput(state.label);
  }

  for (let i = 0; i < obj.links.length; i++) {
    let link = obj.links[i];
    if (Number.isInteger(link.stateA) && Number.isInteger(link.stateB)) {
      let stateA = states.find((state) => state.id === link.stateA);
      let stateB = states.find((state) => state.id === link.stateB);
      links.push(new Link(stateA, stateB, link.rules, link.parallelPart, link.perpendicularPart, link.lineAngleAdjust));
    } else if (Number.isInteger(link.state)) {
      let state = states.find((state) => state.id === link.state);
      links.push(new SelfLink(state, true, link.rules, link.anchorAngle));
    }
  }

  if (obj.initialStateLink) {
    setInitialState(obj.initialStateLink.state, { deltaX: obj.initialStateLink.deltaX, deltaY: obj.initialStateLink.deltaY });
    startLink.selected = false;
  }

  return true;
}

function handleInputFile(file) {
  if (file.type === "application" && file.subtype === "json") {
    let reader = new FileReader();
    reader.onload = (event) => {
      let result = JSON.parse(event.target.result);

      if (createCanvasStatesFromOBJ(result)) {
        createHistory();
      }
    };
    reader.readAsText(file.file);
  }

  inputFile.value("");
}

// Context menu functions
function closeContextMenuWhenClickngOutside() {
  // Click outside context menu
  if (contextMenu) {
    if (mouseX < contextMenu.position().x || mouseX > contextMenu.position().x + contextMenu.width || mouseY < contextMenu.position().y || mouseY > contextMenu.position().y + contextMenu.height) {
      contextMenu.hide();
    }
  }
}

// History functions
let history = [];
let currentHistoryIndex = 0; // Current index of history
const maxHistory = 10; // Up to 10 saves

function compareStatesOfHistory(index = -1) {
  let realIndex = index === -1 ? currentHistoryIndex : index;
  let currentState = structuredClone(createJSONExportObj());
  let stateOnIndex = structuredClone(history[realIndex]);

  return { isEqual: compareJSONObjects(currentState, stateOnIndex), currentState: currentState };
}

function createHistory() {
  let { isEqual, currentState } = compareStatesOfHistory();

  if (!isEqual) {
    // Remove all history after current index
    history = history.slice(0, currentHistoryIndex + 1);

    // Check if history is full
    if (history.length >= maxHistory) {
      history.shift();
      currentHistoryIndex--;
    }

    history.push(currentState);
    currentHistoryIndex++;
  }
}

// Other functions
function reCalculateCanvasPositions() {
  // Resize canvas
  let canvasContainer = select("#canvas-container");
  let canvasWidth = canvasContainer.elt.offsetWidth;
  let canvasHeight = canvasContainer.elt.offsetHeight;
  resizeCanvas(canvasWidth, canvasHeight);

  // Set window offset
  globalWindowOffset = cnv.position();
}

// Load files
let mathFont = null;

function preload() {
  mathFont = loadFont("../fonts/cmunbi.ttf");
}

// Main functions
function setup() {
  // Import tex map
  texMap = getTexMap();

  // Create playground container
  let playgroundContainer = createDiv("");
  playgroundContainer.id("playground-container");
  playgroundContainer.class("flex flex-col gap-[6px]");

  // Create main html elements
  topMenu = createTopMenu();
  topMenu.parent(playgroundContainer);

  let canvasContainer = createDiv("");
  canvasContainer.id("canvas-container");
  canvasContainer.parent(playgroundContainer);

  // Create canvas
  cnv = createCanvas(600, 400);
  cnv.style("border-radius", "5px");
  cnv.parent("canvas-container");
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.mousePressed(mousePressedOnCanvas);
  cnv.mouseReleased(mouseReleasedOnCanvas);
  cnv.mouseMoved(mouseDraggedOnCanvas);
  cnv.doubleClicked(doubleClickOnCanvas);

  // Create bottom menu
  let bottomMenu = createBottomMenu();
  bottomMenu.parent(playgroundContainer);

  // Set canvas initial position and size
  reCalculateCanvasPositions();

  // Just for testing
  states.push(new State(states.length, 150 / globalScaleFactor, 200 / globalScaleFactor, stateRadius));
  states.push(new State(states.length, 450 / globalScaleFactor, 200 / globalScaleFactor, stateRadius));

  // Activate default button when starting
  setSelectedMenuButton("addLink");
  cnvIsFocused = "canvas";

  // Create slider
  scalingCanvasSlider = select("#scalingCanvasSlider");
  contextMenu = createContextMenu();

  // First save on history
  history.push(createJSONExportObj());
}

function draw() {
  // Set properties
  reCalculateCanvasPositions();
  globalScaleFactor = scalingCanvasSlider.value();
  background(255);

  // Check if canvas is focused
  if (cnvIsFocused === "outside") {
    cnv.style("opacity", "0.9");
    cnv.style("border", "none");
    cnv.style("box-shadow", "none");
  } else {
    cnv.style("box-shadow", "0px 0px 3px 3px rgba(23, 98, 163, 1)");
    cnv.style("opacity", "1");
  }

  // Move canvas
  if (mouseIsPressed && ((keyIsDown(CONTROL) && mouseButton === LEFT) || mouseButton === CENTER || selectedTopMenuButton === "move")) {
    moveCanvas();
  }

  // Call Create link Function to low the delay
  createLink();

  // Remove links that has no rules
  for (let i = 0; i < links.length; i++) {
    if (!links[i].transitionBox.selected && links[i].transitionBox.rules.length === 0) {
      links[i].transitionBox.remove();
      links.splice(i, 1);
      i--;
    }
  }

  // Set objects hovering
  unHoverAllObjects();
  let hoveredObject = getFirstSelectedObject(mouseX, mouseY, false);
  if (hoveredObject) hoveredObject.object.hovering = hoveredObject.object.containsPoint(mouseX, mouseY);

  // Draw objects in order to create "layers"
  for (let i = 0; i < links.length; i++) {
    links[i].update(globalScaleFactor);
    links[i].draw();
    links[i].transitionBox.update(globalScaleFactor);
    links[i].transitionBox.draw();
  }

  if (startLink) {
    startLink.update(globalScaleFactor);
    startLink.draw();
  }

  for (let i = 0; i < states.length; i++) {
    states[i].update(globalScaleFactor);
    states[i].draw();
  }

  if (currentLink) currentLink.draw();

  // To prevent states from overlapping
  stateRepulse();
}

// Action functions
function createLink() {
  if ((selectedTopMenuButton !== "select" && selectedTopMenuButton !== "addLink") || links.some((link) => link.transitionBox.selected)) return;

  if (mouseIsPressed && mouseButton === LEFT && (keyIsDown(SHIFT) || selectedTopMenuButton === "addLink")) {
    let hoveredObject = getFirstSelectedObject(mouseX, mouseY, false);

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
    } else {
      if (currentLink instanceof SelfLink) {
        currentLink = new TemporaryLink();
        currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
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
}

function setInitialState(index = null, props = null) {
  let linkSize = 80 * globalScaleFactor;
  if (index === null) {
    if (selectedObject && selectedObject.object instanceof State) {
      let start = { x: selectedObject.object.x - linkSize, y: selectedObject.object.y };
      startLink = new StartLink(selectedObject.object, start);
      startLink.selected = true;

      for (let i = 0; i < states.length; i++) {
        selectedObject.object.isStartState = false;
      }

      selectedObject.object.isStartState = true;
      cnvIsFocused = "export-menu";
    }
  } else {
    let start = { x: states[index].x - linkSize, y: states[index].y };
    if (props) {
      start = { x: states[index].x + props.deltaX, y: states[index].y + props.deltaY };
    }

    startLink = new StartLink(states[index], start);
    startLink.selected = true;

    for (let i = 0; i < states.length; i++) {
      states[i].isStartState = false;
    }

    states[index].isStartState = true;
  }

  contextMenu.hide();
}

function toggleFinalState() {
  cnvIsFocused = "export-menu";

  if (selectedObject && selectedObject.object instanceof State) {
    selectedObject.object.isEndState = !selectedObject.object.isEndState;
  }

  contextMenu.hide();
}

function renameState() {
  cnvIsFocused = "export-menu";

  if (selectedObject && selectedObject.object instanceof State) {
    selectedObject.object.input.visible = true;
  }

  contextMenu.hide();
}

function deleteObject() {
  if (selectedObject) {
    if (selectedObject.object instanceof State) {
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
    createHistory();
  }
}

function getNewStateId() {
  let maxId = 0;
  for (let i = 0; i < states.length; i++) {
    if (states[i].id > maxId) maxId = states[i].id;
  }

  return maxId + 1;
}

function stateRepulse(repulseFactor = 2 * stateRadius + 2) {
  repulseFactor *= globalScaleFactor;

  for (let i = 0; i < states.length; i++) {
    for (let j = 0; j < states.length - 1; j++) {
      if (i == j) continue;
      let distance = dist(states[i].x, states[i].y, states[j].x, states[j].y);
      if (distance < repulseFactor) {
        let angle = atan2(states[j].y - states[i].y, states[j].x - states[i].x);
        let pushX = cos(angle) * 5;
        let pushY = sin(angle) * 5;
        states[i].x -= pushX;
        states[i].y -= pushY;
        states[j].x += pushX;
        states[j].y += pushY;
      }
    }
  }
}

function checkAnyStateInputVisible() {
  return states.some((state) => state.input.visible);
}

function unHoverAllObjects() {
  states.forEach((state) => (state.hovering = false));
  links.forEach((link) => {
    link.hovering = false;
    link.transitionBox.hovering = false;
  });
  if (startLink) startLink.hovering = false;
}

function unSelectAllObjects() {
  states.forEach((state) => (state.selected = false));
  links.forEach((link) => {
    link.selected = false;
    link.transitionBox.selected = false;
  });
  if (startLink) startLink.selected = false;
}

function getFirstSelectedObject(x = mouseX, y = mouseY, uncheckObjects = true) {
  if (uncheckObjects) unSelectAllObjects();

  for (let i = states.length - 1; i >= 0; i--) {
    if (states[i].containsPoint(x, y)) return { object: states[i], index: i };
  }

  if (startLink && startLink.containsPoint(x, y)) return { object: startLink, index: -1 };

  for (let i = links.length - 1; i >= 0; i--) {
    if (links[i].containsPoint(x, y)) return { object: links[i], index: i };
  }

  return null;
}

function moveCanvas(x = mouseX, y = mouseY) {
  if (cnvIsFocused === "outside") return;

  const ratioFactor = 3;
  movingCanvasOffset.x = (movingCanvasOffset.x - (x - pmouseX)) / ratioFactor;
  movingCanvasOffset.y = (movingCanvasOffset.y - (y - pmouseY)) / ratioFactor;
}

// Mouse Canvas functions
function mousePressedOnCanvas() {
  if (cnvIsFocused === "outside") return;

  closeExportMenu();
  closeContextMenuWhenClickngOutside();

  if (mouseButton === CENTER || keyIsDown(SHIFT) || keyIsDown(CONTROL) || selectedTopMenuButton === "move") return;

  selectedObject = getFirstSelectedObject();
  if (selectedObject) selectedObject.object.selected = true;

  if (mouseButton === LEFT) {
    // Add State on Click Canvas
    if (selectedTopMenuButton === "addState" && !selectedObject) {
      if (checkAnyStateInputVisible()) createHistory();
      unSelectAllObjects();

      // Check if mouse is over a link transition box
      if (links.some((link) => link.transitionBox.containsPoint(mouseX, mouseY))) return;

      // Create new state
      let stateID = getNewStateId();
      states.push(new State(stateID, mouseX / globalScaleFactor, mouseY / globalScaleFactor, stateRadius));
      states[states.length - 1].selected = true;
      selectedObject = { object: states[states.length - 1], index: states.length - 1 };

      createHistory();
      return;
    }

    // Delete Object on Click Canvas
    if (selectedTopMenuButton === "delete") {
      if (checkAnyStateInputVisible()) createHistory();

      deleteObject();
    }

    states.forEach((state) => {
      state.mousePressed();
    });

    links.forEach((link) => {
      link.transitionBox.mousePressed();
    });
  } else if (mouseButton === RIGHT) {
    if (selectedObject && selectedObject.object instanceof State) {
      contextMenu.position(globalWindowOffset.x + selectedObject.object.x, globalWindowOffset.y + selectedObject.object.y);

      if (selectedObject.object.isEndState) {
        select("#set-final-state").html("Definir como Não Final");
      } else {
        select("#set-final-state").html("Definir como Final");
      }

      contextMenu.show();
    }
  }

  return false;
}

function mouseReleasedOnCanvas() {
  movingCanvasOffset.x = 0;
  movingCanvasOffset.y = 0;

  if (currentLink instanceof TemporaryLink) {
    if (currentLink.from && currentLink.to) {
      let hoveredObject = getFirstSelectedObject();

      if (hoveredObject && hoveredObject.object instanceof State) {
        // Check if the link is coming from another state
        if (lastSelectedState && lastSelectedState instanceof State) {
          let from = lastSelectedState;
          let to = hoveredObject.object.id !== lastSelectedState.id ? hoveredObject.object : null;

          if (from && to && !links.some((link) => link instanceof Link && link.stateA.id === from.id && link.stateB.id === to.id)) {
            links.push(new Link(from, to));
            links[links.length - 1].transitionBox.selected = true;

            // Extra: if already exists a link to -> from, turn links curved
            if (links.some((link) => link instanceof Link && link.stateA.id === to.id && link.stateB.id === from.id)) {
              let link = links.find((link) => link instanceof Link && link.stateA.id === to.id && link.stateB.id === from.id);
              if (link) {
                if (link.perpendicularPart === 0) {
                  link.perpendicularPart = 10;
                  links[links.length - 1].perpendicularPart = 10;
                }
              }
            }
          } else {
            let link = links.find((link) => link instanceof Link && link.stateA.id === from.id && link.stateB.id === to.id);
            if (link) {
              link.transitionBox.selected = true;
              console.log("Link already exists");
            }
          }
        } else {
          startLink = new StartLink(hoveredObject.object, currentLink.from);
          startLink.selected = true;

          for (let i = 0; i < states.length; i++) states[i].isStartState = false;
          hoveredObject.object.isStartState = true;

          createHistory();
        }
      } else {
        hoveredObject = null;
        selectedObject = null;
        lastSelectedState = null;
        currentLink = null;
      }
    }
  } else if (currentLink instanceof SelfLink) {
    unSelectAllObjects();

    // Check if already exists a link to itself
    if (!links.some((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id)) {
      links.push(new SelfLink(currentLink.state, true));
      links[links.length - 1].transitionBox.selected = true;
    } else {
      let link = links.find((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id);
      if (link) {
        console.log("SelfLink already exists");
        link.transitionBox.selected = true;
      }
    }
  }

  currentLink = null;
  lastSelectedState = null;

  if (startLink) startLink.mouseReleased();

  links.forEach((link) => {
    link.mouseReleased();
  });

  states.forEach((state) => {
    state.mouseReleased();
  });

  return false;
}

function mouseDraggedOnCanvas() {
  if (!mouseIsPressed || mouseButton !== LEFT || cnvIsFocused === "outside") return false;

  links.forEach((link) => {
    link.mouseDragged();
  });

  if (startLink) startLink.mouseDragged();

  return false;
}

function doubleClickOnCanvas() {
  let hoveredObject = getFirstSelectedObject(mouseX, mouseY, false);

  links.forEach((link) => {
    link.transitionBox.doubleClick();
    link.doubleClick();
  });

  if (links.some((link) => link.transitionBox.containsPoint(mouseX, mouseY))) return;

  if (selectedTopMenuButton === "select") {
    if (!hoveredObject) {
      console.log("Double clicked on empty space");
      let stateID = getNewStateId();
      states.push(new State(stateID, mouseX / globalScaleFactor, mouseY / globalScaleFactor, stateRadius));
      states[states.length - 1].selected = true;
      selectedObject = { object: states[states.length - 1], index: states.length - 1 };

      createHistory();
    } else {
      if (hoveredObject.object instanceof State) {
        console.log("Double clicked on state");
        contextMenu.position(globalWindowOffset.x + hoveredObject.object.x, globalWindowOffset.y + hoveredObject.object.y);

        if (hoveredObject.object.isEndState) {
          select("#set-final-state").html("Definir como Não Final");
        } else {
          select("#set-final-state").html("Definir como Final");
        }

        contextMenu.show();
      }
    }
  }

  return false;
}

// General mouse functions
function mousePressed() {
  if ((mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) || cnvIsFocused === "menu" || cnvIsFocused === "export-menu") {
    // Click happened inside the canvas
    if (!selectedTopMenuButton && cnvIsFocused !== "export-menu") setSelectedMenuButton("select");

    cnvIsFocused = "canvas";
    cnv.elt.focus();
  } else {
    // Click happened outside the canvas
    unHoverAllObjects();
    unSelectAllObjects();
    mouseReleasedOnCanvas();
    setSelectedMenuButton(null);
    closeContextMenuWhenClickngOutside();
    closeExportMenu();
    cnvIsFocused = "outside";
    selectedObject = null;

    // Hide all states inputs
    closeFloatingCanvasMenus();

    // Unselect all transition boxes
    for (let i = 0; i < links.length; i++) {
      links[i].transitionBox.selected = false;
      links[i].transitionBox.selectedRuleIndex = -1;
    }
  }

  // return false;
}

function mouseReleased() {
  if (cnvIsFocused === "outside") return false;
  if (!links.some((link) => link.transitionBox.selected)) {
    mouseReleasedOnCanvas();
  }

  return false;
}

function mouseMoved() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    mouseReleasedOnCanvas();
  }

  return false;
}

function mouseWheel(event) {
  if (cnvIsFocused === "outside") return false;

  if (event.delta > 0) {
    globalScaleFactor = max(globalScaleFactor - 0.25, 0.5);
    scalingCanvasSlider.value(globalScaleFactor);
  } else {
    globalScaleFactor = min(globalScaleFactor + 0.25, 2.0);
    scalingCanvasSlider.value(globalScaleFactor);
  }

  return false;
}

// Keyboard functions
function keyPressed() {
  if (cnvIsFocused === "outside") return false;

  if (
    (keyCode === 49 || keyCode === 50 || keyCode === 51 || keyCode === 52 || keyCode === 53) &&
    !keyIsDown(SHIFT) &&
    !states.some((state) => state.input.visible) &&
    !links.some((link) => link.transitionBox.selected)
  ) {
    let index = keyCode - 49;
    let buttons = ["select", "move", "addState", "addLink", "delete"];
    setSelectedMenuButton(buttons[index]);
    return false;
  }

  if (keyCode === DELETE) deleteObject();

  states.forEach((state) => {
    state.keyPressed();
  });

  links.forEach((link) => {
    link.transitionBox.keyPressed();
  });

  // Check ctrl + z
  if (keyIsDown(CONTROL) && (key == "z" || key == "Z")) {
    let newIndex = max(currentHistoryIndex - 1, 0);

    if (newIndex !== currentHistoryIndex) {
      currentHistoryIndex = newIndex;
      createCanvasStatesFromOBJ(history[currentHistoryIndex]);
    }
  }

  // Check ctrl + y
  if (keyIsDown(CONTROL) && (key == "y" || key == "Y")) {
    let newIndex = min(currentHistoryIndex + 1, history.length - 1);

    if (newIndex !== currentHistoryIndex) {
      currentHistoryIndex = newIndex;
      createCanvasStatesFromOBJ(history[currentHistoryIndex]);
    }
  }

  // return false;
}

function keyReleased() {
  if (keyCode === SHIFT && selectedTopMenuButton !== "addLink") {
    currentLink = null;
  } else if (keyCode === CONTROL) {
    movingCanvasOffset.x = 0;
    movingCanvasOffset.y = 0;
  }

  // return false;
}
