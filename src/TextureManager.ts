import { getUniformLocation } from './UniformManager'

type TextureData = {
  location: WebGLUniformLocation
  index: number
}

export class TextureManager {
  private textureMap: Map<string, TextureData> = new Map<string, TextureData>()
  private textureIndexMap: Map<string, number> = new Map<string, number>()
  private textureIndex = 0

  private readonly context: WebGLRenderingContext
  private readonly program: WebGLProgram

  private constructor(context: WebGLRenderingContext, program: WebGLProgram) {
    this.context = context
    this.program = program
  }

  public static create(
    context: WebGLRenderingContext,
    program: WebGLProgram
  ): TextureManager {
    return new TextureManager(context, program)
  }

  register({ name, texture }: { name: string; texture: TexImageSource }): this {
    if (this.textureMap.has(name)) {
      return this.updateTexture({ name, texture })
    }

    this.context.activeTexture(this.context[`TEXTURE${this.getIndex(name)}`])

    return this.updateTexture({ name, texture })
  }

  updateTexture({
    name,
    texture,
  }: {
    name: string
    texture: TexImageSource
  }): this {
    const { location, index } = this.getTextureByName(name)

    const createdTex: WebGLTexture = this.context.createTexture()
    this.context.bindTexture(this.context.TEXTURE_2D, createdTex)
    this.context.texImage2D(
      this.context.TEXTURE_2D,
      0,
      this.context.RGBA,
      this.context.RGBA,
      this.context.UNSIGNED_BYTE,
      texture
    )
    this.context.generateMipmap(this.context.TEXTURE_2D)

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

  get maxTextureSize(): number {
    return this.context.MAX_TEXTURE_SIZE
  }

  private getTextureByName(name: string): TextureData {
    if (this.textureMap.has(name)) {
      return this.textureMap.get(name)
    }

    const o: TextureData = {
      location: getUniformLocation({
        context: this.context,
        program: this.program,
        name,
      }),
      index: this.getIndex(name),
    }

    this.textureMap.set(name, o)

    return o
  }

  private getIndex(name: string): number {
    if (this.textureIndexMap.has(name)) {
      return this.textureIndexMap.get(name)
    }

    this.textureIndexMap.set(name, this.textureIndex)

    return this.textureIndex++
  }
}
