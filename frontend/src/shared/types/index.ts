import { z } from 'zod'

export const VALID_PROBABILITIES = [
  'Piece of cake',
  'Walk in the park',
  'Quite likely',
  'Hmmm....',
  'Risky',
  'Rather detrimental',
  'Suicide mission',
  'Impossible',
] as const

export type Probability = (typeof VALID_PROBABILITIES)[number] | string

const CANONICAL_PROBABILITY_LOOKUP = new Map(
  VALID_PROBABILITIES.map((label) => [label.toLowerCase(), label] as const)
)

const PROBABILITY_ALIASES: Record<string, (typeof VALID_PROBABILITIES)[number]> = {
  'sure thing': 'Piece of cake',
  gamble: 'Hmmm....',
  'playing with fire': 'Rather detrimental',
}

export const normalizeProbabilityLabel = (probability: string): Probability => {
  const trimmed = probability.trim()
  const normalizedKey = trimmed.toLowerCase()

  return (
    CANONICAL_PROBABILITY_LOOKUP.get(normalizedKey) ?? PROBABILITY_ALIASES[normalizedKey] ?? trimmed
  )
}

export const ProbabilitySchema = z.string().trim().min(1).transform(normalizeProbabilityLabel)

export const GameStateSchema = z.object({
  gameId: z.string(),
  lives: z.number(),
  gold: z.number(),
  level: z.number(),
  score: z.number(),
  highScore: z.number(),
  turn: z.number(),
})

export type GameState = z.infer<typeof GameStateSchema>

export const SolveResultSchema = z.object({
  success: z.boolean(),
  lives: z.number(),
  gold: z.number(),
  score: z.number(),
  highScore: z.number(),
  turn: z.number(),
  message: z.string().optional(),
})

export type SolveResult = z.infer<typeof SolveResultSchema>

export const AdSchema = z.object({
  adId: z.string(),
  message: z.string(),
  reward: z.number(),
  expiresIn: z.number(),
  encrypted: z.number().nullable().optional(),
  probability: ProbabilitySchema,
})

export type Ad = z.infer<typeof AdSchema>

export const AdsResponseSchema = z.array(AdSchema)

export const ShopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
})

export type ShopItem = z.infer<typeof ShopItemSchema>

export const ShopResponseSchema = z.array(ShopItemSchema)

export const BuyResultSchema = z.object({
  shoppingSuccess: z.boolean(),
  gold: z.number(),
  lives: z.number(),
  level: z.number(),
  turn: z.number(),
})

export type BuyResult = z.infer<typeof BuyResultSchema>

export interface GameRecord {
  gameId: string
  score: number
  lives: number
  level: number
  turn: number
  timestamp: number
}

export interface GameOverSnapshot {
  gameId: string
  lives: number
  level: number
  score: number
  turn: number
}

export interface AdWithEV extends Ad {
  decodedId: string
  ev: number
  probabilityRate: number
}

export type GameEventType = 'quest-success' | 'quest-failure' | 'shop-purchase'

export interface GameEvent {
  id: string
  type: GameEventType
  message: string
}

export type RiskTier = 'safe' | 'medium' | 'risky' | 'dangerous'

export interface AdvisorRecommendation extends AdWithEV {
  riskTier: RiskTier
  riskReason: string
  explanation: string
  confidenceScore: number
}

export type PlaystylePreference = 'safe' | 'balanced' | 'aggressive'

export interface AdvisorPreferences {
  playstyle: PlaystylePreference
}
