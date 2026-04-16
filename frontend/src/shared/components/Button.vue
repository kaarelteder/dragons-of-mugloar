<script setup lang="ts">
  import { ref } from 'vue'
  import { ANIMATION_DURATIONS } from '@/shared/constants/animation'

  interface Props {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()

  const shaking = ref(false)

  const handleClick = (event: MouseEvent): void => {
    if (props.disabled || props.loading) return
    emit('click', event)
  }

  const triggerShake = (): void => {
    shaking.value = true
    setTimeout(() => {
      shaking.value = false
    }, ANIMATION_DURATIONS.BUTTON_SHAKE)
  }

  defineExpose({ triggerShake })
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'button',
      `button--${variant}`,
      `button--${size}`,
      { 'button--loading': loading, 'button--shake': shaking },
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .button {
    @include button-base;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.06);
      opacity: 0;
      transition: opacity var(--transition-fast);
    }

    &:hover:not(:disabled)::before {
      opacity: 1;
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }

    &--primary {
      background: linear-gradient(135deg, var(--color-gold), #c9a030);
      color: var(--color-bg);

      &:hover:not(:disabled) {
        box-shadow: 0 4px 16px rgba(245, 200, 66, 0.4);
      }
    }

    &--secondary {
      background: var(--color-card-bg);
      color: var(--color-text);
      border: 1px solid var(--color-border);

      &:hover:not(:disabled) {
        border-color: var(--color-gold);
        color: var(--color-gold);
      }
    }

    &--danger {
      background: var(--color-danger);
      color: #fff;

      &:hover:not(:disabled) {
        background: #c2271f;
        box-shadow: 0 4px 16px rgba(229, 57, 53, 0.4);
      }
    }

    &--ghost {
      background: transparent;
      color: var(--color-text-muted);
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        color: var(--color-text);
        border-color: var(--color-border);
      }
    }

    &--sm {
      padding: var(--spacing-xs) var(--spacing-md);
      font-size: 0.8rem;
    }

    &--md {
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: 0.9rem;
    }

    &--lg {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: 1rem;
    }

    &--loading {
      pointer-events: none;
    }

    &--shake {
      animation: cannotAffordShake 0.4s ease;
    }

    &__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
