import { ApiClient } from '../api/client.js';
import { GameState, ShopItem } from '../types.js';
import { isLogLevelEnabled, logger } from '../logger.js';

const LIFE_KEYWORDS = ['potion', 'heal', 'life', 'revival', 'hpot'];
const GOLD_RESERVE = 20;
const CRITICAL_LIVES_THRESHOLD = 2;
type PurchaseState = Pick<GameState, 'gold' | 'lives' | 'level' | 'turn'>;
type ClassifiedShopItem = {
  item: ShopItem;
  isLifeItem: boolean;
};

function isLifeItem(item: ShopItem): boolean {
  const haystack = `${item.name} ${item.id}`.toLowerCase();
  return LIFE_KEYWORDS.some((kw) => haystack.includes(kw));
}

function sortByCost(items: ShopItem[]): ShopItem[] {
  return [...items].sort((left, right) => left.cost - right.cost);
}

function classifyAndSortByCost(items: ShopItem[]): ClassifiedShopItem[] {
  return sortByCost(items).map((item) => ({ item, isLifeItem: isLifeItem(item) }));
}

export class ShopStrategy {
  constructor(private readonly client: ApiClient) {}

  async tryBuy(gameId: string, itemId: string): Promise<PurchaseState | null> {
    try {
      const result = await this.client.buyItem(gameId, itemId);
      if (!result.shoppingSuccess) {
        logger.warn(`Purchase of ${itemId} returned shoppingSuccess=false`, { gameId, itemId });
        return null;
      }
      return { gold: result.gold, lives: result.lives, level: result.level, turn: result.turn };
    } catch (err) {
      logger.warn(`Failed to buy item ${itemId}`, { gameId, itemId, err });
      return null;
    }
  }

  private applyPurchase(state: GameState, purchase: PurchaseState): GameState {
    return { ...state, ...purchase };
  }

  private async buyAndApply(
    gameId: string,
    state: GameState,
    item: ShopItem,
    purchaseKind: 'life' | 'stat'
  ): Promise<GameState> {
    const result = await this.tryBuy(gameId, item.id);

    if (!result) {
      return state;
    }

    if (isLogLevelEnabled('info')) {
      logger.info(`Bought ${purchaseKind} item: ${item.name} (cost ${item.cost})`, {
        gameId,
        itemId: item.id,
        gold: result.gold,
        lives: result.lives,
        turn: result.turn,
      });
    }
    return this.applyPurchase(state, result);
  }

  async shop(gameId: string, state: GameState, force = false): Promise<GameState> {
    if (!force && state.lives > CRITICAL_LIVES_THRESHOLD) {
      return state;
    }

    let current = { ...state };

    let items: ShopItem[];
    try {
      items = await this.client.getShopItems(gameId);
    } catch (err) {
      logger.warn('Failed to fetch shop items', { gameId, turn: current.turn, err });
      return current;
    }

    if (items.length === 0) {
      if (isLogLevelEnabled('debug')) {
        logger.debug('No shop items available', { gameId, turn: current.turn });
      }
      return current;
    }

    const sortedItems = classifyAndSortByCost(items);

    const shouldBuyLifeItem = current.lives <= CRITICAL_LIVES_THRESHOLD;
    const cheapestLifeItem = shouldBuyLifeItem
      ? sortedItems.find(({ isLifeItem }) => isLifeItem)?.item
      : undefined;

    if (cheapestLifeItem) {
      if (current.gold >= cheapestLifeItem.cost) {
        current = await this.buyAndApply(gameId, current, cheapestLifeItem, 'life');
      } else if (isLogLevelEnabled('debug')) {
        logger.debug(
          `Cannot afford life item ${cheapestLifeItem.name} (cost ${cheapestLifeItem.cost}, gold ${current.gold})`,
          {
            gameId,
            itemId: cheapestLifeItem.id,
            lives: current.lives,
            turn: current.turn,
          }
        );
      }
    }

    for (const { item, isLifeItem } of sortedItems) {
      if (isLifeItem) {
        continue;
      }

      if (current.gold - item.cost < GOLD_RESERVE) {
        continue;
      }

      current = await this.buyAndApply(gameId, current, item, 'stat');
    }

    return current;
  }
}
