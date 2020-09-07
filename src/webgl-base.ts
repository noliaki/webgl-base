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

export class WebGlBase {
  public canvas: HTMLCanvasElement
  public context: WebGLRenderingContext
  private clearColor: [number, number, number, number]
  private vertexShader: WebGLShader
  private fragmentShader: WebGLShader
  private program: WebGLProgram
  private uniformMap: Map<
    string,
    { location: WebGLUniformLocation; type: UniformType }
  > = new Map<string, { location: WebGLUniformLocation; type: UniformType }>()

  private textureMap: Map<
    string,
    {
      location: WebGLUniformLocation
      index: number
    }
  > = new Map<
    string,
    {
      location: WebGLUniformLocation
      index: number
    }
  >()

  private textureIndexMap: Map<string, number> = new Map<string, number>()
  private textureIndex = 0

  constructor({
    canvas,
    clearColor = [0, 0, 0, 1],
    width,
    height,
  }: ConstructorArgs) {
    this.canvas = canvas || document.createElement('canvas')
    this.context = (this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext

    this.clearColor = [...clearColor]

    this.context.enable(this.context.CULL_FACE)
    this.context.enable(this.context.DEPTH_TEST)
    this.context.depthFunc(this.context.LEQUAL)

    this.resize(width || window.innerWidth, height || window.innerHeight)
    this.clear()
  }

  clear(): WebGlBase {
    this.context.clearColor(...this.clearColor)
    this.context.clearDepth(1.0)
    this.context.clear(
      this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT
    )

    return this
  }

  resize(width: number, height: number): WebGlBase {
    this.canvas.width = width
    this.canvas.height = height
    this.context.viewport(0, 0, width, height)

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

    if (!this.program) {
      throw new Error('can not create program')
    }

    this.context.attachShader(this.program, this.vertexShader)
    this.context.attachShader(this.program, this.fragmentShader)

    this.context.linkProgram(this.program)

    if (
      !this.context.getProgramParameter(this.program, this.context.LINK_STATUS)
    ) {
      throw new Error('can not link program')
    }

    this.context.useProgram(this.program)

    return this
  }

  registerUniform({ name, value, type }: UniformArgs): WebGlBase {
    const location: WebGLUniformLocation | null = this.getUniformLocation(name)

    if (location === null) {
      throw new Error('location is not found')
    }

    this.uniformMap.set(name, {
      location,
      type,
    })

    return this.updateUniform({
      name,
      value,
    })
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    if (this.program === null) {
      throw new Error('program is not created')
    }

    return this.context.getUniformLocation(this.program, name)
  }

  updateUniform({
    name,
    value,
  }: {
    name: string
    value: UniformValue
  }): WebGlBase {
    const { location, type } = this.uniformMap.get(name)

    return this.setUniform({
      location,
      value,
      type,
    })
  }

  registerTexture({
    name,
    texture,
  }: {
    name: string
    texture: HTMLImageElement | HTMLCanvasElement
  }): WebGlBase {
    const createdTexture: WebGLTexture | null = this.context.createTexture()
    const { index } = this.getTexture(name)

    this.context.activeTexture(this.context[`TEXTURE${index}`])
    this.context.bindTexture(this.context.TEXTURE_2D, createdTexture)
    this.context.texImage2D(
      this.context.TEXTURE_2D,
      0,
      this.context.RGBA,
      this.context.RGBA,
      this.context.UNSIGNED_BYTE,
      texture
    )
    this.context.generateMipmap(this.context.TEXTURE_2D)
    this.context.bindTexture(this.context.TEXTURE_2D, null)

    return this.updateTexture(name, texture)
  }

  updateTexture(
    name: string,
    texture: HTMLImageElement | HTMLCanvasElement
  ): WebGlBase {
    const { location, index } = this.getTexture(name)

    this.context.bindTexture(this.context.TEXTURE_2D, texture)
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_MIN_FILTER,
      this.context.NEAREST
    )
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_MAG_FILTER,
      this.context.NEAREST
    )
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_WRAP_S,
      this.context.REPEAT
    )
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_WRAP_T,
      this.context.REPEAT
    )

    this.context.uniform1i(location, index)

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

  private setUniform({ location, value, type }) {
    if (/^Matrix/i.test(type)) {
      this.context[`uniform${type}`](location, false, value)
    } else if (/v$/.test(type) && typeof value !== 'number') {
      this.context[`uniform${type}`](location, ...value)
    } else {
      this.context[`uniform${type}`](location, value)
    }

    return this
  }

  private getTexture(
    name: string
  ): {
    location: WebGLUniformLocation
    index: number
  } {
    if (this.textureMap.has(name)) {
      return this.textureMap.get(name)
    }

    const o = {
      location: this.getUniformLocation(name),
      index: this.getTextureIndex(name),
    }

    this.textureMap.set(name, o)

    return o
  }

  private getTextureIndex(name: string): number {
    return this.textureIndexMap.get(name) || ++this.textureIndex
  }
}
