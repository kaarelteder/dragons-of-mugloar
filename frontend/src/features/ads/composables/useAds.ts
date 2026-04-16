import { ref, shallowRef, watch } from 'vue'
import { fetchAds } from '@/features/ads/api/adsApi'
import { decodeAdId } from '@/features/ads/utils/decryption'
import { calculateEV, probabilityToRate } from '@/features/ads/utils/probability'
import { useGameStore } from '@/features/game/store/gameStore'
import { mapAndHandleGameExpiredError } from '@/shared/api/errorHandling'
import { useAsync } from '@/shared/composables/useAsync'
import type { Ad, AdWithEV } from '@/shared/types'

export type SortMode = 'ev' | 'reward' | 'expiry' | 'safety'

const sorters: Record<SortMode, (a: AdWithEV, b: AdWithEV) => number> = {
  ev: (a, b) => b.ev - a.ev,
  reward: (a, b) => b.reward - a.reward,
  expiry: (a, b) => a.expiresIn - b.expiresIn,
  safety: (a, b) => b.probabilityRate - a.probabilityRate,
}

export const useAds = () => {
  const gameStore = useGameStore()
  const { loading, error, execute } = useAsync<Ad[]>()
  const ads = ref<AdWithEV[]>([])
  const sortMode = ref<SortMode>('ev')
  const sortedAds = shallowRef<AdWithEV[]>([])

  const sortAds = (list: AdWithEV[], mode: SortMode): AdWithEV[] => {
    if (list.length < 2) return list
    return [...list].sort(sorters[mode])
  }

  const enrichAd = (ad: Ad): AdWithEV => {
    return {
      ...ad,
      decodedId: decodeAdId(ad.adId, ad.encrypted),
      ev: calculateEV(ad.reward, ad.probability),
      probabilityRate: probabilityToRate(ad.probability),
    }
  }

  const refreshSortedAds = (): void => {
    sortedAds.value = sortAds(ads.value, sortMode.value)
  }

  watch(sortMode, refreshSortedAds)

  const loadAds = async (): Promise<void> => {
    const { gameId } = gameStore
    if (!gameId) return

    const raw = await execute(async () => {
      try {
        return await fetchAds(gameId)
      } catch (err: unknown) {
        throw mapAndHandleGameExpiredError(err, () => gameStore.reset())
      }
    })

    if (!raw) return

    ads.value = raw.map(enrichAd)
    refreshSortedAds()
  }

  const removeAd = (adId: string): void => {
    ads.value = ads.value.filter((a) => a.adId !== adId)
    refreshSortedAds()
  }

  return {
    ads,
    sortedAds,
    sortMode,
    loading,
    error,
    loadAds,
    removeAd,
  }
}
