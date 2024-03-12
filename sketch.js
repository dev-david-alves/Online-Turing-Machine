let states = [];
let stateRadius = 25;

function setup() {
  let cnv = createCanvas(500, 500);
  cnv.elt.addEventListener('contextmenu', event => event.preventDefault());
  cnv.doubleClicked(doubleClick);
}

function draw() {
  background(255);
}

function mouseClicked() {
  console.log("Mouse clicked");
}

function mousePressed() {
  console.log("Mouse pressed");
}

function mouseReleased() {
  console.log("Mouse released");
}

function keyPressed() {
  console.log("Key pressed");
}

function doubleClick() {
  console.log("Double clicked");
}