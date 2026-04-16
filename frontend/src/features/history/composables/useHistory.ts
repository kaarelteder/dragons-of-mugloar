import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/features/history/store/historyStore'
import { computed } from 'vue'

export const historyDateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const useHistory = () => {
  const historyStore = useHistoryStore()
  const { sortedRecords, highScore } = storeToRefs(historyStore)

  const hasRecords = computed(() => sortedRecords.value.length > 0)

  const clearHistory = (): void => {
    historyStore.clearHistory()
  }

  const formatDate = (timestamp: number): string => {
    return historyDateFormatter.format(new Date(timestamp))
  }

  return {
    records: sortedRecords,
    highScore,
    hasRecords,
    clearHistory,
    formatDate,
  }
}
