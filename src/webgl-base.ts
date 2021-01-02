import { UniformManager } from './UniformManager'
import { AttributeManager } from './AttributeManager'

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

type UniformArgs = {
  name: string
  value: UniformValue
  type: UniformType
}

type UniformValue =
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | number
  | number[]

type UniformType =
  | '1i'
  | '2i'
  | '3i'
  | '4i'
  | '1f'
  | '2f'
  | '3f'
  | '4f'
  | '1iv'
  | '2iv'
  | '3iv'
  | '4iv'
  | '1fv'
  | '2fv'
  | '3fv'
  | '4fv'
  | 'Matrix2iv'
  | 'Matrix3iv'
  | 'Matrix4iv'
  | 'Matrix2fv'
  | 'Matrix3fv'
  | 'Matrix4fv'

type ConstructorArgs = {
  canvas?: HTMLCanvasElement
  clearColor?: [number, number, number, number]
  width?: number
  height?: number
}

type UniformData = {
  location: WebGLUniformLocation
  type: UniformType
}

type TextureData = {
  location: WebGLUniformLocation
  index: number
}

type DrawMode =
  | 'POINTS'
  | 'LINE_STRIP'
  | 'LINE_LOOP'
  | 'LINES'
  | 'TRIANGLE_STRIP'
  | 'TRIANGLE_FAN'
  | 'TRIANGLES'

type DataType =
  | 'BYTE'
  | 'SHORT'
  | 'UNSIGNED_BYTE'
  | 'UNSIGNED_SHORT'
  | 'FLOAT'
  | 'HALF_FLOAT'

type DrawType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'

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
  public program: WebGLProgram | null = null

  public uniform: UniformManager
  public attr: AttributeManager

  private clearColor: [number, number, number, number]
  private vertexShader: WebGLShader | null = null
  private fragmentShader: WebGLShader | null = null
  private uniformMap: Map<string, UniformData> = new Map<string, UniformData>()

  private textureMap: Map<string, TextureData> = new Map<string, TextureData>()
  private textureIndexMap: Map<string, number> = new Map<string, number>()
  private textureIndex = 0

  private drawHistory: any[] = []

  private constructor({ canvas, clearColor, width, height }: ConstructorArgs) {
    this.canvas = canvas
    this.context = (this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext

    this.clearColor = [...clearColor]

    this.context.enable(this.context.CULL_FACE)
    this.context.enable(this.context.DEPTH_TEST)
    this.context.depthFunc(this.context.LEQUAL)

    this.resize(width, height)
    this.clear()
  }

  static createBase({
    canvas = document.createElement('canvas'),
    clearColor = [0, 0, 0, 1],
    width = window.innerWidth,
    height = window.innerHeight,
  }: ConstructorArgs = {}): WebGlBase {
    return new WebGlBase({
      canvas,
      clearColor,
      width,
      height,
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

  createProgram({
    vertexShader,
    fragmentShader,
  }: {
    vertexShader: string
    fragmentShader: string
  }): WebGlBase {
    this.vertexShader = this.createVertextShader(vertexShader)
    this.fragmentShader = this.createFragmentShader(fragmentShader)

    if (!this.vertexShader) {
      throw new Error('vertex shader is not created')
    }

    if (!this.fragmentShader) {
      throw new Error('fragment shader is not created')
    }

    this.program = this.context.createProgram()

    this.context.attachShader(this.program, this.vertexShader)
    this.context.attachShader(this.program, this.fragmentShader)

    this.context.linkProgram(this.program)

    if (
      !this.context.getProgramParameter(this.program, this.context.LINK_STATUS)
    ) {
      throw new Error('can not link program')
    }

    this.context.useProgram(this.program)

    this.uniform = UniformManager.create(this)
    this.attr = AttributeManager.create(this)

    return this
  }

  drawArrays({
    mode,
    first = 0,
    count = 3,
    addHistory = true,
  }: {
    mode: DrawMode
    first?: GLint
    count?: GLsizei
    addHistory?: boolean
  }): WebGlBase {
    this.context.drawArrays(this.context[mode], first, count)

    if (addHistory) {
      this.drawHistory.push({
        method: 'Arrays',
        mode,
        first,
        count,
      })
    }

    return this
  }

  drawElements({
    mode,
    count,
    type,
    offset = 0,
    addHistory = true,
  }: {
    mode: DrawMode
    count: GLsizei
    type: DrawType
    offset: GLintptr
    addHistory?: boolean
  }): WebGlBase {
    this.context.drawElements(
      this.context[mode],
      count,
      this.context[type],
      offset
    )

    if (addHistory) {
      this.drawHistory.push({
        method: 'Elements',
        mode,
        count,
        type,
        offset,
      })
    }

    return this
  }

  drawUpdate(): this {
    this.drawHistory.forEach((item) => {
      if (item.method === 'Elements') {
        this.drawElements({
          mode: item.mode,
          count: item.count,
          type: item.type,
          offset: item.offset,
          addHistory: false,
        })
      } else if (item.method === 'Arrays') {
        this.drawArrays({
          mode: item.mode,
          first: item.first,
          count: item.count,
          addHistory: false,
        })
      }
    })

    return this
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

  bindBufferByData(data: BufferSource): WebGlBase {
    const vbo = this.createVbo(data)
    this.context.bindBuffer(this.context.ARRAY_BUFFER, vbo)

    return this
  }

  private createVbo(data: BufferSource): WebGLBuffer {
    const vbo = this.context.createBuffer()
    this.context.bindBuffer(this.context.ARRAY_BUFFER, vbo)
    this.context.bufferData(
      this.context.ARRAY_BUFFER,
      data,
      this.context.STATIC_DRAW
    )
    this.context.bindBuffer(this.context.ARRAY_BUFFER, null)

    return vbo
  }

  private getTextureIndex(name: string): number {
    return this.textureIndexMap.get(name) || this.textureIndex++
  }
}
