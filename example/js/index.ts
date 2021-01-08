import { WebGlBase, bytesByType } from '../../src/webgl-base'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'
import { Vector3, Matrix4 } from 'matrixgl'
import { createTriangle } from './Triangle'

const start: number = Date.now()

const camera = new Vector3(0, 0, -5)
const lookAt = new Vector3(0, 0, 0)
const cameraUpDirection = new Vector3(0, 1, 0)

const view = Matrix4.lookAt(camera, lookAt, cameraUpDirection)
const perspective = Matrix4.perspective({
  fovYRadian: 120,
  aspectRatio: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 2000,
})

const identity = Matrix4.identity()
const scaling = Matrix4.scaling(1, 1, 1)
const rotation = Matrix4.rotationX(0)
const translation = Matrix4.translation(0, 0, 0)

const transform = identity
  .mulByMatrix4(translation)
  .mulByMatrix4(rotation)
  .mulByMatrix4(scaling)

const mvp = perspective.mulByMatrix4(view) // .mulByMatrix4(transform)
const lightDirection = new Vector3(0.5, 0.7, 1)

const particleNum = 10000
const particles = createTriangleParticleData()

const base = WebGlBase.createBase({
  clearColor: [0, 0, 0, 1],
  canvas: document.getElementById('c') as HTMLCanvasElement,
  // width: 300,
  // height: 300,
  vertexShader,
  fragmentShader,
})
base.uniform.register({
  name: 'uTime',
  value: start,
  type: '1f',
})
base.uniform.register({
  name: 'uMvp',
  value: mvp.values,
  type: 'Matrix4fv',
})
base.uniform.register({
  name: 'uLightDirection',
  value: lightDirection.normalize().values,
  type: '3fv',
})
// base.uniform.register({
//   name: 'uInvMvp',
//   value: mvp.values,
//   type: 'Matrix4fv',
// })
base.bindBufferByData(particles)

const stride = (3 + 3 + 4 + 3 + 3) * bytesByType.FLOAT

base.attr.pointerByname({
  name: 'aPosition',
  size: 3,
  stride,
})
base.attr.pointerByname({
  name: 'aNormal',
  size: 3,
  offset: 3 * bytesByType.FLOAT,
  stride,
})
base.attr.pointerByname({
  name: 'aColor',
  size: 4,
  offset: (3 + 3) * bytesByType.FLOAT,
  stride,
})
base.attr.pointerByname({
  name: 'aStagger',
  size: 3,
  offset: (3 + 3 + 4) * bytesByType.FLOAT,
  stride,
})
base.attr.pointerByname({
  name: 'aCenter',
  size: 3,
  offset: (3 + 3 + 4 + 3) * bytesByType.FLOAT,
  stride,
})
firstDraw()
// base.draw.arrays({
//   mode: 'TRIANGLES',
// })
// base.draw.arrays({
//   mode: 'TRIANGLES',
//   first: 3,
// })
// .drawArrays({ first: 3 })
base.flush()
// .registerUniform({
//   name: 'uTime',
//   value: start,
//   type: '1f',
// })
// .registerUniform({
//   name: 'mvp',
//   value: mvp.values,
//   type: 'Matrix4fv',
// })
// .vertexAttribPointerByName({
//   name: 'position',
//   size: 3,
//   stride: (3 + 4) * bytesByType.FLOAT,
// })

function update() {
  base.clear()
  base.uniform.update({
    name: 'uTime',
    value: Date.now() - start,
  })
  base.draw.update()
  base.flush()

  window.requestAnimationFrame(() => {
    update()
  })
}

function createTriangleParticleData(vol = particleNum): Float32Array {
  let data = []

  for (let i = 0; i < vol; i++) {
    const triangleData = createTriangle({
      position: [
        Math.random() * -60 + 30,
        Math.random() * -60 + 30,
        Math.random() * 300,
      ],
      size: Math.random() * 2 + 1,
    })

    data = data.concat(triangleData)
  }

  return new Float32Array(data)
}

function firstDraw(): void {
  for (let i = 0; i < particleNum; i++) {
    base.draw.arrays({
      mode: 'TRIANGLES',
      first: i * 3,
    })
  }
}

update()
