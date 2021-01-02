import { WebGlBase } from './webgl-base'

export class AttributeManager {
  private readonly base: WebGlBase
  private readonly context: WebGLRenderingContext
  private readonly program: WebGLProgram

  private constructor(base: WebGlBase) {
    this.base = base
    this.context = base.context
    this.program = base.program
  }

  static create(base: WebGlBase): AttributeManager {
    return new AttributeManager(base)
  }

  pointerByname({
    name,
    size,
    type = this.context.FLOAT,
    normalized = false,
    stride = 0,
    offset = 0,
  }: {
    name: string
    size: GLint
    type?: GLenum
    normalized?: GLboolean
    stride?: GLsizei
    offset?: GLintptr
  }): WebGlBase {
    this.context.vertexAttribPointer(
      this.getLocation({ name }),
      size,
      type,
      normalized,
      stride,
      offset
    )

    this.enableByName(name)

    return this.base
  }

  enableByName(name: string): WebGlBase {
    this.context.enableVertexAttribArray(this.getLocation({ name }))

    return this.base
  }

  private getLocation({
    name,
    program = this.program,
  }: {
    name: string
    program?: WebGLProgram
  }): number {
    if (program === null) {
      throw new Error('program is not created')
    }

    return this.context.getAttribLocation(program, name)
  }
}
