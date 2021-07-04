import * as THREE from "three";
import {
  mapNumericFieldValueToPositionXZ,
  mapBaseToColor,
  mapPlayerToColor,
} from "./utilities";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { loadPinModel } from "./models";
export function addHelpers(scene) {
  const pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(10, 5, 0);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(pointLight, ambientLight);
  // const lightHelper = new THREE.PointLightHelper(pointLight);
  // scene.add(lightHelper);
  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(gridHelper);
}

export function addControls(camera, renderer, damping) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = damping;
  controls.dampingFactor = 0.3;
}

function generateGameFieldMesh() {
  const geom = new THREE.BoxGeometry(22, 2, 22);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = 0;
  mesh.position.x = 0;
  return mesh;
}

function generateRoundStepBaseMesh(number, player, pin) {
  const color = mapBaseToColor(number, player, pin);
  const mat = new THREE.MeshStandardMaterial({ color });
  const geom = new THREE.CylinderGeometry(0.5, 0.5, 2.3, 64);
  const mesh = new THREE.Mesh(geom, mat);
  const { posX, posZ } = mapNumericFieldValueToPositionXZ(number, player, pin);
  mesh.position.x = posX;
  mesh.position.z = posZ;
  return mesh;
}

export function generateGameFieldWithBasesAndAddToScene(scene) {
  const gameField = generateGameFieldMesh();
  scene.add(gameField);

  let basesOnGroundSetupData = [
    // startfelder:
    [0, "p1", 0],
    [0, "p1", 1],
    [0, "p1", 2],
    [0, "p1", 3],
    //
    [0, "p2", 0],
    [0, "p2", 1],
    [0, "p2", 2],
    [0, "p2", 3],
    //
    [0, "p3", 0],
    [0, "p3", 1],
    [0, "p3", 2],
    [0, "p3", 3],
    //
    [0, "p4", 0],
    [0, "p4", 1],
    [0, "p4", 2],
    [0, "p4", 3],
    // zielfelder:
    [-1, "p1", 0],
    [-2, "p1", 0],
    [-3, "p1", 0],
    [-4, "p1", 0],
    //
    [-1, "p2", 0],
    [-2, "p2", 0],
    [-3, "p2", 0],
    [-4, "p2", 0],
    //
    [-1, "p3", 0],
    [-2, "p3", 0],
    [-3, "p3", 0],
    [-4, "p3", 0],
    //
    [-1, "p4", 0],
    [-2, "p4", 0],
    [-3, "p4", 0],
    [-4, "p4", 0],
  ];

  for (let i = 1; i <= 40; i++) {
    basesOnGroundSetupData.push([i, null, 0]);
  }

  basesOnGroundSetupData.forEach((el) => {
    const [number, player, pin] = el;
    const baseMesh = generateRoundStepBaseMesh(number, player, pin);
    scene.add(baseMesh);
  });
}

export async function addPinModel(scene, player) {
  let pinModel = await loadPinModel();
  pinModel.material = new THREE.MeshStandardMaterial({
    color: mapPlayerToColor(player),
  });
  // pinModel.material.shading = THREE.SmoothShading;
  scene.add(pinModel);
  return pinModel;
}
