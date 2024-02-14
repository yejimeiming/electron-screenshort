export interface TextData {
  size: number
  color: string
  fontFamily: string
  x: number
  y: number
  text: string
}

export interface TextEditData {
  x1: number
  x2: number
  y1: number
  y2: number
}

export interface TextareaBounds {
  x: number
  y: number
  maxWidth: number
  maxHeight: number
}
