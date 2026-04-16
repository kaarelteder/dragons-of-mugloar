import { apiClient } from '@/shared/api/client'
import { AdsResponseSchema } from '@/shared/types'
import type { Ad } from '@/shared/types'

export const fetchAds = async (gameId: string): Promise<Ad[]> => {
  const response = await apiClient.get(`/${gameId}/messages`)
  return AdsResponseSchema.parse(response.data)
}
