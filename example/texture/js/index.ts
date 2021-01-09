import { WebGlBase, bytesByType } from '../../../src/webgl-base'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'
import { Vector3, Matrix4 } from 'matrixgl'
import { createSquare } from './Square'
import { loadImage } from './helper'

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

// const identity = Matrix4.identity()
// const scaling = Matrix4.scaling(1, 1, 1)
// const rotation = Matrix4.rotationX(0)
// const translation = Matrix4.translation(0, 0, 0)

// const transform = identity
//   .mulByMatrix4(translation)
//   .mulByMatrix4(rotation)
//   .mulByMatrix4(scaling)

const mvp = perspective.mulByMatrix4(view) // .mulByMatrix4(transform)
const lightDirection = new Vector3(0.5, 0.7, 1)

// const particleNum = 10000
// const particles = createTriangleParticleData()

const square = createSquare()
const textureCoord: Float32Array = new Float32Array([
  0.0,
  0.0,
  1.0,
  0.0,
  0.0,
  1.0,
  1.0,
  1.0,
])

console.log(square)

const base = WebGlBase.createBase({
  clearColor: [0, 0, 0, 1],
  canvas: document.getElementById('c') as HTMLCanvasElement,
  // width: 300,
  // height: 300,
  vertexShader,
  fragmentShader,
})

base.uniform.register({
  name: 'uResolution',
  value: [window.innerWidth, window.innerHeight],
  type: '2fv',
})

base.uniform.register({
  name: 'uTime',
  value: start,
  type: '1f',
})

base.bindBufferByData({
  data: square.position,
})

base.attr.pointerByname({
  name: 'aPosition',
  size: 3,
})

base.bindBufferByData({
  data: square.index,
  target: 'ELEMENT_ARRAY_BUFFER',
  usage: 'STATIC_DRAW',
})

base.draw.elements({
  mode: 'TRIANGLES',
  count: square.index.length,
})

// base.uniform.register({
//   name: 'uMvp',
//   value: mvp.values,
//   type: 'Matrix4fv',
// })
// base.uniform.register({
//   name: 'uLightDirection',
//   value: lightDirection.normalize().values,
//   type: '3fv',
// })
// base.uniform.register({
//   name: 'uInvMvp',
//   value: mvp.values,
//   type: 'Matrix4fv',
// })
// base.bindBufferByData(particles)

// const stride = (3 + 3 + 4 + 3 + 3) * bytesByType.FLOAT

// base.attr.pointerByname({
//   name: 'aPosition',
//   size: 3,
//   stride,
// })
// base.attr.pointerByname({
//   name: 'aNormal',
//   size: 3,
//   offset: 3 * bytesByType.FLOAT,
//   stride,
// })
// base.attr.pointerByname({
//   name: 'aColor',
//   size: 4,
//   offset: (3 + 3) * bytesByType.FLOAT,
//   stride,
// })
// base.attr.pointerByname({
//   name: 'aStagger',
//   size: 3,
//   offset: (3 + 3 + 4) * bytesByType.FLOAT,
//   stride,
// })
// base.attr.pointerByname({
//   name: 'aCenter',
//   size: 3,
//   offset: (3 + 3 + 4 + 3) * bytesByType.FLOAT,
//   stride,
// })
// firstDraw()
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

async function init(): Promise<void> {
  const texture1 = await loadImage('/texture/img/IMG_0049.JPG')
  const texture2 = await loadImage('/texture/img/cat.jpg')
  const filter = await loadImage('/texture/img/cloud.png')

  console.log(texture1, texture2)

  base.texture.register({
    name: 'tex1',
    texture: texture1.textureSource,
  })
  base.texture.register({
    name: 'tex2',
    texture: texture2.textureSource,
  })
  base.texture.register({
    name: 'texFilter',
    texture: filter.textureSource,
  })

  base.uniform.register({
    name: 'tex1Resolution',
    type: '2fv',
    value: [texture1.naturalWidth, texture1.naturalHeight],
  })
  base.uniform.register({
    name: 'tex2Resolution',
    type: '2fv',
    value: [texture2.naturalWidth, texture2.naturalHeight],
  })

  base.uniform.register({
    name: 'texFilterResolution',
    type: '2fv',
    value: [filter.naturalWidth, filter.naturalHeight],
  })

  update()
}

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

init()
