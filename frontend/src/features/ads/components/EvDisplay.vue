<script setup lang="ts">
  import { computed } from 'vue'
  import { getEVColor } from '@/features/ads/utils/probability'
  import type { Probability } from '@/shared/types'

  interface Props {
    ev: number
    reward: number
    probabilityRate: number
  }

  const props = defineProps<Props>()

  const color = computed(() => getEVColor(props.ev, props.reward))

  const probabilityPercent = computed(() => Math.round(props.probabilityRate * 100))
</script>

<template>
  <div class="ev-display" :title="`EV = ${probabilityPercent}% × ${reward}g`">
    <span class="ev-display__label">EV</span>
    <span class="ev-display__value" :style="{ color }">{{ ev }}g</span>
    <span class="ev-display__formula">{{ probabilityPercent }}% × {{ reward }}g</span>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .ev-display {
    display: flex;
    align-items: baseline;
    gap: 4px;

    &__label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
    }

    &__value {
      font-size: 0.95rem;
      font-weight: 700;
      font-family: var(--font-heading);
      transition: color 0.2s ease;
    }

    &__formula {
      font-size: 0.65rem;
      color: var(--color-text-muted);
    }
  }
</style>
