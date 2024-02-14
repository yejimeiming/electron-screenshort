import { HistoryItemType } from '../enums'
import { useStore } from '../store'

export interface HistoryValue extends IHistory {
  top?: HistoryItem<unknown, unknown>
}

export interface HistoryDispatcher {
  push: <S, E>(action: HistoryItem<S, E>) => void
  pop: () => void
  undo: () => void
  redo: () => void
  set: (history: IHistory) => void
  select: <S, E>(action: HistoryItem<S, E>) => void
  clearSelect: () => void
  reset: () => void
}

export type HistoryValueDispatcher = [HistoryValue, HistoryDispatcher]

export function useHistory(): HistoryValueDispatcher {
  const store = useStore()

  const push = <S, E>(action: HistoryItem<S, E>) => {
    const { index, stack } = store.history

    stack.forEach(item => {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      }
    })

    if (action.type === HistoryItemType.Source) {
      action.isSelected = true
    } else if (action.type === HistoryItemType.Edit) {
      action.source.isSelected = true
    }

    stack.splice(index + 1)
    stack.push(action)
    store.history = { index: stack.length - 1, stack }
  }

  const pop = () => {
    const { stack } = store.history

    stack.pop()
    store.history = { index: stack.length - 1, stack }
  }

  const undo = () => {
    const { index, stack } = store.history

    const item = stack[index]

    if (item) {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      } else if (item.type === HistoryItemType.Edit) {
        item.source.editHistory.pop()
      }
    }

    store.history = { index: index <= 0 ? -1 : index - 1, stack }
  }

  const redo = () => {
    const { index, stack } = store.history

    const item = stack[index + 1]

    if (item) {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      } else if (item.type === HistoryItemType.Edit) {
        item.source.editHistory.push(item)
      }
    }

    store.history = {
      index: index >= stack.length - 1 ? stack.length - 1 : index + 1,
      stack,
    }
  }

  const set = (history: IHistory) => {
    store.history = { ...history }
  }

  const select = <S, E>(action: HistoryItem<S, E>) => {
    store.history.stack.forEach(item => {
      if (item.type === HistoryItemType.Source) {
        if (item === action) {
          item.isSelected = true
        } else {
          item.isSelected = false
        }
      }
    })

    // TODO: use main instead forEach
    store.history = { ...store.history }
  }

  const clearSelect = () => {
    store.history.stack.forEach(item => {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      }
    })

    // TODO: use main instead forEach
    store.history = { ...store.history }
  }

  const reset = () => {
    store.history = { index: -1, stack: [] }
  }

  return [
    {
      index: store.history.index,
      stack: store.history.stack,
      top: store.history.stack.slice(store.history.index, store.history.index + 1)[0]
    },
    {
      push,
      pop,
      undo,
      redo,
      set,
      select,
      clearSelect,
      reset,
    },
  ]
}
