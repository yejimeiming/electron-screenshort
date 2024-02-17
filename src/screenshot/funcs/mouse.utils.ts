import type {
  Bounds,
  Point,
  ResizeOrMove,
} from '../types'

export function points2bounds(
  { x: sx, y: sy }: Point, // start point
  { x: mx, y: my }: Point, // end point
  maxWidth: number,
  maxHeight: number,
): Bounds {
  // 错位交换
  if (sx > mx) [sx, mx] = [mx, sx]
  if (sy > my) [sy, my] = [my, sy]

  // 把图形框在元素里面
  if (sx < 0) sx = 0
  if (mx > maxWidth) mx = maxWidth
  if (sy < 0) sy = 0
  if (my > maxHeight) my = maxHeight

  return {
    x: sx,
    y: sy,
    width: mx - sx,
    height: my - sy,
  }
}

export function resizeOrMoveBounds(
  { x: sx, y: sy }: Point, // start point
  { x: ex, y: ey }: Point, // end point
  maxWidth: number,
  maxHeight: number,
  bounds: Bounds,
  resizeOrMove: ResizeOrMove,
): Bounds {
  // 交换值
  if (sx > ex) [sx, ex] = [ex, sx]
  if (sy > ey) [sy, ey] = [ey, sy]

  // 把图形限制在元素里面
  if (sx < 0) {
    sx = 0
    if (resizeOrMove === 'move') {
      ex = bounds.width
    }
  }

  if (ex > maxWidth) {
    ex = maxWidth
    if (resizeOrMove === 'move') {
      sx = ex - bounds.width
    }
  }

  if (sy < 0) {
    sy = 0
    if (resizeOrMove === 'move') {
      ey = bounds.height
    }
  }

  if (ey > maxHeight) {
    ey = maxHeight
    if (resizeOrMove === 'move') {
      sy = ey - bounds.height
    }
  }

  return {
    x: sx,
    y: sy,
    width: Math.max(ex - sx, /* 最小保留 1px */1),
    height: Math.max(ey - sy, /* 最小保留 1px */1),
  }
}

export function getPointsByMouseMove(
  mousedownPoint: Point,
  mousemovePoint: Point,
  bounds: Bounds,
  resizeOrMove: ResizeOrMove,
): Point[] {
  const moveX = mousemovePoint.x - mousedownPoint.x
  const moveY = mousemovePoint.y - mousedownPoint.y
  let sx = bounds.x
  let sy = bounds.y
  let ex = bounds.x + bounds.width
  let ey = bounds.y + bounds.height

  switch (resizeOrMove) {
    case 'top':
      sy += moveY
      break
    case 'top-right':
      sy += moveY
      ex += moveX
      break
    case 'right':
      ex += moveX
      break
    case 'right-bottom':
      ex += moveX
      ey += moveY
      break
    case 'bottom':
      ey += moveY
      break
    case 'bottom-left':
      ey += moveY
      sx += moveX
      break
    case 'left':
      sx += moveX
      break
    case 'left-top':
      sx += moveX
      sy += moveY
      break
    case 'move':
      sx += moveX
      ex += moveX
      sy += moveY
      ey += moveY
      break
    default:
      break
  }

  return [
    { x: sx, y: sy }, // start point
    { x: ex, y: ey }, // end point
  ]
}
