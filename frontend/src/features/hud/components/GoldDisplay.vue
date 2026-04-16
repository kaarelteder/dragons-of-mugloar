<script setup lang="ts">
  import { ref, watch } from 'vue'

  interface Props {
    gold: number
  }

  const props = defineProps<Props>()
  const animating = ref(false)
  let animationTimeout: ReturnType<typeof setTimeout> | null = null

  watch(
    () => props.gold,
    (newGold, oldGold) => {
      if (newGold > oldGold) {
        if (animationTimeout) {
          clearTimeout(animationTimeout)
        }

        animating.value = true
        animationTimeout = setTimeout(() => {
          animating.value = false
          animationTimeout = null
        }, 700)
      }
    }
  )
</script>

<template>
  <div class="gold-display" :aria-label="`${gold} gold`" role="status">
    <span class="gold-display__icon" aria-hidden="true">💰</span>
    <span
      :class="['gold-display__value', { 'gold-display__value--popping': animating }]"
      aria-hidden="false"
    >
      {{ gold }}g
    </span>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .gold-display {
    display: flex;
    align-items: center;
    gap: 6px;

    &__icon {
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__value {
      font-weight: 700;
      color: var(--color-gold);
      font-size: 1rem;
      font-family: var(--font-heading);
      transition: color 0.2s ease;
      position: relative;

      &--popping {
        animation: goldPop 0.6s ease;

        @media (prefers-reduced-motion: reduce) {
          animation: none;
        }

        &::before {
          content: '';
          position: absolute;
          inset: -2px;
          border: 1px dotted rgba(245, 200, 66, 0.4);
          border-radius: 4px;
          animation: glowExpand 0.6s ease;

          @media (prefers-reduced-motion: reduce) {
            animation: none;
          }
        }
      }
    }
  }

  @keyframes goldPop {
    0% {
      transform: scale(1);
    }

    30% {
      transform: scale(1.35);
      text-shadow: 0 0 16px rgba(245, 200, 66, 0.8);
    }

    60% {
      transform: scale(1.1);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes glowExpand {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }

    30% {
      transform: scale(1.4);
      opacity: 0.8;
    }

    100% {
      transform: scale(1.8);
      opacity: 0;
    }
  }
</style>
