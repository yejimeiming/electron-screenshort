import { TextData, TextEditData } from './types'
import type { HistoryItemSource, Point } from '../../types'

export const sizes: Record<number, number> = {
  3: 18,
  6: 32,
  9: 46
}

export function draw(
  ctx: CanvasRenderingContext2D,
  action: HistoryItemSource<TextData, TextEditData>
) {
  const { size, color, fontFamily, x, y, text } = action.data
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = `${size}px ${fontFamily}`

  const distance = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  text.split('\n').forEach((item, index) => {
    ctx.fillText(item, x + distance.x, y + distance.y + index * size)
  })
}

export function isHit(
  ctx: CanvasRenderingContext2D,
  action: HistoryItemSource<TextData, TextEditData>,
  point: Point
) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = `${action.data.size}px ${action.data.fontFamily}`

  let width = 0
  let height = 0

  action.data.text.split('\n').forEach((item) => {
    const measured = ctx.measureText(item)
    if (width < measured.width) {
      width = measured.width
    }
    height += action.data.size
  })

  const { x, y } = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  const left = action.data.x + x
  const top = action.data.y + y
  const right = left + width
  const bottom = top + height

  return (
    point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
  )
}
