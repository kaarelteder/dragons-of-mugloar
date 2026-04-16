import { describe, it, expect } from 'vitest'
import { probabilityToRate, calculateEV, PROBABILITY_RATES } from '@/features/ads/utils/probability'
import { AdsResponseSchema, normalizeProbabilityLabel } from '@/shared/types'

describe('probabilityToRate', () => {
  it('returns correct rate for each known label', () => {
    expect(probabilityToRate('Piece of cake')).toBe(0.95)
    expect(probabilityToRate('Walk in the park')).toBe(0.8)
    expect(probabilityToRate('Quite likely')).toBe(0.7)
    expect(probabilityToRate('Hmmm....')).toBe(0.5)
    expect(probabilityToRate('Risky')).toBe(0.3)
    expect(probabilityToRate('Rather detrimental')).toBe(0.2)
    expect(probabilityToRate('Suicide mission')).toBe(0.05)
    expect(probabilityToRate('Impossible')).toBe(0.0)
  })

  it('defaults to 0.5 for unknown labels', () => {
    expect(probabilityToRate('Unknown label')).toBe(0.5)
    expect(probabilityToRate('')).toBe(0.5)
    expect(probabilityToRate('Something else entirely')).toBe(0.5)
  })

  it('covers all entries in PROBABILITY_RATES', () => {
    for (const [key, rate] of Object.entries(PROBABILITY_RATES)) {
      expect(probabilityToRate(key)).toBe(rate)
    }
  })

  it('normalizes live API aliases to supported labels', () => {
    expect(normalizeProbabilityLabel('Sure thing')).toBe('Piece of cake')
    expect(normalizeProbabilityLabel('Gamble')).toBe('Hmmm....')
    expect(normalizeProbabilityLabel('Playing with fire')).toBe('Rather detrimental')
  })

  it('parses live-style ads payloads with aliased probabilities', () => {
    const ads = AdsResponseSchema.parse([
      {
        adId: 'ad-1',
        message: 'Quest one',
        reward: 10,
        expiresIn: 7,
        encrypted: null,
        probability: 'Sure thing',
      },
      {
        adId: 'ad-2',
        message: 'Quest two',
        reward: 25,
        expiresIn: 4,
        encrypted: null,
        probability: 'Gamble',
      },
      {
        adId: 'ad-3',
        message: 'Quest three',
        reward: 50,
        expiresIn: 2,
        encrypted: null,
        probability: 'Playing with fire',
      },
    ])

    expect(ads.map((ad) => ad.probability)).toEqual([
      'Piece of cake',
      'Hmmm....',
      'Rather detrimental',
    ])
  })
})

describe('calculateEV', () => {
  it('calculates expected value correctly', () => {
    expect(calculateEV(100, 'Piece of cake')).toBe(95)
    expect(calculateEV(100, 'Walk in the park')).toBe(80)
    expect(calculateEV(100, 'Quite likely')).toBe(70)
    expect(calculateEV(100, 'Hmmm....')).toBe(50)
    expect(calculateEV(100, 'Risky')).toBe(30)
    expect(calculateEV(100, 'Rather detrimental')).toBe(20)
    expect(calculateEV(100, 'Suicide mission')).toBe(5)
    expect(calculateEV(100, 'Impossible')).toBe(0)
  })

  it('rounds the EV to nearest integer', () => {
    expect(calculateEV(33, 'Quite likely')).toBe(23)
  })

  it('uses default 0.5 for unknown probability', () => {
    expect(calculateEV(100, 'Unknown')).toBe(50)
  })

  it('returns 0 for 0 reward', () => {
    expect(calculateEV(0, 'Piece of cake')).toBe(0)
  })
})
