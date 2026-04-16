import axios from 'axios';
import { z } from 'zod';
import {
  GameState,
  GameStateSchema,
  Ad,
  AdSchema,
  SolveResult,
  SolveResultSchema,
  ShopItem,
  ShopItemSchema,
  BuyResult,
  BuyResultSchema,
} from '../types.js';
import { isLogLevelEnabled, logger } from '../logger.js';

export class ApiClient {
  private readonly baseUrl: string;
  private readonly http: ReturnType<typeof axios.create>;

  constructor() {
    const baseUrl = process.env['BASE_URL'];
    if (!baseUrl) {
      throw new Error('BASE_URL environment variable is not set');
    }
    this.baseUrl = baseUrl;
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private parse<T>(schema: z.ZodType<T>, data: unknown): T {
    return schema.parse(data);
  }

  async startGame(): Promise<GameState> {
    if (isLogLevelEnabled('debug')) {
      logger.debug('Starting new game');
    }
    const res = await this.http.post<unknown>('/game/start');
    return this.parse(GameStateSchema, res.data);
  }

  async getMessages(gameId: string): Promise<Ad[]> {
    if (isLogLevelEnabled('debug')) {
      logger.debug(`Fetching messages for game ${gameId}`);
    }
    const res = await this.http.get<unknown>(`/${gameId}/messages`);
    return this.parse(z.array(AdSchema), res.data);
  }

  async solveAd(gameId: string, adId: string): Promise<SolveResult> {
    if (isLogLevelEnabled('debug')) {
      logger.debug(`Solving ad ${adId} for game ${gameId}`);
    }
    const res = await this.http.post<unknown>(`/${gameId}/solve/${adId}`);
    return this.parse(SolveResultSchema, res.data);
  }

  async getShopItems(gameId: string): Promise<ShopItem[]> {
    if (isLogLevelEnabled('debug')) {
      logger.debug(`Fetching shop items for game ${gameId}`);
    }
    const res = await this.http.get<unknown>(`/${gameId}/shop`);
    return this.parse(z.array(ShopItemSchema), res.data);
  }

  async buyItem(gameId: string, itemId: string): Promise<BuyResult> {
    if (isLogLevelEnabled('debug')) {
      logger.debug(`Buying item ${itemId} for game ${gameId}`);
    }
    const res = await this.http.post<unknown>(`/${gameId}/shop/buy/${itemId}`);
    return this.parse(BuyResultSchema, res.data);
  }
}
