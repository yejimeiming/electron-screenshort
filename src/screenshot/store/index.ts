import { reactive } from 'vue'
import type {
  Bounds,
  ScreenshotStore,
} from '../types'
import { Events } from '../screenshot-canvas/events'

function getInitState(): Pick<ScreenshotStore,
  | 'bounds'
  | 'cursor'
  | 'operation'
> {
  return {
    bounds: undefined,
    cursor: 'move',
    operation: undefined,
  }
}

const store = reactive<ScreenshotStore>({
  ...getInitState(),
  // 下面的值在 screenshot.vue 中调用 initStore 初始化
  url: '',
  width: -1,
  height: -1,
  image: null as any,
})

export function useStore() {

  return {
    // ---- get item ----
    get url() { return store.url },
    get width() { return store.width },
    get height() { return store.height },
    get image() { return store.image },
    get bounds() { return store.bounds },
    get boundsDrawn() { return store.boundsDrawn },
    get cursor() { return store.cursor },
    get operation() { return store.operation },
    get clientX() { return store.clientX },
    get clientY() { return store.clientY },

    // ---- set item ----
    setUrl(url: string) { store.url = url },
    setWidth(width: number) { store.width = width },
    setHeight(height: number) { store.height = height },
    setImage(image: HTMLImageElement) { store.image = image },
    setBounds(bounds: Bounds) { store.bounds = bounds },
    setBoundsDrawn(boundsDrawn: boolean) { store.boundsDrawn = boundsDrawn },
    setCursor(cursor: ScreenshotStore['cursor']) { store.cursor = cursor },
    setOperation(operation: ScreenshotStore['operation']) { store.operation = operation },
    setClientX(clientX: number) { store.clientX = clientX },
    setClientY(clientY: number) { store.clientY = clientY },

    // ---- extensions ----
    getInitState,
    reset(opts: {
      /** @default true */
      eventsRemoveAll?: boolean
    } = {}) {
      Object.assign(store, getInitState())
      if (opts.eventsRemoveAll !== false) {
        Events.removeAll()
      }
    },
    /** @init 应该只初始化一次 */
    set(s: Partial<ScreenshotStore>) {
      Object.assign(store, s)
    },
  }
}
