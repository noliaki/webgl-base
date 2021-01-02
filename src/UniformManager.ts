import { WebGlBase } from './webgl-base'

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
  private readonly base: WebGlBase
  private readonly context: WebGLRenderingContext
  private readonly program: WebGLProgram
  private uniformMap: Map<string, UniformData> = new Map<string, UniformData>()

  private constructor(base: WebGlBase) {
    this.base = base
    this.context = base.context
    this.program = base.program
  }

  static create(base: WebGlBase): UniformManager {
    return new UniformManager(base)
  }

  register({ name, value, type }: UniformArgs): WebGlBase {
    const location: WebGLUniformLocation = this.getLocation({ name })

    if (!this.uniformMap.has(name)) {
      this.uniformMap.set(name, {
        location,
        type,
      })
    }

    return this.set({ location, value, type })
  }

  update({ name, value }: { name: string; value: UniformValue }): WebGlBase {
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
  }: UniformData & { value: UniformValue }): WebGlBase {
    if (type.startsWith('Matrix')) {
      this.context[`uniform${type}`](location, false, value)
    } else if (type.endsWith('v') && typeof value !== 'number') {
      this.context[`uniform${type}`](location, ...value)
    } else {
      this.context[`uniform${type}`](location, value)
    }

    return this.base
  }

  private getLocation({
    name,
    program = this.program,
  }: {
    name: string
    program?: WebGLProgram
  }): WebGLUniformLocation {
    if (program === null) {
      throw new Error('program is not created')
    }

    return this.context.getUniformLocation(program, name)
  }
}
