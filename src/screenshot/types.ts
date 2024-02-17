import type { Ref } from 'vue'
import type { HistoryItemType, ResizePoints } from './enums'

export interface ScreenshotStore {
  /** dataURL 格式图片 */
  url: string
  width: number
  height: number
  image: HTMLImageElement
  /** 画框信息 */
  bounds?: Bounds
  /** 框已画 */
  boundsDrawn?: boolean
  /** 鼠标放到画框上的样式 */
  cursor?: import('csstype').Property.Cursor
  /** 画框二次绘制类型 */
  operation?: 'Arrow' | 'Brush' | 'Ellipse' | 'Mosaic' | 'Rectangle' | 'Text'
  // 鼠标实时位置
  clientX?: number
  clientY?: number
}

export type ScreenshotStoreKey = keyof ScreenshotStore

export type CanvasContextRef = Ref<CanvasRenderingContext2D | null>

export interface Point {
  x: number
  y: number
}

export interface HistoryItemEdit<E, S> {
  type: HistoryItemType.Edit
  data: E
  source: HistoryItemSource<S, E>
}

export interface HistoryItemSource<S, E> {
  name: string
  type: HistoryItemType.Source
  data: S
  isSelected?: boolean
  editHistory: HistoryItemEdit<E, S>[]
  draw: (ctx: CanvasRenderingContext2D, action: HistoryItemSource<S, E>) => void
  isHit?: (ctx: CanvasRenderingContext2D, action: HistoryItemSource<S, E>, point: Point) => boolean
}

export type HistoryItem<S, E> = HistoryItemEdit<E, S> | HistoryItemSource<S, E>

export interface DrawHistory {
  index: number
  stack: HistoryItem<any, any>[]
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface Position extends Point { }

export type ResizeOrMove = ResizePoints | 'move'
