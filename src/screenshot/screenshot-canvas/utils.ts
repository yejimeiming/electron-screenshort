import { HistoryItemType } from '../enums'
import type { Bounds, DrawHistory } from '../types'

/** 点击到已经绘制的线条上 */
export function isPointInDraw(
  bounds: Bounds,
  canvas: HTMLCanvasElement | null,
  history: DrawHistory,
  e: MouseEvent
) {
  if (!canvas) {
    return false
  }

  const $canvas = document.createElement('canvas')
  $canvas.width = bounds.width
  $canvas.height = bounds.height
  const ctx = $canvas.getContext('2d')

  if (!ctx) {
    return false
  }

  const { left, top } = canvas.getBoundingClientRect()
  const x = e.clientX - left
  const y = e.clientY - top

  const stack = [...history.stack.slice(0, history.index + 1)]

  return stack.reverse().find(item => {
    if (item.type !== HistoryItemType.Source) {
      return false
    }
    ctx.clearRect(0, 0, bounds.width, bounds.height)
    return item.isHit?.(ctx, item, { x, y })
  })
}
