export type MouseEventType =
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'

export interface ListenerCallbackArgs {
  /** `mousedown.clientX` */
  startX?: number
  /** `mousedown.clientY` */
  startY?: number
  clientX: number
  clientY: number
  type: MouseEventType
  event: MouseEvent
  dataset: DOMStringMap
  /** 当鼠标按住后移动 `mousedown` 有值 */
  mousedown: null | {
    clientX: number
    clientY: number
    event: MouseEvent
    dataset: DOMStringMap
  }
}

export interface Listener {
  type: MouseEventType
  callback: (args: ListenerCallbackArgs) => void
}

export class Mouse {
  private static listeners: Listener[] = []
  private static inited = false
  private static mousedownEvent: MouseEvent | null

  private static callback(type: MouseEventType, event: MouseEvent) {
    for (const listener of Mouse.listeners) {
      if (listener.type === type) {
        listener.callback({
          startX: Mouse.mousedownEvent?.clientX,
          startY: Mouse.mousedownEvent?.clientY,
          clientX: event.clientX,
          clientY: event.clientY,
          event,
          type,
          dataset: (event.target as HTMLElement)?.dataset ?? {},
          mousedown: Mouse.mousedownEvent && {
            clientX: Mouse.mousedownEvent.clientX,
            clientY: Mouse.mousedownEvent.clientY,
            event: Mouse.mousedownEvent,
            dataset: (Mouse.mousedownEvent.target as HTMLElement)?.dataset ?? {},
          },
        })
      }
    }
  }

  private static mousedownHandle(event: MouseEvent) {
    Mouse.mousedownEvent = event
    Mouse.callback('mousedown', event)
  }

  private static mousemoveHandle(event: MouseEvent) {
    Mouse.callback('mousemove', event)
  }

  private static mouseupHandle(event: MouseEvent) {
    Mouse.mousedownEvent = null
    Mouse.callback('mouseup', event)
  }

  private static listen(type: Listener['type'], callback: Listener['callback']) {
    Mouse.init() // auto init
    Mouse.listeners.push({ type, callback })

    return () => Mouse.unlisten(type, callback) // unlisten
  }

  private static unlisten(type: Listener['type'], callback: Listener['callback']) {
    Mouse.listeners = Mouse
      .listeners
      .filter(item => !(item.type === type && item.callback === callback))
  }

  // --------------

  public static down(callback: Listener['callback']) {
    return Mouse.listen('mousedown', callback)
  }

  public static move(callback: Listener['callback']) {
    return Mouse.listen('mousemove', callback)
  }

  public static up(callback: Listener['callback']) {
    return Mouse.listen('mouseup', callback)
  }

  public static init() {
    if (Mouse.inited) return
    Mouse.inited = true

    document.addEventListener('mousedown', Mouse.mousedownHandle)
    document.addEventListener('mousemove', Mouse.mousemoveHandle)
    document.addEventListener('mouseup', Mouse.mouseupHandle)
  }

  public static stop() {
    document.removeEventListener('mousedown', Mouse.mousedownHandle)
    document.removeEventListener('mousemove', Mouse.mousemoveHandle)
    document.removeEventListener('mouseup', Mouse.mouseupHandle)
  }
}
