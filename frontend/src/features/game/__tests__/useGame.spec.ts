import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/features/game/store/gameStore'

vi.mock('@/features/game/api/gameApi', () => ({
  startGame: vi.fn(),
  solveAd: vi.fn(),
}))

vi.mock('@/features/history/store/historyStore', () => ({
  useHistoryStore: () => ({
    addRecord: vi.fn(),
  }),
}))

import * as gameApi from '@/features/game/api/gameApi'
import { useGame } from '@/features/game/composables/useGame'

const mockGameState = {
  gameId: 'test-123',
  lives: 3,
  gold: 0,
  level: 1,
  score: 0,
  highScore: 0,
  turn: 0,
}

describe('useGame', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('startGame calls api and updates store', async () => {
    vi.mocked(gameApi.startGame).mockResolvedValue(mockGameState)

    const { startGame } = useGame()
    const result = await startGame()

    expect(gameApi.startGame).toHaveBeenCalledOnce()
    expect(result).toEqual(mockGameState)

    const store = useGameStore()
    expect(store.gameId).toBe('test-123')
    expect(store.lives).toBe(3)
    expect(store.isActive).toBe(true)
  })

  it('startGame sets error state on failure', async () => {
    vi.mocked(gameApi.startGame).mockRejectedValue(new Error('API error'))

    const { startGame, error } = useGame()
    const result = await startGame()

    expect(result).toBeNull()
    expect(error.value).toBe('API error')
  })

  it('solveAd calls api with decoded id and updates store', async () => {
    vi.mocked(gameApi.startGame).mockResolvedValue(mockGameState)
    vi.mocked(gameApi.solveAd).mockResolvedValue({
      success: true,
      lives: 3,
      gold: 50,
      score: 100,
      highScore: 100,
      turn: 1,
      message: 'Success!',
    })

    const { startGame, solveAd } = useGame()
    await startGame()
    const result = await solveAd('decoded-ad-id')

    expect(gameApi.solveAd).toHaveBeenCalledWith('test-123', 'decoded-ad-id')
    expect(result?.success).toBe(true)

    const store = useGameStore()
    expect(store.score).toBe(100)
    expect(store.gold).toBe(50)
  })

  it('solveAd returns null and sets error when API fails', async () => {
    vi.mocked(gameApi.startGame).mockResolvedValue(mockGameState)
    vi.mocked(gameApi.solveAd).mockRejectedValue(new Error('API error'))

    const { startGame, solveAd, error } = useGame()
    await startGame()
    const result = await solveAd('some-ad-id')

    expect(result).toBeNull()
    expect(error.value).toBe('API error')
  })

  it('solveAd shows game over when lives reach 0', async () => {
    vi.mocked(gameApi.startGame).mockResolvedValue(mockGameState)
    vi.mocked(gameApi.solveAd).mockResolvedValue({
      success: false,
      lives: 0,
      gold: 0,
      score: 0,
      highScore: 0,
      turn: 1,
    })

    const { startGame, solveAd, showGameOver } = useGame()
    await startGame()

    expect(showGameOver.value).toBe(false)
    await solveAd('some-ad-id')
    expect(showGameOver.value).toBe(true)
  })
})
