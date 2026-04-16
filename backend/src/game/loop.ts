import { ApiClient } from '../api/client.js';
import { GameLoopResult, GameState, SolveResult } from '../types.js';
import { isLogLevelEnabled, logger } from '../logger.js';
import { OutcomeTracker } from '../strategy/outcomeTracker.js';
import { TaskScorer } from '../strategy/scorer.js';
import { ShopStrategy } from '../strategy/shopStrategy.js';

const TARGET_SCORE = 1000;
const SHOPPING_GOLD_THRESHOLD = 50;
const SHOPPING_INTERVAL = 5;
const MAX_CONSECUTIVE_EMPTY = 5;
const MAX_START_ATTEMPTS = 3;
const MAX_RECOVERY_ATTEMPTS = 3;
const BACKOFF_MS = 250;
const EMPTY_BOARD_REASON = 'Too many consecutive empty boards';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function is404(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    (err as { response?: { status?: number } }).response?.status === 404
  );
}

export class GameLoop {
  private readonly client: ApiClient;
  private readonly tracker: OutcomeTracker;
  private readonly scorer: TaskScorer;
  private readonly shop: ShopStrategy;

  constructor(client?: ApiClient) {
    this.client = client ?? new ApiClient();
    this.tracker = new OutcomeTracker();
    this.scorer = new TaskScorer(this.tracker);
    this.shop = new ShopStrategy(this.client);
  }

  private createResult(
    exitCode: GameLoopResult['exitCode'],
    reachedTarget: boolean,
    shutdownReason: string
  ): GameLoopResult {
    return { exitCode, reachedTarget, shutdownReason };
  }

  private getEmptyBoardFailure(): GameLoopResult {
    return this.createResult(1, false, EMPTY_BOARD_REASON);
  }

  private shouldShop(state: GameState): boolean {
    return (
      state.lives <= 2 ||
      (state.gold >= SHOPPING_GOLD_THRESHOLD && state.turn % SHOPPING_INTERVAL === 0)
    );
  }

  private shouldStopForEmptyBoards(consecutiveEmpty: number): boolean {
    return consecutiveEmpty >= MAX_CONSECUTIVE_EMPTY;
  }

  private applySolveResult(state: GameState, result: SolveResult): GameState {
    return {
      ...state,
      lives: result.lives,
      gold: result.gold,
      score: result.score,
      highScore: result.highScore,
      turn: result.turn,
    };
  }

  async run(): Promise<GameLoopResult> {
    let state: GameState | null = null;
    for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt++) {
      try {
        state = await this.client.startGame();
        if (isLogLevelEnabled('info')) {
          logger.info(`Game started: ${state.gameId}`);
        }
        break;
      } catch (err) {
        logger.warn(`Failed to start game (attempt ${attempt}/${MAX_START_ATTEMPTS})`, { err });
        if (attempt < MAX_START_ATTEMPTS) {
          await sleep(BACKOFF_MS * attempt);
        }
      }
    }

    if (!state) {
      return this.createResult(1, false, 'Failed to start game');
    }

    let consecutiveEmpty = 0;
    let recoveryAttempts = 0;

    for (;;) {
      if (state.score >= TARGET_SCORE) {
        if (isLogLevelEnabled('info')) {
          logger.info(`Target score reached: ${state.score}`);
        }
        return this.createResult(0, true, 'Target score reached');
      }

      if (state.lives <= 0) {
        if (isLogLevelEnabled('info')) {
          logger.info(`Game over: no lives remaining. Score: ${state.score}`);
        }
        return this.createResult(1, false, 'No lives remaining');
      }

      if (this.shouldShop(state)) {
        state = await this.shop.shop(state.gameId, state);
      }

      let ads;
      try {
        ads = await this.client.getMessages(state.gameId);
        recoveryAttempts = 0;
      } catch (err) {
        if (is404(err)) {
          logger.warn('404 on getMessages — attempting session recovery');
          recoveryAttempts++;
          if (recoveryAttempts > MAX_RECOVERY_ATTEMPTS) {
            return this.createResult(1, false, 'Session recovery exhausted');
          }
          await sleep(BACKOFF_MS * recoveryAttempts);
          try {
            state = await this.client.startGame();
            if (isLogLevelEnabled('info')) {
              logger.info(`Session recovered: new game ${state.gameId}`);
            }
          } catch (startErr) {
            logger.warn('Failed to start new game during recovery', { startErr });
          }
          continue;
        }
        logger.warn('Error fetching messages', { err });
        consecutiveEmpty++;
        if (this.shouldStopForEmptyBoards(consecutiveEmpty)) {
          return this.getEmptyBoardFailure();
        }
        continue;
      }

      let best = this.scorer.getBestCandidate(ads, state.lives);

      if (!best) {
        if (state.lives === 1) {
          state = await this.shop.shop(state.gameId, state, true);
          best = this.scorer.getBestCandidate(ads, state.lives >= 2 ? state.lives : 2);
        }

        if (!best) {
          consecutiveEmpty++;
          if (isLogLevelEnabled('debug')) {
            logger.debug(`Empty candidates (${consecutiveEmpty}/${MAX_CONSECUTIVE_EMPTY})`);
          }
          if (this.shouldStopForEmptyBoards(consecutiveEmpty)) {
            return this.getEmptyBoardFailure();
          }
          continue;
        }
      }

      consecutiveEmpty = 0;

      if (isLogLevelEnabled('info')) {
        logger.info(
          `Turn ${state.turn}: solving "${best.ad.message}" (p=${best.probability.toFixed(2)}, reward=${best.ad.reward}, ev=${best.score.toFixed(1)})`
        );
      }

      try {
        const result = await this.client.solveAd(state.gameId, best.decodedId);
        this.tracker.record(best.ad.probability, result.success);
        state = this.applySolveResult(state, result);

        if (isLogLevelEnabled('info')) {
          logger.info(
            `Result: ${result.success ? 'SUCCESS' : 'FAILURE'} | lives=${result.lives} gold=${result.gold} score=${result.score} turn=${result.turn}`
          );
        }

        if (result.success && isLogLevelEnabled('debug')) {
          logger.debug(`Message: ${result.message}`);
        }
      } catch (err) {
        logger.warn('Error solving ad', { err });
      }
    }
  }
}
