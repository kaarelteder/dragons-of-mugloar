<template>
  <div class="game-expired-state">
    <h2 class="game-expired-state__title">Game Expired</h2>
    <p class="game-expired-state__text">
      Your game session has expired or the game ID is no longer valid.
    </p>
    <router-link to="/" class="game-expired-state__link"> Return to Start Page </router-link>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .game-expired-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    max-width: 440px;
    text-align: center;

    &__title {
      margin: 0;
      color: var(--color-danger);
      font-family: var(--font-heading);
      font-size: 1.3rem;
    }

    &__text {
      margin: 0;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    &__link {
      margin-top: var(--spacing-xs);
      color: var(--color-gold);
      font-weight: 600;
      text-decoration: none;
      border: 1px solid rgba(245, 200, 66, 0.4);
      border-radius: var(--radius-md);
      padding: var(--spacing-xs) var(--spacing-md);
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast);

      &:hover {
        background: rgba(245, 200, 66, 0.12);
      }
    }
  }
</style>
