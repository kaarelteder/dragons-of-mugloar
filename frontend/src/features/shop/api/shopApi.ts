import { apiClient } from '@/shared/api/client'
import { ShopResponseSchema, BuyResultSchema } from '@/shared/types'
import type { ShopItem, BuyResult } from '@/shared/types'

export const fetchShop = async (gameId: string): Promise<ShopItem[]> => {
  const response = await apiClient.get(`/${gameId}/shop`)
  return ShopResponseSchema.parse(response.data)
}

export const buyItem = async (gameId: string, itemId: string): Promise<BuyResult> => {
  const response = await apiClient.post(`/${gameId}/shop/buy/${itemId}`)
  return BuyResultSchema.parse(response.data)
}
