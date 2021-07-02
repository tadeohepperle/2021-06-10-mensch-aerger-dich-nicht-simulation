// fields have int coordinates from -5 to 5
export function mapNumericFieldValueToPositionXZ(number, player, pin) {
  if (number < -4 || number > 40) {
    return null;
    console.error(
      `number ${number} is not a valid field number. Position cant be determined.`
    );
  }
  if (number == 0) {
    let posX = -5;
    let posZ = -5;
    switch (player) {
      case "p1":
        break;
      case "p2":
        posX += 9;
        break;
      case "p3":
        posX += 9;
        posZ += 9;
        break;
      case "p4":
        posZ += 9;
        break;
    }
    switch (pin) {
      case 0:
        break;
      case 1:
        posX += 1;
        break;
      case 2:
        posZ += 1;
        break;
      case 3:
        posX += 1;
        posZ += 1;
        break;
    }
    return { posX, posZ };
  } else if (number < 0) {
    let directionX = 1;
    let directionZ = 0;
    switch (player) {
      case "p1":
        break;
      case "p2":
        directionX = 0;
        directionZ = 1;
        break;
      case "p3":
        directionX = -1;
        directionZ = 0;
        break;
      case "p4":
        directionX = 0;
        directionZ = -1;
        break;
    }
    let posX = 0,
      posZ = 0;
    // go to entry point field (eg. field nr. 40)
    posX += -directionX * 5;
    posZ += -directionZ * 5;
    // go into the heaven:
    posX += -number * directionX;
    posZ += -number * directionZ;
    return { posX, posZ };
  }

  const positionsArray = [
    null,
    [-5, -1],
    [-4, -1],
    [-3, -1],
    [-2, -1],
    [-1, -1], // 5
    [-1, -2],
    [-1, -3],
    [-1, -4],
    [-1, -5],
    [0, -5], // 10
    [1, -5],
    [1, -4],
    [1, -3],
    [1, -2],
    [1, -1], // 15
    [2, -1],
    [3, -1],
    [4, -1],
    [5, -1],
    [5, 0], // 20
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1], // 25
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [0, 5], // 30
    [-1, 5],
    [-1, 4],
    [-1, 3],
    [-1, 2],
    [-1, 1], // 35
    [-2, 1],
    [-3, 1],
    [-4, 1],
    [-5, 1],
    [-5, 0], // 40
  ];

  let [posX, posZ] = positionsArray[number];
  return { posX, posZ };

  // const transformPosition = (position) => [position.x * 2, position.z * 2];
  // return [0, 0];
}

export function mapBaseToColor(number, player, pin) {
  if (player != null) return mapPlayerToColor(player);
  else {
    const players = ["p1", "p2", "p3", "p4"];
    if (number % 10 == 1)
      return mapPlayerToColor(players[Math.floor(number / 10)]);
    else return DEFAULTCOLOR;
  }
}

export function mapPlayerToColor(player) {
  switch (player) {
    case "p1":
      return 0xff3624;
    case "p2":
      return 0x30d94f;
    case "p3":
      return 0x36a5f5;
    case "p4":
      return 0xba5fe8;
    default:
      return DEFAULTCOLOR;
  }
}
const DEFAULTCOLOR = 0xbfbfbf;

export function lightenColor(color) {
  return color;
}

/**
 * @param {vec3} position_Origin
 * @param {vec3} position_Destination
 * @param {float} value between 0 and 1
 * @returns {vec3} interpolation
 */
export function lerp3D([x1, y1, z1], [x2, y2, z2], value) {
  let value_inv = 1 - value;
  return [
    x1 * value_inv + x2 * value,
    y1 * value_inv + y2 * value,
    z1 * value_inv + z2 * value,
  ];
}
