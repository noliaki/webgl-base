export function loadImage(
  src: string,
  maxTextureSize?: number = Math.pow(2, 10)
): Promise<{
  size: number
  textureSource: HTMLImageElement | HTMLCanvasElement
  naturalWidth: number
  naturalHeight: number
}> {
  return new Promise(
    (
      resolve: (result: {
        size: number
        textureSource: HTMLImageElement | HTMLCanvasElement
        naturalWidth: number
        naturalHeight: number
      }) => void,
      reject
    ): void => {
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

          const textureSize = Math.min(
            getTextureSize(width, height),
            getTextureSize(maxTextureSize, maxTextureSize)
          )

          img.width = textureSize
          img.height = textureSize

          const result = {
            size: textureSize,
            naturalWidth: width,
            naturalHeight: height,
          }

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

            resolve(
              Object.assign({}, result, {
                textureSource: canvas,
              })
            )
            return
          }

          resolve(
            Object.assign({}, result, {
              textureSource: img,
            })
          )
        },
        {
          once: true,
          passive: true,
        }
      )

      img.src = src
    }
  )
}

export function getTextureSize(width: number, height: number): number {
  return Math.pow(2, (Math.log(Math.min(width, height)) / Math.LN2) | 0)
}
