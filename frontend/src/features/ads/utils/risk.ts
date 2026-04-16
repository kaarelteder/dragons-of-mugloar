import type { AdWithEV, GameState, RiskTier } from '@/shared/types'

export const calculateRiskTier = (ad: AdWithEV, gameState: GameState): RiskTier => {
  const probabilityRate = ad.probabilityRate
  const failureChance = 1 - probabilityRate

  if (failureChance >= 0.7) return 'dangerous'

  if (gameState.lives <= 2 && failureChance >= 0.5) return 'dangerous'

  if (failureChance >= 0.5 || ad.expiresIn <= 2) return 'risky'

  if (failureChance >= 0.15) return 'medium'
  return 'safe'
}

export const getRiskReason = (tier: RiskTier, ad: AdWithEV, gameState: GameState): string => {
  const failureChance = (1 - ad.probabilityRate) * 100

  switch (tier) {
    case 'safe':
      return `Very likely to succeed (${100 - Math.round(failureChance)}% success rate)`
    case 'medium':
      return `Moderate chance of success (${100 - Math.round(failureChance)}% success rate)`
    case 'risky':
      if (ad.expiresIn <= 2) {
        return `Expires soon (${ad.expiresIn} turns) & ${Math.round(failureChance)}% failure chance`
      }
      return `Significant failure chance (${Math.round(failureChance)}%)`
    case 'dangerous':
      if (gameState.lives <= 2) {
        return `Very risky with only ${gameState.lives} life/lives remaining`
      }
      return `Very high failure chance (${Math.round(failureChance)}%) - could end your run`
  }
}

export const calculateTemporalDecay = (expiresIn: number): number => {
  if (expiresIn <= 0) return 0
  if (expiresIn >= 5) return 1.0
  return 0.8 + (expiresIn - 1) * 0.05
}

export const applyPlaystyleWeight = (
  baseEV: number,
  probability: number,
  reward: number,
  playstyle: 'safe' | 'balanced' | 'aggressive'
): number => {
  const failureChance = 1 - probability

  switch (playstyle) {
    case 'safe':
      if (failureChance >= 0.5) return baseEV * 0.6
      if (failureChance >= 0.3) return baseEV * 0.8
      return baseEV

    case 'balanced':
      return baseEV

    case 'aggressive': {
      const rewardBonus = (reward / 100) * 0.2
      if (failureChance >= 0.3) return baseEV * (1 + rewardBonus)
      return baseEV
    }
  }
}

export const calculateConfidenceScore = (topEV: number, secondEV: number): number => {
  if (topEV === 0) return 0
  const gap = (topEV - secondEV) / topEV
  if (gap >= 0.5) return 0.9
  if (gap >= 0.3) return 0.7
  if (gap >= 0.15) return 0.5
  return 0.3
}

export const generateRecommendationExplanation = (
  ad: AdWithEV,
  riskTier: RiskTier,
  rank: number,
  _confidence: number
): string => {
  const probability = Math.round(ad.probabilityRate * 100)

  const rankLabel =
    ['#1 pick: Highest expected value', '#2 pick: Strong alternative', '#3 pick: Solid option'][
      rank - 1
    ] ?? `#${rank} pick`

  const riskNote =
    riskTier === 'safe'
      ? '(low risk)'
      : riskTier === 'medium'
        ? '(moderate risk)'
        : riskTier === 'risky'
          ? '(risky)'
          : '(⚠️ very risky)'

  return `${rankLabel} ${riskNote}. ${probability}% chance to win ${ad.reward} gold.`
}
