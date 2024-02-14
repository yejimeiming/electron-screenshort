import { useEmiter } from '../hooks/useEmiter'

export function useDrawSelect(
  onDrawSelect: (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => unknown
) {
  const emiter = useEmiter()

  emiter.on('drawselect', onDrawSelect)

  return () => {
    emiter.off('drawselect', onDrawSelect)
  }
}
