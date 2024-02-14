import { useCursor } from './useCursor'
import { useEmiter } from './useEmiter'
import { useHistory } from './useHistory'
import { useOperation } from './useOperation'
import { useStore } from '../store'

export type ResetDispatcher = () => void

export function useReset(): ResetDispatcher {
  const emiter = useEmiter()
  const store = useStore()
  const [, cursorDispatcher] = useCursor()
  const [, historyDispatcher] = useHistory()
  const [, operatioDispatcher] = useOperation()

  const reset = () => {
    emiter.reset()
    historyDispatcher.reset()
    store.bounds = null
    cursorDispatcher.reset()
    operatioDispatcher.reset()
  }

  return reset
}
