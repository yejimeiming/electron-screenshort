import type { MosaicData } from './types'
import type { HistoryItemSource } from '../../types'

export function getColor(x: number, y: number, imageData: ImageData): number[] {
  if (!imageData) {
    return [0, 0, 0, 0]
  }
  const { data, width } = imageData

  const index = y * width * 4 + x * 4

  return Array.from(data.slice(index, index + 4))
}

export function draw(ctx: CanvasRenderingContext2D, action: HistoryItemSource<MosaicData, null>) {
  const { tiles, size } = action.data
  tiles.forEach(tile => {
    const r = Math.round(tile.color[0])
    const g = Math.round(tile.color[1])
    const b = Math.round(tile.color[2])
    const a = tile.color[3] / 255

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
    ctx.fillRect(tile.x - size / 2, tile.y - size / 2, size, size)
  })
}
