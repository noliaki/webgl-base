export function loadImage(
  src: string
): Promise<HTMLImageElement | HTMLCanvasElement> {
  return new Promise((resolve, reject): void => {
    const img: HTMLImageElement = new window.Image()

    img.addEventListener(
      'error',
      (event: ErrorEvent): void => reject(event.message),
      {
        once: true,
        passive: true,
      }
    )

    img.addEventListener(
      'load',
      (_event: Event): void => {
        const width = img.naturalWidth
        const height = img.naturalHeight

        const textureSize = getTextureSize(width, height)

        img.width = textureSize
        img.height = textureSize

        console.log(img)

        if (width !== height || width !== textureSize) {
          const canvas: HTMLCanvasElement = document.createElement('canvas')
          canvas.width = textureSize
          canvas.height = textureSize
          ;(canvas.getContext('2d') as CanvasRenderingContext2D).drawImage(
            img,
            0,
            0,
            width,
            height,
            0,
            0,
            textureSize,
            textureSize
          )

          resolve(canvas)
          return
        }

        resolve(img)
      },
      {
        once: true,
        passive: true,
      }
    )

    img.src = src
  })
}

export function getTextureSize(width: number, height: number): number {
  return Math.pow(2, (Math.log(Math.min(width, height)) / Math.LN2) | 0)
}
