import { useStore } from '../store'

export interface OperationDispatcher {
  set: (operation: string) => void
  reset: () => void
}

export type OperationValueDispatcher = [
  string | undefined,
  OperationDispatcher
]

export function useOperation(): OperationValueDispatcher {
  const store = useStore()

  const set = (operation: string) => {
    store.operation = operation
  }

  const reset = () => {
    store.operation = undefined
  }

  return [
    store.operation,
    { set, reset }
  ]
}
