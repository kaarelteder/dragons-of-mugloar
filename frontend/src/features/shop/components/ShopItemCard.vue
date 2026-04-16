<script setup lang="ts">
  import { ref } from 'vue'
  import type { ShopItem } from '@/shared/types'
  import Button from '@/shared/components/Button.vue'

  interface Props {
    item: ShopItem
    canAfford: boolean
    buying?: boolean
    justBought?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    buying: false,
    justBought: false,
  })

  const emit = defineEmits<{
    buy: [itemId: string]
  }>()

  const buttonRef = ref<InstanceType<typeof Button> | null>(null)

  const handleBuy = (): void => {
    if (!props.canAfford) {
      buttonRef.value?.triggerShake()
      return
    }
    emit('buy', props.item.id)
  }

  const itemIcon = (name: string): string => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('potion') || lowerName.includes('hp')) return '❤️'
    if (lowerName.includes('sword') || lowerName.includes('weapon')) return '⚔️'
    if (lowerName.includes('shield') || lowerName.includes('armor')) return '🛡️'
    if (lowerName.includes('boot') || lowerName.includes('speed')) return '👢'
    if (lowerName.includes('ring') || lowerName.includes('magic')) return '💍'
    if (lowerName.includes('scroll') || lowerName.includes('spell')) return '📜'
    return '🎁'
  }
</script>

<template>
  <div
    :class="[
      'shop-item',
      { 'shop-item--cannot-afford': !canAfford, 'shop-item--bought': justBought },
    ]"
  >
    <div class="shop-item__icon" aria-hidden="true">
      {{ itemIcon(item.name) }}
    </div>
    <div class="shop-item__info">
      <h4 class="shop-item__name">
        {{ item.name }}
      </h4>
      <span class="shop-item__cost">
        <span aria-hidden="true">🪙</span>
        {{ item.cost }}g
      </span>
    </div>
    <Button
      ref="buttonRef"
      size="sm"
      :variant="canAfford ? 'secondary' : 'ghost'"
      :loading="buying"
      :disabled="buying"
      :class="{ 'shop-item__buy-btn--bounce': justBought }"
      @click="handleBuy"
    >
      {{ buying ? '...' : 'Buy' }}
    </Button>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .shop-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: rgba(15, 14, 23, 0.3);
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      opacity var(--transition-fast);

    &:hover {
      border-color: rgba(245, 200, 66, 0.3);
      background: rgba(245, 200, 66, 0.04);
    }

    &--cannot-afford {
      opacity: 0.6;
    }

    &--bought {
      animation: shopBounce 0.5s ease;
      border-color: rgba(76, 175, 80, 0.5);
    }

    &__icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    &__info {
      flex: 1;
      min-width: 0;
    }

    &__name {
      font-size: 0.85rem;
      color: var(--color-text);
      font-weight: 600;
      @include truncate;
    }

    &__cost {
      font-size: 0.8rem;
      color: var(--color-gold);
      display: flex;
      align-items: center;
      gap: 3px;
      margin-top: 2px;
    }
  }
</style>
