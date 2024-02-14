export interface RectangleData {
  size: number
  color: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface RectangleEditData {
  type: RectangleEditType
  x1: number
  y1: number
  x2: number
  y2: number
}

export enum RectangleEditType {
  Move,
  ResizeTop,
  ResizeRightTop,
  ResizeRight,
  ResizeRightBottom,
  ResizeBottom,
  ResizeLeftBottom,
  ResizeLeft,
  ResizeLeftTop,
}
