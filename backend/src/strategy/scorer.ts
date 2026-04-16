import { Ad } from '../types.js';
import { OutcomeTracker } from './outcomeTracker.js';

const SURVIVAL_THRESHOLD = 0.65;

function isSurvivalMode(lives: number): boolean {
  return lives === 1;
}

function shouldSkipForSurvivalMode(survivalMode: boolean, probability: number): boolean {
  return survivalMode && probability <= SURVIVAL_THRESHOLD;
}

function getLifeValue(lives: number): number {
  if (lives >= 3) {
    return 50;
  }

  return lives === 2 ? 100 : 300;
}

function getUrgencyMultiplier(expiresIn: number): number {
  if (expiresIn <= 1) {
    return 2.5;
  }

  if (expiresIn <= 2) {
    return 1.5;
  }

  return expiresIn <= 3 ? 1.2 : 1;
}

export function decodeAdId(ad: Ad): string {
  const { adId, encrypted } = ad;
  if (encrypted === 1) {
    return Buffer.from(adId, 'base64').toString('utf8');
  }
  if (encrypted === 2) {
    return adId.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
    });
  }
  return adId;
}

interface ScoredAd {
  ad: Ad;
  decodedId: string;
  score: number;
  probability: number;
}

export class TaskScorer {
  constructor(private readonly tracker: OutcomeTracker) {}

  private createScoredAd(ad: Ad, lifeValue: number): ScoredAd {
    const probability = this.tracker.getSuccessRate(ad.probability);

    return {
      ad,
      decodedId: decodeAdId(ad),
      probability,
      score:
        (probability * ad.reward - (1 - probability) * lifeValue) *
        getUrgencyMultiplier(ad.expiresIn),
    };
  }

  getBestCandidate(ads: Ad[], lives: number): ScoredAd | null {
    if (ads.length === 0) {
      return null;
    }

    const lifeValue = getLifeValue(lives);
    const survivalMode = isSurvivalMode(lives);
    let best: ScoredAd | null = null;

    for (const ad of ads) {
      const scoredAd = this.createScoredAd(ad, lifeValue);

      if (shouldSkipForSurvivalMode(survivalMode, scoredAd.probability)) {
        continue;
      }

      if (!best || scoredAd.score > best.score) {
        best = scoredAd;
      }
    }

    return best;
  }

  scoreAndFilter(ads: Ad[], lives: number): ScoredAd[] {
    if (ads.length === 0) {
      return [];
    }

    const lifeValue = getLifeValue(lives);
    const survivalMode = isSurvivalMode(lives);
    const scoredAds: ScoredAd[] = [];

    for (const ad of ads) {
      const scoredAd = this.createScoredAd(ad, lifeValue);

      if (shouldSkipForSurvivalMode(survivalMode, scoredAd.probability)) {
        continue;
      }

      scoredAds.push(scoredAd);
    }

    return scoredAds.sort((left, right) => right.score - left.score);
  }
}
