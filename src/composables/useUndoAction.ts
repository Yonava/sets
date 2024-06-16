import { ref } from 'vue'

type UndoAction<T> = {
  state: T,
  timestamp: number,
}

const useUndoAction = <T>(initialState: T) => {
  const history = ref<UndoAction<T>[]>([{ state: initialState, timestamp: Date.now() }])
  const future = ref<UndoAction<T>[]>([])

  const addToHistory = (toAdd: T) => {
    history.value.push({
      state: JSON.parse(JSON.stringify(toAdd)),
      timestamp: Date.now(),
    })
    future.value = []
  }

  const undo = (): T | null => {
    if (history.value.length > 1) {
      const lastState = history.value.pop()
      if (lastState) {
        future.value.push({
          state: JSON.parse(JSON.stringify(lastState.state)),
          timestamp: Date.now(),
        })
      }
      return history.value[history.value.length - 1].state as T
    }
    return null
  }

  const redo = (): T | null => {
    if (future.value.length > 0) {
      const nextState = future.value.pop()
      if (nextState) {
        history.value.push({
          state: JSON.parse(JSON.stringify(nextState.state)),
          timestamp: Date.now(),
        })
        return nextState.state as T
      }
    }
    return history.value[history.value.length - 1]?.state as T || null
  }

  return {
    undo,
    redo,
    addToHistory,
  }
}

export default useUndoAction
