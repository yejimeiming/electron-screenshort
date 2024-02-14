import { useStore } from '../store'

export function useCanvasContextRef() {
  const store = useStore()

  return store.canvasContext
}
