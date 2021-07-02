import "./style.css";
import * as UTIL from "./src/utilities";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

const bases = []; // object that keeps track of all bases objects in the game.
function createBase(x, z, color) {
  const mat = new THREE.MeshStandardMaterial({ color });
  const geom = new THREE.CylinderGeometry(0.75, 0.75, 5, 64);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = z;
  mesh.position.x = x;
  return;
}

function addBasicGameField(scene) {
  const geometry = new THREE.BoxGeometry(22, 2, 22);
  const meshMaterial = new THREE.MeshStandardMaterial({ color: 0xff63f7 });
  const ground = new THREE.Mesh(geometry, meshMaterial);
  scene.add(ground);
  let b = createBase(3, 4, 0x4587ee);

  scene.add(b);
  b;
  // add round bases on ground
}

addBasicGameField(scene);

console.log();
