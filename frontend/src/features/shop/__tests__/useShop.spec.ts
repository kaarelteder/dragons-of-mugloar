import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/features/game/store/gameStore'

vi.mock('@/features/shop/api/shopApi', () => ({
  fetchShop: vi.fn(),
  buyItem: vi.fn(),
}))

import * as shopApi from '@/features/shop/api/shopApi'
import { useShop } from '@/features/shop/composables/useShop'

const mockItems = [
  { id: 'hpot', name: 'Health Potion', cost: 50 },
  { id: 'sword', name: 'Sword', cost: 100 },
]

const mockBuyResult = {
  shoppingSuccess: true,
  gold: 50,
  lives: 4,
  level: 1,
  turn: 1,
}

describe('useShop', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('canAfford returns true when store has enough gold', () => {
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'test',
      lives: 3,
      gold: 100,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { canAfford } = useShop()
    expect(canAfford(50)).toBe(true)
    expect(canAfford(100)).toBe(true)
  })

  it('canAfford returns false when store has insufficient gold', () => {
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'test',
      lives: 3,
      gold: 30,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { canAfford } = useShop()
    expect(canAfford(50)).toBe(false)
  })

  it('loadItems fetches and stores shop items', async () => {
    vi.mocked(shopApi.fetchShop).mockResolvedValue(mockItems)
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'game-123',
      lives: 3,
      gold: 100,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { items, loadItems } = useShop()
    await loadItems()

    expect(shopApi.fetchShop).toHaveBeenCalledWith('game-123')
    expect(items.value).toEqual(mockItems)
  })

  it('purchaseItem calls buyItem api and updates store', async () => {
    vi.mocked(shopApi.buyItem).mockResolvedValue(mockBuyResult)
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'game-123',
      lives: 3,
      gold: 100,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { items, purchaseItem } = useShop()
    items.value = mockItems

    const result = await purchaseItem('hpot')

    expect(shopApi.buyItem).toHaveBeenCalledWith('game-123', 'hpot')
    expect(result?.success).toBe(true)
    expect(gameStore.gold).toBe(50)
    expect(gameStore.lives).toBe(4)
  })

  it('loadItems sets error when API fails', async () => {
    vi.mocked(shopApi.fetchShop).mockRejectedValue(new Error('Network error'))
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'game-123',
      lives: 3,
      gold: 100,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { error, loadItems } = useShop()
    await loadItems()

    expect(error.value).toBe('Network error')
  })

  it('purchaseItem returns error when buyItem API throws', async () => {
    vi.mocked(shopApi.buyItem).mockRejectedValue(new Error('Server error'))
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'game-123',
      lives: 3,
      gold: 100,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { items, purchaseItem } = useShop()
    items.value = mockItems

    const result = await purchaseItem('hpot')

    expect(result?.success).toBe(false)
    expect(result?.message).toBe('Server error')
    expect(gameStore.gold).toBe(100)
  })

  it('purchaseItem returns error when cannot afford', async () => {
    const gameStore = useGameStore()
    gameStore.startGame({
      gameId: 'game-123',
      lives: 3,
      gold: 10,
      level: 1,
      score: 0,
      highScore: 0,
      turn: 0,
    })

    const { items, purchaseItem } = useShop()
    items.value = mockItems

    const result = await purchaseItem('hpot')

    expect(shopApi.buyItem).not.toHaveBeenCalled()
    expect(result?.success).toBe(false)
    expect(result?.message).toBe('Not enough gold')
  })
})
