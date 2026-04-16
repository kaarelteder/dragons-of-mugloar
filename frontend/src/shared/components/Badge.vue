<script setup lang="ts">
  interface Props {
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'gold'
    size?: 'sm' | 'md'
  }

  withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'md',
  })
</script>

<template>
  <span :class="['badge', `badge--${variant}`, `badge--${size}`]">
    <slot />
  </span>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .badge {
    display: inline-block;
    border-radius: 20px;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: 0.03em;
    border: 1px solid transparent;

    &--sm {
      padding: 2px 8px;
      font-size: 0.72rem;
    }

    &--md {
      padding: 4px 12px;
      font-size: 0.8rem;
    }

    &--default {
      background: rgba(157, 144, 181, 0.15);
      color: #9d90b5;
      border-color: rgba(157, 144, 181, 0.4);
    }

    &--success {
      background: rgba(76, 175, 80, 0.15);
      color: #4caf50;
      border-color: rgba(76, 175, 80, 0.4);
    }

    &--error {
      background: rgba(244, 67, 54, 0.15);
      color: #f44336;
      border-color: rgba(244, 67, 54, 0.4);
    }

    &--warning {
      background: rgba(255, 152, 0, 0.15);
      color: #ff9800;
      border-color: rgba(255, 152, 0, 0.4);
    }

    &--info {
      background: rgba(33, 150, 243, 0.15);
      color: #2196f3;
      border-color: rgba(33, 150, 243, 0.4);
    }

    &--gold {
      background: rgba(245, 200, 66, 0.15);
      color: #f5c842;
      border-color: rgba(245, 200, 66, 0.4);
    }
  }
</style>
