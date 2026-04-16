import { z } from 'zod';

const EncryptedAdSchema = z.union([z.literal(1), z.literal(2)]).nullish();

export const GameStateSchema = z.object({
  gameId: z.string(),
  lives: z.number(),
  gold: z.number(),
  level: z.number(),
  score: z.number(),
  highScore: z.number(),
  turn: z.number(),
});
export type GameState = z.infer<typeof GameStateSchema>;

export const AdSchema = z.object({
  adId: z.string(),
  message: z.string(),
  reward: z.number(),
  expiresIn: z.number(),
  encrypted: EncryptedAdSchema,
  probability: z.string(),
});
export type Ad = z.infer<typeof AdSchema>;

export const SolveResultSchema = z.object({
  success: z.boolean(),
  lives: z.number(),
  gold: z.number(),
  score: z.number(),
  highScore: z.number(),
  turn: z.number(),
  message: z.string(),
});
export type SolveResult = z.infer<typeof SolveResultSchema>;

export const ShopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
});
export type ShopItem = z.infer<typeof ShopItemSchema>;

export const BuyResultSchema = z.object({
  shoppingSuccess: z.boolean(),
  gold: z.number(),
  lives: z.number(),
  level: z.number(),
  turn: z.number(),
});
export type BuyResult = z.infer<typeof BuyResultSchema>;

export interface OutcomeRecord {
  attempts: number;
  successes: number;
}

export interface GameLoopResult {
  exitCode: 0 | 1;
  reachedTarget: boolean;
  shutdownReason: string;
}
