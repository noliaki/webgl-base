import { UniformManager } from './UniformManager'
import { AttributeManager } from './AttributeManager'
import { TextureManager } from './TextureManager'
import { DrawMnager } from './DrawMnager'

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

type ConstructorArgs = {
  canvas?: HTMLCanvasElement
  clearColor?: [number, number, number, number]
  width?: number
  height?: number
  contextAttribute?: WebGLContextAttributes
  vertexShader: string
  fragmentShader: string
}

export const bytesByType = {
  BYTE: 1,
  SHORT: 2,
  UNSIGNED_BYTE: 1,
  UNSIGNED_SHORT: 2,
  FLOAT: 4,
  HALF_FLOAT: 2,
} as const

export class WebGlBase {
  public readonly canvas: HTMLCanvasElement
  public readonly context: WebGLRenderingContext
  public readonly program: WebGLProgram

  public readonly uniform: UniformManager
  public readonly attr: AttributeManager
  public readonly texture: TextureManager
  public readonly draw: DrawMnager

  private clearColor: [number, number, number, number]
  private vertexShader: WebGLShader | null = null
  private fragmentShader: WebGLShader | null = null

  private constructor({
    canvas,
    clearColor,
    width,
    height,
    vertexShader,
    fragmentShader,
    contextAttribute,
  }: ConstructorArgs) {
    this.canvas = canvas
    this.context = (this.canvas.getContext('webgl', contextAttribute) ||
      this.canvas.getContext(
        'experimental-webgl',
        contextAttribute
      )) as WebGLRenderingContext

    console.log(this.context.getContextAttributes())

    this.clearColor = [...clearColor]

    this.program = this.createProgram({
      vertexShader,
      fragmentShader,
    })

    this.uniform = UniformManager.create(this.context, this.program)
    this.attr = AttributeManager.create(this.context, this.program)
    this.texture = TextureManager.create(this.context, this.program)
    this.draw = DrawMnager.create(this.context)

    // this.context.enable(this.context.CULL_FACE)
    this.context.enable(this.context.DEPTH_TEST)
    this.context.enable(this.context.BLEND)

    this.context.blendEquation(this.context.FUNC_ADD)
    this.context.blendFunc(
      this.context.CONSTANT_ALPHA,
      this.context.SRC_ALPHA_SATURATE
    )
    // this.context.blendEquation(this.context.FUNC_ADD)
    // this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE)

    this.context.depthFunc(this.context.LEQUAL)

    this.resize(width, height)
    this.clear()
  }

  static createBase({
    canvas = document.createElement('canvas'),
    clearColor = [0, 0, 0, 1],
    width = window.innerWidth,
    height = window.innerHeight,
    contextAttribute = {
      alpha: true,
      antialias: true,
      depth: true,
      desynchronized: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
      // xrCompatible: false,
    },
    vertexShader,
    fragmentShader,
  }: ConstructorArgs): WebGlBase {
    if (!vertexShader || !fragmentShader) {
      throw new Error('vertexShader or fragmentShader is required')
    }

    return new WebGlBase({
      canvas,
      clearColor,
      width,
      height,
      vertexShader,
      fragmentShader,
      contextAttribute: Object.assign({}, contextAttribute),
    })
  }

  clear(
    mask: GLbitfield = this.context.COLOR_BUFFER_BIT |
      this.context.DEPTH_BUFFER_BIT
  ): WebGlBase {
    this.context.clearColor(...this.clearColor)
    this.context.clearDepth(1.0)
    this.context.clear(mask)

    return this
  }

  resize(width: number, height: number): WebGlBase {
    this.canvas.width = width
    this.canvas.height = height
    this.context.viewport(0, 0, width, height)
    this.context.clear(this.context.COLOR_BUFFER_BIT)

    return this
  }

  private createProgram({
    vertexShader,
    fragmentShader,
  }: {
    vertexShader: string
    fragmentShader: string
  }): WebGLProgram {
    this.vertexShader = this.createVertextShader(vertexShader)
    this.fragmentShader = this.createFragmentShader(fragmentShader)

    if (!this.vertexShader) {
      throw new Error('vertex shader is not created')
    }

    if (!this.fragmentShader) {
      throw new Error('fragment shader is not created')
    }

    const program: WebGLProgram = this.context.createProgram()

    this.context.attachShader(program, this.vertexShader)
    this.context.attachShader(program, this.fragmentShader)

    this.context.linkProgram(program)

    if (!this.context.getProgramParameter(program, this.context.LINK_STATUS)) {
      throw new Error('can not link program')
    }

    this.context.useProgram(program)

    return program
  }

  flush(): WebGlBase {
    this.context.flush()

    return this
  }

  private createShader(src: string, type: number): WebGLShader {
    const shader: WebGLShader | null = this.context.createShader(type)

    if (shader === null) {
      throw new Error('can not create shader')
    }

    this.context.shaderSource(shader, src)
    this.context.compileShader(shader)

    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      throw new Error('can not compile shader')
    }

    return shader
  }

  private createVertextShader(src: string): WebGLShader {
    return this.createShader(src, this.context.VERTEX_SHADER)
  }

  private createFragmentShader(src: string): WebGLShader {
    return this.createShader(src, this.context.FRAGMENT_SHADER)
  }

  bindBufferByData({
    data,
    target = 'ARRAY_BUFFER',
    usage = 'STATIC_DRAW',
  }: {
    data: BufferSource | WebGLBuffer
    target?: Target
    usage?: Usage
  }): WebGlBase {
    this.context.bindBuffer(
      this.context[target],
      data instanceof window.WebGLBuffer
        ? data
        : this.createVbo({ data, target, usage })
    )

    return this
  }

  createVbo({
    data,
    target,
    usage,
  }: {
    data: BufferSource
    target: Target
    usage: Usage
  }): WebGLBuffer {
    const vbo: WebGLBuffer = this.context.createBuffer()
    this.context.bindBuffer(this.context[target], vbo)
    this.context.bufferData(this.context[target], data, this.context[usage])
    this.context.bindBuffer(this.context[target], null)

    return vbo
  }
}
