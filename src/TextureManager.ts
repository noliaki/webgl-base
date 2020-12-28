import { WebGlBase } from './webgl-base'

type TextureData = {
  location: WebGLUniformLocation
  index: number
}

export class TextureManager {
  private textureMap: Map<string, TextureData> = new Map<string, TextureData>()
  private textureIndexMap: Map<string, number> = new Map<string, number>()
  private textureIndex = 0

  private readonly context: WebGLRenderingContext
  private readonly base: WebGlBase
  private program: WebGLProgram

  private constructor(base: WebGlBase) {
    this.base = base
    this.context = base.context
  }

  public static createTextureManager(base: WebGlBase): TextureManager {
    return new TextureManager(base)
  }

  setProgram(program: WebGLProgram): WebGlBase {
    this.program = program

    return this.base
  }

  register({
    name,
    texture,
  }: {
    name: string
    texurte: TexImageSource
  }): WebGlBase {
    const createdTex = this.context.createTexture()
  }

  private getIndex(name: string): number {
    return this.textureIndexMap.get(name) || this.textureIndex++
  }
}
