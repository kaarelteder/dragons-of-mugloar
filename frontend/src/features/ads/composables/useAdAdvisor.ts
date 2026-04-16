import { computed } from 'vue'
import type {
  AdWithEV,
  GameState,
  AdvisorRecommendation,
  PlaystylePreference,
} from '@/shared/types'
import {
  calculateRiskTier,
  getRiskReason,
  calculateTemporalDecay,
  applyPlaystyleWeight,
  calculateConfidenceScore,
  generateRecommendationExplanation,
} from '@/features/ads/utils/risk'

const HIGH_CONFIDENCE_THRESHOLD = 0.8
const MEDIUM_CONFIDENCE_THRESHOLD = 0.5

export const useAdAdvisor = (
  ads: () => AdWithEV[],
  gameState: () => GameState,
  playstyle: () => PlaystylePreference = () => 'balanced'
) => {
  const calculateWeightedEv = (ad: AdWithEV): number => {
    const temporalMultiplier = calculateTemporalDecay(ad.expiresIn)
    const baseWeightedEv = ad.ev * temporalMultiplier

    const playstyleWeightedEv = applyPlaystyleWeight(
      baseWeightedEv,
      ad.probabilityRate,
      ad.reward,
      playstyle()
    )

    return Math.round(playstyleWeightedEv)
  }

  const buildRecommendation = (ad: AdWithEV, state: GameState): AdvisorRecommendation => {
    const riskTier = calculateRiskTier(ad, state)
    const riskReason = getRiskReason(riskTier, ad, state)
    const weightedEv = calculateWeightedEv(ad)

    return {
      ...ad,
      ev: weightedEv,
      riskTier,
      riskReason,
      explanation: '',
      confidenceScore: 0,
    }
  }

  const enrichedRecommendations = computed(() => {
    const state = gameState()
    return ads().map((ad) => buildRecommendation(ad, state))
  })

  const sortedByWeightedEv = computed(() => {
    return [...enrichedRecommendations.value].sort((a, b) => b.ev - a.ev)
  })

  const recommendationByAdId = computed(() => {
    const recommendationMap = new Map<string, AdvisorRecommendation>()
    for (const recommendation of enrichedRecommendations.value) {
      recommendationMap.set(recommendation.adId, recommendation)
    }
    return recommendationMap
  })

  const calculateRecommendationCount = (recommendations: AdvisorRecommendation[]): number => {
    const { length } = recommendations
    if (length <= 2) return length

    const topEv = recommendations[0].ev
    const secondEv = recommendations[1].ev
    const confidence = calculateConfidenceScore(topEv, secondEv)

    if (confidence >= HIGH_CONFIDENCE_THRESHOLD) return 2
    if (confidence >= MEDIUM_CONFIDENCE_THRESHOLD) return 3
    return Math.min(5, length)
  }

  const recommendationCount = computed(() => calculateRecommendationCount(sortedByWeightedEv.value))

  const topRecommendations = computed(() => {
    const sorted = sortedByWeightedEv.value
    const count = recommendationCount.value
    const topCandidates = sorted.slice(0, count)
    const topConfidence = calculateConfidenceScore(sorted[0]?.ev ?? 0, sorted[1]?.ev ?? 0)

    return topCandidates.map((recommendation, index) => ({
      ...recommendation,
      confidenceScore: index === 0 ? topConfidence : 0,
      explanation: generateRecommendationExplanation(
        recommendation,
        recommendation.riskTier,
        index + 1,
        0
      ),
    }))
  })

  const topRecommendationRankByAdId = computed(() => {
    const rankMap = new Map<string, number>()
    for (const [index, recommendation] of topRecommendations.value.entries()) {
      rankMap.set(recommendation.adId, index + 1)
    }
    return rankMap
  })

  const recommendedAd = computed(() => sortedByWeightedEv.value[0] ?? null)

  const recommendedAdId = computed(() => recommendedAd.value?.adId ?? null)

  const isRecommended = (adId: string): boolean => {
    return recommendedAdId.value === adId
  }

  const getRank = (adId: string): number => {
    return topRecommendationRankByAdId.value.get(adId) ?? 0
  }

  const isInTopRecommendations = (adId: string): boolean => {
    return topRecommendationRankByAdId.value.has(adId)
  }

  const getRiskTierForAd = (adId: string): string => {
    const recommendation = recommendationByAdId.value.get(adId)
    return recommendation?.riskTier ?? 'medium'
  }

  return {
    topRecommendations,
    recommendedAd,
    isRecommended,
    getRank,
    isInTopRecommendations,
    getRiskTierForAd,
    recommendationCount,
  }
}
