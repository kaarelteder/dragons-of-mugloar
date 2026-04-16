import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHistoryStore } from '@/features/history/store/historyStore'
import type { GameState } from '@/shared/types'

const mockGameState: GameState = {
  gameId: 'game-abc',
  lives: 0,
  gold: 50,
  level: 2,
  score: 250,
  highScore: 250,
  turn: 15,
}

describe('historyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('starts with empty records', () => {
    const store = useHistoryStore()
    expect(store.records).toHaveLength(0)
  })

  it('addRecord adds a new record with correct fields', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    const store = useHistoryStore()
    store.addRecord(mockGameState)

    expect(store.records).toHaveLength(1)
    const record = store.records[0]
    expect(record.gameId).toBe('game-abc')
    expect(record.score).toBe(250)
    expect(record.lives).toBe(0)
    expect(record.level).toBe(2)
    expect(record.turn).toBe(15)
    expect(record.timestamp).toBe(new Date('2024-01-15T12:00:00').getTime())
  })

  it('can add multiple records', () => {
    const store = useHistoryStore()
    store.addRecord(mockGameState)
    store.addRecord({ ...mockGameState, gameId: 'game-def', score: 500 })
    expect(store.records).toHaveLength(2)
  })

  it('highScore getter returns the highest score', () => {
    const store = useHistoryStore()
    store.addRecord({ ...mockGameState, score: 100 })
    store.addRecord({ ...mockGameState, score: 500 })
    store.addRecord({ ...mockGameState, score: 300 })
    expect(store.highScore).toBe(500)
  })

  it('highScore returns 0 when no records', () => {
    const store = useHistoryStore()
    expect(store.highScore).toBe(0)
  })

  it('sortedRecords returns records sorted by timestamp descending', () => {
    vi.setSystemTime(1000)
    const store = useHistoryStore()
    store.addRecord({ ...mockGameState, gameId: 'game-1', score: 100 })

    vi.setSystemTime(3000)
    store.addRecord({ ...mockGameState, gameId: 'game-2', score: 200 })

    vi.setSystemTime(2000)
    store.addRecord({ ...mockGameState, gameId: 'game-3', score: 300 })

    const sorted = store.sortedRecords
    expect(sorted[0].gameId).toBe('game-2')
    expect(sorted[1].gameId).toBe('game-3')
    expect(sorted[2].gameId).toBe('game-1')
  })

  it('clearHistory removes all records', () => {
    const store = useHistoryStore()
    store.addRecord(mockGameState)
    store.addRecord(mockGameState)
    store.clearHistory()
    expect(store.records).toHaveLength(0)
  })
})
