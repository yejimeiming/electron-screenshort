import { reactive } from 'vue'

export interface ScreenshotStore {
  /** dataURL 格式图片 */
  url: string
  width: number
  height: number
  image: HTMLImageElement
  canvasContext?: CanvasRenderingContext2D
  history: IHistory
  bounds?: Bounds
  cursor?: 'move' | string
  operation?: string
  emiter?: Emiter
}

const screenshotStore = reactive<ScreenshotStore>({
  // 下面的值在 index.ts 中调用 initStore 初始化
  url: '',
  width: -1,
  height: -1,
  image: {} as any,

  history: {
    index: -1,
    stack: [],
  },
})

export function useStore() {
  const store = { ...screenshotStore }

  for (const key of Object.keys(screenshotStore)) {
    // 包装的目的在于可以在 get/set 中做一些级联操作
    Object.defineProperty(store, key, {
      get() {
        return screenshotStore[key]
      },
      set(val: any) {
        screenshotStore[key] = val
      },
    })
  }

  return store
}

export function initStore(store: Partial<ScreenshotStore>) {
  Object.assign(screenshotStore, store)
}
