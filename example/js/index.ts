import { WebGlBase } from '../../src/webgl-base'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'

const base = WebGlBase.createBase({
  clearColor: [0, 0.3, 1, 1],
})
  .createProgram({
    vertexShader,
    fragmentShader,
  })
  .registerUniform({
    name: 'uTime',
    value: Date.now(),
    type: '1f',
  })

document.body.appendChild(base.canvas)
