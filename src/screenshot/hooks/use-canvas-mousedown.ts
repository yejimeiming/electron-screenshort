import { useEmiter } from '../hooks/use-emiter'

export function useCanvasMousedown(onMousedown: (e: MouseEvent) => unknown) {
  const emiter = useEmiter()

  emiter.on('mousedown', onMousedown)

  return () => {
    emiter.off('mousedown', onMousedown)
  }
}
