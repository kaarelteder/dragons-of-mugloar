<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import GameExpiredState from '@/shared/components/GameExpiredState.vue'
  import ShopItemCard from './ShopItemCard.vue'
  import Spinner from '@/shared/components/Spinner.vue'
  import { isGameExpiredError } from '@/shared/api/errorHandling'
  import { useShop } from '@/features/shop/composables/useShop'
  import { useGameStore } from '@/features/game/store/gameStore'
  import type { ShopItem } from '@/shared/types'

  const emit = defineEmits<{
    bought: [item: ShopItem]
    close: []
  }>()

  const gameStore = useGameStore()
  const shopPanelRef = ref<HTMLElement | null>(null)
  const { items, loading, error, buyingItemId, lastBoughtId, canAfford, loadItems, purchaseItem } =
    useShop()
  const showExpiredState = computed(() => Boolean(error.value && isGameExpiredError(error.value)))

  onMounted(() => {
    loadItems()
    window.addEventListener('pointerdown', handlePointerDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', handlePointerDown)
  })

  const handlePointerDown = (event: PointerEvent): void => {
    const shopPanelElement = shopPanelRef.value
    if (!shopPanelElement) {
      return
    }

    const target = event.target
    if (!(target instanceof Node) || shopPanelElement.contains(target)) {
      return
    }

    emit('close')
  }

  const handleBuy = async (itemId: string): Promise<void> => {
    const item = items.value.find((i) => i.id === itemId)
    const result = await purchaseItem(itemId)
    if (result?.success && item) {
      emit('bought', item)
    }
  }
</script>

<template>
  <aside ref="shopPanelRef" class="shop-panel">
    <div class="shop-panel__header">
      <h2 class="shop-panel__title">
        <span aria-hidden="true">🛒</span>
        Shop
      </h2>
      <div class="shop-panel__gold">
        <span aria-hidden="true">🪙</span>
        {{ gameStore.gold }}g
      </div>
      <button class="shop-panel__close" aria-label="Close shop" @click="emit('close')">✕</button>
    </div>

    <div v-if="loading" class="shop-panel__state">
      <Spinner size="md" />
    </div>

    <div v-else-if="error" class="shop-panel__state shop-panel__state--error">
      <GameExpiredState v-if="showExpiredState" />
      <template v-else>
        <p>{{ error }}</p>
        <button class="shop-panel__retry" @click="loadItems">Retry</button>
      </template>
    </div>

    <div v-else class="shop-panel__items">
      <TransitionGroup name="shop-item" tag="div" class="shop-panel__items-list">
        <ShopItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :can-afford="canAfford(item.cost)"
          :buying="buyingItemId === item.id"
          :just-bought="lastBoughtId === item.id"
          @buy="handleBuy"
        />
      </TransitionGroup>
      <p v-if="!items.length" class="shop-panel__empty">The shop is empty.</p>
    </div>
  </aside>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .shop-panel {
    position: fixed;
    right: 0;
    top: var(--header-height);
    bottom: 0;
    width: 320px;
    background: var(--color-card-bg);
    border-left: 1px solid var(--color-border);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
    z-index: var(--z-dropdown);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @include responsive-below(sm) {
      width: 100%;
    }

    &__header {
      @include flex-between;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      gap: var(--spacing-md);
      flex-shrink: 0;
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      color: var(--color-gold);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
    }

    &__gold {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      color: var(--color-gold);
      font-size: 0.95rem;
    }

    &__close {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-text);
      }
    }

    &__items {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      @include scrollbar-dark;

      &__items-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }
    }

    &__state {
      @include flex-center;
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-2xl);
      color: var(--color-text-muted);

      &--error {
        color: var(--color-danger);
      }
    }

    &__retry,
    &__empty {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    &__retry {
      background: none;
      border: 1px solid var(--color-border);
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      transition:
        color var(--transition-fast),
        border-color var(--transition-fast);

      &:hover {
        color: var(--color-text);
        border-color: var(--color-gold);
      }
    }
  }

  .shop-item-enter-active {
    transition:
      opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .shop-item-enter-from {
    opacity: 0;
    transform: translateX(16px);
  }

  .shop-item-move {
    transition: transform 0.25s ease;
  }

  .shop-item-leave-active {
    position: absolute;
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  .shop-item-leave-to {
    opacity: 0;
    transform: translateX(16px);
  }
</style>
