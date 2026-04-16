<script setup lang="ts">
  import { RouterLink } from 'vue-router'
  import { useGameStore } from '@/features/game/store/gameStore'

  const gameStore = useGameStore()
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <RouterLink to="/" class="header__logo">
        <span class="header__dragon" aria-hidden="true">🐉</span>
        <span class="header__title">Dragons of Mugloar</span>
      </RouterLink>
      <nav class="header__nav">
        <RouterLink
          v-if="gameStore.isActive"
          to="/game"
          class="header__nav-link"
          active-class="header__nav-link--active"
        >
          Quest
        </RouterLink>
        <RouterLink to="/history" class="header__nav-link" active-class="header__nav-link--active">
          Hall of Fame
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .header {
    position: sticky;
    top: 0;
    z-index: var(--z-dropdown);
    background: rgba(15, 14, 23, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--color-border);

    &__inner {
      @include flex-between;
      height: 64px;
    }

    &__logo {
      @include flex-center;
      gap: var(--spacing-sm);
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-md);
      transition: opacity var(--transition-fast);
      text-decoration: none;

      &:hover {
        opacity: 0.8;
      }
    }

    &__dragon {
      font-size: 1.6rem;
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-gold);
      white-space: nowrap;

      @include responsive-below(sm) {
        display: none;
      }
    }

    &__nav {
      display: flex;
      gap: var(--spacing-sm);
    }

    &__nav-link {
      background: none;
      border: 1px solid transparent;
      color: var(--color-text-muted);
      font-size: 0.9rem;
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      font-family: var(--font-body);
      text-decoration: none;

      &:hover {
        color: var(--color-text);
        border-color: var(--color-border);
      }

      &--active {
        color: var(--color-gold);
        border-color: rgba(245, 200, 66, 0.4);
      }
    }
  }
</style>
