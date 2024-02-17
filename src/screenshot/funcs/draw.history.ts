import { HistoryItemType } from '../enums'
import type { DrawHistory, HistoryItem } from '../types'

export type DrawHistoryListener = (history: DrawHistory) => void

/** 所有绘制基于 `DHistory` ！！！ */
export class DHistory {
  /** 操作历史 */
  private static _history: DrawHistory = DHistory.initHistory()
  private static listeners: DrawHistoryListener[] = []

  private static initHistory() {
    return {
      index: -1,
      stack: [],
    }
  }

  static listen(listener: DrawHistoryListener) {
    DHistory.listeners.push(listener)

    // unlisten
    return () => {
      DHistory.listeners = DHistory.listeners.filter(fn => fn !== listener)
    }
  }

  // ------- 以下移植 hooks/useHistory.ts -------

  static get history() {
    const history = DHistory._history
    return {
      index: history.index,
      stack: history.stack,
      top: history.stack.slice(history.index, history.index + 1)[0]
    }
  }

  static push<S, E>(action: HistoryItem<S, E>) {
    const { index, stack } = DHistory._history

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

    DHistory.set({
      index: stack.length - 1,
      stack
    })
  }

  static pop() {
    const { stack } = DHistory._history

    stack.pop()

    DHistory.set({
      index: stack.length - 1,
      stack
    })
  }

  static undo() {
    const { index, stack } = DHistory._history

    const item = stack[index]

    if (item) {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      } else if (item.type === HistoryItemType.Edit) {
        item.source.editHistory.pop()
      }
    }

    DHistory.set({
      index: index <= 0 ? -1 : index - 1,
      stack
    })
  }

  static redo() {
    const { index, stack } = DHistory._history

    const item = stack[index + 1]

    if (item) {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      } else if (item.type === HistoryItemType.Edit) {
        item.source.editHistory.push(item)
      }
    }

    DHistory.set({
      index: index >= stack.length - 1 ? stack.length - 1 : index + 1,
      stack
    })
  }

  static set(history: DrawHistory) {
    DHistory._history = history

    for (const listener of DHistory.listeners) {
      // 监听分发
      listener(DHistory._history)
    }
  }

  static select<S, E>(action: HistoryItem<S, E>) {
    DHistory._history.stack.forEach(item => {
      if (item.type === HistoryItemType.Source) {
        if (item === action) {
          item.isSelected = true
        } else {
          item.isSelected = false
        }
      }
    })
    DHistory.set({ ...DHistory._history })
  }

  static clearSelect() {
    DHistory._history.stack.forEach(item => {
      if (item.type === HistoryItemType.Source) {
        item.isSelected = false
      }
    })

    DHistory.set({ ...DHistory._history })
  }

  static reset() {
    DHistory.set(DHistory.initHistory())
  }
}
