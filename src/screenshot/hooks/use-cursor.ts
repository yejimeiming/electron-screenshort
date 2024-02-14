import { useStore } from '../store'

export interface CursorDispatcher {
  set: (cursor: string) => void
  reset: () => void
}

export type CursorValueDispatcher = [string | undefined, CursorDispatcher]

export function useCursor(): CursorValueDispatcher {
  const store = useStore()

  const set = (cursor: string) => {
    store.cursor = cursor
  }

  const reset = () => {
    store.cursor = 'move'
  }

  return [
    store.cursor,
    { set, reset }
  ]
}
