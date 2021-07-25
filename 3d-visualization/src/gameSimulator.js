import {
  generateGameFieldWithBasesAndAddToScene,
  addPinModel,
} from "./modelGeneration";
import {
  mapNumericFieldValueToPositionXZ,
  mapBaseToColor,
  mapPlayerToColor,
  lerp3D,
  pathFromNumberToNumber,
  getLastNumForPlayer,
  DEFAULT_Y_POS_OF_PLAYER_PINS,
  getAnimationStepsObjectsForMove,
  get3dPinPosFromNumPlayerPin,
  waitPromise,
} from "./utilities";
import { getMockGameData } from "./getGameData";
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
const FRAMES_PER_STEP = 10;
const TIME_PER_STEP = 500;

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
    this.pinNumberPositions = {
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
      // await waitPromise(TIME_PER_STEP);
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
      pinModel.position.y = DEFAULT_Y_POS_OF_PLAYER_PINS;
      pinModel.position.z = posZ;
    });
  }

  async loadInGameData(filepath) {
    const data = await getMockGameData();
    this.gameData = data;
  }

  async transitionBetweenPinPositionsSimplified(pinPositions, pinPositions2) {
    iterPlayerPins((player, i) => {
      const [x, y, z] = get3dPinPosFromNumPlayerPin(
        pinPositions2[player][i],
        player,
        i
      );
      this.pins[player][i].position.x = x;
      this.pins[player][i].position.y = y;
      this.pins[player][i].position.z = z;
    });
  }

  async transitionBetweenPinPositions(pinPositions1, pinPositions2) {
    const TIME_FOR_TRANSITION = 1000;
    const ANIMATION_STEPS = 200;

    let pinsThatChangedPositions = [];
    await iterPlayerPins((player, i) => {
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
      pinsThatChangedPositions.length >= 1 ? pinsThatChangedPositions[0] : null; // e.g. arriver = ["p1", 2] = dritter pin player 1
    let leaver =
      pinsThatChangedPositions.length >= 2 ? pinsThatChangedPositions[1] : null;
    // switch arriver and leaver if needed:
    if (arriver && leaver) {
      // if dest leaver = start of arriver, it is wrong and has to be switched:
      if (
        pinPositions2[leaver[0]][leaver[1]] ==
        pinPositions1[arriver[0]][arriver[1]]
      ) {
        let temp = [leaver[0], leaver[1]];
        leaver = arriver;
        arriver = temp;
      }
    }

    // set destinations and calculate Path:
    let allSteps = [];
    if (arriver) {
      // // calculate arriver Path:
      let arriverPosOri = pinPositions1[arriver[0]][arriver[1]]; // just a number
      let arriverPosDest = pinPositions2[arriver[0]][arriver[1]]; // just a number
      let animationSteps = getAnimationStepsObjectsForMove(
        arriverPosOri,
        arriverPosDest,
        arriver[0],
        arriver[1],
        FRAMES_PER_STEP
      );
      allSteps.push(animationSteps);
    }
    if (leaver) {
      // calculate leaver path:
      let leaverPosOri = pinPositions1[leaver[0]][leaver[1]]; // just a number
      let leaverPosDest = pinPositions2[leaver[0]][leaver[1]]; // just a number
      let animationSteps = getAnimationStepsObjectsForMove(
        leaverPosOri,
        leaverPosDest,
        leaver[0],
        leaver[1],
        FRAMES_PER_STEP
      );
      allSteps.push(animationSteps);
    }

    // do the animation:
    let counter = 0;
    for (let i = 0; i < allSteps.length; i++) {
      const stepsArray = allSteps[i];

      if (allSteps[i].length == 0) allSteps[i] = null; // remove stepsArray because it is used up

      // for each step in stepsarray do animation:
      for (let s = 0; s < stepsArray.length; s++) {
        const stepObj = stepsArray[s];
        this.setPinToPosition(
          stepObj.pathStartPos3d,
          stepObj.player,
          stepObj.pin
        );
        for (let j = 0; j < stepObj.path.length; j++) {
          await waitPromise(TIME_PER_STEP / FRAMES_PER_STEP);
          this.setPinToPosition(stepObj.path[j], stepObj.player, stepObj.pin);
        }
      }
    }
  }

  setPinToPosition(vec3, player, pin) {
    // console.log(this.pins["p1"], player);
    const pinObject = this.pins[player][pin];
    pinObject.position.x = vec3[0];
    pinObject.position.y = vec3[1];
    pinObject.position.z = vec3[2];
  }
}

async function iterPlayerPins(callback) {
  for (let j = 0; j < PLAYERS.length; j++) {
    let player = PLAYERS[j];
    for (let i = 0; i < 4; i++) {
      await callback(player, i);
    }
  }
}
