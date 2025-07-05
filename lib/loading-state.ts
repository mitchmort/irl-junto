import { useState, useCallback } from 'react'

// Loading state types
export interface LoadingState {
  isLoading: boolean
  error: string | null
  data: any | null
}

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Generic loading hook
export const useAsyncState = <T>(initialData: T | null = null): AsyncState<T> & {
  setData: (data: T | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
} => {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
  }, [initialData])

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    reset
  }
}

// Loading wrapper for async operations
export const useAsyncOperation = <T>() => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (
    asyncFn: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFn()
      setState({ data: result, loading: false, error: null })
      onSuccess?.(result)
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      onError?.(errorMessage)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// Multiple loading states manager
export const useMultipleAsyncState = () => {
  const [states, setStates] = useState<Record<string, LoadingState>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], isLoading: loading }
    }))
  }, [])

  const setError = useCallback((key: string, error: string | null) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], error, isLoading: false }
    }))
  }, [])

  const setData = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], data, isLoading: false, error: null }
    }))
  }, [])

  const getState = useCallback((key: string): LoadingState => {
    return states[key] || { isLoading: false, error: null, data: null }
  }, [states])

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: { isLoading: false, error: null, data: null }
      }))
    } else {
      setStates({})
    }
  }, [])

  const isAnyLoading = Object.values(states).some(state => state.isLoading)

  return {
    states,
    setLoading,
    setError,
    setData,
    getState,
    reset,
    isAnyLoading
  }
}

// Debounced loading state
export const useDebouncedLoading = (delay: number = 300) => {
  const [loading, setLoading] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    setLoading(true)
  }, [timeoutId])

  const stopLoading = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    const id = setTimeout(() => {
      setLoading(false)
    }, delay)
    
    setTimeoutId(id)
  }, [delay, timeoutId])

  const stopLoadingImmediately = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    setLoading(false)
  }, [timeoutId])

  return {
    loading,
    startLoading,
    stopLoading,
    stopLoadingImmediately
  }
} 