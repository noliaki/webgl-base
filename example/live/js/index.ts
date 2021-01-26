import { WebGlBase } from '../../../src/webgl-base'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader'
// import { Vector3, Matrix4 } from 'matrixgl'
import { createSquare } from './Square'
// import { loadImage } from './helper'

const videoEl = document.querySelector('video')
const canvasEl = document.getElementById('c') as HTMLCanvasElement

const start: number = Date.now()

const square = createSquare()

const base = WebGlBase.createBase({
  clearColor: [0, 0, 0, 1],
  canvas: canvasEl,
  // width: 300,
  // height: 300,
  vertexShader,
  fragmentShader,
})

let flip = false

videoEl.addEventListener(
  'loadedmetadata',
  async (_event: Event): Promise<void> => {
    await videoEl.play().catch(console.error)

    // const texture2 = await loadImage(
    //   '/texture/img/cat.jpg',
    //   base.texture.maxTextureSize
    // )

    // const filter = await loadImage(
    //   '/texture/img/cloud.png',
    //   base.texture.maxTextureSize
    // )

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

    base.texture.register({
      name: 'tex1',
      texture: videoEl,
    })
    base.texture.register({
      name: 'tex2',
      texture: videoEl,
    })
    base.texture.register({
      name: 'self',
      texture: canvasEl,
    })
    // base.texture.register({
    //   name: 'texFilter',
    //   texture: filter.textureSource,
    // })

    base.uniform.register({
      name: 'texResolution',
      type: '2fv',
      value: [640, 480],
    })

    // base.uniform.register({
    //   name: 'texFilterResolution',
    //   type: '2fv',
    //   value: [filter.naturalWidth, filter.naturalHeight],
    // })

    base.draw.elements({
      mode: 'TRIANGLES',
      count: square.index.length,
    })

    update()
  },
  {
    once: true,
  }
)

function update() {
  base.clear()
  base.uniform.update({
    name: 'uTime',
    value: Date.now() - start,
  })
  base.texture.updateTexture({
    name: flip ? 'tex1' : 'tex2',
    texture: videoEl,
  })
  base.texture.updateTexture({
    name: 'self',
    texture: canvasEl,
  })
  base.draw.update()
  base.flush()

  flip = !flip

  window.requestAnimationFrame(() => {
    update()
  })
}

async function startStream(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  })

  videoEl.srcObject = stream
}

startStream()

document.addEventListener('click', () => {
  const canvas = document.createElement('canvas')

  document.body.appendChild(canvas)
  canvas.width = canvasEl.width
  canvas.height = canvasEl.height

  const context = canvas.getContext('2d')

  context.drawImage(base.context.canvas, 0, 0)
})
