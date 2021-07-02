import {
  generateGameFieldWithBasesAndAddToScene,
  addPinModel,
} from "./modelGeneration";
import {
  mapNumericFieldValueToPositionXZ,
  mapBaseToColor,
  mapPlayerToColor,
  lerp3D,
} from "./utilities";
import { getMockGameData } from "./getGameData";
const DEFAULT_Y_POS = 1.65;
const PLAYERS = ["p1", "p2", "p3", "p4"];
const EXAMPLE_PIN_POSITIONS = {
  p1: [27, 7, 0, 0],
  p2: [-2, -1, -3, 9],
  p3: [-3, -2, -1, 18],
  p4: [-3, -1, -2, -4],
};

const EXAMPLE_PIN_POSITIONS2 = {
  p1: [-2, 7, 0, 0],
  p2: [13, -1, -3, -2],
  p3: [-3, -2, -1, -4],
  p4: [-3, -1, -2, -4],
};

export class GameSimulator {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.pins = {
      p1: [null, null, null, null],
      p2: [null, null, null, null],
      p3: [null, null, null, null],
      p4: [null, null, null, null],
    };
  }

  async setup() {
    generateGameFieldWithBasesAndAddToScene(this.scene);
    await this.addAllPinsToScene();
    await this.loadInGameData();
    await this.setPinsToPositions(this.gameData.history[0].pinPositions);
  }

  async runGame() {
    let history = this.gameData.history;
    for (let i = 0; i < history.length - 1; i++) {
      await this.transitionBetweenPinPositions(
        history[i].pinPositions,
        history[i + 1].pinPositions
      );
    }
  }

  async addAllPinsToScene() {
    await iterPlayerPins(async (player, i) => {
      let pinModel = await addPinModel(this.scene, player);
      this.pins[player][i] = pinModel;
    });
  }

  setPinsToPositions(pinPositions) {
    iterPlayerPins((player, i) => {
      let pinModel = this.pins[player][i];
      let pinPos = pinPositions[player][i];
      let { posX, posZ } = mapNumericFieldValueToPositionXZ(pinPos, player, i);
      pinModel.position.x = posX;
      pinModel.position.y = DEFAULT_Y_POS;
      pinModel.position.z = posZ;
    });
  }

  async loadInGameData(filepath) {
    const data = await getMockGameData();
    this.gameData = data;
  }

  async transitionBetweenPinPositions(pinPositions1, pinPositions2) {
    const TIME_FOR_TRANSITION = 1000;
    const ANIMATION_STEPS = 200;
    let pinsThatChangedPositions = [];
    iterPlayerPins((player, i) => {
      if (pinPositions1[player][i] != pinPositions2[player][i]) {
        pinsThatChangedPositions.push([player, i]);
      }
    });
    if (pinsThatChangedPositions.length >= 3) {
      throw new Error(
        `Must be wrong: pinsThatChangedPositions.length = ${pinsThatChangedPositions.length}`
      );
    }
    let arriver =
      pinsThatChangedPositions.length >= 1 ? pinsThatChangedPositions[0] : null;
    let leaver =
      pinsThatChangedPositions.length >= 2 ? pinsThatChangedPositions[1] : null;
    // switch arriver and leaver if needed:
    if (arriver && leaver) {
      // if dest leaver = start of arriver, it is wrong and has to be switched:
      if (
        pinPositions2[leaver[0]][leaver[1]] ==
        pinPositions1[arriver[0]][arriver[1]]
      ) {
        temp = [leaver[0], leaver[1]];
        leaver = arriver;
        arriver = temp;
      }
    }

    // set destinations and calculate Path:
    let allPaths = [];
    if (pinsThatChangedPositions.length >= 1) {
      // calculate arriver Path:
      let arriverPath = Array(ANIMATION_STEPS).fill(null);
      let arriverPosOri = pinPositions1[arriver[0]][arriver[1]]; // just a number
      let arriverPosDest = pinPositions2[arriver[0]][arriver[1]]; // just a number
      // origin 3d:
      let { posX: arriver3dOriX, posZ: arriver3dOriZ } =
        mapNumericFieldValueToPositionXZ(arriverPosOri, arriver[0], arriver[1]);
      let arriver3dOriXYZ = [arriver3dOriX, DEFAULT_Y_POS, arriver3dOriZ];
      // destination 3d:
      let { posX: arriver3dDestX, posZ: arriver3dDestZ } =
        mapNumericFieldValueToPositionXZ(
          arriverPosDest,
          arriver[0],
          arriver[1]
        );
      let arriver3dDestXYZ = [arriver3dDestX, DEFAULT_Y_POS, arriver3dDestZ];
      for (let i = 1; i <= ANIMATION_STEPS; i++) {
        let pos3d = lerp3D(
          arriver3dOriXYZ,
          arriver3dDestXYZ,
          i / ANIMATION_STEPS
        );
        arriverPath[i - 1] = pos3d;
      }
      if (pinsThatChangedPositions.length == 2) {
        // calculate leaver Path:
      }
      allPaths.push({
        player: arriver[0],
        pin: arriver[1],
        path: arriverPath,
        origin3d: arriver3dOriXYZ,
        destination3d: arriver3dDestXYZ,
      });
    }

    // do the animation:
    for (let i = 0; i < ANIMATION_STEPS; i++) {
      await new Promise((res, rej) => {
        setTimeout(() => {
          res();
        }, TIME_FOR_TRANSITION / ANIMATION_STEPS);
      });
      allPaths.forEach((aPath) => {
        const { player, pin, path } = aPath;
        const pinObject = this.pins[player][pin];
        pinObject.position.x = path[i][0];
        pinObject.position.y = path[i][1];
        pinObject.position.z = path[i][2];
      });
    }
  }
}

async function iterPlayerPins(callback) {
  for (let j = 0; j < PLAYERS.length; j++) {
    const player = PLAYERS[j];
    for (let i = 0; i < 4; i++) {
      await callback(player, i);
    }
  }
}
