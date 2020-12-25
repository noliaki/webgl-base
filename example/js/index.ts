import { WebGlBase } from '../../src/webgl-base'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'
import { Vector3, Matrix4 } from 'matrixgl'

const start: number = Date.now()

const camera = new Vector3(0, 0, -5)
const lookAt = new Vector3(0, 0, 0)
const cameraUpDirection = new Vector3(0, 1, 0)

const view = Matrix4.lookAt(camera, lookAt, cameraUpDirection)
const perspective = Matrix4.perspective({
  fovYRadian: 120,
  aspectRatio: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 200,
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

const base = WebGlBase.createBase({
  clearColor: [0, 0, 0, 1],
  canvas: document.getElementById('c') as HTMLCanvasElement,
  // width: 300,
  // height: 300,
})
  .createProgram({
    vertexShader,
    fragmentShader,
  })
  .registerUniform({
    name: 'uTime',
    value: start,
    type: '1f',
  })
  .registerUniform({
    name: 'mvp',
    value: mvp.values,
    type: 'Matrix4fv',
  })
  .bindBufferByData(
    new Float32Array([
      /* eslint-disable */
      // 1
      0.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      // 2
      0.0, 2.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      /* eslint-enable */
    ])
  )
  .vertexAttribPointerByName({
    name: 'position',
    size: 3,
  })
  .drawArrays({
    mode: 'POINTS',
  })
  // .drawArrays({ first: 3 })
  .flush()

function update() {
  base
    .clear()
    .updateUniform({
      name: 'uTime',
      value: Date.now() - start,
    })
    .drawArrays({ mode: 'POINTS' })
    .flush()

  window.requestAnimationFrame(() => {
    update()
  })
}

// update()
