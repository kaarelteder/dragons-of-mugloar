<script setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { ANIMATION_DURATIONS } from '@/shared/constants/animation'

  interface Props {
    lives: number
    maxLives?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    maxLives: 3,
  })

  const animatingIndex = ref<number | null>(null)
  const prevLives = ref(props.lives)

  watch(
    () => props.lives,
    (newLives, oldLives) => {
      if (newLives < oldLives) {
        animatingIndex.value = newLives
        setTimeout(() => {
          animatingIndex.value = null
        }, ANIMATION_DURATIONS.HEART_BREAK)
      }
      prevLives.value = newLives
    }
  )

  const hearts = computed(() =>
    Array.from({ length: props.maxLives }, (_, i) => ({
      filled: i < props.lives,
      index: i,
    }))
  )
</script>

<template>
  <div class="lives-display" :aria-label="`${lives} of ${maxLives} lives remaining`" role="status">
    <span
      v-for="heart in hearts"
      :key="heart.index"
      :class="[
        'lives-display__heart',
        {
          'lives-display__heart--filled': heart.filled,
          'lives-display__heart--empty': !heart.filled,
          'lives-display__heart--breaking': animatingIndex === heart.index,
        },
      ]"
      aria-hidden="true"
    >
      {{ heart.filled ? '❤️' : '🖤' }}
    </span>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .lives-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;

    &__heart {
      font-size: 1.3rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--transition-fast);
      position: relative;

      &--filled {
        filter: drop-shadow(0 0 4px rgba(229, 57, 53, 0.5));
      }

      &--empty {
        opacity: 0.4;
      }

      &--breaking {
        animation: heartBreak 0.7s ease;

        @media (prefers-reduced-motion: reduce) {
          animation: none;
        }

        &::after {
          content: '';
          position: absolute;
          inset: -3px;
          border: 1px dashed rgba(229, 57, 53, 0.4);
          border-radius: 50%;
          animation: patternPulse 0.7s ease;

          @media (prefers-reduced-motion: reduce) {
            animation: none;
          }
        }
      }
    }
  }

  @keyframes patternPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.3;
    }

    30% {
      transform: scale(1.5);
      opacity: 0;
    }

    60% {
      transform: scale(1.3);
      opacity: 0.1;
    }
  }
</style>
