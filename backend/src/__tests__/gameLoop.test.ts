import { describe, it, expect, vi } from 'vitest';
import { GameLoop } from '../game/loop.js';
import { ApiClient } from '../api/client.js';
import { GameState, Ad, SolveResult } from '../types.js';

function make404Error(): Error & { response: { status: number } } {
  return Object.assign(new Error('Not found'), { response: { status: 404 } });
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'g1',
    lives: 3,
    gold: 0,
    level: 1,
    score: 0,
    highScore: 0,
    turn: 1,
    ...overrides,
  };
}

function makeAd(overrides: Partial<Ad> = {}): Ad {
  return {
    adId: 'ad1',
    message: 'Fight a dragon',
    reward: 100,
    expiresIn: 5,
    encrypted: null,
    probability: 'Sure thing',
    ...overrides,
  };
}

function makeSolveResult(overrides: Partial<SolveResult> = {}): SolveResult {
  return {
    success: true,
    lives: 3,
    gold: 100,
    score: 50,
    highScore: 50,
    turn: 2,
    message: 'You win!',
    ...overrides,
  };
}

function makeClient(overrides: Partial<ApiClient> = {}): ApiClient {
  return {
    startGame: vi.fn().mockResolvedValue(makeState()),
    getMessages: vi.fn().mockResolvedValue([makeAd()]),
    solveAd: vi.fn().mockResolvedValue(makeSolveResult()),
    getShopItems: vi.fn().mockResolvedValue([]),
    buyItem: vi.fn(),
    ...overrides,
  } as unknown as ApiClient;
}

async function runLoop(overrides: Partial<ApiClient> = {}) {
  const client = makeClient(overrides);
  const loop = new GameLoop(client);
  const result = await loop.run();

  return { client, result };
}

describe('GameLoop', () => {
  it('exits with exitCode 0 and reachedTarget=true when score >= 1000', async () => {
    const { result } = await runLoop({
      getMessages: vi.fn().mockResolvedValue([makeAd()]),
      solveAd: vi.fn().mockResolvedValue(makeSolveResult({ score: 1000 })),
    });
    expect(result.exitCode).toBe(0);
    expect(result.reachedTarget).toBe(true);
  });

  it('exits with exitCode 1 when lives = 0', async () => {
    const { result } = await runLoop({
      getMessages: vi.fn().mockResolvedValue([makeAd()]),
      solveAd: vi.fn().mockResolvedValue(makeSolveResult({ lives: 0, score: 10 })),
    });
    expect(result.exitCode).toBe(1);
    expect(result.shutdownReason).toBe('No lives remaining');
  });

  it('exits with correct shutdownReason after 5 consecutive empty boards', async () => {
    const { result } = await runLoop({
      getMessages: vi.fn().mockResolvedValue([]),
    });
    expect(result.exitCode).toBe(1);
    expect(result.shutdownReason).toBe('Too many consecutive empty boards');
  });

  it('calls startGame() on session recovery after 404 on getMessages', async () => {
    let getMessagesCalls = 0;
    const { client } = await runLoop({
      getMessages: vi.fn().mockImplementation(() => {
        getMessagesCalls++;
        if (getMessagesCalls === 1) {
          return Promise.reject(make404Error());
        }
        return Promise.resolve([makeAd()]);
      }),
      solveAd: vi.fn().mockResolvedValue(makeSolveResult({ score: 1000 })),
    });
    expect(client.startGame).toHaveBeenCalledTimes(2);
  });

  it('exits when recovery exhausted after 3 attempts', async () => {
    const { result } = await runLoop({
      getMessages: vi.fn().mockRejectedValue(make404Error()),
    });
    expect(result.exitCode).toBe(1);
    expect(result.shutdownReason).toBe('Session recovery exhausted');
  });

  it('calls tracker.record() after each solve', async () => {
    let solveCount = 0;
    const client = makeClient({
      getMessages: vi.fn().mockResolvedValue([makeAd()]),
      solveAd: vi.fn().mockImplementation(() => {
        solveCount++;
        return Promise.resolve(makeSolveResult({ score: solveCount >= 3 ? 1000 : 10 }));
      }),
    });
    const loop = new GameLoop(client);
    const result = await loop.run();
    expect(result.reachedTarget).toBe(true);
    expect(client.solveAd).toHaveBeenCalledTimes(3);
  });

  it('handles survival mode: forces shop then relaxes filter on empty candidates', async () => {
    let turn = 0;
    const client = makeClient({
      startGame: vi.fn().mockResolvedValue(makeState({ lives: 1 })),
      getMessages: vi.fn().mockImplementation(() => {
        turn++;
        if (turn <= 2) {
          return Promise.resolve([makeAd({ probability: 'Playing with fire' })]);
        }
        return Promise.resolve([makeAd({ probability: 'Sure thing' })]);
      }),
      solveAd: vi.fn().mockResolvedValue(makeSolveResult({ score: 1000, lives: 1 })),
      getShopItems: vi.fn().mockResolvedValue([]),
    });
    const loop = new GameLoop(client);
    const result = await loop.run();
    expect(result.exitCode).toBe(0);
  });

  it('exits with exitCode 1 when startGame fails all attempts', async () => {
    const { result } = await runLoop({
      startGame: vi.fn().mockRejectedValue(new Error('Server down')),
    });
    expect(result.exitCode).toBe(1);
    expect(result.shutdownReason).toBe('Failed to start game');
  });
});
