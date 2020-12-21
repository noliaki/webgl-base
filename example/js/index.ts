import { WebGlBase } from '../../src/webgl-base'

const base = WebGlBase.createBase({
  clearColor: [0, 0.3, 1, 1],
  height: 100,
})
base.resize(400, 200)

document.body.appendChild(base.canvas)
