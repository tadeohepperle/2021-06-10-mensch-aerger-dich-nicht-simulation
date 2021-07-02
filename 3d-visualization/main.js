import "./style.css";
import * as UTIL from "./src/utilities";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { generateGameFieldWithBasesAndAddToScene } from "./src/modelGeneration";
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
console.log("render");

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function addHelpers(scene) {
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(10, 5, 0);
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(pointLight, ambientLight);
  const lightHelper = new THREE.PointLightHelper(pointLight);
  scene.add(lightHelper);
  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(gridHelper);
}
addHelpers(scene);
const controls = new OrbitControls(camera, renderer.domElement);

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

generateGameFieldWithBasesAndAddToScene(scene);
