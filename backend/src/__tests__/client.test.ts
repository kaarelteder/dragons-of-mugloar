import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { ApiClient } from '../api/client.js';

type AxiosMockModule = {
  __mockPost: ReturnType<typeof vi.fn>;
  __mockGet: ReturnType<typeof vi.fn>;
};

vi.mock('axios', async () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const instance = { post: mockPost, get: mockGet };
  return {
    default: {
      create: vi.fn(() => instance),
    },
    __mockPost: mockPost,
    __mockGet: mockGet,
  };
});

async function getAxiosMocks() {
  const module = (await import('axios')) as typeof import('axios') & AxiosMockModule;
  return { mockPost: module.__mockPost, mockGet: module.__mockGet };
}

function createClient(): ApiClient {
  return new ApiClient();
}

describe('ApiClient', () => {
  beforeEach(() => {
    vi.stubEnv('BASE_URL', 'https://example.com/api/v2');
  });

  it('throws if BASE_URL is not set', () => {
    vi.stubEnv('BASE_URL', '');
    expect(() => new ApiClient()).toThrow('BASE_URL environment variable is not set');
  });

  describe('startGame()', () => {
    it('calls POST /game/start and parses response', async () => {
      const { mockPost } = await getAxiosMocks();
      const payload = {
        gameId: 'g1',
        lives: 3,
        gold: 0,
        level: 1,
        score: 0,
        highScore: 0,
        turn: 0,
      };
      mockPost.mockResolvedValueOnce({ data: payload });
      const client = createClient();
      const result = await client.startGame();
      expect(mockPost).toHaveBeenCalledWith('/game/start');
      expect(result.gameId).toBe('g1');
    });

    it('throws ZodError on malformed response', async () => {
      const { mockPost } = await getAxiosMocks();
      mockPost.mockResolvedValueOnce({ data: { gameId: 123 } });
      const client = createClient();
      await expect(client.startGame()).rejects.toThrow(ZodError);
    });

    it('propagates AxiosError', async () => {
      const { mockPost } = await getAxiosMocks();
      const axiosError = Object.assign(new Error('Network error'), { isAxiosError: true });
      mockPost.mockRejectedValueOnce(axiosError);
      const client = createClient();
      await expect(client.startGame()).rejects.toThrow('Network error');
    });
  });

  describe('getMessages()', () => {
    it('calls GET /{gameId}/messages and parses response', async () => {
      const { mockGet } = await getAxiosMocks();
      const payload = [
        {
          adId: 'a1',
          message: 'Fight dragon',
          reward: 100,
          expiresIn: 3,
          encrypted: null,
          probability: 'Sure thing',
        },
      ];
      mockGet.mockResolvedValueOnce({ data: payload });
      const client = createClient();
      const result = await client.getMessages('g1');
      expect(mockGet).toHaveBeenCalledWith('/g1/messages');
      expect(result).toHaveLength(1);
      expect(result[0]!.adId).toBe('a1');
    });

    it('throws ZodError on malformed response', async () => {
      const { mockGet } = await getAxiosMocks();
      mockGet.mockResolvedValueOnce({ data: [{ adId: 1 }] });
      const client = createClient();
      await expect(client.getMessages('g1')).rejects.toThrow(ZodError);
    });

    it('propagates 404 AxiosError', async () => {
      const { mockGet } = await getAxiosMocks();
      const axiosError = Object.assign(new Error('Not found'), {
        isAxiosError: true,
        response: { status: 404 },
      });
      mockGet.mockRejectedValueOnce(axiosError);
      const client = createClient();
      await expect(client.getMessages('g1')).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  describe('solveAd()', () => {
    it('calls POST /{gameId}/solve/{adId} and parses response', async () => {
      const { mockPost } = await getAxiosMocks();
      const payload = {
        success: true,
        lives: 3,
        gold: 100,
        score: 50,
        highScore: 50,
        turn: 1,
        message: 'Win!',
      };
      mockPost.mockResolvedValueOnce({ data: payload });
      const client = createClient();
      const result = await client.solveAd('g1', 'a1');
      expect(mockPost).toHaveBeenCalledWith('/g1/solve/a1');
      expect(result.success).toBe(true);
    });

    it('throws ZodError on malformed response', async () => {
      const { mockPost } = await getAxiosMocks();
      mockPost.mockResolvedValueOnce({ data: { success: 'yes' } });
      const client = createClient();
      await expect(client.solveAd('g1', 'a1')).rejects.toThrow(ZodError);
    });
  });

  describe('getShopItems()', () => {
    it('calls GET /{gameId}/shop and parses response', async () => {
      const { mockGet } = await getAxiosMocks();
      const payload = [{ id: 'hpot', name: 'Health Potion', cost: 50 }];
      mockGet.mockResolvedValueOnce({ data: payload });
      const client = createClient();
      const result = await client.getShopItems('g1');
      expect(mockGet).toHaveBeenCalledWith('/g1/shop');
      expect(result[0]!.id).toBe('hpot');
    });
  });

  describe('buyItem()', () => {
    it('calls POST /{gameId}/shop/buy/{itemId} and parses response', async () => {
      const { mockPost } = await getAxiosMocks();
      const payload = { shoppingSuccess: true, gold: 50, lives: 4, level: 1, turn: 5 };
      mockPost.mockResolvedValueOnce({ data: payload });
      const client = createClient();
      const result = await client.buyItem('g1', 'hpot');
      expect(mockPost).toHaveBeenCalledWith('/g1/shop/buy/hpot');
      expect(result.shoppingSuccess).toBe(true);
    });
  });
});
