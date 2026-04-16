import { OutcomeRecord } from '../types.js';

const PRIOR_RATES: Record<string, number> = {
  'Piece of cake': 0.95,
  'Sure thing': 0.85,
  'Quite likely': 0.75,
  'Hmmm....': 0.55,
  Risky: 0.4,
  'Rather detrimental': 0.25,
  Gamble: 0.2,
  'Playing with fire': 0.1,
};

const PRIOR_WEIGHT = 5;
const DEFAULT_PRIOR_RATE = 0.5;

export class OutcomeTracker {
  private readonly records = new Map<string, OutcomeRecord>();

  private getPriorRate(probability: string): number {
    return PRIOR_RATES[probability] ?? DEFAULT_PRIOR_RATE;
  }

  getSuccessRate(probability: string): number {
    const prior = this.getPriorRate(probability);
    const record = this.records.get(probability);
    if (!record) {
      return prior;
    }

    return (record.successes + PRIOR_WEIGHT * prior) / (record.attempts + PRIOR_WEIGHT);
  }

  record(probability: string, success: boolean): void {
    const existing = this.records.get(probability);
    const attempts = (existing?.attempts ?? 0) + 1;
    const successes = (existing?.successes ?? 0) + (success ? 1 : 0);

    this.records.set(probability, {
      attempts,
      successes,
    });
  }
}
