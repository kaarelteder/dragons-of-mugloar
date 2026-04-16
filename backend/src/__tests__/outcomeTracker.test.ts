import { describe, it, expect, beforeEach } from 'vitest';
import { OutcomeTracker } from '../strategy/outcomeTracker.js';

const PRIOR_CASES = [
  ['Piece of cake', 0.95],
  ['Sure thing', 0.85],
  ['Quite likely', 0.75],
  ['Hmmm....', 0.55],
  ['Risky', 0.4],
  ['Rather detrimental', 0.25],
  ['Gamble', 0.2],
  ['Playing with fire', 0.1],
] as const;

describe('OutcomeTracker', () => {
  let tracker: OutcomeTracker;

  beforeEach(() => {
    tracker = new OutcomeTracker();
  });

  it.each(PRIOR_CASES)('returns correct prior rate for "%s"', (label, expectedRate) => {
    expect(tracker.getSuccessRate(label)).toBeCloseTo(expectedRate);
  });

  it('returns 0.5 for unknown label', () => {
    expect(tracker.getSuccessRate('Unknown label')).toBeCloseTo(0.5);
  });

  it('applies Bayesian formula correctly after success', () => {
    tracker.record('Sure thing', true);
    expect(tracker.getSuccessRate('Sure thing')).toBeCloseTo(5.25 / 6);
  });

  it('applies Bayesian formula correctly after failure', () => {
    tracker.record('Sure thing', false);
    expect(tracker.getSuccessRate('Sure thing')).toBeCloseTo(4.25 / 6);
  });

  it('tracks multiple probability strings independently', () => {
    tracker.record('Sure thing', true);
    tracker.record('Risky', false);
    expect(tracker.getSuccessRate('Sure thing')).toBeCloseTo(5.25 / 6);
    expect(tracker.getSuccessRate('Risky')).toBeCloseTo(2 / 6);
  });

  it('accumulates multiple outcomes', () => {
    tracker.record('Gamble', true);
    tracker.record('Gamble', true);
    tracker.record('Gamble', false);
    expect(tracker.getSuccessRate('Gamble')).toBeCloseTo(3 / 8);
  });
});
