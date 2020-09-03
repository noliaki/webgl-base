type Target =
  | 'ARRAY_BUFFER'
  | 'ELEMENT_ARRAY_BUFFER'
  | 'COPY_READ_BUFFER'
  | 'COPY_WRITE_BUFFER'
  | 'TRANSFORM_FEEDBACK_BUFFER'
  | 'UNIFORM_BUFFER'
  | 'PIXEL_PACK_BUFFER'
  | 'PIXEL_UNPACK_BUFFER'

type Usage =
  | 'STATIC_DRAW'
  | 'DYNAMIC_DRAW'
  | 'STREAM_DRAW'
  | 'STATIC_READ'
  | 'DYNAMIC_READ'
  | 'STREAM_READ'
  | 'STATIC_COPY'
  | 'DYNAMIC_COPY'
  | 'STREAM_COPY'

type Mode =
  | 'POINTS'
  | 'LINE_STRIP'
  | 'LINE_LOOP'
  | 'LINES'
  | 'TRIANGLE_STRIP'
  | 'TRIANGLE_FAN'
  | 'TRIANGLES'

type DrayElType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'

type ConstructorArgs = {
  canvas: HTMLCanvasElement
  clearColor: number[]
  width: number
  height: number
}

export function createBase({
  canvas,
  clearColor = [0, 0, 0, 1],
  width,
  height,
}: ConstructorArgs) {
  const context: WebGLRenderingContext = (canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl')) as WebGLRenderingContext
  const clearColor = [
    clearColor[0],
    clearColor[1],
    clearColor[2],
    clearColor[3] || 1,
  ]

  context.enable(context.CULL_FACE)
  context.enable(context.DEPTH_TEST)
  context.depthFunc(context.LEQUAL)
}
