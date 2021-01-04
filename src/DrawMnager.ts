export type DrawMode =
  | 'POINTS'
  | 'LINE_STRIP'
  | 'LINE_LOOP'
  | 'LINES'
  | 'TRIANGLE_STRIP'
  | 'TRIANGLE_FAN'
  | 'TRIANGLES'

export type DataType =
  | 'BYTE'
  | 'SHORT'
  | 'UNSIGNED_BYTE'
  | 'UNSIGNED_SHORT'
  | 'FLOAT'
  | 'HALF_FLOAT'

export type DrawType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'

export class DrawMnager {
  private readonly context: WebGLRenderingContext
  private drawHistory = []

  private constructor(context: WebGLRenderingContext) {
    this.context = context
  }

  static create(context: WebGLRenderingContext): DrawMnager {
    return new DrawMnager(context)
  }

  elements({
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
  }): this {
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

  arrays({
    mode,
    first = 0,
    count = 3,
    addHistory = true,
  }: {
    mode: DrawMode
    first?: GLint
    count?: GLsizei
    addHistory?: boolean
  }): this {
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

  update(): this {
    this.drawHistory.forEach((item) => {
      if (item.method === 'Elements') {
        this.elements({
          mode: item.mode,
          count: item.count,
          type: item.type,
          offset: item.offset,
          addHistory: false,
        })
      } else if (item.method === 'Arrays') {
        this.arrays({
          mode: item.mode,
          first: item.first,
          count: item.count,
          addHistory: false,
        })
      }
    })

    return this
  }
}
