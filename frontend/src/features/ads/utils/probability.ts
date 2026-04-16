import { VALID_PROBABILITIES } from '@/shared/types'
import type { Probability } from '@/shared/types'

export const PROBABILITY_RATES: Record<(typeof VALID_PROBABILITIES)[number], number> = {
  'Piece of cake': 0.95,
  'Walk in the park': 0.8,
  'Quite likely': 0.7,
  'Hmmm....': 0.5,
  Risky: 0.3,
  'Rather detrimental': 0.2,
  'Suicide mission': 0.05,
  Impossible: 0.0,
}

export const probabilityToRate = (text: Probability): number => {
  return (PROBABILITY_RATES as Record<string, number>)[text] ?? 0.5
}

export const calculateEV = (reward: number, probability: Probability): number => {
  return Math.round(probabilityToRate(probability) * reward)
}

type ProbabilityTier = 'sure' | 'likely' | 'medium' | 'risky' | 'deadly'

export const getProbabilityTier = (probability: Probability): ProbabilityTier => {
  const rate = probabilityToRate(probability)
  if (rate >= 0.8) return 'sure'
  if (rate >= 0.6) return 'likely'
  if (rate >= 0.4) return 'medium'
  if (rate >= 0.15) return 'risky'
  return 'deadly'
}

export const getEVColor = (ev: number, reward: number): string => {
  if (reward === 0) return 'var(--color-text-muted, #9d90b5)'
  const ratio = ev / reward
  if (ratio >= 0.6) return 'var(--color-ev-high, #4caf50)'
  if (ratio >= 0.35) return 'var(--color-ev-medium, #ff9800)'
  return 'var(--color-ev-low, #e53935)'
}
