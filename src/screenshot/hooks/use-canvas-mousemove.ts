import { useEmiter } from '../hooks/use-emiter'

export function useCanvasMousemove(onMousemove: (e: MouseEvent) => unknown) {
  const emiter = useEmiter()

  emiter.on('mousemove', onMousemove)

  return () => {
    emiter.off('mousemove', onMousemove)
  }
}
