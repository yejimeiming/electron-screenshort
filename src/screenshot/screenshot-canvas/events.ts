export type ListenerName =
  | 'drawselect'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'

export type ListenerCallback = (event: MouseEvent, ...args: any[]) => void

export interface Listener {
  name: ListenerName
  callback: ListenerCallback
}

/** `screenshot-canvas/index.vue` 与 `operations` 中组件的事件分发中心，用于二次绘制 */
export class Events {
  private static listeners: Listener[] = []

  static on(name: ListenerName, callback: ListenerCallback) {
    Events.listeners.push({ name, callback })
    return () => Events.remove(name, callback)
  }

  static once(name: ListenerName, callback: ListenerCallback) {
    const callback2 = function callback2(...args: any[]) {
      callback.call(this, ...args)
      Events.remove(name, callback2)
    }
    Events.on(name, callback2)
  }

  static remove(name: ListenerName, callback: ListenerCallback) {
    Events.listeners = Events
      .listeners
      .filter(item => !(item.name === name && item.callback === callback))
  }

  static removeAll() {
    Events.listeners.length = 0
  }

  static emit(name: ListenerName, event: MouseEvent, ...args: any[]) {
    for (const item of Events.listeners) {
      if (item.name === name) {
        item.callback(event, ...args)
      }
    }
  }
}
