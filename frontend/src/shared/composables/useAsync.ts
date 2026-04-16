import { ref } from 'vue'

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'An unexpected error occurred'
}

export const useAsync = <T>() => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (fn: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (err: unknown) {
      error.value = toErrorMessage(err)
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, execute }
}
