export function createSquare({
  position = [0, 0, 0],
  width = 2,
  height = 2,
} = {}): {
  position: Float32Array
  index: Int16Array
} {
  const halfW = width / 2
  const halfH = height / 2

  return {
    position: new Float32Array([
      position[0] - halfW,
      position[1] + halfH,
      position[2] + 0,

      position[0] + halfW,
      position[1] + halfH,
      position[2] + 0,

      position[0] - halfW,
      position[1] - halfH,
      position[2] + 0,

      position[0] + halfW,
      position[1] - halfH,
      position[2] + 0,
    ]),
    index: new Int16Array([0, 2, 1, 1, 2, 3]),
  }
}
