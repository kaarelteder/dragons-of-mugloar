import { storeToRefs } from 'pinia'
import { useGameStore } from '@/features/game/store/gameStore'

export const useHud = () => {
  const gameStore = useGameStore()
  const { lives, gold, score, highScore, turn, level } = storeToRefs(gameStore)

  return {
    lives,
    gold,
    score,
    highScore,
    turn,
    level,
  }
}
