import { describe, it, expect, beforeEach } from 'vitest';
import { decodeAdId, TaskScorer } from '../strategy/scorer.js';
import { OutcomeTracker } from '../strategy/outcomeTracker.js';
import { Ad } from '../types.js';

const URGENCY_CASES = [
  [1, 2.5],
  [2, 1.5],
  [3, 1.2],
] as const;

function makeAd(overrides: Partial<Ad> = {}): Ad {
  return {
    adId: 'test-id',
    message: 'Test quest',
    reward: 100,
    expiresIn: 5,
    encrypted: null,
    probability: 'Sure thing',
    ...overrides,
  };
}

function getScoreByAdId(results: ReturnType<TaskScorer['scoreAndFilter']>, adId: string): number {
  return results.find((result) => result.ad.adId === adId)!.score;
}

describe('decodeAdId', () => {
  it('returns raw adId when encrypted is null', () => {
    const ad = makeAd({ adId: 'raw-id', encrypted: null });
    expect(decodeAdId(ad)).toBe('raw-id');
  });

  it('returns raw adId when encrypted is undefined', () => {
    const ad = makeAd({ adId: 'raw-id', encrypted: undefined });
    expect(decodeAdId(ad)).toBe('raw-id');
  });

  it('decodes base64 when encrypted is 1', () => {
    const ad = makeAd({ adId: 'aGVsbG8=', encrypted: 1 });
    expect(decodeAdId(ad)).toBe('hello');
  });

  it('decodes ROT13 when encrypted is 2', () => {
    const ad = makeAd({ adId: 'uryyb', encrypted: 2 });
    expect(decodeAdId(ad)).toBe('hello');
  });

  it('ROT13 handles uppercase letters', () => {
    const ad = makeAd({ adId: 'URYYB', encrypted: 2 });
    expect(decodeAdId(ad)).toBe('HELLO');
  });
});

describe('TaskScorer', () => {
  let tracker: OutcomeTracker;
  let scorer: TaskScorer;

  beforeEach(() => {
    tracker = new OutcomeTracker();
    scorer = new TaskScorer(tracker);
  });

  it('returns empty array for empty input', () => {
    expect(scorer.scoreAndFilter([], 3)).toEqual([]);
  });

  it('sorts ads by descending EV score', () => {
    const ads = [
      makeAd({ adId: 'low', reward: 10, probability: 'Playing with fire' }),
      makeAd({ adId: 'high', reward: 200, probability: 'Piece of cake' }),
    ];
    const result = scorer.scoreAndFilter(ads, 3);
    expect(result[0]!.ad.adId).toBe('high');
  });

  it('applies survival filter at 1 life (removes low-probability tasks)', () => {
    const ads = [
      makeAd({ adId: 'risky', probability: 'Risky' }),
      makeAd({ adId: 'safe', probability: 'Sure thing' }),
    ];
    const result = scorer.scoreAndFilter(ads, 1);
    expect(result.map((r) => r.ad.adId)).not.toContain('risky');
    expect(result.map((r) => r.ad.adId)).toContain('safe');
  });

  it('does not apply survival filter at 2+ lives', () => {
    const ads = [makeAd({ adId: 'risky', probability: 'Risky' })];
    const result = scorer.scoreAndFilter(ads, 2);
    expect(result).toHaveLength(1);
  });

  it('EV formula spot-check: p=0.85, reward=100, lives=3 (lifeValue=50), expiresIn=5', () => {
    const ad = makeAd({ adId: 'a1', reward: 100, probability: 'Sure thing', expiresIn: 5 });
    const result = scorer.scoreAndFilter([ad], 3);
    expect(result[0]!.score).toBeCloseTo(77.5, 0);
  });

  it.each(URGENCY_CASES)(
    'applies urgency multiplier %sx when expiresIn <= %s',
    (expiresIn, multiplier) => {
      const urgent = makeAd({ adId: 'urgent', reward: 100, probability: 'Sure thing', expiresIn });
      const normal = makeAd({
        adId: 'normal',
        reward: 100,
        probability: 'Sure thing',
        expiresIn: 5,
      });
      const results = scorer.scoreAndFilter([urgent, normal], 3);

      expect(getScoreByAdId(results, 'urgent')).toBeCloseTo(
        getScoreByAdId(results, 'normal') * multiplier,
        0
      );
    }
  );

  it('uses lifeValue=100 at 2 lives', () => {
    const ad = makeAd({ adId: 'a', reward: 100, probability: 'Sure thing', expiresIn: 5 });
    const result = scorer.scoreAndFilter([ad], 2);
    expect(result[0]!.score).toBeCloseTo(70, 0);
  });

  it('uses lifeValue=300 at 1 life', () => {
    const ad = makeAd({ adId: 'a', reward: 100, probability: 'Piece of cake', expiresIn: 5 });
    const result = scorer.scoreAndFilter([ad], 1);
    expect(result[0]!.score).toBeCloseTo(80, 0);
  });
});
