<script setup lang="ts">
  interface Props {
    variant?: 'default' | 'elevated' | 'outlined'
    hoverable?: boolean
  }

  withDefaults(defineProps<Props>(), {
    variant: 'default',
    hoverable: true,
  })
</script>

<template>
  <div :class="['card', `card--${variant}`, { 'card--hoverable': hoverable }]">
    <slot />
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .card {
    @include card-base;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease both;

    &--default {
      border: 1px solid var(--color-border);
      background: var(--color-card-bg);
    }

    &--elevated {
      border: 1px solid transparent;
      background: rgba(245, 200, 66, 0.05);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    &--outlined {
      border: 2px solid rgba(245, 200, 66, 0.5);
      background: rgba(245, 200, 66, 0.05);
    }

    &--hoverable {
      transition:
        border-color var(--transition-normal),
        box-shadow var(--transition-normal),
        transform var(--transition-fast);

      &:hover {
        border-color: rgba(245, 200, 66, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
    }
  }
</style>
