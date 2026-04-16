<script setup lang="ts">
  import { ref, onErrorCaptured, computed, useAttrs } from 'vue'
  import Button from '@/shared/components/Button.vue'

  defineOptions({
    inheritAttrs: false,
  })

  interface Props {
    fallbackTitle?: string
    fallbackMessage?: string
    onRetry?: () => void
  }

  const props = withDefaults(defineProps<Props>(), {
    fallbackTitle: 'Something went wrong',
    fallbackMessage: 'An error occurred while loading. Please try again.',
  })
  const attrs = useAttrs()

  const error = ref<Error | null>(null)
  const hasError = computed(() => error.value !== null)

  onErrorCaptured((err: unknown) => {
    error.value = err instanceof Error ? err : new Error(String(err))
    return false
  })

  const handleRetry = (): void => {
    error.value = null
    props.onRetry?.()
  }
</script>

<template>
  <div v-bind="attrs" class="error-boundary-host">
    <div v-if="hasError" class="error-boundary">
      <div class="error-boundary__content">
        <h2 class="error-boundary__title">⚠️ {{ fallbackTitle }}</h2>
        <p class="error-boundary__message">
          {{ fallbackMessage }}
        </p>
        <p v-if="error" class="error-boundary__details">
          {{ error.message }}
        </p>
        <Button variant="primary" @click="handleRetry"> Try Again </Button>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .error-boundary-host {
    display: block;
  }

  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: var(--spacing-xl);

    &__content {
      text-align: center;
      max-width: 500px;
      padding: var(--spacing-2xl);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      background: rgba(26, 24, 37, 0.8);
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      color: var(--color-danger);
      margin: 0 0 var(--spacing-md);
    }

    &__message {
      font-size: 0.95rem;
      color: var(--color-text);
      margin: 0 0 var(--spacing-md);
      line-height: 1.6;
    }

    &__details {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin: 0 0 var(--spacing-lg);
      padding: var(--spacing-md);
      background: rgba(46, 42, 69, 0.5);
      border-radius: var(--radius-sm);
      font-family: monospace;
      word-break: break-word;
      max-height: 120px;
      overflow-y: auto;
    }
  }
</style>
