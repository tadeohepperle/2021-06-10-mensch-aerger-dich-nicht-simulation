import "./style.css";
import * as UTIL from "./src/utilities";
import * as THREE from "three";
import {
  generateGameFieldWithBasesAndAddToScene,
  addHelpers,
  addControls,
  addPinModel,
} from "./src/modelGeneration";

import { GameSimulator } from "./src/gameSimulator";
/////////////////////////////////////////////////
// SETUP CAM AND RENDERER
/////////////////////////////////////////////////
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas3d"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.render(scene, camera);
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

/////////////////////////////////////////////////
// ADD STUFF TO SCENE
/////////////////////////////////////////////////
addHelpers(scene);
addControls(camera, renderer);

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

async function run() {
  const gameSimulator = new GameSimulator(scene, camera, renderer);
  await gameSimulator.setup();
  await gameSimulator.loadInGameData("./data/game_2021.json");
  await gameSimulator.runGame();
}

run();
