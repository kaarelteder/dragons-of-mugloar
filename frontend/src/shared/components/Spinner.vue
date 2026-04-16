<script setup lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg'
    label?: string
  }

  withDefaults(defineProps<Props>(), {
    size: 'md',
    label: 'Loading...',
  })
</script>

<template>
  <div :class="['spinner', `spinner--${size}`]" role="status" :aria-label="label">
    <div class="spinner__ring" />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &__ring {
      border-radius: 50%;
      border-style: solid;
      border-color: var(--color-border);
      border-top-color: var(--color-gold);
      animation: spin 0.75s linear infinite;
    }

    &--sm &__ring {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    &--md &__ring {
      width: 36px;
      height: 36px;
      border-width: 3px;
    }

    &--lg &__ring {
      width: 56px;
      height: 56px;
      border-width: 4px;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
