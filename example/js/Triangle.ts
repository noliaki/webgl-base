const radius = Math.PI / 180

export function createTriangle({
  position = [0, 0, 0],
  size = 1,
}: {
  position: [number, number, number]
  size: number
}): number[] {
  const first = 90
  const data = []

  for (let i = 0; i < 3; i++) {
    const x = position[0] + size * Math.cos((first + i * 60) * radius)
    const y = position[1] + size * Math.sin((first + i * 60) * radius)
    const z = position[2]

    // position
    data.push(x)
    data.push(y)
    data.push(z)

    // normal
    data.push(0)
    data.push(0)
    data.push(1)

    // color
    data.push(0)
    data.push(0.3)
    data.push(1)
    data.push(1)
  }

  return data
}
