import { useCursor } from './use-cursor'
import { useEmiter } from './use-emiter'
import { useHistory } from './use-history'
import { useOperation } from './use-operation'
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
