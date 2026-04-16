<script setup lang="ts">
  interface Props {
    turn: number
    level: number
  }

  defineProps<Props>()
</script>

<template>
  <div class="turn-counter">
    <div class="turn-counter__item">
      <span class="turn-counter__label">Turn</span>
      <span class="turn-counter__value">{{ turn }}</span>
    </div>
    <div class="turn-counter__divider" aria-hidden="true" />
    <div class="turn-counter__item">
      <span class="turn-counter__label">Level</span>
      <span class="turn-counter__value">{{ level }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .turn-counter {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: 0 8px;

    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    &__label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    &__value {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text);
    }

    &__divider {
      width: 1px;
      height: 28px;
      background: rgba(46, 42, 69, 0.3);
    }
  }
</style>
