import { HistoryItemType } from '../enums'
import type { Bounds, DrawHistory } from '../types'

export interface ComposeImageOpts {
  image: HTMLImageElement
  width: number
  height: number
  history: DrawHistory
  bounds: Bounds
}

export function composeImage({
  image,
  width,
  height,
  history,
  bounds,
}: ComposeImageOpts): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const $canvas = document.createElement('canvas')
    const targetWidth = bounds.width * window.devicePixelRatio
    const targetHeight = bounds.height * window.devicePixelRatio
    $canvas.width = targetWidth
    $canvas.height = targetHeight

    const ctx = $canvas.getContext('2d')
    if (!ctx) {
      return reject(new Error('convert image to blob fail'))
    }

    const rx = image.naturalWidth / width
    const ry = image.naturalHeight / height

    ctx.imageSmoothingEnabled = true
    // 设置太高，图片会模糊
    ctx.imageSmoothingQuality = 'low'
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    ctx.clearRect(0, 0, bounds.width, bounds.height)
    ctx.drawImage(
      image,
      bounds.x * rx,
      bounds.y * ry,
      bounds.width * rx,
      bounds.height * ry,
      0,
      0,
      bounds.width,
      bounds.height,
    )

    history.stack.slice(0, history.index + 1).forEach(item => {
      if (item.type === HistoryItemType.Source) {
        item.draw(ctx, item)
      }
    })

    $canvas.toBlob(blob => {
      if (!blob) {
        return reject(new Error('canvas toBlob fail'))
      }
      resolve(blob)
    }, 'image/png')
  })
}

export function resolveImage(url: string) {
  return new Promise<HTMLImageElement | null>(resolve => {
    const oImg = document.createElement('img')
    oImg.onload = () => resolve(oImg)
    oImg.onerror = () => resolve(null)
    oImg.src = url
  })
}

export function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}
