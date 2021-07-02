import { GLTFLoader } from "./GLTFLoader";
// var pinModel = null;
// export async function loadPinModel() {
//   if (pinModel == null) {
//     pinmodel = await _loadPinModel();
//   }
//   return pinModel;
// }
export async function loadPinModel() {
  let pinLoader = new GLTFLoader();
  let model = await new Promise((resolve, reject) => {
    pinLoader.load("./src/pin.gltf", (gltf) => {
      const pinMeshScene = gltf.scene;
      resolve(pinMeshScene.children[0]);
    });
  });
  return model;
}
