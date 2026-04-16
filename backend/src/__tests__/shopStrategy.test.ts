import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShopStrategy } from '../strategy/shopStrategy.js';
import { ApiClient } from '../api/client.js';
import { GameState, ShopItem, BuyResult } from '../types.js';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'g1',
    lives: 3,
    gold: 200,
    level: 1,
    score: 0,
    highScore: 0,
    turn: 1,
    ...overrides,
  };
}

function makeItem(overrides: Partial<ShopItem> = {}): ShopItem {
  return { id: 'item1', name: 'Sword', cost: 50, ...overrides };
}

function makeBuyResult(overrides: Partial<BuyResult> = {}): BuyResult {
  return { shoppingSuccess: true, gold: 150, lives: 3, level: 1, turn: 2, ...overrides };
}

describe('ShopStrategy', () => {
  let client: ApiClient;
  let strategy: ShopStrategy;

  beforeEach(() => {
    client = {
      getShopItems: vi.fn(),
      buyItem: vi.fn(),
    } as unknown as ApiClient;
    strategy = new ShopStrategy(client);
  });

  it('skips shopping when lives > 2 and force=false', async () => {
    const state = makeState({ lives: 3 });
    const result = await strategy.shop('g1', state, false);
    expect(client.getShopItems).not.toHaveBeenCalled();
    expect(result).toEqual(state);
  });

  it('proceeds when force=true even with lives > 2 and handles empty inventory', async () => {
    vi.mocked(client.getShopItems).mockResolvedValue([]);
    const state = makeState({ lives: 3 });
    const result = await strategy.shop('g1', state, true);
    expect(client.getShopItems).toHaveBeenCalled();
    expect(client.buyItem).not.toHaveBeenCalled();
    expect(result).toEqual(state);
  });

  it('buys life item when lives <= 2 and affordable', async () => {
    const lifeItem = makeItem({ id: 'hpot', name: 'Health Potion', cost: 50 });
    vi.mocked(client.getShopItems).mockResolvedValue([lifeItem]);
    vi.mocked(client.buyItem).mockResolvedValue(makeBuyResult({ lives: 4, gold: 150 }));
    const state = makeState({ lives: 2, gold: 100 });
    const result = await strategy.shop('g1', state);
    expect(client.buyItem).toHaveBeenCalledWith('g1', 'hpot');
    expect(result.lives).toBe(4);
  });

  it('skips life item when gold < cost', async () => {
    const lifeItem = makeItem({ id: 'hpot', name: 'Health Potion', cost: 200 });
    vi.mocked(client.getShopItems).mockResolvedValue([lifeItem]);
    const state = makeState({ lives: 2, gold: 10 });
    await strategy.shop('g1', state);
    expect(client.buyItem).not.toHaveBeenCalled();
  });

  it('buys stat items in cost-ascending order up to gold reserve', async () => {
    const cheap = makeItem({ id: 'sword', name: 'Sword', cost: 30 });
    const expensive = makeItem({ id: 'armor', name: 'Armor', cost: 160 });
    vi.mocked(client.getShopItems).mockResolvedValue([expensive, cheap]);
    vi.mocked(client.buyItem).mockImplementation(async (_gId, itemId) => {
      if (itemId === 'sword') return makeBuyResult({ gold: 170, lives: 3 });
      return makeBuyResult({ gold: 10, lives: 3 });
    });
    const state = makeState({ lives: 3, gold: 200 });
    await strategy.shop('g1', state, true);
    const calls = vi.mocked(client.buyItem).mock.calls.map((c) => c[1]);
    expect(calls[0]).toBe('sword');
  });

  it('handles shoppingSuccess: false silently', async () => {
    const item = makeItem({ id: 'hpot', name: 'Health Potion', cost: 50 });
    vi.mocked(client.getShopItems).mockResolvedValue([item]);
    vi.mocked(client.buyItem).mockResolvedValue(makeBuyResult({ shoppingSuccess: false }));
    const state = makeState({ lives: 2, gold: 100 });
    await expect(strategy.shop('g1', state)).resolves.toBeDefined();
  });

  it('handles exception in tryBuy silently', async () => {
    const item = makeItem({ id: 'hpot', name: 'Health Potion', cost: 50 });
    vi.mocked(client.getShopItems).mockResolvedValue([item]);
    vi.mocked(client.buyItem).mockRejectedValue(new Error('Network failure'));
    const state = makeState({ lives: 2, gold: 100 });
    await expect(strategy.shop('g1', state)).resolves.toBeDefined();
  });

  it('life item detection is case-insensitive (name)', async () => {
    const item = makeItem({ id: 'x1', name: 'LIFE Elixir', cost: 50 });
    vi.mocked(client.getShopItems).mockResolvedValue([item]);
    vi.mocked(client.buyItem).mockResolvedValue(makeBuyResult({ lives: 4, gold: 150 }));
    const state = makeState({ lives: 2, gold: 100 });
    await strategy.shop('g1', state);
    expect(client.buyItem).toHaveBeenCalledWith('g1', 'x1');
  });

  it('life item detection is case-insensitive (id)', async () => {
    const item = makeItem({ id: 'HPOT', name: 'Power Up', cost: 50 });
    vi.mocked(client.getShopItems).mockResolvedValue([item]);
    vi.mocked(client.buyItem).mockResolvedValue(makeBuyResult({ lives: 4, gold: 150 }));
    const state = makeState({ lives: 2, gold: 100 });
    await strategy.shop('g1', state);
    expect(client.buyItem).toHaveBeenCalledWith('g1', 'HPOT');
  });
});
