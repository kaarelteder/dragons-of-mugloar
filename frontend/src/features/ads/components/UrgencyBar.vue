<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    expiresIn: number
    maxExpiry?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    maxExpiry: 10,
  })

  const widthPercent = computed(() => {
    const pct = Math.min(100, (props.expiresIn / props.maxExpiry) * 100)
    return Math.max(0, pct)
  })

  const isUrgent = computed(() => props.expiresIn <= 1)
  const isWarning = computed(() => props.expiresIn <= 3 && props.expiresIn > 1)
</script>

<template>
  <div class="urgency-bar" :aria-label="`Expires in ${expiresIn} turns`">
    <div
      :class="[
        'urgency-bar__fill',
        { 'urgency-bar__fill--urgent': isUrgent, 'urgency-bar__fill--warning': isWarning },
      ]"
      :style="{ width: `${widthPercent}%` }"
    />
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .urgency-bar {
    height: 4px;
    background: rgba(46, 42, 69, 0.5);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    overflow: hidden;

    &__fill {
      height: 100%;
      border-radius: inherit;
      background: var(--color-success);
      transition: width 0.3s ease;

      &--warning {
        background: var(--color-warning);
      }

      &--urgent {
        background: var(--color-danger);
        animation: urgencyPulse 0.8s ease-in-out infinite;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      &__fill {
        transition: none;

        &--urgent {
          animation: none;
        }
      }
    }
  }
</style>
