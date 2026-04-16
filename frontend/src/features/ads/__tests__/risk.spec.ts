import { describe, it, expect } from 'vitest'
import {
  calculateRiskTier,
  getRiskReason,
  calculateTemporalDecay,
  applyPlaystyleWeight,
  calculateConfidenceScore,
  generateRecommendationExplanation,
} from '@/features/ads/utils/risk'
import type { AdWithEV, GameState } from '@/shared/types'

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

function makeAd(overrides: Partial<AdWithEV> = {}): AdWithEV {
  return {
    adId: 'test-ad',
    message: 'Test quest',
    reward: 100,
    expiresIn: 5,
    encrypted: null,
    probability: 'Quite likely',
    decodedId: 'test-ad',
    ev: 70,
    probabilityRate: 0.7,
    ...overrides,
  }
}

describe('Risk Assessment Utilities', () => {
  describe('calculateRiskTier', () => {
    it('returns safe for high probability ads', () => {
      const ad = makeAd({ probabilityRate: 0.95 })
      const gameState = makeGameState()
      const tier = calculateRiskTier(ad, gameState)
      expect(tier).toBe('safe')
    })

    it('returns risky for moderate-high failure chance', () => {
      const ad = makeAd({ probabilityRate: 0.4 })
      const gameState = makeGameState()
      const tier = calculateRiskTier(ad, gameState)
      expect(tier).toBe('risky')
    })

    it('returns dangerous for very high failure chance', () => {
      const ad = makeAd({ probabilityRate: 0.3 })
      const gameState = makeGameState()
      const tier = calculateRiskTier(ad, gameState)
      expect(tier).toBe('dangerous')
    })

    it('returns dangerous for very low probability', () => {
      const ad = makeAd({ probabilityRate: 0.05 })
      const gameState = makeGameState()
      const tier = calculateRiskTier(ad, gameState)
      expect(tier).toBe('dangerous')
    })

    it('returns dangerous when player has critical lives (≤2)', () => {
      const ad = makeAd({ probabilityRate: 0.5 })
      const gameState = makeGameState({ lives: 2 })
      const tier = calculateRiskTier(ad, gameState)
      expect(tier).toBe('dangerous')
    })

    it('returns risky for ads expiring soon', () => {
      const ad = makeAd({ probabilityRate: 0.5, expiresIn: 2 })
      const gameState = makeGameState()
      const tier = calculateRiskTier(ad, gameState)
      expect(tier).toBe('risky')
    })
  })

  describe('getRiskReason', () => {
    it('generates appropriate safe tier message', () => {
      const ad = makeAd({ probabilityRate: 0.95 })
      const gameState = makeGameState()
      const reason = getRiskReason('safe', ad, gameState)
      expect(reason).toContain('95%')
      expect(reason).toContain('success')
    })

    it('generates message for dangerous tier with low lives', () => {
      const ad = makeAd({ probabilityRate: 0.2 })
      const gameState = makeGameState({ lives: 1 })
      const reason = getRiskReason('dangerous', ad, gameState)
      expect(reason).toContain('1 life')
    })

    it('generates message for risky ads expiring soon', () => {
      const ad = makeAd({ expiresIn: 1 })
      const reason = getRiskReason('risky', ad, makeGameState())
      expect(reason).toContain('Expires soon')
      expect(reason).toContain('1 turn')
    })
  })

  describe('calculateTemporalDecay', () => {
    it('returns 1.0 for ads expiring in 5+ turns', () => {
      expect(calculateTemporalDecay(5)).toBe(1.0)
      expect(calculateTemporalDecay(10)).toBe(1.0)
    })

    it('returns 0.8 for ads expiring in 1 turn', () => {
      expect(calculateTemporalDecay(1)).toBe(0.8)
    })

    it('returns 0.85 for ads expiring in 2 turns', () => {
      expect(calculateTemporalDecay(2)).toBeCloseTo(0.85)
    })

    it('returns 0.9 for ads expiring in 3 turns', () => {
      expect(calculateTemporalDecay(3)).toBe(0.9)
    })

    it('returns 0 for expired ads', () => {
      expect(calculateTemporalDecay(0)).toBe(0)
      expect(calculateTemporalDecay(-1)).toBe(0)
    })

    it('applies linear decay between 1 and 5 turns', () => {
      const decay1 = calculateTemporalDecay(1)
      const decay2 = calculateTemporalDecay(2)
      expect(decay2 - decay1).toBeCloseTo(0.05)
    })
  })

  describe('applyPlaystyleWeight', () => {
    it('returns base EV for balanced playstyle', () => {
      const baseEV = 100
      const weighted = applyPlaystyleWeight(baseEV, 0.7, 50, 'balanced')
      expect(weighted).toBe(baseEV)
    })

    it('penalizes risky ads in safe playstyle', () => {
      const baseEV = 100
      const weighted = applyPlaystyleWeight(baseEV, 0.7, 50, 'safe')
      expect(weighted).toBe(80)
    })

    it('heavily penalizes very risky ads in safe playstyle', () => {
      const baseEV = 100
      const weighted = applyPlaystyleWeight(baseEV, 0.5, 50, 'safe')
      expect(weighted).toBe(60)
    })

    it('boosts high-reward risky ads in aggressive playstyle', () => {
      const baseEV = 100
      const weighted = applyPlaystyleWeight(baseEV, 0.7, 100, 'aggressive')
      expect(weighted).toBeGreaterThan(baseEV)
    })

    it('safe playstyle has no penalty for safe ads', () => {
      const baseEV = 100
      const weighted = applyPlaystyleWeight(baseEV, 0.9, 50, 'safe')
      expect(weighted).toBe(baseEV)
    })
  })

  describe('calculateConfidenceScore', () => {
    it('returns high confidence for large EV gap', () => {
      const score = calculateConfidenceScore(100, 50)
      expect(score).toBe(0.9)
    })

    it('returns medium confidence for moderate gap', () => {
      const score = calculateConfidenceScore(100, 80)
      expect(score).toBe(0.5)
    })

    it('returns low confidence for small gap', () => {
      const score = calculateConfidenceScore(100, 95)
      expect(score).toBe(0.3)
    })

    it('returns very low confidence for tied scores', () => {
      const score = calculateConfidenceScore(100, 100)
      expect(score).toBe(0.3)
    })

    it('handles edge case of zero top EV', () => {
      const score = calculateConfidenceScore(0, 0)
      expect(score).toBe(0)
    })
  })

  describe('generateRecommendationExplanation', () => {
    it('generates rank 1 explanation', () => {
      const ad = makeAd({ probabilityRate: 0.7, reward: 100 })
      const explanation = generateRecommendationExplanation(ad, 'safe', 1, 0.9)
      expect(explanation).toContain('#1 pick')
      expect(explanation).toContain('Highest expected value')
      expect(explanation).toContain('70%')
      expect(explanation).toContain('100 gold')
    })

    it('generates rank 2 explanation', () => {
      const ad = makeAd()
      const explanation = generateRecommendationExplanation(ad, 'medium', 2, 0.7)
      expect(explanation).toContain('#2 pick')
      expect(explanation).toContain('Strong alternative')
    })

    it('generates rank 3 explanation', () => {
      const ad = makeAd()
      const explanation = generateRecommendationExplanation(ad, 'risky', 3, 0.5)
      expect(explanation).toContain('#3 pick')
      expect(explanation).toContain('Solid option')
    })

    it('includes risk note in explanation', () => {
      const ad = makeAd()
      const explanation = generateRecommendationExplanation(ad, 'dangerous', 1, 0.9)
      expect(explanation).toContain('(⚠️ very risky)')
    })
  })
})
