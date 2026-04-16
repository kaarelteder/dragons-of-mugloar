import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/features/game/store/gameStore'
import type { GameState, SolveResult, BuyResult } from '@/shared/types'

const mockGameState: GameState = {
  gameId: 'test-game-123',
  lives: 3,
  gold: 0,
  level: 1,
  score: 0,
  highScore: 0,
  turn: 0,
}

describe('gameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with inactive state', () => {
    const store = useGameStore()
    expect(store.gameId).toBeNull()
    expect(store.isActive).toBe(false)
    expect(store.lives).toBe(0)
  })

  it('startGame populates state correctly', () => {
    const store = useGameStore()
    store.startGame(mockGameState)

    expect(store.gameId).toBe('test-game-123')
    expect(store.lives).toBe(3)
    expect(store.gold).toBe(0)
    expect(store.level).toBe(1)
    expect(store.score).toBe(0)
    expect(store.highScore).toBe(0)
    expect(store.turn).toBe(0)
    expect(store.isActive).toBe(true)
  })

  it('applyResult updates score, lives, gold, and turn', () => {
    const store = useGameStore()
    store.startGame(mockGameState)

    const result: SolveResult = {
      success: true,
      lives: 3,
      gold: 50,
      score: 100,
      highScore: 100,
      turn: 1,
      message: 'Well done!',
    }
    store.applyResult(result)

    expect(store.lives).toBe(3)
    expect(store.gold).toBe(50)
    expect(store.score).toBe(100)
    expect(store.highScore).toBe(100)
    expect(store.turn).toBe(1)
    expect(store.isActive).toBe(true)
  })

  it('applyResult sets isActive to false when lives reach 0', () => {
    const store = useGameStore()
    store.startGame(mockGameState)

    const result: SolveResult = {
      success: false,
      lives: 0,
      gold: 0,
      score: 0,
      highScore: 0,
      turn: 2,
    }
    store.applyResult(result)

    expect(store.lives).toBe(0)
    expect(store.isActive).toBe(false)
  })

  it('applyBuy updates gold, lives, level, and turn', () => {
    const store = useGameStore()
    store.startGame(mockGameState)
    store.gold = 100

    const buyResult: BuyResult = {
      shoppingSuccess: true,
      gold: 50,
      lives: 4,
      level: 2,
      turn: 3,
    }
    store.applyBuy(buyResult)

    expect(store.gold).toBe(50)
    expect(store.lives).toBe(4)
    expect(store.level).toBe(2)
    expect(store.turn).toBe(3)
  })

  it('reset clears all state', () => {
    const store = useGameStore()
    store.startGame(mockGameState)
    store.reset()

    expect(store.gameId).toBeNull()
    expect(store.lives).toBe(0)
    expect(store.gold).toBe(0)
    expect(store.level).toBe(1)
    expect(store.score).toBe(0)
    expect(store.isActive).toBe(false)
  })

  it('isAlive getter returns true when lives > 0', () => {
    const store = useGameStore()
    store.startGame(mockGameState)
    expect(store.isAlive).toBe(true)
  })

  it('isAlive getter returns false when lives = 0', () => {
    const store = useGameStore()
    store.startGame({ ...mockGameState, lives: 0 })
    expect(store.isAlive).toBe(false)
  })

  it('canAfford returns true when gold >= cost', () => {
    const store = useGameStore()
    store.startGame({ ...mockGameState, gold: 100 })
    expect(store.canAfford(100)).toBe(true)
    expect(store.canAfford(50)).toBe(true)
  })

  it('canAfford returns false when gold < cost', () => {
    const store = useGameStore()
    store.startGame({ ...mockGameState, gold: 30 })
    expect(store.canAfford(50)).toBe(false)
  })
})
