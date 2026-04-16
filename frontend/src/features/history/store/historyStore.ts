import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameRecord, GameOverSnapshot } from '@/shared/types'

const createRecordFromSnapshot = (snapshot: GameOverSnapshot): GameRecord => {
  return {
    gameId: snapshot.gameId,
    score: snapshot.score,
    lives: snapshot.lives,
    level: snapshot.level,
    turn: snapshot.turn,
    timestamp: Date.now(),
  }
}

export const useHistoryStore = defineStore(
  'history',
  () => {
    const records = ref<GameRecord[]>([])

    const highScore = computed(() =>
      records.value.reduce((maxScore, record) => Math.max(maxScore, record.score), 0)
    )

    const sortedRecords = computed(() =>
      [...records.value].sort((a, b) => b.timestamp - a.timestamp)
    )

    const addRecord = (snapshot: GameOverSnapshot): void => {
      const record = createRecordFromSnapshot(snapshot)
      records.value.push(record)
    }

    const clearHistory = (): void => {
      records.value = []
    }

    return {
      records,
      highScore,
      sortedRecords,
      addRecord,
      clearHistory,
    }
  },
  {
    persist: {
      key: 'dom-history',
      storage: localStorage,
    },
  }
)
