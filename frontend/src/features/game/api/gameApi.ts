import { apiClient } from '@/shared/api/client'
import { GameStateSchema, SolveResultSchema } from '@/shared/types'
import type { GameState, SolveResult } from '@/shared/types'

export const startGame = async (): Promise<GameState> => {
  const response = await apiClient.post('/game/start')
  return GameStateSchema.parse(response.data)
}

export const solveAd = async (gameId: string, adId: string): Promise<SolveResult> => {
  const response = await apiClient.post(`/${gameId}/solve/${adId}`)
  return SolveResultSchema.parse(response.data)
}
