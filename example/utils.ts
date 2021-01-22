export function debounce(
  fn: (...args: any) => void,
  interval: number
): (...args: any) => void {
  let timer: number

  return (...args: any): void => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout((): void => {
      fn(...args)
    }, interval)
  }
}
