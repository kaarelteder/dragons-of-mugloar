import { useGameStore } from '@/features/game/store/gameStore'
import { useHistoryStore } from '@/features/history/store/historyStore'
import * as gameApi from '@/features/game/api/gameApi'
import { useAsync } from '@/shared/composables/useAsync'
import { computed, ref } from 'vue'
import type { GameState, SolveResult } from '@/shared/types'

export const useGame = () => {
  const gameStore = useGameStore()
  const historyStore = useHistoryStore()
  const { loading: startLoading, error: startError, execute: executeStart } = useAsync<GameState>()
  const {
    loading: solveLoading,
    error: solveError,
    execute: executeSolve,
  } = useAsync<SolveResult>()
  const loading = computed(() => startLoading.value || solveLoading.value)
  const error = computed(() => startError.value ?? solveError.value)
  const showGameOver = ref(false)

  const startGame = async (): Promise<GameState | null> => {
    const result = await executeStart(() => gameApi.startGame())
    if (result) {
      gameStore.startGame(result)
      showGameOver.value = false
    }
    return result
  }

  const solveAd = async (adId: string): Promise<{ success: boolean; message?: string } | null> => {
    const { gameId } = gameStore
    if (!gameId) return null

    const result = await executeSolve(() => gameApi.solveAd(gameId, adId))
    if (result) {
      const wasAlive = gameStore.isActive && gameStore.lives > 0
      gameStore.applyResult(result)

      if (wasAlive && result.lives <= 0 && !showGameOver.value) {
        historyStore.addRecord({
          gameId,
          lives: result.lives,
          level: gameStore.level,
          score: result.score,
          turn: result.turn,
        })
        showGameOver.value = true
      }
    }

    return result
  }

  const dismissGameOver = (): void => {
    showGameOver.value = false
    gameStore.reset()
  }

  return {
    loading,
    error,
    showGameOver,
    startGame,
    solveAd,
    dismissGameOver,
  }
}
