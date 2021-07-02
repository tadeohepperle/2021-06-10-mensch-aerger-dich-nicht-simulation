import * as THREE from "three";
import {
  mapNumericFieldValueToPositionXZ,
  mapPlayerToColor,
} from "./utilities";

function generateGameFieldMesh() {
  const geom = new THREE.BoxGeometry(22, 2, 22);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff63f7 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = 0;
  mesh.position.x = 0;
  return mesh;
}

function generateRoundStepBaseMesh(number, player, pin) {
  const color = mapPlayerToColor(player);
  const mat = new THREE.MeshStandardMaterial({ color });
  const geom = new THREE.CylinderGeometry(0.75, 0.75, 5, 64);
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
