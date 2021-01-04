export class AttributeManager {
  private readonly context: WebGLRenderingContext
  private readonly program: WebGLProgram

  private constructor(context: WebGLRenderingContext, program: WebGLProgram) {
    this.context = context
    this.program = program
  }

  static create(
    context: WebGLRenderingContext,
    program: WebGLProgram
  ): AttributeManager {
    return new AttributeManager(context, program)
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
  }): this {
    this.context.vertexAttribPointer(
      this.getLocationByName(name),
      size,
      type,
      normalized,
      stride,
      offset
    )

    this.enableByName(name)

    return this
  }

  enableByName(name: string): this {
    this.context.enableVertexAttribArray(this.getLocationByName(name))

    return this
  }

  getLocationByName(name: string): number {
    return getAttrLocation({
      context: this.context,
      program: this.program,
      name,
    })
  }
}

export function getAttrLocation({
  context,
  program,
  name,
}: {
  context: WebGLRenderingContext
  program: WebGLProgram
  name: string
}): number {
  return context.getAttribLocation(program, name)
}
