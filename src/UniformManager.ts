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

type UniformData = {
  location: WebGLUniformLocation
  type: UniformType
}

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

export class UniformManager {
  private readonly context: WebGLRenderingContext
  private readonly program: WebGLProgram
  private uniformMap: Map<string, UniformData> = new Map<string, UniformData>()

  private constructor(context: WebGLRenderingContext, program: WebGLProgram) {
    this.context = context
    this.program = program
  }

  static create(
    context: WebGLRenderingContext,
    program: WebGLProgram
  ): UniformManager {
    return new UniformManager(context, program)
  }

  register({ name, value, type }: UniformArgs): this {
    const location: WebGLUniformLocation = this.getLocationByName(name)

    if (!this.uniformMap.has(name)) {
      this.uniformMap.set(name, {
        location,
        type,
      })
    }

    return this.set({
      location,
      value,
      type,
    })
  }

  update({ name, value }: { name: string; value: UniformValue }): this {
    if (!this.uniformMap.has(name)) {
      throw new Error(`\`${name}\` is not registered`)
    }

    const { location, type } = this.uniformMap.get(name)

    return this.set({
      location,
      value,
      type,
    })
  }

  private set({
    location,
    value,
    type,
  }: UniformData & { value: UniformValue }): this {
    if (type.startsWith('Matrix')) {
      this.context[`uniform${type}`](location, false, value)
    } else if (type.endsWith('v') && typeof value !== 'number') {
      this.context[`uniform${type}`](location, ...value)
    } else {
      this.context[`uniform${type}`](location, value)
    }

    return this
  }

  getLocationByName(name: string): WebGLUniformLocation {
    return getUniformLocation({
      context: this.context,
      program: this.program,
      name,
    })
  }
}

export function getUniformLocation({
  context,
  name,
  program,
}: {
  context: WebGLRenderingContext
  name: string
  program: WebGLProgram
}): WebGLUniformLocation {
  return context.getUniformLocation(program, name)
}
