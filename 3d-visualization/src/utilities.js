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
        posZ += 9;
        break;
      case "p4":
        posX += 9;
        posZ += 9;
        break;
    }
    switch (pin) {
      case 0:
        break;
      case 1:
        posX += 1;
      case 2:
        posZ += 1;
      case 2:
        posX += 1;
        posZ += 1;
    }
    return { posX, posZ };
  } else if (number < 0) {
    let directionX = 1;
    let directionY = 0;
    switch (player) {
      case "p1":
        break;
      case "p2":
        directionX = 0;
        directionY = 1;
        break;
      case "p3":
        directionX = -1;
        directionY = 0;
        break;
      case "p4":
        directionX = -1;
        directionY = 1;
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

export function mapPlayerToColor(player) {
  switch (player) {
    case "p1":
      return 0xffffff;
    case "p2":
      return 0xff0000;
    case "p3":
      return 0x00ff00;
    case "p4":
      return 0x0000ff;
    default:
      return 0x000000;
  }
}

export function lightenColor(color) {
  return color;
}
