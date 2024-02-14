import { HistoryItemType } from '../enums'
import { useStore as getStore } from '../store'

export function getBoundsByPoints(
  { x: x1, y: y1 }: Point,
  { x: x2, y: y2 }: Point,
  bounds: Bounds,
  width: number,
  height: number,
  resizeOrMove: string
): Bounds {
  // 交换值
  if (x1 > x2) {
    [x1, x2] = [x2, x1]
  }

  if (y1 > y2) {
    [y1, y2] = [y2, y1]
  }

  // 把图形限制在元素里面
  if (x1 < 0) {
    x1 = 0
    if (resizeOrMove === 'move') {
      x2 = bounds.width
    }
  }

  if (x2 > width) {
    x2 = width
    if (resizeOrMove === 'move') {
      x1 = x2 - bounds.width
    }
  }

  if (y1 < 0) {
    y1 = 0
    if (resizeOrMove === 'move') {
      y2 = bounds.height
    }
  }

  if (y2 > height) {
    y2 = height
    if (resizeOrMove === 'move') {
      y1 = y2 - bounds.height
    }
  }

  return {
    x: x1,
    y: y1,
    width: Math.max(x2 - x1, 1),
    height: Math.max(y2 - y1, 1)
  }
}

export function getPoints(e: MouseEvent, resizeOrMove: string, point: Point, bounds: Bounds): Point[] {
  const x = e.clientX - point.x
  const y = e.clientY - point.y
  let x1 = bounds.x
  let y1 = bounds.y
  let x2 = bounds.x + bounds.width
  let y2 = bounds.y + bounds.height

  switch (resizeOrMove) {
    case 'top':
      y1 += y
      break
    case 'top-right':
      x2 += x
      y1 += y
      break
    case 'right':
      x2 += x
      break
    case 'right-bottom':
      x2 += x
      y2 += y
      break
    case 'bottom':
      y2 += y
      break
    case 'bottom-left':
      x1 += x
      y2 += y
      break
    case 'left':
      x1 += x
      break
    case 'left-top':
      x1 += x
      y1 += y
      break
    case 'move':
      x1 += x
      y1 += y
      x2 += x
      y2 += y
      break
    default:
      break
  }

  return [
    {
      x: x1,
      y: y1
    },
    {
      x: x2,
      y: y2
    }
  ]
}

export function isPointInDraw(
  bounds: Bounds,
  canvas: HTMLCanvasElement | null,
  history: History,
  e: MouseEvent
) {
  if (!canvas) {
    return false
  }

  const store = getStore()
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

  const stack = [...store.history.stack.slice(0, store.history.index + 1)]

  return stack.reverse().find(item => {
    if (item.type !== HistoryItemType.Source) {
      return false
    }
    ctx.clearRect(0, 0, bounds.width, bounds.height)
    return item.isHit?.(ctx, item, { x, y })
  })
}
