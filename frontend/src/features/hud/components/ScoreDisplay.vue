<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    score: number
    highScore: number
    target?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    target: 1000,
  })

  const progress = computed(() => Math.min(100, (props.score / props.target) * 100))
  const isRecord = computed(() => props.score >= props.highScore && props.score > 0)
</script>

<template>
  <div class="score-display" :aria-label="`Score: ${score} / ${target}`">
    <div class="score-display__labels">
      <span class="score-display__score">
        <span
          :class="['score-display__value', { 'score-display__value--record': isRecord }]"
          aria-live="polite"
        >
          {{ score }}
        </span>
        <span class="score-display__target">/ {{ target }}</span>
      </span>
      <span class="score-display__label">Score</span>
    </div>
    <div
      class="score-display__bar"
      role="progressbar"
      :aria-valuenow="score"
      :aria-valuemax="target"
    >
      <div class="score-display__fill" :style="{ width: `${progress}%` }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .score-display {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 130px;
    padding: 0 8px;

    @media (max-width: 480px) {
      min-width: 100px;
    }

    &__labels {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 4px;
    }

    &__score {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }

    &__value {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      color: var(--color-text);
      font-weight: 700;

      @media (max-width: 480px) {
        font-size: 1rem;
      }

      &--record {
        color: var(--color-gold);
        text-shadow: 0 0 8px rgba(245, 200, 66, 0.4);
        animation: recordPulse 2s ease-in-out infinite;

        @media (prefers-reduced-motion: reduce) {
          animation: none;
        }
      }
    }

    &__target {
      font-size: 0.8rem;
      color: var(--color-text-muted);

      @media (max-width: 480px) {
        font-size: 0.7rem;
      }
    }

    &__label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;

      @media (max-width: 480px) {
        font-size: 0.65rem;
      }
    }

    &__bar {
      height: 6px;
      background: rgba(46, 42, 69, 0.4);
      border-radius: 3px;
      overflow: hidden;
      border: 1px solid rgba(46, 42, 69, 0.2);
    }

    &__fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-gold), #fad96a);
      border-radius: 2px;
      transition: width 0.5s ease;
    }
  }

  @keyframes recordPulse {
    0%,
    100% {
      text-shadow: 0 0 8px rgba(245, 200, 66, 0.4);
    }

    50% {
      text-shadow:
        0 0 16px rgba(245, 200, 66, 0.8),
        0 0 4px rgba(245, 200, 66, 0.6);
    }
  }
</style>
