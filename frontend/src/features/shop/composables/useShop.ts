import { ref, computed } from 'vue'
import { fetchShop, buyItem } from '@/features/shop/api/shopApi'
import { useGameStore } from '@/features/game/store/gameStore'
import { mapAndHandleGameExpiredError } from '@/shared/api/errorHandling'
import { useAsync } from '@/shared/composables/useAsync'
import { ANIMATION_DURATIONS } from '@/shared/constants/animation'
import type { ShopItem, BuyResult } from '@/shared/types'

export const useShop = () => {
  const gameStore = useGameStore()
  const { loading: loadLoading, error: loadError, execute: executeLoad } = useAsync<ShopItem[]>()
  const { loading: buyLoading, error: buyError, execute: executeBuy } = useAsync<BuyResult>()
  const loading = computed(() => loadLoading.value || buyLoading.value)
  const error = computed(() => loadError.value ?? buyError.value)
  const items = ref<ShopItem[]>([])
  const buyingItemId = ref<string | null>(null)
  const lastBoughtId = ref<string | null>(null)

  const canAfford = (cost: number): boolean => gameStore.gold >= cost

  const loadItems = async (): Promise<void> => {
    const { gameId } = gameStore
    if (!gameId) return

    const result = await executeLoad(async () => {
      try {
        return await fetchShop(gameId)
      } catch (err: unknown) {
        throw mapAndHandleGameExpiredError(err, () => gameStore.reset())
      }
    })
    if (result) items.value = result
  }

  const purchaseItem = async (
    itemId: string
  ): Promise<{ success: boolean; message?: string } | null> => {
    const { gameId } = gameStore
    if (!gameId) return null

    const item = items.value.find((i) => i.id === itemId)
    if (item && !canAfford(item.cost)) {
      return { success: false, message: 'Not enough gold' }
    }

    buyingItemId.value = itemId
    const result = await executeBuy(async () => {
      try {
        return await buyItem(gameId, itemId)
      } catch (err: unknown) {
        throw mapAndHandleGameExpiredError(err, () => gameStore.reset())
      } finally {
        buyingItemId.value = null
      }
    })

    if (result) {
      if (result.shoppingSuccess) {
        gameStore.applyBuy(result)
        lastBoughtId.value = itemId
        setTimeout(() => {
          lastBoughtId.value = null
        }, ANIMATION_DURATIONS.LAST_BOUGHT_CLEAR)
        return { success: true }
      }
      return { success: false, message: 'Purchase failed' }
    }

    return {
      success: false,
      message: buyError.value ?? 'An unexpected error occurred',
    }
  }

  return {
    items,
    loading,
    error,
    buyingItemId,
    lastBoughtId,
    canAfford,
    loadItems,
    purchaseItem,
  }
}
