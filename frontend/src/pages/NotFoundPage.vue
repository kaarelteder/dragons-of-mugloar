<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Button from '@/shared/components/Button.vue'

  const router = useRouter()

  const returnHome = (): void => {
    router.push('/')
  }
</script>

<template>
  <main class="not-found">
    <div class="not-found__content animate-fade-in">
      <div class="not-found__icon" aria-hidden="true">🐲</div>
      <h1 class="not-found__code">404</h1>
      <h2 class="not-found__title">Lost in the Realm</h2>
      <p class="not-found__message">
        This path leads nowhere. The dragon did not find what you seek.
      </p>
      <Button @click="returnHome"> Return Home </Button>
    </div>
  </main>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .not-found {
    min-height: calc(100vh - var(--header-height));
    @include flex-center;

    &__content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
    }

    &__icon {
      font-size: 5rem;
      opacity: 0.6;
    }

    &__code {
      font-size: 6rem;
      color: var(--color-gold);
      line-height: 1;
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      color: var(--color-text);
    }

    &__message {
      color: var(--color-text-muted);
      max-width: 360px;
    }
  }
</style>
