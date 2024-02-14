import type { Ref } from 'vue'
import type { HistoryItemType } from './enums'

declare global {
  interface ScreenshotProps {
    onOk: (blob: Blob, bounds: Bounds) => void
    onCancel: () => void
    [key: string]: any
  }

  type ScreenshotStoreKey = keyof ScreenshotStore

  type CanvasContextRef = Ref<CanvasRenderingContext2D | null>

  type EmiterListener = (...args: any) => unknown

  type Emiter = Record<string, EmiterListener[]>

  interface Point {
    x: number
    y: number
  }

  interface HistoryItemEdit<E, S> {
    type: HistoryItemType.Edit
    data: E
    source: HistoryItemSource<S, E>
  }

  interface HistoryItemSource<S, E> {
    name: string
    type: HistoryItemType.Source
    data: S
    isSelected?: boolean
    editHistory: HistoryItemEdit<E, S>[]
    draw: (ctx: CanvasRenderingContext2D, action: HistoryItemSource<S, E>) => void
    isHit?: (ctx: CanvasRenderingContext2D, action: HistoryItemSource<S, E>, point: Point) => boolean
  }

  type HistoryItem<S, E> = HistoryItemEdit<E, S> | HistoryItemSource<S, E>

  interface IHistory {
    index: number
    stack: HistoryItem<any, any>[]
  }

  interface Bounds {
    x: number
    y: number
    width: number
    height: number
  }

  type Position = Point
}
