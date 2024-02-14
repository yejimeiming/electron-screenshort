import { useEmiter } from '../hooks/useEmiter'

export function useCanvasMouseup(onMouseup: (e: MouseEvent) => unknown) {
  const emiter = useEmiter()

  emiter.on('mouseup', onMouseup)

  return () => {
    emiter.off('mouseup', onMouseup)
  }
}
