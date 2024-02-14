export interface ArrowData {
  size: number
  color: string
  x1: number
  x2: number
  y1: number
  y2: number
}

export enum ArrowEditType {
  Move,
  MoveStart,
  MoveEnd,
}

export interface ArrowEditData {
  type: ArrowEditType
  x1: number
  x2: number
  y1: number
  y2: number
}
