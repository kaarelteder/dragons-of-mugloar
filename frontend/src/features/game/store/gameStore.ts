import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { GameState, SolveResult, BuyResult } from '@/shared/types'

export const GAME_CONFIG = {
  MAX_LIVES: 3,
  SCORE_TARGET: 1000,
}

export const useGameStore = defineStore(
  'game',
  () => {
    const gameId = ref<string | null>(null)
    const lives = ref(0)
    const gold = ref(0)
    const level = ref(1)
    const score = ref(0)
    const highScore = ref(0)
    const turn = ref(0)
    const isActive = ref(false)

    const isAlive = computed(() => lives.value > 0)
    const canAfford = (cost: number) => gold.value >= cost

    const startGame = (response: GameState): void => {
      gameId.value = response.gameId
      lives.value = response.lives
      gold.value = response.gold
      level.value = response.level
      score.value = response.score
      highScore.value = response.highScore
      turn.value = response.turn
      isActive.value = true
    }

    const applyResult = (result: SolveResult): void => {
      lives.value = result.lives
      gold.value = result.gold
      score.value = result.score
      highScore.value = result.highScore
      turn.value = result.turn
      if (result.lives <= 0) {
        isActive.value = false
      }
    }

    const applyBuy = (result: BuyResult): void => {
      gold.value = result.gold
      lives.value = result.lives
      level.value = result.level
      turn.value = result.turn
    }

    const reset = (): void => {
      gameId.value = null
      lives.value = 0
      gold.value = 0
      level.value = 1
      score.value = 0
      highScore.value = 0
      turn.value = 0
      isActive.value = false
    }

    return {
      gameId,
      lives,
      gold,
      level,
      score,
      highScore,
      turn,
      isActive,
      isAlive,
      canAfford,
      startGame,
      applyResult,
      applyBuy,
      reset,
    }
  },
  {
    persist: {
      key: 'dom-game',
      storage: localStorage,
    },
  }
)
