let cnv = null;
let cnvIsFocused = "outside";
let canDoCanvaActions = true;
let states = [];
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
let globalScaleFactor = 1.0;

// Context menu
let contextMenuObj = null;

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
  input.id("scalingCanvas");
  input.attribute("type", "range");
  input.attribute("min", "0.5");
  input.attribute("max", "2");
  input.attribute("step", "0.25");
  input.attribute("value", "1");
  input.class("w-[15%] min-w-[75px]");
  input.parent(bottomMenu);

  let span2 = createElement("span");
  span2.class("text-white");
  span2.html("2.0");
  span2.parent(bottomMenu);

  return bottomMenu;
}

// Moving canvas view
let movingCanvasOffset = { x: 0, y: 0 };
let isMouseLeftPressed = false;
let isMouseRightPressed = false;

// Start of Button functions
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

  unCheckAll();
  closeExportMenu();
  closeFloatingCanvasMenus();
}

function setMenuMousePressed(buttonId = null) {
  if (mouseButton === LEFT) {
    cnvIsFocused = "menu";
    setSelectedMenuButton(buttonId);
  }
}

// Window offset
let windowOffset = { x: 0, y: 0 };
let globalWindowOffset = { x: 0, y: 0 };

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

function compareJSONObjects(obj1, obj2) {
  console.log("A");
  if (obj1.globalScaleFactor !== obj2.globalScaleFactor) return false;
  console.log("B");
  if (obj1.states.length !== obj2.states.length || obj1.links.length !== obj2.links.length) return false;

  console.log("C");
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
    console.log("D");
    if (obj1.links[i].isSelfLink !== obj2.links[i].isSelfLink) return false;

    if (!obj1.links[i].isSelfLink) {
      console.log("E");
      if (obj1.links[i].rules.length !== obj2.links[i].rules.length) return false;

      console.log("F");
      let comparedRules = obj1.links[i].rules.every((rule, index) => JSON.stringify(rule.label) === JSON.stringify(obj2.links[i].rules[index].label));

      console.log("G", comparedRules);
      if (obj1.links[i].stateA !== obj2.links[i].stateA || obj1.links[i].stateB !== obj2.links[i].stateB || !comparedRules) return false;

      console.log("H");
      if (obj1.links[i].hasCircle !== obj2.links[i].hasCircle) return false;

      if (obj1.links[i].hasCircle) {
        console.log("I");
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
        console.log("J");
        if (obj1.links[i].startX !== obj2.links[i].startX || obj1.links[i].startY !== obj2.links[i].startY || obj1.links[i].endX !== obj2.links[i].endX || obj1.links[i].endY !== obj2.links[i].endY)
          return false;
      }
    } else {
      console.log("K");
      if (obj1.links[i].rules.length !== obj2.links[i].rules.length) return false;

      console.log("L");
      let comparedRules = obj1.links[i].rules.every((rule, index) => JSON.stringify(rule.label) === JSON.stringify(obj2.links[i].rules[index].label));

      console.log("M", comparedRules);
      if (obj1.links[i].state !== obj2.links[i].state || !comparedRules || obj1.links[i].anchorAngle !== obj2.links[i].anchorAngle) return false;
    }
  }

  console.log("N");
  if ((obj1.initialStateLink && !obj2.initialStateLink) || (!obj1.initialStateLink && obj2.initialStateLink)) return false;

  console.log("O");
  if (obj1.initialStateLink) {
    if (obj1.initialStateLink.state !== obj2.initialStateLink.state || obj1.initialStateLink.deltaX !== obj2.initialStateLink.deltaX || obj1.initialStateLink.deltaY !== obj2.initialStateLink.deltaY)
      return false;
  }

  console.log("P");
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

function exportAsJSON() {
  let dmt = createJSONExportObj();

  saveJSON(dmt, "state-machine.json");
  closeExportMenu();

  cnvIsFocused = "menu";
}

// Import file
let inputFile = null;
let importButton = null;

function createCanvasStatesFromOBJ(obj) {
  globalScaleFactor = obj.globalScaleFactor;
  if (slider) slider.value(globalScaleFactor);
  states = [];
  links = [];
  startLink = null;

  for (let i = 0; i < obj.states.length; i++) {
    let state = obj.states[i];
    states.push(new State(state.id, state.x, state.y, stateRadius, globalScaleFactor));
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

// History
let history = []; // Up to 10 saves;
let historyIndex = 0;
const maxHistory = 10;

function closeFloatingCanvasMenus() {
  if (contextMenuObj) contextMenuObj.mainDiv.hide();

  if (states.some((state) => state.input.visible)) {
    createHistory();
    states.forEach((state) => (state.input.visible = false));
  }
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
  cnv = createCanvas(700, 500);
  cnv.style("border-radius", "5px");
  cnv.parent("canvas-container");
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  cnv.mousePressed(mousePressedOnCanvas);
  cnv.mouseReleased(mouseReleasedOnCanvas);
  cnv.doubleClicked(doubleClick);

  // Create bottom menu
  let bottomMenu = createBottomMenu();
  bottomMenu.parent(playgroundContainer);

  // Resize canvas
  let canvasWidth = canvasContainer.elt.offsetWidth;
  let canvasHeight = canvasContainer.elt.offsetHeight;
  resizeCanvas(canvasWidth - 40, canvasHeight - 100);

  // Set window offset
  globalWindowOffset = cnv.position();

  states.push(new State(states.length, 150 / globalScaleFactor, 200 / globalScaleFactor, stateRadius, globalScaleFactor));
  states.push(new State(states.length, 450 / globalScaleFactor, 200 / globalScaleFactor, stateRadius, globalScaleFactor));

  // Activate default button
  setSelectedMenuButton("select");
  cnvIsFocused = "canvas";

  // Create slider
  slider = select("#scalingCanvas");

  createContextMenu();

  if (contextMenuObj.mainDiv) {
    contextMenuObj.mainDiv.hide();
  }

  // First save on history
  history.push(createJSONExportObj());
}

function reCalculateDoomPositions() {
  windowOffset = cnv.position();
  globalWindowOffset = cnv.position();
}

function draw() {
  if (cnvIsFocused === "outside") {
    cnv.style("opacity", "0.9");
    cnv.style("border", "none");
    cnv.style("box-shadow", "none");
  } else {
    cnv.style("box-shadow", "0px 0px 3px 3px rgba(23, 98, 163, 1)");
    cnv.style("opacity", "1");
  }

  // Check if mouse outside canvas
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    mouseReleasedOnCanvas();
  }

  reCalculateDoomPositions();
  background(255);

  if ((isMouseLeftPressed && keyIsPressed && keyCode === CONTROL) || mouseButton === CENTER || (selectedTopMenuButton === "move" && isMouseLeftPressed)) moveCanvas();

  // Slider -------
  globalScaleFactor = slider.value();
  // --------------

  let hoveredObject = checkFirstSelectedObject((x = mouseX), (y = mouseY), (uncheckObjects = false));

  if (isMouseWithShiftPressed) {
    if ((hoveredObject && hoveredObject.object instanceof State) || !hoveredObject) {
      if (hoveredObject && !(currentLink instanceof TemporaryLink && lastSelectedState !== states[hoveredObject.index])) {
        currentLink = new SelfLink(states[hoveredObject.index]);
        lastSelectedState = states[hoveredObject.index];
      } else {
        if (lastSelectedState) {
          if (currentLink instanceof SelfLink && !currentLink.from) {
            currentLink = new TemporaryLink(globalScaleFactor);
            currentLink.from = lastSelectedState.closestPointOnCircle(mouseX, mouseY);
          }
        } else {
          if (!currentLink || !currentLink.from) {
            currentLink = new TemporaryLink(globalScaleFactor);
            currentLink.from = { x: mouseX, y: mouseY };
          }
        }
      }
    } else {
      if (currentLink instanceof SelfLink) {
        currentLink = new TemporaryLink(globalScaleFactor);
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
  if (hoveredObject) hoveredObject.object.hovering = hoveredObject.object.containsPoint(mouseX, mouseY);

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

  if (currentLink) {
    currentLink.globalScaleFactor = globalScaleFactor;
    currentLink.draw();
  }

  stateRepulse();
  for (let i = 0; i < states.length; i++) {
    states[i].update(globalScaleFactor);
    states[i].draw();
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
      let from = { x: selectedObject.object.x - 80 * globalScaleFactor, y: selectedObject.object.y };
      startLink = new StartLink(selectedObject.object, from, globalScaleFactor);
      startLink.selected = true;
      startLink.setAnchorPoint(from.x, from.y);

      for (let i = 0; i < states.length; i++) {
        selectedObject.object.isStartState = false;
      }

      selectedObject.object.isStartState = true;
      cnvIsFocused = "export-menu";
    }
  } else {
    let from = { x: states[index].x - 80 * globalScaleFactor, y: states[index].y };
    if (props) {
      from = { x: states[index].x + props.deltaX, y: states[index].y + props.deltaY };
    }

    startLink = new StartLink(states[index], from, globalScaleFactor, props);
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
  cnvIsFocused = "export-menu";

  if (selectedObject && selectedObject.object instanceof State) {
    selectedObject.object.isEndState = !selectedObject.object.isEndState;
  }

  contextMenuObj.mainDiv.hide();
}

function renameState() {
  cnvIsFocused = "export-menu";

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
      mousePressed: () => {
        toggleFinalState();
        createHistory();
      },
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
        cnvIsFocused = "export-menu";
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

  // contextMenuObj.li.push(createElement("li"));
  // contextMenuObj.li[contextMenuObj.li.length - 1].class("w-full");
  // contextMenuObj.li[contextMenuObj.li.length - 1].parent(contextMenuObj.ul);
  // button = createButton(options[2].label);
  // button.class("w-full py-1 px-3 text-left hover:bg-[#1762a3] text-white text-sm");
  // button.parent(contextMenuObj.li[contextMenuObj.li.length - 1]);
  // button.mousePressed(options[2].mousePressed);

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
  repulseFactor *= globalScaleFactor;

  for (let i = 0; i < states.length; i++) {
    for (let j = 0; j < states.length - 1; j++) {
      if (i == j) continue;
      let distance = dist(states[i].x, states[i].y, states[j].x, states[j].y);
      if (distance < stateRadius * 2 * globalScaleFactor + repulseFactor) {
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
  states.forEach((state) => (state.hovering = false));
  links.forEach((link) => {
    link.hovering = false;
    link.transitionBox.hovering = false;
  });
  if (startLink) startLink.hovering = false;
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

    createHistory();
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
  if (cnvIsFocused === "outside") return;

  let ratioFactor = 3;
  movingCanvasOffset.x = (movingCanvasOffset.x - (x - pmouseX)) / ratioFactor;
  movingCanvasOffset.y = (movingCanvasOffset.y - (y - pmouseY)) / ratioFactor;
}

function closeContextMenuWhenClickngOutside() {
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
}

function checkAnyStateInputVisible() {
  return states.some((state) => state.input.visible);
}

function mousePressedOnCanvas() {
  if (cnvIsFocused === "outside") return;

  closeContextMenuWhenClickngOutside();

  closeExportMenu();
  isMouseLeftPressed = mouseButton === LEFT;
  isMouseRightPressed = mouseButton === RIGHT;

  if (isMouseLeftPressed) {
    states.forEach((state) => state.mousePressed());

    selectedObject = checkFirstSelectedObject();
    if (!isShiftPressed && !selectedObject && selectedTopMenuButton === "select") {
      if (!selectedArea.x1 && !selectedArea.y1) {
        selectedArea.x1 = mouseX;
        selectedArea.y1 = mouseY;
      }
    }

    if ((isMouseLeftPressed && keyIsPressed && keyCode === CONTROL) || mouseButton === CENTER || (selectedTopMenuButton === "move" && isMouseLeftPressed)) return;

    if (!canDoCanvaActions) {
      isMouseWithShiftPressed = false;
      isShiftPressed = false;
      currentLink = null;
      return;
    }
    // If add state menu button is selected
    if (selectedTopMenuButton === "addState" && !checkFirstSelectedObject(mouseX, mouseY, false)) {
      if (checkAnyStateInputVisible()) createHistory();

      unCheckAll();
      if (links.some((link) => link.transitionBox.containsPoint(mouseX, mouseY))) return;
      let stateID = getNewStateId();
      states.push(new State(stateID, mouseX / globalScaleFactor, mouseY / globalScaleFactor, stateRadius, globalScaleFactor));
      states[states.length - 1].selected = true;
      selectedObject = { object: states[states.length - 1], index: states.length - 1 };

      createHistory();
      return;
    }

    isMouseWithShiftPressed = isMouseLeftPressed && (isShiftPressed || selectedTopMenuButton === "addLink");
    if (isShiftPressed || selectedTopMenuButton === "addLink") return;

    selectedObject = checkFirstSelectedObject();

    if (selectedObject) {
      selectedObject.object.selected = true;
    }

    // Delete button
    if (selectedTopMenuButton === "delete") {
      if (checkAnyStateInputVisible()) createHistory();

      deleteObject();
    }

    for (let i = 0; i < links.length; i++) {
      links[i].transitionBox.mousePressed();
    }
  } else {
    selectedObject = checkFirstSelectedObject();
    if (selectedObject && selectedObject.object instanceof State) {
      selectedObject.object.selected = true;
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

function mousePressed() {
  if ((mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) || cnvIsFocused === "menu" || cnvIsFocused === "export-menu") {
    // Click happened inside the canvas
    if (!selectedTopMenuButton && cnvIsFocused !== "export-menu") setSelectedMenuButton("select");

    cnvIsFocused = "canvas";
    cnv.elt.focus();
  } else {
    // Click happened outside the canvas
    cnvIsFocused = "outside";
    mouseReleasedOnCanvas();
    selectedArea.x1 = null;
    selectedArea.y1 = null;
    selectedArea.x2 = null;
    selectedArea.y2 = null;
    selectObjectsInsideArea();
    selectedObject = null;
    unCheckAll();
    unHoverAll();
    setSelectedMenuButton(null);
    closeExportMenu();
    closeContextMenuWhenClickngOutside();

    // Hide all states inputs
    closeFloatingCanvasMenus();

    // Unselect all transition boxes
    for (let i = 0; i < links.length; i++) {
      links[i].transitionBox.selected = false;
      links[i].transitionBox.selectedRuleIndex = -1;
    }
  }
}

function compareStatesOfHistory(index = -1) {
  let realIndex = index === -1 ? historyIndex : index;
  let currentState = structuredClone(createJSONExportObj());
  let stateOnIndex = structuredClone(history[realIndex]);

  return { isEqual: compareJSONObjects(currentState, stateOnIndex), currentState: currentState };
}

function createHistory() {
  let { isEqual, currentState } = compareStatesOfHistory();

  if (!isEqual) {
    // Remove all history after current index
    history = history.slice(0, historyIndex + 1);

    // Check if history is full
    if (history.length >= maxHistory) {
      history.shift();
      historyIndex--;
    }

    history.push(currentState);
    historyIndex++;
    console.log("History Length: ", history.length);
  } else {
    console.log("States are equal");
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

        if (!(lastSelectedState instanceof State) || !(hoveredObject && hoveredObject.object instanceof State)) {
          selectedObject = null;
          lastSelectedState = null;
          currentLink = null;
          hoveredObject = null;
          isMouseWithShiftPressed = false;
          isMouseLeftPressed = false;

          return;
        }

        if (hoveredObject && !links.some((link) => link instanceof Link && link.stateA.id === lastSelectedState.id && link.stateB.id === states[hoveredObject.index].id)) {
          let from = lastSelectedState;
          let to = null;

          if (hoveredObject && states[hoveredObject.index].id !== lastSelectedState.id) {
            to = states[hoveredObject.index];
          }

          if (from && to) {
            links.push(new Link(from, to));
            links[links.length - 1].selected = true;
            links[links.length - 1].transitionBox.selected = true;

            // Extra: if already exists a link to -> from
            if (links.some((link) => link.stateA.id === to.id && link.stateB.id === from.id)) {
              let link = links.find((link) => link.stateA.id === to.id && link.stateB.id === from.id);
              if (link) {
                if (link.perpendicularPart === 0) {
                  link.perpendicularPart = 10;
                  links[links.length - 1].perpendicularPart = 10;
                }
              }
            }
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
        if (hoveredObject && hoveredObject.object instanceof State) {
          stateOnIndex = states[hoveredObject.index];
          startLink = new StartLink(stateOnIndex, currentLink.from, globalScaleFactor);
          startLink.selected = true;

          for (let i = 0; i < states.length; i++) {
            states[i].isStartState = false;
          }

          stateOnIndex.isStartState = true;

          createHistory();
        }
      }
    }
  } else if (currentLink instanceof SelfLink) {
    // Check if already exists a link to itself
    unCheckAll();
    if (!links.some((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id)) {
      links.push(new SelfLink(currentLink.state, true));
      links[links.length - 1].selected = true;
      links[links.length - 1].transitionBox.selected = true;
    } else {
      console.log("Link already exists");
      let link = links.find((link) => link instanceof SelfLink && link.state.id === lastSelectedState.id);
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
  if (cnvIsFocused === "outside") return;

  if (event.delta > 0) {
    globalScaleFactor = max(globalScaleFactor - 0.25, 0.5);
    slider.value(globalScaleFactor);
  } else {
    globalScaleFactor = min(globalScaleFactor + 0.25, 2.0);
    slider.value(globalScaleFactor);
  }
}

function keyPressed() {
  if (cnvIsFocused === "outside") return;

  if (
    (keyCode === 49 || keyCode === 50 || keyCode === 51 || keyCode === 52 || keyCode === 53) &&
    !isShiftPressed &&
    !(selectedObject && selectedObject.object instanceof State) &&
    !(selectedObject && selectedObject.object instanceof Link) &&
    !(selectedObject && selectedObject.object instanceof SelfLink) &&
    !links.some((link) => link.transitionBox.selected)
  ) {
    let index = keyCode - 49;
    let buttons = ["select", "addState", "addLink", "move", "delete"];
    setSelectedMenuButton(buttons[index]);
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

  // Check ctrl + z
  if (keyIsDown(CONTROL) && (key == "z" || key == "Z")) {
    let newIndex = max(historyIndex - 1, 0);

    if (newIndex !== historyIndex) {
      historyIndex = newIndex;
      createCanvasStatesFromOBJ(history[historyIndex]);
    }
  }

  // Check ctrl + y
  if (keyIsDown(CONTROL) && (key == "y" || key == "Y")) {
    let newIndex = min(historyIndex + 1, history.length - 1);

    if (newIndex !== historyIndex) {
      historyIndex = newIndex;
      createCanvasStatesFromOBJ(history[historyIndex]);
    }
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
    states.push(new State(stateID, mouseX / globalScaleFactor, mouseY / globalScaleFactor, stateRadius, globalScaleFactor));
    states[states.length - 1].selected = true;
    selectedObject = { object: states[states.length - 1], index: states.length - 1 };

    createHistory();
  } else {
    if (overState.object instanceof State) {
      console.log("Double clicked on state");
      overState.object.isEndState = !overState.object.isEndState;

      createHistory();
    }
  }
}

function mouseDragged() {
  // if (cnvIsFocused === "outside") return;

  for (let i = 0; i < links.length; i++) {
    links[i].mouseDragged();
  }

  if (startLink) startLink.mouseDragged();

  return false;
}
