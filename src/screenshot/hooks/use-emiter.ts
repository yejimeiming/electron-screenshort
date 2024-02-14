import { useStore } from '../store'

export interface EmiterDispatcher {
  on: (event: string, listener: EmiterListener) => void
  off: (event: string, listener: EmiterListener) => void
  emit: (event: string, ...args: unknown[]) => void
  reset: () => void
}

export function useEmiter(): EmiterDispatcher {
  const store = useStore()

  const on = (event: string, listener: EmiterListener) => {
    const emiter = store.emiter
    if (Array.isArray(emiter[event])) {
      emiter[event].push(listener)
    } else {
      emiter[event] = [listener]
    }
  }
  const off = (event: string, listener: EmiterListener) => {
    const emiter = store.emiter
    if (Array.isArray(emiter[event])) {
      const index = emiter[event].findIndex(item => item === listener)
      if (index !== -1) {
        emiter[event].splice(index, 1)
      }
    }
  }

  const emit = (event: string, ...args: unknown[]) => {
    const emiter = store.emiter

    if (Array.isArray(emiter[event])) {
      emiter[event].forEach(listener => listener(...args))
    }
  }

  const reset = () => {
    store.emiter = {}
  }

  return {
    on,
    off,
    emit,
    reset,
  }
}
