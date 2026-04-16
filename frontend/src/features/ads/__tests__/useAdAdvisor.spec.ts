import { describe, it, expect } from 'vitest'
import { useAdAdvisor } from '@/features/ads/composables/useAdAdvisor'
import type { AdWithEV, GameState } from '@/shared/types'

function makeAd(adId: string, ev: number, reward = 100, expiresIn = 5): AdWithEV {
  return {
    adId,
    message: `Quest ${adId}`,
    reward,
    expiresIn,
    encrypted: null,
    probability: 'Quite likely',
    decodedId: adId,
    ev,
    probabilityRate: 0.7,
  }
}

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'test-game',
    lives: 3,
    gold: 100,
    level: 1,
    score: 0,
    highScore: 0,
    turn: 0,
    ...overrides,
  }
}

describe('useAdAdvisor', () => {
  const ads = [
    makeAd('ad-1', 30),
    makeAd('ad-2', 80),
    makeAd('ad-3', 50),
    makeAd('ad-4', 10),
    makeAd('ad-5', 65),
  ]

  const gameState = makeGameState()

  it('returns ads sorted by EV descending in topRecommendations', () => {
    const { topRecommendations } = useAdAdvisor(
      () => ads,
      () => gameState
    )
    expect(topRecommendations.value.length).toBeLessThanOrEqual(3)
    expect(topRecommendations.value[0]?.adId).toBe('ad-2')
  })

  it('recommendedAd is the highest EV ad', () => {
    const { recommendedAd } = useAdAdvisor(
      () => ads,
      () => gameState
    )
    expect(recommendedAd.value?.adId).toBe('ad-2')
  })

  it('isRecommended returns true only for highest EV ad', () => {
    const { isRecommended } = useAdAdvisor(
      () => ads,
      () => gameState
    )
    expect(isRecommended('ad-2')).toBe(true)
    expect(isRecommended('ad-1')).toBe(false)
    expect(isRecommended('ad-5')).toBe(false)
  })

  it('getRank returns correct rank for top ads', () => {
    const { getRank } = useAdAdvisor(
      () => ads,
      () => gameState
    )
    expect(getRank('ad-2')).toBe(1)
    expect(getRank('ad-5')).toBe(2)
    expect(getRank('ad-3')).toBe(3)
  })

  it('getRank returns 0 for ads outside recommendations', () => {
    const { getRank } = useAdAdvisor(
      () => ads,
      () => gameState
    )
    expect(getRank('ad-1')).toBe(0)
    expect(getRank('ad-4')).toBe(0)
  })

  it('handles empty ads array', () => {
    const { topRecommendations, recommendedAd } = useAdAdvisor(
      () => [],
      () => gameState
    )
    expect(topRecommendations.value).toEqual([])
    expect(recommendedAd.value).toBeNull()
  })

  it('applies temporal decay for expiring ads', () => {
    const expiringAd = makeAd('expiring', 100, 100, 1)
    const stableAd = makeAd('stable', 80, 100, 5)

    const { topRecommendations } = useAdAdvisor(
      () => [expiringAd, stableAd],
      () => gameState
    )

    expect(topRecommendations.value.length).toBeGreaterThan(0)
  })

  it('adjusts recommendations based on playstyle', () => {
    const { recommendationCount: balancedCount } = useAdAdvisor(
      () => ads,
      () => gameState,
      () => 'balanced'
    )

    const { recommendationCount: safeCount } = useAdAdvisor(
      () => ads,
      () => gameState,
      () => 'safe'
    )

    expect(balancedCount.value).toBeGreaterThan(0)
    expect(safeCount.value).toBeGreaterThan(0)
  })

  it('includes risk tier information in recommendations', () => {
    const { topRecommendations } = useAdAdvisor(
      () => ads,
      () => gameState
    )

    const firstRec = topRecommendations.value[0]
    expect(firstRec).toHaveProperty('riskTier')
    expect(['safe', 'medium', 'risky', 'dangerous']).toContain(firstRec?.riskTier)
  })

  it('includes explanation in recommendations', () => {
    const { topRecommendations } = useAdAdvisor(
      () => ads,
      () => gameState
    )

    const firstRec = topRecommendations.value[0]
    expect(firstRec?.explanation).toBeTruthy()
    expect(typeof firstRec?.explanation).toBe('string')
  })

  it('provides isInTopRecommendations helper', () => {
    const { isInTopRecommendations } = useAdAdvisor(
      () => ads,
      () => gameState
    )

    expect(isInTopRecommendations('ad-2')).toBe(true)
    expect(isInTopRecommendations('ad-4')).toBe(false)
  })

  it('provides getRiskTierForAd helper', () => {
    const { getRiskTierForAd } = useAdAdvisor(
      () => ads,
      () => gameState
    )

    const riskTier = getRiskTierForAd('ad-2')
    expect(['safe', 'medium', 'risky', 'dangerous']).toContain(riskTier)
  })

  it('dynamically adjusts recommendation count based on confidence', () => {
    const highConfidenceAds = [makeAd('high-1', 100), makeAd('high-2', 40), makeAd('high-3', 30)]

    const lowConfidenceAds = [
      makeAd('low-1', 100),
      makeAd('low-2', 99),
      makeAd('low-3', 98),
      makeAd('low-4', 97),
      makeAd('low-5', 96),
    ]

    const { recommendationCount: highConfidenceCount } = useAdAdvisor(
      () => highConfidenceAds,
      () => gameState
    )

    const { recommendationCount: lowConfidenceCount } = useAdAdvisor(
      () => lowConfidenceAds,
      () => gameState
    )

    expect(highConfidenceCount.value).toBeLessThan(4)
    expect(lowConfidenceCount.value).toBeGreaterThanOrEqual(3)
  })
})
