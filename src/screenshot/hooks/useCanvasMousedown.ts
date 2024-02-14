import { useEmiter } from '../hooks/useEmiter'

export function useCanvasMousedown(onMousedown: (e: MouseEvent) => unknown) {
  const emiter = useEmiter()

  emiter.on('mousedown', onMousedown)

  return () => {
    emiter.off('mousedown', onMousedown)
  }
}
